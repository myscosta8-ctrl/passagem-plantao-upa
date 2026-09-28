// Data/hora clínica do registro. Vazio = agora. Permite lançamento retroativo
// (nunca futuro); a impressão sempre sai com a data atual.
export default function CampoDataRegistro({ valor, onChange }) {
  const agora = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  return (
    <label className="campo-data-registro" title="Preencha só se o registro se refere a um momento anterior (lançamento retroativo).">
      <i className="ph ph-clock-counter-clockwise" /> Data do registro
      <input type="datetime-local" value={valor} max={agora} onChange={(e) => onChange(e.target.value)} />
      {valor && <button type="button" onClick={() => onChange('')} title="Usar data/hora atual">agora</button>}
    </label>
  )
}
