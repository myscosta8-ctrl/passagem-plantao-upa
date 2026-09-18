import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './Auth.css'

// Bloqueia o app inteiro até a senha ser trocada — login institucional genérico
// (ex: dr.testex/123456) ou reset feito pela direção sempre caem aqui primeiro.
export default function TrocaSenhaObrigatoria() {
  const { logout, trocarSenha } = useAuth()
  const [senhaNova, setSenhaNova] = useState('')
  const [senhaConfirmar, setSenhaConfirmar] = useState('')
  const [trocando, setTrocando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (senhaNova.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senhaNova === '123456') {
      setErro('Escolha uma senha diferente da senha padrão.')
      return
    }
    if (senhaNova !== senhaConfirmar) {
      setErro('As duas senhas não são iguais.')
      return
    }
    setTrocando(true)
    const { error } = await trocarSenha(senhaNova)
    setTrocando(false)
    if (error) {
      setErro('Não foi possível trocar a senha. Tente novamente.')
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">UPA</span>
        </div>
        <h1 className="auth-title">Troca de senha obrigatória</h1>
        <p className="auth-subtitle">
          Este login está com a senha padrão. Escolha uma senha própria antes de continuar.
        </p>

        {erro && <div className="auth-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="senha-nova">Nova senha</label>
            <input
              id="senha-nova"
              type="password"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label htmlFor="senha-confirmar">Confirmar nova senha</label>
            <input
              id="senha-confirmar"
              type="password"
              value={senhaConfirmar}
              onChange={(e) => setSenhaConfirmar(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={trocando}>
            {trocando ? 'Aguarde...' : 'Trocar senha e entrar'}
          </button>
        </form>

        <div className="auth-toggle">
          <button type="button" onClick={logout}>Sair</button>
        </div>
      </div>
    </div>
  )
}
