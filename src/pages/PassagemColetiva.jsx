import { useState } from 'react'
import { marcarPassagemConferida, atualizarPendenciasPassagem } from '../lib/pepAtendimentos'
import IndicadoresClinicos from '../components/IndicadoresClinicos'
import './PassagemColetiva.css'

// Segunda versão da "Passagem de Plantão Coletiva" (mockups-fase2/
// 12-passagem-plantao-design.html) — grade por setor com status de
// conferência por leito. Recebe os dados já carregados pelo Painel (mesmo
// padrão de PainelCards/PainelTabela), sem duplicar busca. "Conferido" é só
// um carimbo de revisão (quem/quando), reversível, não altera nenhum campo
// clínico da passagem.
//
// Deliberadamente fora desta versão (ver PLANO_ACAO_FASE2.md): botão
// "Sincronizar Sinais & Balanço" (o refresh geral da tela já recarrega isso),
// modo tabela/foco, painel lateral com histórico de plantões.
const CHIPS_PENDENCIA_RAPIDA = [
  'Reavaliar sinais vitais',
  'Comunicar médico se alteração',
  'Aguarda resultado de exame',
  'Trocar curativo',
]

export default function PassagemColetiva({
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
    <div>
      <div className="pc-sector-pills">
        {setoresVisiveis.map((s) => {
          const qtd = leitos.filter((l) => l.setor_id === s.id && pacientesPorLeito[l.id]).length
          return (
            <button
              key={s.id}
              type="button"
              className={`pc-pill ${setorAtivo?.id === s.id ? 'active' : ''}`}
              onClick={() => setSetorAtivoId(s.id)}
            >
              {s.nome} <span className="pc-pill-count">{qtd}</span>
            </button>
          )
        })}
      </div>

      <div className="pc-toolbar">
        <div className="pc-filter-chips">
          <button type="button" className={`pc-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
          <button type="button" className={`pc-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com pendências ({contagens.pendencias})</button>
          <button type="button" className={`pc-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A conferir ({contagens['a-conferir']})</button>
          <button type="button" className={`pc-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
        </div>
        <div className="pc-toolbar-actions">
          <button type="button" className="btn-compact-tool" onClick={recolhidos.size > 0 ? expandirTodos : recolherTodos}>
            <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} />
            {recolhidos.size > 0 ? 'Expandir Todos' : 'Recolher Todos'}
          </button>
        </div>
      </div>

      {leitosFiltrados.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)', marginTop: 24 }}>Nenhum leito nesse filtro.</p>
      ) : (
        <div className="pc-list">
          {leitosFiltrados.map((leito) => {
            const paciente = pacientesPorLeito[leito.id]
            const passagem = passagemPorPaciente[paciente.id]
            const conferido = !!passagem?.conferido_em
            const recolhido = recolhidos.has(leito.id)
            const sv = sinaisVitaisPorPaciente?.[paciente.id]
            const balanco = balancoPorPaciente?.[paciente.id]
            const saldo = balanco ? balanco.entradas - balanco.saidas : null
            const pendenciaAtual = textoPendencia(passagem)
            const pendenciaAlterada = passagem && pendenciaEmEdicao[passagem.id] !== undefined && pendenciaEmEdicao[passagem.id] !== (passagem.pendencias || '')

            return (
              <article key={leito.id} className={`pc-card ${conferido ? 'conferido' : ''}`}>
                <div className="pc-card-header">
                  <div className="pc-header-left">
                    <button type="button" className="pc-btn-toggle" onClick={() => toggleRecolhido(leito.id)} title="Recolher/Expandir leito">
                      <i className={`ph ph-caret-${recolhido ? 'right' : 'down'}`} />
                    </button>
                    <span className="pc-leito-numero"><i className="ph ph-bed" /> Leito {leito.numero}</span>
                    <span className="pc-paciente-nome">
                      {paciente.nome}{paciente.idade ? `, ${paciente.idade}a` : ''}
                    </span>
                    {paciente.alergias && (
                      <span className="pc-badge-alerta">
                        <i className="ph ph-prohibit" /> Alergia{paciente.alergia_substancia ? `: ${paciente.alergia_substancia}` : ''}
                      </span>
                    )}
                    {recolhido && (
                      <span className="pc-paciente-hd-inline"><strong>HD:</strong> {paciente.diagnostico || 'Sem diagnóstico registrado'}</span>
                    )}
                  </div>
                  <div className="pc-header-right">
                    <button
                      type="button"
                      className={`pc-btn-conferir ${conferido ? 'on' : ''}`}
                      onClick={() => toggleConferido(passagem)}
                      disabled={!passagem || conferindoId === passagem?.id}
                    >
                      <i className={`ph ${conferido ? 'ph-arrow-counter-clockwise' : 'ph-check-square'}`} />
                      {conferido ? 'Desmarcar' : 'Conferir'}
                    </button>
                    <button type="button" className="pc-btn-detalhes" onClick={() => onEditarPassagem(paciente, leito)}>
                      <i className="ph ph-note-pencil" /> Editar Passagem
                    </button>
                    <button type="button" className="pc-btn-detalhes" onClick={() => onAbrirPassagem(paciente, leito)}>
                      <i className="ph ph-magnifying-glass" /> Prontuários
                    </button>
                  </div>
                </div>

                {!recolhido && (
                  <div className="pc-card-body">
                    <div className="pc-paciente-meta">
                      {paciente.numero_atendimento ? `Reg: ${paciente.numero_atendimento} · ` : ''}
                      {paciente.idade ? `${paciente.idade} anos` : null}
                      {paciente.idade && paciente.sexo ? ' · ' : null}
                      {paciente.sexo === 'F' ? 'Feminino' : paciente.sexo === 'M' ? 'Masculino' : null}
                    </div>
                    <div className="pc-paciente-hd"><strong>HD:</strong> {paciente.diagnostico || 'Sem diagnóstico registrado'}</div>

                    <div className="pc-content">
                      <div className="pc-col">
                        <div className="pc-col-title"><i className="ph ph-heartbeat" /> Sinais Vitais{sv ? ` (${new Date(sv.registrado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})` : ''}</div>
                        {sv ? (
                          <div className="pc-vitals-row">
                            <div className="pc-v-cell"><span className="lbl">PA</span><span className="val">{sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'}</span></div>
                            <div className="pc-v-cell"><span className="lbl">FC</span><span className="val">{sv.fc ?? '—'}</span></div>
                            <div className="pc-v-cell"><span className="lbl">SpO₂</span><span className="val">{sv.spo2 ?? '—'}%</span></div>
                            <div className="pc-v-cell"><span className="lbl">Temp</span><span className="val">{sv.temperatura ?? '—'}</span></div>
                          </div>
                        ) : (
                          <p className="pc-col-vazio">Nenhum registro ainda.</p>
                        )}
                      </div>

                      <div className="pc-col">
                        <div className="pc-col-title"><i className="ph ph-needle" /> Dispositivos & Cuidados</div>
                        {passagem?.dispositivos?.length > 0 || passagem?.dispositivos_detalhe ? (
                          <ul className="pc-device-list">
                            {(passagem.dispositivos || []).map((d) => <li key={d}><i className="ph ph-check" /> {d}</li>)}
                            {passagem.dispositivos_detalhe && <li><i className="ph ph-check" /> {passagem.dispositivos_detalhe}</li>}
                          </ul>
                        ) : (
                          <p className="pc-col-vazio">Nenhum dispositivo registrado.</p>
                        )}
                      </div>

                      <div className="pc-col">
                        <div className="pc-col-title"><i className="ph ph-drop" /> Balanço Hídrico</div>
                        {balanco ? (
                          <span className={`pc-balanco-tag ${saldo >= 0 ? 'positivo' : 'negativo'}`}>
                            Balanço: {saldo >= 0 ? '+' : '−'}{Math.abs(saldo)} mL
                          </span>
                        ) : (
                          <p className="pc-col-vazio">Nenhum lançamento ainda.</p>
                        )}
                      </div>

                      <div className="pc-col pc-col-pendencia">
                        <div className="pc-col-title"><i className="ph ph-warning-circle" /> Pendências para o Próximo Turno</div>
                        <textarea
                          className="pc-pending-input"
                          value={pendenciaAtual}
                          onChange={(e) => editarPendencia(passagem.id, e.target.value)}
                          placeholder="O que o próximo turno precisa saber..."
                        />
                        <div className="pc-quick-chips">
                          {CHIPS_PENDENCIA_RAPIDA.map((chip) => (
                            <span key={chip} className="pc-q-chip" onClick={() => adicionarChipPendencia(passagem, chip)}>+ {chip}</span>
                          ))}
                        </div>
                        {pendenciaAlterada && (
                          <button
                            type="button"
                            className="btn-add-chip"
                            style={{ marginTop: 6 }}
                            onClick={() => salvarPendencia(passagem)}
                            disabled={salvandoPendenciaId === passagem.id}
                          >
                            <i className="ph ph-floppy-disk" /> {salvandoPendenciaId === passagem.id ? 'Salvando...' : 'Salvar pendência'}
                          </button>
                        )}
                      </div>
                    </div>

                    <IndicadoresClinicos passagem={passagem} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
