// Ficha de Investigação — Hepatites Virais (Sinan NET, SVS 29/09/2006) — Ficha_Hepatites_Virais.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 443.3, y: 552.5, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 51.6, y: 522.0, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 95, y: 522, w: 375, h: 10 },
  ibge_notificacao: pente(0, [489.2, 503.7, 518.1, 532.6, 547.0], 521),
  unidade_notificadora: { p: 0, x: 66, y: 493, w: 268, h: 10 },
  cnes: pente(0, [347.5, 361.9, 376.4, 390.9, 405.3, 419.8], 492),
  data_primeiros_sintomas: { p: 0, x: 442.1, y: 493.9, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 67, y: 465, w: 365, h: 10 },
  data_nascimento: { p: 0, x: 445.8, y: 463.4, w: 113.8, h: 11.9 },
  idade: pente(0, [73.1, 86.7], 433, 9),
  unidade_idade: { p: 0, x: 108.2, y: 440.9, w: 10.8, h: 11 },
  sexo: { p: 0, x: 230.9, y: 448.1, w: 10.8, h: 11 },
  gestante: { p: 0, x: 425.3, y: 448.1, w: 11, h: 10.8 },
  raca: { p: 0, x: 550.3, y: 447.4, w: 11, h: 10.8 },
  escolaridade: { p: 0, x: 550.8, y: 418.3, w: 11, h: 10.8 },
  cns: { p: 0, x: 52.2, y: 372.8, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 244, y: 374, w: 321, h: 10 },
  uf_residencia: { p: 0, x: 52.3, y: 343.5, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 343, w: 236, h: 10 },
  ibge_residencia: pente(0, [336.1, 350.5, 365.0, 379.5, 393.9], 343),
  distrito: { p: 0, x: 425, y: 343, w: 140, h: 10 },
  bairro: { p: 0, x: 56, y: 318, w: 140, h: 10 },
  logradouro: { p: 0, x: 205, y: 318, w: 270, h: 10 },
  logradouro_codigo: pente(0, [489.9, 504.3, 518.7, 533.1, 547.5], 317),
  numero: { p: 0, x: 56, y: 294, w: 54, h: 10 },
  complemento: { p: 0, x: 120, y: 294, w: 290, h: 10 },
  geo1: { p: 0, x: 421, y: 294, w: 144, h: 10 },
  geo2: { p: 0, x: 56, y: 269, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 227, y: 269, w: 218, h: 10 },
  cep: { p: 0, x: 453.9, y: 266.2, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 52.7, y: 242.0, w: 148.1, h: 12.3 },
  zona: { p: 0, x: 331.4, y: 253.9, w: 11, h: 11 },
  pais: { p: 0, x: 366, y: 244, w: 199, h: 10 },
}

const cx = (p, x, y) => ({ p, x, y, w: 11, h: 11 })
const EXPO = [['1', 'Sim, há menos de seis meses'], ['2', 'Sim, há mais de seis meses'], ['3', 'Não'], ['9', 'Ignorado']]
const VACINA = [['1', 'Completa'], ['2', 'Incompleta'], ['3', 'Não vacinado'], ['9', 'Ignorado']]
const SORO = [['1', 'Reagente/positivo'], ['2', 'Não reagente/negativo'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const BANCO = [['1', 'Reagente'], ['2', 'Não reagente'], ['3', 'Inconclusivo'], ['4', 'Não realizado'], ['9', 'Ignorado']]
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })

// Campo 40: até 3 locais de exposição (tabela).
const LOCAIS = [650.3, 637.5, 624.8].flatMap((y, i) => [
  { n: '40', chave: `exp${i + 1}_uf`, rotulo: `Local ${i + 1}: UF`, tipo: 'uf', caixa: { p: 1, x: 54.8, y, w: 21.7, h: 12.8 }, larg: 1 },
  { n: '40', chave: `exp${i + 1}_municipio`, rotulo: `Local ${i + 1}: município de exposição`, tipo: 'texto', caixa: { p: 1, x: 76.5, y, w: 167.6, h: 12.8 }, larg: 4 },
  { n: '40', chave: `exp${i + 1}_local`, rotulo: `Local ${i + 1}: local de exposição`, tipo: 'texto', caixa: { p: 1, x: 244.1, y, w: 237.4, h: 12.8 }, larg: 5 },
  { n: '40', chave: `exp${i + 1}_fone`, rotulo: `Local ${i + 1}: fone`, tipo: 'texto', caixa: { p: 1, x: 481.5, y, w: 85.8, h: 12.8 }, larg: 2 },
])

// Campo 41: até 5 comunicantes (tabela).
const COMUNICANTES = [537.6, 524.8, 512.2, 499.6, 487.1].flatMap((y, i) => {
  const c = (k, rotulo, x, w, extra) => ({ n: '41', chave: `com${i + 1}_${k}`, rotulo: `Comunicante ${i + 1}: ${rotulo}`, caixa: { p: 1, x, y, w, h: 12.5 }, larg: 3, quando: (d) => i === 0 || !!d[`com${i}_nome`], ...extra })
  return [
    c('nome', 'nome', 53.3, 76.7, { tipo: 'texto', fonte: 7 }),
    c('idade', 'idade (ex.: 5A, 3M, 10D)', 130, 31.3, { tipo: 'texto' }),
    c('contato', 'tipo de contato', 161.3, 78.6, { tipo: 'codigo', opcoes: [['1', 'Não sexual/domiciliar'], ['2', 'Sexual/domiciliar'], ['3', 'Sexual/não domiciliar'], ['4', 'Uso de drogas'], ['5', 'Outro'], ['9', 'Ignorado']] }),
    c('hbsag', 'HBsAg', 239.9, 51.7, { tipo: 'codigo', opcoes: BANCO }),
    c('antihbc', 'Anti-HBc total', 291.6, 63.0, { tipo: 'codigo', opcoes: BANCO }),
    c('antihcv', 'Anti-HCV', 354.6, 62.7, { tipo: 'codigo', opcoes: BANCO }),
    c('vacina', 'indicado vacina contra hepatite B', 417.3, 68.4, { tipo: 'codigo', opcoes: [['1', 'Sim'], ['2', 'Não'], ['3', 'Indivíduo já imune'], ['9', 'Ignorado']] }),
    c('imunoglobulina', 'indicado imunoglobulina anti-hepatite B', 485.7, 88.7, { tipo: 'codigo', opcoes: SIM_NAO_IGN.map(([k, r]) => [k === '9' ? '9' : k, r]) }),
  ]
})

export default {
  id: 'HEPATITES_VIRAIS',
  titulo: 'Ficha de Investigação — Hepatites Virais',
  arquivo: 'Ficha_Hepatites_Virais.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        { n: '31', chave: 'data_investigacao', rotulo: 'Data da investigação', tipo: 'data', caixa: { p: 0, x: 58.1, y: 190.1, w: 115.2, h: 11.9 }, larg: 3, obrig: true },
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 190, y: 192, w: 375, h: 10 }, larg: 9 },
        cod('33', 'suspeita', 'Suspeita de', [['1', 'Hepatite A'], ['2', 'Hepatite B/C'], ['3', 'Não especificada']], cx(0, 133.4, 172.1), { obrig: true }),
        cod('34', 'vacina_hep_a', 'Tomou vacina para hepatite A', VACINA, cx(0, 457.7, 170.9), { obrig: true }),
        cod('34', 'vacina_hep_b', 'Tomou vacina para hepatite B', VACINA, cx(0, 456.5, 154.6), { obrig: true }),
        cod('35', 'institucionalizado', 'Institucionalizado em', [['1', 'Creche'], ['2', 'Escola'], ['3', 'Asilo'], ['4', 'Empresa'], ['5', 'Penitenciária'], ['6', 'Hospital/clínica'], ['7', 'Outras'], ['8', 'Não institucionalizado'], ['9', 'Ignorado']], cx(0, 502.6, 131.3), { larg: 4, obrig: true }),
        cod('36', 'agr_hiv', 'Agravos associados: HIV/AIDS', SIM_NAO_IGN, cx(0, 181.2, 87.1), { obrig: true }),
        cod('36', 'agr_dst', 'Agravos associados: outras DSTs', SIM_NAO_IGN, cx(0, 181.2, 74.4), { obrig: true }),
        cod('37', 'contato_sexual', 'Contato com portador de HBV ou HCV: sexual', EXPO, cx(0, 461.5, 96.7), { obrig: true }),
        cod('37', 'contato_domiciliar', 'Contato com portador: domiciliar (não sexual)', EXPO, cx(0, 462.2, 84.0), { obrig: true }),
        cod('37', 'contato_ocupacional', 'Contato com portador: ocupacional', EXPO, cx(0, 462.2, 71.3), { obrig: true }),
        ...[['med_injetaveis', 'Medicamentos injetáveis', 63.1, 776.6], ['drogas_inalaveis', 'Drogas inaláveis ou crack', 63.1, 760.1], ['drogas_injetaveis', 'Drogas injetáveis', 63.1, 744.5],
          ['agua_alimento', 'Água/alimento contaminado', 64.1, 727.9], ['parceiros', 'Três ou mais parceiros sexuais', 63.4, 712.1], ['transplante', 'Transplante', 63.1, 699.1],
          ['tatuagem', 'Tatuagem/piercing', 264.0, 777.4], ['acupuntura', 'Acupuntura', 264.0, 760.1], ['cirurgico', 'Tratamento cirúrgico', 264.2, 745.2],
          ['dentario', 'Tratamento dentário', 264.2, 727.9], ['hemodialise', 'Hemodiálise', 263.5, 712.8], ['outras', 'Outras', 263.5, 700.1],
          ['material_biologico', 'Acidente com material biológico', 402.0, 778.8], ['transfusao', 'Transfusão de sangue/derivados', 403.0, 761.5]]
          .map(([k, r, x, y]) => cod('38', `exp_${k}`, `Exposição: ${r}`, EXPO, cx(1, x, y), { obrig: true })),
        { n: '39', chave: 'data_acidente', rotulo: 'Data do acidente ou transfusão ou transplante', tipo: 'data', caixa: { p: 1, x: 392.3, y: 704.6, w: 103.5, h: 11.6 }, larg: 3, quando: (d) => ['1', '2'].includes(d.exp_material_biologico) || ['1', '2'].includes(d.exp_transfusao) || ['1', '2'].includes(d.exp_transplante) },
        ...LOCAIS,
        ...COMUNICANTES,
      ],
    },
    {
      titulo: 'Dados laboratoriais',
      campos: [
        cod('42', 'encaminhado_de', 'Paciente encaminhado de', [['1', 'Banco de sangue'], ['2', 'Centro de Testagem e Aconselhamento (CTA)'], ['3', 'Não se aplica']], cx(1, 205.9, 471.1), { larg: 4, obrig: true }),
        { n: '43', chave: 'data_coleta_cta', rotulo: 'Data da coleta da amostra realizada em banco de sangue ou CTA', tipo: 'data', caixa: { p: 1, x: 234.2, y: 438.1, w: 106.4, h: 11.2 }, larg: 4, quando: (d) => ['1', '2'].includes(d.encaminhado_de) },
        cod('44', 'banco_hbsag', 'Sorologia do banco de sangue/CTA: HBsAg', BANCO, cx(1, 496.8, 460.6), { quando: (d) => ['1', '2'].includes(d.encaminhado_de) }),
        cod('44', 'banco_antihbc', 'Sorologia do banco de sangue/CTA: anti-HBc (total)', BANCO, cx(1, 496.8, 447.8), { quando: (d) => ['1', '2'].includes(d.encaminhado_de) }),
        cod('44', 'banco_antihcv', 'Sorologia do banco de sangue/CTA: anti-HCV', BANCO, cx(1, 496.1, 432.7), { quando: (d) => ['1', '2'].includes(d.encaminhado_de) }),
        { n: '45', chave: 'data_sorologia', rotulo: 'Data da coleta da sorologia/teste rápido', tipo: 'data', caixa: { p: 1, x: 116.6, y: 402.1, w: 106.4, h: 11.2 }, larg: 3 },
        ...[['antihav_igm', 'Anti-HAV IgM', 344.4, 406.6], ['hbsag', 'HBsAg', 344.2, 393.6], ['antihbc_igm', 'Anti-HBc IgM', 343.9, 380.6], ['antihbc_total', 'Anti-HBc (total)', 344.6, 366.7],
          ['antihbs', 'Anti-HBs', 423.1, 406.1], ['hbeag', 'HBeAg', 423.1, 392.9], ['antihbe', 'Anti-HBe', 423.1, 379.7], ['antihdv_total', 'Anti-HDV total', 423.4, 367.7],
          ['antihdv_igm', 'Anti-HDV IgM', 493.4, 409.4], ['antihev_igm', 'Anti-HEV IgM', 493.4, 396.0], ['antihcv', 'Anti-HCV', 493.7, 380.2], ['hcv_rna', 'HCV-RNA', 494.2, 366.2]]
          .map(([k, r, x, y]) => cod('46', `res_${k}`, `Resultado: ${r}`, SORO, cx(1, x, y), { obrig: true })),
        cod('47', 'genotipo_hcv', 'Genótipo para HCV', [['1', 'Genótipo 1'], ['2', 'Genótipo 2'], ['3', 'Genótipo 3'], ['4', 'Genótipo 4'], ['5', 'Genótipo 5'], ['6', 'Genótipo 6'], ['7', 'Não se aplica'], ['9', 'Ignorado']], cx(1, 219.1, 388.3)),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('48', 'classificacao_final', 'Classificação final', [['1', 'Confirmação laboratorial'], ['2', 'Confirmação clínico-epidemiológica'], ['3', 'Descartado'], ['4', 'Cicatriz sorológica'], ['8', 'Inconclusivo']], cx(1, 227.0, 343.7), { larg: 4 }),
        cod('49', 'forma_clinica', 'Forma clínica', [['1', 'Hepatite aguda'], ['2', 'Hepatite crônica/portador assintomático'], ['3', 'Hepatite fulminante'], ['4', 'Inconclusivo']], cx(1, 352.6, 344.9), { larg: 4 }),
        { n: '50', chave: 'classificacao_etiologica', rotulo: 'Classificação etiológica', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Vírus A'], ['02', 'Vírus B'], ['03', 'Vírus C'], ['04', 'Vírus B e D'], ['05', 'Vírus E'], ['06', 'Vírus B e C'], ['07', 'Vírus A e B'], ['08', 'Vírus A e C'], ['09', 'Não se aplica'], ['99', 'Ignorado']], caixa: { p: 1, x: 542.9, y: 345.8, w: 22.3, h: 12 }, larg: 4 },
        { n: '51', chave: 'fonte_infeccao', rotulo: 'Provável fonte/mecanismo de infecção', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Sexual'], ['02', 'Transfusional'], ['03', 'Uso de drogas'], ['04', 'Vertical'], ['05', 'Acidente de trabalho'], ['06', 'Hemodiálise'], ['07', 'Domiciliar'], ['08', 'Tratamento cirúrgico'], ['09', 'Tratamento dentário'], ['10', 'Pessoa/pessoa'], ['11', 'Alimento/água contaminada'], ['12', 'Outros'], ['99', 'Ignorado']], caixa: { p: 1, x: 507.8, y: 283.0, w: 21.6, h: 11.5 }, larg: 4 },
        { n: '51', chave: 'fonte_outros', rotulo: 'Outra fonte (especificar)', tipo: 'texto', caixa: { p: 1, x: 488, y: 261, w: 45, h: 7 }, fonte: 6, larg: 4, quando: (d) => d.fonte_infeccao === '12' },
        { n: '52', chave: 'data_encerramento', rotulo: 'Data do encerramento', tipo: 'data', caixa: { p: 1, x: 57.3, y: 210.0, w: 103.6, h: 11.6 }, larg: 3 },
        { n: '', chave: 'observacoes', rotulo: 'Observações', tipo: 'texto_longo', linhas: [179.3, 164.7, 150.1, 135.3, 120.7, 106.2].map((y) => ({ p: 1, x: 30, y, w: 535.5, h: 14.6 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 60, y: 72, w: 395, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [472.6, 487.1, 501.6, 516.0, 530.5, 544.9], 68.5, 9), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 60, y: 40, w: 195, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 262, y: 40, w: 198, h: 10 }, larg: 6 },
      ],
    },
  ],
}
