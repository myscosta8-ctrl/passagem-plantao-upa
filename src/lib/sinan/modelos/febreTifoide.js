// Ficha de Investigação — Febre Tifoide (Sinan NET, SVS 12/05/2006) — Febre_Tifoide_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 442.5, y: 675.5, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 50.9, y: 644.9, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 95, y: 645, w: 370, h: 10 },
  ibge_notificacao: pente(0, [486.1, 500.6, 515.1, 529.5, 544.0], 642.5),
  unidade_notificadora: { p: 0, x: 65, y: 616, w: 265, h: 10 },
  cnes: pente(0, [346.7, 361.2, 375.6, 390.1, 404.5, 419.0], 614.5),
  data_primeiros_sintomas: { p: 0, x: 441.3, y: 616.8, w: 115.2, h: 12 },
  nome: { p: 0, x: 66, y: 588, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 445.0, y: 586.4, w: 113.8, h: 11.9 },
  idade: pente(0, [72.3, 85.9], 556, 9),
  unidade_idade: { p: 0, x: 107.3, y: 563.8, w: 11, h: 11 },
  sexo: { p: 0, x: 229.9, y: 571.0, w: 11, h: 11 },
  gestante: { p: 0, x: 424.6, y: 571.0, w: 11, h: 11 },
  raca: { p: 0, x: 549.6, y: 570.2, w: 10.8, h: 11 },
  escolaridade: { p: 0, x: 550.1, y: 541.2, w: 11, h: 11 },
  cns: { p: 0, x: 51.4, y: 495.8, w: 175.3, h: 11.9 },
  nome_mae: { p: 0, x: 243, y: 497, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 52.3, y: 465.1, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 465, w: 228, h: 10 },
  ibge_residencia: pente(0, [336.1, 350.5, 365.0, 379.5, 393.9], 463.5),
  distrito: { p: 0, x: 425, y: 464, w: 140, h: 10 },
  bairro: { p: 0, x: 56, y: 440, w: 140, h: 10 },
  logradouro: { p: 0, x: 205, y: 439, w: 270, h: 10 },
  logradouro_codigo: pente(0, [489.9, 504.3, 518.7, 533.1, 547.5], 437.5),
  numero: { p: 0, x: 57, y: 415, w: 54, h: 10 },
  complemento: { p: 0, x: 120, y: 415, w: 290, h: 10 },
  geo1: { p: 0, x: 421, y: 415, w: 140, h: 10 },
  geo2: { p: 0, x: 56, y: 390, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 227, y: 390, w: 218, h: 10 },
  cep: { p: 0, x: 453.9, y: 387.8, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 52.7, y: 363.5, w: 148.1, h: 12.4 },
  zona: { p: 0, x: 331.4, y: 375.4, w: 11, h: 11 },
  pais: { p: 0, x: 367, y: 364, w: 195, h: 10 },
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
const RESULTADO = [['1', 'Salmonella typhi'], ['2', 'Salmonella spp'], ['3', 'Negativo'], ['4', 'Outro agente (especificar)']]

const SINAIS = [['assintomatico', 'Assintomático', 60.2, 183.8], ['esplenomegalia', 'Esplenomegalia', 59.8, 170.6], ['febre', 'Febre', 141.1, 184.6], ['roseola', 'Roséola tífica', 140.2, 169.9],
  ['cefaleia', 'Cefaleia', 219.8, 183.1], ['nauseas', 'Náuseas', 219.8, 169.9], ['diarreia', 'Diarreia', 300.2, 182.4], ['vomitos', 'Vômitos', 299.8, 168.5],
  ['constipacao', 'Constipação', 368.2, 181.9], ['dor_abdominal', 'Dor abdominal', 367.2, 168.0], ['astenia', 'Astenia', 440.6, 181.9], ['dissociacao', 'Dissociação pulso-temperatura', 440.6, 167.3], ['tosse', 'Tosse', 510.5, 182.4]]

// Exames laboratoriais (46): 4 materiais × 3 coletas
const MATERIAIS = [['hemocultura', 'Hemocultura', 108], ['coprocultura', 'Coprocultura', 226], ['urocultura', 'Urocultura', 350], ['outros', 'Outros', 471]]
const COLETAS = [
  { n: '1ª', y: 756.3, datas: [[93.8, [105.8, 120.7, 134.6, 149.8, 163.4, 177.8, 192.2], 209.0], [216.0, [228.1, 242.9, 256.9, 272.0, 285.7, 300.2, 314.6], 331.2], [338.2, [350.2, 365.1, 379.1, 394.2, 407.9, 422.4, 436.8], 453.4], [456.8, [468.8, 483.6, 497.7, 512.7, 526.5, 540.9, 555.4], 572.0]],
    res: [[94.3, 742.1], [213.6, 743.5], [337.9, 742.8], [457.9, 743.5]] },
  { n: '2ª', y: 716.5, datas: [[96.8, [108.9, 120.0, 133.9, 149.1, 162.7, 177.1, 191.5], 208.2], [215.3, [227.4, 242.2, 256.2, 271.3, 285.0, 299.5, 313.9], 330.5], [337.5, [349.5, 364.4, 378.3, 393.5, 407.1, 421.5, 435.9], 452.7], [457.5, [469.5, 484.3, 498.4, 513.4, 527.2, 541.6, 556.1], 572.7]],
    res: [[95.0, 703.7], [213.6, 703.7], [336.5, 703.0], [458.6, 703.0]] },
  { n: '3ª', y: 677.5, datas: [[96.8, [108.9, 120.0, 133.9, 149.1, 162.7, 177.1, 191.5], 208.2], [215.3, [227.4, 242.2, 256.2, 271.3, 285.0, 299.5, 313.9], 330.5], [337.5, [349.5, 364.4, 378.4, 393.5, 407.2, 421.6, 436.1], 452.7], [458.3, [470.3, 485.1, 499.2, 514.2, 528.0, 542.4, 556.9], 573.5]],
    res: [[98.6, 664.1], [217.2, 664.1], [343.2, 662.4], [458.6, 662.4]] },
]
const EXAMES = COLETAS.flatMap((c, i) => MATERIAIS.flatMap(([k, r, xt], j) => {
  const pre = `${k}_${i + 1}`
  const [x0, sep, x1] = c.datas[j]
  const [xr, yr] = c.res[j]
  return [
    data('46', `${pre}_data`, `${r}: data da ${c.n} coleta`, dataCel(1, x0, sep, x1, j === 3 && i > 0 ? c.y - 0.7 : c.y, 11.9), { larg: 2 }),
    cod('46', `${pre}_resultado`, `${r}: resultado da ${c.n} amostra`, RESULTADO, cx(1, xr, yr), { larg: 2, quando: (d) => !!d[`${pre}_data`] }),
    txt('46', `${pre}_agente`, `${r}: outro agente da ${c.n} amostra (especificar)`, { p: 1, x: xt, y: yr, w: 94, h: 8 }, { fonte: 6.5, larg: 2, quando: (d) => d[`${pre}_resultado`] === '4' }),
  ]
}))

const DESLOC = [400.7, 387.9, 375.3].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`desloc${i}_municipio`]
  const t = (k, r, x, w, tipo = 'texto', extra = {}) => ({ n: '', chave: `desloc${i + 1}_${k}`, rotulo: `Deslocamento ${i + 1}: ${r}`, tipo, caixa: { p: 1, x, y, w, h: 12.7 }, fonte: 7.5, larg: 2, quando: q, ...extra })
  return [t('data', 'data', 31.0, 73.4, 'data', { comoTexto: true }), t('uf', 'UF', 104.4, 44, 'uf', { larg: 1 }), t('municipio', 'município', 148.5, 180.8), t('pais', 'país', 329.3, 116.7), t('transporte', 'meio de transporte', 446.0, 116.6)]
})
const ALIMENTOS = [339.5, 326.7, 314.1, 301.4].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`alimento${i}_tipo`]
  return [
    txt('', `alimento${i + 1}_tipo`, `Alimento ${i + 1}: tipo`, { p: 1, x: 29.3, y, w: 184.2, h: 12.7 }, { fonte: 8, larg: 6, quando: q }),
    txt('', `alimento${i + 1}_local`, `Alimento ${i + 1}: local de consumo`, { p: 1, x: 213.5, y, w: 350.4, h: 12.7 }, { fonte: 8, larg: 6, quando: q }),
  ]
})
const OBS = [276.4, 262.4, 248.4, 234.5, 220.4, 206.7, 192.7, 178.7, 164.8, 150.8, 136.8, 122.9, 108.9, 95.0]

export default {
  id: 'FEBRE_TIFOIDE',
  titulo: 'Ficha de Investigação — Febre Tifoide',
  arquivo: 'Febre_Tifoide_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos e clínicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 58.4, [70.5, 86.3, 99.6, 112.8, 126.6, 141.1, 155.5], 164.8, 310.7, 11.9), {}),
        txt('32', 'ocupacao', 'Ocupação', { p: 0, x: 180, y: 312, w: 380, h: 10 }, { larg: 9 }),
        cod('33', 'contato', 'Contato compatível com caso de febre tifoide (até 45 dias antes do início dos sinais e sintomas)', [['1', 'Domicílio'], ['2', 'Vizinhança'], ['3', 'Trabalho'], ['4', 'Creche/escola'], ['5', 'Posto de saúde/hospital'], ['6', 'Outros estados/municípios'], ['7', 'Outros'], ['8', 'Sem história de contato'], ['9', 'Ignorado']], cx(0, 547.0, 296.6, 10.8, 11), { larg: 6 }),
        txt('33', 'contato_outro', 'Outro local de contato (qual?)', { p: 0, x: 116, y: 280, w: 180, h: 8 }, { fonte: 7, larg: 4, quando: (d) => d.contato === '7' }),
        txt('34', 'contato_nome', 'Nome do contato', { p: 0, x: 66, y: 252, w: 370, h: 10 }, { larg: 6, quando: comContato }),
        { n: '35', chave: 'contato_fone', rotulo: '(DDD) Telefone do contato', tipo: 'digitos', digitos: 11, celulas: cel([444.8, 453.8, 465.3, 477.2, 486.3, 497.7, 509.2, 520.6, 532.1, 543.6, 555.0, 567.6]), caixa: { p: 0, x: 444.8, y: 247.8, w: 122.8, h: 11.9 }, larg: 3, quando: comContato },
        cod('36', 'vinculo', 'Sugestão de vínculo com', [['1', 'Consumo de água não tratada'], ['2', 'Exposição a esgoto'], ['3', 'Alimento suspeito'], ['4', 'Deslocamento'], ['5', 'Outros'], ['9', 'Ignorado']], cx(0, 543.6, 231.4), { larg: 5 }),
        txt('36', 'vinculo_outros', 'Outro vínculo (qual?)', { p: 0, x: 458, y: 222, w: 52, h: 8 }, { fonte: 6.5, quando: (d) => d.vinculo === '5' }),
        ...SINAIS.map(([k, r, x, y]) => sni('37', `sinal_${k}`, `Sinais e sintomas: ${r}`, cx(0, x, y), {})),
        sni('38', 'complic_enterorragia', 'Complicações: enterorragia', cx(0, 205.4, 132.5)),
        sni('38', 'complic_perfuracao', 'Complicações: perfurações intestinais', cx(0, 291.1, 132.5)),
        sni('38', 'complic_outras', 'Complicações: outras', cx(0, 404.4, 132.5, 10.8, 11)),
        txt('38', 'complic_outras_espec', 'Outras complicações (quais?)', { p: 0, x: 447, y: 134, w: 102, h: 8 }, { fonte: 7, quando: sim('complic_outras') }),
      ],
    },
    {
      titulo: 'Atendimento',
      campos: [
        cod('39', 'tipo_atendimento', 'Tipo de atendimento', [['1', 'Hospitalar'], ['2', 'Ambulatorial'], ['3', 'Domiciliar'], ['4', 'Nenhum'], ['9', 'Ignorado']], cx(0, 382.8, 104.9)),
        data('40', 'data_atendimento', 'Data do atendimento', dataCel(0, 419.1, [431.1, 446.7, 460.0, 475.0, 488.8, 503.2, 517.6], 534.3, 93.2, 11.9), { quando: (d) => !!d.tipo_atendimento && !['4', '9'].includes(d.tipo_atendimento) }),
        { n: '41', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 540.5, y: 93.2, w: 27, h: 10 }, larg: 1, quando: hosp },
        txt('42', 'municipio_hospital', 'Município do hospital', { p: 0, x: 58, y: 66, w: 165, h: 9 }, { fonte: 7.5, quando: hosp }),
        { n: '42', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [237.2, 251.7, 266.1, 280.6, 295.0], 63.5), larg: 2, quando: hosp },
        txt('43', 'nome_hospital', 'Nome do hospital', { p: 0, x: 320, y: 66, w: 140, h: 9 }, { fonte: 7.5, quando: hosp }),
        { n: '43', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [474.9, 489.4, 503.8, 518.3, 532.8, 547.2], 63.5), larg: 2, quando: hosp },
      ],
    },
    {
      titulo: 'Dados do laboratório',
      campos: [
        sni('44', 'material_sangue', 'Material coletado: sangue', cx(0, 158.4, 43.7)),
        sni('44', 'material_fezes', 'Material coletado: fezes', cx(0, 214.3, 44.4, 10.8, 11)),
        sni('44', 'material_urina', 'Material coletado: urina', cx(0, 260.6, 43.7, 10.8, 11)),
        sni('45', 'antibiotico_antes', 'Uso de antibiótico antes da coleta do material', cx(0, 540.5, 46.8), { larg: 4 }),
        ...EXAMES,
      ],
    },
    {
      titulo: 'Tratamento',
      campos: [
        sni('47', 'atb_cloranfenicol', 'Antibióticos utilizados: cloranfenicol', cx(1, 127.7, 627.8)),
        sni('47', 'atb_quinolona', 'Antibióticos utilizados: quinolona', cx(1, 127.7, 611.5, 10.8, 11)),
        sni('47', 'atb_ampicilina', 'Antibióticos utilizados: ampicilina', cx(1, 208.8, 627.8, 10.8, 11)),
        sni('47', 'atb_sulfa', 'Antibióticos utilizados: sulfametoxazol + trimetoprima', cx(1, 294.2, 627.4, 10.8, 10.8)),
        sni('47', 'atb_outro', 'Antibióticos utilizados: outro', cx(1, 208.3, 613.0, 10.8, 11)),
        txt('47', 'atb_outro_espec', 'Outro antibiótico (qual?)', { p: 1, x: 244, y: 612, w: 120, h: 8 }, { fonte: 7, quando: sim('atb_outro') }),
        { n: '47', chave: 'tempo_uso', rotulo: 'Tempo de uso (dias)', tipo: 'digitos', digitos: 2, celulas: [[497.1, 509.2], [509.2, 525.9]], caixa: { p: 1, x: 497.1, y: 612.1, w: 28.8, h: 10 }, larg: 2 },
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('48', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 203.3, 586.1)),
        cod('49', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico']], cx(1, 524.2, 584.9, 11, 12.2)),
        cod('50', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(1, 295.9, 541.9), { larg: 4, quando: (d) => d.classificacao_final === '1' }),
        { n: '51', chave: 'uf_infeccao', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 335.5, y: 531.2, w: 26.9, h: 9 }, larg: 1, quando: naoAut },
        txt('52', 'pais_infeccao', 'País', { p: 1, x: 372, y: 532, w: 190, h: 10 }, { quando: naoAut }),
        txt('53', 'municipio_infeccao', 'Município', { p: 1, x: 52, y: 502, w: 140, h: 9 }, { fonte: 7.5, quando: naoAut }),
        { n: '53', chave: 'ibge_infeccao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [210.9, 225.4, 239.8, 254.3, 268.8], 499.5), larg: 2, quando: naoAut },
        txt('54', 'distrito_infeccao', 'Distrito', { p: 1, x: 292, y: 502, w: 140, h: 10 }, { quando: naoAut }),
        txt('55', 'bairro_infeccao', 'Bairro', { p: 1, x: 436, y: 502, w: 125, h: 10 }, { quando: naoAut }),
        sni('56', 'doenca_trabalho', 'Doença relacionada ao trabalho', cx(1, 148.1, 483.8)),
        cod('57', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito por febre tifoide'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 301.4, 483.8, 10.8, 11.3), { larg: 4 }),
        data('58', 'data_obito', 'Data do óbito', dataCel(1, 323.2, [335.2, 350.8, 364.8, 379.2, 392.9, 407.3, 421.7], 438.4, 468.2, 12), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('59', 'data_encerramento', 'Data do encerramento', dataCel(1, 446.9, [459.0, 473.8, 487.8, 502.9, 516.6, 531.0, 545.4], 562.1, 466.7, 12)),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      aviso: 'Deslocamento: datas e locais frequentados nos 45 dias anteriores ao início dos sinais e sintomas. Alimentos: consumidos na última semana e sugestivos de contaminação.',
      campos: [
        ...DESLOC,
        ...ALIMENTOS,
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: OBS.map((y) => ({ p: 1, x: 29, y, w: 533, h: 14 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 1, x: 58, y: 68, w: 400, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [477.9, 492.4, 506.8, 521.3, 535.8, 550.2], 61.5), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 58, y: 40, w: 190, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 268, y: 40, w: 195, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
