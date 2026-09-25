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
    <div className="clinical-split">
      <aside className="tools-pane">
        <div className="pane-header"><i className="ph ph-magic-wand" /> Auto-preenchimento</div>
        <div className="tools-body">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
            Selecione um Kit para marcar rapidamente os protocolos e a equipe padrão do bundle institucional.
          </p>
          
          {KITS_PROTOCOLO.map((kit) => (
            <button key={kit.chave} type="button" className="template-btn" onClick={() => aplicarKit(kit)}>
              <div>
                <strong><i className={"ph " + kit.icon} /> Kit {kit.titulo}</strong>
                <span>Aplica bundle de protocolos e equipe sugerida.</span>
              </div>
              <i className="ph ph-caret-right" style={{ color: 'var(--primary)', fontSize: 16 }} />
            </button>
          ))}
        </div>
      </aside>

      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title-area">
            <h2><i className="ph ph-strategy" /> Plano Terapêutico Hospitalar</h2>
            {salvo && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Última alteração: {new Date(salvo.atualizado_em || salvo.criado_em).toLocaleString('pt-BR')}</span>}
          </div>
        </div>

        <div className="cc-body">
          <div className="form-section">
            <div className="form-section-title">1. Diagnósticos Clínicos e Hipóteses Ativas</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Diagnóstico Principal (CID-10)</label>
              <input type="text" className="form-control" placeholder="Ex: S06.5 — Traumatismo Cranioencefálico..." value={dados.diagnostico_principal_cid} onChange={(e) => set('diagnostico_principal_cid', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Diagnósticos Secundários / Comorbidades</label>
              <textarea className="form-control-area" rows="2" placeholder="Ex: Fratura com afundamento de calota craniana..." value={dados.diagnosticos_texto} onChange={(e) => set('diagnosticos_texto', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">2. Avaliação Clínica e Contexto</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Motivo da Internação Atual</label>
              <textarea className="form-control-area" rows="2" placeholder="Descreva por que o paciente precisou internar neste momento..." value={dados.motivo_internacao} onChange={(e) => set('motivo_internacao', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Comorbidades Crônicas Relevantes</label>
                <textarea className="form-control-area" rows="2" value={dados.comorbidades_antecedentes} onChange={(e) => set('comorbidades_antecedentes', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Medicações de Uso Contínuo</label>
                <textarea className="form-control-area" rows="2" value={dados.medicacoes_uso_continuo} onChange={(e) => set('medicacoes_uso_continuo', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">3. Metas e Problemas Ativos</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Objetivos Terapêuticos Gerais</label>
              <textarea className="form-control-area" rows="2" placeholder="Aonde queremos chegar com esta internação?" value={dados.objetivos_terapeuticos} onChange={(e) => set('objetivos_terapeuticos', e.target.value)} />
            </div>
            
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>Problemas Específicos e Metas de Curto Prazo</label>
            <div className="metas-list">
              {dados.problemas_ativos.map((p, i) => (
                <div key={i} className="meta-row">
                  <div className="form-group" style={{ flex: 1 }}><input type="text" className="form-control" placeholder="Descreva o problema / diagnóstico..." value={p.descricao} onChange={(e) => setProblema(i, 'descricao', e.target.value)} /></div>
                  <div className="form-group" style={{ flex: 1 }}><input type="text" className="form-control" placeholder="Meta associada / Intervenção..." value={p.meta} onChange={(e) => setProblema(i, 'meta', e.target.value)} /></div>
                  <button type="button" className="btn-remove-meta" onClick={() => removerProblema(i)}><i className="ph ph-trash" /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-add-meta" onClick={adicionarProblema}>
              <i className="ph ph-plus" /> Adicionar Meta / Problema
            </button>
          </div>

          <div className="form-section">
            <div className="form-section-title">4. Protocolos Institucionais Elegíveis</div>
            <div className="check-grid">
              {PROTOCOLOS_OPCOES.map((p) => {
                const checked = dados.protocolos_elegiveis.includes(p)
                return (
                  <label key={p} className="check-item" style={{ borderColor: checked ? 'var(--primary)' : 'var(--border-light)' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleLista('protocolos_elegiveis', p)} />
                    <div>
                      <strong>{p}</strong>
                    </div>
                  </label>
                )
              })}
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Outro Protocolo (Especifique)</label>
              <input type="text" className="form-control" value={dados.protocolo_outro} onChange={(e) => set('protocolo_outro', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">5. Planejamento de Alta e Desospitalização</div>
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Previsão de Tempo de Internação (Dias)</label>
                <input type="number" className="form-control" placeholder="Ex: 5" value={dados.tempo_internacao_previsto_dias} onChange={(e) => set('tempo_internacao_previsto_dias', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Data Prevista para Reavaliação</label>
                <input type="date" className="form-control" value={dados.data_reavaliacao_prevista} onChange={(e) => set('data_reavaliacao_prevista', e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Critérios Clínicos para Alta</label>
              <textarea className="form-control-area" rows="2" placeholder="O que o paciente precisa atingir para receber alta?" value={dados.criterios_alta} onChange={(e) => set('criterios_alta', e.target.value)} />
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>Equipe Multidisciplinar Necessária</label>
            <div className="equipe-grid">
              {EQUIPE_OPCOES.map((e) => {
                const checked = dados.equipe_multidisciplinar.includes(e)
                return (
                  <label key={e} className="check-item" style={{ borderColor: checked ? 'var(--primary)' : 'var(--border-light)' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleLista('equipe_multidisciplinar', e)} />
                    <div><strong>{e}</strong></div>
                  </label>
                )
              })}
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Outra Equipe</label>
              <input type="text" className="form-control" value={dados.equipe_outros} onChange={(e) => set('equipe_outros', e.target.value)} />
            </div>
          </div>
          
          {sucesso && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', marginTop: 16 }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-check-circle" /> Plano terapêutico salvo com sucesso.
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
            <button type="button" className="btn-save-print" onClick={salvar} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Plano Terapêutico'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
