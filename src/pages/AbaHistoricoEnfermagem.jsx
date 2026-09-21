import { useEffect, useState } from 'react'
import { buscarHistoricoEnfermagem, salvarHistoricoEnfermagem } from '../lib/pepMedico'
import { EXAME_FISICO_CONFIG, INFO_COMPLEMENTARES_CAMPOS, COLETA_DADOS_OPCOES } from './historicoEnfermagemConfig'

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
        .filter((ex) => !ex.somenteSe || opcoesSelecionadas.includes(ex.somenteSe))
        .map((ex) => (
          <div key={ex.key} style={{ marginTop: 6 }}>
            <input type="text" placeholder={ex.label} value={v.extra?.[ex.key] || ''} onChange={(e) => setExtra(ex.key, e.target.value)} style={{ width: '100%' }} />
          </div>
        ))}
    </div>
  )
}

export default function AbaHistoricoEnfermagem({ atendimento, medicoId, onImprimir }) {
  const [dados, setDados] = useState(HISTORICO_ENFERMAGEM_VAZIO)
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

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

  if (carregando) return <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>

  return (
    <div className="form-section">
      <div className="form-section-title">Admissão de Enfermagem</div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 8 }}>Coleta de dados</div>
      <ChipMultiEscolha opcoes={COLETA_DADOS_OPCOES.map((o) => o.label)} valor={dados.coleta_dados} onChange={(v) => set('coleta_dados', v)} />

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Alergia</div>
      <div style={{ marginBottom: 6 }}><CheckboxSimNao valor={dados.alergia} onChange={(v) => set('alergia', v)} /></div>
      {dados.alergia && <div className="form-field span-2"><label>Quais?</label><input type="text" value={dados.alergia_quais} onChange={(e) => set('alergia_quais', e.target.value)} /></div>}

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Motivo de Hospitalização / Queixa Principal</div>
      <textarea value={dados.motivo_hospitalizacao} onChange={(e) => set('motivo_hospitalizacao', e.target.value)} style={{ width: '100%' }} />

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Informações complementares</div>
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
      <div className="form-field span-3"><label>Outros</label><input type="text" value={dados.outros_info} onChange={(e) => set('outros_info', e.target.value)} /></div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Medicamento em uso</div>
      {dados.medicamentos_uso.map((m, i) => (
        <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div className="form-grid">
            <div className="form-field"><label>Nome</label><input type="text" value={m.nome} onChange={(e) => setMedicamento(i, 'nome', e.target.value)} /></div>
            <div className="form-field"><label>Via</label><input type="text" value={m.via} onChange={(e) => setMedicamento(i, 'via', e.target.value)} /></div>
            <div className="form-field"><label>Dose</label><input type="text" value={m.dose} onChange={(e) => setMedicamento(i, 'dose', e.target.value)} /></div>
            <div className="form-field"><label>Tempo de Uso</label><input type="text" value={m.tempo_uso} onChange={(e) => setMedicamento(i, 'tempo_uso', e.target.value)} /></div>
          </div>
          {dados.medicamentos_uso.length > 1 && <button type="button" className="modal-btn-secondary" onClick={() => removerMedicamento(i)}>Remover</button>}
        </div>
      ))}
      <button type="button" className="modal-btn-secondary" onClick={adicionarMedicamento}>+ Adicionar medicamento</button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Exame Físico</div>
      {EXAME_FISICO_CONFIG.map((secao) => (
        <div key={secao.secao} style={{ marginBottom: 18 }}>
          <div className="form-section-title" style={{ fontSize: 12 }}>{secao.secaoTitulo}</div>
          {secao.campos.map((campo) => (
            <CampoExameFisico key={campo.id} campo={campo} valor={dados.exame_fisico[campo.id]} onChange={(v) => setExameFisico(campo.id, v)} />
          ))}
        </div>
      ))}

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Parecer do Enfermeiro</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Estado emocional</div>
        <CheckboxUnica opcoes={['Calmo', 'Tenso', 'Agressivo', 'Preocupado']} valor={dados.parecer_estado_emocional} onChange={(v) => set('parecer_estado_emocional', v)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Estado cognitivo</div>
        <CheckboxUnica opcoes={['Capaz de atender às solicitações', 'Capaz de apreender às orientações', 'Deficiência cognitiva']} valor={dados.parecer_estado_cognitivo} onChange={(v) => set('parecer_estado_cognitivo', v)} />
      </div>
      <div className="form-field span-3"><label>Obs.</label><input type="text" value={dados.parecer_obs} onChange={(e) => set('parecer_obs', e.target.value)} /></div>

      {sucesso && <p style={{ fontSize: 12, color: 'var(--c-primary)', marginTop: 14 }}>Admissão de enfermagem salva.</p>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
        {salvo && <button type="button" className="modal-btn-secondary" onClick={() => onImprimir({ ...salvo, _variante: 'fiel' })}>Imprimir (modelo oficial)</button>}
        {salvo && <button type="button" className="modal-btn-secondary" onClick={() => onImprimir({ ...salvo, _variante: 'projeto' })}>Imprimir (layout do projeto)</button>}
      </div>
    </div>
  )
}
