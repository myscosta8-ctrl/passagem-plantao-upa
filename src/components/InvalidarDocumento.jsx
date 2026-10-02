import { useState } from 'react'
import { invalidarRegistro } from '../lib/documentos'

const ROTULOS = { rascunho: 'Rascunho', finalizado: 'Finalizado', invalido: 'Invalidado' }

// Selo com a situação do documento (rascunho / finalizado / invalidado).
export function SeloSituacao({ registro }) {
  const s = registro?.situacao || 'finalizado'
  return (
    <span className={`hc-situacao ${s}`} title={s === 'invalido' ? `Motivo: ${registro.motivo_invalidacao || '—'}` : undefined}>
      {ROTULOS[s] || s}
    </span>
  )
}

// "Invalidar" só existe para documento FINALIZADO (Finalizar e Imprimir) e só
// para quem o criou. O registro permanece, marcado como invalidado, com motivo.
export default function BotaoInvalidar({ tabela, registro, meuId, onFeito }) {
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  if (!registro || registro.situacao !== 'finalizado' || !meuId || registro.autor_auth !== meuId) return null

  async function confirmar() {
    if (!motivo.trim()) { setErro('Informe o motivo.'); return }
    setEnviando(true)
    const { error } = await invalidarRegistro(tabela, registro.id, motivo.trim())
    setEnviando(false)
    if (error) { setErro(error.message || 'Não foi possível invalidar.'); return }
    setAberto(false); setMotivo(''); setErro('')
    onFeito?.()
  }

  if (!aberto) {
    return (
      <button type="button" className="hc-btn hc-btn-perigo" onClick={() => setAberto(true)}>
        <i className="ph ph-prohibit" /> Invalidar
      </button>
    )
  }
  return (
    <div className="hc-invalidar" style={{ padding: 0 }}>
      <input type="text" autoFocus placeholder="Motivo da invalidação (obrigatório)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      <button type="button" className="hc-btn hc-btn-perigo" onClick={confirmar} disabled={enviando}>Confirmar</button>
      <button type="button" className="hc-btn" onClick={() => { setAberto(false); setErro('') }}>Voltar</button>
      {erro && <span className="hc-erro">{erro}</span>}
    </div>
  )
}
