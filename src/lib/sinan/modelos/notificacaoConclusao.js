// Ficha de Notificação/Conclusão (Sinan NET, SVS 27/09/2005) — Ficha_conclusao_v5.pdf
// Para agravos sem ficha de investigação própria, quando o caso já pode ser encerrado (classificação, critério, evolução).
import { cabecalhoInvestigacao, pente, dataCel, SIM_NAO_IGN } from './comum'

const g = {
  data_notificacao: { p: 0, x: 446.2, y: 724.2, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 53.2, y: 696.7, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 97, y: 697, w: 370, h: 10 },
  ibge_notificacao: pente(0, [490.7, 505.2, 519.6, 534.1, 548.5], 694.5),
  unidade_notificadora: { p: 0, x: 68, y: 667, w: 265, h: 10 },
  cnes: pente(0, [349.0, 363.4, 377.9, 392.4, 406.8, 421.3], 666.5),
  data_primeiros_sintomas: { p: 0, x: 443.6, y: 668.6, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 68, y: 638, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 446.5, y: 636.6, w: 113.8, h: 11.9 },
  idade: pente(0, [73.8, 87.4], 606, 9),
  unidade_idade: { p: 0, x: 109.0, y: 614.2, w: 10.8, h: 11 },
  sexo: { p: 0, x: 231.6, y: 621.4, w: 10.8, h: 11 },
  gestante: { p: 0, x: 426.0, y: 621.4, w: 11, h: 10.8 },
  raca: { p: 0, x: 551.0, y: 620.6, w: 11, h: 10.8 },
  escolaridade: { p: 0, x: 551.5, y: 591.4, w: 11, h: 11 },
  cns: { p: 0, x: 52.9, y: 546.1, w: 175.3, h: 11.9 },
  nome_mae: { p: 0, x: 245, y: 547, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 53.8, y: 516.0, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 516, w: 228, h: 10 },
  ibge_residencia: pente(0, [337.6, 352.1, 366.6, 381.0, 395.5], 514.5),
  distrito: { p: 0, x: 427, y: 515, w: 140, h: 10 },
  bairro: { p: 0, x: 57, y: 491, w: 140, h: 10 },
  logradouro: { p: 0, x: 207, y: 490, w: 270, h: 10 },
  logradouro_codigo: pente(0, [491.4, 505.8, 520.2, 534.6, 549.0], 488.5),
  numero: { p: 0, x: 58, y: 466, w: 54, h: 10 },
  complemento: { p: 0, x: 122, y: 466, w: 290, h: 10 },
  geo1: { p: 0, x: 423, y: 466, w: 140, h: 10 },
  geo2: { p: 0, x: 57, y: 441, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 229, y: 441, w: 218, h: 10 },
  cep: { p: 0, x: 455.4, y: 438.7, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 54.3, y: 414.5, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 333.1, y: 426.5, w: 10.8, h: 10.8 },
  pais: { p: 0, x: 368, y: 415, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const data = (n, chave, rotulo, cel, extra = {}) => ({ n, chave, rotulo, tipo: 'data', larg: 3, ...cel, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 3, ...extra })
const naoAut = (d) => d.autoctone === '2'

export default {
  id: 'NOTIFICACAO_CONCLUSAO',
  titulo: 'Ficha de Notificação/Conclusão',
  arquivo: 'Ficha_conclusao_v5.pdf',
  agravoLivre: true,
  inicializar: (d, agravo) => ({ ...d, cid: d.cid || agravo?.cid || '' }),
  secoes: [
    {
      titulo: 'Agravo',
      campos: [
        txt('2', 'agravo', 'Agravo/doença', { p: 0, x: 70, y: 727, w: 300, h: 11 }, { larg: 8 }),
        txt('2', 'cid', 'Código (CID-10)', { p: 0, x: 378, y: 727, w: 54, h: 11 }, { larg: 2 }),
      ],
    },
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Conclusão',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 58.4, [70.5, 86.1, 99.3, 114.4, 128.1, 142.5, 156.9], 169.8, 363.4, 12), {}),
        cod('32', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(0, 300.0, 381.1, 11, 10.8), {}),
        cod('33', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico']], cx(0, 534.7, 379.2, 11, 10.8), {}),
        cod('34', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(0, 301.9, 333.1, 10.8, 11), { larg: 4, quando: (d) => d.classificacao_final === '1' }),
        { n: '35', chave: 'uf_infeccao', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 341.4, y: 322.4, w: 26.9, h: 9.1 }, larg: 1, quando: naoAut },
        txt('36', 'pais_infeccao', 'País', { p: 0, x: 378, y: 323, w: 185, h: 10 }, { quando: naoAut }),
        txt('37', 'municipio_infeccao', 'Município', { p: 0, x: 58, y: 293, w: 140, h: 9 }, { fonte: 7.5, quando: naoAut }),
        { n: '37', chave: 'ibge_infeccao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [216.9, 231.3, 245.8, 260.2, 274.7], 291.5), larg: 2, quando: naoAut },
        txt('38', 'distrito_infeccao', 'Distrito', { p: 0, x: 298, y: 293, w: 140, h: 10 }, { quando: naoAut }),
        txt('39', 'bairro_infeccao', 'Bairro', { p: 0, x: 442, y: 293, w: 122, h: 10 }, { quando: naoAut }),
        cod('40', 'doenca_trabalho', 'Doença relacionada ao trabalho', SIM_NAO_IGN, cx(0, 177.6, 268.3, 11, 10.8)),
        cod('41', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito pelo agravo notificado'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(0, 548.6, 276.2), { larg: 4 }),
        data('42', 'data_obito', 'Data do óbito', dataCel(0, 59.4, [71.5, 86.4, 99.7, 114.7, 128.4, 142.9, 157.3], 172.0, 238.1, 12), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('43', 'data_encerramento', 'Data do encerramento', dataCel(0, 183.0, [195.0, 210.0, 223.3, 238.4, 252.1, 266.6, 281.0], 295.6, 238.1, 12), {}),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      campos: [
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [180.6, 166.8, 153.0, 139.0, 125.4, 111.6, 98.0].map((y) => ({ p: 0, x: 30, y, w: 530, h: 13.8 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 0, x: 58, y: 72, w: 400, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(0, [478.6, 493.1, 507.6, 522.0, 536.5, 550.9], 66.5), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 0, x: 58, y: 40, w: 190, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 0, x: 268, y: 40, w: 195, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
