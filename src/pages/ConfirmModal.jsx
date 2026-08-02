export default function ConfirmModal({
  titulo,
  mensagem,
  confirmarTexto = 'Confirmar',
  cancelarTexto = 'Cancelar',
  perigo = false,
  somenteAviso = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{titulo}</h2>
        {mensagem && (
          <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: -6, marginBottom: 18 }}>
            {mensagem}
          </p>
        )}
        <div className="modal-actions">
          {!somenteAviso && (
            <button className="modal-btn-secondary" onClick={onCancelar}>{cancelarTexto}</button>
          )}
          <button
            className="modal-btn-primary"
            onClick={onConfirmar}
            style={perigo ? { background: '#8A1F1F', borderColor: '#8A1F1F' } : undefined}
          >
            {confirmarTexto}
          </button>
        </div>
      </div>
    </div>
  )
}
