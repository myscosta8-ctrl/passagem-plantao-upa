import { textoDiluicao } from './itemPrescricao'

// Medicamentos já adicionados à prescrição (todos menos o último, que é o item em edição).
export default function ListaItens({ itens, onEditar, onRemover }) {
  return (
    <>
      {itens.length === 1 && (
        <div style={{ padding: '10px 16px', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Nenhum medicamento adicionado ainda.</div>
      )}
      {itens.slice(0, -1).map((it, i) => (
        <div key={i} className="presc-item" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="item-num">{String(i + 1).padStart(2, '0')}</div>
          <div className="item-details">
            <div className="item-name">{it.medicamento_nome} {it.dose && `- ${it.dose} ${it.dose_unidade}`}{it.condicao && <span className="badge-2vias" style={{ background: 'var(--c-primary-soft, #CCFBF1)', color: 'var(--c-primary-hover, #0F766E)' }}>{it.condicao}</span>}</div>
            <div className="item-sub">
              <span><i className="ph ph-syringe"></i> {it.via || 'Via não def.'}</span>
              <span><i className="ph ph-clock"></i> {it.frequencia || 'Frequência não def.'}</span>
              {it.duracao && <span><i className="ph ph-calendar"></i> {it.duracao}</span>}
              {textoDiluicao(it) && <span><strong>Diluição:</strong> {textoDiluicao(it)}</span>}
              {it.instrucoes && <span><strong>Obs.:</strong> {it.instrucoes}</span>}
            </div>
          </div>
          <div className="item-actions">
            <button type="button" onClick={() => onEditar(i)} title="Editar"><i className="ph ph-pencil-simple" /></button>
            <button type="button" onClick={() => onRemover(i)} title="Remover"><i className="ph ph-trash" /></button>
          </div>
        </div>
      ))}
    </>
  )
}
