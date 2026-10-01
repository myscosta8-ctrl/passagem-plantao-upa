// Ficha de Investigação — Botulismo (Sinan NET, SVS 08/06/2006) — Botulismo_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 448.6, y: 628.2, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 55.2, y: 600.0, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 99, y: 600, w: 370, h: 10 },
  ibge_notificacao: pente(0, [490.7, 505.2, 519.6, 534.1, 548.5], 598.5),
  unidade_notificadora: { p: 0, x: 70, y: 571, w: 265, h: 10 },
  cnes: pente(0, [351.2, 365.7, 380.1, 394.6, 409.0, 423.5], 569.5),
  data_primeiros_sintomas: { p: 0, x: 445.7, y: 572.0, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 71, y: 543, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 449.4, y: 541.4, w: 113.8, h: 11.9 },
  idade: pente(0, [76.7, 90.3], 511, 9),
  unidade_idade: { p: 0, x: 111.8, y: 518.9, w: 10.8, h: 11 },
  sexo: { p: 0, x: 234.5, y: 526.1, w: 10.8, h: 11 },
  gestante: { p: 0, x: 428.9, y: 526.1, w: 11, h: 11 },
  raca: { p: 0, x: 553.9, y: 525.4, w: 11, h: 11 },
  escolaridade: { p: 0, x: 554.4, y: 496.3, w: 11, h: 10.8 },
  cns: { p: 0, x: 55.8, y: 450.9, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 248, y: 452, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 56.1, y: 423.8, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 96, y: 424, w: 228, h: 10 },
  ibge_residencia: pente(0, [339.9, 354.4, 368.8, 383.3, 397.8], 422.5),
  distrito: { p: 0, x: 429, y: 423, w: 140, h: 10 },
  bairro: { p: 0, x: 60, y: 398, w: 140, h: 10 },
  logradouro: { p: 0, x: 209, y: 398, w: 270, h: 10 },
  logradouro_codigo: pente(0, [493.7, 508.1, 522.5, 536.9, 551.3], 396.5),
  numero: { p: 0, x: 60, y: 374, w: 54, h: 10 },
  complemento: { p: 0, x: 124, y: 374, w: 290, h: 10 },
  geo1: { p: 0, x: 425, y: 374, w: 140, h: 10 },
  geo2: { p: 0, x: 60, y: 348, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 231, y: 348, w: 218, h: 10 },
  cep: { p: 0, x: 457.7, y: 346.4, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 56.6, y: 322.2, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 335.3, y: 334.1, w: 11, h: 11 },
  pais: { p: 0, x: 370, y: 322, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, cel, extra = {}) => ({ n, chave, rotulo, tipo: 'data', larg: 3, ...cel, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 3, ...extra })
const casas = (n, chave, rotulo, celulas, p, y, extra = {}) => ({ n, chave, rotulo, tipo: 'digitos', digitos: celulas.length, celulas, caixa: { p, x: celulas[0][0], y, w: celulas[celulas.length - 1][1] - celulas[0][0], h: 10 }, larg: 2, ...extra })
const tres = (a, b, c, d) => [[a, b], [b, c], [c, d]]
const sim = (k) => (d) => d[k] === '1'
const NEURO = [['1', 'Normal'], ['2', 'Diminuição de amplitude'], ['3', 'Lentificações']]
const TOXINA = [['1', 'A'], ['2', 'B'], ['3', 'AB'], ['4', 'E'], ['5', 'F'], ['6', 'G'], ['7', 'Outra'], ['9', 'Ignorado']]

const SINAIS = [['febre', 'Febre', 62.6, 145.0], ['nausea', 'Náusea', 62.2, 130.6], ['vomito', 'Vômito', 63.1, 116.6], ['diarreia', 'Diarreia', 62.4, 103.0], ['constipacao', 'Constipação', 62.4, 88.8], ['cefaleia', 'Cefaleia', 62.4, 76.1], ['tontura', 'Tontura', 62.4, 61.9],
  ['visao_turva', 'Visão turva', 133.2, 146.4], ['diplopia', 'Diplopia', 133.0, 132.0], ['disartria', 'Disartria', 133.2, 118.8], ['disfonia', 'Disfonia', 133.2, 105.8], ['disfagia', 'Disfagia', 132.5, 92.2], ['boca_seca', 'Boca seca', 132.2, 78.2], ['ferimento', 'Ferimento', 132.2, 64.8],
  ['flacidez_pescoco', 'Flacidez de pescoço', 207.6, 145.9], ['dispneia', 'Dispneia', 207.8, 132.0], ['insuf_respiratoria', 'Insuficiência respiratória', 207.4, 118.1], ['insuf_cardiaca', 'Insuficiência cardíaca', 206.6, 104.9], ['coma', 'Coma', 207.8, 92.4], ['parestesia', 'Parestesia', 207.8, 78.5], ['outros', 'Outros', 208.6, 64.3]]
const NEUROLOGICO = [['ptose', 'Ptose palpebral', 341.5, 145.0], ['oftalmoparesia', 'Oftalmoparesia/oftalmoplegia', 342.0, 126.7], ['midriase', 'Midríase', 342.7, 106.8], ['paralisia_facial', 'Paralisia facial', 342.2, 89.3], ['bulbar', 'Comprometimento da musculatura bulbar', 342.2, 73.7],
  ['fraqueza_mmss', 'Fraqueza em membros superiores', 445.2, 144.7], ['fraqueza_mmii', 'Fraqueza em membros inferiores', 445.0, 127.4], ['fraqueza_descendente', 'Fraqueza descendente', 445.7, 107.5], ['fraqueza_simetrica', 'Fraqueza simétrica', 445.9, 90.7], ['sensibilidade', 'Alterações de sensibilidade', 445.9, 75.6]]
const LOCAIS = [['domicilio', 'Domicílio', 69.8], ['creche', 'Creche/escola', 136.1], ['trabalho', 'Trabalho', 219.8], ['restaurante', 'Restaurante/bar/lanchonete', 272.4], ['festa', 'Festa', 399.1], ['outro', 'Outro', 444.2]]

// Tabela 60 — pesquisa de toxina botulínica: [chave, rótulo, y da linha, caixa "coletou", caixa resultado, separadores da data, início/fim]
const T_OUTROS = [250.3, 265.2, 278.5, 293.6, 307.3, 321.8, 336.2]
const TOXINA_LINHAS = [
  ['soro', 'Soro', 514.8, [200.4, 516.2], [392.4, 517.0], [251.0, 265.9, 279.3, 294.3, 308.1, 322.5, 337.0], 239.0, 351.6, 512.7],
  ['fezes', 'Fezes', 497.0, [199.7, 499.7], [392.4, 498.2], T_OUTROS, 238.3, 350.8, 496.2],
  ['alimento1', 'Alimento 1', 480.0, [199.7, 482.4], [393.4, 480.2], T_OUTROS, 238.3, 350.8, 478.2],
  ['alimento2', 'Alimento 2', 462.4, [199.7, 464.4], [393.1, 463.7], T_OUTROS, 238.3, 350.8, 460.9],
  ['outros', 'Outros', 444.7, [200.6, 447.1], [393.1, 447.1], T_OUTROS, 238.3, 350.8, 446.0],
]
const TOXINA_TABELA = TOXINA_LINHAS.flatMap(([k, r, yl, [xc, yc], [xr, yr], sep, x0, x1, yd]) => {
  const col = sim(`toxina_${k}_coletado`)
  const nome = k === 'soro' || k === 'fezes' ? [] : [txt('60', `toxina_${k}_nome`, `${r}: qual?`, { p: 1, x: k === 'outros' ? 82 : 105, y: yl + 4, w: k === 'outros' ? 92 : 70, h: 8 }, { fonte: 7, larg: 3 })]
  return [
    ...nome,
    sni('60', `toxina_${k}_coletado`, `${r}: coletou material?`, cx(1, xc, yc), { larg: 2 }),
    data('60', `toxina_${k}_data`, `${r}: data da coleta`, dataCel(1, x0, sep, x1, yd, 11.9), { larg: 2, quando: col }),
    cod('60', `toxina_${k}_resultado`, `${r}: resultado`, [['1', 'Presença de toxina'], ['2', 'Ausência de toxina'], ['3', 'Inconclusivo'], ['4', 'Não realizado']], cx(1, xr, yr), { larg: 2, quando: col }),
    cod('60', `toxina_${k}_tipo`, `${r}: tipo de toxina`, TOXINA, { p: 1, x: 435.2, y: yl + 1, w: 129.7, h: 15 }, { larg: 2, quando: (d) => d[`toxina_${k}_resultado`] === '1' }),
  ]
})

export default {
  id: 'BOTULISMO',
  titulo: 'Ficha de Investigação — Botulismo',
  arquivo: 'Botulismo_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 59.7, [71.7, 87.6, 100.8, 114.0, 127.8, 142.3, 156.7], 166.0, 278.0, 11.9), { obrig: true }),
        txt('32', 'ocupacao', 'Ocupação', { p: 0, x: 175, y: 279, w: 280, h: 10 }, { larg: 6 }),
        data('33', 'data_primeiro_atendimento', 'Data do 1º atendimento', dataCel(0, 463.2, [475.3, 488.7, 500.7, 516.8, 528.8, 543.2, 557.6], 566.1, 280.1, 11.9)),
        casas('34', 'total_atendimentos', 'Nº total de atendimentos até a suspeição clínica', [[363.2, 375.3], [375.3, 390.2]], 0, 253.5),
        data('35', 'data_suspeicao', 'Data da suspeição clínica', dataCel(0, 465.1, [477.1, 490.7, 502.7, 518.7, 530.7, 545.1, 559.5], 566.8, 249.6, 12)),
        sni('36', 'hospitalizacao', 'Ocorreu hospitalização', cx(0, 310.1, 233.3)),
        data('37', 'data_internacao', 'Data da internação', dataCel(0, 340.6, [352.6, 368.2, 381.5, 396.6, 410.3, 424.7, 439.1], 451.1, 216.8, 11.9), { quando: sim('hospitalizacao') }),
        data('38', 'data_alta', 'Data da alta hospitalar', dataCel(0, 462.0, [474.0, 487.5, 499.6, 515.6, 527.6, 542.0, 556.4], 570.1, 218.2, 11.9), { quando: sim('hospitalizacao') }),
        { n: '39', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 57, y: 183.5, w: 27, h: 10 }, larg: 1, quando: sim('hospitalizacao') },
        txt('40', 'municipio_hospital', 'Município do hospital', { p: 0, x: 98, y: 185, w: 142, h: 9 }, { fonte: 7.5, quando: sim('hospitalizacao') }),
        { n: '40', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [243.1, 257.6, 272.1, 286.5, 301.0], 182.5), larg: 2, quando: sim('hospitalizacao') },
        txt('41', 'nome_hospital', 'Nome do hospital', { p: 0, x: 326, y: 185, w: 140, h: 9 }, { fonte: 7.5, quando: sim('hospitalizacao') }),
        { n: '41', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [479.5, 493.9, 508.4, 522.9, 537.3, 551.8], 182.5), larg: 2, quando: sim('hospitalizacao') },
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        ...SINAIS.map(([k, r, x, y]) => sni('42', `sinal_${k}`, `Sinais e sintomas: ${r}`, cx(0, x, y), { obrig: true })),
        txt('42', 'sinal_parestesia_onde', 'Parestesia: onde?', { p: 0, x: 282, y: 79.5, w: 40, h: 8 }, { fonte: 6, quando: sim('sinal_parestesia') }),
        txt('42', 'sinal_outros_espec', 'Outros sinais (quais?)', { p: 0, x: 250, y: 66, w: 62, h: 8 }, { fonte: 6, quando: sim('sinal_outros') }),
        ...NEUROLOGICO.map(([k, r, x, y]) => sni('43', `neuro_${k}`, `Exame neurológico: ${r}`, cx(0, x, y), { obrig: true })),
        cod('44', 'reflexos', 'Reflexos neurológicos', [['1', 'Normais'], ['2', 'Aumentados'], ['3', 'Reduzidos/ausentes'], ['9', 'Ignorado']], cx(0, 513.8, 43.7, 10.8, 11), { larg: 4 }),
      ],
    },
    {
      titulo: 'Fonte de transmissão',
      campos: [
        sni('45', 'transmissao_alimentar', 'Suspeita de transmissão alimentar?', cx(1, 161.5, 805.2), { larg: 4 }),
        txt('46', 'alimento_suspeito', 'Se sim, qual alimento suspeito', { p: 1, x: 182, y: 795, w: 134, h: 9 }, { fonte: 7.5, larg: 5, quando: sim('transmissao_alimentar') }),
        sni('47', 'producao_industrial', 'Produção do alimento suspeito: industrial/comercial', cx(1, 477.8, 804.2, 10.8, 11), { quando: sim('transmissao_alimentar') }),
        sni('47', 'producao_caseira', 'Produção do alimento suspeito: caseira', cx(1, 477.1, 789.4, 10.8, 11), { quando: sim('transmissao_alimentar') }),
        txt('48', 'industrial_especificar', 'Se industrial/comercial: marca, data de validade e lote', { p: 1, x: 56, y: 757, w: 166, h: 8 }, { fonte: 6.5, larg: 6, quando: sim('producao_industrial') }),
        cod('49', 'exposicao', 'Exposição ao alimento', [['1', 'Única'], ['2', 'Múltipla'], ['9', 'Ignorado']], cx(1, 352.1, 771.1, 10.8, 11), { quando: sim('transmissao_alimentar') }),
        casas('50', 'tempo_unica', 'Se única: tempo entre ingestão e início dos sintomas (horas)', tres(424.8, 437.6, 452.1, 466.5), 1, 752, { quando: (d) => d.exposicao === '1' }),
        casas('51', 'tempo_primeira', 'Se múltipla: tempo entre a primeira ingestão e o início dos sintomas (horas)', tres(141.4, 155.9, 170.4, 185.4), 1, 719, { quando: (d) => d.exposicao === '2' }),
        casas('52', 'tempo_ultima', 'Se múltipla: tempo entre a última ingestão e o início dos sintomas (horas)', tres(400.9, 415.4, 429.9, 444.9), 1, 719, { quando: (d) => d.exposicao === '2' }),
        ...LOCAIS.map(([k, r, x]) => sni('53', `local_${k}`, `Local da ingestão: ${r}`, cx(1, x, 691.5), { larg: 2, quando: sim('transmissao_alimentar') })),
        txt('53', 'local_outro_espec', 'Outro local (qual?)', { p: 1, x: 482, y: 693, w: 80, h: 8 }, { fonte: 7, quando: sim('local_outro') }),
        { n: '54', chave: 'uf_ingestao', rotulo: 'UF onde ingeriu o alimento', tipo: 'uf', caixa: { p: 1, x: 54.0, y: 662.4, w: 26.6, h: 11.8 }, larg: 1, quando: sim('transmissao_alimentar') },
        txt('55', 'municipio_ingestao', 'Município onde ingeriu o alimento suspeito', { p: 1, x: 88, y: 663, w: 172, h: 8 }, { fonte: 7, larg: 4, quando: sim('transmissao_alimentar') }),
        { n: '55', chave: 'ibge_ingestao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [274.7, 289.2, 303.6, 318.1, 332.5], 661.5), larg: 2, quando: sim('transmissao_alimentar') },
        casas('56', 'comensais', 'Número de pessoas (comensais) que consumiram o alimento suspeito', [[503.6, 515.7], [515.7, 530.1], [530.1, 544.6], [544.6, 558.8]], 1, 663.5, { quando: sim('transmissao_alimentar') }),
      ],
    },
    {
      titulo: 'Tratamento',
      campos: [
        sni('57', 'trat_ventilatoria', 'Tratamento: assistência ventilatória', cx(1, 81.6, 634.1, 11.5, 10.8)),
        sni('57', 'trat_soro', 'Tratamento: soro antibotulínico', cx(1, 82.3, 619.0, 11.5, 11)),
        sni('57', 'trat_antibiotico', 'Tratamento: antibioticoterapia', cx(1, 199.9, 634.1, 11.3, 10.8)),
        sni('57', 'trat_outro', 'Tratamento: outro', cx(1, 199.0, 619.7, 11.5, 11)),
        txt('57', 'trat_outro_espec', 'Outro tratamento (qual?)', { p: 1, x: 236, y: 620, w: 82, h: 8 }, { fonte: 7, quando: sim('trat_outro') }),
        data('58', 'data_soro', 'Se recebeu soro antibotulínico: data da administração', dataCel(1, 387.3, [399.3, 414.9, 428.2, 443.2, 457.0, 471.4, 485.8], 502.5, 615.9, 11.9), { quando: sim('trat_soro') }),
        sni('59', 'soro_apos_coleta', 'O soro foi aplicado após a coleta de material clínico?', cx(1, 536.9, 593.8, 11.3, 10.8), { larg: 4, quando: sim('trat_soro') }),
      ],
    },
    {
      titulo: 'Dados do laboratório — pesquisa de toxina botulínica (60)',
      campos: TOXINA_TABELA,
    },
    {
      titulo: 'Exames complementares',
      campos: [
        cod('61', 'liquor', 'Líquor', [['1', 'Realizado'], ['2', 'Não realizado']], cx(1, 194.2, 424.1, 11, 10.8)),
        data('62', 'data_coleta_liquor', 'Líquor: data da coleta', dataCel(1, 219.3, [231.4, 244.9, 257.0, 272.9, 284.9, 299.3, 313.7], 329.3, 404.7, 11.9), { quando: sim('liquor') }),
        { n: '63', chave: 'liquor_celulas', rotulo: 'Número de células/mm³', tipo: 'digitos', digitos: 6, caixa: pente(1, [359.8, 374.3, 388.8, 403.2, 417.7], 403.9, 11.9), larg: 2, quando: sim('liquor') },
        { n: '64', chave: 'liquor_proteinas', rotulo: 'Proteínas (mg%)', tipo: 'digitos', digitos: 6, caixa: pente(1, [477.6, 492.0, 506.5, 520.9, 535.4], 403.9, 11.9), larg: 2, quando: sim('liquor') },
        cod('65', 'enmg', 'Eletroneuromiografia', [['1', 'Realizada'], ['2', 'Não realizada']], cx(1, 163.4, 381.4, 11, 10.8)),
        data('66', 'data_enmg', 'Data da realização', dataCel(1, 187.9, [199.9, 213.5, 225.5, 241.5, 253.5, 267.9, 282.3], 297.8, 362.7, 12), { quando: sim('enmg') }),
        cod('67', 'neuro_sensitiva', 'Neurocondução sensitiva', NEURO, cx(1, 546.0, 380.4, 10.8, 11), { quando: sim('enmg') }),
        cod('68', 'neuro_motora', 'Neurocondução motora', NEURO, cx(1, 284.2, 347.5), { quando: sim('enmg') }),
        cod('69', 'estimulacao_repetitiva', 'Estimulação repetitiva', [['1', 'Normal'], ['2', 'Decremento (frequência baixa)'], ['3', 'Incremento (frequência alta)']], cx(1, 547.4, 348.2), { quando: sim('enmg') }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('70', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 314.9, 314.2, 11.5, 11.5)),
        txt('70', 'descartado_agente', 'Descartado: especificar outro agente', { p: 1, x: 216, y: 298.5, w: 95, h: 8 }, { fonte: 6.5, quando: (d) => d.classificacao_final === '2' }),
        cod('71', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico']], cx(1, 548.2, 313.7, 10.8, 10.8)),
        cod('72', 'forma', 'Forma de botulismo', [['1', 'Alimentar'], ['2', 'Intestinal'], ['3', 'Por ferimento'], ['4', 'Outra']], cx(1, 295.2, 279.4), { quando: (d) => d.classificacao_final === '1' }),
        sni('73', 'toxina_clinica', 'Presença de toxina botulínica na amostra: clínica', cx(1, 491.5, 279.4)),
        sni('73', 'toxina_bromatologica', 'Presença de toxina botulínica na amostra: bromatológica', cx(1, 491.5, 265.0)),
        cod('74', 'tipo_toxina_clinica', 'Tipo de toxina isolada na amostra: clínica', TOXINA, cx(1, 235.7, 244.6, 11, 10.8), { quando: sim('toxina_clinica') }),
        cod('74', 'tipo_toxina_bromatologica', 'Tipo de toxina isolada na amostra: bromatológica', TOXINA, cx(1, 236.2, 231.1), { quando: sim('toxina_bromatologica') }),
        txt('75', 'causa_alimento', 'Qual a causa/alimento incriminado/alimento potencialmente suspeito', { p: 1, x: 306, y: 232, w: 146, h: 8 }, { fonte: 7, larg: 5 }),
        sni('76', 'doenca_trabalho', 'Doença relacionada ao trabalho', cx(1, 553.0, 241.2, 11, 10.8)),
        cod('77', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito por botulismo'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 310.8, 212.2, 11, 10.8), { larg: 4 }),
        data('78', 'data_obito', 'Data do óbito', dataCel(1, 331.2, [343.3, 358.2, 371.5, 386.5, 400.2, 414.7, 429.1], 443.8, 197.6, 11.9), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('79', 'data_encerramento', 'Data do encerramento', dataCel(1, 449.8, [461.8, 476.8, 490.1, 505.2, 518.9, 533.4, 547.8], 562.4, 197.7, 11.9)),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      aviso: 'Alimentos potencialmente suspeitos ingeridos nos últimos 10 dias anteriores ao início dos sintomas.',
      campos: [
        ...[142.9, 130.4].flatMap((y, i) => [
          txt('', `alimento${i + 1}_tipo`, `Alimento ${i + 1}: tipo`, { p: 1, x: 33, y, w: 228, h: 12.5 }, { fonte: 8, larg: 6 }),
          txt('', `alimento${i + 1}_local`, `Alimento ${i + 1}: local de consumo`, { p: 1, x: 264, y, w: 296, h: 12.5 }, { fonte: 8, larg: 6 }),
        ]),
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [100.4, 85.5].map((y) => ({ p: 1, x: 33, y, w: 529, h: 14.9 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 1, x: 58, y: 62, w: 400, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [480.9, 495.4, 509.8, 524.3, 538.8, 553.2], 55.5), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 58, y: 33, w: 190, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 266, y: 33, w: 195, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
