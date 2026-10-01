// Ficha de Investigação — Meningite (Sinan NET, SVS 15/10/2007) — Meningite_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 447.1, y: 686.0, w: 115.2, h: 12 },
  uf_notificacao: { p: 0, x: 55.4, y: 655.4, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 99, y: 655, w: 380, h: 10 },
  ibge_notificacao: pente(0, [492.9, 507.4, 521.8, 536.3, 550.8], 654),
  unidade_notificadora: { p: 0, x: 70, y: 626, w: 268, h: 10 },
  cnes: pente(0, [351.2, 365.7, 380.1, 394.6, 409.0, 423.5], 626),
  data_primeiros_sintomas: { p: 0, x: 445.8, y: 627.4, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 70, y: 598, w: 370, h: 10 },
  data_nascimento: { p: 0, x: 449.6, y: 596.9, w: 113.8, h: 11.9 },
  idade: pente(0, [76.8, 90.5], 567, 9),
  unidade_idade: { p: 0, x: 111.8, y: 574.3, w: 11, h: 11 },
  sexo: { p: 0, x: 234.5, y: 581.5, w: 11, h: 11 },
  gestante: { p: 0, x: 429.1, y: 581.5, w: 11, h: 11 },
  raca: { p: 0, x: 554.2, y: 580.8, w: 10.8, h: 11 },
  escolaridade: { p: 0, x: 554.6, y: 551.8, w: 10.8, h: 10.8 },
  cns: { p: 0, x: 55.9, y: 506.3, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 248, y: 507, w: 317, h: 10 },
  uf_residencia: { p: 0, x: 55.4, y: 477.8, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 96, y: 478, w: 234, h: 10 },
  ibge_residencia: pente(0, [339.1, 353.6, 368.1, 382.5, 397.0], 477),
  distrito: { p: 0, x: 428, y: 478, w: 137, h: 10 },
  bairro: { p: 0, x: 59, y: 452, w: 140, h: 10 },
  logradouro: { p: 0, x: 208, y: 452, w: 272, h: 10 },
  logradouro_codigo: pente(0, [492.9, 507.3, 521.7, 536.1, 550.5], 451),
  numero: { p: 0, x: 59, y: 428, w: 56, h: 10 },
  complemento: { p: 0, x: 123, y: 428, w: 292, h: 10 },
  geo1: { p: 0, x: 424, y: 428, w: 141, h: 10 },
  geo2: { p: 0, x: 59, y: 403, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 230, y: 403, w: 218, h: 10 },
  cep: { p: 0, x: 456.9, y: 400.5, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 55.8, y: 376.2, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 334.6, y: 388.1, w: 11, h: 11 },
  pais: { p: 0, x: 369, y: 378, w: 196, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'data', caixa, larg: 3, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 3, ...extra })
const hosp = (d) => d.hospitalizacao === '1'

// 33 — vacinas: situação (1/2/9), nº de doses e data da última dose
const VACINAS = [
  ['ac', 'Polissacarídica A/C', [111.1, 297.4], [182.3, 298.1], [219.2, 296.9]],
  ['bc', 'Polissacarídica B/C', [111.1, 277.9], [182.3, 278.7], [219.2, 277.5]],
  ['meningo_c', 'Conjugada meningo C', [111.1, 258.5], [182.3, 258.6], [219.2, 257.4]],
  ['bcg', 'BCG', [111.1, 238.3], [181.5, 237.6], [218.5, 236.5]],
  ['triplice', 'Tríplice', [347.3, 299.5], [411.3, 298.1], [447.2, 298.5]],
  ['hemofilo', 'Hemófilo (tetravalente ou Hib)', [347.3, 276.2], [411.3, 275.0], [447.2, 275.3]],
  ['pneumococo', 'Pneumococo', [346.6, 255.6], [410.6, 254.1], [446.5, 254.5]],
  ['outra', 'Outra vacina', [345.8, 236.9], null, [445.0, 235.8]],
].flatMap(([k, r, b, dz, dt]) => {
  const vac = (d) => d[`vac_${k}`] === '1'
  return [
    sni('33', `vac_${k}`, `Vacinação: ${r}`, cx(0, b[0], b[1]), {}),
    ...(dz ? [{ n: '33', chave: `vac_${k}_doses`, rotulo: `${r}: nº de doses`, tipo: 'digitos', digitos: 2, caixa: { p: 0, x: dz[0], y: dz[1], w: 27, h: 12.1 }, larg: 2, quando: vac }] : []),
    data('33', `vac_${k}_data`, `${r}: data da última dose`, { p: 0, x: dt[0], y: dt[1], w: 115.2, h: 11.9 }, { quando: vac }),
  ]
})

// 49 — resultados laboratoriais (texto livre em cada caixa)
const RL = (k, r, x, y, w = 101) => txt('49', `lab_${k}`, r, { p: 1, x: x + 1, y: y + 1, w, h: 13 }, { fonte: 7.5 })
const LAB = [
  RL('cultura_liquor', 'Cultura: líquor', 115.9, 681.6), RL('cultura_petequial', 'Cultura: lesão petequial', 115.9, 665.3), RL('cultura_sangue', 'Cultura: sangue/soro', 115.9, 649.6), RL('cultura_escarro', 'Cultura: escarro', 115.9, 632.6),
  RL('bact_liquor', 'Bacterioscopia: líquor', 115.9, 605.7), RL('bact_petequial', 'Bacterioscopia: lesão petequial', 115.9, 589.4), RL('bact_sangue', 'Bacterioscopia: sangue/soro', 115.9, 573.0),
  RL('cie_liquor', 'CIE: líquor', 289.3, 681.6), RL('cie_sangue', 'CIE: sangue/soro', 289.3, 665.3),
  RL('latex_liquor', 'Aglutinação pelo látex: líquor', 289.3, 635.2), RL('latex_sangue', 'Aglutinação pelo látex: sangue/soro', 289.3, 619.5),
  RL('isolamento_liquor', 'Isolamento viral: líquor', 277.5, 591.3, 112), RL('isolamento_fezes', 'Isolamento viral: fezes', 277.5, 574.3, 112),
  RL('pcr_liquor', 'PCR: líquor', 462.7, 678.4), RL('pcr_petequial', 'PCR: lesão petequial', 462.7, 662.0), RL('pcr_sangue', 'PCR: sangue/soro', 462.7, 645.0), RL('pcr_escarro', 'PCR: escarro', 462.7, 628.6),
]
const QC = (k, r, x, y) => txt('', `qc_${k}`, `Exame quimiocitológico: ${r}`, { p: 1, x, y, w: 64, h: 14 }, { larg: 2 })
const QUIMIO = [QC('hemacias', 'hemácias (mm³)', 106.7, 288.5), QC('leucocitos', 'leucócitos (mm³)', 278.8, 288.5), QC('monocitos', 'monócitos (%)', 464, 288.5),
  QC('neutrofilos', 'neutrófilos (%)', 106.7, 267), QC('eosinofilos', 'eosinófilos (%)', 278.8, 267), QC('linfocitos', 'linfócitos (%)', 464, 268.5),
  QC('glicose', 'glicose (mg)', 106.7, 246.5), QC('proteinas', 'proteínas (mg)', 278.8, 246.5), QC('cloreto', 'cloreto (mg)', 464, 248)]

export default {
  id: 'MENINGITE',
  titulo: 'Ficha de Investigação — Meningite',
  arquivo: 'Meningite_v5.pdf',
  // Campo 2 (1 - Doença meningocócica / 2 - Outras meningites) pelo CID do diagnóstico, quando houver; senão o profissional escolhe.
  inicializar: (dados, agravo) => {
    const c = String(agravo?.cidDiagnostico || '').toUpperCase()
    return { ...dados, agravo_codigo: dados.agravo_codigo || (c.startsWith('A39') ? '1' : /^(G0[0-3]|A17\.?0|A87)/.test(c) ? '2' : '') }
  },
  secoes: [
    { titulo: 'Agravo', campos: [cod('2', 'agravo_codigo', 'Agravo/doença', [['1', 'Doença meningocócica'], ['2', 'Outras meningites']], cx(0, 357.8, 696.5), { larg: 4 })] },
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', { p: 0, x: 62.2, y: 325.4, w: 106.3, h: 11.9 }, {}),
        txt('32', 'ocupacao', 'Ocupação', { p: 0, x: 192, y: 327, w: 373, h: 10 }, { larg: 9 }),
        ...VACINAS,
        txt('33', 'vac_outra_espec', 'Outra vacina (especificar)', { p: 0, x: 385, y: 236, w: 55, h: 7 }, { fonte: 6, quando: (d) => d.vac_outra === '1' }),
        ...[['aids', 'AIDS/HIV+', 76.8, 196.6], ['traumatismo', 'Traumatismo', 77.5, 182.4], ['imunodepressoras', 'Outras doenças imunodepressoras', 163.2, 198.0], ['infeccao_hospitalar', 'Infecção hospitalar', 163.9, 180.7],
          ['ira', 'IRA', 331.2, 195.8], ['outro', 'Outro', 283.9, 182.4], ['tuberculose', 'Tuberculose', 400.1, 196.6]]
          .map(([k, r, x, y]) => sni('34', `doenca_${k}`, `Doença pré-existente: ${r}`, cx(0, x, y), {})),
        txt('34', 'doenca_outro_espec', 'Outra doença pré-existente (especificar)', { p: 0, x: 300, y: 182, w: 150, h: 7 }, { fonte: 6.5, quando: (d) => d.doenca_outro === '1' }),
        cod('35', 'contato_caso', 'Contato com caso suspeito ou confirmado (até 15 dias antes do início dos sintomas)', [['1', 'Domicílio'], ['2', 'Vizinhança'], ['3', 'Trabalho'], ['4', 'Creche/escola'], ['5', 'Posto de saúde/hospital'], ['6', 'Outro estado/município'], ['7', 'Sem história de contato'], ['8', 'Outro país'], ['9', 'Ignorado']], cx(0, 552.7, 156.7), { larg: 5 }),
        txt('36', 'contato_nome', 'Nome do contato', { p: 0, x: 66, y: 112, w: 370, h: 10 }, { larg: 6, quando: (d) => d.contato_caso && !['7', '9'].includes(d.contato_caso) }),
        { n: '37', chave: 'contato_telefone', rotulo: '(DDD) Telefone do contato', tipo: 'digitos', digitos: 10, caixa: { p: 0, x: 438, y: 109, w: 128, h: 9 }, larg: 3, quando: (d) => d.contato_caso && !['7', '9'].includes(d.contato_caso) },
        txt('38', 'contato_endereco', 'Endereço do contato (rua, av., apto., bairro, localidade etc.)', { p: 0, x: 66, y: 87, w: 375, h: 10 }, { larg: 9, quando: (d) => d.contato_caso && !['7', '9'].includes(d.contato_caso) }),
        sni('39', 'caso_secundario', 'Caso secundário', cx(0, 549.8, 95.0)),
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        ...[['cefaleia', 'Cefaleia', 177.1, 70.3], ['febre', 'Febre', 177.1, 55.7], ['vomitos', 'Vômitos', 223.9, 70.8], ['convulsoes', 'Convulsões', 223.9, 56.2], ['rigidez_nuca', 'Rigidez de nuca', 278.9, 70.8],
          ['kernig', 'Kernig/Brudzinski', 278.9, 56.2], ['abaulamento', 'Abaulamento de fontanela', 358.1, 70.3], ['coma', 'Coma', 358.1, 55.7], ['petequias', 'Petéquias/sufusões hemorrágicas', 423.4, 70.3], ['outros', 'Outros', 423.4, 55.7]]
          .map(([k, r, x, y]) => sni('40', `sinal_${k}`, `Sinal/sintoma: ${r}`, cx(0, x, y), {})),
        txt('40', 'sinal_outros_espec', 'Outros sinais (especificar)', { p: 0, x: 470, y: 57, w: 95, h: 7 }, { fonte: 6.5, quando: (d) => d.sinal_outros === '1' }),
      ],
    },
    {
      titulo: 'Atendimento',
      campos: [
        sni('41', 'hospitalizacao', 'Ocorreu hospitalização', cx(1, 151.9, 792.5), {}),
        data('42', 'data_hospitalizacao', 'Data da internação', { p: 1, x: 175.1, y: 782.4, w: 115.2, h: 8.9 }, { quando: hosp }),
        { n: '43', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 295, y: 780, w: 27, h: 9 }, larg: 1, quando: hosp },
        txt('44', 'municipio_hospital', 'Município do hospital', { p: 1, x: 340, y: 781, w: 130, h: 9 }, { fonte: 7.5, quando: hosp }),
        { n: '44', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [489.9, 504.4, 518.8, 533.3, 547.8], 780), larg: 2, quando: hosp },
        txt('45', 'nome_hospital', 'Nome do hospital', { p: 1, x: 66, y: 755, w: 395, h: 10 }, { larg: 6, quando: hosp }),
        { n: '45', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [472.7, 487.2, 501.6, 516.1, 530.5, 545.0], 754), larg: 3, quando: hosp },
      ],
    },
    {
      titulo: 'Dados do laboratório',
      campos: [
        sni('46', 'puncao_lombar', 'Punção lombar', cx(1, 155.8, 735.4), {}),
        data('47', 'data_puncao', 'Data da punção', { p: 1, x: 177.9, y: 723.3, w: 105.7, h: 11.9 }, { quando: (d) => d.puncao_lombar === '1' }),
        cod('48', 'aspecto_liquor', 'Aspecto do líquor', [['1', 'Límpido'], ['2', 'Purulento'], ['3', 'Hemorrágico'], ['4', 'Turvo'], ['5', 'Xantocrômico'], ['6', 'Outro'], ['9', 'Ignorado']], cx(1, 548.4, 736.6), { quando: (d) => d.puncao_lombar === '1' }),
        ...LAB,
        ...QUIMIO,
      ],
    },
    {
      titulo: 'Classificação do caso / etiologia',
      campos: [
        cod('50', 'classificacao', 'Classificação do caso', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 132.0, 529.2)),
        { n: '51', chave: 'especificacao', rotulo: 'Se confirmado, especifique', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Meningococcemia'], ['02', 'Meningite meningocócica'], ['03', 'Meningite meningocócica com meningococcemia'], ['04', 'Meningite tuberculosa'], ['05', 'Meningite por outras bactérias'], ['06', 'Meningite não especificada'], ['07', 'Meningite asséptica'], ['08', 'Meningite de outra etiologia'], ['09', 'Meningite por hemófilo'], ['10', 'Meningite por pneumococos']], caixa: { p: 1, x: 532.6, y: 523.9, w: 21.6, h: 10.8 }, larg: 5, quando: (d) => d.classificacao === '1' },
        txt('51', 'esp_bacterias', 'Outras bactérias (especificar)', { p: 1, x: 290, y: 472.5, w: 45, h: 7 }, { fonte: 6, quando: (d) => d.especificacao === '05' }),
        txt('51', 'esp_asseptica', 'Asséptica (especificar)', { p: 1, x: 446, y: 512.5, w: 85, h: 7 }, { fonte: 6, quando: (d) => d.especificacao === '07' }),
        txt('51', 'esp_outra', 'Outra etiologia (especificar)', { p: 1, x: 476, y: 499.5, w: 55, h: 7 }, { fonte: 6, quando: (d) => d.especificacao === '08' }),
        { n: '52', chave: 'criterio', rotulo: 'Critério de confirmação', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Cultura'], ['02', 'CIE'], ['03', 'Aglutinação pelo látex'], ['04', 'Clínico'], ['05', 'Bacterioscopia'], ['06', 'Quimiocitológico do líquor'], ['07', 'Clínico-epidemiológico'], ['08', 'Isolamento viral'], ['09', 'PCR'], ['10', 'Outros']], caixa: { p: 1, x: 344.2, y: 454.8, w: 21.3, h: 10.8 }, larg: 4, quando: (d) => d.classificacao === '1' },
        txt('53', 'sorogrupo', 'Se N. meningitidis, especificar sorogrupo', { p: 1, x: 518, y: 423, w: 45, h: 9 }, { larg: 3, quando: (d) => ['01', '02', '03'].includes(d.especificacao) }),
      ],
    },
    {
      titulo: 'Medidas de controle e conclusão',
      campos: [
        { n: '54', chave: 'num_comunicantes', rotulo: 'Número de comunicantes', tipo: 'digitos', digitos: 3, caixa: { p: 1, x: 57.6, y: 379, w: 41, h: 10 }, larg: 2 },
        sni('55', 'quimioprofilaxia', 'Realizada quimioprofilaxia dos comunicantes?', cx(1, 279.8, 395.3), { larg: 4 }),
        data('56', 'data_quimioprofilaxia', 'Se sim, data', { p: 1, x: 311.6, y: 379, w: 115.2, h: 10 }, { quando: (d) => d.quimioprofilaxia === '1' }),
        sni('57', 'relacionada_trabalho', 'Doença relacionada ao trabalho', cx(1, 541.0, 394.8, 13, 11)),
        cod('58', 'evolucao', 'Evolução do caso', [['1', 'Alta'], ['2', 'Óbito por meningite'], ['3', 'Óbito por outra causa'], ['9', 'Ignorado']], cx(1, 296.9, 359.5)),
        data('59', 'data_evolucao', 'Data da evolução', { p: 1, x: 323.8, y: 341, w: 115.4, h: 10 }, { quando: (d) => !!d.evolucao && d.evolucao !== '9' }),
        data('60', 'data_encerramento', 'Data do encerramento', { p: 1, x: 446.0, y: 341, w: 115.2, h: 10 }),
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [187.7, 173.8, 160.1, 146.1, 132.2, 118.2, 104.3].map((y) => ({ p: 1, x: 29.3, y, w: 538.8, h: 13.9 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 1, x: 60, y: 80, w: 395, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Cód. da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [478.6, 493.1, 507.6, 522.0, 536.5, 550.9], 74), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 60, y: 48, w: 195, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 268, y: 48, w: 195, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
