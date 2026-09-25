import { useState } from 'react'
import { marcarPassagemConferida } from '../lib/pepAtendimentos'
import IndicadoresClinicos from '../components/IndicadoresClinicos'
import './PassagemColetiva.css'

// Primeira versão real da "Passagem de Plantão Coletiva" (mockups-fase2/
// 12-passagem-plantao-design.html) — grade por setor com status de
// conferência por leito. Recebe os dados já carregados pelo Painel (mesmo
// padrão de PainelCards/PainelTabela), sem duplicar busca. "Conferido" é só
// um carimbo de revisão (quem/quando), reversível, não altera nenhum campo
// clínico da passagem.
//
// Deliberadamente fora desta primeira versão (ver PLANO_ACAO_FASE2.md):
// chips rápidos de pendência, botão "sincronizar sinais vitais", modo
// tabela/foco, painel lateral com histórico de plantões — cada um pede
// decisão própria antes de construir.
export default function PassagemColetiva({
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  enfermeiroId,
  onAbrirPassagem,
  onEditarPassagem,
  onRecarregar,
}) {
  const [setorAtivoId, setSetorAtivoId] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos | pendencias | a-conferir | conferidos
  const [conferindoId, setConferindoId] = useState(null)

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

      <div className="pc-filter-chips">
        <button type="button" className={`pc-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
        <button type="button" className={`pc-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com pendências ({contagens.pendencias})</button>
        <button type="button" className={`pc-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A conferir ({contagens['a-conferir']})</button>
        <button type="button" className={`pc-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
      </div>

      {leitosFiltrados.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)', marginTop: 24 }}>Nenhum leito nesse filtro.</p>
      ) : (
        <div className="pc-grid">
          {leitosFiltrados.map((leito) => {
            const paciente = pacientesPorLeito[leito.id]
            const passagem = passagemPorPaciente[paciente.id]
            const conferido = !!passagem?.conferido_em
            return (
              <div key={leito.id} className={`pc-card ${conferido ? 'conferido' : ''}`}>
                <div className="pc-card-header">
                  <span className="pc-leito-numero"><i className="ph ph-bed" /> Leito {leito.numero}</span>
                  <span className={`pc-status-badge ${conferido ? 'conferido' : 'a-conferir'}`}>
                    <i className={`ph ${conferido ? 'ph-check-circle' : 'ph-clock'}`} /> {conferido ? 'Conferido' : 'A conferir'}
                  </span>
                </div>
                <div className="pc-card-body">
                  <div className="pc-paciente-nome">
                    {paciente.nome}
                    {paciente.alergias && <span className="pc-badge-alerta"><i className="ph ph-warning" /> Alergia</span>}
                  </div>
                  <div className="pc-paciente-meta">
                    {paciente.idade ? `${paciente.idade} anos` : null}
                    {paciente.idade && paciente.sexo ? ' · ' : null}
                    {paciente.sexo === 'F' ? 'Feminino' : paciente.sexo === 'M' ? 'Masculino' : null}
                  </div>
                  <div className="pc-paciente-hd"><strong>HD:</strong> {paciente.diagnostico || 'Sem diagnóstico registrado'}</div>
                  <IndicadoresClinicos passagem={passagem} />
                  {passagem?.pendencias?.trim() && (
                    <div className="pc-pendencia"><i className="ph ph-list-checks" /> {passagem.pendencias}</div>
                  )}
                </div>
                <div className="pc-card-footer">
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
            )
          })}
        </div>
      )}
    </div>
  )
}
