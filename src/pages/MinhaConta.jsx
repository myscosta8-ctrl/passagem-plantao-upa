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

  async function salvarSenha(e) {
    e.preventDefault()
    setErroSenha('')
    setMensagemSenha('')
    if (senhaNova.length < 6) {
      setErroSenha('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senhaNova !== senhaConfirmar) {
      setErroSenha('As duas senhas não são iguais.')
      return
    }
    setTrocandoSenha(true)
    const { error } = await trocarSenha(senhaNova)
    setTrocandoSenha(false)
    if (error) {
      setErroSenha('Não foi possível trocar a senha. Tente novamente.')
      return
    }
    setSenhaNova('')
    setSenhaConfirmar('')
    setMensagemSenha('Senha alterada com sucesso.')
  }

  return (
    <div className="page">
      <button className="voltar-topo" onClick={onVoltar}>← Voltar ao painel</button>
      <h1 className="page-title">Minha conta</h1>
      <p className="page-subtitle">Ajuste seu nome de exibição ou troque sua senha.</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-label">Nome de exibição</div>
        <form onSubmit={salvarNome}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Como seu nome aparece no sistema</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={nomeExibicao}
              onChange={(e) => { setNomeExibicao(e.target.value); setMensagemNome(''); setErroNome('') }}
              placeholder="ex: ENF.MARIA"
            />
          </div>
          {erroNome && <div className="error-box" style={{ marginBottom: 14 }}>{erroNome}</div>}
          {mensagemNome && <p style={{ fontSize: 13, color: 'var(--color-success)', marginBottom: 14 }}>{mensagemNome}</p>}
          <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={salvandoNome}>
            {salvandoNome ? 'Salvando...' : 'Salvar nome'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-label">Trocar senha</div>
        <form onSubmit={salvarSenha}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nova senha</label>
            <input
              type="password"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={senhaNova}
              onChange={(e) => { setSenhaNova(e.target.value); setMensagemSenha(''); setErroSenha('') }}
              autoComplete="new-password"
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Confirmar nova senha</label>
            <input
              type="password"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={senhaConfirmar}
              onChange={(e) => { setSenhaConfirmar(e.target.value); setMensagemSenha(''); setErroSenha('') }}
              autoComplete="new-password"
            />
          </div>
          {erroSenha && <div className="error-box" style={{ marginBottom: 14 }}>{erroSenha}</div>}
          {mensagemSenha && <p style={{ fontSize: 13, color: 'var(--color-success)', marginBottom: 14 }}>{mensagemSenha}</p>}
          <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={trocandoSenha}>
            {trocandoSenha ? 'Trocando...' : 'Trocar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
