// Ficha de Investigação — Febre Amarela (Sinan NET, SVS 17/01/2011) — Febre_Amarela_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente, dataCel } from './comum'

const g = {
  data_notificacao: { p: 0, x: 441.8, y: 690.5, w: 115.4, h: 12.2 },
  uf_notificacao: { p: 0, x: 50.2, y: 660.0, w: 26.9, h: 12 },
  municipio_notificacao: { p: 0, x: 94, y: 660, w: 370, h: 10 },
  ibge_notificacao: pente(0, [485.0, 499.9, 514.8, 529.7, 544.5], 658.5),
  unidade_notificadora: { p: 0, x: 65, y: 630, w: 265, h: 10 },
  cnes: pente(0, [346.3, 361.2, 376.1, 390.9, 405.8, 420.7], 629.5),
  data_primeiros_sintomas: { p: 0, x: 440.6, y: 631.9, w: 115.4, h: 12 },
  nome: { p: 0, x: 65, y: 603, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 444.2, y: 601.2, w: 114.0, h: 12.2 },
  idade: pente(0, [72.0, 86.1], 571, 9),
  unidade_idade: { p: 0, x: 106.6, y: 579.1, w: 11, h: 10.8 },
  sexo: { p: 0, x: 229.2, y: 586.3, w: 11, h: 10.8 },
  gestante: { p: 0, x: 423.8, y: 586.1, w: 10.8, h: 11 },
  raca: { p: 0, x: 548.9, y: 585.4, w: 10.8, h: 11 },
  escolaridade: { p: 0, x: 549.1, y: 556.3, w: 11, h: 11 },
  cns: { p: 0, x: 50.6, y: 511.0, w: 175.2, h: 12 },
  nome_mae: { p: 0, x: 243, y: 512, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 50.6, y: 482.4, w: 27.1, h: 12 },
  municipio_residencia: { p: 0, x: 90, y: 482, w: 228, h: 10 },
  ibge_residencia: pente(0, [335.0, 349.9, 364.8, 379.7, 394.5], 481.5),
  distrito: { p: 0, x: 424, y: 481, w: 140, h: 10 },
  bairro: { p: 0, x: 54, y: 457, w: 140, h: 10 },
  logradouro: { p: 0, x: 204, y: 456, w: 270, h: 10 },
  logradouro_codigo: pente(0, [488.9, 503.8, 518.6, 533.5, 548.4], 454.5),
  numero: { p: 0, x: 55, y: 432, w: 54, h: 10 },
  complemento: { p: 0, x: 119, y: 432, w: 290, h: 10 },
  geo1: { p: 0, x: 420, y: 432, w: 140, h: 10 },
  geo2: { p: 0, x: 54, y: 407, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 226, y: 407, w: 218, h: 10 },
  cep: { p: 0, x: 452.4, y: 405.1, w: 110.9, h: 12 },
  telefone: { p: 0, x: 51.1, y: 380.9, w: 148.1, h: 12.2 },
  zona: { p: 0, x: 330.0, y: 392.9, w: 11, h: 11 },
  pais: { p: 0, x: 365, y: 381, w: 195, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const sni = (n, chave, rotulo, caixa, extra = {}) => cod(n, chave, rotulo, SIM_NAO_IGN, caixa, extra)
const data = (n, chave, rotulo, cel, extra = {}) => ({ n, chave, rotulo, tipo: 'data', larg: 3, ...cel, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 3, ...extra })
const sim = (k) => (d) => d[k] === '1'
const RES4 = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const POS4 = [['1', 'Positivo'], ['2', 'Negativo'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const naoAut = (d) => d.autoctone === '2'

const DESLOC = [386.5, 369, 351.5].flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`desloc${i}_municipio`]
  const t = (k, r, x, w, tipo = 'texto', extra = {}) => ({ n: '', chave: `desloc${i + 1}_${k}`, rotulo: `Deslocamento ${i + 1}: ${r}`, tipo, caixa: { p: 1, x, y, w, h: 16 }, fonte: 8, larg: 2, quando: q, ...extra })
  return [t('data', 'data', 18.6, 75.2, 'data', { comoTexto: true }), t('uf', 'UF', 94.1, 45.1, 'uf', { larg: 1 }), t('municipio', 'município', 139.4, 186.5), t('pais', 'país', 326.2, 120.2), t('transporte', 'meio de transporte', 446.6, 120.3)]
})

export default {
  id: 'FEBRE_AMARELA',
  titulo: 'Ficha de Investigação — Febre Amarela',
  arquivo: 'Febre_Amarela_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        data('31', 'data_investigacao', 'Data da investigação', dataCel(0, 56.9, [69.4, 84.7, 98.6, 111.4, 125.8, 140.6, 155.5], 163.4, 331, 12), { obrig: true }),
        txt('32', 'ocupacao', 'Ocupação', { p: 0, x: 175, y: 332, w: 385, h: 10 }, { larg: 9 }),
        sni('33', 'epizootias', 'Investigação entomológica/epizootias: ocorrência de epizootias (mortandade de macacos)', cx(0, 189.8, 296.6, 15.8, 15.4), { larg: 6 }),
        sni('33', 'isolamento_mosquitos', 'Investigação entomológica: isolamento de vírus em mosquitos', cx(0, 190.1, 280.1, 15.6, 14.4), { larg: 6 }),
        sni('33', 'aedes_urbano', 'Presença de mosquito Aedes aegypti em área urbana (observar período de viremia do paciente)', cx(0, 190.1, 263.5, 15.6, 14.4), { larg: 6 }),
        sni('34', 'vacinado', 'Vacinado contra febre amarela', cx(0, 376.8, 239.0, 12.7, 12.7), { larg: 4, obrig: true }),
        data('35', 'data_vacina', 'Caso afirmativo: data da vacinação', dataCel(0, 413.3, [425.8, 440.4, 454.8, 468.7, 483.6, 498.5, 513.4], 526.6, 232.3, 11), { quando: sim('vacinado') }),
        { n: '36', chave: 'uf_vacina', rotulo: 'UF da vacinação', tipo: 'uf', caixa: { p: 0, x: 534, y: 232.3, w: 27, h: 10 }, larg: 1, quando: sim('vacinado') },
        txt('37', 'municipio_vacina', 'Município da vacinação', { p: 0, x: 52, y: 206, w: 165, h: 9 }, { fonte: 7.5, quando: sim('vacinado') }),
        { n: '37', chave: 'ibge_vacina', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [229.9, 244.8, 259.7, 274.5, 289.4], 204.5), larg: 2, quando: sim('vacinado') },
        txt('38', 'unidade_vacina', 'Unidade de saúde da vacinação', { p: 0, x: 312, y: 206, w: 160, h: 9 }, { fonte: 7.5, quando: sim('vacinado') }),
        { n: '38', chave: 'cnes_vacina', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: { p: 0, x: 476, y: 206, w: 86, h: 10 }, larg: 2, quando: sim('vacinado') },
      ],
    },
    {
      titulo: 'Dados clínicos e atendimento',
      campos: [
        sni('39', 'sinal_dor_abdominal', 'Dor abdominal', cx(0, 61.4, 175.2, 10.8, 12.2), { obrig: true }),
        sni('39', 'sinal_faget', 'Sinal de Faget (temperatura alta e frequência cardíaca lenta)', cx(0, 62.2, 155.8, 10.8, 11), { obrig: true }),
        sni('39', 'sinal_hemorragicos', 'Sinais hemorrágicos (hematêmese, melena, epistaxe, gengivorragia etc.)', cx(0, 313.0, 179.8), { obrig: true }),
        sni('39', 'sinal_renal', 'Distúrbios de excreção renal (oligúria e/ou anúria)', cx(0, 313.0, 158.6), { obrig: true }),
        sni('40', 'hospitalizacao', 'Ocorreu hospitalização?', cx(0, 383.5, 135.1, 10.8, 10.8)),
        data('41', 'data_internacao', 'Data da internação', dataCel(0, 414.5, [427.0, 441.6, 456.0, 469.9, 484.8, 499.7, 514.6], 526.6, 123.6, 12), { quando: sim('hospitalizacao') }),
        { n: '42', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 535, y: 123.6, w: 27, h: 10 }, larg: 1, quando: sim('hospitalizacao') },
        txt('43', 'municipio_hospital', 'Município do hospital', { p: 0, x: 52, y: 98, w: 165, h: 9 }, { fonte: 7.5, quando: sim('hospitalizacao') }),
        { n: '43', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [230.9, 245.8, 260.6, 275.5, 290.4], 96.5), larg: 2, quando: sim('hospitalizacao') },
        txt('44', 'unidade_hospital', 'Unidade de saúde (hospital)', { p: 0, x: 312, y: 98, w: 150, h: 9 }, { fonte: 7.5, quando: sim('hospitalizacao') }),
        { n: '44', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [473.0, 487.9, 502.8, 517.7, 532.5, 547.4], 97.5), larg: 2, quando: sim('hospitalizacao') },
      ],
    },
    {
      titulo: 'Dados do laboratório',
      aviso: 'Exames inespecíficos (45): anotar o maior valor encontrado, independente da data de coleta.',
      campos: [
        txt('45', 'bilirrubina_total', 'Bilirrubina total (mg/dl)', { p: 0, x: 134, y: 68.5, w: 64, h: 9 }, { larg: 2 }),
        txt('45', 'bilirrubina_direta', 'Bilirrubina direta (mg/dl)', { p: 0, x: 134, y: 52, w: 64, h: 9 }, { larg: 2 }),
        txt('45', 'ast', 'AST (TGO) (UI)', { p: 0, x: 314, y: 68.5, w: 56, h: 9 }, { larg: 2 }),
        txt('45', 'alt', 'ALT (TGP) (UI)', { p: 0, x: 314, y: 52, w: 56, h: 9 }, { larg: 2 }),
        data('46', 'data_coleta_s1', 'Sorologia IgM: data da coleta (1ª amostra)', dataCel(1, 43, [55.4, 70.3, 84.5, 98.6, 113.3, 128.2, 143.0], 158.4, 770.2, 12.2)),
        cod('47', 'resultado_s1', 'Resultado da 1ª amostra', RES4, cx(1, 286.1, 787.9, 12.7, 13)),
        data('48', 'data_coleta_s2', 'Sorologia IgM: data da coleta (2ª amostra)', dataCel(1, 318.5, [331.0, 345.6, 360.0, 374.2, 388.8, 403.7, 418.6], 433.9, 770.4, 12.2)),
        cod('49', 'resultado_s2', 'Resultado da 2ª amostra', RES4, cx(1, 556.1, 791.5, 12.7, 13)),
        sni('50', 'isolamento_coletado', 'Isolamento viral: material coletado', cx(1, 211.0, 743.0, 12.7, 12.7)),
        data('51', 'data_coleta_isolamento', 'Isolamento viral: data da coleta', dataCel(1, 252.0, [264.5, 279.8, 292.8, 306.0, 320.9, 335.8, 350.6], 358.6, 729.4, 12.2), { quando: sim('isolamento_coletado') }),
        cod('52', 'resultado_isolamento', 'Resultado do isolamento', RES4, cx(1, 557.5, 745.2, 12.7, 13), { quando: sim('isolamento_coletado') }),
        cod('53', 'histopatologia', 'Histopatologia: resultado', [['1', 'Compatível'], ['2', 'Negativo'], ['3', 'Inconclusivo'], ['4', 'Não realizado']], cx(1, 264.2, 703.9, 12.7, 13)),
        cod('54', 'imunohistoquimica', 'Imuno-histoquímica: resultado', POS4, cx(1, 550.6, 701.8, 12.5, 13)),
        data('55', 'data_coleta_rtpcr', 'RT-PCR: data da coleta', dataCel(1, 36.0, [48.5, 64.1, 76.8, 90.0, 104.9, 119.8, 134.6], 142.8, 648.2, 12)),
        cod('56', 'resultado_rtpcr', 'RT-PCR: resultado', POS4, cx(1, 541.2, 661.0, 13.7, 12.2)),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('57', 'classificacao_final', 'Classificação final', [['1', 'Febre amarela silvestre'], ['2', 'Febre amarela urbana'], ['3', 'Descartado']], cx(1, 302.4, 625.2, 12.7, 13), { larg: 4 }),
        txt('57', 'descartado_especificar', 'Descartado: especificar', { p: 1, x: 148, y: 617, w: 128, h: 8 }, { fonte: 7, quando: (d) => d.classificacao_final === '3' }),
        cod('58', 'criterio', 'Critério de confirmação/descarte', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico']], cx(1, 535.9, 629.5, 13.4, 13)),
        cod('59', 'autoctone', 'O caso é autóctone do município de residência?', [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], cx(1, 163.4, 588.5, 12.5, 12.2), { larg: 4, quando: (d) => ['1', '2'].includes(d.classificacao_final) }),
        { n: '60', chave: 'uf_infeccao', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 201.8, y: 572.2, w: 27.1, h: 12.2 }, larg: 1, quando: naoAut },
        txt('61', 'pais_infeccao', 'País', { p: 1, x: 236, y: 575, w: 95, h: 10 }, { quando: naoAut }),
        txt('62', 'municipio_infeccao', 'Município', { p: 1, x: 338, y: 575, w: 142, h: 9 }, { fonte: 7.5, quando: naoAut }),
        { n: '62', chave: 'ibge_infeccao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [497.8, 512.6, 527.5, 542.4, 557.3], 574.5), larg: 2, quando: naoAut },
        txt('63', 'distrito_infeccao', 'Distrito', { p: 1, x: 40, y: 545, w: 150, h: 10 }, { quando: naoAut }),
        txt('64', 'bairro_infeccao', 'Bairro', { p: 1, x: 205, y: 545, w: 145, h: 10 }, { quando: naoAut }),
        txt('65', 'localidade_infeccao', 'Localidade', { p: 1, x: 364, y: 545, w: 200, h: 10 }, { quando: (d) => ['1', '2'].includes(d.classificacao_final) }),
        sni('66', 'doenca_trabalho', 'Doença relacionada ao trabalho', cx(1, 238.8, 522.2, 10.8, 12.2)),
        cod('67', 'atividade_local', 'Atividade desenvolvida no local provável de infecção', [['1', 'Trabalho'], ['2', 'Turismo'], ['3', 'Lazer'], ['9', 'Ignorado']], cx(1, 537.8, 521.5, 12.7, 13), { larg: 4 }),
        cod('68', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Óbito por febre amarela'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], cx(1, 309.8, 484.3), { larg: 4 }),
        data('69', 'data_obito', 'Data do óbito', dataCel(1, 333.8, [346.3, 361.7, 374.6, 387.8, 402.7, 417.6, 432.5], 443.3, 468.5, 12), { quando: (d) => ['2', '3'].includes(d.evolucao) }),
        data('70', 'data_encerramento', 'Data do encerramento', dataCel(1, 454.6, [467.0, 482.4, 495.4, 508.6, 523.4, 538.3, 553.2], 564, 468.5, 12)),
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      aviso: 'Deslocamento para área rural dentro do município de residência ou para outros municípios (nos 15 dias anteriores ao início de sinais e sintomas).',
      campos: [
        ...DESLOC,
        { n: '', chave: 'observacoes', rotulo: 'Observações (outros dados clínicos, laboratoriais, laudos, necrópsia etc.)', tipo: 'texto_longo', linhas: [304.4, 290.5, 276.6, 262.5, 248.7, 234.8, 220.9, 207.0, 193.1, 179.0, 165.0, 151.1, 137.3].map((y) => ({ p: 1, x: 19, y, w: 548, h: 13.9 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 1, x: 38, y: 112, w: 410, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [476.2, 491.0, 505.9, 520.8, 535.7, 550.5], 106.5), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 38, y: 81, w: 205, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 255, y: 81, w: 200, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
