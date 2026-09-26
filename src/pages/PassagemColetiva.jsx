import { useState } from 'react'
import { marcarPassagemConferida, atualizarPendenciasPassagem } from '../lib/pepAtendimentos'
import IndicadoresClinicos from '../components/IndicadoresClinicos'
import './PassagemColetiva.css'

// Porte de mockups-fase2/12-passagem-plantao-design.html: barra do setor com
// ações e seletor Grade/Tabela/Detalhe, cards de leito em 4 colunas, matriz
// sintética, visão de foco por leito e rodapé Cancelar/Salvar/Salvar e Imprimir.
// Só dados reais — a linha "Entrega ➔ Assume" do mockup não existe porque o
// schema não registra quem assume o turno.
const CHIPS_PENDENCIA_RAPIDA = [
  'Reavaliar sinais vitais',
  'Comunicar médico se alteração',
  'Aguarda resultado de exame',
  'Trocar curativo',
]

const GRUPOS_IMPRESSAO = [
  { tela: 'print1', setores: ['Sala Vermelha', 'Internação'] },
  { tela: 'print2', setores: ['Pediátrico', 'Observação/Internação'] },
]

// Classificação visual simples dos sinais (só cor, não interpreta clinicamente).
function nivelPa(s, d) { if (s == null) return ''; if (s >= 180 || s < 90 || d >= 110) return 'alert'; if (s >= 140 || d >= 90) return 'warn'; return '' }
function nivelFc(v) { if (v == null) return ''; if (v > 120 || v < 50) return 'alert'; if (v > 100 || v < 60) return 'warn'; return '' }
function nivelSpo2(v) { if (v == null) return ''; if (v < 90) return 'alert'; if (v < 94) return 'warn'; return '' }
function nivelTemp(v) { if (v == null) return ''; if (v >= 38 || v < 35) return 'alert'; if (v >= 37.5) return 'warn'; return '' }

function permanencia(paciente) {
  const ini = paciente.data_admissao || paciente.criado_em || paciente.created_at
  if (!ini) return null
  const h = Math.floor((Date.now() - new Date(ini).getTime()) / 3600000)
  if (!Number.isFinite(h) || h < 0) return null
  return h >= 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`
}

function textoAlergia(p) {
  if (p.alergias_obs) return p.alergias_obs
  if (typeof p.alergias === 'string' && p.alergias.trim()) return p.alergias
  return null
}
const temAlergia = (p) => !!(p.alergias_obs || (typeof p.alergias === 'string' ? p.alergias.trim() : p.alergias))

const listaDispositivos = (ps) => [...(Array.isArray(ps?.dispositivos) ? ps.dispositivos : []), ...(ps?.dispositivos_detalhe ? [ps.dispositivos_detalhe] : [])]
const fmtSaldo = (s) => `${s >= 0 ? '+' : '−'}${Math.abs(s)} mL`
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export default function PassagemColetiva({
  plantao,
  enfermeiroNome,
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  sinaisVitaisPorPaciente,
  balancoPorPaciente,
  enfermeiroId,
  onAbrirPassagem,
  onEditarPassagem,
  onRecarregar,
  onImprimir,
  onVoltar,
}) {
  const [setorAtivoId, setSetorAtivoId] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [modo, setModo] = useState('cards') // cards | table | focus
  const [focoLeitoId, setFocoLeitoId] = useState(null)
  const [conferindoId, setConferindoId] = useState(null)
  const [conferindoTodos, setConferindoTodos] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [recolhidos, setRecolhidos] = useState(() => new Set())
  const [pendenciaEmEdicao, setPendenciaEmEdicao] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)

  const setorAtivo = setoresVisiveis.find((s) => s.id === setorAtivoId) || setoresVisiveis[0]
  const leitosDoSetor = setorAtivo
    ? leitos.filter((l) => l.setor_id === setorAtivo.id).sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10) || String(a.numero).localeCompare(String(b.numero)))
    : []
  const leitosComPaciente = leitosDoSetor.filter((l) => pacientesPorLeito[l.id])

  const passagemDoLeito = (leito) => { const p = pacientesPorLeito[leito.id]; return p ? passagemPorPaciente[p.id] : null }

  const contagens = {
    todos: leitosComPaciente.length,
    pendencias: leitosComPaciente.filter((l) => passagemDoLeito(l)?.pendencias?.trim()).length,
    'a-conferir': leitosComPaciente.filter((l) => !passagemDoLeito(l)?.conferido_em).length,
    conferidos: leitosComPaciente.filter((l) => passagemDoLeito(l)?.conferido_em).length,
  }

  const leitosFiltrados = leitosComPaciente.filter((l) => {
    const p = passagemDoLeito(l)
    if (filtro === 'pendencias') return !!p?.pendencias?.trim()
    if (filtro === 'a-conferir') return !p?.conferido_em
    if (filtro === 'conferidos') return !!p?.conferido_em
    return true
  })

  async function toggleConferido(passagem) {
    if (!passagem) return
    setConferindoId(passagem.id)
    await marcarPassagemConferida({ passagemId: passagem.id, enfermeiroId, conferido: !passagem.conferido_em })
    await onRecarregar?.()
    setConferindoId(null)
  }

  async function conferirTodos() {
    const pendentes = leitosFiltrados.map(passagemDoLeito).filter((p) => p && !p.conferido_em)
    if (pendentes.length === 0) return
    setConferindoTodos(true)
    await Promise.all(pendentes.map((p) => marcarPassagemConferida({ passagemId: p.id, enfermeiroId, conferido: true })))
    await onRecarregar?.()
    setConferindoTodos(false)
  }

  async function sincronizar() {
    setSincronizando(true)
    await onRecarregar?.()
    setSincronizando(false)
  }

  const toggleRecolhido = (id) => setRecolhidos((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const textoPendencia = (ps) => (ps && ps.id in pendenciaEmEdicao ? pendenciaEmEdicao[ps.id] : ps?.pendencias || '')
  const editarPendencia = (id, t) => setPendenciaEmEdicao((prev) => ({ ...prev, [id]: t }))
  function adicionarChip(ps, chip) {
    const atual = textoPendencia(ps)
    editarPendencia(ps.id, atual + (atual.trim() ? ' · ' : '') + chip)
  }

  const alteradas = Object.entries(pendenciaEmEdicao).filter(([id, t]) => {
    const ps = Object.values(passagemPorPaciente).find((p) => String(p?.id) === String(id))
    return ps && t !== (ps.pendencias || '')
  })

  async function salvarTudo() {
    if (alteradas.length === 0) return true
    setSalvando(true); setMsg(null)
    const res = await Promise.all(alteradas.map(([id, t]) => atualizarPendenciasPassagem(id, t.trim())))
    const falhou = res.some((r) => r?.error)
    setSalvando(false)
    if (falhou) { setMsg({ erro: true, t: 'Algumas pendências não foram salvas. Tente de novo.' }); return false }
    setPendenciaEmEdicao({})
    await onRecarregar?.()
    setMsg({ t: `${alteradas.length} pendência(s) salva(s).` })
    return true
  }

  async function salvarEImprimir() {
    if (!(await salvarTudo())) return
    const grupo = GRUPOS_IMPRESSAO.find((g) => g.setores.includes(setorAtivo?.nome)) || GRUPOS_IMPRESSAO[0]
    onImprimir?.(grupo.tela)
  }

  function abrirFoco(leitoId) { setFocoLeitoId(leitoId); setModo('focus') }

  const leitoFoco = leitosComPaciente.find((l) => l.id === focoLeitoId) || leitosComPaciente[0]

  function renderVitais(sv) {
    if (!sv) return <p className="col-vazio">Nenhum registro ainda.</p>
    const extras = [sv.fr != null && `FR ${sv.fr} irpm`, sv.temperatura != null && `Temp ${sv.temperatura}°C`, sv.dor_escala != null && `Dor ${sv.dor_escala}/10`].filter(Boolean)
    return (
      <>
        <div className="vitals-row">
          <div className={`v-cell ${nivelPa(sv.pa_sistolica, sv.pa_diastolica)}`}><span className="lbl">PA</span><span className="val">{sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'}</span></div>
          <div className={`v-cell ${nivelFc(sv.fc)}`}><span className="lbl">FC</span><span className="val">{sv.fc ?? '—'}</span></div>
          <div className={`v-cell ${nivelSpo2(sv.spo2)}`}><span className="lbl">SpO₂</span><span className="val">{sv.spo2 != null ? `${sv.spo2}%` : '—'}</span></div>
          {sv.glicemia != null
            ? <div className="v-cell"><span className="lbl">HGT</span><span className="val">{sv.glicemia}</span></div>
            : <div className={`v-cell ${nivelTemp(sv.temperatura)}`}><span className="lbl">Temp</span><span className="val">{sv.temperatura != null ? `${sv.temperatura}°C` : '—'}</span></div>}
        </div>
        {extras.length > 0 && <span className="vitals-extra">{extras.join(' · ')}</span>}
      </>
    )
  }

  return (
    <div className="pc-page">
      <div className="sector-control-card">
        <div className="scc-top">
          <div className="sector-nav-pills">
            {setoresVisiveis.map((s) => {
              const ls = leitos.filter((l) => l.setor_id === s.id)
              const ocupados = ls.filter((l) => pacientesPorLeito[l.id]).length
              return (
                <button key={s.id} type="button" className={`sec-pill ${setorAtivo?.id === s.id ? 'active' : ''}`} onClick={() => { setSetorAtivoId(s.id); setFocoLeitoId(null) }}>
                  <span>{s.nome}</span>
                  <span className="badge-count">{ocupados}/{ls.length}</span>
                </button>
              )
            })}
          </div>

          <div className="scc-actions">
            {modo === 'cards' && (
              <button type="button" className="btn-compact-tool" onClick={() => (recolhidos.size > 0 ? setRecolhidos(new Set()) : setRecolhidos(new Set(leitosFiltrados.map((l) => l.id))))}>
                <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} /> {recolhidos.size > 0 ? 'Expandir Todos' : 'Recolher Todos'}
              </button>
            )}
            <button type="button" className="btn-compact-tool primary" onClick={sincronizar} disabled={sincronizando} title="Recarregar sinais vitais e balanço hídrico">
              <i className="ph ph-arrows-clockwise" /> {sincronizando ? 'Sincronizando...' : 'Sincronizar Sinais & Balanço'}
            </button>
            <button type="button" className="btn-compact-tool" onClick={conferirTodos} disabled={conferindoTodos || contagens['a-conferir'] === 0}>
              <i className="ph ph-check-square" /> {conferindoTodos ? 'Conferindo...' : 'Conferir Todos'}
            </button>
            {onImprimir && (
              <>
                <button type="button" className="btn-compact-tool" onClick={() => onImprimir('print1')} title="Imprimir: Vermelha + Internação">
                  <i className="ph ph-printer" /> Imprimir Vermelha
                </button>
                <button type="button" className="btn-compact-tool" onClick={() => onImprimir('print2')} title="Imprimir: Pediátrico + Observação">
                  <i className="ph ph-file-text" /> Imprimir Observação
                </button>
              </>
            )}
            <div className="view-toggle">
              <button type="button" className={`vt-btn ${modo === 'cards' ? 'active' : ''}`} onClick={() => setModo('cards')}><i className="ph ph-squares-four" /> Grade</button>
              <button type="button" className={`vt-btn ${modo === 'table' ? 'active' : ''}`} onClick={() => setModo('table')}><i className="ph ph-table" /> Tabela</button>
              <button type="button" className={`vt-btn ${modo === 'focus' ? 'active' : ''}`} onClick={() => setModo('focus')}><i className="ph ph-user" /> Detalhe</button>
            </div>
          </div>
        </div>

        <div className="scc-meta">
          <div className="team-flow">
            {plantao?.turno && <span>Turno: <strong>{plantao.turno}</strong></span>}
            {enfermeiroNome && (
              <>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span>Entrega: <strong>{enfermeiroNome}</strong></span>
              </>
            )}
          </div>
          <div className="filter-row">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Filtro:</span>
            <button type="button" className={`filter-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
            <button type="button" className={`filter-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com Pendências ({contagens.pendencias})</button>
            <button type="button" className={`filter-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A Conferir ({contagens['a-conferir']})</button>
            <button type="button" className={`filter-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
          </div>
        </div>
      </div>

      <div className="main-view-card">
        {modo === 'cards' && (
          <div className="beds-container">
            {leitosFiltrados.length === 0 ? (
              <p className="beds-container-vazio">Nenhum leito nesse filtro.</p>
            ) : leitosFiltrados.map((leito) => {
              const paciente = pacientesPorLeito[leito.id]
              const passagem = passagemPorPaciente[paciente.id]
              const conferido = !!passagem?.conferido_em
              const recolhido = recolhidos.has(leito.id)
              const sv = sinaisVitaisPorPaciente?.[paciente.id]
              const balanco = balancoPorPaciente?.[paciente.id]
              const saldo = balanco ? balanco.entradas - balanco.saidas : null
              const pendencia = textoPendencia(passagem)
              const alergia = temAlergia(paciente)
              const perm = permanencia(paciente)
              const disp = listaDispositivos(passagem)

              return (
                <article key={leito.id} className={`bed-card ${conferido ? 'checked' : ''} ${alergia ? 'has-alert' : ''} ${recolhido ? 'collapsed' : ''}`}>
                  <div className="bc-header">
                    <div className="bc-header-left">
                      <button type="button" className="btn-toggle-bed" onClick={() => toggleRecolhido(leito.id)} title="Recolher / Expandir leito">
                        <i className={`ph ${recolhido ? 'ph-caret-right' : 'ph-caret-down'}`} />
                      </button>
                      <span className="bed-tag">Leito {leito.numero}</span>
                      <span className="patient-title" onClick={() => toggleRecolhido(leito.id)}>{paciente.nome}{paciente.idade ? `, ${paciente.idade}a` : ''}</span>
                      {alergia && <span className="tag-alergia"><i className="ph ph-prohibit" /> Alergia{textoAlergia(paciente) ? `: ${textoAlergia(paciente)}` : ''}</span>}
                      {perm && <span className="patient-meta-text">Permanência: {perm}</span>}
                      <span className="patient-hd-text"><strong>HD:</strong> {paciente.diagnostico || passagem?.diagnostico || 'Sem diagnóstico registrado'}</span>
                      <div className="collapsed-summary">
                        {sv && <span>• PA {sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'} · SpO₂ {sv.spo2 ?? '—'}%</span>}
                        {balanco && <span>· BH {fmtSaldo(saldo)}</span>}
                        {pendencia.trim() && <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>· Com pendência</span>}
                      </div>
                    </div>
                    <div className="bc-header-right">
                      <button type="button" className={`btn-status-toggle ${conferido ? 'active' : ''}`} onClick={() => toggleConferido(passagem)} disabled={!passagem || conferindoId === passagem?.id}>
                        <i className={`ph ${conferido ? 'ph-check' : 'ph-hourglass'}`} /> {conferido ? 'Conferido' : 'A Conferir'}
                      </button>
                      <button type="button" className="btn-view-patient" onClick={() => onEditarPassagem(paciente, leito)}><i className="ph ph-note-pencil" /> Editar</button>
                      <button type="button" className="btn-view-patient" onClick={() => abrirFoco(leito.id)}><i className="ph ph-magnifying-glass" /> Detalhes</button>
                    </div>
                  </div>

                  <div className="bc-content">
                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-heartbeat" /> Sinais Vitais{sv ? ` (${fmtHora(sv.registrado_em)})` : ''}</div>
                      {renderVitais(sv)}
                    </div>
                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-needle" /> Dispositivos & Cuidados</div>
                      {disp.length > 0 || passagem?.cuidados ? (
                        <ul className="device-text">
                          {disp.map((d) => <li key={d}><i className="ph ph-check" /> {d}</li>)}
                          {passagem?.cuidados && <li><i className="ph ph-check" /> {passagem.cuidados}</li>}
                        </ul>
                      ) : <p className="col-vazio">Nenhum dispositivo registrado.</p>}
                    </div>
                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-drop" /> Balanço Hídrico</div>
                      {balanco ? (
                        <div className="balance-summary">
                          <div>Ingesta: <strong>{balanco.entradas} mL</strong> · Diurese: <strong>{balanco.saidas} mL</strong></div>
                          <span className={`bal-tag ${saldo < 0 ? 'negativo' : ''}`}>Balanço: {fmtSaldo(saldo)}</span>
                        </div>
                      ) : <p className="col-vazio">Nenhum lançamento ainda.</p>}
                    </div>
                    <div className="col-block col-block-pending">
                      <div className="col-title"><i className="ph ph-warning-circle" /> Pendências para o Próximo Turno</div>
                      <textarea className="pending-input" value={pendencia} disabled={!passagem} onChange={(e) => editarPendencia(passagem.id, e.target.value)} placeholder={passagem ? 'O que o próximo turno precisa saber...' : 'Sem passagem registrada — use Editar.'} />
                      {passagem && (
                        <div className="quick-chips">
                          {CHIPS_PENDENCIA_RAPIDA.map((c) => <span key={c} className="q-chip" onClick={() => adicionarChip(passagem, c)}>+ {c}</span>)}
                        </div>
                      )}
                    </div>
                  </div>

                  {!recolhido && <IndicadoresClinicos passagem={passagem} />}
                </article>
              )
            })}
          </div>
        )}

        {modo === 'table' && (
          <div className="table-view-container">
            <table className="table-matrix">
              <thead>
                <tr>
                  <th style={{ width: 75 }}>Leito</th>
                  <th style={{ width: 190 }}>Paciente</th>
                  <th style={{ width: 170 }}>HD Principal</th>
                  <th style={{ width: 130 }}>Sinais Vitais</th>
                  <th style={{ width: 140 }}>Dispositivos</th>
                  <th style={{ width: 90 }}>Balanço</th>
                  <th>Pendências</th>
                  <th style={{ width: 100, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leitosDoSetor.map((leito) => {
                  const paciente = pacientesPorLeito[leito.id]
                  if (!paciente) {
                    return filtro === 'todos' ? (
                      <tr key={leito.id} className="vago">
                        <td><strong>Leito {leito.numero}</strong></td>
                        <td colSpan={6}><span style={{ color: 'var(--text-muted)' }}>[ Leito vago ]</span></td>
                        <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Vago</span></td>
                      </tr>
                    ) : null
                  }
                  if (!leitosFiltrados.includes(leito)) return null
                  const ps = passagemPorPaciente[paciente.id]
                  const sv = sinaisVitaisPorPaciente?.[paciente.id]
                  const bal = balancoPorPaciente?.[paciente.id]
                  const saldo = bal ? bal.entradas - bal.saidas : null
                  const ok = !!ps?.conferido_em
                  return (
                    <tr key={leito.id} className={ok ? 'checked' : ''} onClick={() => abrirFoco(leito.id)} style={{ cursor: 'pointer' }}>
                      <td><strong>Leito {leito.numero}</strong></td>
                      <td><strong>{paciente.nome}</strong>{paciente.idade ? `, ${paciente.idade}a` : ''} {temAlergia(paciente) && <span className="tag-alergia" style={{ fontSize: 9 }}>{textoAlergia(paciente) || 'Alergia'}</span>}</td>
                      <td>{paciente.diagnostico || ps?.diagnostico || '—'}</td>
                      <td>{sv ? `PA ${sv.pa_sistolica ?? '—'}/${sv.pa_diastolica ?? '—'} · SpO₂ ${sv.spo2 ?? '—'}%` : '—'}</td>
                      <td>{listaDispositivos(ps).join(' · ') || '—'}</td>
                      <td>{bal ? <strong style={{ color: saldo < 0 ? 'var(--danger)' : 'var(--success)' }}>{fmtSaldo(saldo)}</strong> : '—'}</td>
                      <td>{textoPendencia(ps) || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {ok ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Conferido</span> : <span style={{ color: 'var(--warning-amber)', fontWeight: 700 }}>⏳ A Conferir</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {modo === 'focus' && (
          <div className="focus-view-container">
            <div className="focus-selector-sidebar">
              <div className="focus-selector-title">Leitos do Setor</div>
              {leitosFiltrados.map((l) => {
                const p = pacientesPorLeito[l.id]
                return (
                  <div key={l.id} className={`focus-bed-item ${leitoFoco?.id === l.id ? 'active' : ''}`} onClick={() => setFocoLeitoId(l.id)}>
                    <strong>Leito {l.numero}</strong>
                    <span>{p.nome}{p.idade ? ` (${p.idade}a)` : ''}</span>
                  </div>
                )
              })}
              {leitosFiltrados.length === 0 && <p className="beds-container-vazio">Nenhum leito nesse filtro.</p>}
            </div>

            {leitoFoco ? (() => {
              const p = pacientesPorLeito[leitoFoco.id]
              const ps = passagemPorPaciente[p.id]
              const sv = sinaisVitaisPorPaciente?.[p.id]
              const bal = balancoPorPaciente?.[p.id]
              const pend = textoPendencia(ps)
              return (
                <div className="focus-detail-pane">
                  <div className="fd-head">
                    <div>
                      <h3>{String(p.nome).toUpperCase()}{p.idade ? ` — ${p.idade} anos` : ''}</h3>
                      <p>
                        <strong>Leito {leitoFoco.numero} — {setorAtivo?.nome}</strong>
                        {p.data_admissao && <> · Admissão: {new Date(p.data_admissao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>}
                        {(p.diagnostico || ps?.diagnostico) && <> · Diagnóstico: {p.diagnostico || ps.diagnostico}</>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="btn-compact-tool" onClick={() => onEditarPassagem(p, leitoFoco)}><i className="ph ph-note-pencil" /> Editar Passagem</button>
                      <button type="button" className="btn-compact-tool" onClick={() => onAbrirPassagem(p, leitoFoco)}><i className="ph ph-folder-open" /> Abrir Prontuário</button>
                    </div>
                  </div>

                  {temAlergia(p) && (
                    <div className="tag-alergia" style={{ padding: '6px 10px', fontSize: 12, width: 'fit-content' }}>
                      <i className="ph ph-warning-circle" /> Alergia{textoAlergia(p) ? `: ${textoAlergia(p)}` : ''} cadastrada no prontuário.
                    </div>
                  )}

                  <div className="fd-grid">
                    <div className="fd-box">
                      <h4><i className="ph ph-heartbeat" /> Sinais Vitais{sv ? ` (${fmtHora(sv.registrado_em)})` : ''}</h4>
                      {renderVitais(sv)}
                    </div>
                    <div className="fd-box">
                      <h4><i className="ph ph-drop" /> Balanço Hídrico</h4>
                      {bal
                        ? <p>Ingesta: <strong>{bal.entradas} mL</strong> · Diurese: <strong>{bal.saidas} mL</strong> · Balanço: <strong>{fmtSaldo(bal.entradas - bal.saidas)}</strong></p>
                        : <p className="col-vazio">Nenhum lançamento ainda.</p>}
                    </div>
                    <div className="fd-box">
                      <h4><i className="ph ph-activity" /> Estado do Turno</h4>
                      {ps?.nivel_consciencia || ps?.intercorrencias || ps?.exames_texto ? (
                        <p>
                          {ps.nivel_consciencia && <>Consciência: {ps.nivel_consciencia}<br /></>}
                          {ps.intercorrencias && <>Intercorrências: {ps.intercorrencias}<br /></>}
                          {ps.exames_texto && <>Exames: {ps.exames_texto}</>}
                        </p>
                      ) : <p className="col-vazio">Nada registrado na passagem.</p>}
                    </div>
                    <div className="fd-box">
                      <h4><i className="ph ph-needle" /> Dispositivos & Cuidados</h4>
                      {listaDispositivos(ps).length > 0 || ps?.cuidados
                        ? <p>{[...listaDispositivos(ps), ps?.cuidados].filter(Boolean).join(' · ')}</p>
                        : <p className="col-vazio">Nenhum dispositivo registrado.</p>}
                    </div>
                  </div>

                  <div className="fd-box fd-pend">
                    <h4><i className="ph ph-list-checks" /> Pendências para o Próximo Turno</h4>
                    {ps ? (
                      <>
                        <textarea className="pending-input" value={pend} onChange={(e) => editarPendencia(ps.id, e.target.value)} placeholder="O que o próximo turno precisa saber..." />
                        <div className="quick-chips">
                          {CHIPS_PENDENCIA_RAPIDA.map((c) => <span key={c} className="q-chip" onClick={() => adicionarChip(ps, c)}>+ {c}</span>)}
                        </div>
                      </>
                    ) : <p className="col-vazio">Sem passagem registrada para este paciente — use Editar Passagem.</p>}
                    {ps?.enfermeiros && <p className="fd-autor">Última passagem: {ps.enfermeiros.nome_exibicao || ps.enfermeiros.nome} · {new Date(ps.atualizado_em || ps.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                </div>
              )
            })() : <div className="focus-detail-pane"><p className="col-vazio">Nenhum paciente neste setor.</p></div>}
          </div>
        )}

        <footer className="ac-footer">
          <button type="button" className="btn-cancel" onClick={onVoltar}><i className="ph ph-x-circle" /> Cancelar</button>
          {msg && <span className={`pc-msg ${msg.erro ? 'erro' : ''}`}>{msg.t}</span>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-save-draft" onClick={salvarTudo} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : `Salvar${alteradas.length ? ` (${alteradas.length})` : ''}`}
            </button>
            <button type="button" className="btn-save-print" onClick={salvarEImprimir} disabled={salvando}>
              <i className="ph ph-printer" /> Salvar e Imprimir
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
