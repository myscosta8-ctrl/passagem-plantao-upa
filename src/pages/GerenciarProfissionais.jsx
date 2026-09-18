import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ConfirmModal from './ConfirmModal'

const TIPOS = [
  { valor: 'medico', rotulo: 'Médico' },
  { valor: 'farmaceutico', rotulo: 'Farmacêutico' },
]

export default function GerenciarProfissionais({ onVoltar }) {
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [tipo, setTipo] = useState('medico')
  const [crm, setCrm] = useState('')
  const [criando, setCriando] = useState(false)
  const [erroCriar, setErroCriar] = useState('')
  const [loginCriado, setLoginCriado] = useState(null)

  const [confirmandoReset, setConfirmandoReset] = useState(null)
  const [resetando, setResetando] = useState(false)
  const [erroReset, setErroReset] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('enfermeiros')
      .select('id, nome, nome_exibicao, tipo, crm, role, deve_trocar_senha')
      .neq('tipo', 'enfermagem')
      .order('nome')
    setProfissionais(data ?? [])
    setCarregando(false)
  }

  async function criarLogin(e) {
    e.preventDefault()
    setErroCriar('')
    setLoginCriado(null)
    if (!nome.trim() || !username.trim()) {
      setErroCriar('Preencha nome e usuário.')
      return
    }
    setCriando(true)
    const { data, error } = await supabase.functions.invoke('criar-login-profissional', {
      body: { nome: nome.trim(), username: username.trim(), tipo, crm: crm.trim() },
    })
    setCriando(false)
    if (error || data?.error) {
      setErroCriar(data?.error || 'Não foi possível criar o login. Tente de novo.')
      return
    }
    setLoginCriado(data)
    setNome('')
    setUsername('')
    setCrm('')
    carregar()
  }

  async function confirmarReset() {
    if (!confirmandoReset) return
    setResetando(true)
    setErroReset('')
    const { data, error } = await supabase.functions.invoke('resetar-senha-profissional', {
      body: { profissional_id: confirmandoReset.id },
    })
    setResetando(false)
    if (error || data?.error) {
      setErroReset(data?.error || 'Não foi possível resetar a senha.')
      return
    }
    setConfirmandoReset(null)
    carregar()
  }

  return (
    <div className="page">
      <button className="voltar-topo" onClick={onVoltar}>← Voltar ao painel</button>
      <h1 className="page-title">Gerenciar profissionais</h1>
      <p className="page-subtitle">Login institucional de médico e farmacêutico — senha padrão trocada obrigatoriamente no primeiro acesso.</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-label">Criar novo login</div>
        <form onSubmit={criarLogin}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nome completo</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Usuário (login)</label>
            <input
              type="text"
              placeholder="ex: dr.testex"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Tipo</label>
            <div className="toggle-group">
              {TIPOS.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  className={`toggle-btn ${tipo === t.valor ? 'on' : ''}`}
                  onClick={() => setTipo(t.valor)}
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>
          {tipo === 'medico' && (
            <div className="field" style={{ marginBottom: 14 }}>
              <label>CRM</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
              />
            </div>
          )}
          {erroCriar && <div className="error-box" style={{ marginBottom: 14 }}>{erroCriar}</div>}
          {loginCriado && (
            <p style={{ fontSize: 13, color: 'var(--color-success)', marginBottom: 14 }}>
              Login criado: <b>{loginCriado.username}</b> — senha padrão <b>{loginCriado.senha_padrao}</b> (o sistema vai pedir troca no primeiro acesso).
            </p>
          )}
          <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={criando}>
            {criando ? 'Criando...' : 'Criar login'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-label">Logins existentes</div>
        {carregando ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
        ) : profissionais.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum médico ou farmacêutico cadastrado ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profissionais.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.nome_exibicao || p.nome}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                    {p.tipo === 'medico' ? 'Médico' : 'Farmacêutico'}
                    {p.crm ? ` · CRM ${p.crm}` : ''}
                    {p.deve_trocar_senha ? ' · aguardando troca de senha' : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-btn-secondary"
                  onClick={() => { setConfirmandoReset(p); setErroReset('') }}
                >
                  Resetar senha
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmandoReset && (
        <ConfirmModal
          titulo={`Resetar a senha de ${confirmandoReset.nome_exibicao || confirmandoReset.nome}?`}
          mensagem={`A senha volta pra padrão (123456) e o sistema vai exigir a troca no próximo acesso.${erroReset ? '\n\n' + erroReset : ''}`}
          confirmarTexto={resetando ? 'Aguarde...' : 'Resetar senha'}
          perigo
          onConfirmar={confirmarReset}
          onCancelar={() => setConfirmandoReset(null)}
        />
      )}
    </div>
  )
}
