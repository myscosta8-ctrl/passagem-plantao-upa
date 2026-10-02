import assert from 'node:assert/strict';
import { supabase } from '../../src/lib/supabaseClient.js';
import { criarPrescricao, normalizarCid } from '../../src/lib/pepMedico.js';
import { metaDoc } from '../../src/lib/documentos.js';
import {
  exigeAtm, atbRestrito, calculoDxIxT, dosesPorDia as dosesPorDiaAtm,
  validadeAtm, textoValidadeAtm, atmPendentes, alertasAtm, atmCobre, atmsVigentes,
} from '../../src/pages/ficha-medica/constantes.js';
import { dosesPorDia } from '../../src/lib/frequencia.js';
import { calcularDosePediatrica } from '../../src/lib/calculoPediatrico.js';
import { ehControlado } from '../../src/lib/catalogoMedicamentos.js';

// Regras clínicas da Prescrição Médica, ATM, Controle Especial, AIH e do fluxo
// "Salvar Rascunho" / "Finalizar e Imprimir". Rodam sem banco (banco simulado em memória).

const prescricao = (data, itens) => ({ criado_em: `${data}T15:00:00Z`, data_referencia: data, situacao: 'finalizado', prescricao_itens: itens });
const metro = { medicamento_nome: 'Metronidazol 5 mg/mL — Bolsa 100 mL', via: 'EV', frequencia: '8/8h', duracao: '7 dias' };
const atmMetro = (registro, dias = 7, situacao = 'finalizado') => ({ id: 'atm1', medicamento: 'METRONIDAZOL Sol Inj Bolsa 500 mg/100 mL', tempo_uso_dias: dias, data_registro: `${registro}T15:00:00Z`, situacao });

// Banco simulado: registra cada operação (tabela, tipo, dados) na ordem em que acontece.
function bancoSimulado({ falharEm } = {}) {
  const ops = [];
  const original = supabase.from;
  supabase.from = (tabela) => {
    const op = { tabela, tipo: null, dados: null };
    const q = {
      insert(d) { op.tipo = 'insert'; op.dados = d; return q; },
      update(d) { op.tipo = 'update'; op.dados = d; return q; },
      delete() { op.tipo = 'delete'; return q; },
      eq() { return q; }, select() { return q; }, single() { return q; },
      then(ok, nok) {
        ops.push(op);
        const erro = falharEm && falharEm(op) ? { message: 'bloqueado (simulado)', code: '42501' } : null;
        const data = erro ? null : Array.isArray(op.dados) ? op.dados.map((x, i) => ({ id: `item${i}`, ...x })) : { id: 'presc1', ...(op.dados || {}) };
        return Promise.resolve({ data, error: erro }).then(ok, nok);
      },
    };
    return q;
  };
  return { ops, restaurar: () => { supabase.from = original; } };
}
// Testes com banco simulado rodam um de cada vez (trocam supabase.from).
let fila = Promise.resolve();
const emFila = (fn) => { const p = fila.then(fn); fila = p.catch(() => {}); return p; };

const base = { atendimentoId: 'a1', pessoaId: 'p1', medicoId: 'm1', itens: [{ medicamento_nome: 'Dipirona' }] };

export function runRegrasPrescricaoTests(test) {
  test('Frequência → doses por dia (6/6h=4, 8/8h=3, 12/12h=2, dose única=1, SN/ACM=sem número)', () => {
    assert.equal(dosesPorDia('6/6h'), 4);
    assert.equal(dosesPorDia('8/8h'), 3);
    assert.equal(dosesPorDia('12/12h'), 2);
    assert.equal(dosesPorDia('3x/dia'), 3);
    assert.equal(dosesPorDia('Dose única'), 1);
    assert.equal(dosesPorDia('SN'), null);
    assert.equal(dosesPorDia('ACM'), null);
    assert.equal(dosesPorDiaAtm('6/6 horas'), 4);
  });

  test('DxIxT da ATM: 8/8h por 7 dias = 21 doses', () => {
    assert.equal(calculoDxIxT('8/8h', 7), '3 doses/dia × 7 dias = 21 doses');
    assert.equal(calculoDxIxT('', 7), '');
  });

  test('Calculadora pediátrica: mg/kg/dose, mg/kg/dia ÷ horário, arredondamento e volume', () => {
    const porDose = calcularDosePediatrica({ pesoKg: '10', doseAlvoMgKg: '15', tipoDose: 'dose' });
    assert.equal(porDose.doseTotalMg, 150);
    const porDia = calcularDosePediatrica({ pesoKg: '10', doseAlvoMgKg: '100', tipoDose: 'dia', frequencia: '6/6h' });
    assert.equal(porDia.doseDiariaMg, 1000);
    assert.equal(porDia.doseTotalMg, 250);
    const arred = calcularDosePediatrica({ pesoKg: '12,3', doseAlvoMgKg: '15', tipoDose: 'dose', arredondar: '5' });
    assert.equal(arred.doseCalculadaMg.toFixed(1), '184.5');
    assert.equal(arred.doseTotalMg, 185);
    const vol = calcularDosePediatrica({ pesoKg: '10', doseAlvoMgKg: '10', tipoDose: 'dose', apresentacaoMg: '500', diluenteMl: '10' });
    assert.equal(vol.concentracaoMgMl, 50);
    assert.equal(vol.volumeAspirarMl, 2);
    assert.equal(calcularDosePediatrica({ pesoKg: '', doseAlvoMgKg: '10', tipoDose: 'dose' }, '20').doseTotalMg, 200);
  });

  test('ATM exigida só para antimicrobiano restrito por via intravenosa', () => {
    assert.ok(exigeAtm('Metronidazol 500 mg', 'EV'));
    assert.ok(exigeAtm('Meropenem 1 g', 'Endovenosa'));
    assert.equal(exigeAtm('Metronidazol 250 mg', 'VO'), null);
    assert.equal(exigeAtm('Ceftriaxona 1 g', 'EV'), null);
    assert.ok(atbRestrito('Piperacilina + Tazobactam 4,5 g'));
  });

  test('Validade da ATM: 7 dias a partir do registro (01/10 → válida até 07/10)', () => {
    const v = validadeAtm(atmMetro('2026-10-01'), '2026-10-03');
    assert.equal(v.venceEm, '2026-10-07');
    assert.equal(v.diaAtual, 3);
    assert.equal(textoValidadeAtm(v), 'válida até 07/10 (dia 3 de 7)');
    assert.equal(textoValidadeAtm(validadeAtm(atmMetro('2026-10-01'), '2026-10-07')), 'vence hoje (07/10) — dia 7 de 7');
    assert.equal(textoValidadeAtm(validadeAtm(atmMetro('2026-10-01'), '2026-10-08')), 'vencida em 07/10');
    assert.equal(validadeAtm({ ...atmMetro('2026-10-01'), tempo_uso_dias: null }), null);
  });

  test('ATM válida não é pedida de novo; vencida com antibiótico mantido volta como renovação', () => {
    assert.equal(atmPendentes([prescricao('2026-10-01', [metro])], [], '2026-10-01').length, 1);
    assert.equal(atmPendentes([prescricao('2026-10-05', [metro])], [atmMetro('2026-10-01')], '2026-10-05').length, 0);
    const renov = atmPendentes([prescricao('2026-10-08', [metro])], [atmMetro('2026-10-01')], '2026-10-08');
    assert.equal(renov.length, 1);
    assert.equal(renov[0].renovacao, true);
    assert.equal(renov[0].venceu_em, '2026-10-07');
    // ATM invalidada não conta; rascunho em preenchimento conta.
    assert.equal(atmPendentes([prescricao('2026-10-02', [metro])], [{ ...atmMetro('2026-10-01'), situacao: 'invalido' }], '2026-10-02').length, 1);
    assert.equal(atmPendentes([prescricao('2026-10-02', [metro])], [atmMetro('2026-10-01', 7, 'rascunho')], '2026-10-02').length, 0);
    // Prescrição invalidada não gera pendência.
    assert.equal(atmPendentes([{ ...prescricao('2026-10-02', [metro]), situacao: 'invalido' }], [], '2026-10-02').length, 0);
  });

  test('Alerta de validade só quando o antimicrobiano continua na prescrição mais recente', () => {
    assert.equal(alertasAtm([prescricao('2026-10-07', [metro])], [atmMetro('2026-10-01')], '2026-10-07').length, 1);
    assert.equal(alertasAtm([prescricao('2026-10-03', [metro])], [atmMetro('2026-10-01')], '2026-10-03').length, 0);
    const suspenso = [prescricao('2026-10-06', [metro]), { ...prescricao('2026-10-07', [{ medicamento_nome: 'Dipirona', via: 'EV' }]), criado_em: '2026-10-07T16:00:00Z' }];
    assert.equal(alertasAtm(suspenso, [atmMetro('2026-10-01')], '2026-10-08').length, 0);
    const vig = atmsVigentes([atmMetro('2026-10-01')], '2026-10-05').get(atbRestrito('metronidazol').rotulo);
    assert.equal(atmCobre(vig, '2026-10-07'), true);
    assert.equal(atmCobre(vig, '2026-10-08'), false);
  });

  test('Controle Especial: reconhece pelo rótulo do catálogo, pela marca e por associação', () => {
    const catalogo = [
      { nome: 'Diazepam', substancia_ativa: 'Diazepam', concentracao: '5 mg/mL', apresentacao: 'Ampola 2 mL', nome_comercial: 'Valium', controlado: true },
      { nome: 'Paracetamol + Codeína', substancia_ativa: 'Paracetamol + Codeína', concentracao: '500 mg + 30 mg', controlado: true },
      { nome: 'Dipirona', substancia_ativa: 'Dipirona', concentracao: '500 mg/mL', controlado: false },
    ];
    assert.equal(ehControlado('Diazepam 5 mg/mL — Ampola 2 mL (Valium)', catalogo), true);
    assert.equal(ehControlado('valium 10mg', catalogo), true);
    assert.equal(ehControlado('Paracetamol 500 mg + codeína 30 mg', catalogo), true);
    assert.equal(ehControlado('Paracetamol 750 mg', catalogo), false);
    assert.equal(ehControlado('Dipirona 500 mg/mL', catalogo), false);
  });

  test('AIH: CID normalizado para o formato do catálogo (a419 → A41.9)', () => {
    assert.equal(normalizarCid('a419'), 'A41.9');
    assert.equal(normalizarCid('J18.9'), 'J18.9');
    assert.equal(normalizarCid('I10'), 'I10');
    assert.equal(normalizarCid('sem cid'), '');
  });

  test('Salvar Rascunho grava como rascunho; Finalizar e Imprimir finaliza', () => {
    assert.deepEqual(metaDoc(false), { situacao: 'rascunho' });
    assert.equal(metaDoc(true).situacao, 'finalizado');
    assert.equal(metaDoc(true, null, { x: 1 }).rascunho_estado, undefined);
    assert.deepEqual(metaDoc(false, null, { x: 1 }).rascunho_estado, { x: 1 });
  });

  test('Finalizar rascunho reaberto: itens regravados ANTES de finalizar (defeito de 02/10)', () => emFila(async () => {
    const db = bancoSimulado();
    try {
      const { data, error } = await criarPrescricao({ ...base, id: 'presc1', situacao: metaDoc(true) });
      assert.equal(error, undefined);
      const seq = db.ops.map((o) => `${o.tabela}:${o.tipo}${o.dados?.situacao ? ':' + o.dados.situacao : ''}`);
      assert.deepEqual(seq, [
        'prescricoes_medicas:update:rascunho',
        'prescricao_itens:delete',
        'prescricao_itens:insert',
        'prescricoes_medicas:update:finalizado',
      ]);
      assert.equal(data.prescricao_itens.length, 1);
    } finally { db.restaurar(); }
  }));

  test('Falha ao regravar itens: não finaliza e devolve o rascunho para tentar de novo', () => emFila(async () => {
    const db = bancoSimulado({ falharEm: (o) => o.tabela === 'prescricao_itens' && o.tipo === 'delete' });
    try {
      const { data, error } = await criarPrescricao({ ...base, id: 'presc1', situacao: metaDoc(true) });
      assert.ok(error);
      assert.equal(data.id, 'presc1');
      assert.equal(db.ops.some((o) => o.dados?.situacao === 'finalizado'), false);
    } finally { db.restaurar(); }
  }));

  test('Salvar Rascunho de prescrição nova: cria rascunho e itens, sem finalizar', () => emFila(async () => {
    const db = bancoSimulado();
    try {
      const { error } = await criarPrescricao({ ...base, situacao: metaDoc(false) });
      assert.equal(error, undefined);
      assert.deepEqual(db.ops.map((o) => `${o.tabela}:${o.tipo}`), ['prescricoes_medicas:insert', 'prescricao_itens:insert']);
      assert.equal(db.ops[0].dados.situacao, 'rascunho');
    } finally { db.restaurar(); }
  }));
}

// Catálogo da SAE (Evolução do Enfermeiro): textos antigos preservados e sem repetição.
import { NANDA_OPCOES as SAE_NANDA, NIC_OPCOES as SAE_NIC, filtrarSae } from '../../src/pages/ficha-clinica/saeCatalogo.js';
export function runCatalogoSaeTests(test) {
  test('SAE: diagnósticos e cuidados já usados continuam com o mesmo texto', () => {
    for (const d of ['Mobilidade Física Prejudicada', 'Risco de Queda', 'Risco de Integridade da Pele Prejudicada', 'Comunicação Verbal Prejudicada',
      'Risco de Aspiração', 'Risco de Infecção', 'Padrão Respiratório Ineficaz', 'Débito Cardíaco Diminuído']) assert.ok(SAE_NANDA.includes(d), d);
    const nic = SAE_NIC.map((n) => `${n.texto} (${n.frequencia})`);
    for (const c of ['Mudança de decúbito e posicionamento no leito com coxins (2/2 horas)', 'Manter cabeceira elevada a 30° - 45° (Contínuo)',
      'Manter grades laterais do leito sempre elevadas (Contínuo)', 'Aferir sinais vitais completos e registrar parâmetros (4/4 horas)',
      'Avaliar e inspecionar inserção do AVP quanto a sinais de flebite (Por turno)', 'Balanço hídrico rigoroso (entradas e saídas) (24 horas)']) assert.ok(nic.includes(c), c);
  });
  test('SAE: sem itens repetidos e lista ampliada (≥ 50 diagnósticos, ≥ 80 cuidados)', () => {
    assert.equal(new Set(SAE_NANDA).size, SAE_NANDA.length);
    assert.equal(new Set(SAE_NIC.map((n) => n.texto)).size, SAE_NIC.length);
    assert.ok(SAE_NANDA.length >= 50, `diagnósticos: ${SAE_NANDA.length}`);
    assert.ok(SAE_NIC.length >= 80, `cuidados: ${SAE_NIC.length}`);
  });
  test('SAE: busca sem acento e com várias palavras', () => {
    assert.equal(filtrarSae('Risco de Integridade da Pele Prejudicada', 'risco pele'), true);
    assert.equal(filtrarSae('Débito Cardíaco Diminuído', 'debito'), true);
    assert.equal(filtrarSae('Débito Cardíaco Diminuído', 'pele'), false);
  });
}

// Modelos de evolução: aplicar substituindo ou acrescentando, só nos campos da tela.
import { aplicarModelo } from '../../src/lib/modelosEvolucao.js';
export function runModelosEvolucaoTests(test) {
  test('Modelo de evolução: preenche vazio, substitui, acrescenta ao final e ignora campo que a tela não tem', () => {
    const modelo = { evolucao_dia: 'Estável.', conduta_medica: 'Manter.', campo_inexistente: 'x' };
    assert.deepEqual(aplicarModelo({ evolucao_dia: '', conduta_medica: '' }, modelo, 'substituir'), { evolucao_dia: 'Estável.', conduta_medica: 'Manter.' });
    assert.deepEqual(aplicarModelo({ evolucao_dia: 'Refere dor.', conduta_medica: '' }, modelo, 'acrescentar'), { evolucao_dia: 'Refere dor.\n\nEstável.', conduta_medica: 'Manter.' });
    assert.deepEqual(aplicarModelo({ evolucao_dia: 'Refere dor.' }, modelo, 'substituir'), { evolucao_dia: 'Estável.' });
  });
}

// Impressos: prescrição e receituário sempre em paisagem; tamanhos de letra num lugar só.
import fs from 'node:fs';
export function runImpressaoTests(test) {
  const ler = (p) => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
  test('Prescrição em paisagem: página nomeada e impressão avulsa (PaginaImpressao) em A4 landscape', () => {
    assert.match(ler('src/pages/print/print-prescricao.css'), /@page prescricao\s*\{[^}]*size:\s*A4 landscape/);
    assert.match(ler('src/pages/print/print-prescricao.css'), /\.pr-page\s*\{\s*page:\s*prescricao/);
    assert.match(ler('src/pages/FichaMedicaPrint.jsx'), /paisagem=\{tipo === 'prescricao' \|\| tipo === 'receituario'\}/);
    assert.match(ler('src/pages/print/pacote.css'), /\.pacote-prescricao\s*\{\s*page:\s*prescricao/);
  });
  test('Tamanhos de letra dos impressos definidos por variáveis (--lt-*) em leitura.css', () => {
    const css = ler('src/pages/print/leitura.css');
    assert.match(css, /\.doc-leitura\s*\{[^}]*--lt-texto:\s*10pt/);
    assert.ok(!/font-size:\s*\d+(\.\d+)?pt\s*!important;\s*line-height/.test(css.split('Prescrição (paisagem')[0].replace(/\.print-area[^}]*\}/g, '')), 'as regras gerais devem usar var(--lt-*)');
  });
  test('Rodapé de assinatura padrão compartilhado pelos documentos clínicos', () => {
    for (const f of ['ficha-medica-print/CorpoEvolucaoMedicaOficial.jsx', 'ficha-medica-print/CorpoConsultaOficial.jsx', 'ficha-clinica-print/CorpoEvolucaoSaeOficial.jsx']) {
      assert.match(ler(`src/pages/${f}`), /<RodapeAssinatura/, f);
    }
  });
}

// Padrão visual único (onda 3, item 15): telas usam a escala --fs, 4 larguras de tela e a cor principal por variável.
import path from 'node:path';
export function runPadraoVisualTests(test) {
  const raiz = new URL('../../src/', import.meta.url).pathname;
  const arquivos = [];
  (function andar(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) andar(p); else arquivos.push(p); } })(raiz);
  const impresso = (p) => /\/print\/|Print|Impresso|-print\//.test(p) || path.basename(p).startsWith('Corpo');
  const telasCss = arquivos.filter((p) => p.endsWith('.css') && !impresso(p));
  const telasJsx = arquivos.filter((p) => p.endsWith('.jsx') && !impresso(p));
  test('Telas: tamanho de letra só pela escala (--fs-*), sem número solto', () => {
    const soltos = telasCss.flatMap((p) => (fs.readFileSync(p, 'utf8').match(/font-size:\s*[0-9.]+(px|rem|em)/g) || []).map((m) => `${path.basename(p)}: ${m}`));
    const soltosJsx = telasJsx.flatMap((p) => (fs.readFileSync(p, 'utf8').match(/fontSize:\s*[0-9.]+/g) || []).map((m) => `${path.basename(p)}: ${m}`));
    assert.deepEqual([...soltos, ...soltosJsx], []);
  });
  test('Telas: só 4 larguras de tela nas media queries (640, 768, 1024, 1280)', () => {
    const fora = telasCss.flatMap((p) => [...fs.readFileSync(p, 'utf8').matchAll(/@media[^{]*?(?:max|min)-width:\s*(\d+)px/g)].map((m) => m[1]).filter((v) => !['640', '768', '1024', '1280'].includes(v)).map((v) => `${path.basename(p)}: ${v}`));
    assert.deepEqual(fora, []);
  });
  test('Cor principal só por variável (--c-primary), sem o código da cor espalhado', () => {
    const fora = [...telasCss, ...telasJsx].filter((p) => !/index\.css$|TopNav\.css$/.test(p) && /#1B4555/i.test(fs.readFileSync(p, 'utf8'))).map((p) => path.basename(p));
    assert.deepEqual(fora, []);
  });
}

// Cache de dados entre abas (item 18): trocar de aba usa o que já foi buscado; toda gravação
// avisa o cache; falha não fica guardada; sair do sistema apaga tudo.
import { queryClient, dadosMudaram, buscarComCache, limparCache } from '../../src/lib/cache.js';
import { registrarAlergia } from '../../src/lib/pepClinico.js';
import { gravar } from '../../src/lib/documentos.js';
const contador = () => { const c = { n: 0, fn: async () => { c.n++; return [{ id: c.n }]; } }; return c; };
const estaInvalida = (chave) => queryClient.getQueryState(chave)?.isInvalidated === true;
export function runCacheTests(test) {
  test('Trocar de aba dentro de 20 s usa o cache (não busca de novo no banco)', () => emFila(async () => {
    limparCache();
    const c = contador();
    await buscarComCache(['sinais_vitais', 'a1'], c.fn);
    await buscarComCache(['sinais_vitais', 'a1'], c.fn);
    assert.equal(c.n, 1);
  }));

  test('Gravação avisa o cache: a próxima abertura busca de novo', () => emFila(async () => {
    limparCache();
    const c = contador();
    await buscarComCache(['prescricoes_medicas', 'a1'], c.fn);
    dadosMudaram('prescricoes_medicas');
    await buscarComCache(['prescricoes_medicas', 'a1'], c.fn);
    assert.equal(c.n, 2);
  }));

  test('Alergia alterada também atualiza o cabeçalho do paciente', () => emFila(async () => {
    limparCache();
    await buscarComCache(['cabecalho', 'a1'], async () => ({ idade: 40 }));
    dadosMudaram('alergias');
    assert.equal(estaInvalida(['cabecalho', 'a1']), true);
  }));

  test('Falha ao carregar não fica guardada (próxima abertura tenta de novo)', () => emFila(async () => {
    limparCache();
    let n = 0;
    const falha = async () => { n++; return Object.assign([], { falhou: true }); };
    const r = await buscarComCache(['alergias', 'p1'], falha);
    assert.equal(r.falhou, true);
    await buscarComCache(['alergias', 'p1'], falha);
    assert.equal(n, 2);
  }));

  test('Sair do sistema apaga o cache (nenhum dado de paciente fica na memória)', () => emFila(async () => {
    await buscarComCache(['alergias', 'p9'], async () => [{ substancia: 'DIPIRONA' }]);
    limparCache();
    assert.equal(queryClient.getQueryCache().getAll().length, 0);
    const auth = fs.readFileSync('src/lib/AuthContext.jsx', 'utf8');
    assert.match(auth, /limparPermissoes\(\)\s*\n\s*limparCache\(\)/, 'logout chama limparCache');
    assert.match(auth, /SIGNED_OUT'\)\s*\{\s*\n\s*limparCache\(\)/, 'sessão encerrada chama limparCache');
  }));

  test('Salvar Rascunho / Finalizar (gravar) e registrar alergia avisam o cache', () => emFila(async () => {
    const db = bancoSimulado();
    try {
      limparCache();
      await buscarComCache(['evolucoes', 'a1'], async () => []);
      await buscarComCache(['alergias', 'p1'], async () => []);
      await buscarComCache(['cabecalho', 'a1'], async () => ({}));
      await gravar('evolucoes', null, { atendimento_id: 'a1' }, 'rascunho');
      assert.equal(estaInvalida(['evolucoes', 'a1']), true);
      await registrarAlergia({ pessoaId: 'p1', substancia: 'AAS' });
      assert.equal(estaInvalida(['alergias', 'p1']), true);
      assert.equal(estaInvalida(['cabecalho', 'a1']), true);
    } finally { db.restaurar(); }
  }));

  test('Prescrição: cache atualizado ao terminar de gravar os itens, mesmo com erro', () => emFila(async () => {
    const db = bancoSimulado({ falharEm: (o) => o.tabela === 'prescricao_itens' });
    try {
      limparCache();
      await buscarComCache(['prescricoes_medicas', 'a1'], async () => []);
      const { error } = await criarPrescricao({ ...base, situacao: metaDoc(false) });
      assert.ok(error);
      assert.equal(estaInvalida(['prescricoes_medicas', 'a1']), true);
    } finally { db.restaurar(); }
  }));

  test('Telas da ficha usam o cache; impressos continuam buscando direto no banco', () => {
    const ler = (p) => fs.readFileSync(p, 'utf8');
    for (const p of ['src/layout/FaixaPacienteJanela.jsx', 'src/pages/ficha-clinica/BannerPacienteEnf.jsx', 'src/pages/ficha-clinica/AbaSbar.jsx',
      'src/pages/ficha-clinica/AbaAlergias.jsx', 'src/pages/AbaHistoricoEnfermagem.jsx', 'src/pages/multi/AbaRegistroMulti.jsx', 'src/layout/ColunaConsulta.jsx']) {
      const s = ler(p);
      assert.doesNotMatch(s, /\b(listarAlergias|buscarCabecalhoImpressao|listarPrescricoes)\(/, `${p} busca direto em vez de usar o cache`);
      assert.match(s, /consultasPaciente/, `${p} não usa o cache`);
    }
    assert.match(ler('src/pages/FichaClinicaPrint.jsx'), /buscarCabecalhoImpressao\(/);
    assert.match(ler('src/main.jsx'), /import \{ queryClient \} from '\.\/lib\/cache\.js'/);
  });

  test('Calculadora pediátrica da prescrição: numBR importado (abrir a calculadora não trava a tela)', () => {
    const s = fs.readFileSync('src/pages/ficha-medica/AbaPrescricao.jsx', 'utf8');
    assert.match(s, /import \{[^}]*\bnumBR\b[^}]*\} from '\.\.\/\.\.\/lib\/calculoPediatrico'/);
  });
}
