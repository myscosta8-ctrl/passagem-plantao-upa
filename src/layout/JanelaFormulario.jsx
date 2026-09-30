import { useEffect } from 'react'
import './JanelaFormulario.css'
import FaixaPacienteJanela from './FaixaPacienteJanela'
import ColunaConsulta from './ColunaConsulta'

// Nova interface: o prontuário (cabeçalho do paciente + abas) fica na tela
// normal; só o formulário da aba escolhida abre numa janela flutuante que
// ocupa quase toda a tela. Sem a nova interface, mostra o formulário como hoje.
export default function JanelaFormulario({ ativa, aberta, onFechar, titulo, paciente, vazio, atendimento, categoria, children }) {
  useEffect(() => {
    if (!ativa || !aberta) return
    const esc = (e) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [ativa, aberta, onFechar])

  if (!ativa) return children
  if (!aberta) {
    if (vazio) return vazio
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
          {atendimento ? <FaixaPacienteJanela atendimento={atendimento} nomeFallback={paciente} /> : (paciente && <b className="jf-pac">{paciente}</b>)}
          <button type="button" className="jf-fechar" onClick={onFechar} aria-label="Fechar formulário"><i className="ph ph-x" /> Fechar</button>
        </div>
        <div className="jf-titulo-linha"><h2>{titulo}</h2></div>
        <div className="jf-area">
          <div className="jf-corpo">{children}</div>
          {atendimento && <ColunaConsulta atendimentoId={atendimento.atendimento_id} categoria={categoria} />}
        </div>
      </div>
    </div>
  )
}
