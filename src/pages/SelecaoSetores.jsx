import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './AberturaPlantao.css'

export default function SelecaoSetores({ onConfirmar }) {
  const [setores, setSetores] = useState([])
  const [selecionados, setSelecionados] = useState(new Set())
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.from('setores').select('*').order('ordem').then(({ data }) => {
      setSetores(data ?? [])
      setSelecionados(new Set((data ?? []).map((s) => s.id))) // todos marcados por padrão
      setCarregando(false)
    })
  }, [])

  function toggle(id) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (carregando) return null

  return (
    <div className="page">
      <h1 className="page-title">Quais setores você vai acompanhar?</h1>
      <p className="page-subtitle">
        Todos vêm marcados — desmarque o que não é sua responsabilidade neste plantão. Se for o único enfermeiro, deixe todos marcados.
      </p>

      <div className="card">
        <div className="profissionais-lista" style={{ maxHeight: 'none' }}>
          {setores.map((s) => (
            <label className="profissional-item" key={s.id}>
              <input
                type="checkbox"
                checked={selecionados.has(s.id)}
                onChange={() => toggle(s.id)}
              />
              <span className="profissional-nome">{s.nome}</span>
            </label>
          ))}
        </div>

        <button
          className="submit-btn"
          disabled={selecionados.size === 0}
          onClick={() => onConfirmar(Array.from(selecionados))}
        >
          Ver leitos desses setores
        </button>
      </div>
    </div>
  )
}
