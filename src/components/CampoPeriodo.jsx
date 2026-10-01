// Campo de período padrão (Indicadores, Desfechos…): uma caixa só, "De … até …".
export default function CampoPeriodo({ inicio, fim, onInicio, onFim }) {
  return (
    <div className="campo-periodo">
      <i className="ph ph-calendar-blank" />
      <label>De<input type="date" value={inicio} max={fim || undefined} onChange={(e) => onInicio(e.target.value)} /></label>
      <span className="cp-sep" />
      <label>até<input type="date" value={fim} min={inicio || undefined} onChange={(e) => onFim(e.target.value)} /></label>
    </div>
  )
}

// Últimos 7 dias, no formato AAAA-MM-DD — valor inicial ao escolher "Período".
export function periodoPadrao() {
  const hoje = new Date(); const ini = new Date(); ini.setDate(hoje.getDate() - 6)
  const f = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  return { inicio: f(ini), fim: f(hoje) }
}
