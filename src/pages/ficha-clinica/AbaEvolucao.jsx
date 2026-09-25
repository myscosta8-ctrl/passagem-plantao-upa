import { useEffect, useState } from 'react';
import { listarEvolucoes, registrarEvolucao } from '../../lib/pepClinico';
import { NANDA_OPCOES, NIC_OPCOES } from './constantes';

export default function AbaEvolucao({ atendimento, autorId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [texto, setTexto] = useState('')
  const [diagnosticosNanda, setDiagnosticosNanda] = useState([])
  const [prescricaoNic, setPrescricaoNic] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [itemExpandido, setItemExpandido] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarEvolucoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  function toggleNanda(item) {
    setDiagnosticosNanda((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  function toggleNic(item) {
    setPrescricaoNic((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  async function registrar() {
    if (!texto.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEvolucao({
      atendimentoId: atendimento.atendimento_id, autorId, texto: texto.trim(),
      diagnosticosNanda, prescricaoNic,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setTexto('')
    setDiagnosticosNanda([])
    setPrescricaoNic([])
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
              {ev.diagnosticos_nanda?.length > 0 && (
                <div className="tl-preview" style={{ marginBottom: 4 }}>
                  <strong>NANDA-I:</strong> {ev.diagnosticos_nanda.join(', ')}
                </div>
              )}
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
            <p>Sistematização da Assistência com Diagnósticos NANDA e Prescrição de Cuidados NIC.</p>
          </div>
        </div>

        <div className="cc-body">
          <div className="form-section-box">
            <div className="form-section-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="ph ph-stethoscope" /> Diagnósticos de Enfermagem (NANDA-I)</span>
              <span style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>Selecione os títulos prioritários</span>
            </div>
            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {NANDA_OPCOES.map((n) => (
                <label key={n} className="checkbox-item">
                  <input type="checkbox" checked={diagnosticosNanda.includes(n)} onChange={() => toggleNanda(n)} /> {n}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section-box">
            <div className="form-section-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="ph ph-list-checks" /> Prescrição de Enfermagem e Cuidados (NIC)</span>
              <span style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>Aprazamento pelo Enfermeiro</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NIC_OPCOES.map((n) => (
                <label key={n.texto} className="checkbox-item" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={prescricaoNic.includes(n.texto)} onChange={() => toggleNic(n.texto)} /> {n.texto}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#0F766E', background: '#CCFBF1', padding: '2px 8px', borderRadius: 4 }}>{n.frequencia}</span>
                </label>
              ))}
            </div>
          </div>

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
