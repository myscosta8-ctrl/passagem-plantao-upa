import { useEffect, useRef, useState } from 'react'
import './IndicadoresClinicos.css'

// Ícones monolinha (20x20, stroke=currentColor) — sem dependência externa.
const ICONES = {
  dispositivo: (
    <path d="M4 10h4l2-3 2 6 2-3h4M4 10a2 2 0 100 4h1M16 10a2 2 0 110 4h-1" />
  ),
  exame: (
    <path d="M7 3h6v3H7zM6 6h8v13a1 1 0 01-1 1H7a1 1 0 01-1-1V6zM8.5 11l1.2 1.2L12.5 9" />
  ),
  sorologia: (
    <path d="M8 2h4M9 2v6.5L5.5 15a2 2 0 001.7 3h5.6a2 2 0 001.7-3L11 8.5V2M6.5 13h7" />
  ),
  hemoterapia: (
    <path d="M10 2s5.5 6.4 5.5 10.2A5.5 5.5 0 0110 17.7a5.5 5.5 0 01-5.5-5.5C4.5 8.4 10 2 10 2z" />
  ),
  regulacao: (
    <path d="M6 3h5l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM11 3v3h3M8 11h4M8 14h4" />
  ),
  transferencia: (
    <path d="M3 16V8l4-3 4 3v8M11 16V5l3-2 3 2v11M3 16h14M7 16v-3h2v3" />
  ),
  emergencia: (
    <path d="M10 2l7 3.2v4.6c0 5-3 8.4-7 9.2-4-.8-7-4.2-7-9.2V5.2L10 2zM10 7v4M10 14v.01" />
  ),
  consciencia: (
    <path d="M10 4a5 5 0 015 5c0 2-1.2 3-1.2 4.5V15h-7.6v-1.5C5.2 12 4 11 4 9a5 5 0 016-5zM8.3 15v1.3a1.7 1.7 0 001.7 1.7 1.7 1.7 0 001.7-1.7V15" />
  ),
  curativo: (
    <path d="M5.5 5.5l9 9M4 9l7-7 3 3-7 7-3-3zM13 4l3 3M12 12l3 3M9 14l-3 3-3-3 3-3" />
  ),
}

const TOM = {
  neutral: { fg: 'var(--c-primary)', bg: 'var(--c-primary-light)' },
  info: { fg: 'var(--c-info)', bg: 'var(--c-info-light)' },
  warning: { fg: 'var(--c-warning)', bg: 'var(--c-warning-light)' },
  success: { fg: 'var(--c-success)', bg: 'var(--c-success-light)' },
  danger: { fg: 'var(--c-danger)', bg: 'var(--c-danger-light)' },
}

function statusTom(status) {
  if (status === 'Resultado disponível') return 'success'
  if (status === 'Aguardando laudo' || status === 'Aguardando resultado') return 'warning'
  return 'info'
}

function formatarData(iso) {
  if (!iso) return null
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

function formatarDuracao(horas) {
  const dias = Math.floor(horas / 24)
  const resto = Math.floor(horas % 24)
  return dias > 0 ? `${dias}d ${resto}h` : `${Math.floor(horas)}h`
}

// AVP tem prazo de troca de 96h. A cor do ícone escala sozinha conforme o tempo
// desde a inserção, sem precisar que ninguém confira manualmente.
function avaliarAvp(dataInsercao, horaInsercao) {
  if (!dataInsercao || !horaInsercao) {
    return { tom: 'neutral', texto: 'AVP presente — data/hora de inserção não registrada.' }
  }
  const inserido = new Date(`${dataInsercao}T${horaInsercao}:00`)
  const horasDecorridas = (Date.now() - inserido.getTime()) / 3_600_000
  const dataHoraFmt = `${formatarData(dataInsercao)} às ${horaInsercao}`

  if (horasDecorridas >= 96) {
    return { tom: 'danger', piscando: true, texto: `AVP inserido em ${dataHoraFmt} — vencido há ${formatarDuracao(horasDecorridas - 96)}, trocar.` }
  }
  if (horasDecorridas >= 84) {
    return { tom: 'warning', texto: `AVP inserido em ${dataHoraFmt} — trocar em ${formatarDuracao(96 - horasDecorridas)}.` }
  }
  return { tom: 'neutral', texto: `AVP inserido em ${dataHoraFmt} — dentro do prazo (${formatarDuracao(96 - horasDecorridas)} restantes).` }
}

// Só entra na lista o que foge da rotina ou está pendente — regra central
// pedida pelo Marcus: card limpo para paciente de rotina, sinalizado para o resto.
function montarIndicadores(p) {
  if (!p) return []
  const itens = []

  const dispositivosBrutos = p.dispositivos ?? []
  // Compatibilidade: passagens antigas guardavam "AVP: sim" separado do grupo de dispositivos.
  const temAvp = dispositivosBrutos.includes('AVP') || p.avp === true
  const outrosDispositivos = dispositivosBrutos.filter((d) => d !== 'AVP')

  if (temAvp || outrosDispositivos.length > 0) {
    const partes = []
    let tom = 'neutral'
    let piscando = false
    if (temAvp) {
      const avaliacao = avaliarAvp(p.avp_data_insercao, p.avp_hora_insercao)
      tom = avaliacao.tom
      piscando = !!avaliacao.piscando
      partes.push(avaliacao.texto)
    }
    if (outrosDispositivos.length > 0) {
      partes.push(outrosDispositivos.join(', ') + (p.dispositivos_detalhe ? ` — ${p.dispositivos_detalhe}` : ''))
    }
    itens.push({ icone: 'dispositivo', tom, piscando, titulo: 'Dispositivos', texto: partes.join(' · ') })
  }

  if (p.exame_status) {
    let texto = p.exame_nome ? `${p.exame_nome} — ${p.exame_status}` : p.exame_status
    if (p.exame_status === 'A realizar' && p.exame_a_realizar_data) {
      texto += ` (${formatarData(p.exame_a_realizar_data)}${p.exame_a_realizar_hora ? ` às ${p.exame_a_realizar_hora}` : ''})`
    }
    if (p.exame_resultado) texto += `. ${p.exame_resultado}`
    itens.push({ icone: 'exame', tom: statusTom(p.exame_status), titulo: 'Exame', texto })
  }

  if (p.sorologia_status) {
    let texto = p.sorologias ? `${p.sorologias} — ${p.sorologia_status}` : p.sorologia_status
    if (p.sorologia_data_coleta) texto += `. Coleta: ${formatarData(p.sorologia_data_coleta)}`
    if (p.sorologia_data_notificacao) texto += `. Notificado: ${formatarData(p.sorologia_data_notificacao)}`
    itens.push({ icone: 'sorologia', tom: statusTom(p.sorologia_status), titulo: 'Sorologia / Notificação', texto })
  }

  if (p.hemo_solicitado || p.hemo_transfundido) {
    const transfundido = !!p.hemo_transfundido
    let texto = p.hemo_tipo ? `${p.hemo_tipo}` : 'Hemoderivado'
    texto += p.hemo_quantidade ? ` (${p.hemo_quantidade})` : ''
    texto += transfundido
      ? ` — transfundido${p.hemo_data_transfusao ? ` em ${formatarData(p.hemo_data_transfusao)}` : ''}.`
      : ` — solicitado${p.hemo_data_solicitacao ? ` em ${formatarData(p.hemo_data_solicitacao)}` : ''}, aguardando.`
    itens.push({ icone: 'hemoterapia', tom: transfundido ? 'success' : 'warning', titulo: 'Hemoterapia', texto })
  }

  if (p.regulacao_flag) {
    let texto = p.regulacao_tipo || 'Regulação em andamento'
    if (p.regulacao_data_cadastro) texto += `. Cadastrado em ${formatarData(p.regulacao_data_cadastro)}`
    itens.push({ icone: 'regulacao', tom: 'info', titulo: 'Regulação', texto })
  }

  if (p.leito_liberado_outro_hospital) {
    let texto = p.leito_liberado_hospital || 'Transferência para outro hospital'
    if (p.leito_liberado_transporte) texto += ` · Transporte: ${p.leito_liberado_transporte}`
    itens.push({ icone: 'transferencia', tom: 'info', titulo: 'Leito liberado p/ outro hospital', texto })
  }

  if (p.alta_sala_vermelha) {
    let texto = 'Alta pela Sala Vermelha registrada'
    if (p.alta_sala_vermelha_data) texto += ` em ${formatarData(p.alta_sala_vermelha_data)}${p.alta_sala_vermelha_hora ? ` às ${p.alta_sala_vermelha_hora}` : ''}`
    itens.push({ icone: 'emergencia', tom: 'danger', titulo: 'Alta Sala Vermelha', texto })
  }

  if (p.nivel_consciencia && p.nivel_consciencia !== 'Consciente') {
    itens.push({ icone: 'consciencia', tom: 'warning', titulo: 'Nível de consciência', texto: p.nivel_consciencia })
  }

  if (p.curativo_realizado === false) {
    itens.push({ icone: 'curativo', tom: 'warning', titulo: 'Curativo', texto: 'Curativo ainda não realizado neste plantão' })
  }

  return itens
}

export default function IndicadoresClinicos({ passagem }) {
  const itens = montarIndicadores(passagem)
  const [aberto, setAberto] = useState(null)
  const raizRef = useRef(null)

  useEffect(() => {
    if (aberto === null) return
    function aoClicarFora(e) {
      if (raizRef.current && !raizRef.current.contains(e.target)) setAberto(null)
    }
    document.addEventListener('click', aoClicarFora)
    return () => document.removeEventListener('click', aoClicarFora)
  }, [aberto])

  if (itens.length === 0) return null

  return (
    <div className="indicadores-row" ref={raizRef}>
      {itens.map((item, i) => {
        const tom = TOM[item.tom]
        return (
          <div
            key={item.icone}
            className={`indicador ${aberto === i ? 'aberto' : ''} ${item.piscando ? 'piscando' : ''}`}
            style={{ '--tom-fg': tom.fg, '--tom-bg': tom.bg }}
          >
            <button
              type="button"
              className="indicador-btn"
              aria-label={item.titulo}
              onClick={(e) => { e.stopPropagation(); setAberto(aberto === i ? null : i) }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {ICONES[item.icone]}
              </svg>
            </button>
            <div className="indicador-popover" role="tooltip">
              <b>{item.titulo}</b>
              <span>{item.texto}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
