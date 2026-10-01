// Ficha de Investigação — Doença de Chagas Aguda (Sinan NET, SVS 08/10/2009) — Chagas_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 446.3, y: 603, w: 115.3, h: 12 },
  uf_notificacao: { p: 0, x: 52.9, y: 574.4, w: 27, h: 11.9 },
  municipio_notificacao: { p: 0, x: 97, y: 575, w: 370, h: 10 },
  ibge_notificacao: pente(0, [488.3, 502.7, 517.1, 531.5, 545.9], 572.5),
  unidade_notificadora: { p: 0, x: 68, y: 545, w: 265, h: 10 },
  cnes: pente(0, [348.8, 363.2, 377.6, 392.0, 406.4, 420.8], 544.5),
  data_primeiros_sintomas: { p: 0, x: 443.4, y: 546, w: 115.3, h: 12 },
  nome: { p: 0, x: 68, y: 517, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 447.1, y: 516, w: 113.9, h: 12 },
  idade: pente(0, [74.4, 88.2], 486, 9),
  unidade_idade: { p: 0, x: 109.4, y: 493.4, w: 11, h: 10.8 },
  sexo: { p: 0, x: 232.1, y: 500.6, w: 10.8, h: 10.8 },
  gestante: { p: 0, x: 426.5, y: 500.4, w: 11, h: 11 },
  raca: { p: 0, x: 551.5, y: 499.7, w: 11, h: 11 },
  escolaridade: { p: 0, x: 552.0, y: 470.6, w: 11, h: 11 },
  cns: { p: 0, x: 53.4, y: 425.2, w: 175.3, h: 12.1 },
  nome_mae: { p: 0, x: 245, y: 426, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 53.8, y: 395.2, w: 27, h: 11.9 },
  municipio_residencia: { p: 0, x: 92, y: 395, w: 228, h: 10 },
  ibge_residencia: pente(0, [337.6, 352.0, 366.4, 380.8, 395.2], 394.5),
  distrito: { p: 0, x: 427, y: 394, w: 140, h: 10 },
  bairro: { p: 0, x: 57, y: 370, w: 140, h: 10 },
  logradouro: { p: 0, x: 207, y: 369, w: 270, h: 10 },
  logradouro_codigo: pente(0, [491.3, 505.7, 520.1, 534.5, 548.9], 367.5),
  numero: { p: 0, x: 58, y: 346, w: 54, h: 10 },
  complemento: { p: 0, x: 122, y: 346, w: 290, h: 10 },
  geo1: { p: 0, x: 423, y: 345, w: 140, h: 10 },
  geo2: { p: 0, x: 57, y: 320, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 229, y: 320, w: 218, h: 10 },
  cep: { p: 0, x: 455.3, y: 317.8, w: 110.9, h: 11.9 },
  telefone: { p: 0, x: 54.2, y: 293.6, w: 148.1, h: 12.4 },
  zona: { p: 0, x: 332.9, y: 305.5, w: 11, h: 11 },
  pais: { p: 0, x: 368, y: 294, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'data', caixa, larg: 3, ...extra })
const SNA = [['1', 'Sim'], ['2', 'Não'], ['3', 'Não se aplica'], ['9', 'Ignorado']]
const PARASITO = [['1', 'Positivo'], ['2', 'Negativo'], ['3', 'Não realizado']]
const SORO = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const casas = (l) => l.map((s) => s.split('-').map(Number))
const titulo = (n, chave, rotulo, cel, y, quando) => ({ n, chave, rotulo, tipo: 'digitos', digitos: 4, celulas: casas(cel), caixa: { p: 1, x: Number(cel[0].split('-')[0]), y, w: 58, h: 12 }, larg: 2, quando })
const reag = (k) => (d) => d[k] === '1'
const T1 = [69.4, 85.0, 98.2, 113.4, 127.0, 141.4, 155.8]
const mais = (l, d) => l.map((v) => +(v + d).toFixed(1))

const DESLOC = [195.3, 180.4, 165.5].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`desloc${i}_municipio`]
  return [
    { n: '33', chave: `desloc${i + 1}_uf`, rotulo: `Deslocamento ${i + 1}: UF`, tipo: 'uf', caixa: { p: 0, x: 58.8, y, w: 103.4, h: 14.5 }, larg: 1, quando: q },
    { n: '33', chave: `desloc${i + 1}_municipio`, rotulo: `Deslocamento ${i + 1}: município`, tipo: 'texto', caixa: { p: 0, x: 164, y, w: 400, h: 14.5 }, fonte: 8.5, larg: 5, quando: q },
  ]
})

const SINAIS = [['assintomatico', 'Assintomático', 71.8, 788.6], ['febre', 'Febre persistente', 71.8, 772.3], ['astenia', 'Astenia', 71.8, 755.5],
  ['edema', 'Edema de face/membros', 154.8, 788.6], ['hepatomegalia', 'Hepatomegalia', 154.8, 771.6], ['esplenomegalia', 'Esplenomegalia', 154.8, 756.2],
  ['meningoencefalite', 'Sinais de meningoencefalite', 257.5, 789.6], ['icc', 'Sinais de ICC', 257.0, 775.4], ['chagoma', 'Chagoma de inoculação/sinal de Romaña', 257.0, 758.9],
  ['poliadenopatia', 'Poliadenopatia', 422.6, 793.7], ['taquicardia', 'Taquicardia persistente/arritmias', 422.6, 779.0], ['outros', 'Outros', 422.6, 763.7]]

export default {
  id: 'CHAGAS',
  titulo: 'Ficha de Investigação — Doença de Chagas Aguda',
  arquivo: 'Chagas_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', { p: 0, x: 62.6, y: 243.9, w: 115.3, h: 12 }, { obrig: true }),
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 190, y: 245, w: 372, h: 10 }, larg: 9 },
        ...DESLOC,
        cod('34', 'vestigios', 'Presença de vestígios de triatomíneos intradomicílio', [['1', 'Sim'], ['2', 'Não'], ['3', 'Não realizado'], ['9', 'Ignorado']], cx(0, 256.1, 142.3, 11, 10.8), { larg: 4, obrig: true }),
        data('35', 'data_vestigios', 'Data de encontro dos vestígios', { p: 0, x: 274.8, y: 135.2, w: 115.3, h: 12 }, { quando: reag('vestigios') }),
        sni('36', 'uso_sangue', 'História de uso de sangue ou hemoderivados nos últimos 120 dias', cx(0, 546.5, 149.3), { larg: 4, obrig: true }),
        cod('37', 'controle_sorologico', 'Existência de controle sorológico na unidade de hemoterapia', SNA, cx(0, 309.6, 119.8), { larg: 4 }),
        cod('38', 'manipulacao_tcruzi', 'Manipulação/contato de material com T. cruzi', SNA, cx(0, 552.2, 123.1, 11, 10.8), { larg: 4 }),
        cod('39', 'mae_chagasica', 'Menor ou igual a 9 meses de idade: mãe com infecção chagásica', SNA, cx(0, 308.9, 80.4), { larg: 4 }),
        sni('40', 'transmissao_oral', 'Possibilidade de transmissão por via oral', cx(0, 551.8, 81.8), { larg: 4, obrig: true }),
      ],
    },
    {
      titulo: 'Dados clínicos — sinais e sintomas',
      campos: [
        ...SINAIS.map(([k, r, x, y]) => sni('41', `sinal_${k}`, r, cx(1, x, y), { obrig: true })),
        { n: '41', chave: 'sinal_outros_espec', rotulo: 'Outros sinais (quais?)', tipo: 'texto', caixa: { p: 1, x: 468, y: 765, w: 92, h: 8 }, fonte: 7, larg: 3, quando: reag('sinal_outros') },
      ],
    },
    {
      titulo: 'Dados do laboratório',
      campos: [
        data('42', 'data_coleta_direto', 'Parasitológico direto: data da coleta', null, dataCel(1, 57.4, T1, 165.5, 704.5)),
        cod('43', 'direto_fresco', 'Parasitológico direto: exame a fresco/gota espessa/esfregaço', PARASITO, cx(1, 350.4, 720.5), { larg: 4 }),
        cod('43', 'direto_strout', 'Parasitológico direto: Strout/micro-hematócrito/QBC', PARASITO, cx(1, 350.9, 707.0, 11, 10.8), { larg: 4 }),
        cod('43', 'direto_outro', 'Parasitológico direto: outro', PARASITO, cx(1, 524.9, 721.9), { larg: 4 }),
        data('44', 'data_coleta_indireto', 'Parasitológico indireto: data da coleta', null, dataCel(1, 57.4, T1, 165.5, 665.5)),
        cod('45', 'indireto_xeno', 'Parasitológico indireto: xenodiagnóstico', PARASITO, cx(1, 384.2, 673.4), { larg: 4 }),
        cod('45', 'indireto_hemocultivo', 'Parasitológico indireto: hemocultivo', PARASITO, cx(1, 499.4, 672.5), { larg: 4 }),
        data('46', 'data_coleta_s1', 'Sorologia: data da coleta S1', null, dataCel(1, 57.4, T1, 165.5, 624.2)),
        data('47', 'data_coleta_s2', 'Sorologia: data da coleta S2', null, dataCel(1, 58.2, mais(T1, 0.8), 166.3, 588.9)),
        cod('48', 'elisa_igm_s1', 'ELISA IgM S1', SORO, cx(1, 286.6, 617.0)),
        cod('48', 'elisa_igg_s1', 'ELISA IgG S1', SORO, cx(1, 320.4, 618.5)),
        cod('48', 'elisa_igm_s2', 'ELISA IgM S2', SORO, cx(1, 286.6, 604.1)),
        cod('48', 'elisa_igg_s2', 'ELISA IgG S2', SORO, cx(1, 320.4, 605.5)),
        cod('49', 'hemaglut_igm_s1', 'Hemaglutinação IgM S1', SORO, cx(1, 479.5, 614.9, 10.8, 11)),
        cod('49', 'hemaglut_igg_s1', 'Hemaglutinação IgG S1', SORO, cx(1, 513.1, 616.3)),
        cod('49', 'hemaglut_igm_s2', 'Hemaglutinação IgM S2', SORO, cx(1, 479.5, 601.9, 10.8, 10.8)),
        cod('49', 'hemaglut_igg_s2', 'Hemaglutinação IgG S2', SORO, cx(1, 513.1, 603.4, 11, 10.8)),
        cod('50', 'ifi_igm_s1', 'IFI IgM S1', SORO, cx(1, 204.0, 551.3)),
        titulo('50', 'ifi_igm_s1_titulo', 'IFI IgM S1: título (1:)', ['261.6-273.7', '273.7-288.1', '288.1-302.5', '302.5-319.3'], 546.1, reag('ifi_igm_s1')),
        cod('50', 'ifi_igm_s2', 'IFI IgM S2', SORO, cx(1, 204.7, 523.4, 11, 10.8)),
        titulo('50', 'ifi_igm_s2_titulo', 'IFI IgM S2: título (1:)', ['261.4-273.5', '273.5-287.9', '287.9-302.3', '302.3-319.1'], 523.2, reag('ifi_igm_s2')),
        cod('50', 'ifi_igg_s1', 'IFI IgG S1', SORO, cx(1, 403.0, 551.3, 10.8, 11)),
        titulo('50', 'ifi_igg_s1_titulo', 'IFI IgG S1: título (1:)', ['460.4-472.4', '472.4-486.8', '486.8-501.2', '501.2-518.1'], 546.1, reag('ifi_igg_s1')),
        cod('50', 'ifi_igg_s2', 'IFI IgG S2', SORO, cx(1, 403.7, 523.4, 10.8, 10.8)),
        titulo('50', 'ifi_igg_s2_titulo', 'IFI IgG S2: título (1:)', ['460.2-472.3', '472.3-486.7', '486.7-501.1', '501.1-517.9'], 523.2, reag('ifi_igg_s2')),
        data('51', 'data_coleta_histo', 'Data da coleta do histopatológico', null, dataCel(1, 60.5, [72.5, 88.1, 101.3, 116.4, 130.1, 144.5, 158.9], 168.6, 481.0)),
        cod('52', 'histopatologico', 'Resultado do histopatológico (biópsia/necrópsia)', [['1', 'Positivo'], ['2', 'Negativo'], ['3', 'Não realizado'], ['9', 'Ignorado']], cx(1, 543.4, 496.3), { larg: 4 }),
      ],
    },
    {
      titulo: 'Tratamento e medidas de controle',
      campos: [
        sni('53', 'trat_especifico', 'Tipo de tratamento: específico', cx(1, 178.6, 463.4, 10.8, 10.8)),
        sni('53', 'trat_sintomatico', 'Tipo de tratamento: sintomático', cx(1, 178.8, 450.0, 11, 10.8)),
        cod('54', 'droga', 'Droga utilizada no tratamento específico', [['1', 'Benznidazol'], ['2', 'Outro']], cx(1, 406.6, 455.0, 10.8, 11), { quando: reag('trat_especifico') }),
        { n: '55', chave: 'tempo_tratamento', rotulo: 'Tempo de tratamento (em dias)', tipo: 'digitos', digitos: 4, caixa: pente(1, [492.2, 511.5, 530.9], 445.5, 10), larg: 2, quando: reag('trat_especifico') },
        cod('56', 'medida_triatomineos', 'Medidas tomadas: controle de triatomíneos', SNA, cx(1, 145.2, 409.4), { larg: 4 }),
        cod('56', 'medida_fiscalizacao', 'Medidas tomadas: fiscalização sanitária em unidade de hemoterapia', SNA, cx(1, 145.0, 393.1), { larg: 4 }),
        cod('56', 'medida_biosseguranca', 'Medidas tomadas: implantação de normas de biossegurança em laboratório', SNA, cx(1, 343.4, 409.2, 11, 10.8), { larg: 4 }),
        cod('56', 'medida_outros', 'Medidas tomadas: outros', SNA, cx(1, 343.4, 392.2, 11, 10.8), { larg: 4 }),
        { n: '56', chave: 'medida_outros_espec', rotulo: 'Outras medidas (quais?)', tipo: 'texto', caixa: { p: 1, x: 386, y: 394, w: 168, h: 8 }, fonte: 7, larg: 4, quando: reag('medida_outros') },
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('57', 'classificacao_final', 'Classificação final', [['1', 'Confirmado'], ['2', 'Descartado']], cx(1, 144.7, 370.1)),
        cod('58', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratório'], ['2', 'Clínico-epidemiológico'], ['3', 'Clínico']], cx(1, 273.4, 361.4, 12.5, 12.2)),
        cod('59', 'evolucao', 'Evolução do caso', [['1', 'Vivo'], ['2', 'Óbito por doença de Chagas aguda'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 426.0, 370.8), { larg: 4 }),
        data('60', 'data_obito', 'Data do óbito', null, { ...dataCel(1, 451.2, [463.2, 478.8, 492.1, 507.2, 520.9, 535.3, 549.7], 559.3, 349.0), quando: (d) => ['2', '3'].includes(d.evolucao) }),
        cod('61', 'modo_infeccao', 'Modo provável da infecção', [['1', 'Transfusional'], ['2', 'Vetorial'], ['3', 'Vertical'], ['4', 'Acidental'], ['5', 'Oral'], ['6', 'Outra'], ['9', 'Ignorada']], cx(1, 295.2, 321.4), { larg: 4, quando: (d) => d.classificacao_final === '1' }),
        { n: '61', chave: 'modo_infeccao_outra', rotulo: 'Outro modo (qual?)', tipo: 'texto', caixa: { p: 1, x: 192, y: 305.5, w: 66, h: 8 }, fonte: 6.5, larg: 3, quando: (d) => d.modo_infeccao === '6' },
        cod('62', 'local_infeccao', 'Local provável da infecção (no período de 120 dias)', [['1', 'Unidade de hemoterapia'], ['2', 'Domicílio'], ['3', 'Laboratório'], ['4', 'Outro'], ['9', 'Ignorado']], cx(1, 550.6, 321.4), { larg: 4, quando: (d) => d.classificacao_final === '1' }),
        cod('63', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(1, 300.7, 284.2), { larg: 4, quando: (d) => d.classificacao_final === '1' }),
        { n: '64', chave: 'uf_infeccao', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 340.4, y: 273.4, w: 27, h: 9.1 }, larg: 1, quando: (d) => d.autoctone === '2' },
        { n: '65', chave: 'pais_infeccao', rotulo: 'País', tipo: 'texto', caixa: { p: 1, x: 378, y: 274, w: 182, h: 10 }, larg: 3, quando: (d) => d.autoctone === '2' },
        { n: '66', chave: 'municipio_infeccao', rotulo: 'Município', tipo: 'texto', caixa: { p: 1, x: 52, y: 244, w: 150, h: 10 }, fonte: 7.5, larg: 3, quando: (d) => d.autoctone === '2' },
        { n: '66', chave: 'ibge_infeccao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [215.8, 230.2, 244.6, 259.0, 273.4], 242.5), larg: 2, quando: (d) => d.autoctone === '2' },
        { n: '67', chave: 'distrito_infeccao', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 1, x: 296, y: 244, w: 140, h: 10 }, larg: 2, quando: (d) => d.autoctone === '2' },
        { n: '68', chave: 'bairro_infeccao', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 1, x: 441, y: 244, w: 122, h: 10 }, larg: 2, quando: (d) => d.autoctone === '2' },
        sni('69', 'doenca_trabalho', 'Doença relacionada ao trabalho', cx(1, 423.8, 226.8, 11, 12.5)),
        data('70', 'data_encerramento', 'Data do encerramento', null, dataCel(1, 450.2, [462.2, 477.8, 491.1, 506.2, 519.9, 534.3, 548.7], 558.3, 214.8)),
      ],
    },
    {
      titulo: 'Observações',
      campos: [
        { n: '', chave: 'observacoes', rotulo: 'Observações', tipo: 'texto_longo', linhas: [176.6, 160.8, 145.0, 129.4, 113.7].map((y) => ({ p: 1, x: 30, y, w: 535, h: 15.5 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 56, y: 84, w: 400, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [477.5, 491.9, 506.3, 520.7, 535.1, 549.5], 77.5), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 56, y: 54, w: 190, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 266, y: 54, w: 200, h: 10 }, larg: 6 },
      ],
    },
  ],
}
