import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PrintView from './PrintView'

export default function Historico({ onVoltar }) {
  const [plantoes, setPlantoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [selecionado, setSelecionado] = useState(null) // { plantao, grupo }

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await supabase
      .from('plantoes')
      .select('*')
      .order('data', { ascending: false })
      .order('turno')
    setPlantoes(data ?? [])
    setCarregando(false)
  }

  if (selecionado) {
    return (
      <PrintView
        plantao={selecionado.plantao}
        grupo={selecionado.grupo}
        onVoltar={() => setSelecionado(null)}
      />
    )
  }

  return (
    <div className="page">
      <button className="voltar-topo" onClick={onVoltar}>← Voltar ao painel</button>
      <h1 className="page-title">Histórico (últimos 7 dias)</h1>
      <p className="page-subtitle">Registros mais antigos são apagados automaticamente.</p>

      <div className="card">
        {carregando && <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>}
        {!carregando && plantoes.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum plantão registrado nos últimos 7 dias.</p>
        )}
        {plantoes.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 4px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')} — {p.turno}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="add-profissional-btn"
                style={{ padding: '7px 12px', border: '1px solid var(--color-border)', borderRadius: 7, fontSize: 12.5, background: 'var(--color-surface)' }}
                onClick={() => setSelecionado({ plantao: p, grupo: 'grupo1' })}
              >
                Ver Vermelha + Internação
              </button>
              <button
                style={{ padding: '7px 12px', border: '1px solid var(--color-border)', borderRadius: 7, fontSize: 12.5, background: 'var(--color-surface)' }}
                onClick={() => setSelecionado({ plantao: p, grupo: 'grupo2' })}
              >
                Ver Pediátrico + Observação
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="submit-btn"
        style={{ marginTop: 20, maxWidth: 200, background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
        onClick={onVoltar}
      >
        ← Voltar ao painel
      </button>
    </div>
  )
}
