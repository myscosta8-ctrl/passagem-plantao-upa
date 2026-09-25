import { useEffect, useState } from 'react';
import { listarEvolucoes, registrarEvolucao } from '../../lib/pepClinico';

export default function AbaEvolucao({ atendimento, autorId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [itemExpandido, setItemExpandido] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarEvolucoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!texto.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEvolucao({ atendimentoId: atendimento.atendimento_id, autorId, texto: texto.trim() })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setTexto('')
    carregar()
  }

  return (
    <div className="clinical-split">
      <aside className="timeline-pane">
        <div className="pane-header">
          <span><i className="ph ph-clock-counter-clockwise" /> Anotações de Turnos</span>
        </div>
        <div className="timeline-list">
          {carregando ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Carregando...</p>
          ) : historico.length === 0 ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Nenhuma evolução registrada ainda.</p>
          ) : historico.map((ev) => (
            <div
              key={ev.id}
              className={`tl-item ${itemExpandido === ev.id ? 'expanded' : ''}`}
              onClick={() => setItemExpandido((atual) => (atual === ev.id ? null : ev.id))}
            >
              <div className="tl-date">
                {new Date(ev.criado_em).toLocaleString('pt-BR')}
                <i className={`ph ph-caret-${itemExpandido === ev.id ? 'up' : 'down'}`} />
              </div>
              <div className="tl-author">
                <i className="ph ph-user" /> {ev.enfermeiros?.nome_exibicao || ev.enfermeiros?.nome || 'Enfermagem'}
              </div>
              <div className="tl-preview">{ev.texto}</div>
              {onImprimir && (
                <button type="button" className="tl-print" onClick={(e) => { e.stopPropagation(); onImprimir(ev) }}>
                  <i className="ph ph-printer" /> Imprimir (SAE)
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-activity" /> Nova Evolução do Enfermeiro (SAE)</h2>
            <p>Registro descritivo da evolução de enfermagem no plantão.</p>
          </div>
        </div>

        <div className="cc-body">
          <div className="form-group">
            <label><i className="ph ph-text-align-left" /> Evolução Clínica do Enfermeiro (SOAP / Descritiva)</label>
            <textarea className="large" style={{ minHeight: 140 }} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Descreva a evolução do paciente..." />
          </div>

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <span />
          <button className="btn-save-print" onClick={registrar} disabled={salvando || !texto.trim()}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Registrando...' : 'Registrar evolução'}
          </button>
        </div>
      </div>
    </div>
  )
}
