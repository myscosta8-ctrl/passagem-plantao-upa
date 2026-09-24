import { useState, useEffect } from 'react'
import { estaOnline, ouvirStatusConexao } from '../lib/offlineManager.js'
import './StatusConexao.css'

export default function StatusConexao() {
  const [online, setOnline] = useState(estaOnline)
  const [mostrarReconectado, setMostrarReconectado] = useState(false)

  useEffect(() => {
    const desinscrever = ouvirStatusConexao((novoStatus) => {
      setOnline(novoStatus)
      if (novoStatus) {
        setMostrarReconectado(true)
        const timer = setTimeout(() => {
          setMostrarReconectado(false)
        }, 4000)
        return () => clearTimeout(timer)
      } else {
        setMostrarReconectado(false)
      }
    })
    return desinscrever
  }, [])

  if (online && !mostrarReconectado) {
    return null
  }

  return (
    <aside
      className={`status-conexao-banner ${online ? 'online' : 'offline'}`}
      role="status"
      aria-live="polite"
    >
      <div className="status-conexao-conteudo">
        <span className="status-conexao-icone" aria-hidden="true">
          {online ? '🟢' : '⚠️'}
        </span>
        <div className="status-conexao-texto">
          {online ? (
            <span>
              <strong>Conexão restabelecida!</strong> Sincronizando dados com o servidor da UPA...
            </span>
          ) : (
            <span>
              <strong>Modo Offline Ativado:</strong> Sem sinal de rede na UPA. Você pode continuar visualizando telas e digitando — seus rascunhos estão seguros neste dispositivo.
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
