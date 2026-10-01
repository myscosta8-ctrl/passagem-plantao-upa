// Ficha de Investigação — Cólera (Sinan NET, SVS 04/10/2006) — Colera_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 446.3, y: 657.5, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 53.0, y: 629.3, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 97, y: 629, w: 370, h: 10 },
  ibge_notificacao: pente(0, [488.4, 502.8, 517.3, 531.7, 546.2], 627.5),
  unidade_notificadora: { p: 0, x: 68, y: 600, w: 265, h: 10 },
  cnes: pente(0, [348.9, 363.4, 377.8, 392.3, 406.8, 421.2], 598.5),
  data_primeiros_sintomas: { p: 0, x: 445.1, y: 599.0, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 68, y: 572, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 447.1, y: 570.6, w: 113.8, h: 11.9 },
  idade: pente(0, [74.4, 88.0], 540, 9),
  unidade_idade: { p: 0, x: 109.4, y: 548.2, w: 11, h: 11 },
  sexo: { p: 0, x: 232.1, y: 555.4, w: 11, h: 11 },
  gestante: { p: 0, x: 426.7, y: 555.4, w: 10.8, h: 10.8 },
  raca: { p: 0, x: 551.5, y: 554.6, w: 11, h: 10.8 },
  escolaridade: { p: 0, x: 552.2, y: 525.6, w: 10.8, h: 10.8 },
  cns: { p: 0, x: 53.4, y: 480.1, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 245, y: 481, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 53.1, y: 450.0, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 450, w: 228, h: 10 },
  ibge_residencia: pente(0, [336.9, 351.4, 365.8, 380.3, 394.8], 448.5),
  distrito: { p: 0, x: 426, y: 449, w: 140, h: 10 },
  bairro: { p: 0, x: 57, y: 425, w: 140, h: 10 },
  logradouro: { p: 0, x: 206, y: 424, w: 270, h: 10 },
  logradouro_codigo: pente(0, [490.7, 505.1, 519.5, 533.9, 548.3], 422.5),
  numero: { p: 0, x: 57, y: 400, w: 54, h: 10 },
  complemento: { p: 0, x: 121, y: 400, w: 290, h: 10 },
  geo1: { p: 0, x: 422, y: 400, w: 140, h: 10 },
  geo2: { p: 0, x: 57, y: 375, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 228, y: 375, w: 218, h: 10 },
  cep: { p: 0, x: 454.7, y: 372.7, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 53.6, y: 348.5, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 332.4, y: 360.5, w: 10.8, h: 10.8 },
  pais: { p: 0, x: 367, y: 349, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, cel, extra = {}) => ({ n, chave, rotulo, tipo: 'data', larg: 3, ...cel, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 3, ...extra })
const sim = (k) => (d) => d[k] === '1'
const cel = (b) => b.slice(0, -1).map((x, i) => [x, b[i + 1]])
const naoAut = (d) => d.autoctone === '2'
const comContato = (d) => d.contato && !['8', '9'].includes(d.contato)
const hosp = (d) => d.tipo_atendimento === '1'

const DESLOC = [425.5, 412.7, 400.1].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`desloc${i}_municipio`]
  const t = (k, r, x, w, tipo = 'texto', extra = {}) => ({ n: '', chave: `desloc${i + 1}_${k}`, rotulo: `Deslocamento ${i + 1}: ${r}`, tipo, caixa: { p: 1, x, y, w, h: 12.7 }, fonte: 7.5, larg: 2, quando: q, ...extra })
  return [t('data', 'data', 35.4, 73.4, 'data', { comoTexto: true }), t('uf', 'UF', 108.9, 44.1, 'uf', { larg: 1 }), t('municipio', 'município', 153.0, 180.8), t('pais', 'país', 333.8, 116.7), t('transporte', 'meio de transporte', 450.5, 116.6)]
})
const ALIMENTOS = [358.3, 345.6, 333.0, 320.3].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`alimento${i}_tipo`]
  return [
    txt('', `alimento${i + 1}_tipo`, `Alimento ${i + 1}: tipo`, { p: 1, x: 36.3, y, w: 183.1, h: 12.7 }, { fonte: 8, larg: 6, quando: q }),
    txt('', `alimento${i + 1}_local`, `Alimento ${i + 1}: local de consumo`, { p: 1, x: 219.3, y, w: 348.4, h: 12.7 }, { fonte: 8, larg: 6, quando: q }),
  ]
})
const OBS = [291.4, 277.5, 263.5, 249.5, 235.4, 221.7, 207.8, 193.8, 179.8, 165.9, 151.9, 137.9, 123.9, 110.0]

export default {
  id: 'COLERA',
  titulo: 'Ficha de Investigação — Cólera',
  arquivo: 'Colera_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 63.0, [75.0, 90.6, 103.9, 118.9, 132.7, 147.1, 161.5], 174.4, 298.9, 11.9), {}),
        txt('32', 'ocupacao', 'Ocupação', { p: 0, x: 185, y: 300, w: 375, h: 10 }, { larg: 9 }),
        cod('33', 'contato', 'Contato com caso suspeito ou confirmado de cólera (até 10 dias antes do início dos sinais e sintomas)', [['1', 'Domicílio'], ['2', 'Vizinhança'], ['3', 'Trabalho'], ['4', 'Creche/escola'], ['5', 'Posto de saúde/hospital'], ['6', 'Outro estado/município'], ['7', 'Outros'], ['8', 'Sem história de contato'], ['9', 'Ignorado']], cx(0, 551.3, 282.5, 10.8, 11), { larg: 6 }),
        txt('33', 'contato_outro', 'Outro local de contato (qual?)', { p: 0, x: 228, y: 270, w: 118, h: 8 }, { fonte: 7, larg: 4, quando: (d) => d.contato === '7' }),
        txt('34', 'contato_nome', 'Nome do contato', { p: 0, x: 66, y: 242, w: 380, h: 10 }, { larg: 6, quando: comContato }),
        { n: '35', chave: 'contato_fone', rotulo: '(DDD) Telefone do contato', tipo: 'digitos', digitos: 10, celulas: cel([460.7, 469.8, 481.2, 493.1, 502.2, 513.7, 525.1, 536.6, 548.1, 559.5, 568.8]), caixa: { p: 0, x: 460.7, y: 237.3, w: 108.1, h: 11.9 }, larg: 3, quando: comContato },
        txt('36', 'contato_endereco', 'Endereço do contato (rua, av., apto., bairro, localidade etc.)', { p: 0, x: 66, y: 217, w: 495, h: 9 }, { larg: 12, quando: comContato }),
        cod('37', 'vinculo', 'Sugestão de vínculo com', [['1', 'Consumo de água não tratada'], ['2', 'Exposição a esgoto'], ['3', 'Alimento'], ['4', 'Deslocamento'], ['5', 'Outros'], ['9', 'Ignorado']], cx(0, 550.3, 197.8, 11, 10.8), { larg: 5 }),
        txt('37', 'vinculo_outros', 'Outro vínculo (qual?)', { p: 0, x: 446, y: 182.5, w: 55, h: 8 }, { fonte: 6.5, quando: (d) => d.vinculo === '5' }),
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        sni('38', 'sinal_assintomatico', 'Assintomático', cx(0, 73.0, 147.1, 10.8, 11), {}),
        sni('38', 'sinal_diarreia', 'Diarreia', cx(0, 72.7, 134.4), {}),
        sni('38', 'sinal_vomitos', 'Vômitos', cx(0, 73.4, 120.5, 10.8, 11), {}),
        sni('38', 'sinal_caimbras', 'Câimbras', cx(0, 158.4, 134.9, 10.8, 11), {}),
        sni('38', 'sinal_dor_abdominal', 'Dor abdominal', cx(0, 158.4, 120.2), {}),
        sni('38', 'sinal_febre', 'Febre', cx(0, 234.5, 134.2, 11, 10.8), {}),
        sni('38', 'sinal_choque', 'Choque', cx(0, 234.5, 119.5), {}),
        cod('39', 'desidratacao', 'Desidratação', [['1', 'Não'], ['2', 'Algum grau'], ['3', 'Grave'], ['9', 'Ignorado']], cx(0, 411.8, 157.4)),
        cod('40', 'diarreia_caracteristica', 'Característica da diarreia', [['1', 'Aquosa/amarelada'], ['2', 'Aquosa/água de arroz'], ['3', 'Pastosa'], ['9', 'Ignorado']], cx(0, 555.1, 156.0, 11, 10.8), { quando: sim('sinal_diarreia') }),
        cod('41', 'frequencia_dia', 'Frequência/dia', [['1', 'Até 5 evacuações'], ['2', 'De 6 a 10 evacuações'], ['3', 'De 11 a 20 evacuações'], ['4', 'Acima de 20 evacuações']], cx(0, 212.9, 98.2, 11, 10.8), { quando: sim('sinal_diarreia') }),
        sni('42', 'sangue', 'Presença de sangue?', cx(0, 378.7, 95.5), { quando: sim('sinal_diarreia') }),
        sni('43', 'muco', 'Presença de muco?', cx(0, 549.6, 97.2, 10.8, 11), { quando: sim('sinal_diarreia') }),
      ],
    },
    {
      titulo: 'Atendimento',
      campos: [
        cod('44', 'tipo_atendimento', 'Tipo de atendimento', [['1', 'Hospitalar'], ['2', 'Ambulatorial'], ['3', 'Domiciliar'], ['4', 'Nenhum'], ['9', 'Ignorado']], cx(1, 281.3, 793.4)),
        data('45', 'data_atendimento', 'Data do atendimento', dataCel(1, 304.8, [316.9, 331.8, 345.0, 360.1, 373.8, 388.3, 402.7], 413.6, 783.5, 11.9), { quando: (d) => !!d.tipo_atendimento && !['4', '9'].includes(d.tipo_atendimento) }),
        data('46', 'data_internacao', 'Data da internação', dataCel(1, 423.0, [435.0, 449.9, 463.2, 478.3, 492.0, 506.4, 520.8], 535.5, 783.5, 11.9), { quando: hosp }),
        { n: '47', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 539, y: 783.5, w: 27, h: 10 }, larg: 1, quando: hosp },
        txt('48', 'municipio_hospital', 'Município do hospital', { p: 1, x: 58, y: 758, w: 190, h: 9 }, { fonte: 7.5, quando: hosp }),
        { n: '48', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [255.2, 269.7, 284.1, 298.6, 313.0], 755.5), larg: 2, quando: hosp },
        txt('49', 'nome_hospital', 'Nome do hospital', { p: 1, x: 335, y: 758, w: 128, h: 9 }, { fonte: 7.5, quando: hosp }),
        { n: '49', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [476.4, 490.9, 505.3, 519.8, 534.3, 548.7], 753.5), larg: 2, quando: hosp },
      ],
    },
    {
      titulo: 'Dados do laboratório',
      campos: [
        sni('50', 'material_fezes', 'Material colhido: fezes/swab retal ou fecal', cx(1, 220.1, 736.1)),
        sni('50', 'material_vomito', 'Material colhido: vômito', cx(1, 346.3, 736.1)),
        data('51', 'data_coleta', 'Data da coleta', dataCel(1, 452.3, [464.4, 479.3, 492.6, 507.7, 521.4, 535.8, 550.2], 564.9, 726.9, 11.9), { quando: (d) => sim('material_fezes')(d) || sim('material_vomito')(d) }),
        sni('52', 'antibiotico_antes', 'Uso de antibiótico antes da coleta de material', cx(1, 210.0, 704.9)),
        txt('53', 'antibiotico_antes_qual', 'Caso afirmativo, qual?', { p: 1, x: 242, y: 704, w: 200, h: 9 }, { larg: 5, quando: sim('antibiotico_antes') }),
        cod('54', 'resultado', 'Resultado', [['1', 'Positivo'], ['2', 'Negativo']], cx(1, 547.0, 710.9, 11, 10.8)),
        cod('55', 'caso_positivo', 'Caso positivo', [['1', 'Ogawa'], ['2', 'Inaba'], ['3', 'Hikojima'], ['4', 'Outro sorotipo'], ['5', 'Não vibrio']], cx(1, 352.3, 685.4, 10.8, 11), { larg: 4, quando: (d) => d.resultado === '1' }),
        txt('56', 'caso_negativo', 'Caso negativo, especificar', { p: 1, x: 377, y: 679, w: 186, h: 9 }, { larg: 4, quando: (d) => d.resultado === '2' }),
      ],
    },
    {
      titulo: 'Tratamento',
      campos: [
        cod('57', 'reidratacao', 'Reidratação', [['1', 'Via oral'], ['2', 'Venosa'], ['3', 'Oral-venosa']], cx(1, 220.6, 655.2)),
        sni('58', 'antibioticos', 'Utilizou antibióticos', cx(1, 367.4, 654.0)),
        txt('59', 'antibioticos_qual', 'Caso afirmativo, qual?', { p: 1, x: 388, y: 645, w: 175, h: 9 }, { larg: 4, quando: sim('antibioticos') }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('60', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 310.6, 623.3, 10.8, 11)),
        cod('61', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico']], cx(1, 537.8, 618.5, 10.8, 10.8)),
        cod('62', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(1, 301.9, 578.4, 10.8, 11), { larg: 4, quando: (d) => d.classificacao_final === '1' }),
        { n: '63', chave: 'uf_infeccao', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 341.4, y: 567.7, w: 26.9, h: 9 }, larg: 1, quando: naoAut },
        txt('64', 'pais_infeccao', 'País', { p: 1, x: 378, y: 569, w: 185, h: 10 }, { quando: naoAut }),
        txt('65', 'municipio_infeccao', 'Município', { p: 1, x: 58, y: 537, w: 130, h: 9 }, { fonte: 7.5, quando: naoAut }),
        { n: '65', chave: 'ibge_infeccao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, celulas: cel([202.5, 216.9, 231.4, 245.8, 260.3, 274.8, 289.2]), caixa: { p: 1, x: 202.5, y: 536.5, w: 86.7, h: 10 }, larg: 2, quando: naoAut },
        txt('66', 'distrito_infeccao', 'Distrito', { p: 1, x: 298, y: 537, w: 140, h: 10 }, { quando: naoAut }),
        txt('67', 'bairro_infeccao', 'Bairro', { p: 1, x: 442, y: 537, w: 122, h: 10 }, { quando: naoAut }),
        sni('68', 'doenca_trabalho', 'Doença relacionada ao trabalho', cx(1, 179.3, 512.6, 10.8, 11)),
        cod('69', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito por cólera'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 550.1, 520.8, 11, 10.8), { larg: 4 }),
        data('70', 'data_obito', 'Data do óbito', dataCel(1, 60.2, [72.2, 87.1, 100.4, 115.5, 129.2, 143.7, 158.1], 172.7, 482.7, 11.9), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('71', 'data_encerramento', 'Data do encerramento', dataCel(1, 183.8, [195.8, 210.7, 224.1, 239.1, 252.9, 267.3, 281.8], 296.4, 482.7, 11.9)),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      aviso: 'Deslocamento: datas e locais frequentados nos 10 dias anteriores ao início dos sinais e sintomas. Alimentos: consumidos na última semana e sugestivos de contaminação.',
      campos: [
        ...DESLOC,
        ...ALIMENTOS,
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: OBS.map((y) => ({ p: 1, x: 38, y, w: 530, h: 14 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 1, x: 62, y: 81, w: 400, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [483.9, 498.3, 512.8, 527.2, 541.7, 556.2], 75.5), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 62, y: 51, w: 190, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 262, y: 51, w: 200, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
