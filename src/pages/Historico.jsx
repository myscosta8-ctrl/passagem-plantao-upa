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
      .limit(180)
    setPlantoes(data ?? [])
    setCarregando(false)
  }

  if (selecionado) {
    return (
      <PrintView
        plantao={selecionado.plantao}
        grupo={selecionado.grupo}
        onVoltar={() => setSelecionado(null)}
        viaHistorico
      />
    )
  }

  return (
    <div className="workspace">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title">
          <h1>Histórico de Plantões</h1>
          <p>Consulte registros, evoluções globais e passagens de plantão anteriores.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left"></i> Voltar ao painel</button>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Data/Turno</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Carregando histórico...</td>
              </tr>
            )}
            {!carregando && plantoes.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Nenhum plantão registrado.</td>
              </tr>
            )}
            {!carregando && plantoes.map(p => {
              const dateStr = new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')
              return (
                <tr key={p.id}>
                  <td>
                    <strong>{dateStr}</strong><br/>
                    <span style={{color:'var(--text-muted)', fontSize: 12}}>{p.turno}</span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Concluído</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: 12 }} 
                        onClick={() => setSelecionado({ plantao: p, grupo: 'grupo1' })}
                      >
                        Ver Relatório (Verm. + Internação)
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: 12 }} 
                        onClick={() => setSelecionado({ plantao: p, grupo: 'grupo2' })}
                      >
                        Ver Relatório (Ped. + Observação)
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
