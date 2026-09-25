import { useEffect, useState } from 'react';
import { listarBalancoHidrico, registrarBalancoHidrico } from '../../lib/pepClinico';
import { VIAS_ENTRADA, VIAS_SAIDA } from './constantes';

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
  const saldo = totalEntradas - totalSaidas
  const opcoesVia = tipo === 'entrada' ? VIAS_ENTRADA : VIAS_SAIDA

  return (
    <div className="clinical-card">
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-drop" /> Balanço Hídrico 24h</h2>
          <p>Registro de entradas e saídas do atendimento, com totalização cumulativa.</p>
        </div>
      </div>

      <div className="cc-body">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: 8, padding: '8px 16px' }}>
            <i className="ph ph-arrow-down-left" style={{ fontSize: 20, color: '#0284C7' }} />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Entradas</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{totalEntradas} mL</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 16px' }}>
            <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: '#D97706' }} />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Saídas</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{totalSaidas} mL</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: saldo >= 0 ? '#DCFCE7' : '#FEE2E2', border: `1px solid ${saldo >= 0 ? '#BBF7D0' : '#FECACA'}`, borderRadius: 8, padding: '8px 16px' }}>
            <i className="ph ph-scales" style={{ fontSize: 20, color: saldo >= 0 ? '#16A34A' : '#DC2626' }} />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Balanço Cumulativo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: saldo >= 0 ? '#16A34A' : '#DC2626' }}>{saldo >= 0 ? '+' : '−'} {Math.abs(saldo)} mL</div>
            </div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-plus-circle" /> Novo Registro</div>

          <div className="form-group">
            <label>Tipo:</label>
            <div className="checkbox-group" style={{ flexDirection: 'row' }}>
              <label className="checkbox-item">
                <input type="radio" name="bh-tipo" checked={tipo === 'entrada'} onChange={() => { setTipo('entrada'); setVia('') }} /> Entrada
              </label>
              <label className="checkbox-item">
                <input type="radio" name="bh-tipo" checked={tipo === 'saida'} onChange={() => { setTipo('saida'); setVia('') }} /> Saída
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Via:</label>
            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {opcoesVia.map((v) => (
                <label key={v} className="checkbox-item">
                  <input type="radio" name="bh-via" checked={via === v} onChange={() => setVia(v)} /> {v}
                </label>
              ))}
            </div>
          </div>

          <div className="assess-grid">
            <div className="form-group">
              <label>Volume (mL)</label>
              <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Observação</label>
              <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>
          </div>

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}

          <button type="button" className="btn-add-chip" onClick={registrar} disabled={salvando || !via || !volume}>
            <i className="ph ph-plus" /> {salvando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clock-counter-clockwise" /> Histórico de Lançamentos</div>
          {carregando ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Carregando...</p>
          ) : historico.length === 0 ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Nenhum registro ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {historico.map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 12,
                  }}
                >
                  <div>
                    <span style={{ color: '#94A3B8', marginRight: 10 }}>{new Date(h.registrado_em).toLocaleString('pt-BR')}</span>
                    <strong style={{ color: h.tipo === 'entrada' ? '#0284C7' : '#DC2626' }}>{h.tipo === 'entrada' ? 'Entrada' : 'Saída'}</strong>
                    {' · '}{h.via}
                    {h.observacao && <span style={{ color: '#64748B' }}> — {h.observacao}</span>}
                  </div>
                  <strong>{h.tipo === 'entrada' ? '+' : '−'}{h.volume_ml} mL</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cc-footer">
        <span />
        {onImprimir && (
          <button
            type="button"
            className="btn-save-print"
            onClick={() => onImprimir({ historico, totalEntradas, totalSaidas, saldo })}
          >
            <i className="ph ph-printer" /> Imprimir Balanço 24h
          </button>
        )}
      </div>
    </div>
  )
}
