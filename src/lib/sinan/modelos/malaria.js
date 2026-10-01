// Ficha de Investigação — Malária (Sinan NET, SVS 01/01/2010) — Malaria_v5.pdf
import { SEXO, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 452.3, y: 710.2, w: 115.5, h: 12 },
  uf_notificacao: { p: 0, x: 60.6, y: 679.6, w: 27, h: 11.9 },
  municipio_notificacao: { p: 0, x: 104, y: 680, w: 372, h: 10 },
  ibge_notificacao: pente(0, [498.1, 512.5, 526.9, 541.3, 555.7], 678.5),
  unidade_notificadora: { p: 0, x: 75, y: 650, w: 262, h: 10 },
  cnes: pente(0, [356.4, 370.8, 385.2, 399.6, 414.0, 428.4], 649),
  data_primeiros_sintomas: { p: 0, x: 451.1, y: 651.6, w: 115.5, h: 12 },
  nome: { p: 0, x: 75, y: 622, w: 368, h: 10 },
  data_nascimento: { p: 0, x: 454.7, y: 621.0, w: 114.1, h: 12.1 },
  idade: pente(0, [82.1, 95.9], 591, 9),
  unidade_idade: { p: 0, x: 117.1, y: 598.6, w: 10.7, h: 10.7 },
  sexo: { p: 0, x: 239.8, y: 605.8, w: 10.7, h: 10.7 },
  gestante: { p: 0, x: 434.2, y: 605.8, w: 10.7, h: 10.7 },
  raca: { p: 0, x: 559.2, y: 605.0, w: 10.7, h: 10.7 },
  escolaridade: { p: 0, x: 559.7, y: 576.0, w: 10.7, h: 10.7 },
  cns: { p: 0, x: 61.1, y: 530.5, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 253, y: 531, w: 315, h: 10 },
  uf_residencia: { p: 0, x: 61.3, y: 500.5, w: 27, h: 11.9 },
  municipio_residencia: { p: 0, x: 95, y: 500, w: 232, h: 10 },
  ibge_residencia: pente(0, [345.0, 359.4, 373.8, 388.2, 402.6], 500),
  distrito: { p: 0, x: 434, y: 500, w: 134, h: 10 },
  bairro: { p: 0, x: 66, y: 475, w: 140, h: 10 },
  logradouro: { p: 0, x: 214, y: 475, w: 268, h: 10 },
  logradouro_codigo: pente(0, [498.8, 513.2, 527.6, 542.0, 556.4], 474),
  numero: { p: 0, x: 66, y: 450, w: 56, h: 10 },
  complemento: { p: 0, x: 129, y: 450, w: 292, h: 10 },
  geo1: { p: 0, x: 430, y: 450, w: 138, h: 10 },
  geo2: { p: 0, x: 66, y: 425, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 236, y: 425, w: 218, h: 10 },
  cep: { p: 0, x: 462.8, y: 423.2, w: 110.9, h: 11.9 },
  telefone: { p: 0, x: 61.7, y: 398.9, w: 148.1, h: 12.4 },
  zona: { p: 0, x: 340.6, y: 410.9, w: 10.7, h: 10.7 },
  pais: { p: 0, x: 375, y: 400, w: 193, h: 10 },
}

const ATIVIDADE = [['1', 'Agricultura'], ['2', 'Pecuária'], ['3', 'Doméstica'], ['4', 'Turismo'], ['5', 'Garimpagem'], ['6', 'Exploração vegetal'], ['7', 'Caça/pesca'], ['8', 'Construção de estradas/barragens'], ['9', 'Mineração'], ['10', 'Viajante'], ['11', 'Outros'], ['12', 'Motorista'], ['99', 'Ignorado']]
const RESULTADO = [['1', 'Negativo'], ['2', 'F'], ['3', 'F+FG'], ['4', 'V'], ['5', 'F+V'], ['6', 'V+FG'], ['7', 'FG'], ['8', 'M'], ['9', 'F+M'], ['10', 'O']]
const PARASITEMIA = [['1', '< +/2 (menor que meia cruz)'], ['2', '+/2 (meia cruz)'], ['3', '+ (uma cruz)'], ['4', '++ (duas cruzes)'], ['5', '+++ (três cruzes)'], ['6', '++++ (quatro cruzes)']]
const ESQUEMA = [
  ['1', 'Pv: Cloroquina 3 dias + Primaquina 7 dias'], ['2', 'Pf: Quinina 3 dias + Doxiciclina 5 dias + Primaquina no 6º dia'],
  ['3', 'Pv+Pf: Mefloquina dose única + Primaquina 7 dias'], ['4', 'Pm: Cloroquina 3 dias'],
  ['5', 'Pv em crianças com vômitos: artesunato retal 4 dias + Primaquina 7 dias'], ['6', 'Pf: Mefloquina dose única + Primaquina no 2º dia'],
  ['7', 'Pf: Quinina 7 dias'], ['8', 'Pf em crianças: artesunato retal 4 dias + Mefloquina no 3º dia + Primaquina no 5º dia'],
  ['9', 'Pv+Pf: Quinina 3 dias + Doxiciclina 5 dias + Primaquina 7 dias'], ['10', 'Prevenção de recaída Pv: Cloroquina semanal por 3 meses'],
  ['11', 'Malária grave e complicada'], ['12', 'Pf: Artemeter + Lumefantrina 3 dias'], ['99', 'Outro esquema (descrever)'],
]
const tratou = (d) => !!d.esquema_tratamento
const UNID = { 1: 'hora(s)', 2: 'dia(s)', 3: 'mês(es)', 4: 'ano(s)' }

export default {
  id: 'MALARIA',
  titulo: 'Ficha de Investigação — Malária',
  arquivo: 'Malaria_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        { n: '31', chave: 'data_investigacao', rotulo: 'Data da investigação', tipo: 'data', caixa: { p: 0, x: 65.9, y: 350.3, w: 106.6, h: 12.1 }, larg: 3 },
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 196, y: 352, w: 372, h: 10 }, larg: 9 },
        { n: '33', chave: 'atividade_15_dias', rotulo: 'Principal atividade nos últimos 15 dias', tipo: 'codigo', opcoes: ATIVIDADE, caixa: { p: 0, x: 371.8, y: 332.2, w: 10.8, h: 11 }, larg: 5 },
        { n: '34', chave: 'tipo_lamina', rotulo: 'Tipo de lâmina', tipo: 'codigo', opcoes: [['1', 'BP'], ['2', 'BA'], ['3', 'LVC']], caixa: { p: 0, x: 470.9, y: 324.7, w: 10.8, h: 11 }, larg: 3 },
        { n: '35', chave: 'sintomas', rotulo: 'Sintomas', tipo: 'codigo', opcoes: [['1', 'Com sintomas'], ['2', 'Sem sintomas']], caixa: { p: 0, x: 558.0, y: 324.7, w: 10.8, h: 11 }, larg: 4 },
      ],
    },
    {
      titulo: 'Dados do exame',
      campos: [
        { n: '36', chave: 'data_exame', rotulo: 'Data do exame', tipo: 'data', caixa: { p: 0, x: 68.2, y: 268.1, w: 117.5, h: 13.3 }, larg: 3 },
        { n: '37', chave: 'resultado_exame', rotulo: 'Resultado do exame', tipo: 'codigo', opcoes: RESULTADO, caixa: { p: 0, x: 464.9, y: 286.3, w: 11.5, h: 11.5 }, larg: 3 },
        { n: '38', chave: 'parasitos_mm3', rotulo: 'Parasitos por mm³', tipo: 'digitos', digitos: 7, caixa: { p: 0, x: 482, y: 268, w: 86, h: 10 }, larg: 3, quando: (d) => d.resultado_exame && d.resultado_exame !== '1' },
        { n: '39', chave: 'parasitemia', rotulo: 'Parasitemia em "cruzes"', tipo: 'codigo', opcoes: PARASITEMIA, caixa: { p: 0, x: 539.0, y: 251.0, w: 11.5, h: 11.5 }, larg: 3, quando: (d) => d.resultado_exame && d.resultado_exame !== '1' },
      ],
    },
    {
      titulo: 'Tratamento',
      campos: [
        { n: '40', chave: 'esquema_tratamento', rotulo: 'Esquema de tratamento utilizado (Manual de Terapêutica da Malária)', tipo: 'codigo', opcoes: ESQUEMA, caixa: { p: 0, x: 540.5, y: 214.3, w: 11.5, h: 11.5 }, larg: 9 },
        { n: '41', chave: 'data_inicio_tratamento', rotulo: 'Data de início do tratamento', tipo: 'data', caixa: { p: 0, x: 454.9, y: 111.6, w: 113.5, h: 13.2 }, larg: 3, quando: tratou },
        { n: '40', chave: 'esquema_outro', rotulo: 'Outro esquema utilizado (por médico) — descrever', tipo: 'texto', caixa: { p: 0, x: 260, y: 112.5, w: 188, h: 9 }, fonte: 7, larg: 12, quando: (d) => d.esquema_tratamento === '99' },
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        { n: '42', chave: 'classificacao_final', rotulo: 'Classificação final', tipo: 'codigo', opcoes: [['1', 'Confirmado'], ['2', 'Descartado']], caixa: { p: 1, x: 193.2, y: 792.2, w: 11.5, h: 12 }, larg: 3 },
        { n: '43', chave: 'autoctone', rotulo: 'O caso é autóctone do município de residência?', tipo: 'codigo', opcoes: [['1', 'Sim'], ['2', 'Não'], ['3', 'Indeterminado']], caixa: { p: 1, x: 257.8, y: 745.7, w: 11.5, h: 12 }, larg: 4 },
        { n: '44', chave: 'infeccao_uf', rotulo: 'UF provável de infecção', tipo: 'uf', caixa: { p: 1, x: 287.2, y: 722.8, w: 27.7, h: 14.5 }, larg: 2, quando: (d) => d.autoctone && d.autoctone !== '1' },
        { n: '45', chave: 'infeccao_pais', rotulo: 'País provável de infecção', tipo: 'texto', caixa: { p: 1, x: 346, y: 726, w: 222, h: 10 }, larg: 3, quando: (d) => d.autoctone && d.autoctone !== '1' },
        { n: '46', chave: 'infeccao_municipio', rotulo: 'Município provável da infecção', tipo: 'texto', caixa: { p: 1, x: 66, y: 690, w: 160, h: 10 }, larg: 4, quando: (d) => d.autoctone && d.autoctone !== '1' },
        { n: '46', chave: 'infeccao_ibge', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(1, [238.7, 253.1, 267.5, 281.9, 296.3], 687.5), larg: 2, quando: (d) => d.autoctone && d.autoctone !== '1' },
        { n: '47', chave: 'infeccao_distrito', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 1, x: 325, y: 688, w: 135, h: 10 }, larg: 3 },
        { n: '48', chave: 'infeccao_bairro', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 1, x: 470, y: 688, w: 104, h: 10 }, larg: 3 },
        { n: '49', chave: 'infeccao_localidade', rotulo: 'Localidade provável da infecção', tipo: 'texto', caixa: { p: 1, x: 66, y: 655, w: 390, h: 10 }, larg: 9 },
        { n: '50', chave: 'data_encerramento', rotulo: 'Data de encerramento', tipo: 'data', caixa: { p: 1, x: 463.3, y: 646, w: 113.5, h: 13.1 }, larg: 3 },
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [594, 582, 569.7, 557, 545.2, 533.7].map((y) => ({ p: 1, x: 36, y, w: 540, h: 12 })), larg: 12 },
      ],
    },
    {
      titulo: 'Comprovante de resultado do exame (entregue ao paciente)',
      campos: [
        { n: '', chave: 'nome', rotulo: 'Nome do paciente', tipo: 'texto', caixa: { p: 1, x: 66, y: 478, w: 320, h: 9 }, larg: 6, espelho: true },
        { n: '', chave: 'comp_idade', rotulo: 'Idade', tipo: 'texto', derivar: (d) => (d.idade ? `${d.idade} ${UNID[d.unidade_idade] || ''}`.trim() : ''), caixa: { p: 1, x: 392, y: 478, w: 78, h: 9 }, larg: 2 },
        { n: '', chave: 'comp_sexo', rotulo: 'Sexo', tipo: 'codigo', derivar: (d) => ({ M: '1', F: '2' })[d.sexo] || '', opcoes: [['1', 'Masculino'], ['2', 'Feminino']], caixa: { p: 1, x: 545.8, y: 487.4, w: 11.5, h: 12 }, larg: 2 },
        { n: '', chave: 'comp_num_notificacao', rotulo: 'Nº da notificação', tipo: 'digitos', digitos: 7, caixa: { p: 1, x: 63.7, y: 451, w: 94.3, h: 13.2 }, larg: 3 },
        { n: '', chave: 'data_exame', rotulo: 'Data do exame', tipo: 'data', caixa: { p: 1, x: 185.8, y: 451, w: 113.5, h: 13.1 }, larg: 3, espelho: true },
        { n: '', chave: 'comp_resultado', rotulo: 'Resultado do exame', tipo: 'texto', derivar: (d) => (RESULTADO.find(([c]) => c === d.resultado_exame) || [])[1] || '', caixa: { p: 1, x: 305, y: 452, w: 115, h: 9 }, larg: 3 },
        { n: '', chave: 'comp_examinador', rotulo: 'Matrícula e nome do examinador', tipo: 'texto', caixa: { p: 1, x: 425, y: 452, w: 150, h: 9 }, larg: 4 },
      ],
    },
  ],
}
