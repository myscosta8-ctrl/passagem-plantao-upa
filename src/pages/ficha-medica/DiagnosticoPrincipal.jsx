import { useEffect, useState } from 'react';
import { buscarInternacao, atualizarDiagnosticoCid, listarCatalogoCid } from '../../lib/pepMedico';

export default function DiagnosticoPrincipal({ atendimento, medicoId }) {
  const [internacao, setInternacao] = useState(null)
  const [cids, setCids] = useState([])
  const [cid, setCid] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarInternacao(atendimento.atendimento_id).then((i) => { setInternacao(i); setCid(i?.diagnostico_cid || '') })
    listarCatalogoCid().then(setCids)
  }, [atendimento.atendimento_id])

  async function salvar() {
    setSalvando(true)
    await atualizarDiagnosticoCid(atendimento.atendimento_id, cid, medicoId)
    setSalvando(false)
    buscarInternacao(atendimento.atendimento_id).then(setInternacao)
  }

  if (!internacao) return null

  return (
    <div className="resumo-paciente" style={{ marginBottom: 4 }}>
      <div className="resumo-bloco" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="resumo-bloco-titulo">Diagnóstico principal (CID-10)</div>
          <select value={cid} onChange={(e) => setCid(e.target.value)} style={{ width: '100%' }}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <button className="modal-btn-secondary" onClick={salvar} disabled={salvando || cid === (internacao.diagnostico_cid || '')}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
