import { useEffect, useState } from 'react'
import { calcularIndicadoresClinicos } from '../lib/pepIndicadores'

const PERIODOS = [
  { chave: 'hoje', rotulo: 'Hoje' },
  { chave: '7dias', rotulo: 'Últimos 7 dias' },
  { chave: '30dias', rotulo: 'Últimos 30 dias' },
]

const MANCHESTER_CORES = {
  Vermelho: 'var(--danger)', Laranja: 'var(--warning)', Amarelo: '#C9A227', Verde: 'var(--success)', Azul: 'var(--info)',
  'Não classificado': 'var(--text-muted)',
}

function formatarHoras(horas) {
  if (horas === null || horas === undefined || isNaN(horas)) return '-'
  const dias = Math.floor(horas / 24)
  const resto = Math.round(horas % 24)
  return dias > 0 ? `${dias}d ${resto}h` : `${Math.round(horas)}h`
}

export default function IndicadoresPainel({ onVoltar }) {
  const [periodo, setPeriodo] = useState('7dias')
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    calcularIndicadoresClinicos(periodo).then((r) => { setDados(r); setCarregando(false) })
  }, [periodo])

  return (
    <div className="workspace">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title">
          <h1>Indicadores Clínicos</h1>
          <p>Métricas em tempo real da unidade e performance dos plantões.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-strong)', background: '#fff', fontSize: 13 }}
          >
            {PERIODOS.map(p => <option key={p.chave} value={p.chave}>{p.rotulo}</option>)}
          </select>
          {onVoltar && <button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left"></i> Voltar</button>}
        </div>
      </div>

      {carregando || !dados ? (
        <p style={{ color: 'var(--text-muted)' }}>Carregando métricas...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>EM OBSERVAÇÃO AGORA</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{dados.emObservacaoAgora}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Pacientes no painel atual</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>INTERNARAM NO PERÍODO</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{dados.internaram.total}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{PERIODOS.find(p => p.chave === periodo)?.rotulo}</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>TEMPO MÉDIO (INTERNAÇÃO)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{formatarHoras(dados.tempoMedioInternacaoHoras)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Admissão até o desfecho</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>TEMPO MÉDIO ATÉ CONDUTA</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{formatarHoras(dados.tempoMedioAteCondutaHoras)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Tempo de porta até a decisão</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div className="card">
              <h3 style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-main)' }}>Top Diagnósticos de Internação</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dados.internaram.porDiagnostico.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma internação registrada.</p>
                ) : (
                  dados.internaram.porDiagnostico.map(([diagnostico, qtd]) => {
                    const max = Math.max(...dados.internaram.porDiagnostico.map(d => d[1]))
                    return (
                      <div key={diagnostico}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>{diagnostico}</span>
                          <span>{qtd}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4 }}>
                          <div style={{ width: `${(qtd / max) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-main)' }}>Ocupação por Manchester</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(dados.porManchester).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum paciente classificado agora.</p>
                ) : (
                  Object.entries(dados.porManchester).map(([cor, qtd]) => {
                    const total = Object.values(dados.porManchester).reduce((a, b) => a + b, 0)
                    const c = MANCHESTER_CORES[cor] || 'var(--text-muted)'
                    return (
                      <div key={cor}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                          <span>{cor}</span>
                          <span>{qtd} ({Math.round((qtd / total) * 100)}%)</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4 }}>
                          <div style={{ width: `${(qtd / total) * 100}%`, height: '100%', background: c, borderRadius: 4 }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
