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
    const s = fs.readFileSync('src/pages/ficha-medica/prescricao/CalculadoraDosePediatrica.jsx', 'utf8');
    assert.match(s, /import \{[^}]*\bnumBR\b[^}]*\} from '\.\.\/\.\.\/\.\.\/lib\/calculoPediatrico'/);
  });
}

// Item 17 — Prescrição dividida em partes (./prescricao/) e "salvar documento" comum.
import { itemParaBanco, itemDoBanco, camposPrescricaoParaBanco, aplicarCalculoAoItem, ITEM_VAZIO, textoDiluicao } from '../../src/pages/ficha-medica/prescricao/itemPrescricao.js';
export function runDivisaoPrescricaoTests(test) {
  test('Item da prescrição: formulário → banco → "Duplicar" volta igual', () => {
    const form = { ...ITEM_VAZIO, medicamento_nome: ' Dipirona 500 mg/mL ', dose: '1,5', dose_unidade: 'g', via: 'EV', frequencia: '6/6h', condicao: 'Se dor', diluente: 'SF 0,9%', diluente_ml: '100', tempo_infusao: 'Em 30 min', apresentacao: 'AMP', qtd_por_dose: '2' };
    const banco = itemParaBanco(form);
    assert.equal(banco.medicamento_nome, 'Dipirona 500 mg/mL');
    assert.equal(banco.dose, 1.5);
    assert.equal(banco.diluicao, 'Diluir em 100 mL de SF 0,9% — Em 30 min');
    assert.equal(banco.sn_aplic, true);
    assert.equal(banco.observacoes, 'Se dor');
    assert.equal(banco.qtd_por_dose, 2);
    const volta = itemDoBanco(banco);
    assert.equal(volta.dose, '1,5');
    assert.equal(volta.condicao, 'Se dor');
    assert.equal(volta.instrucoes, 'Diluir em 100 mL de SF 0,9% — Em 30 min');
    assert.equal(textoDiluicao({ diluente: '', tempo_infusao: '' }), '');
  });

  test('Calculadora pediátrica aplicada ao item: dose, frequência e texto de reconstituição', () => {
    const r = aplicarCalculoAoItem({ ...ITEM_VAZIO, medicamento_nome: 'Ceftriaxona 1 g', via: 'EV' },
      { pesoKg: '12,5', doseAlvoMgKg: '50', tipoDose: 'dose', apresentacaoMg: '1000', diluenteMl: '10', soroMl: '', frequencia: '12/12h', arredondar: '' }, '');
    assert.equal(r.item.dose, '625');
    assert.equal(r.item.frequencia, '12/12h');
    assert.equal(r.item.instrucoes, 'Reconstituir em 10 mL de AD e aspirar 6,3 mL (50 mg/kg × 12,5 kg)');
    assert.equal(r.pesoUsado, '12,5');
    assert.equal(aplicarCalculoAoItem(ITEM_VAZIO, { pesoKg: '', doseAlvoMgKg: '' }, ''), null, 'cálculo incompleto não altera o item');
  });

  test('Dieta, cuidados e hemocomponentes vão para o banco só com o que foi preenchido', () => {
    const c = camposPrescricaoParaBanco({ dieta: '', orientacaoEnfermagem: [{ texto: 'SSVV', frequencia: '6/6h' }, { texto: '  ', frequencia: '' }], hemocomponentes: { hemacias: { marcado: true, quantidade: '2 unid.' }, plasma: { marcado: false } }, hemocomponenteObs: '' });
    assert.equal(c.dieta, null);
    assert.equal(c.orientacao_enfermagem.length, 1);
    assert.deepEqual(c.hemocomponentes, [{ tipo: 'Concentrado de Hemácias', quantidade: '2 unid.' }]);
  });

  test('Aba Prescrição é só o orquestrador e usa o "salvar documento" comum', () => {
    const s = fs.readFileSync('src/pages/ficha-medica/AbaPrescricao.jsx', 'utf8');
    assert.ok(s.split('\n').length < 400, 'AbaPrescricao.jsx deve ter menos de 400 linhas');
    assert.match(s, /useSalvarDocumento\(/);
    for (const parte of ['CalculadoraDosePediatrica', 'EditorItem', 'ListaItens', 'HistoricoPrescricoes', 'GrupoOrientacoes', 'GrupoHemocomponentes', 'AlertasAtm']) {
      assert.ok(fs.existsSync(`src/pages/ficha-medica/prescricao/${parte}.jsx`), `${parte}.jsx existe`);
    }
    const h = fs.readFileSync('src/hooks/useSalvarDocumento.js', 'utf8');
    assert.match(h, /emAndamento\.current\) return null/, 'clique duplo não grava duas vezes');
  });
}

// Item 17 — Solicitação de Exames dividida e com o "salvar documento" comum.
import { itensSelecionados, requisicaoParaBanco, protocoloRapido, EXAMES_LAB_CATALOGO } from '../../src/pages/ficha-medica/exames/catalogoExames.js';
export function runDivisaoExamesTests(test) {
  test('Exames: itens marcados vão ao banco na ordem do catálogo, com amostra (lab) ou projeção (imagem/ECG)', () => {
    const hemo = EXAMES_LAB_CATALOGO[0].itens[0].nome;
    const ureia = EXAMES_LAB_CATALOGO[1].itens[0].nome;
    const itens = itensSelecionados('lab', { [ureia]: true, [hemo]: true, outro: false });
    assert.deepEqual(itens.map((i) => i.nome), [hemo, ureia]);
    assert.ok(itens[0].amostra && !('projecao' in itens[0]));
    const img = itensSelecionados('img', protocoloRapido('abdome').selecionados);
    assert.equal(img.length, 2);
    assert.ok(img.every((i) => i.projecao));
  });

  test('Exames: nome, caráter e setor executante de cada modalidade iguais aos de antes', () => {
    const it = [{ nome: 'x' }];
    assert.deepEqual(requisicaoParaBanco('lab', { itens: it, prioridade: 'rotina', justificativa: 'j' }),
      { nome: 'Requisição Laboratorial (1 exames)', preparo: 'Rotina', urgencia: 'Rotina', local: 'Laboratório Interno UPA 24h', modalidade: 'lab', exames: it, justificativa: 'j' });
    assert.equal(requisicaoParaBanco('img', { itens: it, prioridade: 'eletivo' }).urgencia, 'Eletivo');
    assert.equal(requisicaoParaBanco('ecg', { itens: it, prioridade: 'rotina' }).urgencia, 'Urgência / Emergência');
    assert.equal(Object.keys(protocoloRapido('sepse').selecionados).length, 14);
    assert.equal(protocoloRapido('apac_usg').apac.procedimento_codigo, '02.05.02.004-6');
  });

  test('Exames: Salvar Rascunho reabre e atualiza o mesmo rascunho de cada modalidade', () => {
    const s = fs.readFileSync('src/pages/ficha-medica/AbaExames.jsx', 'utf8');
    assert.ok(s.split('\n').length < 300, 'AbaExames.jsx deve ter menos de 300 linhas');
    assert.match(s, /useSalvarDocumento\(/);
    assert.match(s, /useRascunho\(\{[\s\S]*filtro: \{ modalidade \}/);
    assert.match(s, /function setModalidade\(m\)[\s\S]*setEditandoId\(null\)/, 'trocar de modalidade solta o rascunho da anterior');
  });
}

// Item 17 — Laudo de AIH dividido; dados da admissão nunca apagam o que o médico escreveu.
import { alternarJustificativa, dadosDaAdmissao, separarCids, identificacaoPaciente } from '../../src/pages/ficha-medica/aih/aihRegras.js';
export function runDivisaoAihTests(test) {
  const consulta = { queixa_principal: 'tosse e febre', hipotese_diagnostica: 'J18.9 Pneumonia', sv: { pa: '120x80', fc: 98, temp: 38.5, spo2: 93 } };
  test('AIH: ao abrir, a admissão só preenche campo vazio (rascunho e texto do médico são mantidos — defeito de 02/10)', () => {
    const vazio = dadosDaAdmissao(consulta, { sinais_sintomas_clinicos: '', diagnostico_inicial_texto: '', cid_principal: '' });
    assert.equal(vazio.sinais_sintomas_clinicos, 'PACIENTE ADMITIDO NA UPA 24H BREVES COM HISTÓRIA DE: TOSSE E FEBRE');
    assert.equal(vazio.cid_principal, 'J18.9');
    const escrito = { sinais_sintomas_clinicos: 'TEXTO DO MÉDICO', diagnostico_inicial_texto: 'PNEUMONIA GRAVE', cid_principal: 'J15.9' };
    assert.deepEqual(dadosDaAdmissao(consulta, escrito), escrito);
    const resinc = dadosDaAdmissao(consulta, escrito, true);
    assert.match(resinc.sinais_sintomas_clinicos, /SINAIS VITAIS: PA 120x80, FC 98, TEMP 38.5°C, SPO2 93%/);
    const s = fs.readFileSync('src/pages/ficha-medica/AbaAih.jsx', 'utf8');
    assert.doesNotMatch(s, /\bcarregar\(\)/, 'salvar não puxa a admissão de novo por cima do formulário');
  });

  test('AIH: atalhos do campo 21 ligam e desligam sem deixar "; " solto', () => {
    let t = alternarJustificativa('', 'A');
    t = alternarJustificativa(t, 'B');
    assert.equal(t, 'A; B');
    assert.equal(alternarJustificativa(t, 'A'), 'B');
    assert.equal(alternarJustificativa('A; B; C', 'B'), 'A; C');
  });

  test('AIH: CID fora do catálogo não vai para a coluna, mas fica guardado como texto no rascunho', () => {
    const r = separarCids({ cid_principal: 'j189', cid_secundario: 'X99.9' }, 'J18.9', 'X99.9', new Set(['J18.9']));
    assert.deepEqual(r.invalidos, ['X99.9']);
    assert.equal(r.dadosGravar.cid_principal, 'J18.9');
    assert.equal(r.dadosGravar.cid_secundario, '');
    assert.deepEqual(r.cidTexto, { cid_principal_texto: '', cid_secundario_texto: 'X99.9' });
    assert.equal(separarCids({ cid_principal: 'J18.9' }, 'J18.9', '', new Set(['J18.9'])).cidTexto, null);
  });

  test('AIH: identificação do paciente vem do cadastro, sem inventar dado', () => {
    const id = identificacaoPaciente({ nome: 'FULANO', prontuario_numero: 'PEP-12', sexo: 'f', endereco: 'Rua A', endereco_numero: '1', bairro: 'Centro' }, {}, {});
    assert.equal(id.prontuario, '12');
    assert.equal(id.sexo, 'FEMININO');
    assert.equal(id.endereco, 'RUA A, 1, CENTRO — BREVES/PA');
    assert.equal(identificacaoPaciente({}, {}, {}).sexo, '');
    const s = fs.readFileSync('src/pages/ficha-medica/AbaAih.jsx', 'utf8');
    assert.ok(s.split('\n').length < 320, 'AbaAih.jsx deve ter menos de 320 linhas');
    assert.match(s, /useSalvarDocumento\(/);
  });

  test('Exames: campos que não eram gravados (mobilidade, radioproteção, local e orientações do ECG) saíram da tela', () => {
    const tudo = ['AbaExames.jsx', 'exames/DadosPedido.jsx', 'exames/JustificativaExame.jsx'].map((f) => fs.readFileSync(`src/pages/ficha-medica/${f}`, 'utf8')).join('\n');
    assert.doesNotMatch(tudo, /mobilidade|radioprotecao|localEcg|orientacoesEcg/i);
  });
}

// Item 17 — Passagem Coletiva dividida em partes.
import { telaImpressaoDoSetor, camposParaGravar, juntarPendencia, permanencia, textoAlergia } from '../../src/pages/passagem-coletiva/regrasColetiva.js';
export function runDivisaoColetivaTests(test) {
  test('Passagem Coletiva: impresso do setor, campos para gravar e atalhos de pendência', () => {
    assert.equal(telaImpressaoDoSetor('Sala Vermelha'), 'print1');
    assert.equal(telaImpressaoDoSetor('Observação'), 'print2');
    assert.equal(telaImpressaoDoSetor('Outro'), 'print1');
    const { meta, limpo } = camposParaGravar({ pendencias: '  ', nivel_consciencia: 'Alerta ', dispositivos: ['AVP'], _meta: { leito_id: 'l1' } });
    assert.deepEqual(meta, { leito_id: 'l1' });
    assert.deepEqual(limpo, { pendencias: null, nivel_consciencia: 'Alerta', dispositivos: ['AVP'] });
    assert.equal(juntarPendencia('', 'Trocar curativo'), 'Trocar curativo');
    assert.equal(juntarPendencia('Aguarda RX', 'Trocar curativo'), 'Aguarda RX · Trocar curativo');
    assert.equal(textoAlergia({ alergias_obs: 'Dipirona' }), 'Dipirona');
    assert.equal(permanencia({}), null);
  });

  test('Passagem Coletiva: se um leito falhar ao salvar, só ele continua pendente (os outros não são reenviados)', () => {
    const s = fs.readFileSync('src/pages/PassagemColetiva.jsx', 'utf8');
    assert.ok(s.split('\n').length < 250, 'PassagemColetiva.jsx deve ter menos de 250 linhas');
    assert.match(s, /const falharam = new Set\(/);
    assert.match(s, /pendenciaDe\(editavelDoLeito\(l\)\)/, 'contagem de pendências inclui o que foi digitado e ainda não salvo');
    for (const parte of ['BarraSetores', 'VistaCards', 'VistaTabela', 'VistaDetalhe', 'CamposPassagem']) {
      assert.ok(fs.existsSync(`src/pages/passagem-coletiva/${parte}.jsx`), `${parte}.jsx existe`);
    }
  });
}

// Item 17 — Início (Home) dividido: plantão, inatividade, avisos e telas em ./inicio/.
import { turnoAtualPorHora, iniciais, lerTelaSalva, TELAS_VALIDAS, TITULO_TELA } from '../../src/pages/inicio/regrasInicio.js';
export function runDivisaoInicioTests(test) {
  test('Início: turno pelo horário de Belém (07h–18h59 Diurno) e iniciais do avatar', () => {
    assert.equal(turnoAtualPorHora(new Date('2026-10-02T10:00:00Z')), 'Diurno');   // 07h00 em Belém
    assert.equal(turnoAtualPorHora(new Date('2026-10-02T09:59:00Z')), 'Noturno');  // 06h59
    assert.equal(turnoAtualPorHora(new Date('2026-10-02T21:59:00Z')), 'Diurno');   // 18h59
    assert.equal(turnoAtualPorHora(new Date('2026-10-02T22:00:00Z')), 'Noturno');  // 19h00
    assert.equal(iniciais('Marcus Costa'), 'MC');
    assert.equal(iniciais(''), 'MC');
  });

  test('Início: tela salva inválida ou sem armazenamento volta para o Painel; toda tela tem título', () => {
    assert.equal(lerTelaSalva(), 'painel');
    for (const t of TELAS_VALIDAS) assert.ok(TITULO_TELA[t], `título da tela ${t}`);
  });

  test('Início: Home.jsx só decide o perfil e a tela; o resto fica em ./inicio/', () => {
    const s = fs.readFileSync('src/pages/Home.jsx', 'utf8');
    assert.ok(s.split('\n').length < 150, 'Home.jsx deve ter menos de 150 linhas');
    for (const h of ['usePlantao(', 'useSessaoInativa(', 'useRelogio(', 'useErroApp(', 'useRascunhosPendentes(']) assert.ok(s.includes(h), h);
    const p = fs.readFileSync('src/pages/inicio/usePlantao.js', 'utf8');
    assert.match(p, /if \(erroEncerrar\) avisarErro/, 'falha ao encerrar a participação aparece na faixa de erro');
    const sess = fs.readFileSync('src/pages/inicio/useSessaoInativa.js', 'utf8');
    assert.match(sess, /2 \* 60 \* 60 \* 1000/, 'encerramento após 2 h sem uso mantido');
  });
}
