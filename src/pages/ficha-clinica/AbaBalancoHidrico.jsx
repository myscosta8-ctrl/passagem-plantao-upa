import { useEffect, useState } from 'react';
import { listarBalancoHidrico, registrarBalancoHidrico } from '../../lib/pepClinico';
import { VIAS_ENTRADA, VIAS_SAIDA } from './constantes';

const NOVA_LINHA_VAZIA = { via: '', volume: '', observacao: '' }

function TabelaBalanco({ titulo, icon, corHeader, linhas, colunaItem, opcoesVia, novaLinha, onNovaLinha, onAdicionar, salvando, totalTurno }) {
  return (
    <div style={{ border: '1px solid #CBD5E1', borderRadius: 8, overflow: 'hidden', background: '#fff', flex: 1, minWidth: 280 }}>
      <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: corHeader.bg, color: corHeader.text }}>
        <span><i className={`ph ${icon}`} /> {titulo}</span>
        <span style={{ fontSize: 11 }}>Total: <strong>{totalTurno} mL</strong></span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#F1F5F9' }}>
            <th style={{ padding: '6px 8px', fontSize: 10.5, fontWeight: 700, color: '#64748B', textAlign: 'left', textTransform: 'uppercase' }}>Hora</th>
            <th style={{ padding: '6px 8px', fontSize: 10.5, fontWeight: 700, color: '#64748B', textAlign: 'left', textTransform: 'uppercase' }}>{colunaItem}</th>
            <th style={{ padding: '6px 8px', fontSize: 10.5, fontWeight: 700, color: '#64748B', textAlign: 'right', textTransform: 'uppercase' }}>Volume (mL)</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((h) => (
            <tr key={h.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '6px 8px', color: '#64748B' }}>{new Date(h.registrado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
              <td style={{ padding: '6px 8px' }}>
                <strong>{h.via}</strong>{h.observacao ? ` — ${h.observacao}` : ''}
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{h.volume_ml}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: '6px 8px', color: '#94A3B8', fontSize: 11 }}>Agora</td>
            <td style={{ padding: '6px 8px' }}>
              <select value={novaLinha.via} onChange={(e) => onNovaLinha({ ...novaLinha, via: e.target.value })} style={{ width: '100%', marginBottom: 4 }}>
                <option value="">Selecione...</option>
                {opcoesVia.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <input type="text" placeholder="Observação (opcional)" value={novaLinha.observacao} onChange={(e) => onNovaLinha({ ...novaLinha, observacao: e.target.value })} style={{ width: '100%' }} />
            </td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>
              <input type="number" placeholder="mL" value={novaLinha.volume} onChange={(e) => onNovaLinha({ ...novaLinha, volume: e.target.value })} style={{ width: 70, textAlign: 'right', marginBottom: 4 }} />
              <button type="button" className="btn-add-chip" onClick={onAdicionar} disabled={salvando || !novaLinha.via || !novaLinha.volume} style={{ width: '100%', justifyContent: 'center' }}>
                <i className="ph ph-plus" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function AbaBalancoHidrico({ atendimento, autorId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [novaEntrada, setNovaEntrada] = useState({ ...NOVA_LINHA_VAZIA })
  const [novaSaida, setNovaSaida] = useState({ ...NOVA_LINHA_VAZIA })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarBalancoHidrico(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function adicionarLinha(tipo, linha, limpar) {
    if (!linha.via || !linha.volume) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarBalancoHidrico({
      atendimentoId: atendimento.atendimento_id, registradoPor: autorId, tipo, via: linha.via, volumeMl: linha.volume, observacao: linha.observacao,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    limpar()
    carregar()
  }

  const entradas = historico.filter((h) => h.tipo === 'entrada')
  const saidas = historico.filter((h) => h.tipo === 'saida')
  const totalEntradas = entradas.reduce((s, h) => s + Number(h.volume_ml), 0)
  const totalSaidas = saidas.reduce((s, h) => s + Number(h.volume_ml), 0)
  const saldo = totalEntradas - totalSaidas

  return (
    <div className="clinical-card">
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-drop" /> Balanço Hídrico 24h</h2>
          <p>Grade de entradas e saídas do atendimento, com totalização cumulativa.</p>
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

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}>
              <i className="ph ph-warning" /> {erro}
            </div>
          </div>
        )}

        {carregando ? (
          <p style={{ fontSize: 11, color: '#94A3B8' }}>Carregando...</p>
        ) : (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <TabelaBalanco
              titulo="Entradas / Ingesta / Soluções (mL)"
              icon="ph-plus-circle"
              corHeader={{ bg: '#E0F2FE', text: '#0369A1' }}
              linhas={entradas}
              colunaItem="Via / Observação"
              opcoesVia={VIAS_ENTRADA}
              novaLinha={novaEntrada}
              onNovaLinha={setNovaEntrada}
              onAdicionar={() => adicionarLinha('entrada', novaEntrada, () => setNovaEntrada({ ...NOVA_LINHA_VAZIA }))}
              salvando={salvando}
              totalTurno={totalEntradas}
            />
            <TabelaBalanco
              titulo="Saídas / Eliminações / Drenagens (mL)"
              icon="ph-minus-circle"
              corHeader={{ bg: '#FEF3C7', text: '#92400E' }}
              linhas={saidas}
              colunaItem="Tipo / Aspecto"
              opcoesVia={VIAS_SAIDA}
              novaLinha={novaSaida}
              onNovaLinha={setNovaSaida}
              onAdicionar={() => adicionarLinha('saida', novaSaida, () => setNovaSaida({ ...NOVA_LINHA_VAZIA }))}
              salvando={salvando}
              totalTurno={totalSaidas}
            />
          </div>
        )}
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
