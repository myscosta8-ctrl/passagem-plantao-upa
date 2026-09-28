import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './Auth.css'

export default function Auth() {
  const { login, cadastrar } = useAuth()
  const [modo, setModo] = useState('login')
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  function traduzirErro(msg) {
    if (msg.includes('Invalid login credentials')) return 'Usuário ou senha incorretos. Confira se a senha foi digitada sem letra maiúscula no início (o celular costuma colocar sozinho). Se a senha foi resetada, vale só a última informada pela direção.'
    if (msg.includes('User already registered')) return 'Este usuário já está cadastrado.'
    return 'Erro: ' + msg
  }

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
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-icon">
            <i className="ph ph-heartbeat"></i>
          </div>
          <h1>Passagem de Plantão</h1>
          <p>UPA 24H Breves - SEMSA</p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>{modo === 'login' ? 'Acesso ao Sistema' : 'Criar Conta'}</h2>
            <p>{modo === 'login' ? 'Insira suas credenciais para entrar' : 'Cadastre-se para acessar'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {modo === 'cadastro' && (
              <div className="form-group">
                <label>Nome Completo</label>
                <div className="input-with-icon">
                  <i className="ph ph-user"></i>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={carregando}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Usuário ou E-mail</label>
              <div className="input-with-icon">
                <i className="ph ph-envelope-simple"></i>
                <input
                  type="text"
                  required
                  placeholder="Seu usuário"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div className="input-with-icon">
                <i className="ph ph-lock-key"></i>
                <input
                  type="password"
                  required
                  placeholder="Sua senha"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                />
              </div>
            </div>

            {erro && (
              <div className="auth-error">
                <i className="ph ph-warning-circle"></i>
                {erro}
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit" disabled={carregando}>
              {carregando ? (
                <><i className="ph ph-spinner ph-spin"></i> Aguarde...</>
              ) : (
                modo === 'login' ? 'Entrar no Sistema' : 'Cadastrar'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p><i className="ph ph-info"></i> Ainda não tem acesso? Procure o setor administrativo da UPA 24h Breves para solicitar seu usuário e senha.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
