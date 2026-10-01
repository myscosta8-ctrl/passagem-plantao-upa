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
  const [verSenha, setVerSenha] = useState(false)

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
    <div className="auth-screen auth-dividida">
      <aside className="auth-lado">
        <div className="auth-marca">
          <div className="auth-marca-icone"><i className="ph ph-heartbeat"></i></div>
          <div>
            <h1>Passagem de Plantão</h1>
            <p>UPA 24h Breves · SEMSA</p>
          </div>
        </div>
        <div className="auth-lado-meio">
          <h2>Prontuário e passagem de plantão em um só lugar.</h2>
          <p>Leitos, evoluções, prescrições e desfechos da unidade, com acesso restrito à equipe.</p>
        </div>
        <div className="auth-logos">
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
          <img src="./logos/semsa.jpg" alt="SEMSA" />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        </div>
      </aside>

      <main className="auth-principal">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{modo === 'login' ? 'Acesso ao sistema' : 'Criar conta'}</h2>
            <p>{modo === 'login' ? 'Entre com seu usuário e senha.' : 'Cadastre-se para acessar.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {modo === 'cadastro' && (
              <div className="form-group">
                <label htmlFor="auth-nome">Nome completo</label>
                <div className="input-with-icon">
                  <i className="ph ph-user"></i>
                  <input id="auth-nome" type="text" required placeholder="Ex: Maria da Silva" value={nome} onChange={(e) => setNome(e.target.value)} disabled={carregando} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-usuario">Usuário ou e-mail</label>
              <div className="input-with-icon">
                <i className="ph ph-user-circle"></i>
                <input
                  id="auth-usuario"
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
              <label htmlFor="auth-senha">Senha</label>
              <div className="input-with-icon">
                <i className="ph ph-lock-key"></i>
                <input
                  id="auth-senha"
                  type={verSenha ? 'text' : 'password'}
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
                <button type="button" className="auth-ver-senha" onClick={() => setVerSenha((v) => !v)} aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'} title={verSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                  <i className={'ph ' + (verSenha ? 'ph-eye-slash' : 'ph-eye')}></i>
                </button>
              </div>
            </div>

            {erro && (
              <div className="auth-error">
                <i className="ph ph-warning-circle"></i>
                <span>{erro}</span>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={carregando}>
              {carregando ? (
                <><i className="ph ph-spinner ph-spin"></i> Entrando...</>
              ) : (
                modo === 'login' ? 'Entrar' : 'Cadastrar'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <i className="ph ph-info"></i>
            <p>Ainda não tem acesso? Procure o setor administrativo da UPA 24h Breves para solicitar seu usuário e senha.</p>
          </div>
        </div>
        <p className="auth-rodape">Uso restrito à equipe da UPA 24h Breves</p>
      </main>
    </div>
  )
}
