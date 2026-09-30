import { useEffect } from 'react'
import './JanelaFormulario.css'

// Nova interface: o prontuário (cabeçalho do paciente + abas) fica na tela
// normal; só o formulário da aba escolhida abre numa janela flutuante que
// ocupa quase toda a tela. Sem a nova interface, mostra o formulário como hoje.
export default function JanelaFormulario({ ativa, aberta, onFechar, titulo, paciente, children }) {
  useEffect(() => {
    if (!ativa || !aberta) return
    const esc = (e) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [ativa, aberta, onFechar])

  if (!ativa) return children
  if (!aberta) {
    return (
      <div className="jf-dica">
        <i className="ph ph-hand-pointing" /> Escolha uma aba acima para abrir o formulário.
      </div>
    )
  }
  return (
    <div className="jf-fundo" onClick={onFechar}>
      <div className="jf-janela" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="jf-topo">
          {paciente && <b className="jf-pac">{paciente}</b>}
          <span className="jf-titulo">{titulo}</span>
          <button type="button" className="jf-fechar" onClick={onFechar} aria-label="Fechar formulário"><i className="ph ph-x" /> Fechar</button>
        </div>
        <div className="jf-corpo">{children}</div>
      </div>
    </div>
  )
}
