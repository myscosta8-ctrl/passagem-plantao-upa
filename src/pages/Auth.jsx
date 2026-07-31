import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './Auth.css'

export default function Auth() {
  const { login, cadastrar } = useAuth()
  const [modo, setModo] = useState('login') // 'login' | 'cadastro'
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const resultado =
      modo === 'login'
        ? await login(username, senha)
        : await cadastrar(nome, username, senha)

    setCarregando(false)

    if (resultado.error) {
      setErro(traduzirErro(resultado.error.message))
      return
    }

    if (resultado.precisaConfirmacaoEmail) {
      setErro(
        'Cadastro criado, mas o Supabase está pedindo confirmação por e-mail. ' +
        'Peça para o administrador desativar "Confirm email" em Authentication > Providers > Email, no painel do Supabase.'
      )
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">UPA</span>
        </div>
        <h1 className="auth-title">Passagem de Plantão</h1>
        <p className="auth-subtitle">
          {modo === 'login' ? 'Entre com seu usuário de enfermagem' : 'Cadastro de novo enfermeiro'}
        </p>

        {erro && <div className="auth-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          {modo === 'cadastro' && (
            <div className="auth-field">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="ex: maria.souza"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={carregando}>
            {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-toggle">
          {modo === 'login' ? (
            <>
              Ainda não tem cadastro?
              <button type="button" onClick={() => { setModo('cadastro'); setErro('') }}>
                Cadastrar
              </button>
            </>
          ) : (
            <>
              Já tem cadastro?
              <button type="button" onClick={() => { setModo('login'); setErro('') }}>
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function traduzirErro(msg) {
  if (msg.includes('Invalid login credentials')) return 'Usuário ou senha incorretos.'
  if (msg.includes('already registered')) return 'Esse usuário já existe.'
  if (msg.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.'
  return msg
}
