import { CATALOGO_POR_MODALIDADE, DETALHE_POR_MODALIDADE } from './catalogoExames'

// Grade de exames da modalidade (laboratório, imagem ou ECG): um bloco por grupo, caixas de marcar.
export default function GradeExames({ modalidade, selecionados, onAlternar }) {
  const campo = DETALHE_POR_MODALIDADE[modalidade]
  return CATALOGO_POR_MODALIDADE[modalidade].map((grupo, idx) => (
    <div className="exam-group-box" key={idx}>
      <div className="exam-group-header">{grupo.grupo}</div>
      <div className="exam-checkbox-grid">
        {grupo.itens.map((it) => {
          const checked = !!selecionados[it.nome]
          return (
            <label key={it.nome} className={'exam-check-item ' + (checked ? 'checked' : '')}>
              <input type="checkbox" checked={checked} onChange={() => onAlternar(it.nome)} />
              <span><strong>{it.label}</strong> ({it[campo]})</span>
            </label>
          )
        })}
      </div>
    </div>
  ))
}
