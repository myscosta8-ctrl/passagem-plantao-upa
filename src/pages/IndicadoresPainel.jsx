import { useEffect, useState } from 'react'
import { calcularIndicadoresClinicos } from '../lib/pepIndicadores'
import { useAuth } from '../lib/AuthContext'
import './IndicadoresPainel.css'
import CampoPeriodo, { periodoPadrao } from '../components/CampoPeriodo'

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
  const [dataIni, setDataIni] = useState('')
  const [dataFim, setDataFim] = useState('')
  const { enfermeiro } = useAuth()
  const novaUI = enfermeiro?.pep_beta === true

  useEffect(() => {
    if (periodo === 'custom' && !dataIni) return
    setCarregando(true)
    calcularIndicadoresClinicos(periodo, { inicio: dataIni, fim: dataFim }).then((r) => { setDados(r); setCarregando(false) })
  }, [periodo, dataIni, dataFim])

  // ===== Nova interface (contas pep_beta) — mockup 11 =====
  if (novaUI) {
    const CORES = { Vermelho: '#C93A3A', Laranja: '#E07A2E', Amarelo: '#E0B43A', Verde: '#3E8E5E', Azul: '#4A78B5', 'Não classificado': '#9AA8B5' }
    const rotPer = periodo === 'hoje' ? 'hoje' : periodo === '7dias' ? 'nos últimos 7 dias' : periodo === '30dias' ? 'nos últimos 30 dias' : 'no período escolhido'
    const man = dados ? Object.entries(dados.porManchester) : []
    const totMan = man.reduce((a, [, q]) => a + q, 0)
    const diag = dados ? dados.internaram.porDiagnostico : []
    const maxD = Math.max(1, ...diag.map((d) => d[1]))
    return (
      <div className="workspace ind-v2">
        <div className="ind-topo">
          <h1>Indicadores Clínicos</h1>
          <span className="ind-sub">Métricas da unidade e dos plantões</span>
          <div className="ind-per">
            {periodo === 'custom' && <CampoPeriodo inicio={dataIni} fim={dataFim} onInicio={setDataIni} onFim={setDataFim} />}
            <div className="ind-seg">
              {[['hoje', 'Hoje'], ['7dias', '7 dias'], ['30dias', '30 dias'], ['custom', 'Período']].map(([k, r]) => (
                <button key={k} type="button" className={periodo === k ? 'on' : ''} onClick={() => { if (k === 'custom' && !dataIni) { const d = periodoPadrao(); setDataIni(d.inicio); setDataFim(d.fim) } setPeriodo(k) }}>{r}</button>
              ))}
            </div>
          </div>
        </div>
        {periodo === 'custom' && !dataIni ? <p className="ind-vazio">Escolha a data inicial do período.</p> : carregando || !dados ? <p className="ind-vazio">Carregando métricas…</p> : (
          <>
            <div className="ind-grupos">
              <section className="ind-grupo">
                <h3><span className="ind-tag obs">Observação</span></h3>
                <div className="ind-k3">
                  <div className="ind-kc"><small>Em observação agora</small><b>{dados.emObservacaoAgora}</b><span>pacientes no painel</span></div>
                  <div className="ind-kc"><small>Saíram da observação</small><b>{dados.saidasObservacao}</b><span>{rotPer}, sem internar</span></div>
                  <div className="ind-kc"><small>Tempo médio em observação</small><b>{formatarHoras(dados.tempoMedioObservacaoHoras)}</b><span>da entrada à saída</span></div>
                </div>
              </section>
              <section className="ind-grupo">
                <h3><span className="ind-tag int">Internação</span></h3>
                <div className="ind-k3">
                  <div className="ind-kc"><small>Internados agora</small><b>{dados.internadosAgora}</b><span>pacientes no painel</span></div>
                  <div className="ind-kc"><small>Internaram</small><b>{dados.internaram.total}</b><span>{rotPer}</span></div>
                  <div className="ind-kc"><small>Tempo médio de internação</small><b>{formatarHoras(dados.tempoMedioInternacaoHoras)}</b><span>da admissão ao desfecho</span></div>
                </div>
              </section>
            </div>
            <div className="ind-conduta"><i className="ph ph-timer" /> Tempo médio até a conduta (da porta até a decisão de observar ou internar): <b>{formatarHoras(dados.tempoMedioAteCondutaHoras)}</b></div>
            <div className="ind-g2">
              <div className="ind-cd">
                <h4>Diagnósticos mais frequentes de quem internou</h4>
                {diag.length === 0 ? <p className="ind-vazio">Nenhuma internação registrada.</p> : diag.map(([d, q]) => (
                  <div key={d} className="ind-bar"><div><span title={d}>{d}</span><span>{q}</span></div><i><em style={{ width: `${(q / maxD) * 100}%` }} /></i></div>
                ))}
              </div>
              <div className="ind-cd">
                <h4>Ocupação agora por classificação de Manchester</h4>
                {[['Em observação', 'Observação'], ['Internado', 'Internação']].map(([sit, rot]) => {
                  const lista = Object.entries(dados.manchesterPorSituacao?.[sit] || {})
                  const tot = lista.reduce((a, [, q]) => a + q, 0)
                  return (
                    <div key={sit} className="ind-man">
                      <div className="ind-man-tit"><span className={'ind-tag ' + (sit === 'Internado' ? 'int' : 'obs')}>{rot}</span><b>{tot}</b></div>
                      {tot === 0 ? <p className="ind-vazio ind-vazio-p">Nenhum paciente agora.</p> : (
                        <>
                          <div className="ind-stk">{lista.map(([c, q]) => <span key={c} style={{ width: `${(q / tot) * 100}%`, background: CORES[c] || '#9AA8B5' }} title={`${c}: ${q}`} />)}</div>
                          <div className="ind-leg">{lista.map(([c, q]) => <div key={c}><s style={{ background: CORES[c] || '#9AA8B5' }} />{c}<b>{q} ({Math.round((q / tot) * 100)}%)</b></div>)}</div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

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
