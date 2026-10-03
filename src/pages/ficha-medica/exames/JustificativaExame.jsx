// 3. Justificativa clínica (e, na imagem, radioproteção; no ECG, orientações ao técnico).
export default function JustificativaExame({ modalidade, cfg, justificativa, setJustificativa, radioprotecao, setRadioprotecao, orientacoesEcg, setOrientacoesEcg }) {
  return (
    <div className="form-section">
      <div className="form-section-title">
        <span className="st-left"><i className="ph ph-chat-text" /> {cfg.tituloJustificativa}</span>
      </div>
      <div className="form-group" style={{ marginBottom: modalidade === 'lab' ? 0 : 8 }}>
        <label>{cfg.labelJustificativa}</label>
        <textarea key={modalidade} className="form-control-area" rows="3" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
      </div>
      {modalidade === 'img' && (
        <div className="form-group">
          <label>Recomendações Especiais de Radioproteção</label>
          <input type="text" className="form-control" placeholder="Ex: colimação estrita e proteção gonadal/plumbífera quando indicado..." value={radioprotecao} onChange={(e) => setRadioprotecao(e.target.value)} />
        </div>
      )}
      {modalidade === 'ecg' && (
        <div className="form-group">
          <label>Orientações ao Técnico / Enfermagem</label>
          <input type="text" className="form-control" placeholder="Ex: realizar o traçado em repouso absoluto, anexar fita ao prontuário..." value={orientacoesEcg} onChange={(e) => setOrientacoesEcg(e.target.value)} />
        </div>
      )}
    </div>
  )
}
