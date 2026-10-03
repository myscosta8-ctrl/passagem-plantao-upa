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
