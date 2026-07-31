import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AltasRecentes({ onVoltar }) {
  const [altas, setAltas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const doisDiasAtras = new Date()
    doisDiasAtras.setDate(doisDiasAtras.getDate() - 2)

    const { data } = await supabase
      .from('pacientes')
      .select('*, leitos(numero, setores(nome))')
      .eq('status', 'alta')
      .gte('data_alta', doisDiasAtras.toISOString())
      .order('data_alta', { ascending: false })

    setAltas(data ?? [])
    setCarregando(false)
  }

  return (
    <div className="page">
      <h1 className="page-title">Altas recentes</h1>
      <p className="page-subtitle">Pacientes com alta dada nas últimas 48 horas.</p>

      <div className="card">
        {carregando && <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>}
        {!carregando && altas.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma alta registrada nas últimas 48 horas.</p>
        )}
        {altas.map((p) => (
          <div
            key={p.id}
            style={{
              padding: '14px 4px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.nome}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
              {p.diagnostico || 'Sem diagnóstico registrado'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {p.leitos ? `Leito ${p.leitos.numero} — ${p.leitos.setores?.nome}` : 'Leito não registrado'}
              {' · '}
              Alta em {new Date(p.data_alta).toLocaleString('pt-BR')}
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
