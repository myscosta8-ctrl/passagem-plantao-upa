import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { carregarLeitosOcupadosPep, registrarDesfechoPep } from '../../lib/pepAtendimentos'
import ModalDesfecho from '../ModalDesfecho'

// Sinalização administrativa de desfecho — a Recepção registra o que
// aconteceu (alta/transferência/evasão/óbito) sem tomar a decisão clínica,
// que já foi tomada pela equipe assistencial antes de avisar aqui.
export default function AbaDesfecho() {
  const { enfermeiro } = useAuth()
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [alvo, setAlvo] = useState(null) // { atendimentoId, leitoId, nome, numeroLeito }
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const { pacientesPorLeito } = await carregarLeitosOcupadosPep()
    setPacientes(
      Object.entries(pacientesPorLeito)
        .map(([leitoId, p]) => ({ ...p, leitoId }))
        .sort((a, b) => a.nome.localeCompare(b.nome))
    )
    setCarregando(false)
  }

  async function confirmar(tipo, detalhe, dadosObito) {
    if (!alvo) return
    setProcessando(true)
    const { error } = await registrarDesfechoPep({
      atendimentoId: alvo.atendimentoId,
      leitoId: alvo.leitoId,
      tipo,
      detalhe,
      autorId: enfermeiro?.id,
      dadosObito,
    })
    setProcessando(false)
    if (!error) {
      setAlvo(null)
      carregar()
    } else {
      setErro('Não foi possível sinalizar o desfecho. Tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao sinalizar desfecho:', error)
    }
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Sinalizar desfecho</div>
      <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: -8, marginBottom: 16 }}>
        Registre aqui o que já foi decidido pela equipe assistencial (alta, transferência, evasão ou óbito) —
        é só a sinalização administrativa que libera o leito, não uma decisão clínica.
      </p>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : pacientes.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum paciente internado no momento.</p>
      ) : (
        pacientes.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.nome}</div>
              <div style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>
                {p.diagnostico || 'Sem diagnóstico registrado'}
              </div>
            </div>
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={() => setAlvo({ atendimentoId: p.id, leitoId: p.leito_atual_id, nome: p.nome })}
            >
              Sinalizar desfecho
            </button>
          </div>
        ))
      )}

      {alvo && (
        <ModalDesfecho
          nomePaciente={alvo.nome}
          processando={processando}
          onCancelar={() => setAlvo(null)}
          onConfirmar={confirmar}
        />
      )}
    </div>
  )
}
