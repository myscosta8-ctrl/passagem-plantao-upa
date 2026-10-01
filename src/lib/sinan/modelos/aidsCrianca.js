// Ficha de Notificação/Investigação — AIDS (pacientes menores de 13 anos) (Sinan NET, SVS 14/06/2006) — Aids_crianca_v5.pdf
import { SIM_NAO_IGN, RACA, ESCOLARIDADE, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 445.7, y: 691, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 52.3, y: 663.0, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 96, y: 663, w: 370, h: 10 },
  ibge_notificacao: pente(0, [487.6, 502.1, 516.6, 531.0, 545.5], 661.5),
  unidade_notificadora: { p: 0, x: 67, y: 634, w: 265, h: 10 },
  cnes: pente(0, [348.3, 362.7, 377.2, 391.6, 406.1, 420.6], 632.5),
  data_primeiros_sintomas: { p: 0, x: 442.8, y: 635, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 68, y: 606, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 446.4, y: 604, w: 113.8, h: 11.9 },
  idade: pente(0, [73.7, 87.3], 574, 9),
  unidade_idade: { p: 0, x: 108.7, y: 582.0, w: 11, h: 10.8 },
  sexo: { p: 0, x: 231.4, y: 589.2, w: 11, h: 10.8 },
  gestante: { p: 0, x: 426.0, y: 589.0, w: 11, h: 11 },
  raca: { p: 0, x: 551.0, y: 588.2, w: 10.8, h: 11 },
  escolaridade: { p: 0, x: 551.5, y: 559.2, w: 11, h: 11 },
  cns: { p: 0, x: 52.8, y: 513.9, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 245, y: 515, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 53.1, y: 486.0, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 486, w: 228, h: 10 },
  ibge_residencia: pente(0, [336.9, 351.4, 365.8, 380.3, 394.8], 484.5),
  distrito: { p: 0, x: 426, y: 485, w: 140, h: 10 },
  bairro: { p: 0, x: 57, y: 461, w: 140, h: 10 },
  logradouro: { p: 0, x: 206, y: 460, w: 270, h: 10 },
  logradouro_codigo: pente(0, [490.7, 505.1, 519.5, 533.9, 548.3], 458.5),
  numero: { p: 0, x: 57, y: 436, w: 54, h: 10 },
  complemento: { p: 0, x: 121, y: 436, w: 290, h: 10 },
  geo1: { p: 0, x: 422, y: 436, w: 140, h: 10 },
  geo2: { p: 0, x: 57, y: 411, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 228, y: 411, w: 218, h: 10 },
  cep: { p: 0, x: 454.7, y: 408.7, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 53.6, y: 384.5, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 332.4, y: 396.5, w: 10.8, h: 10.8 },
  pais: { p: 0, x: 367, y: 385, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const LAB = [['1', 'Positivo/reagente'], ['2', 'Negativo/não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado'], ['5', 'Indeterminado'], ['6', 'Detectável'], ['7', 'Indetectável'], ['9', 'Ignorado']]
const transfusao = (d) => d.sang_transfusao === '1' || d.sang_acidente === '1'
const coletou = (k) => (d) => !!d[k] && d[k] !== '4'

// [chave, rótulo, x, y] — caixas 12,2 × 12,2 da página 2
const LEVE = [['parotida', 'Aumento crônico de parótida', 61.9, 628.1], ['dermatite', 'Dermatite persistente', 61.9, 612.0], ['esplenomegalia', 'Esplenomegalia', 61.9, 595.7],
  ['hepatomegalia', 'Hepatomegalia', 317.8, 630.0], ['vas', 'Infecções persistentes ou recorrentes de VAS (otite ou sinusite)', 317.8, 611.8], ['linfadenopatia', 'Linfadenopatia ≥ 0,5 cm em mais de 2 sítios', 317.8, 594.7]]
const GRAVE = [['anemia', 'Anemia por mais de 30 dias', 61.2, 563.5], ['candidose_esofago', 'Candidose de esôfago', 61.2, 547.2], ['candidose_traqueia', 'Candidose de traqueia, brônquios ou pulmões', 61.9, 532.8],
  ['candidose_oral', 'Candidose oral resistente ao tratamento', 61.2, 516.5], ['citomegalovirose', 'Citomegalovirose (qualquer local que não fígado, baço ou linfonodo) > 1 mês de idade', 61.2, 500.2],
  ['criptococose', 'Criptococose extrapulmonar', 61.2, 483.8], ['criptosporidiose', 'Criptosporidiose com diarreia > 1 mês', 61.2, 467.5], ['diarreia', 'Diarreia recorrente ou crônica', 61.2, 451.9],
  ['encefalopatia', 'Encefalopatia pelo HIV', 61.2, 435.6], ['febre', 'Febre persistente > 1 mês', 61.2, 419.0], ['gengivo', 'Gengivo-estomatite herpética recorrente (mais de 2 episódios em 1 ano)', 61.2, 403.0],
  ['hepatite', 'Hepatite por HIV', 61.2, 386.6], ['herpes_bronquios', 'Herpes simples em brônquios, pulmões ou trato gastrintestinal', 61.2, 370.8],
  ['herpes_mucocutaneo', 'Herpes simples mucocutâneo > 1 mês em crianças > 1 mês de idade', 61.2, 354.5], ['herpes_zoster', 'Herpes zoster (ao menos 2 episódios distintos ou em mais de um dermátomo)', 61.2, 338.2],
  ['histoplasmose', 'Histoplasmose disseminada', 61.2, 321.8], ['infec_bacterianas', 'Infecções bacterianas de repetição/múltiplas (sepse, pneumonia, meningite, osteoartrites, abscessos em órgãos internos)', 61.2, 305.8],
  ['cmv_neonatal', 'Infecção por citomegalovírus < 1 mês de idade', 61.2, 289.4], ['isosporidiose', 'Isosporidiose intestinal crônica, por período superior a 1 mês', 61.2, 274.1],
  ['leiomiossarcoma', 'Leiomiossarcoma', 61.2, 259.4], ['leucoencefalopatia', 'Leucoencefalopatia multifocal progressiva', 61.2, 242.9],
  ['linfopenia', 'Linfopenia por mais de 30 dias', 317.0, 561.8], ['linfoma_nh', 'Linfoma não Hodgkin e outros linfomas', 317.0, 545.3], ['linfoma_cerebro', 'Linfoma primário de cérebro', 317.0, 529.7],
  ['miocardiopatia', 'Miocardiopatia', 317.0, 512.6], ['micobacteriose', 'Micobacteriose disseminada (exceto tuberculose e hanseníase)', 317.0, 496.3],
  ['meningite', 'Meningite bacteriana, pneumonia ou sepse (único episódio)', 317.0, 480.5], ['nefropatia', 'Nefropatia', 317.0, 464.2], ['nocardiose', 'Nocardiose', 316.6, 448.3],
  ['pneumonia_linfoide', 'Pneumonia linfoide intersticial', 317.0, 431.8], ['pneumocistose', 'Pneumonia por Pneumocystis carinii', 317.0, 415.4],
  ['salmonelose', 'Salmonelose (sepse recorrente não tifoide)', 317.0, 399.6], ['kaposi', 'Sarcoma de Kaposi', 317.0, 383.3], ['emaciacao', 'Síndrome da emaciação (Aids Wasting Syndrome)', 317.0, 367.0],
  ['toxo_cerebral', 'Toxoplasmose cerebral em crianças com mais de 1 mês de idade', 316.3, 350.6], ['toxo_precoce', 'Toxoplasmose iniciada antes de 1 mês de idade', 317.0, 335.8],
  ['trombocitopenia', 'Trombocitopenia por mais de 30 dias', 316.8, 319.0], ['tb_pulmonar', 'Tuberculose pulmonar', 316.6, 300.7], ['tb_disseminada', 'Tuberculose disseminada ou extrapulmonar', 316.6, 283.7],
  ['varicela', 'Varicela disseminada', 317.0, 266.2]]
const CD4 = [['cd4_1500', 'CD4 < 1.500 células/mm³ (< 25%)', 63.4, 216.5], ['cd4_1000', 'CD4 < 1.000 células/mm³ (< 25%)', 63.4, 201.8], ['cd4_500', 'CD4 < 500 células/mm³ (< 25%)', 314.4, 217.4]]

export default {
  id: 'AIDS_CRIANCA',
  titulo: 'Ficha de Notificação/Investigação — AIDS (menores de 13 anos)',
  arquivo: 'Aids_crianca_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g, { rotulo7: 'Data do diagnóstico' }),
    {
      titulo: 'Antecedentes epidemiológicos da mãe',
      campos: [
        { n: '31', chave: 'idade_mae', rotulo: 'Idade da mãe (anos)', tipo: 'digitos', digitos: 2, caixa: pente(0, [81.3], 335.5, 10, 12.1), larg: 2 },
        cod('32', 'escolaridade_mae', 'Escolaridade da mãe', ESCOLARIDADE, cx(0, 421.0, 351.4, 10.8, 10.8), { larg: 5 }),
        cod('33', 'raca_mae', 'Raça/cor da mãe', RACA, cx(0, 553.2, 351.4, 11, 10.8)),
        { n: '34', chave: 'ocupacao_mae', rotulo: 'Ocupação da mãe', tipo: 'texto', caixa: { p: 0, x: 66, y: 307, w: 405, h: 10 }, larg: 12 },
      ],
    },
    {
      titulo: 'Provável modo de transmissão',
      aviso: 'Campo 35 (Tipo de investigação) já vem impresso: 2 - Aids em menores de 13 anos.',
      campos: [
        sni('36', 'transmissao_vertical', 'Transmissão vertical', cx(0, 147.6, 250.1, 10.8, 11), {}),
        cod('37', 'transmissao_sexual', 'Transmissão sexual', [['1', 'Relações sexuais com homens'], ['2', 'Relações sexuais com mulheres'], ['3', 'Relações sexuais com homens e mulheres'], ['4', 'Não foi transmissão sexual'], ['9', 'Ignorado']], cx(0, 313.0, 254.2), { larg: 4 }),
        sni('38', 'sang_drogas', 'Sanguínea: uso de drogas injetáveis', cx(0, 442.1, 260.9), {}),
        sni('38', 'sang_hemofilia', 'Sanguínea: tratamento/hemotransfusão para hemofilia', cx(0, 441.6, 229.0), {}),
        sni('38', 'sang_transfusao', 'Sanguínea: transfusão sanguínea', cx(0, 553.7, 260.9), {}),
        sni('38', 'sang_acidente', 'Sanguínea: acidente com material biológico com posterior soroconversão até 6 meses', cx(0, 553.9, 233.3), {}),
        { n: '39', chave: 'data_transfusao', rotulo: 'Data da transfusão/acidente', tipo: 'data', caixa: { p: 0, x: 63.2, y: 177.4, w: 109.2, h: 10.3 }, larg: 3, quando: transfusao },
        { n: '40', chave: 'uf_transfusao', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 179, y: 177, w: 26, h: 9 }, larg: 1, quando: transfusao },
        { n: '41', chave: 'municipio_transfusao', rotulo: 'Município onde ocorreu a transfusão/acidente', tipo: 'texto', caixa: { p: 0, x: 218, y: 178, w: 262, h: 9 }, larg: 4, quando: transfusao },
        { n: '41', chave: 'ibge_transfusao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [494.4, 508.8, 523.3, 537.7, 552.2], 175.5), larg: 2, quando: transfusao },
        { n: '42', chave: 'instituicao_transfusao', rotulo: 'Instituição onde ocorreu a transfusão/acidente', tipo: 'texto', linhas: [143.5, 135.5].map((y) => ({ p: 0, x: 62, y, w: 84, h: 7 })), fonte: 6, larg: 6, quando: transfusao },
        { n: '42', chave: 'cnes_transfusao', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [160.0, 174.4, 188.9, 203.4, 217.8, 232.3], 135.5), larg: 2, quando: transfusao },
        cod('43', 'transfusao_causa', 'A transfusão/acidente foi considerada causa da infecção pelo HIV?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Não se aplica']], cx(0, 547.2, 142.1, 11, 9.8), { larg: 4, quando: transfusao }),
      ],
    },
    {
      titulo: 'Dados do laboratório — evidência laboratorial de infecção pelo HIV',
      campos: [
        cod('44', 'lab_an1', 'Antes dos 18 meses: 1º teste de detecção de ácido nucleico', LAB, cx(1, 63.8, 760.1, 12.2, 12.2), { larg: 4 }),
        { n: '44', chave: 'lab_an1_data', rotulo: '1º teste: data da coleta', tipo: 'data', caixa: { p: 1, x: 191.0, y: 754.4, w: 109.2, h: 10.3 }, larg: 2, quando: coletou('lab_an1') },
        cod('44', 'lab_an2', 'Antes dos 18 meses: 2º teste de detecção de ácido nucleico', LAB, cx(1, 63.8, 735.1, 12.2, 12.2), { larg: 4 }),
        { n: '44', chave: 'lab_an2_data', rotulo: '2º teste: data da coleta', tipo: 'data', caixa: { p: 1, x: 190.2, y: 726.6, w: 109.2, h: 10.3 }, larg: 2, quando: coletou('lab_an2') },
        cod('44', 'lab_an3', 'Antes dos 18 meses: 3º teste de detecção de ácido nucleico', LAB, cx(1, 64.3, 707.0, 12.2, 12.2), { larg: 4 }),
        { n: '44', chave: 'lab_an3_data', rotulo: '3º teste: data da coleta', tipo: 'data', caixa: { p: 1, x: 191.8, y: 697.4, w: 109.2, h: 10.3 }, larg: 2, quando: coletou('lab_an3') },
        cod('44', 'lab_triagem', 'Após os 18 meses: teste de triagem anti-HIV', LAB, cx(1, 326.2, 761.8, 12.5, 12.2), { larg: 4 }),
        { n: '44', chave: 'lab_triagem_data', rotulo: 'Triagem: data da coleta', tipo: 'data', caixa: { p: 1, x: 449.0, y: 754.4, w: 109.1, h: 10.3 }, larg: 2, quando: coletou('lab_triagem') },
        cod('44', 'lab_confirmatorio', 'Após os 18 meses: teste confirmatório anti-HIV', LAB, cx(1, 326.2, 734.6, 12.2, 12.2), { larg: 4 }),
        { n: '44', chave: 'lab_confirmatorio_data', rotulo: 'Confirmatório: data da coleta', tipo: 'data', caixa: { p: 1, x: 449.0, y: 726.0, w: 109.1, h: 10.3 }, larg: 2, quando: coletou('lab_confirmatorio') },
        cod('44', 'lab_rapido1', 'Após os 18 meses: teste rápido 1', LAB, cx(1, 326.4, 712.1, 12.2, 12.2), { larg: 3 }),
        cod('44', 'lab_rapido2', 'Após os 18 meses: teste rápido 2', LAB, cx(1, 387.1, 711.6, 12.2, 12.2), { larg: 3 }),
        cod('44', 'lab_rapido3', 'Após os 18 meses: teste rápido 3', LAB, cx(1, 325.4, 688.3, 12.2, 12.2), { larg: 3 }),
        { n: '44', chave: 'lab_rapido_data', rotulo: 'Testes rápidos: data da coleta', tipo: 'data', caixa: { p: 1, x: 448.9, y: 683.4, w: 109.3, h: 10.3 }, larg: 3, quando: (d) => !!(d.lab_rapido1 || d.lab_rapido2 || d.lab_rapido3) },
      ],
    },
    {
      titulo: 'Critério CDC adaptado (45) e critério óbito (46)',
      campos: [
        ...LEVE.map(([k, r, x, y]) => sni('45', `cdc_${k}`, `Caráter leve: ${r}`, cx(1, x, y, 12.2, 12.2), { larg: 4 })),
        ...GRAVE.map(([k, r, x, y]) => sni('45', `cdc_${k}`, `Moderado/grave: ${r}`, cx(1, x, y, 12.2, 12.2), { larg: 4 })),
        ...CD4.map(([k, r, x, y]) => sni('45', `cdc_${k}`, `Achado laboratorial: ${r}`, cx(1, x, y, 12.2, 12.2), { larg: 4 })),
        sni('46', 'criterio_obito', 'Critério óbito (declaração de óbito com menção de aids/HIV, sem classificação por outro critério)', cx(1, 503.8, 171.8, 12.2, 12.7), { larg: 6 }),
      ],
    },
    {
      titulo: 'Tratamento e evolução',
      campos: [
        { n: '47', chave: 'uf_tratamento', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 52, y: 124, w: 26, h: 9 }, larg: 1 },
        { n: '48', chave: 'municipio_tratamento', rotulo: 'Município onde se realiza o tratamento', tipo: 'texto', caixa: { p: 1, x: 90, y: 124, w: 138, h: 8 }, fonte: 7, larg: 3 },
        { n: '48', chave: 'ibge_tratamento', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [236.4, 250.8, 265.3, 279.7, 294.2], 120.5), larg: 2 },
        { n: '49', chave: 'unidade_tratamento', rotulo: 'Unidade de saúde onde se realiza o tratamento', tipo: 'texto', caixa: { p: 1, x: 318, y: 124, w: 150, h: 8 }, fonte: 7, larg: 4 },
        { n: '49', chave: 'cnes_tratamento', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [477.9, 492.4, 506.8, 521.3, 535.8, 550.2], 121.5), larg: 2 },
        cod('50', 'evolucao', 'Evolução do caso', [['1', 'Vivo'], ['2', 'Óbito por aids'], ['3', 'Óbito por outras causas'], ['4', 'Transferência para outro município'], ['9', 'Ignorado']], cx(1, 431.8, 108.7), { larg: 4 }),
        { n: '51', chave: 'data_obito', rotulo: 'Data do óbito', tipo: 'data', caixa: { p: 1, x: 455.1, y: 94.8, w: 105.9, h: 10 }, larg: 3, quando: (d) => ['2', '3'].includes(d.evolucao) },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 59, y: 66, w: 220, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 290, y: 66, w: 270, h: 10 }, larg: 6 },
      ],
    },
  ],
}
