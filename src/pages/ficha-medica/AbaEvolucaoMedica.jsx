import { useEffect, useState } from 'react';
import { listarEvolucoesMedicas, criarEvolucaoMedica } from '../../lib/pepMedico';
import { listarSinaisVitais } from '../../lib/pepClinico';
import { EVOLUCAO_VAZIA, RISCO_TEV_OPCOES } from './constantes';

export default function AbaEvolucaoMedica({ atendimento, medicoId, onImprimir, onFechar }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(EVOLUCAO_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [itemExpandido, setItemExpandido] = useState(null)
  const [puxandoSv, setPuxandoSv] = useState(false)
  const [svInfo, setSvInfo] = useState('')
  const [gruposFechados, setGruposFechados] = useState({})

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarEvolucoesMedicas(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function toggleGrupo(chave) { setGruposFechados((prev) => ({ ...prev, [chave]: !prev[chave] })) }

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

  async function salvar(imprimir = false) {
    if (!dados.evolucao_dia.trim() || !dados.exame_fisico.trim()) {
      setErro('Preencha ao menos a evolução do dia e o exame físico.')
      return
    }
    setErro('')
    setSalvando(true)
    const { data, error } = await criarEvolucaoMedica({
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
    if (imprimir && data) onImprimir(data)
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
          {/* GRUPO 1: DIAGNÓSTICOS E ANTECEDENTES */}
          <div className={`presc-group${gruposFechados.diagnostico ? ' collapsed' : ''}`}>
            <div className="presc-group-header" onClick={() => toggleGrupo('diagnostico')}>
              <h3><i className="ph ph-virus" /> 1. Diagnósticos e Antecedentes</h3>
              <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
            </div>
            <div className="presc-list" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="assess-grid">
                <div className="form-group">
                  <label><i className="ph ph-virus" /> Diagnósticos (incluir todos, o principal na primeira linha)</label>
                  <input type="text" className="form-control" value={dados.diagnosticos} onChange={(e) => set('diagnosticos', e.target.value)} />
                </div>
                <div className="form-group">
                  <label><i className="ph ph-heartbeat" /> História da doença atual</label>
                  <input type="text" className="form-control" value={dados.historia_doenca_atual} onChange={(e) => set('historia_doenca_atual', e.target.value)} />
                </div>
              </div>

              <div className="checkbox-group">
                <label style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>Antecedentes:</label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={dados.comorbidades} onChange={(e) => set('comorbidades', e.target.checked)} /> Comorbidades
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={dados.reconciliacao_medicamentosa} onChange={(e) => set('reconciliacao_medicamentosa', e.target.checked)} /> Reconciliação medicamentosa
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={dados.alergias} onChange={(e) => set('alergias', e.target.checked)} /> Alergias
                </label>
              </div>

              {(dados.comorbidades || dados.reconciliacao_medicamentosa || dados.alergias) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 14, borderLeft: '2px solid var(--border-light, #E2E8F0)' }}>
                  {dados.comorbidades && (
                    <div className="form-group">
                      <label>Especificar comorbidades</label>
                      <input type="text" className="form-control" value={dados.comorbidades_texto} onChange={(e) => set('comorbidades_texto', e.target.value)} />
                    </div>
                  )}
                  {dados.reconciliacao_medicamentosa && (
                    <div className="form-group">
                      <label>Itens reconciliados em prescrição</label>
                      <input type="text" className="form-control" value={dados.reconciliacao_texto} onChange={(e) => set('reconciliacao_texto', e.target.value)} />
                    </div>
                  )}
                  {dados.alergias && (
                    <div className="form-group">
                      <label>Qual medicação</label>
                      <input type="text" className="form-control" value={dados.alergias_texto} onChange={(e) => set('alergias_texto', e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* GRUPO 2: SINAIS VITAIS */}
          <div className={`presc-group${gruposFechados.vitais ? ' collapsed' : ''}`}>
            <div className="presc-group-header" onClick={() => toggleGrupo('vitais')}>
              <h3><i className="ph ph-thermometer" /> 2. Sinais Vitais Atuais</h3>
              <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
            </div>
            <div className="presc-list" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted, #64748B)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={puxarSinaisVitaisDaEnfermagem}>
                  <i className="ph ph-arrows-clockwise" /> {puxandoSv ? 'Buscando...' : 'Puxar da Enfermagem'}
                </span>
              </div>
              {svInfo && (
                <p style={{ fontSize: 11.5, color: 'var(--text-muted, #64748B)', margin: 0 }}>{svInfo}</p>
              )}
              <div className="vitals-grid">
                <div className="vital-box"><label>PA sistólica</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_pa_sistolica} onChange={(e) => set('sv_pa_sistolica', e.target.value)} /><span>mmHg</span></div></div>
                <div className="vital-box"><label>PA diastólica</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_pa_diastolica} onChange={(e) => set('sv_pa_diastolica', e.target.value)} /><span>mmHg</span></div></div>
                <div className="vital-box"><label>FC</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_fc} onChange={(e) => set('sv_fc', e.target.value)} /><span>bpm</span></div></div>
                <div className="vital-box"><label>FR</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_fr} onChange={(e) => set('sv_fr', e.target.value)} /><span>irpm</span></div></div>
                <div className="vital-box"><label>Temperatura</label><div className="vital-input-wrapper"><input type="number" step="0.1" value={dados.sv_temperatura} onChange={(e) => set('sv_temperatura', e.target.value)} /><span>°C</span></div></div>
                <div className="vital-box"><label>SpO2</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_spo2} onChange={(e) => set('sv_spo2', e.target.value)} /><span>%</span></div></div>
              </div>
            </div>
          </div>

          {/* GRUPO 3: EVOLUÇÃO CLÍNICA E EXAME FÍSICO */}
          <div className={`presc-group${gruposFechados.evolucao ? ' collapsed' : ''}`}>
            <div className="presc-group-header" onClick={() => toggleGrupo('evolucao')}>
              <h3><i className="ph ph-activity" /> 3. Evolução Clínica e Exame Físico</h3>
              <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
            </div>
            <div className="presc-list" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label><i className="ph ph-text-align-left" /> Evolução Clínica do Dia e Queixas *</label>
                <textarea className="form-control-area large" placeholder="Descreva o estado geral, queixas, evolução do quadro..." value={dados.evolucao_dia} onChange={(e) => set('evolucao_dia', e.target.value)} />
              </div>
              <div className="form-group">
                <label><i className="ph ph-stethoscope" /> Exame Físico Dirigido *</label>
                <textarea className="form-control-area" placeholder="Ex: Bom estado geral, corado, hidratado..." value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} />
              </div>
            </div>
          </div>

          {/* GRUPO 4: AVALIAÇÃO DE RISCO E RESULTADOS DE EXAMES */}
          <div className={`presc-group${gruposFechados.risco ? ' collapsed' : ''}`}>
            <div className="presc-group-header" onClick={() => toggleGrupo('risco')}>
              <h3><i className="ph ph-warning" /> 4. Avaliação de Risco e Resultados de Exames</h3>
              <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
            </div>
            <div className="presc-list" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="assess-grid">
                <div className="form-group">
                  <label><i className="ph ph-warning" /> Risco para TEV</label>
                  <select className="form-control" value={dados.risco_tev} onChange={(e) => set('risco_tev', e.target.value)}>
                    <option value="">—</option>
                    {RISCO_TEV_OPCOES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><i className="ph ph-pill" /> Antibioticoterapia atual (nome, início, duração)</label>
                  <input type="text" className="form-control" value={dados.antibioticoterapia} onChange={(e) => set('antibioticoterapia', e.target.value)} />
                </div>
              </div>

              <div className="checkbox-group">
                <label style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>Sinalizadores:</label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={dados.criterios_sepse} onChange={(e) => set('criterios_sepse', e.target.checked)} /> 2 critérios p/ protocolo de sepse
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={dados.aguarda_exames} onChange={(e) => set('aguarda_exames', e.target.checked)} /> Aguarda exames
                </label>
              </div>

              {dados.aguarda_exames && (
                <div className="form-group" style={{ paddingLeft: 14, borderLeft: '2px solid var(--border-light, #E2E8F0)' }}>
                  <label>Especificar exames aguardados</label>
                  <input type="text" className="form-control" value={dados.aguarda_exames_texto} onChange={(e) => set('aguarda_exames_texto', e.target.value)} />
                </div>
              )}

              <div className="form-group">
                <label><i className="ph ph-flask" /> Laboratório / cultura / exames de imagem</label>
                <textarea className="form-control-area" value={dados.exames_laboratorio} onChange={(e) => set('exames_laboratorio', e.target.value)} />
              </div>
            </div>
          </div>

          {/* GRUPO 5: CONDUTA MÉDICA E PLANEJAMENTO TERAPÊUTICO */}
          <div className={`presc-group${gruposFechados.conduta ? ' collapsed' : ''}`}>
            <div className="presc-group-header" onClick={() => toggleGrupo('conduta')}>
              <h3><i className="ph ph-clipboard-text" /> 5. Conduta Médica e Planejamento Terapêutico</h3>
              <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
            </div>
            <div className="presc-list" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label><i className="ph ph-list-checks" /> Plano terapêutico (objetivos da terapêutica, atualizados)</label>
                <textarea className="form-control-area" placeholder="Conduta, exames solicitados, pendências de leito..." value={dados.plano_terapeutico} onChange={(e) => set('plano_terapeutico', e.target.value)} />
              </div>
              <div className="form-group">
                <label><i className="ph ph-clipboard-text" /> Conduta médica</label>
                <textarea className="form-control-area" value={dados.conduta_medica} onChange={(e) => set('conduta_medica', e.target.value)} />
              </div>
              <div className="form-group">
                <label><i className="ph ph-calendar-check" /> Data prevista da alta hospitalar</label>
                <input type="date" className="form-control" value={dados.data_prevista_alta} onChange={(e) => set('data_prevista_alta', e.target.value)} style={{ maxWidth: 220 }} />
              </div>
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
          <div>
            <button type="button" className="btn-cancel" onClick={onFechar}>
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
