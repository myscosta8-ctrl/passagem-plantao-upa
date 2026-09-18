import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import './AberturaPlantao.css'

function hojeISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export default function AberturaPlantao({ onPlantaoAberto }) {
  const { enfermeiro } = useAuth()
  const [data, setData] = useState(hojeISO())
  const [turno, setTurno] = useState('') // sem padrão — precisa ser escolhido
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function abrirPlantao() {
    setErro('')
    if (!turno) {
      setErro('Escolha o turno (Diurno ou Noturno) antes de continuar.')
      return
    }
    setCarregando(true)

    let plantaoId
    const { data: existente } = await supabase
      .from('plantoes')
      .select('id')
      .eq('data', data)
      .eq('turno', turno)
      .maybeSingle()

    if (existente) {
      plantaoId = existente.id
    } else {
      const { data: criado, error: criarErro } = await supabase
        .from('plantoes')
        .insert({ data, turno })
        .select()
        .single()
      if (criarErro) {
        setErro('Não foi possível abrir o plantão.')
        setCarregando(false)
        return
      }
      plantaoId = criado.id
    }

    // Login institucional já identifica quem é — não precisa mais selecionar
    // a equipe presente, só registrar a própria participação neste plantão.
    if (enfermeiro?.id) {
      await supabase
        .from('plantao_profissionais')
        .upsert(
          { plantao_id: plantaoId, profissional_id: enfermeiro.id, encerrado: false },
          { onConflict: 'plantao_id,profissional_id' }
        )
    }

    setCarregando(false)
    onPlantaoAberto({ id: plantaoId, data, turno })
  }

  return (
    <div className="page">
      <h1 className="page-title">Abrir plantão</h1>
      <p className="page-subtitle">Confirme a data e o turno.</p>

      <div className="card">
        {erro && <div className="error-box">{erro}</div>}

        <div className="field-row">
          <div className="field">
            <label htmlFor="data">Data</label>
            <input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="field">
            <label>Turno *</label>
            <div className="turno-toggle">
              {['Diurno', 'Noturno'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`turno-btn ${turno === t ? 'active' : ''}`}
                  onClick={() => setTurno(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {!turno && <p style={{ fontSize: 12, color: 'var(--color-accent)', marginTop: 6 }}>Obrigatório escolher.</p>}
          </div>
        </div>

        <button className="submit-btn" onClick={abrirPlantao} disabled={carregando || !turno}>
          {carregando ? 'Abrindo...' : 'Abrir plantão'}
        </button>
      </div>
    </div>
  )
}
