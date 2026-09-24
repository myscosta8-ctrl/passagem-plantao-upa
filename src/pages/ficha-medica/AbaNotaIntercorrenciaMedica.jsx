import { useEffect, useState } from 'react';
import { listarNotasIntercorrenciaMedica, criarNotaIntercorrenciaMedica } from '../../lib/pepMedico';

export default function AbaNotaIntercorrenciaMedica({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [notas, setNotas] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarNotasIntercorrenciaMedica(atendimento.atendimento_id)); setCarregando(false) }

  async function salvar() {
    if (!notas.trim()) { setErro('Preencha a nota.'); return }
    setErro('')
    setSalvando(true)
    const { error } = await criarNotaIntercorrenciaMedica({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: { notas: notas.trim() },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setNotas('')
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova nota de intercorrência médica</div>
      <div className="form-grid">
        <div className="form-field span-3"><label>Notas *</label><textarea rows={6} value={notas} onChange={(e) => setNotas(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar nota'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma nota registrada ainda.</p>
      ) : historico.map((n) => (
        <div key={n.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{n.notas}</p>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {n.enfermeiros?.nome_exibicao || n.enfermeiros?.nome} · {new Date(n.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(n)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
