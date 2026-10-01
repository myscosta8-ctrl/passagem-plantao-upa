// Ficha de Notificação de SG suspeito de COVID-19 (e-SUS Notifica, 16/08/2021) — Covid19_v5.pdf
// Modelo de marcação: |__| recebe um "X" na opção escolhida.
const mk = (p, x0, y) => ({ p, x: x0 + 3, y: y - 1.5, w: 11.2, h: 9 }) // caixa |__| a partir do "|" inicial
const tx = (p, x, y, w) => ({ p, x, y: y - 1, w, h: 9 })
const partes = (a, b, c) => [a, b, c].map(([x0, x1], i) => [x0, x1 - x0, i < 2 ? 2 : (c[2] || 4)])
const DATA = (p, y, a, b, c, nAno = 4) => ({ caixa: { p, x: a[0], y: y - 1, w: c[1] - a[0], h: 9 }, partes: [[a[0], a[1] - a[0], 2], [b[0], b[1] - b[0], 2], [c[0], c[1] - c[0], nAno]] })
const casas = (lista) => lista.map((s) => s.split('-').map(Number))
const escolha = (n, chave, rotulo, op, extra = {}) => ({ n, chave, rotulo, tipo: 'escolha', opcoes: op.map(([v, r]) => [v, r]), caixas: Object.fromEntries(op.map(([v, , c]) => [v, c])), larg: 3, ...extra })
const marca = (chave, rotulo, caixa, extra = {}) => ({ n: '', chave, rotulo, tipo: 'marca', caixa, larg: 3, ...extra })
const texto = (chave, rotulo, caixa, extra = {}) => ({ n: '', chave, rotulo, tipo: 'texto', caixa, larg: 4, fonte: 8, ...extra })

const SN = (p, y, xs, xn) => [['1', 'Sim', mk(p, xs, y)], ['2', 'Não', mk(p, xn, y)]]

// Exames da página 1 (linha dupla por teste)
const EXAMES = [['rtpcr', 'RT-PCR', 203.0, 191.4, 'Detectável', 'Não detectável'], ['rtlamp', 'RT-LAMP', 179.9, 168.5, 'Detectável', 'Não detectável'],
  ['iga', 'Teste sorológico IgA', 157.0, 145.5], ['igm', 'Teste sorológico IgM', 134.0, 122.6], ['igg', 'Teste sorológico IgG', 111.0, 99.5],
  ['totais', 'Teste sorológico — anticorpos totais', 88.1, 76.6], ['rapido_igm', 'Teste rápido de anticorpo IgM', 65.1, 53.5], ['rapido_igg', 'Teste rápido de anticorpo IgG', 42.1, 30.6]]
  .flatMap(([k, r, y1, y2, pos = 'Reagente', neg = 'Não reagente']) => {
    const feito = (d) => ['coletado', 'concluido'].includes(d[`ex_${k}_estado`])
    return [
      escolha('', `ex_${k}_estado`, `${r}: estado do teste`, [['solicitado', 'Solicitado', mk(0, 126.0, y1)], ['coletado', 'Coletado', mk(0, 214.6, y1)], ['concluido', 'Concluído', mk(0, 126.0, y2)], ['nao_solicitado', 'Não solicitado', mk(0, 214.6, y2)]]),
      { n: '', chave: `ex_${k}_data`, rotulo: `${r}: data da coleta`, tipo: 'data', ...DATA(0, y2, [312.9, 326.3], [330.4, 343.9], [348.0, 361.4], 2), larg: 3, quando: feito },
      escolha('', `ex_${k}_resultado`, `${r}: resultado`, [['neg', neg, mk(0, 381.7, y1)], ['pos', pos, mk(0, 481.1, y1)], ['inc', 'Inconclusivo ou indeterminado', mk(0, 381.7, y2)]], { quando: (d) => d[`ex_${k}_estado`] === 'concluido' }),
    ]
  })

// Rastreamento de contatos (até 19 contatos)
const LINHAS = [316.1, 300.9, 285.8, 270.7, 255.4, 240.3, 225.2, 210.1, 194.8, 179.7, 164.6, 149.4, 134.2, 119.1, 104.0, 88.9, 73.6, 58.5, 43.4]
const CONTATOS = LINHAS.flatMap((y, i) => {
  const q = (d) => i === 0 || !!d[`ct${i}_nome`]
  const c = (k, rotulo, extra) => ({ n: '', chave: `ct${i + 1}_${k}`, rotulo: `Contato ${i + 1}: ${rotulo}`, larg: 3, quando: q, ...extra })
  return [
    c('nome', 'nome completo', { tipo: 'texto', caixa: { p: 1, x: 174, y: y - 1, w: 180, h: 9 }, fonte: 7.5, larg: 5 }),
    c('cpf', 'CPF', { tipo: 'digitos', digitos: 11, caixa: { p: 1, x: 357, y: y - 1, w: 105, h: 9 }, fonte: 7 }),
    c('telefone1', 'telefone 1', { tipo: 'texto', caixa: { p: 1, x: 465, y: y - 1, w: 96, h: 9 }, fonte: 7 }),
    c('telefone2', 'telefone 2', { tipo: 'texto', caixa: { p: 1, x: 565, y: y - 1, w: 88, h: 9 }, fonte: 7 }),
    c('relacao', 'relação com o caso', { tipo: 'codigo', opcoes: [['1', 'Domiciliar'], ['2', 'Familiar (extradomiciliar)'], ['3', 'Laboral'], ['4', 'Escolar'], ['5', 'Evento social'], ['6', 'Outros']], caixa: mk(1, 693.0, y) }),
    c('data_ultimo', 'data do último contato', { tipo: 'data', comoTexto: true, caixa: { p: 1, x: 757, y: y - 1, w: 65, h: 9 }, fonte: 7 }),
  ]
})

export default {
  id: 'COVID19',
  titulo: 'Ficha de Notificação de SG suspeito de COVID-19 (e-SUS Notifica)',
  arquivo: 'Covid19_v5.pdf',
  secoes: [
    {
      titulo: 'Identificação',
      campos: [
        texto('municipio_notificacao', 'Município de notificação', tx(0, 123, 689.2, 107), {}),
        { n: '', chave: 'uf_notificacao', rotulo: 'UF de notificação', tipo: 'digitos', alfa: true, digitos: 2, celulas: casas(['319.7-328.7', '332.8-341.7']), caixa: { p: 0, x: 319.7, y: 688.2, w: 22, h: 9 }, larg: 1 },
        { n: '', chave: 'data_notificacao', rotulo: 'Data da notificação', tipo: 'data', ...DATA(0, 689.2, [487.5, 501.0], [505.2, 518.5], [522.7, 540.7]), larg: 3 },
        escolha('', 'tem_cpf', 'Tem CPF?', SN(0, 666.7, 26.6, 59.2), {}),
        escolha('', 'estrangeiro', 'Estrangeiro?', SN(0, 666.7, 131.1, 165.7), {}),
        escolha('', 'profissional_saude', 'Profissional de saúde?', SN(0, 666.7, 246.3, 280.9), {}),
        escolha('', 'profissional_seguranca', 'Profissional de segurança?', SN(0, 666.7, 409.7, 444.3), {}),
        { n: '', chave: 'cpf', rotulo: 'CPF', tipo: 'digitos', digitos: 11, celulas: casas(['44.9-53.8', '57.9-66.9', '71.0-79.9', '84.1-93.0', '97.2-106.1', '110.2-119.3', '123.4-132.3', '136.5-145.4', '149.7-158.6', '162.7-171.6', '175.8-184.7']), caixa: { p: 0, x: 44.9, y: 654.2, w: 140, h: 9 }, larg: 3, quando: (d) => d.tem_cpf === '1' },
        { n: '', chave: 'cns', rotulo: 'CNS', tipo: 'digitos', digitos: 15, celulas: casas(['216.2-225.1', '229.2-238.2', '242.3-251.2', '255.4-264.4', '268.6-277.5', '281.6-290.5', '294.7-303.6', '307.8-316.8', '321.1-330.0', '334.1-343.1', '347.2-356.1', '360.3-369.2', '373.3-382.3', '386.4-395.3', '399.4-408.4']), caixa: { p: 0, x: 216.2, y: 654.2, w: 180, h: 9 }, larg: 3 },
        { n: '', chave: 'passaporte', rotulo: 'Passaporte', tipo: 'digitos', alfa: true, digitos: 8, celulas: casas(['455.6-464.5', '468.7-477.6', '481.8-490.7', '494.8-503.7', '507.9-516.8', '521.0-529.9', '534.1-543.1', '547.2-556.1']), caixa: { p: 0, x: 455.6, y: 654.2, w: 100, h: 9 }, larg: 3, quando: (d) => d.estrangeiro === '1' },
        texto('ocupacao', 'Ocupação (CBO)', tx(0, 92, 643.8, 470), { larg: 6 }),
        texto('nome', 'Nome completo', tx(0, 92, 632.3, 470), { larg: 6 }),
        texto('nome_mae', 'Nome completo da mãe', tx(0, 123, 620.8, 440), { larg: 6 }),
        { n: '', chave: 'data_nascimento', rotulo: 'Data de nascimento', tipo: 'data', ...DATA(0, 609.2, [105.7, 123.6], [127.8, 145.7], [150.0, 181.2]), larg: 3 },
        texto('pais_origem', 'País de origem', tx(0, 284, 609.2, 120), { larg: 3 }),
        escolha('', 'sexo', 'Sexo', [['M', 'Masculino', mk(0, 26.6, 586.8)], ['F', 'Feminino', mk(0, 93.7, 586.8)]], {}),
        escolha('', 'raca', 'Raça/cor', [['1', 'Branca', mk(0, 224.4, 597.8)], ['2', 'Preta', mk(0, 296.0, 597.8)], ['3', 'Amarela', mk(0, 352.8, 597.8)], ['4', 'Parda', mk(0, 442.4, 597.8)], ['9', 'Ignorado', mk(0, 501.7, 597.8)], ['5', 'Indígena', mk(0, 224.4, 586.8)]], {}),
        texto('etnia', 'Se indígena, informar etnia', tx(0, 398, 586.8, 168), { quando: (d) => d.raca === '5' }),
        escolha('', 'povo_tradicional', 'É membro de povo ou comunidade tradicional?', SN(0, 575.3, 242.4, 283.3), {}),
        texto('povo_tradicional_qual', 'Se sim, qual?', tx(0, 402, 575.3, 165), { quando: (d) => d.povo_tradicional === '1' }),
        { n: '', chave: 'uf_residencia', rotulo: 'Estado de residência', tipo: 'digitos', alfa: true, digitos: 2, celulas: casas(['112.1-121.0', '125.2-134.1']), caixa: { p: 0, x: 112.1, y: 562.9, w: 22, h: 9 }, larg: 1 },
        texto('municipio_residencia', 'Município de residência', tx(0, 262, 563.9, 125), { larg: 3 }),
        { n: '', chave: 'cep', rotulo: 'CEP', tipo: 'digitos', digitos: 8, celulas: casas(['428.3-437.2', '441.3-450.2', '454.4-463.3', '467.5-476.4', '480.5-489.5', '496.3-505.2', '509.4-518.3', '522.4-531.5']), caixa: { p: 0, x: 428.3, y: 562.9, w: 104, h: 9 }, larg: 3 },
        texto('logradouro', 'Logradouro', tx(0, 74, 552.3, 212), { larg: 5 }),
        texto('numero', 'Número', tx(0, 324, 552.3, 84), { larg: 2 }),
        texto('bairro', 'Bairro', tx(0, 437, 552.3, 130), { larg: 3 }),
        texto('complemento', 'Complemento', tx(0, 84, 540.8, 480), { larg: 6 }),
        texto('telefone', 'Telefone 1', tx(0, 76, 529.4, 210), { larg: 3 }),
        texto('telefone_2', 'Telefone 2', tx(0, 338, 529.4, 228), { larg: 3 }),
        texto('email', 'E-mail', tx(0, 55, 517.9, 510), { larg: 6 }),
      ],
    },
    {
      titulo: 'Estratégia e local de realização da testagem',
      campos: [
        escolha('', 'estrategia', 'Estratégia', [['assistencial', 'Diagnóstico assistencial (sintomático)', mk(0, 118.8, 483.5)], ['busca', 'Busca ativa de assintomático', mk(0, 288.9, 483.5)], ['triagem', 'Triagem de população específica', mk(0, 430.9, 483.5)]], { larg: 4 }),
        escolha('', 'busca_ativa', 'Se busca ativa de assintomático', [['contatos', 'Monitoramento de contatos', mk(0, 118.8, 471.9)], ['surtos', 'Investigação de surtos', mk(0, 118.8, 460.9)], ['viajantes', 'Monitoramento de viajantes com risco de VOC (quarentena)', mk(0, 118.8, 450.0)], ['outro', 'Outro', mk(0, 118.8, 428.0)]], { larg: 4, quando: (d) => d.estrategia === 'busca' }),
        texto('busca_ativa_outro', 'Busca ativa — outro', tx(0, 165, 428.0, 110), { quando: (d) => d.busca_ativa === 'outro' }),
        escolha('', 'triagem', 'Se triagem de população específica', [['trabalhadores', 'Trabalhadores de serviços essenciais ou estratégicos', mk(0, 352.8, 471.9)], ['profissionais', 'Profissionais de saúde', mk(0, 352.8, 460.9)], ['gestantes', 'Gestantes e puérperas', mk(0, 352.8, 450.0)], ['povos', 'Povos e comunidades tradicionais', mk(0, 352.8, 438.9)], ['outro', 'Outro', mk(0, 352.8, 428.0)]], { larg: 4, quando: (d) => d.estrategia === 'triagem' }),
        texto('triagem_outro', 'Triagem — outro', tx(0, 399, 428.0, 168), { quando: (d) => d.triagem === 'outro' }),
        escolha('', 'local_testagem', 'Local de realização da testagem', [['saude', 'Serviço de saúde (UBS, hospital, UPA etc.)', mk(0, 118.8, 416.5)], ['trabalho', 'Local de trabalho', mk(0, 303.1, 416.5)], ['aeroporto', 'Aeroporto', mk(0, 430.9, 416.5)], ['farmacia', 'Farmácia ou drogaria', mk(0, 118.8, 405.4)], ['escola', 'Escola', mk(0, 303.1, 405.4)], ['domicilio', 'Domicílio ou comunidade', mk(0, 430.9, 405.4)], ['outro', 'Outro', mk(0, 118.8, 394.5)]], { larg: 4 }),
        texto('local_testagem_outro', 'Local — outro', tx(0, 165, 394.5, 190), { quando: (d) => d.local_testagem === 'outro' }),
      ],
    },
    {
      titulo: 'Dados clínicos epidemiológicos',
      campos: [
        ...[['assintomatico', 'Assintomático', 83.3, 360.1], ['febre', 'Febre', 168.5, 360.1], ['garganta', 'Dor de garganta', 281.8, 360.1], ['dispneia', 'Dispneia', 388.4, 360.1], ['tosse', 'Tosse', 452.1, 360.1], ['coriza', 'Coriza', 508.9, 360.1],
          ['cabeca', 'Dor de cabeça', 83.3, 349.0], ['gustativos', 'Distúrbios gustativos', 168.5, 349.0], ['olfativos', 'Distúrbios olfativos', 281.8, 349.0], ['outros', 'Outros sintomas', 388.4, 349.0]]
          .map(([k, r, x, y]) => marca(`sint_${k}`, `Sintoma: ${r}`, mk(0, x, y))),
        texto('sint_outros_espec', 'Outros sintomas (quais)', tx(0, 433, 349.0, 125), { quando: (d) => d.sint_outros === '1' }),
        { n: '', chave: 'data_primeiros_sintomas', rotulo: 'Data do início dos sintomas', tipo: 'data', ...DATA(0, 337.5, [134.1, 147.5], [151.8, 165.2], [169.3, 187.2]), larg: 3, quando: (d) => d.sint_assintomatico !== '1' },
        ...[['cardiacas', 'Doenças cardíacas crônicas', 331.5, 326.1], ['diabetes', 'Diabetes', 487.5, 326.1], ['respiratorias', 'Doenças respiratórias crônicas descompensadas', 26.9, 315.1], ['puerpera', 'Puérpera (até 45 dias do parto)', 331.5, 315.1],
          ['gestante', 'Gestante', 487.5, 315.1], ['renais', 'Doenças renais crônicas em estágio avançado (graus 3, 4 e 5)', 26.9, 304.2], ['imunossupressao', 'Imunossupressão', 331.5, 304.2], ['obesidade', 'Obesidade', 487.5, 304.2],
          ['cromossomicas', 'Doenças cromossômicas ou estado de fragilidade imunológica', 26.9, 293.1], ['outros', 'Outras condições', 331.5, 293.1]]
          .map(([k, r, x, y]) => marca(`cond_${k}`, `Condição: ${r}`, mk(0, x, y))),
        texto('cond_outros_espec', 'Outras condições (quais)', tx(0, 376, 293.1, 188), { quando: (d) => d.cond_outros === '1' }),
        escolha('', 'vacina_covid', 'Recebeu vacina Covid-19?', SN(0, 248.9, 26.9, 61.5)),
        { n: '', chave: 'vacina_dose1_data', rotulo: '1ª dose: data da vacinação', tipo: 'data', ...DATA(0, 260.3, [306.6, 319.9], [324.1, 337.5], [341.7, 359.6]), larg: 3, quando: (d) => d.vacina_covid === '1' },
        texto('vacina_dose1_lab', '1ª dose: laboratório produtor', tx(0, 372, 260.3, 135), { quando: (d) => d.vacina_covid === '1', fonte: 7 }),
        texto('vacina_dose1_lote', '1ª dose: lote', tx(0, 512, 260.3, 55), { larg: 2, quando: (d) => d.vacina_covid === '1', fonte: 7 }),
        { n: '', chave: 'vacina_dose2_data', rotulo: '2ª dose: data da vacinação', tipo: 'data', ...DATA(0, 248.9, [306.6, 319.9], [324.1, 337.5], [341.7, 359.6]), larg: 3, quando: (d) => d.vacina_covid === '1' },
        texto('vacina_dose2_lab', '2ª dose: laboratório produtor', tx(0, 372, 248.9, 135), { quando: (d) => d.vacina_covid === '1', fonte: 7 }),
        texto('vacina_dose2_lote', '2ª dose: lote', tx(0, 512, 248.9, 55), { larg: 2, quando: (d) => d.vacina_covid === '1', fonte: 7 }),
      ],
    },
    {
      titulo: 'Exames laboratoriais',
      campos: [
        ...EXAMES,
        escolha('', 'ex_antigeno_estado', 'Teste rápido de antígeno: estado do teste', [['solicitado', 'Solicitado', mk(1, 97.7, 539.4)], ['concluido', 'Concluído', mk(1, 186.1, 539.4)], ['coletado', 'Coletado', mk(1, 97.7, 528.0)], ['nao_solicitado', 'Não solicitado', mk(1, 186.1, 528.0)]]),
        { n: '', chave: 'ex_antigeno_data', rotulo: 'Teste rápido de antígeno: data da coleta', tipo: 'data', ...DATA(1, 528.0, [274.9, 288.2], [292.4, 305.8], [310.0, 323.3], 2), larg: 3, quando: (d) => ['coletado', 'concluido'].includes(d.ex_antigeno_estado) },
        texto('ex_antigeno_fabricante', 'Teste rápido de antígeno: fabricante', tx(1, 345, 533, 140), { quando: (d) => ['coletado', 'concluido'].includes(d.ex_antigeno_estado) }),
        texto('ex_antigeno_lote', 'Teste rápido de antígeno: lote', tx(1, 490, 533, 140), { quando: (d) => ['coletado', 'concluido'].includes(d.ex_antigeno_estado) }),
        escolha('', 'ex_antigeno_resultado', 'Teste rápido de antígeno: resultado', [['neg', 'Não reagente', mk(1, 643.3, 539.4)], ['pos', 'Reagente', mk(1, 726.6, 539.4)], ['inc', 'Inconclusivo ou indeterminado', mk(1, 643.3, 528.0)]], { quando: (d) => d.ex_antigeno_estado === 'concluido' }),
      ],
    },
    {
      titulo: 'Encerramento',
      campos: [
        escolha('', 'evolucao_covid', 'Evolução do caso', [['cancelado', 'Cancelado', mk(1, 19.6, 485.6)], ['domiciliar', 'Em tratamento domiciliar', mk(1, 90.6, 485.6)], ['cura', 'Cura', mk(1, 218.1, 485.6)], ['internado', 'Internado', mk(1, 19.6, 474.2)], ['uti', 'Internado em UTI', mk(1, 90.6, 474.2)], ['obito', 'Óbito', mk(1, 19.6, 462.7)], ['ignorado', 'Ignorado', mk(1, 90.6, 462.7)]], { larg: 4 }),
        escolha('', 'classificacao_covid', 'Classificação final', [['descartado', 'Descartado', mk(1, 281.9, 485.6)], ['clinico_epi', 'Confirmado clínico-epidemiológico', mk(1, 281.9, 474.2)], ['laboratorial', 'Confirmado laboratorial', mk(1, 281.9, 462.7)], ['clinico_imagem', 'Confirmado clínico-imagem', mk(1, 483.9, 485.6)], ['criterio_clinico', 'Confirmado por critério clínico', mk(1, 483.9, 474.2)], ['sg_nao_especificada', 'Síndrome gripal não especificada', mk(1, 483.9, 462.7)]], { larg: 4 }),
        { n: '', chave: 'data_encerramento', rotulo: 'Data de encerramento', tipo: 'data', ...DATA(1, 462.7, [685.9, 703.7], [707.8, 725.8], [729.9, 774.7]), larg: 3 },
        { n: '', chave: 'observacoes', rotulo: 'Informações complementares e observações', tipo: 'texto_longo', linhas: [431.3, 419.8, 408.3, 396.8].map((y) => ({ p: 1, x: 14, y, w: 810, h: 11.5 })), fonte: 8, larg: 12 },
      ],
    },
    {
      titulo: 'Rastreamento de contatos',
      aviso: 'ID do caso fonte e ID do contato são preenchidos automaticamente pelo e-SUS Notifica.',
      campos: CONTATOS,
    },
  ],
}
