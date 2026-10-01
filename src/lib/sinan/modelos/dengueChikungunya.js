// Ficha de Investigação — Dengue e Febre de Chikungunya (Sinan Online, SVS 14/03/2016) — Ficha_DENGCHIK_FINAL.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const D = (x, y) => ({ p: 0, x, y, w: 116.6, h: 10 }) // pente de data (8 dígitos) a partir do 1º traço
const g = {
  data_notificacao: D(446.0, 649),
  uf_notificacao: { p: 0, x: 52.5, y: 619.5, w: 27, h: 11.8 },
  municipio_notificacao: { p: 0, x: 98, y: 621, w: 380, h: 10 },
  ibge_notificacao: pente(0, [490.3, 505.2, 520.1, 534.9, 549.8], 619.5),
  unidade_notificadora: { p: 0, x: 69, y: 591, w: 268, h: 10 },
  cnes: pente(0, [350.9, 365.8, 380.6, 395.5, 410.4, 425.3], 591.5),
  data_primeiros_sintomas: D(443.1, 592),
  nome: { p: 0, x: 62, y: 562, w: 372, h: 10 },
  data_nascimento: { p: 0, x: 444.2, y: 561.6, w: 114.6, h: 12.2 },
  idade: pente(0, [72.0, 86.1], 531, 9),
  unidade_idade: { p: 0, x: 106.8, y: 539.3, w: 10.8, h: 11 },
  sexo: { p: 0, x: 229.2, y: 546.5, w: 11, h: 11 },
  gestante: { p: 0, x: 423.8, y: 546.5, w: 11, h: 11 },
  raca: { p: 0, x: 548.9, y: 545.8, w: 11, h: 11 },
  escolaridade: { p: 0, x: 549.1, y: 516.7, w: 11.3, h: 11 },
  cns: { p: 0, x: 50.6, y: 471.4, w: 175.4, h: 12 },
  nome_mae: { p: 0, x: 242, y: 472, w: 323, h: 10 },
  uf_residencia: { p: 0, x: 51.6, y: 442.1, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 441, w: 236, h: 10 },
  ibge_residencia: pente(0, [335.8, 350.6, 365.5, 380.4, 395.3], 440.5),
  distrito: { p: 0, x: 424, y: 441, w: 141, h: 10 },
  bairro: { p: 0, x: 56, y: 416, w: 140, h: 10 },
  logradouro: { p: 0, x: 204, y: 416, w: 270, h: 10 },
  logradouro_codigo: pente(0, [489.6, 504.5, 519.4, 534.2, 549.1], 414.5),
  numero: { p: 0, x: 56, y: 392, w: 54, h: 10 },
  complemento: { p: 0, x: 120, y: 392, w: 290, h: 10 },
  geo1: { p: 0, x: 421, y: 392, w: 144, h: 10 },
  geo2: { p: 0, x: 56, y: 367, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 226, y: 367, w: 218, h: 10 },
  cep: { p: 0, x: 453.1, y: 364.6, w: 110.9, h: 12 },
  telefone: { p: 0, x: 52.1, y: 340.3, w: 148.1, h: 12.5 },
  zona: { p: 0, x: 330.7, y: 352.3, w: 11, h: 11 },
  pais: { p: 0, x: 366, y: 342, w: 199, h: 10 },
}

const cx = (p, x, y) => ({ p, x, y, w: 12.7, h: 12.7 })
const SN = [['1', 'Sim'], ['2', 'Não']]
const sn = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: SN, caixa, larg: 2, ...extra })
const RES4 = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const POS4 = [['1', 'Positivo'], ['2', 'Negativo'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const alarme = (d) => d.classificacao === '11'
const grave = (d) => d.classificacao === '12'
const hosp = (d) => d.hospitalizacao === '1'
const naoAutoctone = (d) => d.autoctone && d.autoctone !== '1'

export default {
  id: 'DENGUE_CHIKUNGUNYA',
  titulo: 'Ficha de Investigação — Dengue e Febre de Chikungunya',
  arquivo: 'Ficha_DENGCHIK_FINAL.pdf',
  // Uma ficha só para as duas doenças: o campo 2 (1 - Dengue / 2 - Chikungunya) vem do CID do diagnóstico, quando houver; senão o profissional escolhe.
  inicializar: (dados, agravo) => {
    const c = String(agravo?.cidDiagnostico || '').toUpperCase().replace('.', '')
    return { ...dados, agravo_codigo: dados.agravo_codigo || (c.startsWith('A920') ? '2' : /^A9[01]/.test(c) ? '1' : '') }
  },
  secoes: [
    {
      titulo: 'Agravo',
      campos: [
        { n: '2', chave: 'agravo_codigo', rotulo: 'Agravo/doença', tipo: 'codigo', opcoes: [['1', 'Dengue'], ['2', 'Chikungunya']], caixa: { p: 0, x: 346.6, y: 659.8, w: 11, h: 10.8 }, larg: 4 },
      ],
    },
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Dados clínicos e laboratoriais',
      campos: [
        { n: '31', chave: 'data_investigacao', rotulo: 'Data da investigação', tipo: 'data', caixa: { p: 0, x: 61.7, y: 292.8, w: 109.4, h: 10.5 }, larg: 3 },
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 192, y: 293, w: 373, h: 10 }, larg: 9 },
        ...[['febre', 'Febre', 55.0, 259.2], ['mialgia', 'Mialgia', 55.0, 244.1], ['cefaleia', 'Cefaleia', 100.8, 259.9], ['exantema', 'Exantema', 100.8, 244.8],
          ['vomito', 'Vômito', 158.6, 259.0], ['nauseas', 'Náuseas', 158.6, 244.1], ['dor_costas', 'Dor nas costas', 215.5, 258.2], ['conjuntivite', 'Conjuntivite', 215.5, 243.4],
          ['artrite', 'Artrite', 298.8, 260.6], ['artralgia', 'Artralgia intensa', 298.8, 245.5], ['petequias', 'Petéquias', 386.4, 262.1], ['leucopenia', 'Leucopenia', 386.4, 247.0],
          ['prova_laco', 'Prova do laço positiva', 470.4, 262.1], ['dor_retroorbital', 'Dor retroorbital', 470.4, 244.1]]
          .map(([k, r, x, y]) => sn('33', `sinal_${k}`, `Sinal clínico: ${r}`, cx(0, x, y), {})),
        ...[['diabetes', 'Diabetes', 54.2, 207.4], ['hematologicas', 'Doenças hematológicas', 54.2, 191.5], ['hepatopatias', 'Hepatopatias', 189.4, 209.0], ['renal', 'Doença renal crônica', 188.6, 193.2],
          ['hipertensao', 'Hipertensão arterial', 311.5, 209.5], ['acido_peptica', 'Doença ácido-péptica', 310.8, 194.6], ['autoimunes', 'Doenças autoimunes', 424.1, 210.2]]
          .map(([k, r, x, y]) => sn('34', `doenca_${k}`, `Doença pré-existente: ${r}`, cx(0, x, y), {})),
        { n: '35', chave: 'chik_data_s1', rotulo: 'Sorologia IgM Chikungunya — data da coleta da 1ª amostra (S1)', tipo: 'data', caixa: { p: 0, x: 53.3, y: 142, w: 116.6, h: 10 }, larg: 4 },
        { n: '36', chave: 'chik_data_s2', rotulo: 'Sorologia IgM Chikungunya — data da coleta da 2ª amostra (S2)', tipo: 'data', caixa: { p: 0, x: 178.6, y: 142, w: 116.6, h: 10 }, larg: 4 },
        { n: '37', chave: 'prnt_data', rotulo: 'Exame PRNT — data da coleta', tipo: 'data', caixa: { p: 0, x: 304.6, y: 142, w: 116.6, h: 10 }, larg: 4 },
        { n: '38', chave: 'chik_res_s1', rotulo: 'Resultado S1', tipo: 'codigo', opcoes: RES4, caixa: cx(0, 461.0, 163.7), larg: 4, quando: (d) => !!d.chik_data_s1 },
        { n: '38', chave: 'chik_res_s2', rotulo: 'Resultado S2', tipo: 'codigo', opcoes: RES4, caixa: cx(0, 493.9, 163.7), larg: 4, quando: (d) => !!d.chik_data_s2 },
        { n: '38', chave: 'prnt_res', rotulo: 'Resultado PRNT', tipo: 'codigo', opcoes: RES4, caixa: cx(0, 534.5, 163.0), larg: 4, quando: (d) => !!d.prnt_data },
        { n: '39', chave: 'dengue_igm_data', rotulo: 'Sorologia IgM Dengue — data da coleta', tipo: 'data', caixa: { p: 0, x: 60.0, y: 98, w: 116.6, h: 10 }, larg: 3 },
        { n: '40', chave: 'dengue_igm_res', rotulo: 'Resultado (sorologia IgM Dengue)', tipo: 'codigo', opcoes: POS4, caixa: cx(0, 293.0, 117.1), larg: 3, quando: (d) => !!d.dengue_igm_data },
        { n: '41', chave: 'ns1_data', rotulo: 'Exame NS1 — data da coleta', tipo: 'data', caixa: { p: 0, x: 321.0, y: 98, w: 114.6, h: 10 }, larg: 3 },
        { n: '42', chave: 'ns1_res', rotulo: 'Resultado (NS1)', tipo: 'codigo', opcoes: POS4, caixa: cx(0, 547.2, 119.5), larg: 3, quando: (d) => !!d.ns1_data },
        { n: '43', chave: 'isolamento_data', rotulo: 'Isolamento — data da coleta', tipo: 'data', caixa: { p: 0, x: 52.4, y: 62, w: 115, h: 10 }, larg: 3 },
        { n: '44', chave: 'isolamento_res', rotulo: 'Resultado (isolamento)', tipo: 'codigo', opcoes: POS4, caixa: cx(0, 281.0, 81.1), larg: 3, quando: (d) => !!d.isolamento_data },
        { n: '45', chave: 'rtpcr_data', rotulo: 'RT-PCR — data da coleta', tipo: 'data', caixa: { p: 0, x: 324.0, y: 62, w: 117, h: 10 }, larg: 3 },
        { n: '46', chave: 'rtpcr_res', rotulo: 'Resultado (RT-PCR)', tipo: 'codigo', opcoes: POS4, caixa: cx(0, 547.9, 84.2), larg: 3, quando: (d) => !!d.rtpcr_data },
        { n: '47', chave: 'sorotipo', rotulo: 'Sorotipo', tipo: 'codigo', opcoes: [['1', 'DENV 1'], ['2', 'DENV 2'], ['3', 'DENV 3'], ['4', 'DENV 4']], caixa: cx(0, 147.6, 49.0), larg: 3, quando: (d) => d.isolamento_res === '1' || d.rtpcr_res === '1' },
        { n: '48', chave: 'histopatologia', rotulo: 'Histopatologia', tipo: 'codigo', opcoes: [['1', 'Compatível'], ['2', 'Incompatível'], ['3', 'Inconclusivo'], ['4', 'Não realizado']], caixa: cx(0, 282.5, 47.5), larg: 3 },
        { n: '49', chave: 'imunohistoquimica', rotulo: 'Imunohistoquímica', tipo: 'codigo', opcoes: POS4, caixa: cx(0, 427.9, 48.2), larg: 3 },
      ],
    },
    {
      titulo: 'Hospitalização',
      campos: [
        { n: '50', chave: 'hospitalizacao', rotulo: 'Ocorreu hospitalização?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 165.4, y: 783.6, w: 10.8, h: 10.8 }, larg: 3 },
        { n: '51', chave: 'data_hospitalizacao', rotulo: 'Data da internação', tipo: 'data', caixa: { p: 1, x: 188, y: 779, w: 116.6, h: 10 }, larg: 3, quando: hosp },
        { n: '52', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 313, y: 779, w: 22, h: 10 }, larg: 1, quando: hosp },
        { n: '53', chave: 'municipio_hospital', rotulo: 'Município do hospital', tipo: 'texto', caixa: { p: 1, x: 362, y: 781, w: 110, h: 9 }, fonte: 7.5, larg: 3, quando: hosp },
        { n: '53', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [491.8, 506.6, 521.5, 536.4, 551.3], 780), larg: 2, quando: hosp },
        { n: '54', chave: 'nome_hospital', rotulo: 'Nome do hospital', tipo: 'texto', caixa: { p: 1, x: 60, y: 748, w: 262, h: 10 }, larg: 5, quando: hosp },
        { n: '54', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [340.6, 355.4, 370.3, 385.2, 400.1, 414.9], 746), larg: 3, quando: hosp },
        { n: '55', chave: 'telefone_hospital', rotulo: '(DDD) Telefone do hospital', tipo: 'digitos', digitos: 11, caixa: { p: 1, x: 435.8, y: 746, w: 127.3, h: 10 }, larg: 3, quando: hosp },
      ],
    },
    {
      titulo: 'Local provável de infecção (no período de 15 dias)',
      campos: [
        { n: '56', chave: 'autoctone', rotulo: 'O caso é autóctone do município de residência?', tipo: 'codigo', opcoes: [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], caixa: { p: 1, x: 298.8, y: 710.6, w: 11, h: 11 }, larg: 4 },
        { n: '57', chave: 'infeccao_uf', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 337, y: 701, w: 28, h: 10 }, larg: 1, quando: naoAutoctone },
        { n: '58', chave: 'infeccao_pais', rotulo: 'País', tipo: 'texto', caixa: { p: 1, x: 425, y: 693, w: 140, h: 10 }, larg: 3, quando: naoAutoctone },
        { n: '59', chave: 'infeccao_municipio', rotulo: 'Município', tipo: 'texto', caixa: { p: 1, x: 58, y: 679, w: 145, h: 10 }, larg: 3, quando: naoAutoctone },
        { n: '59', chave: 'infeccao_ibge', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [214.1, 229.0, 243.8, 258.7, 273.6], 676), larg: 2, quando: naoAutoctone },
        { n: '60', chave: 'infeccao_distrito', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 1, x: 305, y: 679, w: 135, h: 10 }, larg: 2 },
        { n: '61', chave: 'infeccao_bairro', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 1, x: 449, y: 679, w: 116, h: 10 }, larg: 2 },
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        { n: '62', chave: 'classificacao', rotulo: 'Classificação', tipo: 'codigo', opcoes: [['5', 'Descartado'], ['10', 'Dengue'], ['11', 'Dengue com sinais de alarme'], ['12', 'Dengue grave'], ['13', 'Chikungunya']], caixa: { p: 1, x: 273.8, y: 657.8, w: 12.5, h: 12.2 }, larg: 4 },
        { n: '63', chave: 'criterio', rotulo: 'Critério de confirmação/descarte', tipo: 'codigo', opcoes: [['1', 'Laboratório'], ['2', 'Clínico-epidemiológico'], ['3', 'Em investigação']], caixa: { p: 1, x: 425.0, y: 655.7, w: 12.5, h: 12.5 }, larg: 4 },
        { n: '64', chave: 'apresentacao_clinica', rotulo: 'Apresentação clínica (Chikungunya)', tipo: 'codigo', opcoes: [['1', 'Aguda'], ['2', 'Crônica']], caixa: { p: 1, x: 467.3, y: 645.1, w: 12.7, h: 13 }, larg: 4, quando: (d) => d.classificacao === '13' },
        { n: '65', chave: 'evolucao', rotulo: 'Evolução do caso', tipo: 'codigo', opcoes: [['1', 'Cura'], ['2', 'Óbito pelo agravo'], ['3', 'Óbito por outras causas'], ['4', 'Óbito em investigação'], ['9', 'Ignorado']], caixa: { p: 1, x: 163.9, y: 619.9, w: 11, h: 11.3 }, larg: 4 },
        { n: '66', chave: 'data_obito', rotulo: 'Data do óbito', tipo: 'data', caixa: { p: 1, x: 309.5, y: 596, w: 112.5, h: 10 }, larg: 4, quando: (d) => ['2', '3', '4'].includes(d.evolucao) },
        { n: '67', chave: 'data_encerramento', rotulo: 'Data do encerramento', tipo: 'data', caixa: { p: 1, x: 445.6, y: 596, w: 114.7, h: 10 }, larg: 4 },
      ],
    },
    {
      titulo: 'Dengue com sinais de alarme (classificação 11)',
      campos: [
        ...[['hipotensao', 'Hipotensão postural e/ou lipotímia', 55.0, 535.7], ['plaquetas', 'Queda abrupta de plaquetas', 55.0, 520.6], ['vomitos', 'Vômitos persistentes', 211.4, 565.2],
          ['dor_abdominal', 'Dor abdominal intensa e contínua', 211.0, 549.4], ['letargia', 'Letargia ou irritabilidade', 210.2, 532.6], ['sangramento', 'Sangramento de mucosa/outras hemorragias', 209.5, 517.7],
          ['hematocrito', 'Aumento progressivo do hematócrito', 343.0, 563.3], ['hepatomegalia', 'Hepatomegalia >= 2 cm', 342.7, 545.8], ['liquidos', 'Acúmulo de líquidos', 342.5, 529.9]]
          .map(([k, r, x, y]) => sn('68', `alarme_${k}`, r, cx(1, x, y), { larg: 3, quando: alarme })),
        { n: '69', chave: 'data_alarme', rotulo: 'Data de início dos sinais de alarme', tipo: 'data', caixa: { p: 1, x: 454.0, y: 516, w: 115.8, h: 10 }, larg: 3, quando: alarme },
      ],
    },
    {
      titulo: 'Dengue grave (classificação 12)',
      campos: [
        ...[['pulso', 'Extravasamento: pulso débil ou indetectável', 56.6, 467.5], ['pa_convergente', 'Extravasamento: PA convergente <= 20 mmHg', 56.4, 450.2], ['enchimento', 'Extravasamento: tempo de enchimento capilar', 55.7, 433.7],
          ['liquidos_resp', 'Extravasamento: acúmulo de líquidos com insuficiência respiratória', 55.7, 418.8], ['taquicardia', 'Extravasamento: taquicardia', 200.4, 465.1], ['extremidades', 'Extravasamento: extremidades frias', 200.4, 450.2],
          ['hipotensao_tardia', 'Extravasamento: hipotensão arterial em fase tardia', 200.4, 433.7], ['hematemese', 'Sangramento grave: hematêmese', 331.4, 482.4], ['melena', 'Sangramento grave: melena', 331.4, 465.1],
          ['metrorragia', 'Sangramento grave: metrorragia volumosa', 426.0, 483.8], ['snc', 'Sangramento grave: sangramento do SNC', 425.8, 465.1], ['ast_alt', 'Órgãos: AST/ALT > 1.000', 330.0, 431.5],
          ['miocardite', 'Órgãos: miocardite', 425.0, 433.0], ['consciencia', 'Órgãos: alteração da consciência', 484.3, 434.4], ['outros_orgaos', 'Órgãos: outros órgãos', 329.8, 413.5]]
          .map(([k, r, x, y]) => sn('70', `grave_${k}`, r, cx(1, x, y), { larg: 3, quando: grave })),
        { n: '70', chave: 'grave_outros_espec', rotulo: 'Outros órgãos (especificar)', tipo: 'texto', caixa: { p: 1, x: 455, y: 414, w: 108, h: 8 }, fonte: 6.5, larg: 6, quando: (d) => grave(d) && d.grave_outros_orgaos === '1' },
        { n: '71', chave: 'data_gravidade', rotulo: 'Data de início dos sinais de gravidade', tipo: 'data', caixa: { p: 1, x: 52.6, y: 371, w: 116.5, h: 10 }, larg: 3, quando: grave },
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      campos: [
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [[304.7, 21.6], [283.1, 21.6], [260.8, 22.2], [239.0, 21.8], [214.9, 24.1], [190.8, 24.1], [167.1, 23.6], [143.0, 24.1], [114.2, 28.8]].map(([y, h]) => ({ p: 1, x: 32, y, w: 535, h })), fonte: 8.5, larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 56, y: 88, w: 395, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Cód. da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [470.9, 485.8, 500.6, 515.5, 530.4, 545.3], 82), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 56, y: 55, w: 190, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 253, y: 55, w: 210, h: 10 }, larg: 6 },
      ],
    },
  ],
}
