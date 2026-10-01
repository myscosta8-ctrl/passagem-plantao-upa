// Peças comuns das fichas SINAN (opções de código, blocos do cabeçalho e do notificante).
// Coordenadas em pontos do PDF (origem no canto inferior esquerdo, página A4 595x842).

export const SIM_NAO_IGN = [['1', 'Sim'], ['2', 'Não'], ['9', 'Ignorado']]
export const SEXO = [['M', 'Masculino'], ['F', 'Feminino'], ['I', 'Ignorado']]
export const UNID_IDADE = [['1', 'Hora'], ['2', 'Dia'], ['3', 'Mês'], ['4', 'Ano']]
export const GESTANTE = [['1', '1º Trimestre'], ['2', '2º Trimestre'], ['3', '3º Trimestre'], ['4', 'Idade gestacional ignorada'], ['5', 'Não'], ['6', 'Não se aplica'], ['9', 'Ignorado']]
export const RACA = [['1', 'Branca'], ['2', 'Preta'], ['3', 'Amarela'], ['4', 'Parda'], ['5', 'Indígena'], ['9', 'Ignorado']]
export const ESCOLARIDADE = [
  ['0', 'Analfabeto'], ['1', '1ª a 4ª série incompleta do EF'], ['2', '4ª série completa do EF'],
  ['3', '5ª à 8ª série incompleta do EF'], ['4', 'Ensino fundamental completo'], ['5', 'Ensino médio incompleto'],
  ['6', 'Ensino médio completo'], ['7', 'Educação superior incompleta'], ['8', 'Educação superior completa'],
  ['9', 'Ignorado'], ['10', 'Não se aplica'],
]
export const ZONA = [['1', 'Urbana'], ['2', 'Rural'], ['3', 'Periurbana'], ['9', 'Ignorado']]
export const TIPO_NOTIFICACAO = [['1', 'Negativa'], ['2', 'Individual'], ['3', 'Surto'], ['4', 'Inquérito Tracoma']]
export const EVOLUCAO = [['1', 'Cura'], ['2', 'Óbito pelo agravo notificado'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']]

// Dados fixos da unidade notificadora.
export const UNIDADE = {
  uf: 'PA', municipio: 'BREVES', municipio_ibge: '150180', // SINAN usa o código IBGE de 6 dígitos (sem o verificador)
  nome: 'UPA 24H BREVES', cnes: '0296796',
}

// Regras de quem aparece: gestante só para sexo feminino.
export const soFeminino = (d) => d.sexo === 'F'

// Cabeçalho padrão das fichas de investigação (campos 1 a 30). Só a posição muda de uma ficha para outra:
// `g` traz a caixa de cada campo naquela ficha ({ p, x, y, w, h }). Campo sem caixa em `g` não entra.
export function cabecalhoInvestigacao(g, { rotulo7 = 'Data dos primeiros sintomas' } = {}) {
  const c = (n, chave, rotulo, tipo, extra = {}) => (g[chave] ? { n, chave, rotulo, tipo, caixa: g[chave], ...extra } : null)
  const limpa = (l) => l.filter(Boolean)
  return [
    {
      titulo: 'Dados gerais',
      campos: limpa([
        c('3', 'data_notificacao', 'Data da notificação', 'data', { larg: 3, obrig: true }),
        c('4', 'uf_notificacao', 'UF', 'uf', { larg: 1, obrig: true }),
        c('5', 'municipio_notificacao', 'Município de notificação', 'texto', { larg: 5, obrig: true }),
        c('5', 'ibge_notificacao', 'Código (IBGE)', 'digitos', { digitos: 6, larg: 3, obrig: true }),
        c('6', 'unidade_notificadora', 'Unidade de saúde (ou outra fonte notificadora)', 'texto', { larg: 6, obrig: true }),
        c('6', 'cnes', 'Código (CNES)', 'digitos', { digitos: 7, larg: 3, obrig: true }),
        c('7', 'data_primeiros_sintomas', rotulo7, 'data', { larg: 3, obrig: true }),
      ]),
    },
    {
      titulo: 'Notificação individual',
      campos: limpa([
        c('8', 'nome', 'Nome do paciente', 'texto', { larg: 9, obrig: true }),
        c('9', 'data_nascimento', 'Data de nascimento', 'data', { larg: 3 }),
        c('10', 'idade', '(ou) Idade', 'digitos', { digitos: 3, larg: 2, obrig: true }),
        c('10', 'unidade_idade', 'Unidade da idade', 'codigo', { opcoes: UNID_IDADE, larg: 2, obrig: true }),
        c('11', 'sexo', 'Sexo', 'codigo', { opcoes: SEXO, larg: 2, obrig: true }),
        c('12', 'gestante', 'Gestante', 'codigo', { opcoes: GESTANTE, larg: 3, obrig: true, quando: soFeminino, senao: '6' }),
        c('13', 'raca', 'Raça/cor', 'codigo', { opcoes: RACA, larg: 3, obrig: true }),
        c('14', 'escolaridade', 'Escolaridade', 'codigo', { opcoes: ESCOLARIDADE, larg: 5, obrig: true }),
        c('15', 'cns', 'Número do cartão SUS', 'digitos', { digitos: 15, larg: 3 }),
        c('16', 'nome_mae', 'Nome da mãe', 'texto', { larg: 4 }),
      ]),
    },
    {
      titulo: 'Dados de residência',
      campos: limpa([
        c('17', 'uf_residencia', 'UF', 'uf', { larg: 1 }),
        c('18', 'municipio_residencia', 'Município de residência', 'texto', { larg: 4 }),
        c('18', 'ibge_residencia', 'Código (IBGE)', 'digitos', { digitos: 6, larg: 3 }),
        c('19', 'distrito', 'Distrito', 'texto', { larg: 4 }),
        c('20', 'bairro', 'Bairro', 'texto', { larg: 3 }),
        c('21', 'logradouro', 'Logradouro (rua, avenida...)', 'texto', { larg: 6 }),
        c('21', 'logradouro_codigo', 'Código do logradouro', 'digitos', { digitos: 6, larg: 3 }),
        c('22', 'numero', 'Número', 'texto', { larg: 2 }),
        c('23', 'complemento', 'Complemento (apto., casa...)', 'texto', { larg: 5 }),
        c('24', 'geo1', 'Geo campo 1', 'texto', { larg: 2 }),
        c('25', 'geo2', 'Geo campo 2', 'texto', { larg: 3 }),
        c('26', 'ponto_referencia', 'Ponto de referência', 'texto', { larg: 5 }),
        c('27', 'cep', 'CEP', 'digitos', { digitos: 8, larg: 3 }),
        c('28', 'telefone', '(DDD) Telefone', 'digitos', { digitos: 10, larg: 3 }),
        c('29', 'zona', 'Zona', 'codigo', { opcoes: ZONA, larg: 3 }),
        c('30', 'pais', 'País (se residente fora do Brasil)', 'texto', { larg: 6 }),
      ]),
    },
  ]
}

// Caixa de pente (dígito por dígito) a partir dos traços separadores impressos.
export function pente(p, separadores, y, h = 10, passoFixo = 14.4) {
  const passo = separadores.length > 1 ? (separadores[separadores.length - 1] - separadores[0]) / (separadores.length - 1) : passoFixo
  const x = separadores[0] - passo
  return { p, x, y, w: passo * (separadores.length + 1), h }
}
