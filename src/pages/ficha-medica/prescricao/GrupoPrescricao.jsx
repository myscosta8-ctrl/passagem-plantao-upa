// Bloco recolhível da prescrição (Dieta, Medicamentos, Cuidados...). Clicar no título abre/fecha.
export default function GrupoPrescricao({ titulo, icone, fechado, onAlternar, estiloLista, id, children }) {
  return (
    <div id={id} className={`presc-group${fechado ? ' collapsed' : ''}`}>
      <div className="presc-group-header" onClick={onAlternar}>
        <h3><i className={`ph ${icone}`} /> {titulo}</h3>
        <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
      </div>
      <div className="presc-list" style={estiloLista}>
        {children}
      </div>
    </div>
  )
}
