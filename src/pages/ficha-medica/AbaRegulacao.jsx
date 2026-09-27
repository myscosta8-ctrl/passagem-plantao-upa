import { useEffect, useState } from 'react';
import { listarRegulacao, registrarRegulacao, buscarAberturaRegulacao, abrirRegulacao, encerrarRegulacao, listarCatalogoCid } from '../../lib/pepMedico';

// Atualização de Quadro Clínico para a regulação (SER / SISREG).
export default function AbaRegulacao({ atendimento, medicoId, onImprimir, onFechar }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [abertura, setAbertura] = useState(null)
  const [tipoAbertura, setTipoAbertura] = useState('SER')
  const [abrindo, setAbrindo] = useState(false)
  const [evolucao, setEvolucao] = useState('')
  const [pendencias, setPendencias] = useState('')
  const [conduta, setConduta] = useState('')
  const [numeroSer, setNumeroSer] = useState('')
  const [diagnosticoRegulado, setDiagnosticoRegulado] = useState('')
  const [mudancaDiagnostico, setMudancaDiagnostico] = useState(false)
  const [novoDiagnostico, setNovoDiagnostico] = useState('')
  const [cids, setCids] = useState([])
  const [sv, setSv] = useState({ pas: '', pad: '', fc: '', fr: '', temp: '', spo2: '', hgt: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar(); listarCatalogoCid().then(setCids) }, [])
  async function carregar() {
    setCarregando(true)
    setHistorico(await listarRegulacao(atendimento.atendimento_id))
    setAbertura(await buscarAberturaRegulacao(atendimento.atendimento_id))
    setCarregando(false)
  }
  const setSinal = (k, v) => setSv((p) => ({ ...p, [k]: v }))

  async function confirmarAbertura() {
    setAbrindo(true)
    await abrirRegulacao(atendimento.atendimento_id, tipoAbertura)
    setAbrindo(false)
    carregar()
  }

  async function confirmarEncerramento() {
    setAbrindo(true)
    await encerrarRegulacao(atendimento.atendimento_id)
    setAbrindo(false)
    carregar()
  }

  async function registrar(imprimir = false) {
    if (!evolucao.trim()) { setErro('Descreva a atualização do quadro clínico.'); return }
    setErro('')
    setSalvando(true)
    const { data, error } = await registrarRegulacao({
      atendimentoId: atendimento.atendimento_id, atualizadoPor: medicoId,
      dados: {
        evolucao: evolucao.trim(), pendencias: pendencias || null, conduta: conduta || null,
        numero_solicitacao_ser: numeroSer || null,
        diagnostico_regulado: diagnosticoRegulado || null,
        mudanca_diagnostico: mudancaDiagnostico,
        novo_diagnostico_cid: mudancaDiagnostico ? (novoDiagnostico || null) : null,
        sinais_vitais: { pa_sistolica: sv.pas || null, pa_diastolica: sv.pad || null, fc: sv.fc || null, fr: sv.fr || null, temperatura: sv.temp || null, spo2: sv.spo2 || null, hgt: sv.hgt || null },
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível registrar a atualização.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    setEvolucao(''); setPendencias(''); setConduta(''); setNumeroSer('')
    setDiagnosticoRegulado(''); setMudancaDiagnostico(false); setNovoDiagnostico('')
    setSv({ pas: '', pad: '', fc: '', fr: '', temp: '', spo2: '', hgt: '' })
    carregar()
  }

  const SINAIS = [['pas', 'PA sistólica'], ['pad', 'PA diastólica'], ['fc', 'FC (bpm)'], ['fr', 'FR (irpm)'], ['temp', 'Tax (°C)'], ['spo2', 'SpO₂ (%)'], ['hgt', 'HGT (mg/dL)']]

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-body">
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-flag" /> Situação da Regulação</div>
          {carregando ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Carregando...</p>
          ) : abertura?.regulacao_flag ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13 }}>
                Regulação aberta · <b>{abertura.regulacao_tipo}</b>
                {abertura.regulacao_aberta_em && ` · desde ${new Date(abertura.regulacao_aberta_em).toLocaleDateString('pt-BR')}`}
              </span>
              <button type="button" className="btn-cancel" onClick={confirmarEncerramento} disabled={abrindo}>
                <i className="ph ph-flag-checkered" /> {abrindo ? 'Encerrando...' : 'Encerrar regulação'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Regulação não aberta.</span>
              {['SER', 'SISREG'].map((t) => (
                <button key={t} type="button" className={'btn-add-chip' + (tipoAbertura === t ? ' on' : '')} onClick={() => setTipoAbertura(t)}>{t}</button>
              ))}
              <button type="button" className="btn-save-draft" onClick={confirmarAbertura} disabled={abrindo}>
                <i className="ph ph-flag" /> {abrindo ? 'Abrindo...' : 'Abrir regulação'}
              </button>
            </div>
          )}
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clipboard-text" /> 1. Diagnóstico Regulado</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group"><label>Diagnóstico regulado</label><input type="text" value={diagnosticoRegulado} onChange={(e) => setDiagnosticoRegulado(e.target.value)} /></div>
            <div className="form-group"><label>Nº da solicitação SER / SISREG</label><input type="text" value={numeroSer} onChange={(e) => setNumeroSer(e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ gridTemplateColumns: '1fr 2fr', marginTop: 12 }}>
            <div className="form-group"><label>Mudança de diagnóstico?</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className={'btn-add-chip' + (!mudancaDiagnostico ? ' on' : '')} onClick={() => setMudancaDiagnostico(false)}>Não</button>
                <button type="button" className={'btn-add-chip' + (mudancaDiagnostico ? ' on' : '')} onClick={() => setMudancaDiagnostico(true)}>Sim</button>
              </div>
            </div>
            {mudancaDiagnostico && (
              <div className="form-group"><label>Novo diagnóstico / CID</label>
                <select value={novoDiagnostico} onChange={(e) => setNovoDiagnostico(e.target.value)}>
                  <option value="">—</option>
                  {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-heartbeat" /> 2. Sinais Vitais</div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {SINAIS.map(([k, r]) => (
              <div key={k} className="form-group"><label>{r}</label><input type="text" inputMode="decimal" value={sv[k]} onChange={(e) => setSinal(k, e.target.value)} /></div>
            ))}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-note-pencil" /> 3. Evolução / Atualização do Quadro Clínico *</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="5" value={evolucao} onChange={(e) => setEvolucao(e.target.value)} placeholder="Estado atual, evolução desde a última atualização, exames e resposta ao tratamento." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-list-checks" /> 4. Pendências e Conduta</div>
          <div className="form-group"><label>Pendências</label><textarea className="form-control-area" rows="2" value={pendencias} onChange={(e) => setPendencias(e.target.value)} /></div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Conduta</label><textarea className="form-control-area" rows="2" value={conduta} onChange={(e) => setConduta(e.target.value)} /></div>
        </div>

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
          </div>
        )}

        <div>
          <div className="form-section-box-title" style={{ position: 'static', marginBottom: 8 }}><i className="ph ph-clock-counter-clockwise" /> Histórico de Atualizações</div>
          {carregando ? <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Carregando...</p> : historico.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma atualização registrada ainda.</p>
          ) : historico.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <p style={{ margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{r.evolucao}</p>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.enfermeiros?.nome_exibicao || r.enfermeiros?.nome} · {new Date(r.atualizado_em).toLocaleString('pt-BR')}</div>
              </div>
              <button type="button" className="btn-save-draft" onClick={() => onImprimir(r)}><i className="ph ph-printer" /> Imprimir</button>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-footer">
        <button type="button" className="btn-cancel" onClick={onFechar}><i className="ph ph-x-circle" /> Cancelar</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-save-draft" onClick={() => registrar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn-save-print" onClick={() => registrar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
        </div>
      </div>
    </div>
  )
}
