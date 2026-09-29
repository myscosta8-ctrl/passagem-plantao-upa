import { nomeCargo } from '../lib/cargos'
import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function MinhaConta({ onVoltar }) {
  const { enfermeiro, atualizarNomeExibicao, trocarSenha } = useAuth()

  const [nomeExibicao, setNomeExibicao] = useState(enfermeiro?.nome_exibicao ?? '')
  const [salvandoNome, setSalvandoNome] = useState(false)
  const [mensagemNome, setMensagemNome] = useState('')
  const [erroNome, setErroNome] = useState('')

  const [senhaNova, setSenhaNova] = useState('')
  const [senhaConfirmar, setSenhaConfirmar] = useState('')
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [mensagemSenha, setMensagemSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  async function salvarNome(e) {
    e.preventDefault()
    setErroNome('')
    setMensagemNome('')
    setSalvandoNome(true)
    const { error } = await atualizarNomeExibicao(nomeExibicao)
    setSalvandoNome(false)
    if (error) {
      setErroNome('Não foi possível salvar. Tente novamente.')
      return
    }
    setMensagemNome('Nome atualizado.')
  }

  async function handleTrocarSenha(e) {
    e.preventDefault()
    setErroSenha('')
    setMensagemSenha('')

    if (senhaNova.length < 6) {
      setErroSenha('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (senhaNova !== senhaConfirmar) {
      setErroSenha('As senhas não coincidem.')
      return
    }

    setTrocandoSenha(true)
    const { error } = await trocarSenha(senhaNova)
    setTrocandoSenha(false)

    if (error) {
      const m = String(error.message || '')
      const code = error.code || ''
      setErroSenha(
        code === 'same_password' || /different from the old/i.test(m) ? 'A nova senha precisa ser diferente da senha atual.'
        : code === 'weak_password' || /weak|pwned|leak|guess|known/i.test(m) ? 'Essa senha é fraca ou muito comum. Use uma senha maior, misturando letras e números.'
        : code === 'reauthentication_needed' || /reauth/i.test(m) ? 'Por segurança, saia do sistema, entre de novo com a senha atual e tente trocar em seguida.'
        : /session|jwt|not authenticated|expired/i.test(m) ? 'Sua sessão expirou. Saia e entre de novo, depois tente trocar a senha.'
        : `Falha ao trocar a senha (${m || 'erro desconhecido'}). Saia, entre de novo e tente outra vez.`)
      return
    }
    setSenhaNova('')
    setSenhaConfirmar('')
    setMensagemSenha('Senha atualizada com sucesso.')
  }

  return (
    <div className="workspace">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title">
          <h1>Minha Conta</h1>
          <p>Configurações de perfil e segurança.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left"></i> Voltar ao painel</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
            <i className="ph ph-identification-card" /> Informações do Perfil
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Seu login: <strong>{enfermeiro?.usuario}</strong> <br/>
            Cargo: <strong>{enfermeiro?.role === 'admin' ? 'Administrador geral' : (enfermeiro?.cargo_admin ? nomeCargo(enfermeiro.cargo_admin) : 'Profissional')}</strong>
          </p>

          <form onSubmit={salvarNome}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nome de Exibição (Crachá)</label>
              <input
                type="text"
                value={nomeExibicao}
                onChange={(e) => setNomeExibicao(e.target.value)}
                placeholder="Ex: Enf. João"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 14 }}
              />
            </div>
            {erroNome && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{erroNome}</p>}
            {mensagemNome && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12 }}>{mensagemNome}</p>}
            
            <button type="submit" className="btn btn-primary" disabled={salvandoNome}>
              {salvandoNome ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
            <i className="ph ph-lock-key" /> Alterar Senha
          </h3>
          <form onSubmit={handleTrocarSenha}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nova Senha</label>
              <input
                type="password"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 14 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirmar Nova Senha</label>
              <input
                type="password"
                value={senhaConfirmar}
                onChange={(e) => setSenhaConfirmar(e.target.value)}
                placeholder="Repita a senha"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 14 }}
              />
            </div>
            {erroSenha && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{erroSenha}</p>}
            {mensagemSenha && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12 }}>{mensagemSenha}</p>}
            
            <button type="submit" className="btn btn-primary" disabled={trocandoSenha}>
              {trocandoSenha ? 'Trocando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
