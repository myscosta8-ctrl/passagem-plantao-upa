// Validade da prescrição médica: cada prescrição vale para um "dia de prescrição"
// (data_referencia), das 14h00 desse dia até as 13h59 do dia seguinte (horário de Belém).
const FUSO = 'America/Belem'

export function hojeBelem(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}
export function horaBelem(d = new Date()) {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: FUSO, hour: '2-digit', hour12: false }).format(d))
}
export function somarDias(iso, n) {
  const d = new Date(`${iso}T12:00:00-03:00`)
  d.setDate(d.getDate() + n)
  return hojeBelem(d)
}
const br = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—')

// "de 28/09 14h00 até 29/09 13h59". Prescrição emitida antes das 14h do próprio
// dia de referência (ex.: admissão pela manhã) vale desde a emissão.
export function textoValidade(dataRef, emissao = null) {
  if (!dataRef) return ''
  let inicio = '14h00'
  if (emissao) {
    const e = new Date(emissao)
    if (hojeBelem(e) === dataRef && horaBelem(e) < 14) {
      const hm = new Intl.DateTimeFormat('en-GB', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hour12: false }).format(e)
      inicio = hm.replace(':', 'h')
    }
  }
  return `de ${br(dataRef)} ${inicio} até ${br(somarDias(dataRef, 1))} 13h59`
}

// Situação da prescrição do paciente agora.
// datas = data_referencia das prescrições FINALIZADAS (não invalidadas) do atendimento.
export function situacaoPrescricao(datas, agora = new Date()) {
  const hoje = hojeBelem(agora)
  const ontem = somarDias(hoje, -1)
  const tem = new Set(datas || [])
  if (tem.has(hoje)) return { nivel: 'ok', texto: 'Prescrição do dia em vigor' }
  if (horaBelem(agora) < 14) {
    if (tem.has(ontem)) return { nivel: 'pendente', texto: 'Prescrever até 14h00' }
    return { nivel: 'vencida', texto: 'Prescrição vencida' }
  }
  return { nivel: 'vencida', texto: 'Prescrição vencida' }
}
