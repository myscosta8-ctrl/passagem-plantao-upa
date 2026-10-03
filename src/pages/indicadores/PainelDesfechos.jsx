import { useEffect, useMemo, useRef, useState } from 'react'
import { buscarDesfechos } from '../../lib/pepIndicadores'
import { resumirDesfechos, TIPOS_DESFECHO } from '../../lib/indicadoresDesfechos'
import './PainelDesfechos.css'

// Saídas do período nos Indicadores: altas, transferências, óbitos e evasões, a série por
// dia/semana/mês e os blocos de óbitos, evasões e transferências (com grupo de diagnóstico
// e lista). Usa o mesmo período escolhido no topo da tela.
const COR = { Alta: 'var(--ds-s1)', 'Transferência': 'var(--ds-s2)', 'Óbito': 'var(--ds-s3)', 'Evasão': 'var(--ds-s4)' }
const pctBR = (n) => `${n.toFixed(1).replace('.', ',').replace(',0', '')}%`
function horasTexto(h) {
  if (h === null || h === undefined) return '—'
  const d = Math.floor(h / 24); const r = Math.round(h % 24)
  return d > 0 ? `${d}d ${r}h` : `${Math.round(h)}h`
}
const dataHora = (d) => d.toLocaleString('pt-BR', { timeZone: 'America/Belem', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function Grafico({ serie }) {
  const [foco, setFoco] = useState(null)
  // Largura real da área (o desenho acompanha a tela, sem esticar o texto).
  const caixa = useRef(null)
  const [W, setW] = useState(900)
  useEffect(() => {
    const el = caixa.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [serie.length > 0])
  if (!serie.length) return <p className="ds-vazio">Nenhuma saída registrada no período.</p>
  const max = Math.max(1, ...serie.map((s) => TIPOS_DESFECHO.reduce((a, t) => a + s[t], 0)))
  const passo = max <= 10 ? 2 : max <= 50 ? 10 : max <= 100 ? 25 : 50
  const topo = Math.ceil(max / passo) * passo
  // Largura fixa: as barras se espalham por toda a área (poucas barras ficam largas, até 70 px).
  const H = 180; const passoX = (W - 44) / serie.length
  const larg = Math.max(6, Math.min(70, passoX - 14))
  return (
    <div className="ds-graf" ref={caixa}>
      <svg viewBox={`0 0 ${W} ${H + 40}`} width="100%" height={H + 40} role="img" aria-label="Desfechos ao longo do tempo">
        {Array.from({ length: topo / passo + 1 }, (_, k) => k * passo).map((v) => {
          const y = 12 + H - (v / topo) * H
          return <g key={v}><line x1="36" x2={W} y1={y} y2={y} className="ds-grade" /><text x="30" y={y + 4} textAnchor="end" className="ds-eixo">{v}</text></g>
        })}
        {serie.map((s, i) => {
          const x = 44 + i * passoX + (passoX - larg) / 2
          let y = 12 + H
          const tot = TIPOS_DESFECHO.reduce((a, t) => a + s[t], 0)
          return (
            <g key={s.chave} onMouseEnter={() => setFoco(i)} onMouseLeave={() => setFoco(null)}>
              <rect x={44 + i * passoX} y="0" width={passoX} height={H + 40} fill="transparent" />
              {TIPOS_DESFECHO.map((t) => {
                const h = (s[t] / topo) * H
                if (h <= 0) return null
                y -= h
                return <rect key={t} x={x} y={y + 1} width={larg} height={Math.max(h - 2, 1.5)} fill={COR[t]} />
              })}
              <text x={x + larg / 2} y={y - 5} textAnchor="middle" className="ds-total">{tot}</text>
              {(passoX >= 42 || i % Math.ceil(42 / passoX) === 0) && <text x={x + larg / 2} y={H + 30} textAnchor="middle" className="ds-eixo">{s.rotulo}</text>}
            </g>
          )
        })}
      </svg>
      {foco !== null && (
        <div className="ds-dica" style={{ left: `${Math.min(88, Math.max(12, ((44 + (foco + 0.5) * passoX) / W) * 100))}%` }}>
          <b>{serie[foco].rotulo}</b>
          {TIPOS_DESFECHO.map((t) => <div key={t}><i style={{ background: COR[t] }} />{t}<span>{serie[foco][t]}</span></div>)}
        </div>
      )}
    </div>
  )
}

function Bloco({ titulo, b, mini, colunaExtra, extra }) {
  const [grupo, setGrupo] = useState(null)
  const [aberta, setAberta] = useState(false)
  const max = Math.max(1, ...b.grupos.map((g) => g[1]))
  const lista = grupo ? b.lista.filter((i) => i.grupo === grupo) : b.lista
  return (
    <section className="ds-card">
      <h3>{titulo}</h3>
      <p className="ds-sub">{b.total} no período · {pctBR(b.pct)} das saídas</p>
      {b.total > 0 && <div className="ds-mini">{mini.map(([r, v]) => <div key={r}><small>{r}</small><b>{v}</b></div>)}</div>}
      {b.total > 0 && <p className="ds-sub ds-sub-t">Por grupo de diagnóstico {grupo && <button type="button" className="ds-link" onClick={() => setGrupo(null)}>(todos)</button>}</p>}
      {b.grupos.map(([g, q]) => (
        <button type="button" key={g} className={`ds-bar ${grupo === g ? 'on' : ''}`} onClick={() => { setGrupo(grupo === g ? null : g); setAberta(true) }} title="Mostrar a lista deste grupo">
          <span className="ds-bar-l"><span>{g}</span><b>{q}</b></span><i><em style={{ width: `${(q / max) * 100}%` }} /></i>
        </button>
      ))}
      {b.total > 0 && <button type="button" className="ds-link" onClick={() => setAberta((v) => !v)}>{aberta ? 'Esconder lista' : `Ver lista (${lista.length})`} ›</button>}
      {aberta && (
        <div className="ds-tab-wrap">
          <table className="ds-tab">
            <thead><tr><th>Data</th><th>Pront.</th><th>Diagnóstico</th><th>{colunaExtra}</th></tr></thead>
            <tbody>{lista.map((i, k) => <tr key={k}><td>{dataHora(i.em)}</td><td>{i.prontuario || '—'}</td><td>{i.diagnostico || '—'}</td><td>{extra(i) || '—'}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function PainelDesfechos({ periodo, datas }) {
  const [linhas, setLinhas] = useState(null)
  const [erro, setErro] = useState(false)
  const [agrup, setAgrup] = useState(periodo === 'hoje' || periodo === '7dias' ? 'dia' : 'semana')
  useEffect(() => { setAgrup(periodo === 'hoje' || periodo === '7dias' ? 'dia' : 'semana') }, [periodo])
  useEffect(() => {
    let ativo = true
    setLinhas(null); setErro(false)
    buscarDesfechos(periodo, datas).then((l) => { if (ativo) setLinhas(l) }).catch(() => { if (ativo) setErro(true) })
    return () => { ativo = false }
  }, [periodo, datas?.inicio, datas?.fim]) // eslint-disable-line react-hooks/exhaustive-deps
  const r = useMemo(() => (linhas ? resumirDesfechos(linhas, agrup) : null), [linhas, agrup])

  if (erro) return <p className="ds-vazio">Não foi possível carregar as saídas. Tente de novo.</p>
  if (!r) return <p className="ds-vazio">Carregando saídas…</p>
  const { obitos: o, evasoes: e, transferencias: t } = r
  return (
    <div className="ds">
      <h2 className="ds-titulo">Saídas do período</h2>
      <div className="ds-tiles">
        <div className="ds-tile"><small>Saídas registradas</small><b>{r.saidas}</b><span>altas, transferências, óbitos e evasões</span></div>
        {TIPOS_DESFECHO.map((tp) => (
          <div className="ds-tile" key={tp}><small><i style={{ background: COR[tp] }} />{tp === 'Alta' ? 'Altas' : tp === 'Transferência' ? 'Transferências' : tp === 'Óbito' ? 'Óbitos' : 'Evasões'}</small><b>{r.totais[tp]}</b><span>{pctBR(r.pct(r.totais[tp]))} das saídas</span></div>
        ))}
      </div>
      <section className="ds-card">
        <div className="ds-card-topo">
          <div><h3>Desfechos ao longo do tempo</h3><p className="ds-sub">Passe o mouse sobre a barra para ver os números. Óbito conta pela data/hora do óbito, quando informada.</p></div>
          <div className="ds-seg">{[['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês']].map(([k, rot]) => <button type="button" key={k} className={agrup === k ? 'on' : ''} onClick={() => setAgrup(k)}>{rot}</button>)}</div>
        </div>
        <div className="ds-leg">{TIPOS_DESFECHO.map((tp) => <span key={tp}><i style={{ background: COR[tp] }} />{tp} <b>{r.totais[tp]}</b></span>)}</div>
        <Grafico serie={r.serie} />
      </section>
      <div className="ds-g3">
        <Bloco titulo="Óbitos" b={o} colunaExtra="Causa do óbito" extra={(i) => i.causa}
          mini={[['Em menos de 24 h da admissão', o.menos24h], ['Após 24 h (institucional)', o.mais24h], ['Permanência média até o óbito', horasTexto(o.horasMedia)], ['Idosos (60+) · Crianças (<12)', `${o.idosos} · ${o.criancas}`]]} />
        <Bloco titulo="Evasões" b={e} colunaExtra="Setor · turno" extra={(i) => [i.setor, i.turno === 'dia' ? 'dia' : 'noite'].filter(Boolean).join(' · ')}
          mini={[['Tempo médio até a evasão', horasTexto(e.horasMedia)], ['Turno dia · noite', `${e.dia} · ${e.noite}`], ['Em menos de 24 h', e.menos24h], ['Saúde mental / intoxicação', e.grupos.find(([g]) => g === 'Saúde mental / intoxicação')?.[1] || 0]]} />
        <Bloco titulo="Transferências" b={t} colunaExtra="Destino / observação" extra={(i) => i.obs}
          mini={[['Tempo médio até transferir', horasTexto(t.horasMedia)], ['Em menos de 24 h', t.menos24h]]} />
      </div>
      <p className="ds-nota"><b>Sobre os diagnósticos:</b> o diagnóstico é digitado em texto livre e o CID quase nunca é preenchido, por isso eles são agrupados por palavras-chave (ex.: PNM, PAC, bronquiolite, DPOC → Respiratório). Clique no grupo para ver cada diagnóstico como foi escrito.</p>
    </div>
  )
}
