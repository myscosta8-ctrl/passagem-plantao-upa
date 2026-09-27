const fs = require('fs');

const jsx = `import { useState } from 'react'
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
    if (msg.includes('Invalid login credentials')) return 'Usuário ou senha incorretos.'
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
            {modo === 'login' ? (
              <p>Ainda não tem acesso? <button type="button" onClick={() => {setModo('cadastro'); setErro('');}}>Criar conta</button></p>
            ) : (
              <p>Já possui conta? <button type="button" onClick={() => {setModo('login'); setErro('');}}>Fazer login</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
`
fs.writeFileSync('src/pages/Auth.jsx', jsx, 'utf8');

const css = `.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.auth-brand {
  text-align: center;
}

.auth-brand .brand-icon {
  width: 64px;
  height: 64px;
  background: var(--color-primary);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
}

.auth-brand h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 4px;
}

.auth-brand p {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
}

.auth-card {
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05);
  padding: 40px;
  overflow: hidden;
}

.auth-header {
  margin-bottom: 28px;
  text-align: center;
}

.auth-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-strong);
  margin: 0 0 6px;
}

.auth-header p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 6px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 16px;
  color: #94A3B8;
  font-size: 18px;
}

.input-with-icon input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 44px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 14.5px;
  color: var(--color-text-strong);
  transition: all 0.2s;
}

.input-with-icon input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.input-with-icon input:focus + i, .input-with-icon input:not(:placeholder-shown) + i {
  color: var(--color-primary);
}

.auth-error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.4;
}

.auth-error i {
  font-size: 18px;
  margin-top: 1px;
}

.auth-submit {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-submit:hover:not(:disabled) {
  background: #1D4ED8;
  transform: translateY(-1px);
}

.auth-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 28px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}

.auth-footer button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.auth-footer button:hover {
  text-decoration: underline;
}
`
fs.writeFileSync('src/pages/Auth.css', css, 'utf8');
