import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './Auth.css'

export default function CompletarPerfil() {
  const { completarPerfil, logout } = useAuth()
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await completarPerfil(nome)
    setCarregando(false)
    if (error) setErro(error.message)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Falta seu nome</h1>
        <p className="auth-subtitle">
          Essa conta ainda não tem um nome cadastrado. Preencha para continuar.
        </p>

        {erro && <div className="auth-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button className="auth-submit" type="submit" disabled={carregando}>
            {carregando ? 'Aguarde...' : 'Salvar e continuar'}
          </button>
        </form>

        <div className="auth-toggle">
          <button type="button" onClick={logout}>Sair e usar outra conta</button>
        </div>
      </div>
    </div>
  )
}
