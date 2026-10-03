// 3. Justificativa clínica / hipótese diagnóstica.
export default function JustificativaExame({ modalidade, cfg, justificativa, setJustificativa }) {
  return (
    <div className="form-section">
      <div className="form-section-title">
        <span className="st-left"><i className="ph ph-chat-text" /> {cfg.tituloJustificativa}</span>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>{cfg.labelJustificativa}</label>
        <textarea key={modalidade} className="form-control-area" rows="3" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
      </div>
    </div>
  )
}
