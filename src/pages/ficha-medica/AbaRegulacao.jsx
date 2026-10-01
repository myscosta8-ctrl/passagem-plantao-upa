import { useEffect, useState } from 'react';
import { registrarRegulacao, buscarAberturaRegulacao, abrirRegulacao, encerrarRegulacao, pesquisarCid } from '../../lib/pepMedico';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'

// Atualização de Quadro Clínico para a regulação (SER / SISREG).
export default function AbaRegulacao({ atendimento, medicoId, onImprimir, onFechar }) {
  const [carregando, setCarregando] = useState(true)
  const [abertura, setAbertura] = useState(null)
  const [tipoAbertura, setTipoAbertura] = useState('SER')
  const [abrindo, setAbrindo] = useState(false)
  const [evolucao, setEvolucao] = useState('')
  const [pendencias, setPendencias] = useState('')
  const [conduta, setConduta] = useState('')
  const [numeroSer, setNumeroSer] = useState('')
  const [destSer, setDestSer] = useState(false)
  const [destSisreg, setDestSisreg] = useState(false)
  const [numeroSisreg, setNumeroSisreg] = useState('')
  const [diagnosticoRegulado, setDiagnosticoRegulado] = useState('')
  const [mudancaDiagnostico, setMudancaDiagnostico] = useState(false)
  const [novoDiagnostico, setNovoDiagnostico] = useState('')
  const [cids, setCids] = useState([])
  const [sv, setSv] = useState({ pas: '', pad: '', fc: '', fr: '', temp: '', spo2: '', hgt: '' })
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  const [buscaCid, setBuscaCid] = useState('')
  const rascunho = useRascunho({ tabela: 'regulacao_atualizacoes', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { evolucao: [evolucao, setEvolucao], pendencias: [pendencias, setPendencias], conduta: [conduta, setConduta], numeroSer: [numeroSer, setNumeroSer], destSer: [destSer, setDestSer], destSisreg: [destSisreg, setDestSisreg], numeroSisreg: [numeroSisreg, setNumeroSisreg], diagnosticoRegulado: [diagnosticoRegulado, setDiagnosticoRegulado], mudancaDiagnostico: [mudancaDiagnostico, setMudancaDiagnostico], novoDiagnostico: [novoDiagnostico, setNovoDiagnostico], buscaCid: [buscaCid, setBuscaCid], sv: [sv, setSv] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.') })
  useEffect(() => {
    const t = setTimeout(() => { pesquisarCid(buscaCid).then(setCids) }, 250)
    return () => clearTimeout(t)
  }, [buscaCid])
  async function carregar() {
    setCarregando(true)
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
    if (!destSer && !destSisreg) { setErro('Marque o destino do documento: SER, SISREG ou ambos.'); return }
    if (!evolucao.trim()) { setErro('Descreva a atualização do quadro clínico.'); return }
    setErro('')
    setSalvando(true)
    const { data, error } = await registrarRegulacao({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id, atualizadoPor: medicoId,
      dados: {
        evolucao: evolucao.trim(), pendencias: pendencias || null, conduta: conduta || null,
        destino_ser: destSer, destino_sisreg: destSisreg,
        numero_solicitacao_ser: destSer ? (numeroSer || null) : null,
        numero_solicitacao_sisreg: destSisreg ? (numeroSisreg || null) : null,
        diagnostico_regulado: diagnosticoRegulado || null,
        mudanca_diagnostico: mudancaDiagnostico,
        novo_diagnostico_cid: mudancaDiagnostico ? (novoDiagnostico || null) : null,
        sinais_vitais: { pa_sistolica: sv.pas || null, pa_diastolica: sv.pad || null, fc: sv.fc || null, fr: sv.fr || null, temperatura: sv.temp || null, spo2: sv.spo2 || null, hgt: sv.hgt || null },
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível registrar a atualização.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); carregar?.(); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
    setEvolucao(''); setPendencias(''); setConduta(''); setNumeroSer(''); setNumeroSisreg(''); setDestSer(false); setDestSisreg(false)
    setDiagnosticoRegulado(''); setMudancaDiagnostico(false); setNovoDiagnostico(''); setBuscaCid('')
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
              <span style={{ fontSize: 14 }}>
                Regulação aberta · <b>{abertura.regulacao_tipo}</b>
                {abertura.regulacao_aberta_em && ` · desde ${new Date(abertura.regulacao_aberta_em).toLocaleDateString('pt-BR')}`}
              </span>
              <button type="button" className="btn-cancel" onClick={confirmarEncerramento} disabled={abrindo}>
                <i className="ph ph-flag-checkered" /> {abrindo ? 'Encerrando...' : 'Encerrar regulação'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Regulação não aberta.</span>
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
          <div className="form-section-box-title"><i className="ph ph-clipboard-text" /> Diagnóstico Regulado</div>
          <div className="form-group" style={{ marginBottom: 12 }}><label>Destino do documento (marque um ou ambos)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className={'btn-add-chip' + (destSer ? ' on' : '')} onClick={() => setDestSer((v) => !v)}>{destSer ? '✓ ' : ''}SER</button>
              <button type="button" className={'btn-add-chip' + (destSisreg ? ' on' : '')} onClick={() => setDestSisreg((v) => !v)}>{destSisreg ? '✓ ' : ''}SISREG</button>
            </div>
          </div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Diagnóstico regulado</label><input type="text" value={diagnosticoRegulado} onChange={(e) => setDiagnosticoRegulado(e.target.value)} /></div>
            {destSer && <div className="form-group"><label>Nº da solicitação no SER</label><input type="text" value={numeroSer} onChange={(e) => setNumeroSer(e.target.value)} /></div>}
            {destSisreg && <div className="form-group"><label>Nº da solicitação no SISREG</label><input type="text" value={numeroSisreg} onChange={(e) => setNumeroSisreg(e.target.value)} /></div>}
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
                <input type="text" list="regulacao-cids" placeholder="Digite o código ou a doença (mín. 2 letras)..."
                  value={buscaCid}
                  onChange={(e) => {
                    const v = e.target.value
                    setBuscaCid(v)
                    const escolhido = cids.find((c) => `${c.codigo} — ${c.descricao}` === v)
                    setNovoDiagnostico(escolhido ? escolhido.codigo : '')
                  }} />
                <datalist id="regulacao-cids">
                  {cids.map((c) => <option key={c.codigo} value={`${c.codigo} — ${c.descricao}`} />)}
                </datalist>
                {buscaCid && !novoDiagnostico && <small style={{ color: '#B45309' }}>Selecione um CID da lista.</small>}
              </div>
            )}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-heartbeat" /> Sinais Vitais</div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {SINAIS.map(([k, r]) => (
              <div key={k} className="form-group"><label>{r}</label><input type="text" inputMode="decimal" value={sv[k]} onChange={(e) => setSinal(k, e.target.value)} /></div>
            ))}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-note-pencil" /> Evolução / Atualização do Quadro Clínico *</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="5" value={evolucao} onChange={(e) => setEvolucao(e.target.value)} placeholder="Estado atual, evolução desde a última atualização, exames e resposta ao tratamento." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-list-checks" /> Pendências e Conduta</div>
          <div className="form-group"><label>Pendências</label><textarea className="form-control-area" rows="2" value={pendencias} onChange={(e) => setPendencias(e.target.value)} /></div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Conduta</label><textarea className="form-control-area" rows="2" value={conduta} onChange={(e) => setConduta(e.target.value)} /></div>
        </div>

        {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
          </div>
        )}

      </div>

      <div className="cc-footer">
        <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> Cancelar</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
          <button type="button" className="btn-save-draft" onClick={() => registrar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn-save-print" onClick={() => registrar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
        </div>
      </div>
    </div>
  )
}
