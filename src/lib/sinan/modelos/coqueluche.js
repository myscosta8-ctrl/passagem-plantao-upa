// Ficha de Investigação — Coqueluche (Sinan NET, SVS 09/06/2006) — Coqueluche_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 446.5, y: 656, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 53.2, y: 627.7, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 97, y: 628, w: 370, h: 10 },
  ibge_notificacao: pente(0, [488.4, 502.8, 517.3, 531.7, 546.2], 625.5),
  unidade_notificadora: { p: 0, x: 68, y: 598, w: 265, h: 10 },
  cnes: pente(0, [348.9, 363.4, 377.8, 392.3, 406.8, 421.2], 597.5),
  data_primeiros_sintomas: { p: 0, x: 443.6, y: 600, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 68, y: 570, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 447.3, y: 569, w: 113.9, h: 11.9 },
  idade: pente(0, [74.6, 88.2], 539, 9),
  unidade_idade: { p: 0, x: 109.7, y: 546.7, w: 11, h: 10.8 },
  sexo: { p: 0, x: 232.3, y: 553.9, w: 11, h: 10.8 },
  gestante: { p: 0, x: 427.0, y: 553.7, w: 10.8, h: 11 },
  raca: { p: 0, x: 551.8, y: 553.0, w: 11, h: 11 },
  escolaridade: { p: 0, x: 552.2, y: 523.9, w: 11, h: 11 },
  cns: { p: 0, x: 53.7, y: 478.6, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 246, y: 480, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 53.8, y: 449.3, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 449, w: 228, h: 10 },
  ibge_residencia: pente(0, [337.6, 352.1, 366.6, 381.0, 395.5], 448.5),
  distrito: { p: 0, x: 427, y: 448, w: 140, h: 10 },
  bairro: { p: 0, x: 57, y: 424, w: 140, h: 10 },
  logradouro: { p: 0, x: 207, y: 423, w: 270, h: 10 },
  logradouro_codigo: pente(0, [491.4, 505.8, 520.2, 534.6, 549.0], 421.5),
  numero: { p: 0, x: 58, y: 400, w: 54, h: 10 },
  complemento: { p: 0, x: 122, y: 400, w: 290, h: 10 },
  geo1: { p: 0, x: 423, y: 399, w: 140, h: 10 },
  geo2: { p: 0, x: 57, y: 374, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 229, y: 374, w: 218, h: 10 },
  cep: { p: 0, x: 455.4, y: 372.0, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 54.3, y: 347.7, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 333.1, y: 359.8, w: 10.8, h: 10.8 },
  pais: { p: 0, x: 368, y: 348, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, cel, extra = {}) => ({ n, chave, rotulo, tipo: 'data', larg: 3, ...cel, ...extra })
const casas = (n, chave, rotulo, celulas, p, y, extra = {}) => ({ n, chave, rotulo, tipo: 'digitos', digitos: celulas.length, celulas, caixa: { p, x: celulas[0][0], y, w: celulas[celulas.length - 1][1] - celulas[0][0], h: 10 }, larg: 2, ...extra })
const sim = (k) => (d) => d[k] === '1'

const SINAIS = [['tosse', 'Tosse', 165.6, 115.7], ['tosse_paroxistica', 'Tosse paroxística', 164.9, 100.1], ['guincho', 'Respiração ruidosa ao final da crise de tosse (guincho)', 164.9, 85.4],
  ['cianose', 'Cianose', 342.5, 115.7], ['vomitos', 'Vômitos', 342.5, 98.6], ['apneia', 'Apneia', 343.0, 82.8],
  ['temp_menor38', 'Temperatura < 38 °C', 456.2, 116.9], ['temp_maior38', 'Temperatura ≥ 38 °C', 456.2, 100.1], ['outros', 'Outros', 456.2, 83.0]]
const COMPLIC = [['pneumonia', 'Pneumonia ou broncopneumonia', 223.2, 61.9], ['encefalopatia', 'Encefalopatia (convulsões)', 223.2, 44.9], ['desidratacao', 'Desidratação', 363.6, 61.9],
  ['otite', 'Otite', 363.6, 44.9], ['desnutricao', 'Desnutrição', 439.2, 61.9], ['outras', 'Outras', 439.2, 44.9]]
const OBS = [413.9, 399.3, 384.6, 370.1, 355.2, 340.7, 326.0, 311.4, 296.6, 281.7, 267.1, 252.5, 237.8, 223.2, 208.5, 193.8, 179.1]

export default {
  id: 'COQUELUCHE',
  titulo: 'Ficha de Investigação — Coqueluche',
  arquivo: 'Coqueluche_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 60.2, [74.2, 90.1, 103.3, 116.6, 130.3, 144.8, 159.3], 173.7, 296, 11), {}),
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 180, y: 297, w: 230, h: 10 }, larg: 5 },
        sni('33', 'unidade_sentinela', 'A unidade notificante é sentinela?', cx(0, 552.5, 308.2), { larg: 4 }),
        cod('34', 'contato', 'Contato com caso suspeito ou confirmado de coqueluche (até 14 dias antes do início dos sinais e sintomas)', [['1', 'Domicílio'], ['2', 'Vizinhança'], ['3', 'Trabalho'], ['4', 'Creche/escola'], ['5', 'Posto de saúde/hospital'], ['6', 'Outro estado/município'], ['7', 'Outro'], ['8', 'Sem história de contato'], ['9', 'Ignorado']], cx(0, 552.2, 284.2, 11, 10.8), { larg: 6 }),
        { n: '34', chave: 'contato_outro', rotulo: 'Outro local de contato (qual?)', tipo: 'texto', caixa: { p: 0, x: 242, y: 266.5, w: 120, h: 8 }, fonte: 7, larg: 4, quando: (d) => d.contato === '7' },
        { n: '35', chave: 'contato_nome', rotulo: 'Nome do contato', tipo: 'texto', caixa: { p: 0, x: 66, y: 233, w: 495, h: 10 }, larg: 6, quando: (d) => d.contato && !['8', '9'].includes(d.contato) },
        { n: '36', chave: 'contato_endereco', rotulo: 'Endereço do contato (rua, av., apto., bairro, localidade etc.)', tipo: 'texto', caixa: { p: 0, x: 66, y: 207.5, w: 495, h: 9 }, larg: 6, quando: (d) => d.contato && !['8', '9'].includes(d.contato) },
        cod('37', 'doses_vacina', 'Nº de doses da vacina tríplice (DTP) ou tetravalente (DTP+Hib)', [['1', 'Uma'], ['2', 'Duas'], ['3', 'Três'], ['4', 'Três + um reforço'], ['5', 'Três + dois reforços'], ['6', 'Nunca vacinado'], ['9', 'Ignorado']], cx(0, 429.4, 179.3, 11, 10.8), { larg: 4 }),
        data('38', 'data_ultima_dose', 'Data da última dose', dataCel(0, 457.5, [471.9, 486.3, 501.1, 514.3, 528.1, 542.5, 557.0], 566, 166, 11), { quando: (d) => ['1', '2', '3', '4', '5'].includes(d.doses_vacina) }),
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        data('39', 'data_inicio_tosse', 'Data do início da tosse', dataCel(0, 63, [77.2, 93.0, 106.3, 118.8, 133.3, 147.8, 162.3], 176.5, 135, 11)),
        ...SINAIS.map(([k, r, x, y]) => sni('40', `sinal_${k}`, `Sinais e sintomas: ${r}`, cx(0, x, y), {})),
        { n: '40', chave: 'sinal_outros_espec', rotulo: 'Outros sinais (quais?)', tipo: 'texto', caixa: { p: 0, x: 500, y: 84, w: 62, h: 8 }, fonte: 6.5, larg: 3, quando: sim('sinal_outros') },
        ...COMPLIC.map(([k, r, x, y]) => sni('41', `complic_${k}`, `Complicações: ${r}`, cx(0, x, y, 10.8, 11))),
        { n: '41', chave: 'complic_outras_espec', rotulo: 'Outras complicações (quais?)', tipo: 'texto', caixa: { p: 0, x: 476, y: 46, w: 88, h: 8 }, fonte: 6.5, larg: 3, quando: sim('complic_outras') },
      ],
    },
    {
      titulo: 'Atendimento e tratamento',
      campos: [
        sni('42', 'hospitalizacao', 'Ocorreu hospitalização', cx(1, 163.2, 801.8, 10.8, 10.8)),
        data('43', 'data_internacao', 'Data da internação', dataCel(1, 180.6, [195.0, 210.6, 223.8, 238.9, 252.6, 267.1, 281.5], 295.9, 785, 11), { quando: sim('hospitalizacao') }),
        { n: '44', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 298.5, y: 785, w: 28, h: 10 }, larg: 1, quando: sim('hospitalizacao') },
        { n: '45', chave: 'municipio_hospital', rotulo: 'Município do hospital', tipo: 'texto', caixa: { p: 1, x: 334, y: 787, w: 140, h: 9 }, fonte: 7.5, larg: 4, quando: sim('hospitalizacao') },
        { n: '45', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [493.6, 508.1, 522.6, 537.0, 551.5], 784.5), larg: 2, quando: sim('hospitalizacao') },
        { n: '46', chave: 'nome_hospital', rotulo: 'Nome do hospital', tipo: 'texto', caixa: { p: 1, x: 66, y: 755, w: 395, h: 10 }, larg: 8, quando: sim('hospitalizacao') },
        { n: '46', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [479.5, 493.9, 508.4, 522.9, 537.3, 551.8], 752.5), larg: 3, quando: sim('hospitalizacao') },
        sni('47', 'antibiotico', 'Utilizou antibiótico', cx(1, 429.8, 733.4, 10.8, 11)),
        data('48', 'data_antibiotico', 'Data de administração do antibiótico', dataCel(1, 451, [465.2, 480.7, 494.0, 509.1, 522.8, 537.2, 551.6], 565, 716, 11), { quando: sim('antibiotico') }),
      ],
    },
    {
      titulo: 'Dados do laboratório',
      campos: [
        sni('49', 'coleta_nasofaringe', 'Coleta de material da nasofaringe', cx(1, 206.2, 698.4), { larg: 4 }),
        data('50', 'data_coleta', 'Data da coleta de material', dataCel(1, 235.5, [249.3, 262.6, 275.6, 292.0, 304.4, 318.9, 333.3], 347, 678, 11), { quando: sim('coleta_nasofaringe') }),
        cod('51', 'cultura', 'Resultado da cultura', [['1', 'Positiva'], ['2', 'Negativa'], ['3', 'Não realizada'], ['9', 'Ignorado']], cx(1, 548.9, 700.8, 10.8, 11), { quando: sim('coleta_nasofaringe') }),
      ],
    },
    {
      titulo: 'Medidas de controle',
      campos: [
        sni('52', 'comunicantes_identificados', 'Realizada identificação dos comunicantes íntimos?', cx(1, 181.0, 649.2, 11, 12.2), { larg: 4 }),
        casas('53', 'comunicantes_qtd', 'Se sim, quantos?', [[243, 257.4], [257.4, 271.8], [271.8, 286.3]], 1, 642, { quando: sim('comunicantes_identificados') }),
        cod('54', 'casos_secundarios', 'Quantos casos secundários foram confirmados entre os comunicantes', [['0', 'Nenhum'], ['1', 'Um'], ['2', 'Dois ou mais'], ['9', 'Ignorado']], cx(1, 549.8, 656.6, 10.8, 10.8), { larg: 4 }),
        sni('55', 'coleta_comunicantes', 'Realizada coleta de material da nasofaringe dos comunicantes?', cx(1, 185.5, 604.3, 11, 12.2), { larg: 4 }),
        casas('56', 'coleta_comunicantes_qtd', 'Se sim, em quantos?', [[246, 260.4], [260.4, 274.9], [274.9, 289.3]], 1, 594, { quando: sim('coleta_comunicantes') }),
        casas('57', 'comunicantes_positivos', 'Em quantos comunicantes o resultado da cultura foi positivo?', [[369.7, 384.1], [384.1, 398.6], [398.6, 413.1]], 1, 593, { quando: sim('coleta_comunicantes') }),
        cod('58', 'medidas_prevencao', 'Medidas de prevenção/controle', [['1', 'Bloqueio vacinal'], ['2', 'Quimioprofilaxia'], ['3', 'Ambos'], ['4', 'Não'], ['9', 'Ignorado']], cx(1, 559.4, 615.8), { larg: 4 }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('59', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 198.0, 569.5)),
        cod('60', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico'], ['3', 'Clínico']], cx(1, 545.8, 568.3), { larg: 4 }),
        sni('61', 'doenca_trabalho', 'Doença relacionada ao trabalho', cx(1, 243.1, 532.8)),
        cod('62', 'evolucao', 'Evolução', [['1', 'Cura'], ['2', 'Óbito por coqueluche'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 552.2, 536.6), { larg: 4 }),
        data('63', 'data_obito', 'Data do óbito', dataCel(1, 61, [75.0, 87.6, 101.3, 117.0, 130.1, 144.5, 158.9], 172.5, 489, 11), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('64', 'data_encerramento', 'Data do encerramento', dataCel(1, 179, [193.0, 205.6, 219.4, 235.0, 248.2, 262.6, 277.0], 290.5, 489, 11)),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      campos: [
        { n: '', chave: 'observacoes', rotulo: 'Informações complementares e observações (outros dados clínicos, laboratoriais, laudos, necrópsia etc.)', tipo: 'texto_longo', linhas: OBS.map((y) => ({ p: 1, x: 33, y, w: 533, h: 14.6 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 60, y: 152, w: 400, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [483.3, 497.8, 512.2, 526.7, 541.2, 555.6], 147.5), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 60, y: 124, w: 195, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 265, y: 124, w: 190, h: 10 }, larg: 6 },
      ],
    },
  ],
}
