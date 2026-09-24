export default function SimNao({ valor, onChange }) {
  return (
    <div className="toggle-group">
      <button
        type="button"
        className={`toggle-btn ${valor === false ? 'on' : ''}`}
        onClick={() => onChange(valor === false ? null : false)}
      >
        Não
      </button>
      <button
        type="button"
        className={`toggle-btn ${valor === true ? 'on' : ''}`}
        onClick={() => onChange(valor === true ? null : true)}
      >
        Sim
      </button>
    </div>
  )
}
