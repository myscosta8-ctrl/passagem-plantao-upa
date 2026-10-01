// Ficha de Investigação — Doenças Exantemáticas Febris: Sarampo/Rubéola (Sinan NET, SVS 13/09/2006) — Exantematica_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 444.0, y: 639, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 52.4, y: 608.5, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 96, y: 609, w: 370, h: 10 },
  ibge_notificacao: pente(0, [487.8, 502.2, 516.7, 531.1, 545.6], 605.5),
  unidade_notificadora: { p: 0, x: 67, y: 579, w: 265, h: 10 },
  cnes: pente(0, [347.1, 361.5, 376.0, 390.4, 404.9, 419.4], 578.5),
  data_primeiros_sintomas: { p: 0, x: 442.8, y: 580.4, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 67, y: 548, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 445.6, y: 547.1, w: 113.8, h: 11.9 },
  idade: pente(0, [72.9, 86.5], 517, 9),
  unidade_idade: { p: 0, x: 108.0, y: 524.6, w: 11, h: 11 },
  sexo: { p: 0, x: 230.6, y: 531.8, w: 10.8, h: 11 },
  gestante: { p: 0, x: 425.0, y: 531.8, w: 11, h: 10.8 },
  raca: { p: 0, x: 550.1, y: 531.1, w: 11, h: 10.8 },
  escolaridade: { p: 0, x: 550.6, y: 501.8, w: 11, h: 11 },
  cns: { p: 0, x: 51.9, y: 456.6, w: 175.3, h: 11.9 },
  nome_mae: { p: 0, x: 244, y: 458, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 52.0, y: 426.6, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 426, w: 228, h: 10 },
  ibge_residencia: pente(0, [335.8, 350.3, 364.8, 379.2, 393.7], 425.5),
  distrito: { p: 0, x: 425, y: 426, w: 140, h: 10 },
  bairro: { p: 0, x: 56, y: 401, w: 140, h: 10 },
  logradouro: { p: 0, x: 205, y: 401, w: 270, h: 10 },
  logradouro_codigo: pente(0, [489.6, 504.0, 518.4, 532.8, 547.2], 399.5),
  numero: { p: 0, x: 56, y: 377, w: 54, h: 10 },
  complemento: { p: 0, x: 120, y: 377, w: 290, h: 10 },
  geo1: { p: 0, x: 421, y: 377, w: 140, h: 10 },
  geo2: { p: 0, x: 56, y: 352, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 227, y: 352, w: 218, h: 10 },
  cep: { p: 0, x: 453.6, y: 349.3, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 52.5, y: 325.1, w: 148.0, h: 12.3 },
  zona: { p: 0, x: 331.2, y: 337.0, w: 11, h: 11 },
  pais: { p: 0, x: 366, y: 325, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, cel, extra = {}) => ({ n, chave, rotulo, tipo: 'data', larg: 3, ...cel, ...extra })
const sim = (k) => (d) => d[k] === '1'
const SORO = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const naoAut = (d) => d.autoctone === '2'

// [doença, chave, x IgM, x IgG] × amostras [rótulo, chave, y]
const SOROLOGIA = [['Sarampo', 'sarampo', 214.7, 229.6], ['Rubéola', 'rubeola', 322.5, 337.3], ['Outras exantemáticas', 'outras', 442.0, 456.6]]
  .flatMap(([doenca, k, xm, xg], j) => [['S1', 's1', 680.5 + (j === 2 ? 1 : 0)], ['S2', 's2', 661.7 + (j === 2 ? 0.9 : 0)], ['Reteste', 'rt', 643.3 + (j === 2 ? 1.1 : 0)]]
    .flatMap(([a, ka, y]) => [
      cod('48', `${k}_igm_${ka}`, `${doenca}: IgM ${a}`, SORO, cx(1, xm, y, 10.9, 10.9), { larg: 2 }),
      cod('48', `${k}_igg_${ka}`, `${doenca}: IgG ${a}`, SORO, cx(1, xg, y, 10.9, 10.9), { larg: 2 }),
    ]))

const DESLOC = [256.7, 243.9, 231.3].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`desloc${i}_municipio`]
  const t = (k, r, x, w, tipo = 'texto', extra = {}) => ({ n: '', chave: `desloc${i + 1}_${k}`, rotulo: `Deslocamento ${i + 1}: ${r}`, tipo, caixa: { p: 1, x, y, w, h: 12.7 }, fonte: 7.5, larg: 2, quando: q, ...extra })
  return [t('data', 'data', 31.0, 73.4, 'data', { comoTexto: true }), t('uf', 'UF', 104.4, 44, 'uf', { larg: 1 }), t('municipio', 'município', 148.5, 180.8), t('pais', 'país', 329.3, 116.7), t('transporte', 'meio de transporte', 446.0, 116.6)]
})

const VACINADOS = [['menor5', 'Menor de 5 anos', 529.5], ['5a14', 'De 5 a 14 anos', 518.5], ['15a39', 'De 15 a 39 anos', 507.5]]

export default {
  id: 'EXANTEMATICA',
  titulo: 'Ficha de Investigação — Doenças Exantemáticas Febris (Sarampo/Rubéola)',
  arquivo: 'Exantematica_v5.pdf',
  // Campo 2 (1 - Sarampo / 2 - Rubéola) pelo CID do diagnóstico, quando houver; senão o profissional escolhe.
  inicializar: (d, agravo) => {
    const c = String(agravo?.cidDiagnostico || '').toUpperCase()
    return { ...d, agravo_exantematica: d.agravo_exantematica || (c.startsWith('B05') ? '1' : c.startsWith('B06') ? '2' : '') }
  },
  secoes: [
    {
      titulo: 'Agravo',
      campos: [
        cod('2', 'agravo_exantematica', 'Doença investigada', [['1', 'Sarampo'], ['2', 'Rubéola']], cx(0, 350.4, 648.7, 11, 10.8), {}),
      ],
    },
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 57.2, [69.3, 84.8, 98.1, 113.2, 126.9, 141.3, 155.7], 172.4, 269.7, 11), {}),
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 185, y: 271, w: 375, h: 10 }, larg: 9 },
        sni('33', 'vacinado', 'Tomou vacina contra sarampo e rubéola (dupla ou tríplice viral)', cx(0, 415.7, 253.7, 11, 10.8), { larg: 4 }),
        data('34', 'data_ultima_dose', 'Data da última dose', dataCel(0, 441.4, [453.4, 468.6, 482.3, 496.9, 511.1, 525.5, 539.9], 556.6, 242.4, 12), { quando: sim('vacinado') }),
        cod('35', 'contato', 'Contato com caso suspeito ou confirmado de sarampo ou rubéola (até 23 dias antes do início dos sinais e sintomas)', [['1', 'Domicílio'], ['2', 'Vizinhança'], ['3', 'Trabalho'], ['4', 'Creche/escola'], ['5', 'Posto de saúde/hospital'], ['6', 'Outro estado/município'], ['7', 'Sem história de contato'], ['8', 'Outro país'], ['9', 'Ignorado']], cx(0, 538.6, 225.8, 11, 10.1), { larg: 6 }),
        { n: '36', chave: 'contato_nome', rotulo: 'Nome do contato', tipo: 'texto', caixa: { p: 0, x: 66, y: 183, w: 495, h: 10 }, larg: 6, quando: (d) => d.contato && !['7', '9'].includes(d.contato) },
        { n: '37', chave: 'contato_endereco', rotulo: 'Endereço do contato (rua, av., apto., bairro, localidade etc.)', tipo: 'texto', caixa: { p: 0, x: 66, y: 157, w: 495, h: 9 }, larg: 6, quando: (d) => d.contato && !['7', '9'].includes(d.contato) },
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        data('38', 'data_exantema', 'Data do início do exantema (manchas vermelhas no corpo)', dataCel(0, 63.5, [75.5, 90.6, 104.3, 119.0, 133.1, 147.5, 161.9], 178.7, 119.6, 11.9), {}),
        data('39', 'data_febre', 'Data do início da febre', dataCel(0, 190.4, [202.5, 218.0, 231.3, 246.4, 260.1, 274.5, 288.9], 301, 119.9, 11)),
        sni('40', 'sinal_tosse', 'Tosse', cx(0, 89.3, 93.6, 10.8, 10.8), {}),
        sni('40', 'sinal_coriza', 'Coriza (nariz escorrendo)', cx(0, 89.3, 77.3, 10.8, 11), {}),
        sni('40', 'sinal_conjuntivite', 'Conjuntivite (olhos avermelhados)', cx(0, 89.3, 60.0, 10.8, 11), {}),
        sni('40', 'sinal_artralgia', 'Artralgia/artrite (dores nas juntas)', cx(0, 280.8, 94.3), {}),
        sni('40', 'sinal_ganglios', 'Gânglios retroauriculares/occipitais (caroços atrás da orelha/pescoço)', cx(0, 280.8, 77.3, 11, 10.8), {}),
        sni('40', 'sinal_dor_retroocular', 'Dor retro-ocular (dor acima/atrás dos olhos)', cx(0, 280.8, 61.0), {}),
      ],
    },
    {
      titulo: 'Atendimento',
      campos: [
        sni('41', 'hospitalizacao', 'Ocorreu hospitalização', cx(1, 375.8, 796.8)),
        data('42', 'data_internacao', 'Data da internação', dataCel(1, 418.3, [430.3, 445.5, 459.2, 473.8, 488.0, 502.4, 516.8], 533.5, 784.2, 11.9), { quando: sim('hospitalizacao') }),
        { n: '43', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 535.5, y: 785, w: 27, h: 10 }, larg: 1, quando: sim('hospitalizacao') },
        { n: '44', chave: 'municipio_hospital', rotulo: 'Município do hospital', tipo: 'texto', caixa: { p: 1, x: 58, y: 760, w: 150, h: 9 }, fonte: 7.5, larg: 4, quando: sim('hospitalizacao') },
        { n: '44', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [222.9, 237.3, 251.8, 266.2, 280.7], 754.5), larg: 2, quando: sim('hospitalizacao') },
        { n: '45', chave: 'nome_hospital', rotulo: 'Nome do hospital', tipo: 'texto', caixa: { p: 1, x: 304, y: 760, w: 156, h: 9 }, fonte: 7.5, larg: 4, quando: sim('hospitalizacao') },
        { n: '45', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(1, [474.2, 488.7, 503.1, 517.6, 532.0, 546.5], 754.5), larg: 2, quando: sim('hospitalizacao') },
      ],
    },
    {
      titulo: 'Dados do laboratório — exame sorológico',
      aviso: 'Resultado (48): 1 - Reagente, 2 - Não reagente, 3 - Inconclusivo, 4 - Não realizado.',
      campos: [
        data('46', 'data_coleta_s1', 'Data da coleta da 1ª amostra (S1)', dataCel(1, 71.6, [83.6, 99.1, 113.3, 128.9, 141.6, 156.1, 170.5], 182.2, 722.2, 11.9)),
        data('47', 'data_coleta_s2', 'Data da coleta da 2ª amostra (S2)', dataCel(1, 217.4, [229.4, 244.9, 259.1, 274.7, 287.4, 301.8, 316.2], 328, 722.9, 11.9)),
        ...SOROLOGIA,
        cod('48', 'outras_exantematicas', 'Outras exantemáticas: qual', [['1', 'Dengue'], ['2', 'Parvovírus B19'], ['3', 'Herpes vírus 6'], ['4', 'Outras']], cx(1, 494.4, 704.9, 10.8, 10.8), { larg: 4 }),
      ],
    },
    {
      titulo: 'Isolamento viral',
      campos: [
        sni('49', 'amostra_sangue', 'Amostra clínica coletada: sangue total', cx(1, 265.9, 620.4, 11, 10.8)),
        sni('49', 'amostra_nasofaringe', 'Amostra clínica coletada: secreção nasofaríngea', cx(1, 265.9, 605.0, 11, 10.8)),
        sni('49', 'amostra_urina', 'Amostra clínica coletada: urina', cx(1, 403.7, 620.4, 10.8, 10.8)),
        sni('49', 'amostra_liquor', 'Amostra clínica coletada: líquor', cx(1, 403.7, 606.0, 10.8, 10.8)),
        cod('50', 'etiologia_viral', 'Etiologia viral', [['1', 'Vírus sarampo selvagem'], ['2', 'Vírus sarampo vacinal'], ['3', 'Vírus rubéola selvagem'], ['4', 'Vírus rubéola vacinal'], ['5', 'Dengue'], ['6', 'Herpes vírus tipo 6'], ['7', 'Parvovírus B19'], ['8', 'Enterovírus'], ['9', 'Outras'], ['10', 'Não detectado']], cx(1, 544.1, 586.8, 10.8, 11), { larg: 5, fonte: 7 }),
        { n: '50', chave: 'etiologia_outras', rotulo: 'Outra etiologia (qual?)', tipo: 'texto', caixa: { p: 1, x: 428, y: 563.5, w: 48, h: 8 }, fonte: 6, larg: 3, quando: (d) => d.etiologia_viral === '9' },
      ],
    },
    {
      titulo: 'Medidas de controle',
      campos: [
        cod('51', 'bloqueio_vacinal', 'Realizou bloqueio vacinal', [['1', 'Sim'], ['2', 'Não'], ['3', 'Não, todos vacinados'], ['4', 'Não, sem história de contato'], ['9', 'Ignorado']], cx(1, 224.2, 542.2, 10.8, 10.8), { larg: 4 }),
        ...VACINADOS.map(([k, r, y]) => ({ n: '52', chave: `vacinados_${k}`, rotulo: `Pessoas vacinadas: ${r}`, tipo: 'digitos', digitos: 3, celulas: [[341.5, 355.6], [355.6, 369.7], [369.7, 383.8]], caixa: { p: 1, x: 341.5, y, w: 42.3, h: 8 }, fonte: 7, larg: 2, quando: sim('bloqueio_vacinal') })),
        cod('53', 'intervalo_bloqueio', 'Intervalo de tempo do bloqueio', [['1', 'Em até 72 horas'], ['2', 'Após 72 horas'], ['9', 'Ignorado']], cx(1, 539.0, 530.9, 10.8, 12.2), { quando: sim('bloqueio_vacinal') }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('54', 'classificacao_final', 'Classificação final', [['1', 'Sarampo'], ['2', 'Rubéola'], ['3', 'Descartado']], cx(1, 207.8, 489.6, 11, 10.8)),
        cod('55', 'criterio', 'Critério de confirmação ou descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico'], ['3', 'Clínico'], ['4', 'Data da última dose da vacina']], cx(1, 533.3, 489.4, 10.8, 12.2), { larg: 4 }),
        cod('56', 'classificacao_descartado', 'Classificação final do caso descartado', [['1', 'Dengue'], ['2', 'Escarlatina'], ['3', 'Exantema súbito (herpes vírus tipo 6)'], ['4', 'Eritema infeccioso (parvovírus B19)'], ['5', 'Enterovirose'], ['6', 'Evento temporal relacionado à vacina'], ['7', 'IgM associado temporalmente à vacina'], ['8', 'Sem soroconversão dos anticorpos IgG'], ['9', 'Ignorado']], cx(1, 542.6, 452.9, 11, 11.3), { larg: 6, quando: (d) => d.classificacao_final === '3' }),
        cod('57', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(1, 299.5, 389.5), { larg: 4, quando: (d) => ['1', '2'].includes(d.classificacao_final) }),
        { n: '58', chave: 'uf_infeccao', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 339.2, y: 378.9, w: 26.9, h: 9 }, larg: 1, quando: naoAut },
        { n: '59', chave: 'pais_infeccao', rotulo: 'País', tipo: 'texto', caixa: { p: 1, x: 378, y: 380, w: 182, h: 10 }, larg: 3, quando: naoAut },
        { n: '60', chave: 'municipio_infeccao', rotulo: 'Município', tipo: 'texto', caixa: { p: 1, x: 52, y: 350, w: 148, h: 10 }, fonte: 7.5, larg: 3, quando: naoAut },
        { n: '60', chave: 'ibge_infeccao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [214.6, 229.1, 243.6, 258.0, 272.5], 347.5), larg: 2, quando: naoAut },
        { n: '61', chave: 'distrito_infeccao', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 1, x: 296, y: 350, w: 140, h: 10 }, larg: 2, quando: naoAut },
        { n: '62', chave: 'bairro_infeccao', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 1, x: 440, y: 350, w: 124, h: 10 }, larg: 2, quando: naoAut },
        cod('63', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito por doenças exantemáticas'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 283.4, 332.6, 11, 11.3), { larg: 4 }),
        data('64', 'data_obito', 'Data do óbito', dataCel(1, 311.8, [323.8, 339.0, 352.7, 367.3, 381.5, 395.9, 410.3], 427, 318.2, 11.9), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('65', 'data_encerramento', 'Data do encerramento', dataCel(1, 444.0, [456.1, 471.3, 484.9, 499.6, 513.7, 528.1, 542.5], 559.2, 318.2, 11.9)),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      aviso: 'Deslocamento: datas e locais frequentados no período de 7 a 23 dias anteriores ao início de sinais e sintomas.',
      campos: [
        ...DESLOC,
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [196.7, 184.6, 172.4, 160.2, 148.4, 136.2, 124.3].map((y) => ({ p: 1, x: 31, y, w: 535, h: 12 })), fonte: 7.5, larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 56, y: 93, w: 400, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [478.3, 492.8, 507.3, 521.7, 536.2, 550.6], 88.5), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 56, y: 63, w: 195, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 258, y: 63, w: 200, h: 10 }, larg: 6 },
      ],
    },
  ],
}
