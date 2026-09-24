import { useEffect, useState } from 'react';
import {
  buscarOcupacaoAtiva, listarSetoresParaTransferencia, listarEnfermeirosAtivos,
  listarTransferenciasSbar, registrarTransferenciaSbar
} from '../../lib/pepClinico';

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
  const [enfermeiroRecebe, setEnfermeiroRecebe] = useState('')
  const [sv, setSv] = useState({ pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', temperatura: '', spo2: '' })

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
        sinais_vitais: sv,
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
    setSv({ pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', temperatura: '', spo2: '' })
    carregarTudo()
  }

  if (carregando) return <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>

  return (
    <div className="form-section">
      <div className="form-section-title">Nova transferência (SBAR)</div>
      {!ocupacao && (
        <div className="error-box" style={{ marginBottom: 14 }}>Não foi possível identificar o leito atual deste atendimento.</div>
      )}
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Setor de destino *</label>
          <select value={setorDestinoId} onChange={(e) => setSetorDestinoId(e.target.value)}>
            <option value="">—</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Enfermeiro(a) que recebe</label>
          <select value={enfermeiroRecebe} onChange={(e) => setEnfermeiroRecebe(e.target.value)}>
            <option value="">A preencher no destino</option>
            {enfermeiros.map((e) => <option key={e.id} value={e.id}>{e.nome_exibicao || e.nome}</option>)}
          </select>
        </div>
        <div className="form-field span-3"><label>S — Situação (impressão diagnóstica) *</label><textarea value={impressaoDiagnostica} onChange={(e) => setImpressaoDiagnostica(e.target.value)} /></div>

        <div className="form-field"><label>PA sistólica</label><input type="number" value={sv.pa_sistolica} onChange={(e) => setSv((p) => ({ ...p, pa_sistolica: e.target.value }))} /></div>
        <div className="form-field"><label>PA diastólica</label><input type="number" value={sv.pa_diastolica} onChange={(e) => setSv((p) => ({ ...p, pa_diastolica: e.target.value }))} /></div>
        <div className="form-field"><label>FC</label><input type="number" value={sv.fc} onChange={(e) => setSv((p) => ({ ...p, fc: e.target.value }))} /></div>
        <div className="form-field"><label>FR</label><input type="number" value={sv.fr} onChange={(e) => setSv((p) => ({ ...p, fr: e.target.value }))} /></div>
        <div className="form-field"><label>Temperatura</label><input type="number" step="0.1" value={sv.temperatura} onChange={(e) => setSv((p) => ({ ...p, temperatura: e.target.value }))} /></div>
        <div className="form-field"><label>SpO2</label><input type="number" value={sv.spo2} onChange={(e) => setSv((p) => ({ ...p, spo2: e.target.value }))} /></div>

        <div className="form-field">
          <label>Nível de consciência</label>
          <div className="chip-group">
            {NIVEIS_CONSCIENCIA.map((n) => (
              <button key={n} type="button" className={`chip ${nivelConsciencia === n ? 'on' : ''}`} onClick={() => setNivelConsciencia(nivelConsciencia === n ? '' : n)}>{n}</button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label>Alergia</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${!alergia ? 'on' : ''}`} onClick={() => setAlergia(false)}>Não</button>
            <button type="button" className={`toggle-btn ${alergia ? 'on' : ''}`} onClick={() => setAlergia(true)}>Sim</button>
          </div>
        </div>
        <div className="form-field">
          <label>Suporte ventilatório</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${!suporteVentilatorio ? 'on' : ''}`} onClick={() => setSuporteVentilatorio(false)}>Não</button>
            <button type="button" className={`toggle-btn ${suporteVentilatorio ? 'on' : ''}`} onClick={() => setSuporteVentilatorio(true)}>Sim</button>
          </div>
        </div>
        <div className="form-field">
          <label>Isolamento</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${!isolamento ? 'on' : ''}`} onClick={() => setIsolamento(false)}>Não</button>
            <button type="button" className={`toggle-btn ${isolamento ? 'on' : ''}`} onClick={() => setIsolamento(true)}>Sim</button>
          </div>
        </div>
        <div className="form-field">
          <label>Intercorrência no transporte</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${!intercorrencia ? 'on' : ''}`} onClick={() => setIntercorrencia(false)}>Não</button>
            <button type="button" className={`toggle-btn ${intercorrencia ? 'on' : ''}`} onClick={() => setIntercorrencia(true)}>Sim</button>
          </div>
        </div>
        <div className="form-field span-2"><label>Dispositivos</label><input type="text" value={dispositivos} onChange={(e) => setDispositivos(e.target.value)} /></div>
        <div className="form-field span-3"><label>R — Recomendações</label><textarea value={recomendacoes} onChange={(e) => setRecomendacoes(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !ocupacao}>
        {salvando ? 'Registrando...' : 'Registrar transferência'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma transferência registrada ainda.</p>
      ) : (
        historico.map((r) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Para {r.setores?.nome || '—'}</div>
              <div style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>
                {r.entrega?.nome_exibicao || r.entrega?.nome} · {new Date(r.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="btn-fechar" onClick={() => onImprimir(r)}>Imprimir</button>
          </div>
        ))
      )}
    </div>
  )
}


