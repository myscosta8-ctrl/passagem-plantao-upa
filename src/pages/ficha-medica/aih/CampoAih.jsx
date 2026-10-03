// Caixa de campo no padrão do formulário oficial (número + rótulo + valor).
export default function Campo({ n, rotulo, col = 4, valor, onChange, readOnly, placeholder, destaque, children }) {
  return (
    <div className={`col-${col}`}>
      <div className={'aih-field-box' + (readOnly ? ' readonly' : '') + (destaque ? ' highlight' : '')}>
        <div className="aih-field-header"><label>{n} - {rotulo}</label></div>
        {children || (readOnly
          ? <div className="aih-field-value">{valor || '—'}</div>
          : <input type="text" className="aih-input" value={valor || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />)}
      </div>
    </div>
  )
}
