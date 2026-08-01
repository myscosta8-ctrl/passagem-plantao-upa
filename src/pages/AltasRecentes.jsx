import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CORES_TIPO = {
  Alta: { bg: 'var(--color-primary-light)', cor: 'var(--color-primary-dark)' },
  Transferência: { bg: '#E6EEF0', cor: 'var(--color-primary-dark)' },
  Evasão: { bg: '#FFF3D6', cor: '#8A5A00' },
  Óbito: { bg: 'var(--color-accent-light)', cor: 'var(--color-accent)' },
}

export default function AltasRecentes({ onVoltar }) {
  const [desfechos, setDesfechos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const { data } = await supabase
      .from('pacientes')
      .select('*, leitos(numero, setores(nome))')
      .eq('status', 'alta')
      .gte('data_desfecho', seteDiasAtras.toISOString())
      .order('data_desfecho', { ascending: false })

    setDesfechos(data ?? [])
    setCarregando(false)
  }

  const filtrados = desfechos.filter((p) =>
    p.nome.toLowerCase().includes(busca.trim().toLowerCase())
  )

  return (
    <div className="page">
      <h1 className="page-title">Desfechos recentes</h1>
      <p className="page-subtitle">Altas, transferências, evasões e óbitos dos últimos 7 dias.</p>

      <div className="field" style={{ marginBottom: 16, maxWidth: 360 }}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
        />
      </div>

      <div className="card">
        {carregando && <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>}
        {!carregando && filtrados.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum registro encontrado.</p>
        )}
        {filtrados.map((p) => {
          const cor = CORES_TIPO[p.tipo_desfecho] ?? CORES_TIPO.Alta
          return (
            <div
              key={p.id}
              style={{ padding: '14px 4px', borderBottom: '1px solid var(--color-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>{p.nome}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  background: cor.bg, color: cor.cor, borderRadius: 10, padding: '2px 9px',
                }}>
                  {p.tipo_desfecho || 'Alta'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                {p.diagnostico || 'Sem diagnóstico registrado'}
              </div>
              {p.desfecho_detalhe && (
                <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 3 }}>
                  {p.desfecho_detalhe}
                </div>
              )}
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {p.leitos ? `Leito ${p.leitos.numero} — ${p.leitos.setores?.nome}` : 'Leito não registrado'}
                {' · '}
                {new Date(p.data_desfecho).toLocaleString('pt-BR')}
              </div>
            </div>
          )
        })}
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
