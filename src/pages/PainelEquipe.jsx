import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { avisarErro } from '../lib/erros'

export default function PainelEquipe({ onVoltar }) {
  const [ativos, setAtivos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const { data, error: erroConsulta1 } = await supabase
      .from('plantao_profissionais')
      .select('plantao_id, profissional_id, encerrado, plantoes(data, turno), profissionais(nome, categoria)')
      .eq('encerrado', false)
      .order('data', { foreignTable: 'plantoes', ascending: false })
    if (erroConsulta1) avisarErro('PainelEquipe', erroConsulta1)
    setAtivos(data ?? [])
    setCarregando(false)
  }

  return (
    <div className="workspace">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title">
          <h1>Equipe em Plantão</h1>
          <p>Profissionais ativos não encerrados no sistema.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left"></i> Voltar ao painel</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {carregando && <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>}
        {!carregando && ativos.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum profissional em plantão ativo.</p>}
        
        {!carregando && ativos.map((item, idx) => {
          const nomeStr = item.profissionais?.nome || 'Desconhecido'
          const iniciais = nomeStr.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
          const dataStr = item.plantoes?.data ? new Date(item.plantoes.data + 'T00:00:00').toLocaleDateString('pt-BR') : ''
          return (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 25, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                  {iniciais}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{nomeStr}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.profissionais?.categoria || 'Profissional'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  {item.plantoes?.turno} - {dataStr}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
