// Ficha de Investigação — Gestante HIV+ (Sinan NET, SVS 17/07/2006) — Gestante_HIV_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 438.2, y: 707, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 46.5, y: 676.5, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 90, y: 677, w: 370, h: 10 },
  ibge_notificacao: pente(0, [481.7, 496.2, 510.6, 525.1, 539.5], 674.5),
  unidade_notificadora: { p: 0, x: 61, y: 647, w: 265, h: 10 },
  cnes: pente(0, [342.3, 356.8, 371.2, 385.7, 400.2, 414.6], 646.5),
  data_primeiros_sintomas: { p: 0, x: 437.0, y: 648, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 62, y: 619, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 440.6, y: 618, w: 113.8, h: 11.9 },
  idade: pente(0, [67.9, 81.5], 588, 9),
  unidade_idade: { p: 0, x: 103.0, y: 595.4, w: 11, h: 11 },
  sexo: { p: 0, x: 225.6, y: 602.6, w: 11, h: 11 },
  gestante: { p: 0, x: 420.2, y: 602.6, w: 10.8, h: 10.8 },
  raca: { p: 0, x: 545.0, y: 601.9, w: 11, h: 10.8 },
  escolaridade: { p: 0, x: 545.8, y: 572.6, w: 10.8, h: 11 },
  cns: { p: 0, x: 47.0, y: 527.4, w: 175.3, h: 11.9 },
  nome_mae: { p: 0, x: 239, y: 528, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 47.9, y: 498.8, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 86, y: 499, w: 228, h: 10 },
  ibge_residencia: pente(0, [331.6, 346.1, 360.6, 375.0, 389.5], 497.5),
  distrito: { p: 0, x: 421, y: 498, w: 140, h: 10 },
  bairro: { p: 0, x: 52, y: 473, w: 140, h: 10 },
  logradouro: { p: 0, x: 201, y: 473, w: 270, h: 10 },
  logradouro_codigo: pente(0, [485.4, 499.8, 514.2, 528.6, 543.0], 471.5),
  numero: { p: 0, x: 52, y: 449, w: 54, h: 10 },
  complemento: { p: 0, x: 116, y: 449, w: 290, h: 10 },
  geo1: { p: 0, x: 417, y: 449, w: 140, h: 10 },
  geo2: { p: 0, x: 52, y: 424, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 223, y: 424, w: 218, h: 10 },
  cep: { p: 0, x: 449.4, y: 421.4, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 48.3, y: 397.2, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 327.1, y: 409.2, w: 10.8, h: 10.8 },
  pais: { p: 0, x: 362, y: 397, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const fezPreNatal = (d) => d.pre_natal === '1'
const usouArv = (d) => d.arv_profilaxia === '1'

export default {
  id: 'GESTANTE_HIV',
  titulo: 'Ficha de Investigação — Gestante HIV+',
  arquivo: 'Gestante_HIV_v5.pdf',
  // A ficha só admite sexo feminino (impresso "F - Feminino").
  inicializar: (d) => ({ ...d, sexo: 'F' }),
  secoes: [
    ...cabecalhoInvestigacao(g, { rotulo7: 'Data do diagnóstico' }),
    {
      titulo: 'Antecedentes epidemiológicos da mãe/HIV',
      campos: [
        { n: '31', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 52, y: 345, w: 175, h: 10 }, larg: 6 },
        cod('32', 'evidencia_lab', 'Evidência laboratorial do HIV', [['1', 'Antes do pré-natal'], ['2', 'Durante o pré-natal'], ['3', 'Durante o parto'], ['4', 'Após o parto']], cx(0, 545.8, 360.2, 11, 10.8), { larg: 6 }),
      ],
    },
    {
      titulo: 'Pré-natal',
      campos: [
        sni('33', 'pre_natal', 'Fez/faz pré-natal', cx(0, 153.6, 303.1, 10.8, 10.3), {}),
        { n: '34', chave: 'uf_pre_natal', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 176.2, y: 288.0, w: 26.9, h: 11.8 }, larg: 1, quando: fezPreNatal },
        { n: '35', chave: 'municipio_pre_natal', rotulo: 'Município de realização do pré-natal', tipo: 'texto', caixa: { p: 0, x: 210, y: 289, w: 262, h: 10 }, larg: 5, quando: fezPreNatal },
        { n: '35', chave: 'ibge_pre_natal', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [487.6, 502.1, 516.6, 531.0, 545.5], 286.5), larg: 3, quando: fezPreNatal },
        { n: '36', chave: 'unidade_pre_natal', rotulo: 'Unidade de realização do pré-natal', tipo: 'texto', caixa: { p: 0, x: 52, y: 261, w: 400, h: 10 }, larg: 9, quando: fezPreNatal },
        { n: '36', chave: 'cnes_pre_natal', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [474.3, 488.7, 503.2, 517.6, 532.1, 546.6], 259.5), larg: 3, quando: fezPreNatal },
        { n: '37', chave: 'sisprenatal', rotulo: 'Nº da gestante no SISPRENATAL', tipo: 'digitos', digitos: 11, caixa: pente(0, [64.2, 78.7, 93.1, 107.6, 122.1, 136.5, 151.0, 165.4, 179.9, 194.4], 231.5, 11), larg: 4, quando: fezPreNatal },
        sni('38', 'arv_profilaxia', 'Uso de antirretrovirais para profilaxia', cx(0, 362.2, 240.5), { larg: 4 }),
        { n: '39', chave: 'data_inicio_arv', rotulo: 'Data do início do uso de antirretroviral para profilaxia', tipo: 'data', caixa: { p: 0, x: 457.5, y: 234, w: 111, h: 10 }, larg: 4, quando: usouArv },
      ],
    },
    {
      titulo: 'Parto',
      campos: [
        { n: '40', chave: 'uf_parto', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 47.2, y: 183.0, w: 26.9, h: 11.8 }, larg: 1 },
        { n: '41', chave: 'municipio_parto', rotulo: 'Município do local do parto', tipo: 'texto', caixa: { p: 0, x: 84, y: 184, w: 390, h: 10 }, larg: 5 },
        { n: '41', chave: 'ibge_parto', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [489.2, 503.7, 518.1, 532.6, 547.0], 181.5), larg: 3 },
        { n: '42', chave: 'local_parto', rotulo: 'Local de realização do parto', tipo: 'texto', caixa: { p: 0, x: 52, y: 156, w: 400, h: 10 }, larg: 9 },
        { n: '42', chave: 'cnes_parto', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [474.3, 488.7, 503.2, 517.6, 532.1, 546.6], 154.5), larg: 3 },
        { n: '43', chave: 'data_parto', rotulo: 'Data do parto', tipo: 'data', caixa: { p: 0, x: 61, y: 133, w: 115.5, h: 9 }, larg: 3 },
        cod('44', 'tipo_parto', 'Tipo de parto', [['1', 'Vaginal'], ['2', 'Cesárea eletiva'], ['3', 'Cesárea de urgência'], ['4', 'Não se aplica']], cx(0, 525.1, 144.0, 11, 10.6), { larg: 4 }),
        sni('45', 'arv_parto', 'Fez uso de profilaxia antirretroviral durante o parto', cx(0, 241.4, 116.4, 10.8, 10.6), { larg: 4 }),
        cod('46', 'evolucao_gravidez', 'Evolução da gravidez', [['1', 'Nascido vivo'], ['2', 'Natimorto'], ['3', 'Aborto'], ['4', 'Não se aplica']], cx(0, 526.8, 117.8, 11, 10.6), { larg: 4 }),
        cod('47', 'arv_crianca', 'Início da profilaxia antirretroviral na criança (horas)', [['1', 'Nas primeiras 24 h do nascimento'], ['2', 'Após 24 h do nascimento'], ['3', 'Não se aplica'], ['4', 'Não realizado'], ['9', 'Ignorado']], cx(0, 526.3, 89.8, 11, 10.6), { larg: 6, quando: (d) => d.evolucao_gravidez === '1' }),
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 0, x: 52, y: 45, w: 400, h: 10 }, larg: 9 },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(0, [472.8, 487.3, 501.7, 516.2, 530.7, 545.1], 41.5), larg: 3, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 0, x: 52, y: 22, w: 190, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 0, x: 252, y: 22, w: 200, h: 10 }, larg: 6 },
      ],
    },
  ],
}
