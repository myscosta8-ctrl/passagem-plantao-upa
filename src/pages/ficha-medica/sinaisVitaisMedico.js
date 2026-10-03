// Sinais vitais da Evolução Médica (sem tela): ligação entre os campos sv_* da evolução e a
// tabela única de sinais vitais do atendimento (sinais_vitais), a mesma da enfermagem, que
// alimenta o painel, a passagem de plantão e o SBAR.

// campo da evolução → coluna de sinais_vitais
export const SV_PARA_TABELA = {
  sv_pa_sistolica: 'pa_sistolica',
  sv_pa_diastolica: 'pa_diastolica',
  sv_fc: 'fc',
  sv_fr: 'fr',
  sv_temperatura: 'temperatura',
  sv_spo2: 'spo2',
  sv_hgt: 'glicemia',
}
// Registros antigos usam outros nomes de coluna para o mesmo sinal.
const COLUNAS_ANTIGAS = {
  pa_sistolica: 'pressao_arterial_sistolica',
  pa_diastolica: 'pressao_arterial_diastolica',
  fc: 'frequencia_cardiaca',
  fr: 'frequencia_respiratoria',
  spo2: 'saturacao_oxigenio',
  glicemia: 'hgt',
}

// Último registro da enfermagem → campos da evolução ('' quando o sinal não foi medido).
export function camposDaEnfermagem(registro) {
  const r = registro || {}
  return Object.fromEntries(Object.entries(SV_PARA_TABELA).map(([campo, col]) => {
    const v = r[col] ?? r[COLUNAS_ANTIGAS[col]] ?? ''
    return [campo, v === null ? '' : v]
  }))
}

const numero = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v))

// Campos da evolução → dados para registrar em sinais_vitais; null quando nada foi preenchido.
export function dadosParaTabela(dados) {
  const saida = {}
  let algum = false
  for (const [campo, col] of Object.entries(SV_PARA_TABELA)) {
    const n = numero(dados?.[campo])
    saida[col] = n === null ? '' : n
    if (n !== null) algum = true
  }
  return algum ? saida : null
}

// Os sinais da evolução são exatamente os que vieram da enfermagem (sem nenhuma alteração)?
// Nesse caso não se grava de novo, para não duplicar a mesma medida no histórico.
export function mesmosSinais(dados, puxados) {
  if (!puxados) return false
  return Object.keys(SV_PARA_TABELA).every((c) => numero(dados?.[c]) === numero(puxados[c]))
}

// Medida recente o bastante para entrar sozinha numa evolução nova (padrão: até 6 horas).
export function medidaRecente(registradoEm, agora = new Date(), horas = 6) {
  const t = new Date(registradoEm).getTime()
  return Number.isFinite(t) && agora.getTime() - t >= 0 && agora.getTime() - t <= horas * 3600 * 1000
}
