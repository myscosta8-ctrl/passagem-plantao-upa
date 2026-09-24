import { useEffect, useState } from 'react';
import { listarRegulacao, registrarRegulacao, buscarAberturaRegulacao, abrirRegulacao, encerrarRegulacao, listarCatalogoCid } from '../../lib/pepMedico';

export default function AbaRegulacao({ atendimento, medicoId, onImprimir }) {
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
  const [pa, setPa] = useState({ pas: '', pad: '' })
  const [fc, setFc] = useState('')
  const [fr, setFr] = useState('')
  const [temp, setTemp] = useState('')
  const [spo2, setSpo2] = useState('')
  const [hgt, setHgt] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar(); listarCatalogoCid().then(setCids) }, [])
  async function carregar() {
    setCarregando(true)
    setHistorico(await listarRegulacao(atendimento.atendimento_id))
    setAbertura(await buscarAberturaRegulacao(atendimento.atendimento_id))
    setCarregando(false)
  }

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

  async function registrar() {
    if (!evolucao.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarRegulacao({
      atendimentoId: atendimento.atendimento_id, atualizadoPor: medicoId,
      dados: {
        evolucao: evolucao.trim(), pendencias: pendencias || null, conduta: conduta || null,
        numero_solicitacao_ser: numeroSer || null,
        diagnostico_regulado: diagnosticoRegulado || null,
        mudanca_diagnostico: mudancaDiagnostico,
        novo_diagnostico_cid: mudancaDiagnostico ? (novoDiagnostico || null) : null,
        sinais_vitais: { pa_sistolica: pa.pas || null, pa_diastolica: pa.pad || null, fc: fc || null, fr: fr || null, temperatura: temp || null, spo2: spo2 || null, hgt: hgt || null },
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível registrar a atualização.'); return }
    setEvolucao(''); setPendencias(''); setConduta(''); setNumeroSer('')
    setDiagnosticoRegulado(''); setMudancaDiagnostico(false); setNovoDiagnostico('')
    setPa({ pas: '', pad: '' }); setFc(''); setFr(''); setTemp(''); setSpo2(''); setHgt('')
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Regulação</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : abertura?.regulacao_flag ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 13 }}>
            Regulação aberta · <b>{abertura.regulacao_tipo}</b>
            {abertura.regulacao_aberta_em && ` · desde ${new Date(abertura.regulacao_aberta_em).toLocaleDateString('pt-BR')}`}
          </span>
          <button type="button" className="modal-btn-secondary" onClick={confirmarEncerramento} disabled={abrindo}>
            {abrindo ? 'Encerrando...' : 'Encerrar regulação'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Regulação não aberta.</span>
          <div className="toggle-group" style={{ maxWidth: 160 }}>
            <button type="button" className={`toggle-btn ${tipoAbertura === 'SER' ? 'on' : ''}`} onClick={() => setTipoAbertura('SER')}>SER</button>
            <button type="button" className={`toggle-btn ${tipoAbertura === 'SISREG' ? 'on' : ''}`} onClick={() => setTipoAbertura('SISREG')}>SISREG</button>
          </div>
          <button type="button" className="modal-btn-primary" onClick={confirmarAbertura} disabled={abrindo}>
            {abrindo ? 'Abrindo...' : 'Abrir regulação'}
          </button>
        </div>
      )}

      <div className="form-section-title">Nova atualização de quadro clínico (SER/SISREG)</div>
      <div className="form-grid">
        <div className="form-field span-3"><label>Diagnóstico regulado</label><input type="text" value={diagnosticoRegulado} onChange={(e) => setDiagnosticoRegulado(e.target.value)} /></div>
        <div className="form-field"><label>Mudança de diagnóstico?</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${!mudancaDiagnostico ? 'on' : ''}`} onClick={() => setMudancaDiagnostico(false)}>Não</button>
            <button type="button" className={`toggle-btn ${mudancaDiagnostico ? 'on' : ''}`} onClick={() => setMudancaDiagnostico(true)}>Sim</button>
          </div>
        </div>
        {mudancaDiagnostico && (
          <div className="form-field span-2"><label>Para (novo diagnóstico/CID)</label>
            <select value={novoDiagnostico} onChange={(e) => setNovoDiagnostico(e.target.value)}>
              <option value="">—</option>
              {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
            </select>
          </div>
        )}
        <div className="form-field"><label>Nº solicitação SER</label><input type="text" value={numeroSer} onChange={(e) => setNumeroSer(e.target.value)} /></div>
        <div className="form-field"><label>PA sistólica</label><input type="number" value={pa.pas} onChange={(e) => setPa((p) => ({ ...p, pas: e.target.value }))} /></div>
        <div className="form-field"><label>PA diastólica</label><input type="number" value={pa.pad} onChange={(e) => setPa((p) => ({ ...p, pad: e.target.value }))} /></div>
        <div className="form-field"><label>FC</label><input type="number" value={fc} onChange={(e) => setFc(e.target.value)} /></div>
        <div className="form-field"><label>FR</label><input type="number" value={fr} onChange={(e) => setFr(e.target.value)} /></div>
        <div className="form-field"><label>Temperatura</label><input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} /></div>
        <div className="form-field"><label>SpO2</label><input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} /></div>
        <div className="form-field"><label>HGT</label><input type="number" value={hgt} onChange={(e) => setHgt(e.target.value)} /></div>
        <div className="form-field span-3"><label>Evolução *</label><textarea value={evolucao} onChange={(e) => setEvolucao(e.target.value)} /></div>
        <div className="form-field span-3"><label>Pendências</label><input type="text" value={pendencias} onChange={(e) => setPendencias(e.target.value)} /></div>
        <div className="form-field span-3"><label>Conduta</label><input type="text" value={conduta} onChange={(e) => setConduta(e.target.value)} /></div>
      </div>
      {erro && <p style={{ color: 'var(--color-danger, #c0392b)', fontSize: 13 }}>{erro}</p>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={registrar} disabled={salvando || !evolucao.trim()}>{salvando ? 'Registrando...' : 'Registrar atualização'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma atualização registrada ainda.</p>
      ) : historico.map((r) => (
        <div key={r.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <p style={{ margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{r.evolucao}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {r.enfermeiros?.nome_exibicao || r.enfermeiros?.nome} · {new Date(r.atualizado_em).toLocaleString('pt-BR')}
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(r)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
