import { FREQUENCIAS_CUIDADOS } from '../constantes'

// Cuidados e orientações de enfermagem (texto + horário), quantos forem necessários.
export default function GrupoOrientacoes({ orientacoes, onCampo, onAdicionar, onRemover }) {
  return (
    <>
    {orientacoes.map((o, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'center' }}>
        <input type="text" className="form-control" placeholder="ex: Monitorização contínua" value={o.texto} onChange={(e) => onCampo(i, 'texto', e.target.value)} />
        <select className="form-control" value={o.frequencia || ''} onChange={(e) => onCampo(i, 'frequencia', e.target.value)} title="Horário de aferição/realização">
          <option value="">Horário</option>
          {FREQUENCIAS_CUIDADOS.map((f) => <option key={f} value={f}>{f}</option>)}
          {o.frequencia && !FREQUENCIAS_CUIDADOS.includes(o.frequencia) && <option value={o.frequencia}>{o.frequencia}</option>}
        </select>
        {orientacoes.length > 1 && (
          <button type="button" className="btn-cancel" style={{ padding: '6px 10px' }} onClick={() => onRemover(i)} aria-label="Remover orientação" title="Remover orientação"><i className="ph ph-trash" /></button>
        )}
      </div>
    ))}
    <div>
      <button type="button" className="btn-add-chip" onClick={onAdicionar}>
        <i className="ph ph-plus" /> Adicionar orientação
      </button>
    </div>
    </>
  )
}
