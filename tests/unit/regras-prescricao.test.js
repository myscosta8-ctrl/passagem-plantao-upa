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
