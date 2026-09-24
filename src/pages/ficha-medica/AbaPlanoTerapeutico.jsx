import { useEffect, useState } from 'react';
import { buscarPlanoTerapeutico, salvarPlanoTerapeutico } from '../../lib/pepMedico';

export default function AbaPlanoTerapeutico({ atendimento, medicoId, onImprimir }) {
  const [dados, setDados] = useState({
    diagnostico_principal_cid: '', diagnosticos_texto: '', motivo_internacao: '', objetivos_terapeuticos: '', protocolos_elegiveis: [],
    protocolo_outro: '', medidas_seguranca_texto: '',
    tempo_internacao_previsto_dias: '', equipe_multidisciplinar: [], equipe_outros: '',
    problemas_ativos: [], comorbidades_antecedentes: '', medicacoes_uso_continuo: '',
    criterios_alta: '', data_reavaliacao_prevista: '', feedback_equipe: '',
  })
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    buscarPlanoTerapeutico(atendimento.atendimento_id).then((p) => {
      if (p) {
        const extra = p.campos_extra || {}
        setDados({
          diagnostico_principal_cid: p.diagnostico_principal_cid || '',
          diagnosticos_texto: extra.diagnosticos_texto || '',
          motivo_internacao: p.motivo_internacao || '', objetivos_terapeuticos: p.objetivos_terapeuticos || '',
          protocolos_elegiveis: p.protocolos_elegiveis || [], protocolo_outro: extra.protocolo_outro || '',
          medidas_seguranca_texto: extra.medidas_seguranca_texto || '',
          tempo_internacao_previsto_dias: p.tempo_internacao_previsto_dias || '',
          equipe_multidisciplinar: p.equipe_multidisciplinar || [], equipe_outros: extra.equipe_outros || '',
          problemas_ativos: extra.problemas_ativos || [],
          comorbidades_antecedentes: extra.comorbidades_antecedentes || '',
          medicacoes_uso_continuo: extra.medicacoes_uso_continuo || '',
          criterios_alta: extra.criterios_alta || '',
          data_reavaliacao_prevista: extra.data_reavaliacao_prevista || '',
          feedback_equipe: extra.feedback_equipe || '',
        })
        setSalvo(p)
      }
      setCarregando(false)
    })
  }, [atendimento.atendimento_id])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function toggleLista(campo, item) {
    setDados((prev) => ({
      ...prev,
      [campo]: prev[campo].includes(item) ? prev[campo].filter((i) => i !== item) : [...prev[campo], item],
    }))
  }

  function setProblema(i, campo, valor) {
    setDados((prev) => ({ ...prev, problemas_ativos: prev.problemas_ativos.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)) }))
  }
  function adicionarProblema() {
    setDados((prev) => ({ ...prev, problemas_ativos: [...prev.problemas_ativos, { ...PROBLEMA_VAZIO }] }))
  }
  function removerProblema(i) {
    setDados((prev) => ({ ...prev, problemas_ativos: prev.problemas_ativos.filter((_, idx) => idx !== i) }))
  }

  async function salvar() {
    setSalvando(true)
    const {
      diagnostico_principal_cid, motivo_internacao, objetivos_terapeuticos, protocolos_elegiveis,
      tempo_internacao_previsto_dias, equipe_multidisciplinar, ...extra
    } = dados
    const { data } = await salvarPlanoTerapeutico({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        diagnostico_principal_cid: diagnostico_principal_cid || null,
        motivo_internacao, objetivos_terapeuticos, protocolos_elegiveis,
        tempo_internacao_previsto_dias: tempo_internacao_previsto_dias ? Number(tempo_internacao_previsto_dias) : null,
        equipe_multidisciplinar,
        campos_extra: extra,
      },
    })
    setSalvando(false)
    setSucesso(true)
    setSalvo(data)
  }

  if (carregando) return <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>

  return (
    <div className="form-section">
      <div className="form-section-title">Plano terapêutico</div>
      <div className="form-grid">
        <div className="form-field">
          <label>Diagnóstico principal (CID-10)</label>
          <input type="text" placeholder="Ex: J18.9" value={dados.diagnostico_principal_cid} onChange={(e) => set('diagnostico_principal_cid', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Diagnósticos (descrição livre)</label>
          <input type="text" value={dados.diagnosticos_texto} onChange={(e) => set('diagnosticos_texto', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Motivo da internação</label>
          <textarea value={dados.motivo_internacao} onChange={(e) => set('motivo_internacao', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Comorbidades / antecedentes relevantes</label>
          <textarea value={dados.comorbidades_antecedentes} onChange={(e) => set('comorbidades_antecedentes', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Medicações em uso contínuo</label>
          <textarea value={dados.medicacoes_uso_continuo} onChange={(e) => set('medicacoes_uso_continuo', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Objetivos terapêuticos gerais — aonde queremos chegar</label>
          <textarea value={dados.objetivos_terapeuticos} onChange={(e) => set('objetivos_terapeuticos', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>
        Problemas ativos — por quais meios e em quanto tempo
      </div>
      {dados.problemas_ativos.map((p, i) => (
        <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div className="form-grid">
            <div className="form-field span-3"><label>Problema / diagnóstico</label><input type="text" value={p.descricao} onChange={(e) => setProblema(i, 'descricao', e.target.value)} /></div>
            <div className="form-field span-2"><label>Meta</label><input type="text" value={p.meta} onChange={(e) => setProblema(i, 'meta', e.target.value)} /></div>
            <div className="form-field"><label>Prazo</label><input type="text" placeholder="Ex: 48h" value={p.prazo} onChange={(e) => setProblema(i, 'prazo', e.target.value)} /></div>
            <div className="form-field span-3"><label>Conduta / meios</label><input type="text" value={p.conduta} onChange={(e) => setProblema(i, 'conduta', e.target.value)} /></div>
          </div>
          <button type="button" className="modal-btn-secondary" onClick={() => removerProblema(i)} style={{ marginTop: 6 }}>Remover</button>
        </div>
      ))}
      <button type="button" className="modal-btn-secondary" onClick={adicionarProblema}>+ Adicionar problema</button>

      <div className="form-grid" style={{ marginTop: 16 }}>
        <div className="form-field span-3">
          <label>Protocolos clínicos aplicáveis</label>
          <div className="chip-group">
            {PROTOCOLOS_OPCOES.map((p) => (
              <button key={p} type="button" className={`chip ${dados.protocolos_elegiveis.includes(p) ? 'on' : ''}`} onClick={() => toggleLista('protocolos_elegiveis', p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="form-field span-3">
          <label>Outro protocolo institucional</label>
          <input type="text" value={dados.protocolo_outro} onChange={(e) => set('protocolo_outro', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Medidas de segurança assistencial — aplicadas / pertinentes</label>
          <textarea value={dados.medidas_seguranca_texto} onChange={(e) => set('medidas_seguranca_texto', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Tempo de internação previsto (dias)</label>
          <input type="number" value={dados.tempo_internacao_previsto_dias} onChange={(e) => set('tempo_internacao_previsto_dias', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Equipe multidisciplinar envolvida</label>
          <div className="chip-group">
            {EQUIPE_OPCOES.map((e) => (
              <button key={e} type="button" className={`chip ${dados.equipe_multidisciplinar.includes(e) ? 'on' : ''}`} onClick={() => toggleLista('equipe_multidisciplinar', e)}>{e}</button>
            ))}
          </div>
        </div>
        <div className="form-field span-3">
          <label>Outros profissionais envolvidos</label>
          <input type="text" value={dados.equipe_outros} onChange={(e) => set('equipe_outros', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Critérios de alta — como saberemos que chegou</label>
          <textarea value={dados.criterios_alta} onChange={(e) => set('criterios_alta', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Reavaliação prevista</label>
          <input type="date" value={dados.data_reavaliacao_prevista} onChange={(e) => set('data_reavaliacao_prevista', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Feedback da equipe multiprofissional</label>
          <textarea value={dados.feedback_equipe} onChange={(e) => set('feedback_equipe', e.target.value)} />
        </div>
      </div>

      {sucesso && <p style={{ fontSize: 12, color: 'var(--c-primary)', marginTop: 14 }}>Plano terapêutico salvo.</p>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar plano'}</button>
        {salvo && <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(salvo)}>Imprimir</button>}
      </div>
    </div>
  )
}
