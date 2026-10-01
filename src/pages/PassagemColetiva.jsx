import { numeroLimpo } from '../lib/numeros'
import { useEffect, useState } from 'react'
import { marcarPassagemConferida, atualizarCamposPassagem, salvarPassagemPep } from '../lib/pepAtendimentos'
import { DISPOSITIVOS_OPCOES, NIVEIS_CONSCIENCIA } from './passagem-form/constantes'
import { carregarResumoProntuario } from '../lib/pepAtendimentos'
import { useAuth } from '../lib/AuthContext'
import './PassagemColetiva.css'

// Cópia literal de mockups-fase2/12-passagem-plantao-design.html, com os
// ajustes pedidos: sem "Entrega ➔ Assume", sem Sinais Vitais e Balanço
// Hídrico, Dispositivos editável direto no card e os dois impressos dos
// setores na barra de ações.
const CHIPS_PENDENCIA_RAPIDA = [
  'Reavaliar sinais vitais',
  'Comunicar médico se alteração',
  'Aguarda resultado de exame',
  'Trocar curativo',
]

const GRUPOS_IMPRESSAO = [
  { tela: 'print1', setores: ['Sala Vermelha', 'Internação'] },
  { tela: 'print2', setores: ['Pediatria', 'Observação', 'Pediátrico', 'Observação/Internação'] },
]

function permanencia(paciente) {
  const ini = paciente.internado_em || paciente.data_admissao || paciente.criado_em || paciente.created_at
  if (!ini) return null
  const h = Math.floor((Date.now() - new Date(ini).getTime()) / 3600000)
  if (!Number.isFinite(h) || h < 0) return null
  return h >= 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`
}

function textoAlergia(p) {
  if (p.alergia_substancia) return p.alergia_substancia
  if (p.alergias_obs) return p.alergias_obs
  if (typeof p.alergias === 'string' && p.alergias.trim()) return p.alergias
  return null
}
const temAlergia = (p) => !!(p.alergias_obs || (typeof p.alergias === 'string' ? p.alergias.trim() : p.alergias))

export default function PassagemColetiva({
  plantao,
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  enfermeiroId,
  onAbrirPassagem,
  onEditarPassagem,
  onRecarregar,
  onImprimir,
  onCompartilhar,
  onVoltar,
}) {
  const [setorAtivoId, setSetorAtivoId] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [modo, setModo] = useState('cards') // cards | table | focus
  const { enfermeiro: usuarioAtual } = useAuth()
  const novaUI = usuarioAtual?.pep_beta === true
  const [menuImprimir, setMenuImprimir] = useState(false)
  const [focoLeitoId, setFocoLeitoId] = useState(null)
  const [conferindoId, setConferindoId] = useState(null)
  const [conferindoTodos, setConferindoTodos] = useState(false)
  const [recolhidos, setRecolhidos] = useState(() => new Set())
  const [rascunhos, setRascunhos] = useState({}) // passagemId -> { pendencias?, dispositivos?, dispositivos_detalhe? }
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)
  const [resumos, setResumos] = useState({})

  const setorAtivo = setoresVisiveis.find((s) => s.id === setorAtivoId) || setoresVisiveis[0]
  const leitosDoSetor = setorAtivo
    ? leitos.filter((l) => l.setor_id === setorAtivo.id).sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10) || String(a.numero).localeCompare(String(b.numero)))
    : []
  const leitosComPaciente = leitosDoSetor.filter((l) => pacientesPorLeito[l.id])
  // Sem passagem neste atendimento ainda: usa uma "passagem virtual" para a
  // equipe poder preencher direto no card; ela é criada ao Salvar.
  const passagemEditavel = (paciente, leito) => passagemPorPaciente[paciente.id]
    || { id: `novo:${paciente.id}`, _novo: true, atendimento_id: paciente.id, leito_id: leito.id, setor_id: leito.setor_id }
  // Exames / sorologias / hemoterapia / regulação do prontuário, de uma vez para o setor.
  const idsAtendimentosSetor = leitosComPaciente.map((l) => pacientesPorLeito[l.id]?.id).filter(Boolean).join(',')
  useEffect(() => {
    if (!idsAtendimentosSetor) return
    carregarResumoProntuario(idsAtendimentosSetor.split(',')).then((m) => setResumos((prev) => ({ ...prev, ...m })))
  }, [idsAtendimentosSetor])

  const passagemDoLeito = (leito) => { const p = pacientesPorLeito[leito.id]; return p ? passagemPorPaciente[p.id] : null }

  // Valor atual de um campo: rascunho se houver, senão o gravado.
  const campo = (ps, k) => (ps && rascunhos[ps.id] && k in rascunhos[ps.id] ? rascunhos[ps.id][k] : ps?.[k])
  const pendenciaDe = (ps) => campo(ps, 'pendencias') || ''
  const dispositivosDe = (ps) => (Array.isArray(campo(ps, 'dispositivos')) ? campo(ps, 'dispositivos') : [])
  const detalheDe = (ps) => campo(ps, 'dispositivos_detalhe') || ''
  const editar = (ps, k, v) => setRascunhos((prev) => ({
    ...prev,
    [ps.id]: { ...prev[ps.id], [k]: v, ...(ps._novo ? { _meta: { atendimento_id: ps.atendimento_id, leito_id: ps.leito_id, setor_id: ps.setor_id } } : {}) },
  }))

  const contagens = {
    todos: leitosComPaciente.length,
    pendencias: leitosComPaciente.filter((l) => pendenciaDe(passagemDoLeito(l)).trim()).length,
    'a-conferir': leitosComPaciente.filter((l) => !passagemDoLeito(l)?.conferido_em).length,
    conferidos: leitosComPaciente.filter((l) => passagemDoLeito(l)?.conferido_em).length,
  }

  const leitosFiltrados = leitosComPaciente.filter((l) => {
    const p = passagemDoLeito(l)
    if (filtro === 'pendencias') return !!pendenciaDe(p).trim()
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

  const toggleRecolhido = (id) => setRecolhidos((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  function adicionarChip(ps, chip) {
    const atual = pendenciaDe(ps)
    editar(ps, 'pendencias', atual + (atual.trim() ? ' · ' : '') + chip)
  }
  function toggleDispositivo(ps, d) {
    const atual = dispositivosDe(ps)
    editar(ps, 'dispositivos', atual.includes(d) ? atual.filter((x) => x !== d) : [...atual, d])
  }

  const alterados = Object.keys(rascunhos).length

  async function salvarTudo() {
    if (alterados === 0) return true
    setSalvando(true); setMsg(null)
    const res = await Promise.all(Object.entries(rascunhos).map(([id, campos]) => {
      const { _meta, ...limpo } = campos
      for (const k of Object.keys(limpo)) if (typeof limpo[k] === 'string') limpo[k] = limpo[k].trim() || null
      if (id.startsWith('novo:')) {
        return salvarPassagemPep({ ..._meta, plantao_id: plantao.id, enfermeiro_id: enfermeiroId, criado_por: enfermeiroId, ...limpo })
      }
      return atualizarCamposPassagem(id, limpo)
    }))
    setSalvando(false)
    if (res.some((r) => r?.error)) { setMsg({ erro: true, t: 'Algumas alterações não foram salvas. Tente de novo.' }); return false }
    setRascunhos({})
    await onRecarregar?.()
    setMsg({ t: 'Alterações salvas.' })
    return true
  }

  async function salvarEImprimir() {
    if (!(await salvarTudo())) return
    const grupo = GRUPOS_IMPRESSAO.find((g) => g.setores.includes(setorAtivo?.nome)) || GRUPOS_IMPRESSAO[0]
    onImprimir?.(grupo.tela)
  }

  function abrirFoco(leitoId) { setFocoLeitoId(leitoId); setModo('focus') }
  const leitoFoco = leitosFiltrados.find((l) => l.id === focoLeitoId) || leitosFiltrados[0]

  function blocoDispositivos(ps) {
    const lista = dispositivosDe(ps)
    return (
      <>
        <div className="disp-chips">
          {DISPOSITIVOS_OPCOES.map((d) => (
            <button key={d} type="button" className={`disp-chip ${lista.includes(d) ? 'on' : ''}`} onClick={() => toggleDispositivo(ps, d)}>
              <i className={`ph ${lista.includes(d) ? 'ph-check' : 'ph-plus'}`} /> {d}
            </button>
          ))}
        </div>
        <textarea className="pending-input disp-input" value={detalheDe(ps)} onChange={(e) => editar(ps, 'dispositivos_detalhe', e.target.value)} placeholder="Detalhe: local, calibre, data de inserção, cuidados..." />
      </>
    )
  }

  function SimNao({ ps, k }) {
    const v = campo(ps, k)
    return (
      <div className="pc-simnao">
        <button type="button" className={v === false ? 'on' : ''} onClick={() => editar(ps, k, v === false ? null : false)}>Não</button>
        <button type="button" className={v === true ? 'on' : ''} onClick={() => editar(ps, k, v === true ? null : true)}>Sim</button>
      </div>
    )
  }

  function blocoAssistencia(ps) {
    const lista = dispositivosDe(ps)
    return (
      <>
        <div className="pc-linha2">
          <div className="pc-campo"><label>Curativo realizado</label><SimNao ps={ps} k="curativo_realizado" /></div>
          <div className="pc-campo">
            <label>Nível de consciência</label>
            <select className="pc-input" value={campo(ps, 'nivel_consciencia') || ''} onChange={(e) => editar(ps, 'nivel_consciencia', e.target.value)}>
              <option value="">—</option>
              {NIVEIS_CONSCIENCIA.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="pc-campo">
          <label>Dispositivos invasivos</label>
          <div className="disp-chips">
            {DISPOSITIVOS_OPCOES.map((d) => (
              <button key={d} type="button" className={`disp-chip ${lista.includes(d) ? 'on' : ''}`} onClick={() => toggleDispositivo(ps, d)}>
                <i className={`ph ${lista.includes(d) ? 'ph-check' : 'ph-plus'}`} /> {d}
              </button>
            ))}
          </div>
        </div>
        {lista.includes('AVP') && (
          <div className="pc-linha2">
            <div className="pc-campo"><label>Inserção do AVP — data</label><input className="pc-input" type="date" value={campo(ps, 'avp_data_insercao') || ''} onChange={(e) => editar(ps, 'avp_data_insercao', e.target.value)} /></div>
            <div className="pc-campo"><label>Hora</label><input className="pc-input" type="time" value={campo(ps, 'avp_hora_insercao') || ''} onChange={(e) => editar(ps, 'avp_hora_insercao', e.target.value)} /></div>
          </div>
        )}
        <div className="pc-campo">
          <label>Detalhe dos dispositivos (nº, tamanho)</label>
          <input className="pc-input" type="text" placeholder="ex: AVP nº 20, SVD nº 16" value={detalheDe(ps)} onChange={(e) => editar(ps, 'dispositivos_detalhe', e.target.value)} />
        </div>
      </>
    )
  }

  function blocoTransferencia(ps, atendimentoId) {
    const r = resumos[atendimentoId]
    return (
      <>
        <div className="pc-campo"><label>Leito liberado p/ outro hospital</label><SimNao ps={ps} k="leito_liberado_outro_hospital" /></div>
        {campo(ps, 'leito_liberado_outro_hospital') === true && (
          <div className="pc-linha2">
            <div className="pc-campo"><label>Qual hospital</label><input className="pc-input" type="text" value={campo(ps, 'leito_liberado_hospital') || ''} onChange={(e) => editar(ps, 'leito_liberado_hospital', e.target.value)} /></div>
            <div className="pc-campo"><label>Transporte</label><input className="pc-input" type="text" placeholder="SAMU, ambulância..." value={campo(ps, 'leito_liberado_transporte') || ''} onChange={(e) => editar(ps, 'leito_liberado_transporte', e.target.value)} /></div>
          </div>
        )}
        <div className="pc-campo"><label>Alta Sala Vermelha</label><SimNao ps={ps} k="alta_sala_vermelha" /></div>
        {campo(ps, 'alta_sala_vermelha') === true && (
          <div className="pc-linha2">
            <div className="pc-campo"><label>Data da alta</label><input className="pc-input" type="date" value={campo(ps, 'alta_sala_vermelha_data') || ''} onChange={(e) => editar(ps, 'alta_sala_vermelha_data', e.target.value)} /></div>
            <div className="pc-campo"><label>Horário</label><input className="pc-input" type="time" value={campo(ps, 'alta_sala_vermelha_hora') || ''} onChange={(e) => editar(ps, 'alta_sala_vermelha_hora', e.target.value)} /></div>
          </div>
        )}
        <div className="pc-resumo">
          <div className="pc-resumo-titulo"><i className="ph ph-file-text" /> Do prontuário (somente leitura)</div>
          {!r ? <p className="col-vazio">Carregando...</p> : r.itens.length === 0 ? <p className="col-vazio">Sem exames, sorologias, hemoterapia ou regulação.</p> : (
            <ul className="pc-resumo-lista">{r.itens.map((t, i) => <li key={i}>{t}</li>)}</ul>
          )}
        </div>
      </>
    )
  }

  function blocoPendencias(ps) {
    return (
      <>
        <textarea className="pending-input" value={pendenciaDe(ps)} onChange={(e) => editar(ps, 'pendencias', e.target.value)} placeholder="O que o próximo turno precisa saber..." />
        <div className="quick-chips">
          {CHIPS_PENDENCIA_RAPIDA.map((c) => <span key={c} className="q-chip" onClick={() => adicionarChip(ps, c)}>+ {c}</span>)}
        </div>
      </>
    )
  }

  const resumoDisp = (ps) => [...dispositivosDe(ps), detalheDe(ps)].filter(Boolean).join(' · ')

  return (
    <div className="pc-page">
      {novaUI ? (
      <div className="sector-control-card pcv2">
        <div className="pcv2-linha">
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
          <div className="view-toggle pcv2-vistas">
            <button type="button" className={`vt-btn ${modo === 'cards' ? 'active' : ''}`} onClick={() => setModo('cards')} title="Grade" aria-label="Grade"><i className="ph ph-squares-four" /></button>
            <button type="button" className={`vt-btn ${modo === 'table' ? 'active' : ''}`} onClick={() => setModo('table')} title="Tabela" aria-label="Tabela"><i className="ph ph-table" /></button>
            <button type="button" className={`vt-btn ${modo === 'focus' ? 'active' : ''}`} onClick={() => setModo('focus')} title="Detalhe" aria-label="Detalhe"><i className="ph ph-user" /></button>
          </div>
        </div>
        <div className="pcv2-linha">
          <div className="filter-row">
            <button type="button" className={`filter-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
            <button type="button" className={`filter-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com pendências ({contagens.pendencias})</button>
            <button type="button" className={`filter-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A conferir ({contagens['a-conferir']})</button>
            <button type="button" className={`filter-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
          </div>
          <div className="pcv2-acoes">
            <button type="button" className="btn-compact-tool pcv2-ic" onClick={() => (recolhidos.size > 0 ? setRecolhidos(new Set()) : setRecolhidos(new Set(leitosFiltrados.map((l) => l.id))))} title={recolhidos.size > 0 ? 'Expandir todos' : 'Recolher todos'} aria-label={recolhidos.size > 0 ? 'Expandir todos' : 'Recolher todos'}>
              <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} />
            </button>
            <button type="button" className="btn-compact-tool" onClick={conferirTodos} disabled={conferindoTodos || contagens['a-conferir'] === 0}>
              <i className="ph ph-check-square" /> {conferindoTodos ? 'Conferindo...' : 'Conferir todos'}
            </button>
            {onImprimir && (
              <div className="pcv2-menu">
                <button type="button" className="btn-compact-tool primary" onClick={() => setMenuImprimir((v) => !v)} aria-expanded={menuImprimir}>
                  <i className="ph ph-printer" /> Imprimir <i className="ph ph-caret-down" />
                </button>
                {menuImprimir && (
                  <div className="pcv2-menu-lista" onMouseLeave={() => setMenuImprimir(false)}>
                    <button type="button" onClick={() => { setMenuImprimir(false); onImprimir('print1') }}>Sala Vermelha e Internação</button>
                    <button type="button" onClick={() => { setMenuImprimir(false); onImprimir('print2') }}>Pediatria e Observação</button>
                  </div>
                )}
              </div>
            )}
            {onCompartilhar && (
              <button type="button" className="btn-compact-tool pcv2-ic" onClick={onCompartilhar} title="Compartilhar plantão (resumo para WhatsApp)" aria-label="Compartilhar plantão">
                <i className="ph ph-share-network" />
              </button>
            )}
          </div>
        </div>
      </div>
      ) : (
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
            <button type="button" className="btn-compact-tool" onClick={() => (recolhidos.size > 0 ? setRecolhidos(new Set()) : setRecolhidos(new Set(leitosFiltrados.map((l) => l.id))))} title="Recolher ou expandir todos os leitos">
              <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} /> {recolhidos.size > 0 ? 'Expandir Todos' : 'Recolher Todos'}
            </button>
            <button type="button" className="btn-compact-tool" onClick={conferirTodos} disabled={conferindoTodos || contagens['a-conferir'] === 0}>
              <i className="ph ph-check-square" /> {conferindoTodos ? 'Conferindo...' : 'Conferir Todos'}
            </button>
            {onImprimir && (
              <>
                <button type="button" className="btn-compact-tool primary" onClick={() => onImprimir('print1')}>
                  <i className="ph ph-printer" /> Imprimir Sala Vermelha e Internação
                </button>
                <button type="button" className="btn-compact-tool primary" onClick={() => onImprimir('print2')}>
                  <i className="ph ph-printer" /> Imprimir Pediatria e Observação
                </button>
              </>
            )}
            {onCompartilhar && (
              <button type="button" className="btn-compact-tool" onClick={onCompartilhar} title="Gerar o resumo do plantão para enviar no WhatsApp">
                <i className="ph ph-share-network" /> Compartilhar Plantão
              </button>
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
          </div>
          <div className="filter-row">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Filtro:</span>
            <button type="button" className={`filter-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
            <button type="button" className={`filter-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com Pendências ({contagens.pendencias})</button>
            <button type="button" className={`filter-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A Conferir ({contagens['a-conferir']})</button>
            <button type="button" className={`filter-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
          </div>
        </div>
      </div>
      )}

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
              const alergia = temAlergia(paciente)
              const perm = permanencia(paciente)
              const pend = pendenciaDe(passagemEditavel(paciente, leito))
              const disp = resumoDisp(passagemEditavel(paciente, leito))

              return (
                <article key={leito.id} className={`bed-card ${conferido ? 'checked' : ''} ${alergia ? 'has-alert' : ''} ${recolhido ? 'collapsed' : ''}`}>
                  <div className="bc-header">
                    <div className="bc-header-left">
                      <button type="button" className="btn-toggle-bed" onClick={() => toggleRecolhido(leito.id)} title="Recolher / Expandir leito">
                        <i className={`ph ${recolhido ? 'ph-caret-right' : 'ph-caret-down'}`} />
                      </button>
                      <span className="bed-tag">Leito {leito.numero}</span>
                      <span className="patient-title" onClick={() => toggleRecolhido(leito.id)} title="Clique para recolher/expandir">{paciente.nome}{paciente.idade ? `, ${paciente.idade}a` : ''}</span>
                      {alergia && <span className="tag-alergia"><i className="ph ph-prohibit" /> Alergia{textoAlergia(paciente) ? `: ${textoAlergia(paciente)}` : ''}</span>}
                      {(paciente.numero_atendimento || perm) && <span className="patient-meta-text">{[paciente.numero_atendimento && `Reg: ${numeroLimpo(paciente.numero_atendimento)}`, perm && `Permanência: ${perm}`].filter(Boolean).join(' · ')}</span>}
                      <span className="patient-hd-text"><strong>HD:</strong> {paciente.diagnostico || passagem?.diagnostico || 'Sem diagnóstico registrado'}</span>
                      <div className="collapsed-summary">
                        {disp && <span>• {disp}</span>}
                        {pend.trim() && <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>· Com pendência</span>}
                      </div>
                    </div>
                    <div className="bc-header-right">
                      <button type="button" className={`btn-status-toggle ${conferido ? 'active' : ''}`} onClick={() => toggleConferido(passagem)} disabled={!passagem || conferindoId === passagem?.id}>
                        <i className={`ph ${conferido ? 'ph-check' : 'ph-hourglass'}`} /> {conferido ? 'Conferido' : 'A Conferir'}
                      </button>
                      <button type="button" className="btn-view-patient" onClick={() => abrirFoco(leito.id)}><i className="ph ph-magnifying-glass" /> Detalhes</button>
                      <button type="button" className="btn-view-patient" onClick={() => onAbrirPassagem(paciente, leito)}><i className="ph ph-folder-open" /> Prontuário</button>
                    </div>
                  </div>

                  <div className="bc-content bc-content-3">
                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-first-aid-kit" /> Assistência</div>
                      {blocoAssistencia(passagemEditavel(paciente, leito))}
                    </div>
                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-ambulance" /> Transferência & Prontuário</div>
                      {blocoTransferencia(passagemEditavel(paciente, leito), paciente.id)}
                    </div>
                    <div className="col-block col-block-pending">
                      <div className="col-title"><i className="ph ph-warning-circle" /> Pendências para o Próximo Turno</div>
                      {blocoPendencias(passagemEditavel(paciente, leito))}
                    </div>
                  </div>
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
                  <th style={{ width: 210 }}>Paciente</th>
                  <th style={{ width: 180 }}>HD Principal</th>
                  <th style={{ width: 200 }}>Dispositivos</th>
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
                        <td colSpan={4}><span style={{ color: 'var(--text-muted)' }}>[ Leito vago ]</span></td>
                        <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Vago</span></td>
                      </tr>
                    ) : null
                  }
                  if (!leitosFiltrados.includes(leito)) return null
                  const ps = passagemPorPaciente[paciente.id]
                  const ok = !!ps?.conferido_em
                  return (
                    <tr key={leito.id} className={ok ? 'checked' : ''} onClick={() => abrirFoco(leito.id)} style={{ cursor: 'pointer' }}>
                      <td><strong>Leito {leito.numero}</strong></td>
                      <td><strong>{paciente.nome}</strong>{paciente.idade ? `, ${paciente.idade}a` : ''} {temAlergia(paciente) && <span className="tag-alergia" style={{ fontSize: 12 }}>{textoAlergia(paciente) || 'Alergia'}</span>}</td>
                      <td>{paciente.diagnostico || ps?.diagnostico || '—'}</td>
                      <td>{resumoDisp(ps) || '—'}</td>
                      <td>{pendenciaDe(ps) || '—'}</td>
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
                      <h4><i className="ph ph-first-aid-kit" /> Assistência & Transferência</h4>
                      {blocoAssistencia(passagemEditavel(p, leitoFoco))}
                      <div style={{ marginTop: 10 }}>{blocoTransferencia(passagemEditavel(p, leitoFoco), p.id)}</div>
                    </div>
                    <div className="fd-box">
                      <h4><i className="ph ph-clock-counter-clockwise" /> Última Passagem</h4>
                      {ps ? (
                        <p>
                          {ps.enfermeiros && <>Registrada por {ps.enfermeiros.nome_exibicao || ps.enfermeiros.nome} em {new Date(ps.atualizado_em || ps.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}.<br /></>}
                          {ps.nivel_consciencia && <>Consciência: {ps.nivel_consciencia}<br /></>}
                          {ps.intercorrencias && <>Intercorrências: {ps.intercorrencias}</>}
                        </p>
                      ) : <p className="col-vazio">Nenhuma passagem registrada.</p>}
                    </div>
                  </div>

                  <div className="fd-box fd-pend">
                    <h4><i className="ph ph-list-checks" /> Pendências para o Próximo Turno</h4>
                    {blocoPendencias(passagemEditavel(p, leitoFoco))}
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
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : `Salvar${alterados ? ` (${alterados})` : ''}`}
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
