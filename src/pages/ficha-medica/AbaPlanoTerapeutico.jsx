import { useEffect, useState } from 'react';
import { buscarPlanoTerapeutico, salvarPlanoTerapeutico } from '../../lib/pepMedico';
import { PROTOCOLOS_OPCOES, EQUIPE_OPCOES, PROBLEMA_VAZIO } from './constantes';

// Kits de protocolo institucional: preenchem SOMENTE as caixas de protocolo
// elegível e equipe multidisciplinar (bundles de cuidado padronizados pela
// instituição). Nunca escrevem diagnóstico, motivo, objetivos, metas ou
// problemas ativos — esses campos são sempre digitados pelo médico a partir
// do quadro real do paciente, para não repetir o padrão do bug de dado
// fabricado já corrigido em outras abas (commit a3c5953).
const KITS_PROTOCOLO = [
  { chave: 'sepse', titulo: 'Sepse / Choque Séptico', icon: 'ph-virus', protocolos: ['SEPSE / Choque Séptico', 'TEV — Tromboembolismo Venoso'], equipe: ['Enfermagem', 'Fisioterapia'] },
  { chave: 'sca', titulo: 'Síndrome Coronariana Aguda', icon: 'ph-heartbeat', protocolos: ['Dor torácica / Síndrome Coronariana Aguda', 'TEV — Tromboembolismo Venoso'], equipe: ['Enfermagem'] },
  { chave: 'avc', titulo: 'AVC — Acidente Vascular Cerebral', icon: 'ph-brain', protocolos: ['AVC — Acidente Vascular Cerebral', 'TEV — Tromboembolismo Venoso'], equipe: ['Enfermagem', 'Fisioterapia', 'Serviço Social'] },
]

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

  function aplicarKit(kit) {
    setDados((prev) => ({
      ...prev,
      protocolos_elegiveis: Array.from(new Set([...prev.protocolos_elegiveis, ...kit.protocolos])),
      equipe_multidisciplinar: Array.from(new Set([...prev.equipe_multidisciplinar, ...kit.equipe])),
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

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-strategy" /> Plano Terapêutico Hospitalar</h2>
        </div>
      </div>

      <div className="cc-body">
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-lightning" /> Kits de Protocolo Institucional</div>
          <p style={{ fontSize: 11.5, color: '#64748B', margin: '0 0 10px' }}>
            Pré-marca os protocolos elegíveis e a equipe multidisciplinar padrão do bundle. Diagnóstico, motivo, objetivos e metas continuam de preenchimento manual — nunca são fabricados automaticamente.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {KITS_PROTOCOLO.map((kit) => (
              <button key={kit.chave} type="button" className="btn-add-chip" onClick={() => aplicarKit(kit)}>
                <i className={`ph ${kit.icon}`} /> Kit {kit.titulo}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-virus" /> 1. Diagnósticos clínicos e hipóteses ativas</div>
          <div className="assess-grid">
            <div className="form-group">
              <label>Diagnóstico principal (CID-10)</label>
              <input type="text" placeholder="Ex: J18.9" value={dados.diagnostico_principal_cid} onChange={(e) => set('diagnostico_principal_cid', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Diagnósticos (descrição livre)</label>
              <input type="text" value={dados.diagnosticos_texto} onChange={(e) => set('diagnosticos_texto', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clipboard-text" /> 2. Motivo da internação</div>
          <textarea value={dados.motivo_internacao} onChange={(e) => set('motivo_internacao', e.target.value)} />
        </div>

        <div className="assess-grid">
          <div className="form-group">
            <label><i className="ph ph-heartbeat" /> Comorbidades / antecedentes relevantes</label>
            <textarea value={dados.comorbidades_antecedentes} onChange={(e) => set('comorbidades_antecedentes', e.target.value)} />
          </div>
          <div className="form-group">
            <label><i className="ph ph-pill" /> Medicações em uso contínuo</label>
            <textarea value={dados.medicacoes_uso_continuo} onChange={(e) => set('medicacoes_uso_continuo', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label><i className="ph ph-target" /> Objetivos terapêuticos gerais — aonde queremos chegar</label>
          <textarea value={dados.objetivos_terapeuticos} onChange={(e) => set('objetivos_terapeuticos', e.target.value)} />
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-list-checks" /> 3. Problemas ativos — por quais meios e em quanto tempo</div>
          {dados.problemas_ativos.map((p, i) => (
            <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div className="assess-grid">
                <div className="form-group"><label>Problema / diagnóstico</label><input type="text" value={p.descricao} onChange={(e) => setProblema(i, 'descricao', e.target.value)} /></div>
                <div className="form-group"><label>Meta</label><input type="text" value={p.meta} onChange={(e) => setProblema(i, 'meta', e.target.value)} /></div>
              </div>
              <div className="assess-grid" style={{ marginTop: 12 }}>
                <div className="form-group"><label>Prazo</label><input type="text" placeholder="Ex: 48h" value={p.prazo} onChange={(e) => setProblema(i, 'prazo', e.target.value)} /></div>
                <div className="form-group"><label>Conduta / meios</label><input type="text" value={p.conduta} onChange={(e) => setProblema(i, 'conduta', e.target.value)} /></div>
              </div>
              <button type="button" className="btn-cancel" onClick={() => removerProblema(i)} style={{ marginTop: 8 }}>
                <i className="ph ph-trash" /> Remover
              </button>
            </div>
          ))}
          <button type="button" className="btn-add-chip" onClick={adicionarProblema}>
            <i className="ph ph-plus" /> Adicionar problema
          </button>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-shield-check" /> 4. Protocolos clínicos elegíveis</div>
          <div className="checkbox-group" style={{ flexWrap: 'wrap' }}>
            {PROTOCOLOS_OPCOES.map((p) => (
              <label key={p} className="checkbox-item">
                <input type="checkbox" checked={dados.protocolos_elegiveis.includes(p)} onChange={() => toggleLista('protocolos_elegiveis', p)} /> {p}
              </label>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Outro protocolo institucional</label>
            <input type="text" value={dados.protocolo_outro} onChange={(e) => set('protocolo_outro', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Medidas de segurança assistencial — aplicadas / pertinentes</label>
            <textarea value={dados.medidas_seguranca_texto} onChange={(e) => set('medidas_seguranca_texto', e.target.value)} />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-users-three" /> 5. Previsão de alta e equipe multidisciplinar</div>
          <div className="assess-grid">
            <div className="form-group">
              <label>Tempo de internação previsto (dias)</label>
              <input type="number" value={dados.tempo_internacao_previsto_dias} onChange={(e) => set('tempo_internacao_previsto_dias', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reavaliação prevista</label>
              <input type="date" value={dados.data_reavaliacao_prevista} onChange={(e) => set('data_reavaliacao_prevista', e.target.value)} />
            </div>
          </div>

          <div className="checkbox-group" style={{ flexWrap: 'wrap', marginTop: 12 }}>
            {EQUIPE_OPCOES.map((e) => (
              <label key={e} className="checkbox-item">
                <input type="checkbox" checked={dados.equipe_multidisciplinar.includes(e)} onChange={() => toggleLista('equipe_multidisciplinar', e)} /> {e}
              </label>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Outros profissionais envolvidos</label>
            <input type="text" value={dados.equipe_outros} onChange={(e) => set('equipe_outros', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Critérios de alta — como saberemos que chegou</label>
            <textarea value={dados.criterios_alta} onChange={(e) => set('criterios_alta', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Feedback da equipe multiprofissional</label>
            <textarea value={dados.feedback_equipe} onChange={(e) => set('feedback_equipe', e.target.value)} />
          </div>
        </div>

        {sucesso && (
          <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="info" style={{ color: '#166534' }}>
              <i className="ph ph-check-circle" /> Plano terapêutico salvo.
            </div>
          </div>
        )}
      </div>

      <div className="cc-footer">
        <span />
        <div style={{ display: 'flex', gap: 12 }}>
          {salvo && (
            <button type="button" className="btn-save-draft" onClick={() => onImprimir(salvo)}>
              <i className="ph ph-printer" /> Imprimir
            </button>
          )}
          <button className="btn-save-print" onClick={salvar} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar plano'}
          </button>
        </div>
      </div>
    </div>
  )
}
