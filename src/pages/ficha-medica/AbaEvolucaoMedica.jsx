import { useEffect, useState } from 'react';
import { listarEvolucoesMedicas, criarEvolucaoMedica } from '../../lib/pepMedico';
import { listarSinaisVitais } from '../../lib/pepClinico';
import { EVOLUCAO_VAZIA } from './constantes';

export default function AbaEvolucaoMedica({ atendimento, medicoId, onImprimir, onFechar }) {
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
      sv_hgt: ultimo.hgt ?? '',
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
        comorbidades: !!dados.comorbidades_texto?.trim(), comorbidades_texto: dados.comorbidades_texto || null,
        risco_tev: dados.risco_tev || null, criterios_sepse: dados.criterios_sepse,
        antibioticoterapia: dados.antibioticoterapia || null,
        evolucao_dia: dados.evolucao_dia, exame_fisico: dados.exame_fisico,
        conduta_medica: dados.conduta_medica || null,
        sv_pa_sistolica: dados.sv_pa_sistolica === '' ? null : Number(dados.sv_pa_sistolica),
        sv_pa_diastolica: dados.sv_pa_diastolica === '' ? null : Number(dados.sv_pa_diastolica),
        sv_fc: dados.sv_fc === '' ? null : Number(dados.sv_fc),
        sv_fr: dados.sv_fr === '' ? null : Number(dados.sv_fr),
        sv_temperatura: dados.sv_temperatura === '' ? null : Number(dados.sv_temperatura),
        sv_spo2: dados.sv_spo2 === '' ? null : Number(dados.sv_spo2),
        sv_hgt: dados.sv_hgt === '' ? null : Number(dados.sv_hgt),
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
            <h2><i className="ph ph-activity" /> Evolução Médica Diária</h2>
            <p>Preencha os dados da evolução. Todos os campos compõem o documento oficial.</p>
          </div>
        </div>

        <div className="cc-body">

          <div className="assess-grid">
            <div className="form-group">
              <label><i className="ph ph-virus" /> Diagnósticos Ativos (CID-10 / HD)</label>
              <input type="text" className="form-control" value={dados.diagnosticos} onChange={(e) => set('diagnosticos', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="ph ph-heartbeat" /> Comorbidades / Antecedentes</label>
              <input type="text" className="form-control" value={dados.comorbidades_texto} onChange={(e) => set('comorbidades_texto', e.target.value)} />
            </div>
          </div>

          <div className="checkbox-group">
            <label style={{ fontWeight: 700, color: 'var(--text-main, #0F172A)', fontSize: 13 }}>Risco e Avaliação Rápida:</label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.risco_tev === 'Sim'} onChange={(e) => set('risco_tev', e.target.checked ? 'Sim' : '')} /> Risco TEV
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.criterios_sepse} onChange={(e) => set('criterios_sepse', e.target.checked)} /> Protocolo Sepse (2+ critérios)
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={!!dados.antibioticoterapia} onChange={(e) => set('antibioticoterapia', e.target.checked ? 'Sim' : '')} /> Uso de Antimicrobianos
            </label>
          </div>

          {/* Sinais Vitais */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main, #0F172A)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ph ph-thermometer" style={{ color: 'var(--danger, #DC2626)' }} /> Sinais Vitais Atuais
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted, #64748B)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={puxarSinaisVitaisDaEnfermagem}>
                <i className="ph ph-arrows-clockwise" /> {puxandoSv ? 'Buscando...' : 'Puxar da Enfermagem'}
              </span>
            </div>
            {svInfo && (
              <p style={{ fontSize: 11.5, color: 'var(--text-muted, #64748B)', margin: '0 0 10px' }}>{svInfo}</p>
            )}
            <div className="vitals-grid">
              <div className="vital-box">
                <label>P. Arterial</label>
                <div className="vital-input-wrapper">
                  <input
                    type="text"
                    placeholder="120/80"
                    value={dados.sv_pa_sistolica === '' && dados.sv_pa_diastolica === '' ? '' : `${dados.sv_pa_sistolica}${dados.sv_pa_diastolica !== '' ? `/${dados.sv_pa_diastolica}` : ''}`}
                    onChange={(e) => {
                      const [sist, diast] = e.target.value.split('/')
                      set('sv_pa_sistolica', sist ?? '')
                      set('sv_pa_diastolica', diast ?? '')
                    }}
                  />
                  <span>mmHg</span>
                </div>
              </div>
              <div className="vital-box"><label>F. Cardíaca</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_fc} onChange={(e) => set('sv_fc', e.target.value)} /><span>bpm</span></div></div>
              <div className="vital-box"><label>F. Respiratória</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_fr} onChange={(e) => set('sv_fr', e.target.value)} /><span>irpm</span></div></div>
              <div className="vital-box"><label>Temperatura</label><div className="vital-input-wrapper"><input type="number" step="0.1" value={dados.sv_temperatura} onChange={(e) => set('sv_temperatura', e.target.value)} /><span>°C</span></div></div>
              <div className="vital-box"><label>SpO₂</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_spo2} onChange={(e) => set('sv_spo2', e.target.value)} /><span>%</span></div></div>
              <div className="vital-box"><label>HGT</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_hgt} onChange={(e) => set('sv_hgt', e.target.value)} /><span>mg/dL</span></div></div>
            </div>
          </div>

          {/* Campos de Texto Oficiais */}
          <div className="form-group">
            <label><i className="ph ph-text-align-left" /> Evolução Clínica do Dia e Queixas *</label>
            <textarea className="form-control-area large" placeholder="Descreva o estado geral, queixas, evolução do quadro..." value={dados.evolucao_dia} onChange={(e) => set('evolucao_dia', e.target.value)} />
          </div>

          <div className="form-group">
            <label><i className="ph ph-stethoscope" /> Exame Físico Dirigido *</label>
            <textarea className="form-control-area" placeholder="Ex: Bom estado geral, corado, hidratado..." value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} />
          </div>

          <div className="form-group">
            <label><i className="ph ph-list-checks" /> Conduta Médica / Plano Terapêutico</label>
            <textarea className="form-control-area" placeholder="Conduta, exames solicitados, pendências de leito..." value={dados.conduta_medica} onChange={(e) => set('conduta_medica', e.target.value)} />
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
