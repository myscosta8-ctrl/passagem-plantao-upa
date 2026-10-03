// 1. Dados do pedido: caráter, local da coleta (laboratório), data e médico solicitante.
export default function DadosPedido({ modalidade, cfg, prioridade, setPrioridade, localLeito, dataHoraSolicitacao, medicoSolicitante }) {
  return (
    <div className="form-section">
      <div className="form-section-title">
        <span className="st-left"><i className="ph ph-identification-card" /> {cfg.tituloDados}</span>
      </div>
      <div className="grid-4">
        <div className="form-group">
          <label>Caráter {modalidade === 'lab' ? 'da Coleta' : 'do Exame'}</label>
          <select className="form-control" value={prioridade[modalidade]} onChange={(e) => setPrioridade(prev => ({ ...prev, [modalidade]: e.target.value }))}>
            {cfg.prioridadeOpcoes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {modalidade === 'lab' && (
          <div className="form-group">
            <label>Local da Coleta</label>
            <input type="text" className="form-control" value={localLeito} readOnly />
          </div>
        )}

        <div className="form-group">
          <label>Data/Hora Solicitação</label>
          <input type="text" className="form-control" value={dataHoraSolicitacao} readOnly />
        </div>
        <div className="form-group">
          <label>Médico Solicitante</label>
          <input type="text" className="form-control" value={medicoSolicitante} readOnly />
        </div>
      </div>
    </div>
  )
}
