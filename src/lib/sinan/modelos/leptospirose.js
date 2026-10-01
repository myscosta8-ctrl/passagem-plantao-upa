// Ficha de Investigação — Leptospirose (Sinan NET, SVS 02/02/2007) — Ficha_Leptospirose.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 448.5, y: 668.2, w: 115.3, h: 12.1 },
  uf_notificacao: { p: 0, x: 56.8, y: 637.6, w: 27, h: 11.9 },
  municipio_notificacao: { p: 0, x: 100, y: 638, w: 380, h: 10 },
  ibge_notificacao: pente(0, [494.3, 508.7, 523.1, 537.5, 551.9], 636),
  unidade_notificadora: { p: 0, x: 71, y: 609, w: 268, h: 10 },
  cnes: pente(0, [352.6, 367.0, 381.4, 395.8, 410.2, 424.6], 608),
  data_primeiros_sintomas: { p: 0, x: 447.2, y: 609.6, w: 115.3, h: 12 },
  nome: { p: 0, x: 72, y: 581, w: 368, h: 10 },
  data_nascimento: { p: 0, x: 451.0, y: 579.1, w: 114.2, h: 12 },
  idade: pente(0, [78.3, 92.1], 549, 9),
  unidade_idade: { p: 0, x: 113.3, y: 556.6, w: 11, h: 11 },
  sexo: { p: 0, x: 235.9, y: 563.8, w: 11, h: 11 },
  gestante: { p: 0, x: 430.6, y: 563.8, w: 10.8, h: 11 },
  raca: { p: 0, x: 555.4, y: 563.0, w: 11, h: 11 },
  escolaridade: { p: 0, x: 555.8, y: 534.0, w: 11, h: 10.8 },
  cns: { p: 0, x: 57.3, y: 488.5, w: 175.3, h: 12.1 },
  nome_mae: { p: 0, x: 249, y: 490, w: 316, h: 10 },
  uf_residencia: { p: 0, x: 56.0, y: 460.0, w: 27, h: 11.9 },
  municipio_residencia: { p: 0, x: 97, y: 460, w: 232, h: 10 },
  ibge_residencia: pente(0, [339.8, 354.2, 368.6, 383.0, 397.4], 459),
  distrito: { p: 0, x: 429, y: 460, w: 136, h: 10 },
  bairro: { p: 0, x: 60, y: 435, w: 140, h: 10 },
  logradouro: { p: 0, x: 209, y: 435, w: 270, h: 10 },
  logradouro_codigo: pente(0, [493.6, 508.0, 522.4, 536.8, 551.2], 433),
  numero: { p: 0, x: 60, y: 411, w: 55, h: 10 },
  complemento: { p: 0, x: 124, y: 411, w: 290, h: 10 },
  geo1: { p: 0, x: 425, y: 411, w: 140, h: 10 },
  geo2: { p: 0, x: 60, y: 386, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 231, y: 386, w: 218, h: 10 },
  cep: { p: 0, x: 457.6, y: 382.7, w: 110.9, h: 11.9 },
  telefone: { p: 0, x: 56.5, y: 358.5, w: 148.1, h: 12.4 },
  zona: { p: 0, x: 335.3, y: 370.3, w: 10.8, h: 11 },
  pais: { p: 0, x: 370, y: 360, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const RES4 = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const POS4 = [['1', 'Positivo'], ['2', 'Negativo'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const MICRO = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Não realizada'], ['9', 'Ignorado']]
const sni = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa, larg: 3, ...extra })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const data = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'data', caixa, larg: 3, ...extra })
const hosp = (d) => d.hospitalizacao === '1'
const naoAut = (d) => d.autoctone && d.autoctone !== '1'

// Situação de risco nos 30 dias (tabela de 4 linhas)
const RISCO = [217.6, 207.5, 197.5, 187.5].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`risco${i}_data`] || !!d[`risco${i}_municipio`]
  return [
    { n: '', chave: `risco${i + 1}_data`, rotulo: `Situação de risco ${i + 1}: data`, tipo: 'texto', caixa: { p: 1, x: 36.4, y, w: 73.3, h: 10 }, fonte: 7, larg: 2, quando: q },
    { n: '', chave: `risco${i + 1}_uf`, rotulo: `Situação de risco ${i + 1}: UF`, tipo: 'uf', caixa: { p: 1, x: 109.7, y, w: 42.6, h: 10 }, fonte: 7, larg: 1, quando: q },
    { n: '', chave: `risco${i + 1}_municipio`, rotulo: `Situação de risco ${i + 1}: município`, tipo: 'texto', caixa: { p: 1, x: 152.3, y, w: 145.4, h: 10 }, fonte: 7, larg: 3, quando: q },
    { n: '', chave: `risco${i + 1}_endereco`, rotulo: `Situação de risco ${i + 1}: endereço`, tipo: 'texto', caixa: { p: 1, x: 297.7, y, w: 154.3, h: 10 }, fonte: 7, larg: 4, quando: q },
    { n: '', chave: `risco${i + 1}_localidade`, rotulo: `Situação de risco ${i + 1}: localidade`, tipo: 'texto', caixa: { p: 1, x: 452.0, y, w: 116.7, h: 10 }, fonte: 7, larg: 2, quando: q },
  ]
})

export default {
  id: 'LEPTOSPIROSE',
  titulo: 'Ficha de Investigação — Leptospirose',
  arquivo: 'Ficha_Leptospirose.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', { p: 0, x: 58.0, y: 308.5, w: 106.6, h: 12.5 }, { obrig: true }),
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 187, y: 310, w: 378, h: 10 }, larg: 9 },
        ...[['agua_lama', 'Água ou lama de enchente', 62.4, 275.3], ['fossa', 'Fossa, caixa de gordura ou esgoto', 62.4, 258.7], ['rio', 'Rio, córrego, lagoa ou represa', 62.4, 242.2], ['terreno', 'Terreno baldio', 62.4, 227.3],
          ['animais', 'Criação de animais', 247.7, 273.8], ['roedores_sinais', 'Local com sinais de roedores', 247.7, 258.0], ['roedores', 'Roedores diretamente', 247.7, 240.7], ['lixo', 'Lixo/entulho', 248.4, 225.8],
          ['caixa_agua', 'Caixa d\'água', 406.8, 273.8], ['plantio', 'Plantio/colheita (lavoura)', 406.8, 259.4], ['graos', 'Armazenamento de grãos/alimentos', 407.5, 245.3], ['outras', 'Outras', 407.5, 229.4]]
          .map(([k, r, x, y]) => sni('33', `risco_${k}`, `Situação de risco: ${r}`, cx(0, x, y), { obrig: true })),
        { n: '33', chave: 'risco_outras_espec', rotulo: 'Outras situações de risco (especificar)', tipo: 'texto', caixa: { p: 0, x: 448, y: 229.5, w: 112, h: 8 }, fonte: 7, larg: 3, quando: (d) => d.risco_outras === '1' },
        sni('34', 'casos_humanos', 'Casos anteriores no local provável de infecção: casos humanos', cx(0, 124.8, 196.3, 12.2, 12.2), { larg: 4, obrig: true }),
        sni('34', 'casos_animais', 'Casos anteriores no local provável de infecção: casos animais', cx(0, 300.2, 195.6, 12.2, 12.2), { larg: 4, obrig: true }),
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        data('35', 'data_atendimento', 'Data de atendimento', { p: 0, x: 61.0, y: 162.6, w: 106.6, h: 12.4 }, { obrig: true }),
        ...[['febre', 'Febre', 184.8, 161.0], ['congestao', 'Congestão conjuntival', 184.6, 146.9], ['ictericia', 'Icterícia', 185.5, 132.0], ['hemorragia_pulmonar', 'Hemorragia pulmonar', 185.5, 117.6],
          ['mialgia', 'Mialgia', 280.1, 159.6], ['panturrilha', 'Dor na panturrilha', 279.8, 146.2], ['insuf_renal', 'Insuficiência renal', 280.1, 132.0], ['outras_hemorragias', 'Outras hemorragias', 280.1, 116.2],
          ['cefaleia', 'Cefaleia', 368.4, 162.7], ['vomito', 'Vômito', 368.4, 148.6], ['respiratorias', 'Alterações respiratórias', 368.4, 132.7], ['meningismo', 'Meningismo', 368.4, 116.2],
          ['prostracao', 'Prostração', 439.7, 162.5], ['diarreia', 'Diarreia', 440.4, 146.9], ['cardiacas', 'Alterações cardíacas', 440.6, 132.0], ['outros', 'Outros', 440.6, 116.9]]
          .map(([k, r, x, y]) => sni('36', `sinal_${k}`, `Sinal/sintoma: ${r}`, cx(0, x, y, 12.2, 12.2), { obrig: true })),
        { n: '36', chave: 'sinal_outros_espec', rotulo: 'Outros sinais (quais?)', tipo: 'texto', caixa: { p: 0, x: 512, y: 117, w: 52, h: 8 }, fonte: 6, larg: 3, quando: (d) => d.sinal_outros === '1' },
      ],
    },
    {
      titulo: 'Atendimento',
      campos: [
        sni('37', 'hospitalizacao', 'Ocorreu hospitalização?', cx(0, 281.3, 89.8), { obrig: true }),
        data('38', 'data_hospitalizacao', 'Data da internação', { p: 0, x: 318.9, y: 81.1, w: 115.5, h: 12 }, { quando: hosp }),
        data('39', 'data_alta', 'Data da alta', { p: 0, x: 449.3, y: 80.4, w: 115.3, h: 12 }, { quando: hosp }),
        { n: '40', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 58.8, y: 56.0, w: 27, h: 11 }, larg: 1, quando: hosp },
        { n: '41', chave: 'municipio_hospital', rotulo: 'Município do hospital', tipo: 'texto', caixa: { p: 0, x: 103, y: 56, w: 355, h: 10 }, larg: 5, quando: hosp },
        { n: '41', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [495.1, 509.5, 523.9, 538.3, 552.7], 54), larg: 3, quando: hosp },
        { n: '42', chave: 'nome_hospital', rotulo: 'Nome do hospital', tipo: 'texto', caixa: { p: 0, x: 72, y: 29, w: 385, h: 10 }, larg: 6, quando: hosp },
        { n: '42', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [476.3, 490.7, 505.1, 519.5, 533.9, 548.3], 27), larg: 3, quando: hosp },
      ],
    },
    {
      titulo: 'Dados do laboratório',
      campos: [
        data('43', 'elisa_data1', 'Sorologia IgM-Elisa: data da coleta da 1ª amostra', { p: 1, x: 65.3, y: 769.2, w: 107.4, h: 12 }),
        cod('44', 'elisa_res1', 'Resultado da 1ª amostra (Elisa)', RES4, cx(1, 297.1, 788.6), { quando: (d) => !!d.elisa_data1 }),
        data('45', 'elisa_data2', 'Sorologia IgM-Elisa: data da coleta da 2ª amostra', { p: 1, x: 317.3, y: 769.9, w: 105.7, h: 12 }),
        cod('46', 'elisa_res2', 'Resultado da 2ª amostra (Elisa)', RES4, cx(1, 549.1, 789.4), { quando: (d) => !!d.elisa_data2 }),
        data('47', 'micro_data1', 'Microaglutinação: data da coleta da 1ª amostra', { p: 1, x: 67.6, y: 715.9, w: 105.6, h: 12 }),
        { n: '48', chave: 'micro1_sorovar1', rotulo: 'Micro 1ª amostra: 1º sorovar', tipo: 'texto', caixa: cx(1, 217.7, 718.3), larg: 2, quando: (d) => !!d.micro_data1 },
        { n: '48', chave: 'micro1_titulo1', rotulo: 'Micro 1ª amostra: título do 1º sorovar (1:___)', tipo: 'digitos', digitos: 4, caixa: { p: 1, x: 292.1, y: 716, w: 69.6, h: 10 }, larg: 2, quando: (d) => !!d.micro_data1 },
        { n: '49', chave: 'micro1_sorovar2', rotulo: 'Micro 1ª amostra: 2º sorovar', tipo: 'texto', caixa: cx(1, 411.1, 716.6), larg: 2, quando: (d) => !!d.micro_data1 },
        { n: '49', chave: 'micro1_titulo2', rotulo: 'Micro 1ª amostra: título do 2º sorovar (1:___)', tipo: 'digitos', digitos: 4, caixa: { p: 1, x: 485.6, y: 714.5, w: 69.6, h: 10 }, larg: 2, quando: (d) => !!d.micro_data1 },
        cod('50', 'micro_res1', 'Resultado da microaglutinação (1ª amostra)', MICRO, cx(1, 539.5, 690.5)),
        data('51', 'micro_data2', 'Microaglutinação: data da coleta da 2ª amostra', { p: 1, x: 66.0, y: 640.9, w: 105.7, h: 12 }),
        { n: '52', chave: 'micro2_sorovar1', rotulo: 'Micro 2ª amostra: 1º sorovar', tipo: 'texto', caixa: cx(1, 216.0, 643.2), larg: 2, quando: (d) => !!d.micro_data2 },
        { n: '52', chave: 'micro2_titulo1', rotulo: 'Micro 2ª amostra: título do 1º sorovar (1:___)', tipo: 'digitos', digitos: 4, caixa: { p: 1, x: 290.6, y: 641, w: 69.6, h: 10 }, larg: 2, quando: (d) => !!d.micro_data2 },
        { n: '53', chave: 'micro2_sorovar2', rotulo: 'Micro 2ª amostra: 2º sorovar', tipo: 'texto', caixa: cx(1, 409.7, 641.8), larg: 2, quando: (d) => !!d.micro_data2 },
        { n: '53', chave: 'micro2_titulo2', rotulo: 'Micro 2ª amostra: título do 2º sorovar (1:___)', tipo: 'digitos', digitos: 4, caixa: { p: 1, x: 484.1, y: 639.5, w: 69.6, h: 10 }, larg: 2, quando: (d) => !!d.micro_data2 },
        cod('54', 'micro_res2', 'Resultado da microaglutinação (2ª amostra)', MICRO, cx(1, 537.8, 615.6)),
        data('55', 'isolamento_data', 'Isolamento: data da coleta', { p: 1, x: 66.0, y: 555.5, w: 105.7, h: 12.1 }),
        cod('56', 'isolamento_res', 'Resultado do isolamento', POS4, cx(1, 548.6, 569.8)),
        data('57', 'imuno_data', 'Imunohistoquímica: data da coleta', { p: 1, x: 66.0, y: 513.0, w: 105.7, h: 12 }),
        cod('58', 'imuno_res', 'Resultado da imunohistoquímica', POS4, cx(1, 547.4, 525.1, 12.7, 13)),
        data('59', 'rtpcr_data', 'RT-PCR: data da coleta', { p: 1, x: 64.5, y: 471.4, w: 106.6, h: 12 }),
        cod('60', 'rtpcr_res', 'Resultado do RT-PCR', POS4, cx(1, 546.5, 488.4, 13.7, 12.2)),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('61', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 326.9, 446.2, 11, 11.8)),
        cod('62', 'criterio', 'Critério de confirmação ou descarte', [['1', 'Clínico-laboratorial'], ['2', 'Clínico-epidemiológico']], cx(1, 550.6, 448.3, 11, 11.8)),
        cod('63', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(1, 307.0, 404.9), { larg: 4 }),
        { n: '64', chave: 'infeccao_uf', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 346.6, y: 394.2, w: 27, h: 9.1 }, larg: 1, quando: naoAut },
        { n: '65', chave: 'infeccao_pais', rotulo: 'País', tipo: 'texto', caixa: { p: 1, x: 385, y: 395, w: 180, h: 10 }, larg: 3, quando: naoAut },
        { n: '66', chave: 'infeccao_municipio', rotulo: 'Município', tipo: 'texto', caixa: { p: 1, x: 64, y: 365, w: 145, h: 10 }, larg: 3, quando: naoAut },
        { n: '66', chave: 'infeccao_ibge', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [224.3, 238.7, 253.1, 267.5, 281.9], 362), larg: 2, quando: naoAut },
        { n: '67', chave: 'infeccao_distrito', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 1, x: 305, y: 365, w: 140, h: 10 }, larg: 2 },
        { n: '68', chave: 'infeccao_bairro', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 1, x: 452, y: 365, w: 113, h: 10 }, larg: 2 },
        cod('69', 'area_infeccao', 'Área provável de infecção', [['1', 'Urbana'], ['2', 'Rural'], ['3', 'Periurbana'], ['9', 'Ignorado']], cx(1, 290.2, 337.2)),
        cod('70', 'ambiente_infeccao', 'Ambiente da infecção', [['1', 'Domiciliar'], ['2', 'Trabalho'], ['3', 'Lazer'], ['4', 'Outro'], ['9', 'Ignorado']], cx(1, 550.3, 346.3)),
        sni('71', 'relacionada_trabalho', 'Doença relacionada ao trabalho', cx(1, 227.0, 312.5)),
        cod('72', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito por leptospirose'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 544.8, 311.5)),
        data('73', 'data_obito', 'Data do óbito', { p: 1, x: 72.4, y: 274.2, w: 115.3, h: 12 }, { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('74', 'data_encerramento', 'Data do encerramento', { p: 1, x: 206.0, y: 274.2, w: 115.3, h: 12 }),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      campos: [
        ...RISCO,
        { n: '', chave: 'observacoes', rotulo: 'Observações', tipo: 'texto_longo', linhas: [158.2, 145.0, 131.7, 118.5].map((y) => ({ p: 1, x: 35.3, y, w: 534.5, h: 13.3 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 66, y: 97, w: 390, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [474.2, 488.6, 503.0, 517.4, 531.8, 546.3], 93), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 66, y: 66, w: 190, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 262, y: 66, w: 200, h: 10 }, larg: 6 },
      ],
    },
  ],
}
