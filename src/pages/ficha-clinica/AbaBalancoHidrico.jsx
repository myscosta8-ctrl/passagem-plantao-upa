import { useEffect, useState } from 'react';
import { listarBalancoHidrico, registrarBalancoHidrico } from '../../lib/pepClinico';

export default function AbaBalancoHidrico({ atendimento, autorId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('entrada')
  const [via, setVia] = useState('')
  const [volume, setVolume] = useState('')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarBalancoHidrico(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!via || !volume) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarBalancoHidrico({
      atendimentoId: atendimento.atendimento_id, registradoPor: autorId, tipo, via, volumeMl: volume, observacao,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setVia('')
    setVolume('')
    setObservacao('')
    carregar()
  }

  const totalEntradas = historico.filter((h) => h.tipo === 'entrada').reduce((s, h) => s + Number(h.volume_ml), 0)
  const totalSaidas = historico.filter((h) => h.tipo === 'saida').reduce((s, h) => s + Number(h.volume_ml), 0)
  const opcoesVia = tipo === 'entrada' ? VIAS_ENTRADA : VIAS_SAIDA

  return (
    <div className="form-section">
      <div className="form-section-title">Novo registro</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Tipo</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${tipo === 'entrada' ? 'on' : ''}`} onClick={() => { setTipo('entrada'); setVia('') }}>Entrada</button>
            <button type="button" className={`toggle-btn ${tipo === 'saida' ? 'on' : ''}`} onClick={() => { setTipo('saida'); setVia('') }}>Saída</button>
          </div>
        </div>
        <div className="form-field">
          <label>Via</label>
          <div className="chip-group">
            {opcoesVia.map((v) => (
              <button key={v} type="button" className={`chip ${via === v ? 'on' : ''}`} onClick={() => setVia(v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Volume (mL)</label><input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} /></div>
        <div className="form-field span-2"><label>Observação</label><input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !via || !volume}>
        {salvando ? 'Registrando...' : 'Registrar'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 }}>
        <div className="form-section-title" style={{ margin: 0 }}>
          Totais — Entradas {totalEntradas} mL · Saídas {totalSaidas} mL · Saldo {totalEntradas - totalSaidas} mL
        </div>
        {onImprimir && (
          <button
            type="button"
            className="submit-btn"
            style={{ maxWidth: 220, padding: '6px 12px', fontSize: 11.5 }}
            onClick={() => onImprimir({ historico, totalEntradas, totalSaidas, saldo: totalEntradas - totalSaidas })}
          >
            🖨️ Imprimir Balanço 24h
          </button>
        )}
      </div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum registro ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr><th>Data/hora</th><th>Tipo</th><th>Via</th><th>Volume</th><th className="col-larga">Observação</th></tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.id}>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(h.registrado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ color: h.tipo === 'entrada' ? 'var(--c-primary)' : 'var(--c-danger)', fontWeight: 600 }}>
                    {h.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </td>
                  <td>{h.via}</td>
                  <td>{h.tipo === 'entrada' ? '+' : '−'}{h.volume_ml} mL</td>
                  <td className="col-larga" style={{ color: 'var(--c-text-muted)' }}>{h.observacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
