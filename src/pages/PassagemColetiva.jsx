import { useState } from 'react'
import { marcarPassagemConferida, atualizarPendenciasPassagem } from '../lib/pepAtendimentos'
import IndicadoresClinicos from '../components/IndicadoresClinicos'
import './PassagemColetiva.css'

// Porte literal de mockups-fase2/12-passagem-plantao-design.html: mesmas
// classes/cores/estrutura do mockup (ver PassagemColetiva.css), com dados
// reais no lugar dos fictícios do design. Recebe os dados já carregados pelo
// Painel (mesmo padrão de PainelCards/PainelTabela), sem duplicar busca.
// "Conferido" é só um carimbo de revisão (quem/quando), reversível, não
// altera nenhum campo clínico da passagem.
//
// Deliberadamente fora desta versão (ver PLANO_ACAO_FASE2.md): modo
// tabela/foco (o mockup tem "Grade/Tabela/Detalhe", só "Grade" existe aqui),
// painel lateral com histórico de plantões, linha "Entrega/Assume" do
// mockup (não fabricamos nome de enfermeiro que assume — isso não é
// rastreado no schema).
const CHIPS_PENDENCIA_RAPIDA = [
  'Reavaliar sinais vitais',
  'Comunicar médico se alteração',
  'Aguarda resultado de exame',
  'Trocar curativo',
]

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
}) {
  const [setorAtivoId, setSetorAtivoId] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos | pendencias | a-conferir | conferidos
  const [conferindoId, setConferindoId] = useState(null)
  const [conferindoTodos, setConferindoTodos] = useState(false)
  const [recolhidos, setRecolhidos] = useState(() => new Set())
  const [pendenciaEmEdicao, setPendenciaEmEdicao] = useState({})
  const [salvandoPendenciaId, setSalvandoPendenciaId] = useState(null)

  const setorAtivo = setoresVisiveis.find((s) => s.id === setorAtivoId) || setoresVisiveis[0]
  const leitosDoSetor = setorAtivo
    ? leitos.filter((l) => l.setor_id === setorAtivo.id).sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10) || a.numero.localeCompare(b.numero))
    : []
  const leitosComPaciente = leitosDoSetor.filter((l) => pacientesPorLeito[l.id])

  function passagemDoLeito(leito) {
    const paciente = pacientesPorLeito[leito.id]
    return paciente ? passagemPorPaciente[paciente.id] : null
  }

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
    await marcarPassagemConferida({
      passagemId: passagem.id,
      enfermeiroId,
      conferido: !passagem.conferido_em,
    })
    await onRecarregar?.()
    setConferindoId(null)
  }

  async function conferirTodos() {
    const pendentes = leitosFiltrados
      .map((l) => passagemDoLeito(l))
      .filter((p) => p && !p.conferido_em)
    if (pendentes.length === 0) return
    setConferindoTodos(true)
    await Promise.all(
      pendentes.map((p) => marcarPassagemConferida({ passagemId: p.id, enfermeiroId, conferido: true }))
    )
    await onRecarregar?.()
    setConferindoTodos(false)
  }

  function toggleRecolhido(leitoId) {
    setRecolhidos((prev) => {
      const novo = new Set(prev)
      if (novo.has(leitoId)) novo.delete(leitoId); else novo.add(leitoId)
      return novo
    })
  }

  function recolherTodos() {
    setRecolhidos(new Set(leitosFiltrados.map((l) => l.id)))
  }

  function expandirTodos() {
    setRecolhidos(new Set())
  }

  function textoPendencia(passagem) {
    if (passagem?.id in pendenciaEmEdicao) return pendenciaEmEdicao[passagem.id]
    return passagem?.pendencias || ''
  }

  function editarPendencia(passagemId, texto) {
    setPendenciaEmEdicao((prev) => ({ ...prev, [passagemId]: texto }))
  }

  function adicionarChipPendencia(passagem, chip) {
    const atual = textoPendencia(passagem)
    const separador = atual.trim() ? ' · ' : ''
    editarPendencia(passagem.id, atual + separador + chip)
  }

  async function salvarPendencia(passagem) {
    const texto = textoPendencia(passagem)
    setSalvandoPendenciaId(passagem.id)
    await atualizarPendenciasPassagem(passagem.id, texto.trim())
    setPendenciaEmEdicao((prev) => {
      const { [passagem.id]: _omit, ...resto } = prev
      return resto
    })
    await onRecarregar?.()
    setSalvandoPendenciaId(null)
  }

  return (
    <div className="pc-page">
      <div className="sector-control-card">
        <div className="scc-top">
          <div className="sector-nav-pills">
            {setoresVisiveis.map((s) => {
              const leitosSetor = leitos.filter((l) => l.setor_id === s.id)
              const ocupados = leitosSetor.filter((l) => pacientesPorLeito[l.id]).length
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`sec-pill ${setorAtivo?.id === s.id ? 'active' : ''}`}
                  onClick={() => setSetorAtivoId(s.id)}
                >
                  <span>{s.nome}</span>
                  <span className="badge-count">{ocupados}/{leitosSetor.length}</span>
                </button>
              )
            })}
          </div>

          <div className="scc-actions">
            <button type="button" className="btn-compact-tool" onClick={recolhidos.size > 0 ? expandirTodos : recolherTodos}>
              <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} />
              {recolhidos.size > 0 ? 'Expandir Todos' : 'Recolher Todos'}
            </button>
            <button
              type="button"
              className="btn-compact-tool"
              onClick={conferirTodos}
              disabled={conferindoTodos || contagens['a-conferir'] === 0}
            >
              <i className="ph ph-check-square" /> {conferindoTodos ? 'Conferindo...' : 'Conferir Todos'}
            </button>
          </div>
        </div>

        <div className="scc-meta">
          <div className="team-flow">
            {plantao?.turno && <span>Turno: <strong>{plantao.turno}</strong></span>}
            {enfermeiroNome && (
              <>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span>Enfermeiro(a): <strong>{enfermeiroNome}</strong></span>
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
        <div className="beds-container">
          {leitosFiltrados.length === 0 ? (
            <p className="beds-container-vazio">Nenhum leito nesse filtro.</p>
          ) : (
            leitosFiltrados.map((leito) => {
              const paciente = pacientesPorLeito[leito.id]
              const passagem = passagemPorPaciente[paciente.id]
              const conferido = !!passagem?.conferido_em
              const recolhido = recolhidos.has(leito.id)
              const sv = sinaisVitaisPorPaciente?.[paciente.id]
              const balanco = balancoPorPaciente?.[paciente.id]
              const saldo = balanco ? balanco.entradas - balanco.saidas : null
              const pendenciaAtual = textoPendencia(passagem)
              const pendenciaAlterada = passagem && pendenciaEmEdicao[passagem.id] !== undefined && pendenciaEmEdicao[passagem.id] !== (passagem.pendencias || '')
              const temAlergia = !!paciente.alergias

              return (
                <article
                  key={leito.id}
                  className={`bed-card ${conferido ? 'checked' : ''} ${temAlergia ? 'has-alert' : ''} ${recolhido ? 'collapsed' : ''}`}
                >
                  <div className="bc-header">
                    <div className="bc-header-left">
                      <button type="button" className="btn-toggle-bed" onClick={() => toggleRecolhido(leito.id)} title="Recolher/Expandir leito">
                        <i className="ph ph-caret-down" />
                      </button>
                      <span className="bed-tag">Leito {leito.numero}</span>
                      <span className="patient-title" onClick={() => toggleRecolhido(leito.id)}>
                        {paciente.nome}{paciente.idade ? `, ${paciente.idade}a` : ''}
                      </span>
                      {paciente.numero_atendimento && (
                        <span className="patient-meta-text">Reg: {paciente.numero_atendimento}</span>
                      )}
                      <span className="patient-hd-text"><strong>HD:</strong> {paciente.diagnostico || 'Sem diagnóstico registrado'}</span>
                      {temAlergia && (
                        <span className="tag-alergia">
                          <i className="ph ph-prohibit" /> Alergia{paciente.alergia_substancia ? `: ${paciente.alergia_substancia}` : ''}
                        </span>
                      )}
                      <div className="collapsed-summary">
                        {sv && <span>PA {sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'} · SpO₂ {sv.spo2 ?? '—'}%</span>}
                        {balanco && <span>BH {saldo >= 0 ? '+' : '−'}{Math.abs(saldo)} mL</span>}
                        {pendenciaAtual.trim() && <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Com pendência</span>}
                      </div>
                    </div>
                    <div className="bc-header-right">
                      <button
                        type="button"
                        className={`btn-status-toggle ${conferido ? 'active' : ''}`}
                        onClick={() => toggleConferido(passagem)}
                        disabled={!passagem || conferindoId === passagem?.id}
                      >
                        <i className={`ph ${conferido ? 'ph-check' : 'ph-check-square'}`} /> {conferido ? 'Conferido' : 'Conferir'}
                      </button>
                      <button type="button" className="btn-view-patient" onClick={() => onEditarPassagem(paciente, leito)}>
                        <i className="ph ph-note-pencil" /> Editar
                      </button>
                      <button type="button" className="btn-view-patient" onClick={() => onAbrirPassagem(paciente, leito)}>
                        <i className="ph ph-magnifying-glass" /> Prontuários
                      </button>
                    </div>
                  </div>

                  <div className="bc-content">
                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-heartbeat" /> Sinais Vitais{sv ? ` (${new Date(sv.registrado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})` : ''}</div>
                      {sv ? (
                        <div className="vitals-row">
                          <div className="v-cell"><span className="lbl">PA</span><span className="val">{sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'}</span></div>
                          <div className="v-cell"><span className="lbl">FC</span><span className="val">{sv.fc ?? '—'}</span></div>
                          <div className="v-cell"><span className="lbl">SpO₂</span><span className="val">{sv.spo2 ?? '—'}%</span></div>
                          <div className="v-cell"><span className="lbl">Temp</span><span className="val">{sv.temperatura ?? '—'}</span></div>
                        </div>
                      ) : (
                        <p className="col-vazio">Nenhum registro ainda.</p>
                      )}
                    </div>

                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-needle" /> Dispositivos & Cuidados</div>
                      {passagem?.dispositivos?.length > 0 || passagem?.dispositivos_detalhe ? (
                        <ul className="device-text">
                          {(passagem.dispositivos || []).map((d) => <li key={d}><i className="ph ph-check" /> {d}</li>)}
                          {passagem.dispositivos_detalhe && <li><i className="ph ph-check" /> {passagem.dispositivos_detalhe}</li>}
                        </ul>
                      ) : (
                        <p className="col-vazio">Nenhum dispositivo registrado.</p>
                      )}
                    </div>

                    <div className="col-block">
                      <div className="col-title"><i className="ph ph-drop" /> Balanço Hídrico</div>
                      {balanco ? (
                        <div className="balance-summary">
                          <div>Ingesta: <strong>{balanco.entradas} mL</strong> · Diurese: <strong>{balanco.saidas} mL</strong></div>
                          <span className={`bal-tag ${saldo < 0 ? 'negativo' : ''}`}>Balanço: {saldo >= 0 ? '+' : '−'}{Math.abs(saldo)} mL</span>
                        </div>
                      ) : (
                        <p className="col-vazio">Nenhum lançamento ainda.</p>
                      )}
                    </div>

                    <div className="col-block col-block-pending">
                      <div className="col-title"><i className="ph ph-warning-circle" /> Pendências para o Próximo Turno</div>
                      <textarea
                        className="pending-input"
                        value={pendenciaAtual}
                        onChange={(e) => editarPendencia(passagem.id, e.target.value)}
                        placeholder="O que o próximo turno precisa saber..."
                      />
                      <div className="quick-chips">
                        {CHIPS_PENDENCIA_RAPIDA.map((chip) => (
                          <span key={chip} className="q-chip" onClick={() => adicionarChipPendencia(passagem, chip)}>+ {chip}</span>
                        ))}
                      </div>
                      {pendenciaAlterada && (
                        <button
                          type="button"
                          className="btn-salvar-pendencia"
                          onClick={() => salvarPendencia(passagem)}
                          disabled={salvandoPendenciaId === passagem.id}
                        >
                          <i className="ph ph-floppy-disk" /> {salvandoPendenciaId === passagem.id ? 'Salvando...' : 'Salvar pendência'}
                        </button>
                      )}
                    </div>
                  </div>

                  {!recolhido && <IndicadoresClinicos passagem={passagem} />}
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
