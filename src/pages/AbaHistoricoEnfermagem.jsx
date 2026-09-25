import { useEffect, useState } from 'react'
import { buscarHistoricoEnfermagem, salvarHistoricoEnfermagem } from '../lib/pepMedico'
import { listarEscalas, listarDispositivos, listarAlergias } from '../lib/pepClinico'
import { EXAME_FISICO_CONFIG, INFO_COMPLEMENTARES_CAMPOS, COLETA_DADOS_OPCOES } from './historicoEnfermagemConfig'

const SECOES = [
  { chave: 'coleta', titulo: 'Coleta de Dados', icon: 'ph-user-circle' },
  { chave: 'alergia', titulo: 'Alergia', icon: 'ph-shield-warning' },
  { chave: 'complementares', titulo: 'Informações Complementares', icon: 'ph-info' },
  { chave: 'medicamentos', titulo: 'Medicamento em Uso', icon: 'ph-pill' },
  { chave: 'exame', titulo: 'Exame Físico', icon: 'ph-activity' },
  { chave: 'parecer', titulo: 'Parecer do Enfermeiro', icon: 'ph-user-check' },
]

// ===================== Admissão de Enfermagem (Histórico de Enfermagem) =====================
// Pertence ao pilar "Prontuário de Enfermagem" (FichaClinica.jsx) — não ao
// Prontuário Médico. Fiel ao modelo "HISTÓRICO DE ENFERMAGEM" (renomeado
// na tela) — dezenas de grupos de marcação por sistema do exame físico,
// com checkboxes reais (não toggle) e campo de resposta condicional
// (só aparece quando a marcação "Sim"/"Com anormalidades" é selecionada).
const MEDICAMENTO_USO_VAZIO = { nome: '', via: '', dose: '', tempo_uso: '' }

const HISTORICO_ENFERMAGEM_VAZIO = {
  coleta_dados: [], alergia: false, alergia_quais: '', motivo_hospitalizacao: '',
  info_complementares: {}, outros_info: '',
  medicamentos_uso: [{ ...MEDICAMENTO_USO_VAZIO }],
  exame_fisico: {},
  parecer_estado_emocional: '', parecer_estado_cognitivo: '', parecer_obs: '',
}

// Label de checkbox: flex-shrink 0 + whiteSpace nowrap evitam que o texto
// quebre em várias linhas dentro do flex-wrap do grupo — quando isso
// acontecia, o alinhamento vertical do quadradinho variava de opção para
// opção na mesma linha (label de 1 linha vs. label de 3 linhas).
const rotuloCheckboxStyle = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', flex: '0 0 auto', whiteSpace: 'nowrap' }
const checkboxInputStyle = { width: 16, height: 16, flexShrink: 0 }

function ChipMultiEscolha({ opcoes, valor, onChange }) {
  const selecionados = valor || []
  function toggle(op) {
    onChange(selecionados.includes(op) ? selecionados.filter((o) => o !== op) : [...selecionados, op])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 8 }}>
      {opcoes.map((op) => (
        <label key={op} style={rotuloCheckboxStyle}>
          <input type="checkbox" checked={selecionados.includes(op)} onChange={() => toggle(op)} style={checkboxInputStyle} />
          {op}
        </label>
      ))}
    </div>
  )
}

function CheckboxUnica({ opcoes, valor, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 8 }}>
      {opcoes.map((op) => (
        <label key={op} style={rotuloCheckboxStyle}>
          <input type="checkbox" checked={valor === op} onChange={() => onChange(valor === op ? '' : op)} style={checkboxInputStyle} />
          {op}
        </label>
      ))}
    </div>
  )
}

function CheckboxSimNao({ valor, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 8 }}>
      <label style={rotuloCheckboxStyle}>
        <input type="checkbox" checked={!!valor} onChange={() => onChange(true)} style={checkboxInputStyle} /> Sim
      </label>
      <label style={rotuloCheckboxStyle}>
        <input type="checkbox" checked={!valor} onChange={() => onChange(false)} style={checkboxInputStyle} /> Não
      </label>
    </div>
  )
}

function CampoExameFisico({ campo, valor, onChange }) {
  const v = valor || { opcoes: [], extra: {} }
  const opcoesSelecionadas = v.opcoes || []
  function setOpcoes(opcoes) { onChange({ ...v, opcoes }) }
  function setExtra(key, texto) { onChange({ ...v, extra: { ...v.extra, [key]: texto } }) }
  return (
    <div style={{ marginBottom: 10 }}>
      {campo.label && <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{campo.label}</div>}
      {campo.opcoes.length > 0 && <ChipMultiEscolha opcoes={campo.opcoes} valor={v.opcoes} onChange={setOpcoes} />}
      {(campo.extras || [])
        .filter((ex) => {
          if (!ex.somenteSe) return true
          if (Array.isArray(ex.somenteSe)) {
            return ex.somenteSe.some((s) => opcoesSelecionadas.includes(s))
          }
          return opcoesSelecionadas.includes(ex.somenteSe)
        })
        .map((ex) => (
          <div key={ex.key} style={{ marginTop: 6 }}>
            <input type="text" placeholder={ex.label} value={v.extra?.[ex.key] || ''} onChange={(e) => setExtra(ex.key, e.target.value)} style={{ width: '100%' }} />
          </div>
        ))}
    </div>
  )
}

function SecaoColapsavel({ secao, aberta, onToggle, children }) {
  return (
    <div className="form-section-box">
      <div
        className="form-section-box-title"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <span><i className={`ph ${secao.icon}`} /> {secao.titulo}</span>
        <i className={`ph ph-caret-${aberta ? 'up' : 'down'}`} />
      </div>
      {aberta && children}
    </div>
  )
}

export default function AbaHistoricoEnfermagem({ atendimento, medicoId, onImprimir }) {
  const [dados, setDados] = useState(HISTORICO_ENFERMAGEM_VAZIO)
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [filtroSecao, setFiltroSecao] = useState('todas')
  const [secoesAbertas, setSecoesAbertas] = useState(() => new Set(SECOES.map((s) => s.chave)))
  const [escalas, setEscalas] = useState([])
  const [dispositivos, setDispositivos] = useState([])
  const [alergiasCadastradas, setAlergiasCadastradas] = useState([])

  function secaoVisivel(chave) { return filtroSecao === 'todas' || filtroSecao === chave }
  function secaoAberta(chave) { return filtroSecao === chave || secoesAbertas.has(chave) }
  function toggleSecao(chave) {
    setSecoesAbertas((prev) => {
      const novo = new Set(prev)
      if (novo.has(chave)) novo.delete(chave); else novo.add(chave)
      return novo
    })
  }
  function expandirTodas() { setSecoesAbertas(new Set(SECOES.map((s) => s.chave))) }
  function recolherTodas() { setSecoesAbertas(new Set()) }

  useEffect(() => {
    buscarHistoricoEnfermagem(atendimento.atendimento_id).then((h) => {
      if (h) {
        setDados({
          coleta_dados: h.coleta_dados || [], alergia: h.alergia || false, alergia_quais: h.alergia_quais || '',
          motivo_hospitalizacao: h.motivo_hospitalizacao || '',
          info_complementares: h.info_complementares || {}, outros_info: h.outros_info || '',
          medicamentos_uso: h.medicamentos_uso?.length ? h.medicamentos_uso : [{ ...MEDICAMENTO_USO_VAZIO }],
          exame_fisico: h.exame_fisico || {},
          parecer_estado_emocional: h.parecer_estado_emocional || '', parecer_estado_cognitivo: h.parecer_estado_cognitivo || '', parecer_obs: h.parecer_obs || '',
        })
        setSalvo(h)
      }
      setCarregando(false)
    })
    listarEscalas(atendimento.atendimento_id).then(setEscalas)
    listarDispositivos(atendimento.atendimento_id).then(setDispositivos)
    if (atendimento.pessoa_id) listarAlergias(atendimento.pessoa_id).then(setAlergiasCadastradas)
  }, [atendimento.atendimento_id])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function setInfoComplementar(key, campo, valor) {
    setDados((prev) => ({ ...prev, info_complementares: { ...prev.info_complementares, [key]: { ...prev.info_complementares[key], [campo]: valor } } }))
  }
  function setExameFisico(campoId, valor) {
    setDados((prev) => ({ ...prev, exame_fisico: { ...prev.exame_fisico, [campoId]: valor } }))
  }
  function setMedicamento(i, campo, valor) {
    setDados((prev) => ({ ...prev, medicamentos_uso: prev.medicamentos_uso.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)) }))
  }
  function adicionarMedicamento() { setDados((prev) => ({ ...prev, medicamentos_uso: [...prev.medicamentos_uso, { ...MEDICAMENTO_USO_VAZIO }] })) }
  function removerMedicamento(i) { setDados((prev) => ({ ...prev, medicamentos_uso: prev.medicamentos_uso.filter((_, idx) => idx !== i) })) }

  async function salvar() {
    setSalvando(true)
    const { data } = await salvarHistoricoEnfermagem({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        coleta_dados: dados.coleta_dados, alergia: dados.alergia, alergia_quais: dados.alergia ? (dados.alergia_quais || null) : null,
        motivo_hospitalizacao: dados.motivo_hospitalizacao || null,
        info_complementares: dados.info_complementares, outros_info: dados.outros_info || null,
        medicamentos_uso: dados.medicamentos_uso.filter((m) => m.nome.trim()),
        exame_fisico: dados.exame_fisico,
        parecer_estado_emocional: dados.parecer_estado_emocional || null,
        parecer_estado_cognitivo: dados.parecer_estado_cognitivo || null,
        parecer_obs: dados.parecer_obs || null,
      },
    })
    setSalvando(false)
    setSucesso(true)
    setSalvo(data)
  }

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-split">
      <aside className="timeline-pane">
        <div className="pane-header">
          <span><i className="ph ph-sidebar" /> Painel de Apoio</span>
        </div>
        <div className="timeline-list">
          <div style={{ padding: '10px 12px', fontSize: 11.5 }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ph ph-warning" /> Alergias
            </div>
            {alergiasCadastradas.length === 0 ? (
              <p style={{ color: '#94A3B8', marginBottom: 14 }}>Nenhuma registrada.</p>
            ) : (
              <div style={{ marginBottom: 14 }}>
                {alergiasCadastradas.map((a) => (
                  <div key={a.id} style={{ marginBottom: 6 }}>
                    <strong>{a.substancia}</strong> — {a.gravidade}
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ph ph-gauge" /> Escalas de Risco
            </div>
            {escalas.length === 0 ? (
              <p style={{ color: '#94A3B8', marginBottom: 14 }}>Nenhuma registrada.</p>
            ) : (
              <div style={{ marginBottom: 14 }}>
                {escalas.map((e) => (
                  <div key={e.id} style={{ marginBottom: 6 }}>
                    <strong>{e.tipo}</strong>: {e.pontuacao} ({e.nivel_risco})
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ph ph-syringe" /> Dispositivos Invasivos
            </div>
            {dispositivos.length === 0 ? (
              <p style={{ color: '#94A3B8' }}>Nenhum registrado.</p>
            ) : (
              dispositivos.map((d) => (
                <div key={d.id} style={{ marginBottom: 6 }}>
                  <strong>{d.tipo}</strong>{d.local_insercao ? ` — ${d.local_insercao}` : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-clipboard-text" /> Admissão de Enfermagem</h2>
            <p>Instrumento de sistematização SAE baseado no modelo oficial da UPA 24h Breves.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-add-chip" onClick={expandirTodas}>
              <i className="ph ph-arrows-out" /> Expandir todas
            </button>
            <button type="button" className="btn-add-chip" onClick={recolherTodas}>
              <i className="ph ph-arrows-in" /> Recolher todas
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 20px 0' }}>
          <button type="button" className={`btn-add-chip ${filtroSecao === 'todas' ? 'on' : ''}`} onClick={() => setFiltroSecao('todas')}>
            <i className="ph ph-list-dashes" /> Todas as seções
          </button>
          {SECOES.map((s) => (
            <button key={s.chave} type="button" className={`btn-add-chip ${filtroSecao === s.chave ? 'on' : ''}`} onClick={() => setFiltroSecao(s.chave)}>
              <i className={`ph ${s.icon}`} /> {s.titulo}
            </button>
          ))}
        </div>

        <div className="cc-body">
          {secaoVisivel('coleta') && (
            <SecaoColapsavel secao={SECOES[0]} aberta={secaoAberta('coleta')} onToggle={() => toggleSecao('coleta')}>
              <ChipMultiEscolha opcoes={COLETA_DADOS_OPCOES.map((o) => o.label)} valor={dados.coleta_dados} onChange={(v) => set('coleta_dados', v)} />
            </SecaoColapsavel>
          )}

          {secaoVisivel('alergia') && (
            <SecaoColapsavel secao={SECOES[1]} aberta={secaoAberta('alergia')} onToggle={() => toggleSecao('alergia')}>
              <div style={{ marginBottom: 6 }}><CheckboxSimNao valor={dados.alergia} onChange={(v) => set('alergia', v)} /></div>
              {dados.alergia && (
                <div className="form-group">
                  <label>Quais?</label>
                  <input type="text" value={dados.alergia_quais} onChange={(e) => set('alergia_quais', e.target.value)} />
                </div>
              )}
            </SecaoColapsavel>
          )}

          {secaoVisivel('coleta') && (
            <div className="form-group">
              <label><i className="ph ph-clipboard-text" /> Motivo de Hospitalização / Queixa Principal</label>
              <textarea value={dados.motivo_hospitalizacao} onChange={(e) => set('motivo_hospitalizacao', e.target.value)} />
            </div>
          )}

          {secaoVisivel('complementares') && (
            <SecaoColapsavel secao={SECOES[2]} aberta={secaoAberta('complementares')} onToggle={() => toggleSecao('complementares')}>
              {INFO_COMPLEMENTARES_CAMPOS.map((c) => {
                const v = dados.info_complementares[c.key] || {}
                return (
                  <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, minWidth: 160 }}>{c.label}</span>
                    <CheckboxSimNao valor={v.sim} onChange={(val) => setInfoComplementar(c.key, 'sim', val)} />
                    {v.sim && <input type="text" placeholder="Especificar" value={v.especificar || ''} onChange={(e) => setInfoComplementar(c.key, 'especificar', e.target.value)} style={{ flex: 1, minWidth: 160 }} />}
                  </div>
                )
              })}
              <div className="form-group" style={{ marginTop: 8 }}>
                <label>Outros</label>
                <input type="text" value={dados.outros_info} onChange={(e) => set('outros_info', e.target.value)} />
              </div>
            </SecaoColapsavel>
          )}

          {secaoVisivel('medicamentos') && (
            <SecaoColapsavel secao={SECOES[3]} aberta={secaoAberta('medicamentos')} onToggle={() => toggleSecao('medicamentos')}>
              {dados.medicamentos_uso.map((m, i) => (
                <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div className="assess-grid">
                    <div className="form-group"><label>Nome</label><input type="text" value={m.nome} onChange={(e) => setMedicamento(i, 'nome', e.target.value)} /></div>
                    <div className="form-group"><label>Via</label><input type="text" value={m.via} onChange={(e) => setMedicamento(i, 'via', e.target.value)} /></div>
                  </div>
                  <div className="assess-grid" style={{ marginTop: 12 }}>
                    <div className="form-group"><label>Dose</label><input type="text" value={m.dose} onChange={(e) => setMedicamento(i, 'dose', e.target.value)} /></div>
                    <div className="form-group"><label>Tempo de Uso</label><input type="text" value={m.tempo_uso} onChange={(e) => setMedicamento(i, 'tempo_uso', e.target.value)} /></div>
                  </div>
                  {dados.medicamentos_uso.length > 1 && (
                    <button type="button" className="btn-cancel" style={{ marginTop: 8 }} onClick={() => removerMedicamento(i)}>
                      <i className="ph ph-trash" /> Remover
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-chip" onClick={adicionarMedicamento}>
                <i className="ph ph-plus" /> Adicionar medicamento
              </button>
            </SecaoColapsavel>
          )}

          {secaoVisivel('exame') && (
            <SecaoColapsavel secao={SECOES[4]} aberta={secaoAberta('exame')} onToggle={() => toggleSecao('exame')}>
              {EXAME_FISICO_CONFIG.map((secao) => (
                <div key={secao.secao} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>{secao.secaoTitulo}</div>
                  {secao.campos.map((campo) => (
                    <CampoExameFisico key={campo.id} campo={campo} valor={dados.exame_fisico[campo.id]} onChange={(v) => setExameFisico(campo.id, v)} />
                  ))}
                </div>
              ))}
            </SecaoColapsavel>
          )}

          {secaoVisivel('parecer') && (
            <SecaoColapsavel secao={SECOES[5]} aberta={secaoAberta('parecer')} onToggle={() => toggleSecao('parecer')}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Estado emocional</div>
                <CheckboxUnica opcoes={['Calmo', 'Tenso', 'Agressivo', 'Preocupado']} valor={dados.parecer_estado_emocional} onChange={(v) => set('parecer_estado_emocional', v)} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Estado cognitivo</div>
                <CheckboxUnica opcoes={['Capaz de atender às solicitações', 'Capaz de apreender às orientações', 'Deficiência cognitiva']} valor={dados.parecer_estado_cognitivo} onChange={(v) => set('parecer_estado_cognitivo', v)} />
              </div>
              <div className="form-group">
                <label>Obs.</label>
                <input type="text" value={dados.parecer_obs} onChange={(e) => set('parecer_obs', e.target.value)} />
              </div>
            </SecaoColapsavel>
          )}

          {sucesso && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-check-circle" /> Admissão de enfermagem salva.
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <span />
          <div style={{ display: 'flex', gap: 12 }}>
            {salvo && (
              <button type="button" className="btn-save-draft" onClick={() => onImprimir({ ...salvo, _variante: 'fiel' })}>
                <i className="ph ph-printer" /> Imprimir (modelo oficial)
              </button>
            )}
            {salvo && (
              <button type="button" className="btn-save-draft" onClick={() => onImprimir({ ...salvo, _variante: 'projeto' })}>
                <i className="ph ph-printer" /> Imprimir (layout do projeto)
              </button>
            )}
            <button className="btn-save-print" onClick={salvar} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
