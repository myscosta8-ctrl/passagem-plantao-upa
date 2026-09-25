import { useEffect, useState } from 'react';
import {
  buscarOcupacaoAtiva, listarSetoresParaTransferencia, listarEnfermeirosAtivos,
  listarTransferenciasSbar, registrarTransferenciaSbar
} from '../../lib/pepClinico';
import { NIVEIS_CONSCIENCIA } from './constantes';

export default function AbaSbar({ atendimento, autorId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [ocupacao, setOcupacao] = useState(null)
  const [setores, setSetores] = useState([])
  const [enfermeiros, setEnfermeiros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [setorDestinoId, setSetorDestinoId] = useState('')
  const [impressaoDiagnostica, setImpressaoDiagnostica] = useState('')
  const [nivelConsciencia, setNivelConsciencia] = useState('')
  const [alergia, setAlergia] = useState(false)
  const [suporteVentilatorio, setSuporteVentilatorio] = useState(false)
  const [isolamento, setIsolamento] = useState(false)
  const [dispositivos, setDispositivos] = useState('')
  const [recomendacoes, setRecomendacoes] = useState('')
  const [intercorrencia, setIntercorrencia] = useState(false)
  const [breveHistorico, setBreveHistorico] = useState('')
  const [enfermeiroRecebe, setEnfermeiroRecebe] = useState('')
  const [sv, setSv] = useState({ pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', temperatura: '', spo2: '' })
  const [itemExpandido, setItemExpandido] = useState(null)

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    setCarregando(true)
    const [oc, setoresLista, enfLista, hist] = await Promise.all([
      buscarOcupacaoAtiva(atendimento.atendimento_id),
      listarSetoresParaTransferencia(),
      listarEnfermeirosAtivos(),
      listarTransferenciasSbar(atendimento.atendimento_id),
    ])
    setOcupacao(oc)
    setSetores(setoresLista)
    setEnfermeiros(enfLista)
    setHistorico(hist)
    setCarregando(false)
  }

  async function registrar() {
    if (!ocupacao) {
      setErro('Não foi possível identificar o leito atual — recarregue a página.')
      return
    }
    if (!setorDestinoId || !impressaoDiagnostica.trim()) {
      setErro('Preencha ao menos o setor de destino e a situação (impressão diagnóstica).')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await registrarTransferenciaSbar({
      leitoOcupacaoId: ocupacao.id, setorDestinoId, enfermeiroEntrega: autorId, enfermeiroRecebe: enfermeiroRecebe || null,
      dados: {
        impressao_diagnostica: impressaoDiagnostica.trim(), nivel_consciencia: nivelConsciencia || null,
        alergia, suporte_ventilatorio: suporteVentilatorio, isolamento, dispositivos: dispositivos || null,
        recomendacoes: recomendacoes || null, intercorrencia_transporte: intercorrencia,
        sinais_vitais: sv, breve_historico: breveHistorico.trim() || null,
      },
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar. Tente de novo.')
      console.error(error)
      return
    }
    setSetorDestinoId(''); setImpressaoDiagnostica(''); setNivelConsciencia('')
    setAlergia(false); setSuporteVentilatorio(false); setIsolamento(false)
    setDispositivos(''); setRecomendacoes(''); setIntercorrencia(false); setEnfermeiroRecebe('')
    setBreveHistorico('')
    setSv({ pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', temperatura: '', spo2: '' })
    carregarTudo()
  }

  if (carregando) return <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-split">
      <aside className="timeline-pane">
        <div className="pane-header">
          <span><i className="ph ph-arrows-left-right" /> Transferências Registradas</span>
        </div>
        <div className="timeline-list">
          {historico.length === 0 ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Nenhuma transferência registrada ainda.</p>
          ) : historico.map((r) => (
            <div
              key={r.id}
              className={`tl-item ${itemExpandido === r.id ? 'expanded' : ''}`}
              onClick={() => setItemExpandido((atual) => (atual === r.id ? null : r.id))}
            >
              <div className="tl-date">
                {new Date(r.criado_em).toLocaleString('pt-BR')}
                <i className={`ph ph-caret-${itemExpandido === r.id ? 'up' : 'down'}`} />
              </div>
              <div className="tl-author">
                <i className="ph ph-user" /> {r.entrega?.nome_exibicao || r.entrega?.nome || 'Enfermagem'}
              </div>
              <div className="tl-preview">
                <strong>Para {r.setores?.nome || '—'}</strong>
                {r.breve_historico && <><br /><em>Histórico: {r.breve_historico}</em></>}
              </div>
              {onImprimir && (
                <button type="button" className="tl-print" onClick={(e) => { e.stopPropagation(); onImprimir(r) }}>
                  <i className="ph ph-printer" /> Imprimir
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-ambulance" /> Nova Transferência Estruturada (Metodologia SBAR)</h2>
            <p>Situação, Avaliação e Recomendações para a equipe que recebe o paciente.</p>
          </div>
        </div>

        <div className="cc-body">
          {!ocupacao && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> Não foi possível identificar o leito atual deste atendimento.
              </div>
            </div>
          )}

          <div className="form-section-box">
            <div className="form-section-box-title" style={{ color: '#0284C7' }}>
              <i className="ph ph-letter-circle-s" /> S — Situação
            </div>
            <div className="assess-grid">
              <div className="form-group">
                <label>Setor de destino *</label>
                <select value={setorDestinoId} onChange={(e) => setSetorDestinoId(e.target.value)}>
                  <option value="">—</option>
                  {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Enfermeiro(a) que recebe</label>
                <select value={enfermeiroRecebe} onChange={(e) => setEnfermeiroRecebe(e.target.value)}>
                  <option value="">A preencher no destino</option>
                  {enfermeiros.map((e) => <option key={e.id} value={e.id}>{e.nome_exibicao || e.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Impressão diagnóstica *</label>
              <textarea value={impressaoDiagnostica} onChange={(e) => setImpressaoDiagnostica(e.target.value)} />
            </div>
          </div>

          <div className="form-section-box">
            <div className="form-section-box-title" style={{ color: '#4F46E5' }}>
              <i className="ph ph-letter-circle-b" /> B — Breve Histórico
            </div>
            <div className="form-group">
              <label>Antecedentes pessoais, comorbidades, cirurgias e condutas já realizadas na UPA</label>
              <textarea value={breveHistorico} onChange={(e) => setBreveHistorico(e.target.value)} placeholder="Antecedentes relevantes e o que já foi feito neste atendimento antes da transferência..." />
            </div>
          </div>

          <div className="form-section-box">
            <div className="form-section-box-title" style={{ color: '#0D9488' }}>
              <i className="ph ph-letter-circle-a" /> A — Avaliação no Momento do Embarque
            </div>
            <div className="assess-grid">
              <div className="form-group"><label>PA sistólica</label><input type="number" value={sv.pa_sistolica} onChange={(e) => setSv((p) => ({ ...p, pa_sistolica: e.target.value }))} /></div>
              <div className="form-group"><label>PA diastólica</label><input type="number" value={sv.pa_diastolica} onChange={(e) => setSv((p) => ({ ...p, pa_diastolica: e.target.value }))} /></div>
              <div className="form-group"><label>FC</label><input type="number" value={sv.fc} onChange={(e) => setSv((p) => ({ ...p, fc: e.target.value }))} /></div>
              <div className="form-group"><label>FR</label><input type="number" value={sv.fr} onChange={(e) => setSv((p) => ({ ...p, fr: e.target.value }))} /></div>
              <div className="form-group"><label>Temperatura</label><input type="number" step="0.1" value={sv.temperatura} onChange={(e) => setSv((p) => ({ ...p, temperatura: e.target.value }))} /></div>
              <div className="form-group"><label>SpO2</label><input type="number" value={sv.spo2} onChange={(e) => setSv((p) => ({ ...p, spo2: e.target.value }))} /></div>
            </div>

            <div className="form-group">
              <label>Nível de consciência:</label>
              <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {NIVEIS_CONSCIENCIA.map((n) => (
                  <label key={n} className="checkbox-item">
                    <input type="radio" name="sbar-consciencia" checked={nivelConsciencia === n} onChange={() => setNivelConsciencia(nivelConsciencia === n ? '' : n)} /> {n}
                  </label>
                ))}
              </div>
            </div>

            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <label className="checkbox-item">
                <input type="checkbox" checked={alergia} onChange={(e) => setAlergia(e.target.checked)} /> Alergia
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={suporteVentilatorio} onChange={(e) => setSuporteVentilatorio(e.target.checked)} /> Suporte ventilatório
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={isolamento} onChange={(e) => setIsolamento(e.target.checked)} /> Isolamento
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={intercorrencia} onChange={(e) => setIntercorrencia(e.target.checked)} /> Intercorrência no transporte
              </label>
            </div>

            <div className="form-group">
              <label>Dispositivos</label>
              <input type="text" value={dispositivos} onChange={(e) => setDispositivos(e.target.value)} />
            </div>
          </div>

          <div className="form-section-box">
            <div className="form-section-box-title" style={{ color: '#D97706' }}>
              <i className="ph ph-letter-circle-r" /> R — Recomendações
            </div>
            <div className="form-group">
              <label>Recomendações para a equipe que recebe</label>
              <textarea value={recomendacoes} onChange={(e) => setRecomendacoes(e.target.value)} />
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
          <button className="btn-save-print" onClick={registrar} disabled={salvando || !ocupacao}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Registrando...' : 'Registrar transferência'}
          </button>
        </div>
      </div>
    </div>
  )
}
