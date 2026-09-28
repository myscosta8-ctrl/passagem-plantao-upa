import { situacaoPrescricao } from '../../lib/prescricaoValidade'

const HORA = 3600000

export function formatarPermanencia(desde, agora = Date.now()) {
  if (!desde) return ''
  const ms = agora - new Date(desde).getTime()
  if (!(ms > 0)) return ''
  const d = Math.floor(ms / (24 * HORA))
  const h = Math.floor((ms % (24 * HORA)) / HORA)
  return d > 0 ? `${d}d ${h}h` : `${h}h`
}

// Reúne o que o card do leito mostra e os alertas automáticos.
export function sinaisDoLeito(paciente, passagem, ind, agora = Date.now()) {
  const desde = paciente.internado_em || paciente.atendimento_criado_em || (paciente.data_admissao ? `${paciente.data_admissao}T12:00:00-03:00` : null)
  const horas = desde ? (agora - new Date(desde).getTime()) / HORA : 0
  const i = ind || {}
  const presc = situacaoPrescricao(i.prescricoes || [], new Date(agora))

  let avpDia = null
  if (passagem?.avp_data_insercao) {
    const dias = Math.floor((agora - new Date(`${passagem.avp_data_insercao}T12:00:00-03:00`).getTime()) / (24 * HORA))
    avpDia = Math.max(1, dias + 1)
  }
  const dispositivos = Array.isArray(passagem?.dispositivos) ? passagem.dispositivos : []

  const alertas = []
  if (presc.nivel === 'vencida') alertas.push({ nivel: 'critico', icone: 'ph-prescription', texto: 'Prescrição vencida' })
  else if (presc.nivel === 'pendente') alertas.push({ nivel: 'atencao', icone: 'ph-prescription', texto: 'Prescrever até 14h00' })
  if (avpDia >= 3) alertas.push({ nivel: 'atencao', icone: 'ph-syringe', texto: `AVP no D${avpDia} — avaliar troca` })
  if (paciente.status_internacao === 'Em observação' && !paciente.data_conduta_definida && horas > 24) alertas.push({ nivel: 'atencao', icone: 'ph-hourglass-high', texto: 'Observação > 24h sem conduta' })
  if (paciente.regulacao_flag && paciente.regulacao_aberta_em && (agora - new Date(paciente.regulacao_aberta_em).getTime()) / HORA > 24) alertas.push({ nivel: 'atencao', icone: 'ph-ambulance', texto: 'Regulação aberta há mais de 24h' })
  if (i.rascunhos > 0) alertas.push({ nivel: 'info', icone: 'ph-pencil-simple', texto: `${i.rascunhos} rascunho(s) não finalizado(s)` })

  return {
    permanencia: formatarPermanencia(desde, agora),
    alergia: paciente.alergias ? (paciente.alergia_substancia || 'Sim') : null,
    isolamento: i.isolamento || null,
    regulacao: paciente.regulacao_flag,
    dispositivos,
    avpDia,
    exames: i.exames || 0,
    sorologias: i.sorologias || 0,
    hemo: i.hemo || 0,
    conferida: !!passagem?.conferido_em,
    temPassagem: !!passagem,
    rascunhos: i.rascunhos || 0,
    prescricao: presc,
    alertas,
    nivelAlerta: alertas.some((a) => a.nivel === 'critico') ? 'critico' : alertas.some((a) => a.nivel === 'atencao') ? 'atencao' : null,
  }
}

// Filtros da faixa de resumo do topo.
export const FILTROS_RESUMO = {
  alergia: (s) => !!s.alergia,
  isolamento: (s) => !!s.isolamento,
  regulacao: (s) => !!s.regulacao,
  pendencias: (s) => s.exames + s.sorologias + s.hemo > 0,
  prescricao: (s) => s.prescricao.nivel !== 'ok',
  conferir: (s) => !s.conferida,
  alertas: (s) => s.alertas.some((a) => a.nivel !== 'info'),
}
