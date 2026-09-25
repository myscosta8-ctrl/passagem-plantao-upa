import { normalizarNome } from './constantes'

export function formatarNomeSetor(nome) {
  if (!nome) return ''
  const n = nome.toLowerCase()
  if (n.includes('vermelha')) return 'Sala Vermelha - Emergência'
  if (n === 'internação' || n === 'internacao') return 'Internação Adulto'
  if (n.includes('pediátr') || n.includes('pediatr')) return 'Observação Pediátrica'
  if (n.includes('observa')) return 'Sala Amarela - Observação Adulto'
  return nome
}

export function formatarNumeroLeito(numero) {
  if (!numero) return ''
  const s = String(numero).trim()
  if (s.toLowerCase().includes('extra')) return s
  if (s === '17-ISO') return '17 (Isolamento)'
  if (s === '06-ISO') return '06 (Isolamento)'
  if (s === '09-ISO') return '09 (Isolamento)'
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && n < 10) return `0${n}`
  return s
}

export function formatarNomePaciente(nome) {
  if (!nome) return ''
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => {
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(p)) return p
      return p.charAt(0).toUpperCase() + p.slice(1)
    })
    .join(' ')
}

export function obterClasseRisco(classificacao, setorNome) {
  if (classificacao) {
    const c = classificacao.toLowerCase()
    if (c.includes('verm') || c.includes('emerg')) return 'risk-vermelho'
    if (c.includes('laran') || c.includes('muito')) return 'risk-laranja'
    if (c.includes('amar') || c.includes('urg')) return 'risk-amarelo'
    if (c.includes('verd') || c.includes('pouco')) return 'risk-verde'
    if (c.includes('azul') || c.includes('não') || c.includes('nao')) return 'risk-azul'
  }
  const s = (setorNome || '').toLowerCase()
  if (s.includes('verm') || s.includes('emerg')) return 'risk-vermelho'
  if (s.includes('interna')) return 'risk-laranja'
  return 'risk-amarelo'
}

function formatarAdmissao(dataStr) {
  if (!dataStr) return 'Não informada'
  try {
    const d = new Date(dataStr.includes('T') ? dataStr : `${dataStr}T12:00:00`)
    const hoje = new Date()
    const ehHoje = d.toDateString() === hoje.toDateString()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const ehOntem = d.toDateString() === ontem.toDateString()

    const hora = dataStr.includes('T')
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : ''

    if (ehHoje) return `Hoje${hora ? `, ${hora}` : ''}`
    if (ehOntem) return `Ontem${hora ? `, ${hora}` : ''}`
    return `${d.toLocaleDateString('pt-BR')}${hora ? `, ${hora}` : ''}`
  } catch {
    return dataStr
  }
}

export function ordenarLeitos(a, b) {
  if (a.tipo !== b.tipo) {
    if (a.tipo === 'extra') return 1
    if (b.tipo === 'extra') return -1
  }
  const extraNumA = a.numero.match(/Extra\s*(\d+)/i)
  const extraNumB = b.numero.match(/Extra\s*(\d+)/i)
  if (extraNumA && extraNumB) {
    return parseInt(extraNumA[1], 10) - parseInt(extraNumB[1], 10)
  }
  const numA = parseInt(a.numero.replace(/\D/g, ''), 10) || 0
  const numB = parseInt(b.numero.replace(/\D/g, ''), 10) || 0
  if (numA !== numB) return numA - numB
  return a.numero.localeCompare(b.numero)
}

export default function PainelCards({
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  busca,
  setorFiltro,
  statusFiltro,
  menuAcoesLeitoId,
  setMenuAcoesLeitoId,
  onAbrirPassagem,
  onAbrirModalInternar,
  onAbrirRealocar,
  onAbrirLeitoExtra,
}) {
  const buscaNorm = normalizarNome(busca || '')

  return (
    <>
      {setoresVisiveis
        .filter((setor) => !setorFiltro || setor.id === setorFiltro)
        .map((setor) => {
          const leitosDoSetor = leitos
            .filter((l) => l.setor_id === setor.id)
            .filter((l) => {
              const paciente = pacientesPorLeito[l.id]
              if (statusFiltro === 'ocupado' && !paciente) return false
              if (statusFiltro === 'vazio' && paciente) return false
              if (statusFiltro === 'internado' && paciente?.status_internacao !== 'Internado') return false
              if (statusFiltro === 'observacao' && paciente?.status_internacao !== 'Em observação') return false
              if (buscaNorm && !(paciente && normalizarNome(paciente.nome).includes(buscaNorm))) return false
              return true
            })
            .sort(ordenarLeitos)

          if (leitosDoSetor.length === 0) return null
          const ocupados = leitosDoSetor.filter((l) => pacientesPorLeito[l.id]).length

          return (
            <section key={setor.id} className="setor-section">
              <div className="setor-header">
                <div className="setor-header-left">
                  <h3>{formatarNomeSetor(setor.nome)}</h3>
                  <span className="setor-badge">
                    {ocupados}/{leitosDoSetor.length} Ocupados
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-setor-extra"
                  onClick={() => onAbrirLeitoExtra(setor.id)}
                  title={`Abrir leito extra em ${formatarNomeSetor(setor.nome)}`}
                >
                  <i className="ph ph-plus" /> Leito Extra
                </button>
              </div>

              <div className="leitos-grid">
                {leitosDoSetor.map((leito) => {
                  const paciente = pacientesPorLeito[leito.id]
                  const p = paciente ? passagemPorPaciente[paciente.id] : null
                  const classeRisco = paciente ? obterClasseRisco(paciente.classificacao_manchester, setor.nome) : ''

                  return paciente ? (
                    <div
                      key={leito.id}
                      className="leito-card"
                      onClick={() => onAbrirPassagem(paciente, leito)}
                    >
                      {/* Faixa de Risco Manchester no topo */}
                      <div className={`risk-bar ${classeRisco}`} />

                      <div className="leito-header">
                        <div className={`leito-numero ${leito.tipo === 'extra' ? 'extra' : ''}`}>
                          <i className="ph ph-bed" /> Leito {formatarNumeroLeito(leito.numero)}
                        </div>

                        <div className={`leito-status ${paciente.status_internacao === 'Internado' ? 'status-internado' : 'status-observacao'}`}>
                          {paciente.status_internacao || 'Internado'}
                        </div>
                      </div>

                      <div className="leito-body">
                        <div className="paciente-nome">
                          {formatarNomePaciente(paciente.nome)}
                          {paciente.alergias && <span className="status-badge alerta">Alergia</span>}
                        </div>

                        <div className="paciente-meta">
                          <i className="ph ph-identification-card" />{' '}
                          {paciente.idade ? `${paciente.idade} anos` : 'Adulto'}
                          {' · '}
                          {paciente.sexo === 'F' ? 'Feminino' : 'Masculino'}
                        </div>

                        <div className="paciente-hd">
                          <strong>HD:</strong> {paciente.diagnostico || 'Sem diagnóstico registrado'}
                        </div>
                      </div>

                      <div className="leito-footer">
                        <div className="footer-info">
                          <i className="ph ph-clock" /> Admissão: {formatarAdmissao(paciente.data_admissao)}
                        </div>
                        <div className="leito-menu-acoes no-print" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="action-btn"
                            title="Mais opções"
                            onClick={() => setMenuAcoesLeitoId(menuAcoesLeitoId === leito.id ? null : leito.id)}
                          >
                            <i className="ph ph-dots-three-vertical" />
                          </button>
                          {menuAcoesLeitoId === leito.id && (
                            <div className="leito-menu-dropdown">
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAcoesLeitoId(null)
                                  onAbrirRealocar({ paciente, leitoOrigem: leito })
                                }}
                              >
                                <i className="ph ph-arrows-clockwise" /> Realocar paciente
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={leito.id}
                      className="leito-card leito-vazio"
                      onClick={() => onAbrirModalInternar(leito)}
                    >
                      <i className="ph ph-plus-circle vazio-icon" />
                      <div className="vazio-title">Leito {formatarNumeroLeito(leito.numero)} (Vazio)</div>
                      <div className="vazio-subtitle">Clique para internar paciente</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
    </>
  )
}
