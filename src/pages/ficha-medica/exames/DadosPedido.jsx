import { MOBILIDADE_OPCOES } from './catalogoExames'

// 1. Dados do pedido: caráter, local (coleta / mobilidade / local do ECG), data e médico solicitante.
export default function DadosPedido({ modalidade, cfg, prioridade, setPrioridade, localLeito, mobilidade, setMobilidade, localEcg, setLocalEcg, dataHoraSolicitacao, medicoSolicitante }) {
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

        {modalidade === 'img' && (
          <div className="form-group">
            <label>Condição de Mobilidade</label>
            <select className="form-control" value={mobilidade} onChange={(e) => setMobilidade(e.target.value)}>
              {MOBILIDADE_OPCOES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}

        {modalidade === 'ecg' && (
          <div className="form-group">
            <label>Local de Realização</label>
            <select className="form-control" value={localEcg} onChange={(e) => setLocalEcg(e.target.value)}>
              <option value="leito">{localLeito}</option>
              <option value="sala_ecg">Sala de Eletrocardiografia / Emergência</option>
              <option value="vermelha">Sala Vermelha (Emergência Crítica)</option>
            </select>
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
