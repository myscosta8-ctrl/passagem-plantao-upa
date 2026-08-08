import { PASSOS_GUIA } from './guiaConteudo'

export default function Ajuda({ onVoltar }) {
  return (
    <div className="page">
      <button className="voltar-topo" onClick={onVoltar}>← Voltar ao painel</button>
      <h1 className="page-title">Como usar o app</h1>
      <p className="page-subtitle">Guia rápido do fluxo de trabalho, passo a passo.</p>

      <div className="card">
        {PASSOS_GUIA.map((passo) => (
          <div key={passo.titulo} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--color-primary-dark)', marginBottom: 4 }}>
              {passo.titulo}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--color-text)', lineHeight: 1.55 }}>
              {passo.texto}
            </div>
          </div>
        ))}
      </div>

      <button
        className="submit-btn"
        style={{ marginTop: 20, maxWidth: 200, background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
        onClick={onVoltar}
      >
        ← Voltar ao painel
      </button>
    </div>
  )
}
