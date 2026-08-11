import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ConfirmModal from './ConfirmModal'

export default function PainelEquipe({ onVoltar }) {
  const [ativos, setAtivos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [alvo, setAlvo] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('plantao_profissionais')
      .select('plantao_id, profissional_id, encerrado, plantoes(data, turno), profissionais(nome, categoria)')
      .eq('encerrado', false)
      .order('data', { foreignTable: 'plantoes', ascending: false })
    setAtivos(data ?? [])
    setCarregando(false)
  }

  async function confirmarEncerramento() {
    if (!alvo) return
    await supabase
      .from('plantao_profissionais')
      .update({ encerrado: true, encerrado_em: new Date().toISOString(), encerrado_por_sistema: false })
      .eq('plantao_id', alvo.plantao_id)
      .eq('profissional_id', alvo.profissional_id)
    setAlvo(null)
    carregar()
  }

  return (
    <div className="page">
      <button className="voltar-topo" onClick={onVoltar}>← Voltar ao painel</button>
      <h1 className="page-title">Equipe — plantões ativos</h1>
      <p className="page-subtitle">
        Todo mundo que ainda está com participação em aberto agora, em qualquer data/turno. Só administradores veem e usam esta tela.
      </p>

      <div className="card">
        {carregando && <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>}
        {!carregando && ativos.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Ninguém com plantão ativo no momento.</p>
        )}
        {ativos.map((item) => (
          <div
            key={item.plantao_id + item.profissional_id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 4px', borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                {item.profissionais?.nome} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 12.5 }}>({item.profissionais?.categoria})</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 3 }}>
                {item.plantoes?.turno} — {new Date(item.plantoes?.data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </div>
            </div>
            <button
              style={{
                padding: '8px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 8,
                border: '1px solid #8a1f1f', color: '#8a1f1f', background: '#fdf0f0',
              }}
              onClick={() => setAlvo(item)}
            >
              Encerrar agora
            </button>
          </div>
        ))}
      </div>

      {alvo && (
        <ConfirmModal
          titulo={`Encerrar ${alvo.profissionais?.nome}?`}
          mensagem={`Isso encerra a participação dessa pessoa no plantão de ${alvo.plantoes?.turno} de ${new Date(alvo.plantoes?.data + 'T00:00:00').toLocaleDateString('pt-BR')} imediatamente, liberando a vaga dela pra outra pessoa entrar.`}
          confirmarTexto="Encerrar"
          perigo
          onConfirmar={confirmarEncerramento}
          onCancelar={() => setAlvo(null)}
        />
      )}
    </div>
  )
}
