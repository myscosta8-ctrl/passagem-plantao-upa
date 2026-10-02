import { useState } from 'react'
import { filtrarCatalogo, descricaoMedicamento, detalheMedicamento } from '../../../lib/catalogoMedicamentos'

// Campo de medicamento com sugestões do catálogo (princípio ativo ou nome comercial).
export default function AutocompleteMedicamento({ catalogo, valor, onChange, onSelecionar, placeholder }) {
  const [aberto, setAberto] = useState(false)
  const sugestoes = filtrarCatalogo(catalogo, valor)

  return (
    <div className="autocomplete-wrap">
      <input
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setAberto(true) }}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        autoComplete="off"
      />
      {aberto && sugestoes.length > 0 && (
        <div className="autocomplete-lista">
          {sugestoes.map((m) => (
            <button
              key={m.id}
              type="button"
              className="autocomplete-item"
              onMouseDown={(e) => { e.preventDefault(); onSelecionar(m); setAberto(false) }}
            >
              <span className="autocomplete-item-nome">{descricaoMedicamento(m)}</span>
              <span className="autocomplete-item-sub">{detalheMedicamento(m)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
