import { useEffect, useState } from 'react';
import { listarEvolucoesMedicas, criarEvolucaoMedica } from '../../lib/pepMedico';
import { listarSinaisVitais } from '../../lib/pepClinico';
import { EVOLUCAO_VAZIA, RISCO_TEV_OPCOES } from './constantes';

export default function AbaEvolucaoMedica({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(EVOLUCAO_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [itemExpandido, setItemExpandido] = useState(null)
  const [puxandoSv, setPuxandoSv] = useState(false)
  const [svInfo, setSvInfo] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarEvolucoesMedicas(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function puxarSinaisVitaisDaEnfermagem() {
    setPuxandoSv(true)
    setSvInfo('')
    const registros = await listarSinaisVitais(atendimento.atendimento_id)
    setPuxandoSv(false)
    const ultimo = registros[0]
    if (!ultimo) {
      setSvInfo('Nenhum sinal vital registrado pela enfermagem para este atendimento.')
      return
    }
    setDados((prev) => ({
      ...prev,
      sv_pa_sistolica: ultimo.pa_sistolica ?? '',
      sv_pa_diastolica: ultimo.pa_diastolica ?? '',
      sv_fc: ultimo.fc ?? '',
      sv_fr: ultimo.fr ?? '',
      sv_temperatura: ultimo.temperatura ?? '',
      sv_spo2: ultimo.spo2 ?? '',
    }))
    setSvInfo(`Puxado de ${new Date(ultimo.registrado_em).toLocaleString('pt-BR')} — ${ultimo.enfermeiros?.nome_exibicao || ultimo.enfermeiros?.nome || 'Enfermagem'}. Os campos podem ser editados abaixo.`)
  }

  async function salvar() {
    if (!dados.evolucao_dia.trim() || !dados.exame_fisico.trim()) {
      setErro('Preencha ao menos a evolução do dia e o exame físico.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarEvolucaoMedica({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        diagnosticos: dados.diagnosticos || null, historia_doenca_atual: dados.historia_doenca_atual || null,
        comorbidades: dados.comorbidades, comorbidades_texto: dados.comorbidades ? (dados.comorbidades_texto || null) : null,
        reconciliacao_medicamentosa: dados.reconciliacao_medicamentosa, reconciliacao_texto: dados.reconciliacao_medicamentosa ? (dados.reconciliacao_texto || null) : null,
        alergias: dados.alergias, alergias_texto: dados.alergias ? (dados.alergias_texto || null) : null,
        risco_tev: dados.risco_tev || null, criterios_sepse: dados.criterios_sepse,
        antibioticoterapia: dados.antibioticoterapia || null,
        evolucao_dia: dados.evolucao_dia, exame_fisico: dados.exame_fisico,
        plano_terapeutico: dados.plano_terapeutico || null,
        exames_laboratorio: dados.exames_laboratorio || null,
        aguarda_exames: dados.aguarda_exames, aguarda_exames_texto: dados.aguarda_exames ? (dados.aguarda_exames_texto || null) : null,
        data_prevista_alta: dados.data_prevista_alta || null,
        conduta_medica: dados.conduta_medica || null,
        sv_pa_sistolica: dados.sv_pa_sistolica === '' ? null : Number(dados.sv_pa_sistolica),
        sv_pa_diastolica: dados.sv_pa_diastolica === '' ? null : Number(dados.sv_pa_diastolica),
        sv_fc: dados.sv_fc === '' ? null : Number(dados.sv_fc),
        sv_fr: dados.sv_fr === '' ? null : Number(dados.sv_fr),
        sv_temperatura: dados.sv_temperatura === '' ? null : Number(dados.sv_temperatura),
        sv_spo2: dados.sv_spo2 === '' ? null : Number(dados.sv_spo2),
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(EVOLUCAO_VAZIA)
    setSvInfo('')
    carregar()
  }

  return (
    <div className="clinical-split">
      {/* HISTÓRICO DE EVOLUÇÕES */}
      <aside className="timeline-pane">
        <div className="pane-header">
          <span><i className="ph ph-clock-counter-clockwise" /> Histórico Clínico</span>
        </div>
        <div className="timeline-list">
          {carregando ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Carregando...</p>
          ) : historico.length === 0 ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Nenhuma evolução registrada ainda.</p>
          ) : historico.map((e) => (
            <div
              key={e.id}
              className={`tl-item ${itemExpandido === e.id ? 'expanded' : ''}`}
              onClick={() => setItemExpandido((atual) => (atual === e.id ? null : e.id))}
            >
              <div className="tl-date">
                {new Date(e.criado_em).toLocaleString('pt-BR')}
                <i className={`ph ph-caret-${itemExpandido === e.id ? 'up' : 'down'}`} />
              </div>
              <div className="tl-author">
                <i className="ph ph-user-md" /> {e.enfermeiros?.nome_exibicao || e.enfermeiros?.nome}
              </div>
              <div className="tl-preview">{e.evolucao_dia}</div>
              <button type="button" className="tl-print" onClick={(ev) => { ev.stopPropagation(); onImprimir(e) }}>
                <i className="ph ph-printer" /> Imprimir
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* NOVA EVOLUÇÃO */}
      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-activity" /> Nova Evolução Médica Diária</h2>
            <p>Preencha os dados da evolução. Todos os campos compõem o documento oficial.</p>
          </div>
        </div>

        <div className="cc-body">
          <div className="assess-grid">
            <div className="form-group">
              <label><i className="ph ph-virus" /> Diagnósticos (incluir todos, o principal na primeira linha)</label>
              <textarea value={dados.diagnosticos} onChange={(e) => set('diagnosticos', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="ph ph-heartbeat" /> História da doença atual</label>
              <textarea value={dados.historia_doenca_atual} onChange={(e) => set('historia_doenca_atual', e.target.value)} />
            </div>
          </div>

          <div className="checkbox-group">
            <label style={{ fontWeight: 700, color: '#0F172A', fontSize: 12.5 }}>Comorbidades e alertas:</label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.comorbidades} onChange={(e) => set('comorbidades', e.target.checked)} /> Comorbidades
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.reconciliacao_medicamentosa} onChange={(e) => set('reconciliacao_medicamentosa', e.target.checked)} /> Reconciliação medicamentosa
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.alergias} onChange={(e) => set('alergias', e.target.checked)} /> Alergias
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.criterios_sepse} onChange={(e) => set('criterios_sepse', e.target.checked)} /> 2 critérios p/ protocolo de sepse
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.aguarda_exames} onChange={(e) => set('aguarda_exames', e.target.checked)} /> Aguarda exames
            </label>
          </div>

          {dados.comorbidades && (
            <div className="form-group">
              <label>Especificar comorbidades</label>
              <input type="text" value={dados.comorbidades_texto} onChange={(e) => set('comorbidades_texto', e.target.value)} />
            </div>
          )}
          {dados.reconciliacao_medicamentosa && (
            <div className="form-group">
              <label>Itens reconciliados em prescrição</label>
              <input type="text" value={dados.reconciliacao_texto} onChange={(e) => set('reconciliacao_texto', e.target.value)} />
            </div>
          )}
          {dados.alergias && (
            <div className="form-group">
              <label>Qual medicação</label>
              <input type="text" value={dados.alergias_texto} onChange={(e) => set('alergias_texto', e.target.value)} />
            </div>
          )}
          {dados.aguarda_exames && (
            <div className="form-group">
              <label>Especificar exames aguardados</label>
              <input type="text" value={dados.aguarda_exames_texto} onChange={(e) => set('aguarda_exames_texto', e.target.value)} />
            </div>
          )}

          <div className="assess-grid">
            <div className="form-group">
              <label><i className="ph ph-warning" /> Risco para TEV</label>
              <select value={dados.risco_tev} onChange={(e) => set('risco_tev', e.target.value)}>
                <option value="">—</option>
                {RISCO_TEV_OPCOES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label><i className="ph ph-pill" /> Antibioticoterapia atual (nome, início, duração)</label>
              <input type="text" value={dados.antibioticoterapia} onChange={(e) => set('antibioticoterapia', e.target.value)} />
            </div>
          </div>

          <div className="form-section-box">
            <div className="form-section-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="ph ph-heartbeat" /> Sinais Vitais</span>
              <button type="button" className="btn-add-chip" onClick={puxarSinaisVitaisDaEnfermagem} disabled={puxandoSv}>
                <i className="ph ph-arrow-down-left" /> {puxandoSv ? 'Buscando...' : 'Puxar da Enfermagem'}
              </button>
            </div>
            {svInfo && (
              <p style={{ fontSize: 11.5, color: '#64748B', margin: '0 0 10px' }}>{svInfo}</p>
            )}
            <div className="assess-grid">
              <div className="form-group"><label>PA sistólica</label><input type="number" value={dados.sv_pa_sistolica} onChange={(e) => set('sv_pa_sistolica', e.target.value)} /></div>
              <div className="form-group"><label>PA diastólica</label><input type="number" value={dados.sv_pa_diastolica} onChange={(e) => set('sv_pa_diastolica', e.target.value)} /></div>
              <div className="form-group"><label>FC</label><input type="number" value={dados.sv_fc} onChange={(e) => set('sv_fc', e.target.value)} /></div>
              <div className="form-group"><label>FR</label><input type="number" value={dados.sv_fr} onChange={(e) => set('sv_fr', e.target.value)} /></div>
              <div className="form-group"><label>Temperatura</label><input type="number" step="0.1" value={dados.sv_temperatura} onChange={(e) => set('sv_temperatura', e.target.value)} /></div>
              <div className="form-group"><label>SpO2</label><input type="number" value={dados.sv_spo2} onChange={(e) => set('sv_spo2', e.target.value)} /></div>
            </div>
          </div>

          <div className="form-group">
            <label><i className="ph ph-text-align-left" /> Evolução Clínica do Dia e Queixas *</label>
            <textarea className="large" style={{ minHeight: 120 }} value={dados.evolucao_dia} onChange={(e) => set('evolucao_dia', e.target.value)} />
          </div>

          <div className="form-group">
            <label><i className="ph ph-stethoscope" /> Exame Físico Dirigido *</label>
            <textarea value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} />
          </div>

          <div className="assess-grid">
            <div className="form-group">
              <label><i className="ph ph-list-checks" /> Plano terapêutico (objetivos da terapêutica, atualizados)</label>
              <textarea value={dados.plano_terapeutico} onChange={(e) => set('plano_terapeutico', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="ph ph-flask" /> Laboratório / cultura / exames de imagem</label>
              <textarea value={dados.exames_laboratorio} onChange={(e) => set('exames_laboratorio', e.target.value)} />
            </div>
          </div>

          <div className="assess-grid">
            <div className="form-group">
              <label><i className="ph ph-calendar-check" /> Data prevista da alta hospitalar</label>
              <input type="date" value={dados.data_prevista_alta} onChange={(e) => set('data_prevista_alta', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="ph ph-clipboard-text" /> Conduta médica</label>
              <textarea value={dados.conduta_medica} onChange={(e) => set('conduta_medica', e.target.value)} />
            </div>
          </div>

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <span />
          <button className="btn-save-print" onClick={salvar} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Registrar evolução'}
          </button>
        </div>
      </div>
    </div>
  )
}
