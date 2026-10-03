// Regras do Laudo de AIH (sem tela): listas do formulário, identificação do paciente vinda do
// cadastro, dados puxados da admissão médica e CIDs. Usadas pela aba AIH e testadas sem navegador.
import { numeroLimpo } from '../../../lib/numeros.js'

export const PROCEDIMENTOS_RAPIDOS = [
  { cod: '0303010190', codFormatado: '03.03.01.019-0', desc: 'TRATAMENTO DE PNEUMONIA OU INFLUENZA (GRIPE)', rotulo: 'Pneumonia / Influenza' },
  { cod: '0303010034', codFormatado: '03.03.01.003-4', desc: 'TRATAMENTO DE OUTRAS DOENCAS DO APARELHO RESPIRATORIO (ASMA/BRONQUITE)', rotulo: 'Doenças Respiratórias (Asma)' },
  { cod: '0303010069', codFormatado: '03.03.01.006-9', desc: 'TRATAMENTO DE TRANSTORNOS DIGESTIVOS / DIARREIA AGUDA', rotulo: 'Transtornos Digestivos' },
]

export const VINCULOS = [
  { valor: 'empregado', rotulo: 'Empregado' }, { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' }, { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' }, { valor: 'nao_segurado', rotulo: 'Não segurado' },
]
export const RACAS = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDÍGENA', 'SEM INFORMAÇÃO']

// Atalhos do campo 21 (condições que justificam a internação): [rótulo do botão, texto].
export const CHIPS_JUSTIFICATIVA = [
  ['+ Insuficiência Respiratória', 'Risco iminente de insuficiência respiratória'],
  ['+ Antibioticoterapia EV', 'Necessidade de antibioticoterapia parenteral supervisionada'],
  ['+ Intolerância VO', 'Intolerância medicamentosa oral com desidratação'],
  ['+ Refratariedade Ambulatorial', 'Refratariedade ao tratamento ambulatorial prévio'],
]

// Liga/desliga um atalho no texto do campo 21 (itens separados por "; "). Ao desligar, não sobra
// "; " solto no começo, no meio ou no fim do texto.
export function alternarJustificativa(atual, texto) {
  atual = atual || ''
  if (atual.includes(texto)) {
    return atual.replace(texto, '').split(';').map((x) => x.trim()).filter(Boolean).join('; ')
  }
  return atual.trim() ? `${atual.trim()}; ${texto}` : texto
}

// Campos 5-9, 11, 12 e 15: vêm do cadastro (`pessoas`); `paciente` (tabela legada) é só reserva
// para nome/sexo enquanto o cadastro não carregou. Nunca inventa dado num documento legal.
export function identificacaoPaciente(pessoa = {}, paciente = {}, atendimento = {}) {
  const sexoBruto = pessoa?.sexo || paciente?.sexo || atendimento?.sexo
  return {
    nome: pessoa?.nome || paciente?.nome || atendimento?.nome || 'NÃO IDENTIFICADO',
    prontuario: numeroLimpo(pessoa?.prontuario_numero) || '',
    cns: pessoa?.cns || '',
    nascimento: pessoa?.data_nascimento
      ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
      : (paciente?.idade ? `${paciente.idade} anos` : ''),
    sexo: String(sexoBruto || '').toUpperCase().startsWith('F') ? 'FEMININO' : sexoBruto ? 'MASCULINO' : '',
    mae: (pessoa?.nome_mae || '').toUpperCase(),
    telefone: pessoa?.telefone || '',
    endereco: pessoa?.endereco
      ? `${[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')} — ${pessoa.cidade || 'BREVES'}/PA`.toUpperCase()
      : '',
  }
}

// Campos 20, 23 e 24 a partir da última consulta (admissão médica).
// - Ao abrir a aba: só preenche o que está VAZIO (nunca apaga o que o médico escreveu ou o rascunho).
// - "Re-sincronizar Agora" (substituir = true): troca pelo texto da admissão, com os sinais vitais.
export function dadosDaAdmissao(consulta, atuais, substituir = false) {
  if (!consulta) return atuais
  const cid = consulta.hipotese_diagnostica?.split(' ')[0] || ''
  if (substituir) {
    return {
      ...atuais,
      sinais_sintomas_clinicos: `PACIENTE ADMITIDO NA UPA 24H BREVES COM HISTÓRIA DE: ${(consulta.queixa_principal || '').toUpperCase()}. SINAIS VITAIS: PA ${consulta.sv?.pa || '—'}, FC ${consulta.sv?.fc || '—'}, TEMP ${consulta.sv?.temp || '—'}°C, SPO2 ${consulta.sv?.spo2 || '—'}%.`,
      diagnostico_inicial_texto: consulta.hipotese_diagnostica || atuais.diagnostico_inicial_texto,
      cid_principal: cid || atuais.cid_principal,
    }
  }
  const vazio = (k) => !String(atuais[k] || '').trim()
  return {
    ...atuais,
    sinais_sintomas_clinicos: vazio('sinais_sintomas_clinicos') && consulta.queixa_principal
      ? `PACIENTE ADMITIDO NA UPA 24H BREVES COM HISTÓRIA DE: ${consulta.queixa_principal.toUpperCase()}` : atuais.sinais_sintomas_clinicos,
    diagnostico_inicial_texto: vazio('diagnostico_inicial_texto') && consulta.hipotese_diagnostica ? consulta.hipotese_diagnostica : atuais.diagnostico_inicial_texto,
    cid_principal: vazio('cid_principal') && cid ? cid : atuais.cid_principal,
  }
}

// CIDs para gravar: só código do catálogo CID-10 vai para a coluna; o que não foi encontrado
// fica guardado como texto no rascunho (não se perde) até ser corrigido.
// existentes = Set dos códigos encontrados no catálogo; cid1/cid2 = códigos já normalizados.
export function separarCids(dados, cid1, cid2, existentes) {
  const invalidos = [[dados.cid_principal, cid1], [dados.cid_secundario, cid2]]
    .filter(([orig, c]) => String(orig || '').trim() && !existentes.has(c)).map(([orig]) => orig)
  const dadosGravar = { ...dados, cid_principal: existentes.has(cid1) ? cid1 : '', cid_secundario: existentes.has(cid2) ? cid2 : '' }
  const cidTexto = invalidos.length
    ? { cid_principal_texto: existentes.has(cid1) ? '' : (dados.cid_principal || ''), cid_secundario_texto: existentes.has(cid2) ? '' : (dados.cid_secundario || '') }
    : null
  return { invalidos, dadosGravar, cidTexto }
}

// ===== Identificação do paciente editável na AIH (campos 5-9, 11, 12 e 15) =====
// A recepção nem sempre completa o cadastro a tempo: o médico pode escrever esses campos no
// laudo. Eles começam com o que está no cadastro e, ao salvar, o que estava VAZIO no cadastro
// é completado com o que foi escrito na AIH (caminho de volta). Dado que a recepção já
// registrou nunca é trocado — a diferença é avisada para conferência.
const so = (v) => String(v ?? '').trim()
const digitos = (v) => so(v).replace(/\D/g, '')

export function camposPacienteDoCadastro(pessoa = {}) {
  const nasc = pessoa?.data_nascimento ? new Date(`${pessoa.data_nascimento}T00:00:00`).toLocaleDateString('pt-BR') : ''
  const sexo = String(pessoa?.sexo || '').toUpperCase().startsWith('F') ? 'F' : pessoa?.sexo ? 'M' : ''
  return {
    paciente_nome: so(pessoa?.nome).toUpperCase(),
    paciente_prontuario: numeroLimpo(pessoa?.prontuario_numero) || '',
    paciente_cns: digitos(pessoa?.cns),
    paciente_nascimento: nasc,
    paciente_sexo: sexo,
    paciente_mae: so(pessoa?.nome_mae).toUpperCase(),
    paciente_telefone: so(pessoa?.telefone || pessoa?.telefone_contato),
    paciente_endereco: [pessoa?.endereco, pessoa?.endereco_numero, pessoa?.bairro].filter(Boolean).join(', ').toUpperCase(),
  }
}

// Completa no formulário só o que ainda está vazio (rascunho e o que o médico escreveu ficam).
export function preencherVazios(dados, base) {
  const novo = { ...dados }
  for (const [k, v] of Object.entries(base)) if (!so(novo[k]) && so(v)) novo[k] = v
  return novo
}

// "dd/mm/aaaa" → "aaaa-mm-dd" (data válida e não futura) ou null.
export function dataISO(br) {
  const m = so(br).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  if (d.getDate() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d > new Date() || Number(m[3]) < 1900) return null
  return `${m[3]}-${m[2]}-${m[1]}`
}

// O que gravar no cadastro (só colunas vazias lá) e o que difere do cadastro (para avisar).
export function atualizacaoDoCadastro(pessoa = {}, dados = {}) {
  const alvo = [
    ['cns', 'CNS', digitos(dados.paciente_cns).length === 15 ? digitos(dados.paciente_cns) : '', digitos(pessoa.cns)],
    ['data_nascimento', 'data de nascimento', dataISO(dados.paciente_nascimento) || '', so(pessoa.data_nascimento)],
    ['sexo', 'sexo', ['M', 'F'].includes(dados.paciente_sexo) ? dados.paciente_sexo : '', so(pessoa.sexo).toUpperCase().slice(0, 1)],
    ['nome_mae', 'nome da mãe', so(dados.paciente_mae).toUpperCase(), so(pessoa.nome_mae).toUpperCase()],
    ['telefone', 'telefone', so(dados.paciente_telefone), so(pessoa.telefone)],
    ['endereco', 'endereço', so(dados.paciente_endereco).toUpperCase(), [pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ').toUpperCase()],
    ['raca_cor', 'raça/cor', so(dados.raca_cor).toUpperCase(), so(pessoa.raca_cor).toUpperCase()],
    ['cidade', 'município', so(dados.municipio_residencia_nome).toUpperCase(), so(pessoa.cidade).toUpperCase()],
    ['municipio_ibge', 'código IBGE', digitos(dados.municipio_residencia_ibge), digitos(pessoa.municipio_ibge)],
    ['uf', 'UF', so(dados.municipio_residencia_uf).toUpperCase(), so(pessoa.uf).toUpperCase()],
    ['cep', 'CEP', so(dados.municipio_residencia_cep), so(pessoa.cep)],
  ]
  // Município 16-19 com o padrão do formulário (Breves/PA) não foi escrito pelo médico: não vai ao cadastro.
  const padraoBreves = so(dados.municipio_residencia_nome).toUpperCase() === 'BREVES' && digitos(dados.municipio_residencia_ibge) === '1501808'
    && so(dados.municipio_residencia_uf).toUpperCase() === 'PA' && digitos(dados.municipio_residencia_cep) === '68800000'
  const alterar = {}
  const preenchidos = []
  const divergentes = []
  for (const [col, rotulo, novo, atual] of alvo) {
    if (!novo || (padraoBreves && ['cidade', 'municipio_ibge', 'uf', 'cep'].includes(col))) continue
    const numerico = ['cns', 'telefone', 'municipio_ibge', 'cep'].includes(col)
    const igual = numerico ? digitos(novo) === digitos(atual) : novo.toUpperCase() === atual.toUpperCase()
    if (!atual) { alterar[col] = novo; preenchidos.push(rotulo) } else if (!igual) divergentes.push(rotulo)
  }
  return { alterar, preenchidos, divergentes }
}
