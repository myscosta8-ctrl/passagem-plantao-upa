// Ficha de Investigação — Acidente de Trabalho Grave (Sinan Net, SVS 21/06/2019) — DRT_Acidente_Trabalho_Grave.pdf
import { cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 447.6, y: 621.8, w: 115.4, h: 12 },
  uf_notificacao: { p: 0, x: 54.2, y: 593.8, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 98, y: 594, w: 380, h: 10 },
  ibge_notificacao: pente(0, [490.1, 505.0, 519.8, 534.7, 549.6], 592),
  unidade_notificadora: { p: 0, x: 69, y: 565, w: 268, h: 10 },
  cnes: pente(0, [350.6, 365.5, 380.4, 395.3, 410.1, 425.0], 564),
  data_primeiros_sintomas: { p: 0, x: 444.7, y: 565.4, w: 115.3, h: 12.2 },
  nome: { p: 0, x: 70, y: 536, w: 370, h: 10 },
  data_nascimento: { p: 0, x: 448.3, y: 535.0, w: 114.0, h: 12.2 },
  idade: pente(0, [76.0, 90.2], 505, 9),
  unidade_idade: { p: 0, x: 110.6, y: 512.6, w: 11, h: 11 },
  sexo: { p: 0, x: 233.3, y: 519.8, w: 11, h: 11 },
  gestante: { p: 0, x: 427.9, y: 519.8, w: 11, h: 11 },
  raca: { p: 0, x: 553.0, y: 519.1, w: 10.8, h: 11 },
  escolaridade: { p: 0, x: 553.4, y: 490.1, w: 10.8, h: 10.8 },
  cns: { p: 0, x: 54.7, y: 444.5, w: 175.2, h: 12 },
  nome_mae: { p: 0, x: 247, y: 446, w: 318, h: 10 },
  uf_residencia: { p: 0, x: 55.2, y: 416.9, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 97, y: 417, w: 233, h: 10 },
  ibge_residencia: pente(0, [339.4, 354.2, 369.1, 384.0, 398.9], 416),
  distrito: { p: 0, x: 428, y: 417, w: 137, h: 10 },
  bairro: { p: 0, x: 58, y: 391, w: 140, h: 10 },
  logradouro: { p: 0, x: 208, y: 391, w: 272, h: 10 },
  logradouro_codigo: pente(0, [493.2, 508.1, 523.0, 537.8, 552.7], 390),
  numero: { p: 0, x: 58, y: 367, w: 56, h: 10 },
  complemento: { p: 0, x: 123, y: 367, w: 292, h: 10 },
  geo1: { p: 0, x: 424, y: 367, w: 141, h: 10 },
  geo2: { p: 0, x: 58, y: 342, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 230, y: 342, w: 218, h: 10 },
  cep: { p: 0, x: 456.7, y: 339.4, w: 110.9, h: 12 },
  telefone: { p: 0, x: 55.7, y: 315.1, w: 148.1, h: 12.5 },
  zona: { p: 0, x: 334.3, y: 327.1, w: 11, h: 11 },
  pais: { p: 0, x: 369, y: 317, w: 196, h: 10 },
}

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const SNI = [['1', 'Sim'], ['2', 'Não'], ['9', 'Ignorado']]
const SN3 = [['1', 'Sim'], ['2', 'Não'], ['3', 'Não se aplica'], ['9', 'Ignorado']]
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 4, ...extra })
const dig = (n, chave, rotulo, digitos, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'digitos', digitos, caixa, larg: 2, ...extra })
const PARTES = [['01', 'Olho'], ['02', 'Cabeça'], ['03', 'Pescoço'], ['04', 'Tórax'], ['05', 'Abdome'], ['06', 'Mão'], ['07', 'Membro superior'], ['08', 'Membro inferior'], ['09', 'Pé'], ['10', 'Todo o corpo'], ['11', 'Outro'], ['99', 'Ignorado']]
const terceirizada = (d) => d.terceirizada === '1'
const atendido = (d) => d.atendimento_medico === '1'

export default {
  id: 'ACIDENTE_TRABALHO',
  titulo: 'Ficha de Investigação — Acidente de Trabalho Grave',
  arquivo: 'DRT_Acidente_Trabalho_Grave.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g, { rotulo7: 'Data do acidente' }),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        txt('31', 'ocupacao', 'Ocupação', { p: 0, x: 67, y: 265, w: 498, h: 10 }, { larg: 12, obrig: true }),
        cod('32', 'situacao_trabalho', 'Situação no mercado de trabalho', [['01', 'Empregado registrado com carteira assinada'], ['02', 'Empregado não registrado'], ['03', 'Autônomo/conta própria'], ['04', 'Servidor público estatutário'], ['05', 'Servidor público celetista'], ['06', 'Aposentado'], ['07', 'Desempregado'], ['08', 'Trabalho temporário'], ['09', 'Cooperativado'], ['10', 'Trabalhador avulso'], ['11', 'Empregador'], ['12', 'Outros'], ['99', 'Ignorado']], { p: 0, x: 530.4, y: 245.5, w: 23.7, h: 11 }, { digitos: 2, larg: 5, obrig: true }),
        dig('33', 'tempo_trabalho', 'Tempo de trabalho na ocupação', 2, { p: 0, x: 64.3, y: 163.7, w: 27.4, h: 12.2 }),
        cod('33', 'tempo_trabalho_unidade', 'Unidade do tempo de trabalho', [['1', 'Hora'], ['2', 'Dia'], ['3', 'Mês'], ['4', 'Ano']], { p: 0, x: 102.0, y: 163.7, w: 13.9, h: 12.2 }),
        cod('34', 'local_acidente', 'Local onde ocorreu o acidente', [['1', 'Instalações do contratante'], ['2', 'Via pública'], ['3', 'Instalações de terceiros'], ['4', 'Domicílio próprio'], ['9', 'Ignorado']], cx(0, 549.1, 183.4), { larg: 4, obrig: true }),
        dig('35', 'empresa_registro', 'Dados da empresa contratante: registro (CNPJ ou CPF)', 14, { p: 0, x: 78.7, y: 123.1, w: 152.6, h: 12.2 }, { larg: 4 }),
        txt('36', 'empresa_nome', 'Nome da empresa ou empregador', { p: 0, x: 260, y: 125, w: 305, h: 10 }, { larg: 8 }),
        txt('37', 'empresa_cnae', 'Atividade econômica (CNAE)', { p: 0, x: 67, y: 95, w: 140, h: 10 }),
        { n: '38', chave: 'empresa_uf', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 214.6, y: 92.9, w: 26.9, h: 11.8 }, larg: 1 },
        txt('39', 'empresa_municipio', 'Município', { p: 0, x: 257, y: 95, w: 222, h: 10 }),
        dig('39', 'empresa_ibge', 'Código (IBGE)', 6, pente(0, [491.3, 506.2, 521.0, 535.9, 550.8], 93), { larg: 3 }),
        txt('40', 'empresa_distrito', 'Distrito', { p: 0, x: 68, y: 68, w: 150, h: 10 }, { larg: 3 }),
        txt('41', 'empresa_bairro', 'Bairro', { p: 0, x: 230, y: 68, w: 155, h: 10 }, { larg: 3 }),
        txt('42', 'empresa_endereco', 'Endereço', { p: 0, x: 394, y: 68, w: 171, h: 10 }, { larg: 6 }),
        txt('43', 'empresa_numero', 'Número', { p: 0, x: 67, y: 43, w: 48, h: 10 }, { larg: 2 }),
        txt('44', 'empresa_referencia', 'Ponto de referência', { p: 0, x: 120, y: 43, w: 298, h: 10 }, { larg: 6 }),
        dig('45', 'empresa_telefone', '(DDD) Telefone', 10, { p: 0, x: 423.1, y: 43.0, w: 145.4, h: 12.5 }, { larg: 4 }),
        cod('46', 'terceirizada', 'O empregador é empresa terceirizada', SN3, cx(1, 474.7, 799.4), { larg: 4 }),
        dig('47', 'cnae_principal', 'Se terceirizada, CNAE da empresa principal', 7, { p: 1, x: 188.4, y: 758.9, w: 114.7, h: 12.2 }, { larg: 4, quando: terceirizada }),
        dig('48', 'cnpj_principal', 'CNPJ da empresa principal', 14, { p: 1, x: 393.8, y: 758.2, w: 166.6, h: 12.2 }, { larg: 4, quando: terceirizada }),
        txt('49', 'razao_social', 'Razão social (nome da empresa)', { p: 1, x: 66, y: 732, w: 499, h: 10 }, { larg: 12, quando: terceirizada }),
      ],
    },
    {
      titulo: 'Dados do acidente',
      campos: [
        dig('50', 'hora_acidente_h', 'Hora do acidente (hora)', 2, { p: 1, x: 92.9, y: 694.3, w: 27.4, h: 12.2 }, { obrig: true }),
        dig('50', 'hora_acidente_m', 'Hora do acidente (minutos)', 2, { p: 1, x: 195.6, y: 695.0, w: 27.4, h: 12.2 }),
        dig('51', 'jornada_h', 'Horas após o início da jornada (hora)', 2, { p: 1, x: 404.2, y: 695.0, w: 27.4, h: 12.2 }),
        dig('51', 'jornada_m', 'Horas após o início da jornada (minutos)', 2, { p: 1, x: 470.9, y: 695.0, w: 27.4, h: 12.2 }),
        { n: '52', chave: 'uf_ocorrencia', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 57.8, y: 665.8, w: 28.3, h: 12.2 }, larg: 1, obrig: true },
        txt('53', 'municipio_ocorrencia', 'Município de ocorrência do acidente', { p: 1, x: 100, y: 667, w: 133, h: 9 }, { fonte: 7.5, obrig: true }),
        dig('53', 'ibge_ocorrencia', 'Código (IBGE)', 7, pente(1, [248.6, 263.5, 278.4, 293.3, 308.1, 323.0], 664), { larg: 3 }),
        { n: '54', chave: 'cid_causa', rotulo: 'Código da causa do acidente — CID 10 (de V01 a Y98)', tipo: 'digitos', alfa: true, digitos: 4, caixa: { p: 1, x: 489.1, y: 665.0, w: 59.6, h: 12.5 }, larg: 3, obrig: true },
        cod('55', 'tipo_acidente', 'Tipo de acidente', [['1', 'Típico'], ['2', 'Trajeto'], ['9', 'Ignorado']], cx(1, 219.1, 649.9), { obrig: true }),
        cod('56', 'outros_atingidos', 'Houve outros trabalhadores atingidos', SNI, cx(1, 432.7, 650.6)),
        dig('57', 'quantos_atingidos', 'Se sim, quantos', 3, { p: 1, x: 485, y: 635, w: 54, h: 10 }, { quando: (d) => d.outros_atingidos === '1' }),
      ],
    },
    {
      titulo: 'Dados do atendimento médico',
      campos: [
        cod('58', 'atendimento_medico', 'Ocorreu atendimento médico?', SNI, cx(1, 365.3, 615.8), { obrig: true }),
        { n: '59', chave: 'data_atendimento', rotulo: 'Data do atendimento', tipo: 'data', caixa: { p: 1, x: 410.6, y: 606.7, w: 115.4, h: 12.2 }, larg: 3, quando: atendido },
        { n: '60', chave: 'uf_atendimento', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 535.2, y: 606.2, w: 27.8, h: 12 }, larg: 1, quando: atendido },
        txt('61', 'municipio_atendimento', 'Município do atendimento', { p: 1, x: 66, y: 578, w: 125, h: 9 }, { fonte: 7.5, quando: atendido }),
        dig('61', 'ibge_atendimento', 'Código (IBGE)', 7, pente(1, [205.9, 220.8, 235.7, 250.5, 265.4, 280.3], 576), { larg: 3, quando: atendido }),
        txt('62', 'us_atendimento', 'Nome da U. S. de atendimento', { p: 1, x: 312, y: 576, w: 150, h: 9 }, { fonte: 7.5, quando: atendido }),
        dig('62', 'cnes_atendimento', 'Código (CNES)', 7, pente(1, [475.2, 490.1, 505.0, 519.8, 534.7, 549.6], 576), { larg: 3, quando: atendido }),
        cod('63', 'parte_corpo1', 'Partes do corpo atingidas (1ª)', PARTES, { p: 1, x: 309.8, y: 549.1, w: 22.1, h: 11 }, { digitos: 2, obrig: true }),
        cod('63', 'parte_corpo2', 'Partes do corpo atingidas (2ª)', PARTES, { p: 1, x: 309.8, y: 535.0, w: 22.1, h: 11 }, { digitos: 2 }),
        cod('63', 'parte_corpo3', 'Partes do corpo atingidas (3ª)', PARTES, { p: 1, x: 309.8, y: 521.5, w: 22.1, h: 11 }, { digitos: 2 }),
        { n: '64', chave: 'cid_lesao', rotulo: 'Diagnóstico da lesão (CID 10)', tipo: 'digitos', alfa: true, digitos: 4, caixa: { p: 1, x: 355.9, y: 519.1, w: 59.6, h: 12.2 }, larg: 3, obrig: true },
        cod('65', 'regime_tratamento', 'Regime de tratamento', [['1', 'Hospitalar'], ['2', 'Ambulatorial'], ['3', 'Ambos'], ['9', 'Ignorado']], cx(1, 547.9, 544.3), { obrig: true }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('66', 'evolucao', 'Evolução do caso', [['1', 'Cura'], ['2', 'Incapacidade temporária'], ['3', 'Incapacidade parcial permanente'], ['4', 'Incapacidade total permanente'], ['5', 'Óbito por acidente de trabalho grave'], ['6', 'Óbito por outras causas'], ['7', 'Outro'], ['9', 'Ignorado']], cx(1, 542.4, 495.4), { larg: 4 }),
        { n: '67', chave: 'data_obito', rotulo: 'Se óbito, data do óbito', tipo: 'data', caixa: { p: 1, x: 62.2, y: 430.1, w: 112.7, h: 12 }, larg: 3, quando: (d) => ['5', '6'].includes(d.evolucao) },
        cod('68', 'cat', 'Foi emitida a Comunicação de Acidente no Trabalho (CAT)', SN3, cx(1, 544.1, 439.4), { larg: 4 }),
        { n: '', chave: 'descricao_acidente', rotulo: 'Descrição sumária de como ocorreu o acidente (atividade, causas, condições, objeto, agentes)', tipo: 'texto_longo', linhas: [361.2, 347.3, 333.6, 320.2, 306.5, 292.8, 279.4].map((y) => ({ p: 1, x: 33.6, y, w: 530.9, h: 13.7 })), larg: 12, obrig: true },
        { n: '', chave: 'observacoes', rotulo: 'Outras informações', tipo: 'texto_longo', linhas: [245.8, 231.8, 218.2, 204.5, 191.0, 177.4, 163.9].map((y) => ({ p: 1, x: 35.8, y, w: 530.9, h: 13.7 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        txt('', 'notificante_unidade', 'Município/Unidade de saúde', { p: 1, x: 60, y: 135, w: 395, h: 10 }, { larg: 8 }),
        { n: '', chave: 'cnes', rotulo: 'Cód. da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [477.4, 492.2, 507.1, 522.0, 536.9, 551.7], 131), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 60, y: 105, w: 195, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 262, y: 105, w: 195, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
