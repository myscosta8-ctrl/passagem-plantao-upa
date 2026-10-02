import { avisarErro } from '../../lib/erros'
import { useEffect, useState } from 'react';
import { buscarPlanoTerapeutico, salvarPlanoTerapeutico, mensagemErroSalvar } from '../../lib/pepMedico';
import { PROTOCOLOS_OPCOES, EQUIPE_OPCOES, TEMPO_INTERNACAO_OPCOES, PROBLEMA_VAZIO } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { descartarRascunho } from '../../lib/documentos'

// Kits de protocolo institucional: preenchem SOMENTE as caixas de protocolo
// elegível e equipe multidisciplinar (bundles de cuidado padronizados pela
// instituição). Nunca escrevem diagnóstico, motivo, objetivos, metas ou
// problemas ativos — esses campos são sempre digitados pelo médico a partir
// do quadro real do paciente, para não repetir o padrão do bug de dado
// fabricado já corrigido em outras abas (commit a3c5953).
const KITS_PROTOCOLO = [
  { chave: 'sepse', titulo: 'Sepse / Choque Séptico', icon: 'ph-virus', protocolos: ['IDENTIFICAÇÃO SEGURA', 'PREVENÇÃO DE QUEDA', 'PREVENÇÃO DE LPP', 'TEV CLÍNICO / CIRÚRGICO'], equipe: ['Enfermagem', 'Fisioterapia Resp/Motora'] },
  { chave: 'sca', titulo: 'Síndrome Coronariana Aguda', icon: 'ph-heartbeat', protocolos: ['IDENTIFICAÇÃO SEGURA', 'PREVENÇÃO DE QUEDA', 'PREVENÇÃO DE LPP', 'CONTROLE DA DOR', 'TEV CLÍNICO / CIRÚRGICO'], equipe: ['Enfermagem'] },
  { chave: 'avc', titulo: 'AVC — Acidente Vascular Cerebral', icon: 'ph-brain', protocolos: ['IDENTIFICAÇÃO SEGURA', 'PREVENÇÃO DE QUEDA', 'PREVENÇÃO DE LPP', 'TCE GRAVE', 'TEV CLÍNICO / CIRÚRGICO'], equipe: ['Enfermagem', 'Fisioterapia Resp/Motora', 'Serviço Social'] },
]

export default function AbaPlanoTerapeutico({ atendimento, medicoId, onImprimir, onFechar }) {
  const [dados, setDados] = useState({
    diagnostico_principal_cid: '', diagnosticos_texto: '', motivo_internacao: '',
    protocolos_elegiveis: [], tempo_internacao_previsto_dias: '1', observacao_alta: '',
    equipe_multidisciplinar: [], problemas_ativos: [],
  })
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarPlanoTerapeutico(atendimento.atendimento_id).then((p) => {
      if (p) {
        const extra = p.campos_extra || {}
        setDados({
          diagnostico_principal_cid: p.diagnostico_principal_cid || '',
          diagnosticos_texto: extra.diagnosticos_texto || '',
          motivo_internacao: p.motivo_internacao || '',
          protocolos_elegiveis: p.protocolos_elegiveis || [],
          tempo_internacao_previsto_dias: p.tempo_internacao_previsto_dias ? String(p.tempo_internacao_previsto_dias) : '1',
          observacao_alta: extra.observacao_alta || '',
          equipe_multidisciplinar: p.equipe_multidisciplinar || [],
          problemas_ativos: extra.problemas_ativos || [],
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

  async function salvar(imprimir = false) {
    setSalvando(true)
    const {
      diagnostico_principal_cid, motivo_internacao, protocolos_elegiveis,
      tempo_internacao_previsto_dias, equipe_multidisciplinar, ...extra
    } = dados
    const { data, error } = await salvarPlanoTerapeutico({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro),
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        diagnostico_principal_cid: diagnostico_principal_cid || null,
        motivo_internacao, protocolos_elegiveis,
        tempo_internacao_previsto_dias: tempo_internacao_previsto_dias ? Number(tempo_internacao_previsto_dias) : null,
        equipe_multidisciplinar,
        campos_extra: extra,
      },
    })
    setSalvando(false)
    if (error || !data) { console.error(error); setSucesso(false); setErro(mensagemErroSalvar(error, 'o plano terapêutico')); return }
    setErro('')
    setSucesso(true)
    setSalvo(data)
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
  }

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-split">
      
      {historicoAberto && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} onClick={() => setHistoricoAberto(false)} />
          <aside className="tools-pane" style={{ position: 'fixed', top: 0, right: 0, width: 420, maxWidth: '100vw', height: '100vh', zIndex: 9999, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>
<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}><button type="button" onClick={() => setHistoricoAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}><i className="ph ph-x"></i></button></div>

        <div className="pane-header"><i className="ph ph-magic-wand" /> Auto-preenchimento</div>
        <div className="tools-body">
          <p >
            Selecione um Kit para marcar rapidamente os protocolos e a equipe padrão do bundle institucional.
          </p>

          {KITS_PROTOCOLO.map((kit) => (
            <button key={kit.chave} type="button" className="template-btn" onClick={() => aplicarKit(kit)}>
              <div>
                <strong><i className={"ph " + kit.icon} /> Kit {kit.titulo}</strong>
                <span>Aplica bundle de protocolos e equipe sugerida.</span>
              </div>
              <i className="ph ph-caret-right" style={{ color: 'var(--primary)', fontSize: 15 }} />
            </button>
          ))}
        </div>
      </aside>
        </>
      )}


      <div className="clinical-card">
        <div className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 16 }}><div className="cc-title-area">
            <h2><i className="ph ph-strategy" /> Plano Terapêutico Hospitalar</h2>
            
          </div><button type="button" className="btn btn-outline" onClick={() => setHistoricoAberto(true)} style={{ height: 32, fontSize: 12, display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}><i className="ph ph-clock-counter-clockwise"></i> Ver Histórico</button></div>

        <div className="cc-body">

          <div className="form-section" style={{ marginTop: 8 }}>
            <div className="form-section-title">Diagnósticos Clínicos e Hipóteses Ativas</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Diagnóstico Principal</label>
              <input type="text" className="form-control" placeholder="Ex: S06.5 — Traumatismo Cranioencefálico (TCE) Grave..." value={dados.diagnostico_principal_cid} onChange={(e) => set('diagnostico_principal_cid', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Diagnósticos Secundários / Comorbidades</label>
              <textarea className="form-control-area" rows="2" placeholder="Ex: Fratura com afundamento de calota craniana..." value={dados.diagnosticos_texto} onChange={(e) => set('diagnosticos_texto', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Motivo da Permanência / Internação</div>
            <div className="form-group">
              <textarea className="form-control-area" rows="3" placeholder="Qual a causa-base que justifica a observação contínua ou regulação?" value={dados.motivo_internacao} onChange={(e) => set('motivo_internacao', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Objetivos da Terapêutica (Metas e Tempos)</div>
            <div className="metas-list">
              {dados.problemas_ativos.map((p, i) => (
                <div key={i} className="meta-row">
                  <div className="form-group" style={{ flex: 1 }}><input type="text" className="form-control" placeholder="Descreva o objetivo terapêutico..." value={p.descricao} onChange={(e) => setProblema(i, 'descricao', e.target.value)} /></div>
                  <div className="form-group"><select className="form-control" style={{ width: 140 }} value={p.prazo} onChange={(e) => setProblema(i, 'prazo', e.target.value)}>
                    <option value="1">01 DIA</option>
                    <option value="2">02 DIAS</option>
                    <option value="3">03 DIAS</option>
                    <option value="CONTÍNUO">CONTÍNUO</option>
                  </select></div>
                  <button type="button" className="btn-remove-meta" onClick={() => removerProblema(i)} aria-label="Remover problema" title="Remover problema"><i className="ph ph-trash" /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-add-meta" onClick={adicionarProblema}>
              <i className="ph ph-plus" /> Adicionar Nova Meta
            </button>
          </div>

          <div className="form-section">
            <div className="form-section-title">Elegível para Protocolos Institucionais</div>
            <div className="check-grid">
              {PROTOCOLOS_OPCOES.map((p) => {
                const checked = dados.protocolos_elegiveis.includes(p.nome)
                return (
                  <label key={p.nome} className="check-item" style={{ borderColor: checked ? 'var(--primary)' : 'var(--border-light)' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleLista('protocolos_elegiveis', p.nome)} />
                    <div>
                      <strong>{p.nome}</strong>
                      <span>{p.descricao}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Previsão de Alta e Equipe Multidisciplinar</div>
            <div className="form-row" style={{ marginBottom: 20 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tempo de Permanência Previsto (Na UPA)</label>
                <select className="form-control" value={dados.tempo_internacao_previsto_dias} onChange={(e) => set('tempo_internacao_previsto_dias', e.target.value)}>
                  {TEMPO_INTERNACAO_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Observação / Condicionante da Alta</label>
                <input type="text" className="form-control" placeholder="Ex: Até efetivação de transferência inter-hospitalar via SER..." value={dados.observacao_alta} onChange={(e) => set('observacao_alta', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Equipe Multiprofissional Envolvida</label>
              <div className="equipe-grid">
                {EQUIPE_OPCOES.map((eq) => (
                  <label key={eq} style={{ display: 'flex', gap: 8 }}>
                    <input type="checkbox" checked={dados.equipe_multidisciplinar.includes(eq)} onChange={() => toggleLista('equipe_multidisciplinar', eq)} /> {eq}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}

          {erro && (
    <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', marginTop: 16 }}>
      <div className="info" style={{ color: '#991B1B' }}><i className="ph ph-warning" /> {erro}</div>
    </div>
  )}
          {sucesso && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', marginTop: 16 }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-check-circle" /> Plano terapêutico salvo com sucesso.
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <div>
            <button type="button" className="btn-cancel" onClick={async () => { if (salvo?.situacao === 'rascunho') { if (!window.confirm('Cancelar descarta este rascunho em definitivo. Deseja continuar?')) return; const { error } = await descartarRascunho('planos_terapeuticos', salvo.id); if (error) { avisarErro('Plano terapêutico', error); return } } onFechar?.() }}>
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {salvo?.situacao === 'finalizado' && (
              <button type="button" className="btn-save-draft" onClick={() => onImprimir(salvo)}>
                <i className="ph ph-printer" /> Reimprimir
              </button>
            )}
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Finalizar e Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
