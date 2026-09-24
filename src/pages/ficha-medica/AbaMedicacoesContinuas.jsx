import { useEffect, useState } from 'react';
import { listarMedicacoesContinuas, registrarMedicacaoContinua, suspenderMedicacaoContinua } from '../../lib/pepMedico';

export default function AbaMedicacoesContinuas({ atendimento, medicoId }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [medicamento, setMedicamento] = useState('')
  const [dose, setDose] = useState('')
  const [frequencia, setFrequencia] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarMedicacoesContinuas(atendimento.pessoa_id))
    setCarregando(false)
  }

  async function adicionar() {
    if (!medicamento.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarMedicacaoContinua({ pessoaId: atendimento.pessoa_id, medicamento: medicamento.trim(), dose, frequencia, registradoPor: medicoId })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setMedicamento('')
    setDose('')
    setFrequencia('')
    carregar()
  }

  async function suspender(id) {
    await suspenderMedicacaoContinua(id)
    carregar()
  }

  const ativas = lista.filter((m) => m.status === 'ativo')
  const suspensas = lista.filter((m) => m.status !== 'ativo')

  return (
    <div className="form-section">
      <div className="form-section-title">Nova medicação de uso contínuo</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Uso contínuo em casa (reconciliação medicamentosa) — fica ligado à pessoa, não só a este atendimento, e continua valendo em internações futuras até ser suspenso.
      </p>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field span-2"><label>Medicamento *</label><input type="text" value={medicamento} onChange={(e) => setMedicamento(e.target.value)} /></div>
        <div className="form-field"><label>Dose</label><input type="text" value={dose} onChange={(e) => setDose(e.target.value)} /></div>
        <div className="form-field"><label>Frequência</label><input type="text" placeholder="ex: 1x/dia" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={adicionar} disabled={salvando || !medicamento.trim()}>{salvando ? 'Salvando...' : '+ Adicionar'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativas</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : ativas.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma medicação contínua ativa.</p>
      ) : ativas.map((m) => (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
          <span>{m.medicamento}{m.dose ? ` · ${m.dose}` : ''}{m.frequencia ? ` · ${m.frequencia}` : ''}</span>
          <button type="button" className="modal-btn-secondary" onClick={() => suspender(m.id)}>Suspender</button>
        </div>
      ))}

      {suspensas.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Suspensas</div>
          {suspensas.map((m) => (
            <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 12.5, color: 'var(--color-text-muted)' }}>
              {m.medicamento}{m.dose ? ` · ${m.dose}` : ''}{m.frequencia ? ` · ${m.frequencia}` : ''}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
