// Ficha de Notificação/Investigação — AIDS (pacientes com 13 anos ou mais) (Sinan NET, SVS 08/06/2006) — Aids_adulto_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 446.2, y: 677, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 52.9, y: 648.7, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 97, y: 649, w: 370, h: 10 },
  ibge_notificacao: pente(0, [488.4, 502.8, 517.3, 531.7, 546.2], 646.5),
  unidade_notificadora: { p: 0, x: 67, y: 619, w: 265, h: 10 },
  cnes: pente(0, [348.9, 363.4, 377.8, 392.3, 406.8, 421.2], 618.5),
  data_primeiros_sintomas: { p: 0, x: 443.3, y: 621, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 68, y: 591, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 447.0, y: 590, w: 113.8, h: 11.9 },
  idade: pente(0, [74.3, 87.9], 560, 9),
  unidade_idade: { p: 0, x: 109.4, y: 567.6, w: 11, h: 11 },
  sexo: { p: 0, x: 232.1, y: 574.8, w: 10.8, h: 11 },
  gestante: { p: 0, x: 426.5, y: 574.8, w: 11, h: 10.8 },
  raca: { p: 0, x: 551.5, y: 574.1, w: 11, h: 10.8 },
  escolaridade: { p: 0, x: 552.0, y: 545.0, w: 11, h: 10.8 },
  cns: { p: 0, x: 53.4, y: 499.5, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 245, y: 501, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 53.8, y: 468.8, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 469, w: 228, h: 10 },
  ibge_residencia: pente(0, [337.6, 352.1, 366.6, 381.0, 395.5], 467.5),
  distrito: { p: 0, x: 427, y: 468, w: 138, h: 10 },
  bairro: { p: 0, x: 57, y: 444, w: 140, h: 10 },
  logradouro: { p: 0, x: 207, y: 443, w: 268, h: 10 },
  logradouro_codigo: pente(0, [491.4, 505.8, 520.2, 534.6, 549.0], 441.5),
  numero: { p: 0, x: 58, y: 419, w: 54, h: 10 },
  complemento: { p: 0, x: 122, y: 419, w: 290, h: 10 },
  geo1: { p: 0, x: 423, y: 419, w: 140, h: 10 },
  geo2: { p: 0, x: 57, y: 394, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 229, y: 394, w: 218, h: 10 },
  cep: { p: 0, x: 455.4, y: 391.5, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 54.3, y: 367.2, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 333.1, y: 379.2, w: 10.8, h: 11 },
  pais: { p: 0, x: 368, y: 368, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const LAB = [['1', 'Positivo/reagente'], ['2', 'Negativo/não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado'], ['5', 'Indeterminado'], ['9', 'Ignorado']]
const transfusao = (d) => d.sang_transfusao === '1' || d.sang_acidente === '1'

const RIO = [['kaposi', 'Sarcoma de Kaposi (10)', 67.0, 789.4], ['tb_disseminada', 'Tuberculose disseminada/extrapulmonar/não cavitária (10)', 67.0, 774.7], ['candidose_oral', 'Candidose oral ou leucoplasia pilosa (5)', 67.0, 760.3],
  ['tb_pulmonar', 'Tuberculose pulmonar cavitária ou não especificada (5)', 67.0, 745.7], ['herpes_zoster', 'Herpes zoster em indivíduo ≤ 60 anos (5)', 67.0, 731.0], ['snc', 'Disfunção do sistema nervoso central (5)', 67.0, 716.6],
  ['diarreia', 'Diarreia ≥ 1 mês (2)', 67.0, 702.0], ['febre', 'Febre ≥ 38 °C por ≥ 1 mês (2)', 67.7, 689.0], ['caquexia', 'Caquexia ou perda de peso > 10% (2)', 301.0, 789.1], ['astenia', 'Astenia ≥ 1 mês (2)', 301.0, 774.5],
  ['dermatite', 'Dermatite persistente (2)', 301.0, 760.1], ['anemia', 'Anemia e/ou linfopenia e/ou trombocitopenia (2)', 301.0, 745.4], ['tosse', 'Tosse persistente ou qualquer pneumonia (2)', 301.0, 730.8],
  ['linfadenopatia', 'Linfadenopatia ≥ 1 cm, ≥ 2 sítios extrainguinais, por ≥ 1 mês (2)', 301.0, 716.4]]
const CDC = [['cancer_cervical', 'Câncer cervical invasivo', 65.5, 656.6], ['candidose_esofago', 'Candidose de esôfago', 65.5, 642.7], ['candidose_traqueia', 'Candidose de traqueia, brônquios ou pulmão', 65.5, 627.8],
  ['citomegalovirose', 'Citomegalovirose (exceto fígado, baço ou linfonodos)', 65.5, 613.2], ['criptococose', 'Criptococose extrapulmonar', 65.5, 598.8], ['criptosporidiose', 'Criptosporidiose intestinal crônica > 1 mês', 65.5, 584.2],
  ['herpes_simples', 'Herpes simples mucocutâneo > 1 mês', 65.5, 569.5], ['histoplasmose', 'Histoplasmose disseminada', 65.5, 554.2], ['isosporidiose', 'Isosporidiose intestinal crônica > 1 mês', 65.5, 539.8],
  ['leucoencefalopatia', 'Leucoencefalopatia multifocal progressiva', 298.6, 657.4], ['linfoma_nh', 'Linfoma não Hodgkin e outros linfomas', 298.8, 640.8], ['linfoma_cerebro', 'Linfoma primário do cérebro', 298.8, 626.2],
  ['micobacteriose', 'Micobacteriose disseminada exceto tuberculose e hanseníase', 298.8, 611.5], ['pneumocistose', 'Pneumonia por Pneumocystis carinii', 298.6, 597.1], ['chagas', 'Reativação de doença de Chagas', 298.1, 582.7],
  ['salmonelose', 'Salmonelose (sepse recorrente não tifoide)', 298.3, 568.6], ['toxoplasmose', 'Toxoplasmose cerebral', 298.6, 553.7], ['cd4', 'Contagem de linfócitos T CD4+ < 350 cel/mm³', 298.6, 539.3]]

export default {
  id: 'AIDS_ADULTO',
  titulo: 'Ficha de Notificação/Investigação — AIDS (13 anos ou mais)',
  arquivo: 'Aids_adulto_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g, { rotulo7: 'Data do diagnóstico' }),
    {
      titulo: 'Antecedentes epidemiológicos — provável modo de transmissão',
      campos: [
        { n: '31', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 66, y: 319, w: 499, h: 10 }, larg: 12 },
        sni('32', 'transmissao_vertical', 'Transmissão vertical', cx(0, 234.2, 287.3), { obrig: true }),
        cod('33', 'transmissao_sexual', 'Sexual', [['1', 'Relações sexuais com homens'], ['2', 'Relações sexuais com mulheres'], ['3', 'Relações sexuais com homens e mulheres'], ['4', 'Não foi transmissão sexual'], ['9', 'Ignorado']], cx(0, 549.1, 291.8), { larg: 4, obrig: true }),
        sni('34', 'sang_drogas', 'Sanguínea: uso de drogas injetáveis', cx(0, 283.7, 244.8), { obrig: true }),
        sni('34', 'sang_hemofilia', 'Sanguínea: tratamento/hemotransfusão para hemofilia', cx(0, 283.7, 226.1), { obrig: true }),
        sni('34', 'sang_transfusao', 'Sanguínea: transfusão sanguínea', cx(0, 483.1, 245.5), { obrig: true }),
        sni('34', 'sang_acidente', 'Sanguínea: acidente com material biológico com soroconversão até 6 meses', cx(0, 483.1, 227.5), { obrig: true }),
        { n: '35', chave: 'data_transfusao', rotulo: 'Data da transfusão/acidente', tipo: 'data', caixa: { p: 0, x: 66.8, y: 186.9, w: 109.2, h: 10.3 }, larg: 3, quando: transfusao },
        { n: '36', chave: 'uf_transfusao', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 182, y: 186, w: 28, h: 9 }, larg: 1, quando: transfusao },
        { n: '37', chave: 'municipio_transfusao', rotulo: 'Município onde ocorreu a transfusão/acidente', tipo: 'texto', caixa: { p: 0, x: 220, y: 188, w: 258, h: 9 }, larg: 4, quando: transfusao },
        { n: '37', chave: 'ibge_transfusao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [493.6, 508.1, 522.6, 537.0, 551.5], 184), larg: 2, quando: transfusao },
        { n: '38', chave: 'instituicao_transfusao', rotulo: 'Instituição onde ocorreu a transfusão/acidente', tipo: 'texto', caixa: { p: 0, x: 66, y: 160, w: 400, h: 9 }, larg: 6, quando: transfusao },
        { n: '38', chave: 'cnes_transfusao', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [480.2, 494.7, 509.1, 523.6, 538.0, 552.5], 157), larg: 2, quando: transfusao },
        cod('39', 'transfusao_causa', 'A transfusão/acidente foi considerada causa da infecção pelo HIV?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Não se aplica']], cx(0, 542.4, 139.7, 11, 9.6), { larg: 4, quando: transfusao }),
      ],
    },
    {
      titulo: 'Dados do laboratório — evidência laboratorial de infecção pelo HIV',
      campos: [
        cod('40', 'lab_triagem', 'Teste de triagem', LAB, cx(0, 109.7, 75.8, 12.2, 12.2), { obrig: true }),
        { n: '40', chave: 'lab_triagem_data', rotulo: 'Teste de triagem: data da coleta', tipo: 'data', caixa: { p: 0, x: 161.6, y: 68.5, w: 108.7, h: 10.3 }, larg: 3, quando: (d) => !!d.lab_triagem && d.lab_triagem !== '4' },
        cod('40', 'lab_confirmatorio', 'Teste confirmatório', LAB, cx(0, 309.4, 75.1, 12.2, 12.2), { obrig: true }),
        { n: '40', chave: 'lab_confirmatorio_data', rotulo: 'Teste confirmatório: data da coleta', tipo: 'data', caixa: { p: 0, x: 386.4, y: 68.7, w: 109.3, h: 10.3 }, larg: 3, quando: (d) => !!d.lab_confirmatorio && d.lab_confirmatorio !== '4' },
        cod('40', 'lab_rapido1', 'Teste rápido 1', LAB, cx(0, 153.6, 43.9, 12.2, 12.5)),
        cod('40', 'lab_rapido2', 'Teste rápido 2', LAB, cx(0, 234.0, 42.7, 12.2, 12.2)),
        cod('40', 'lab_rapido3', 'Teste rápido 3', LAB, cx(0, 310.1, 42.7, 12.2, 12.2)),
        { n: '40', chave: 'lab_rapido_data', rotulo: 'Testes rápidos: data da coleta', tipo: 'data', caixa: { p: 0, x: 367.5, y: 34.0, w: 109.3, h: 10.3 }, larg: 3, quando: (d) => !!(d.lab_rapido1 || d.lab_rapido2 || d.lab_rapido3) },
      ],
    },
    {
      titulo: 'Critérios de definição de casos de aids',
      aviso: 'Critério Rio de Janeiro/Caracas: entre parênteses, a pontuação de cada sinal. *Excluída a tuberculose como causa.',
      campos: [
        ...RIO.map(([k, r, x, y]) => sni('41', `rio_${k}`, `Rio/Caracas: ${r}`, cx(1, x, y), { larg: 4, obrig: true })),
        ...CDC.map(([k, r, x, y]) => sni('42', `cdc_${k}`, `CDC adaptado: ${r}`, cx(1, x, y), { larg: 4, obrig: true })),
        sni('43', 'criterio_obito', 'Critério óbito (declaração de óbito com menção de aids/HIV, sem classificação por outro critério)', cx(1, 503.5, 509.5, 12.2, 12.7), { larg: 6 }),
      ],
    },
    {
      titulo: 'Tratamento e evolução',
      campos: [
        { n: '44', chave: 'uf_tratamento', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 50, y: 460, w: 28, h: 9 }, larg: 1 },
        { n: '45', chave: 'municipio_tratamento', rotulo: 'Município onde se realiza o tratamento', tipo: 'texto', caixa: { p: 1, x: 92, y: 461, w: 158, h: 9 }, fonte: 7.5, larg: 3 },
        { n: '45', chave: 'ibge_tratamento', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [263.4, 277.8, 292.3, 306.7, 321.2], 459), larg: 2 },
        { n: '46', chave: 'unidade_tratamento', rotulo: 'Unidade de saúde onde se realiza o tratamento', tipo: 'texto', caixa: { p: 1, x: 352, y: 460, w: 106, h: 8 }, fonte: 7, larg: 4 },
        { n: '46', chave: 'cnes_tratamento', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [477.9, 492.4, 506.8, 521.3, 535.8, 550.2], 460), larg: 2 },
        cod('47', 'evolucao', 'Evolução do caso', [['1', 'Vivo'], ['2', 'Óbito por aids'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 424.8, 446.4)),
        { n: '48', chave: 'data_obito', rotulo: 'Data do óbito', tipo: 'data', caixa: { p: 1, x: 449.0, y: 428.5, w: 116.4, h: 10 }, larg: 3, quando: (d) => ['2', '3'].includes(d.evolucao) },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 59, y: 399, w: 285, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 353, y: 399, w: 212, h: 10 }, larg: 6 },
      ],
    },
  ],
}
