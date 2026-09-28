import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ConfirmModal from './ConfirmModal'
import { avisarErro } from '../lib/erros'
import './GerenciarProfissionais.css'

const TIPOS = [
  { valor: 'medico', rotulo: 'Médico', conselho: 'CRM' },
  { valor: 'enfermagem', rotulo: 'Enfermagem', conselho: 'COREN' },
  { valor: 'recepcao', rotulo: 'Recepção', conselho: null },
]
const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']
const conselhoDe = (tipo) => TIPOS.find((t) => t.valor === tipo)?.conselho
const registroDe = (p) => (p.tipo === 'medico' ? p.crm : p.coren) || ''

function CampoRegistro({ tipo, registro, uf, onRegistro, onUf }) {
  const conselho = conselhoDe(tipo)
  if (!conselho) return null
  return (
    <div className="gp-linha2">
      <div className="gp-campo">
        <label>Nº do {conselho}</label>
        <input value={registro} onChange={(e) => onRegistro(e.target.value.replace(/[^\dA-Za-z.-]/g, ''))} placeholder={conselho === 'CRM' ? 'ex: 12345' : 'ex: 123456'} />
      </div>
      <div className="gp-campo gp-uf">
        <label>UF do {conselho}</label>
        <select value={uf} onChange={(e) => onUf(e.target.value)}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
      </div>
    </div>
  )
}

function LinhaProfissional({ p, meuId, onSalvo, onResetar, focar }) {
  const [aberto, setAberto] = useState(false)
  const [f, setF] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)
  const abrir = () => { setF({ nome: p.nome || '', nome_exibicao: p.nome_exibicao || '', tipo: p.tipo || 'enfermagem', registro: registroDe(p), uf: p.conselho_uf || 'PA', admin: p.role === 'admin', ativo: p.ativo !== false }); setMsg(null); setAberto(true) }
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  useEffect(() => { if (focar) abrir() }, [focar])

  async function alternarAtivo() {
    if (p.id === meuId) return
    const { error } = await supabase.from('enfermeiros').update({ ativo: p.ativo === false }).eq('id', p.id)
    if (error) { avisarErro('GerenciarProfissionais', error); return }
    onSalvo()
  }

  async function salvar() {
    if (!f.nome.trim()) { setMsg({ erro: true, t: 'Informe o nome.' }); return }
    if (p.id === meuId && (!f.admin || !f.ativo)) { setMsg({ erro: true, t: 'Você não pode retirar o seu próprio acesso de administrador nem se desativar.' }); return }
    setSalvando(true)
    const dados = {
      nome: f.nome.trim(), nome_exibicao: f.nome_exibicao.trim() || null, tipo: f.tipo,
      crm: f.tipo === 'medico' ? (f.registro.trim() || null) : null,
      coren: f.tipo === 'enfermagem' ? (f.registro.trim() || null) : null,
      conselho_uf: conselhoDe(f.tipo) ? f.uf : null,
      role: f.admin ? 'admin' : 'enfermeiro', ativo: f.ativo,
    }
    const { error } = await supabase.from('enfermeiros').update(dados).eq('id', p.id)
    setSalvando(false)
    if (error) { avisarErro('GerenciarProfissionais', error); setMsg({ erro: true, t: 'Não foi possível salvar.' }); return }
    setAberto(false); onSalvo()
  }

  const conselho = conselhoDe(p.tipo)
  return (
    <div className={`gp-item ${p.ativo === false ? 'inativo' : ''}`}>
      <div className="gp-item-topo">
        <div>
          <div className="gp-nome">{p.nome_exibicao || p.nome} {p.role === 'admin' && <span className="gp-selo admin">Administrador</span>} {p.ativo === false && <span className="gp-selo">Desativado</span>}</div>
          <div className="gp-sub">
            {p.nome} · {TIPOS.find((t) => t.valor === p.tipo)?.rotulo || p.tipo}
            {conselho && (registroDe(p) ? ` · ${conselho}-${p.conselho_uf || 'PA'} ${registroDe(p)}` : <span className="gp-falta"> · {conselho} não informado</span>)}
            {p.deve_trocar_senha ? ' · aguardando troca de senha' : ''}
          </div>
          <div className="gp-sub">{p.usuario ? <>Usuário: <b>{p.usuario}</b> · </> : ''}Último acesso: {ultimoAcessoTexto(p)}</div>
        </div>
        <div className="gp-acoes">
          <button type="button" className="btn btn-outline" onClick={aberto ? () => setAberto(false) : abrir}><i className="ph ph-pencil-simple" /> {aberto ? 'Fechar' : 'Editar'}</button>
          <button type="button" className="btn btn-outline" onClick={() => onResetar(p)}><i className="ph ph-key" /> Resetar senha</button>
          {p.id !== meuId && <button type="button" className="btn btn-outline" onClick={alternarAtivo}><i className={`ph ${p.ativo === false ? 'ph-lock-open' : 'ph-prohibit'}`} /> {p.ativo === false ? 'Reativar' : 'Desativar'}</button>}
        </div>
      </div>
      {aberto && f && (
        <div className="gp-editor">
          <div className="gp-linha2">
            <div className="gp-campo"><label>Nome completo</label><input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></div>
            <div className="gp-campo"><label>Nome de exibição (aparece nos documentos)</label><input value={f.nome_exibicao} onChange={(e) => set('nome_exibicao', e.target.value.toUpperCase())} placeholder="ex: ENF.MARIA / DR.JOAO" /></div>
          </div>
          <div className="gp-campo"><label>Tipo</label>
            <div className="toggle-group">{TIPOS.map((t) => <button key={t.valor} type="button" className={`toggle-btn ${f.tipo === t.valor ? 'on' : ''}`} onClick={() => set('tipo', t.valor)}>{t.rotulo}</button>)}</div>
          </div>
          <CampoRegistro tipo={f.tipo} registro={f.registro} uf={f.uf} onRegistro={(v) => set('registro', v)} onUf={(v) => set('uf', v)} />
          <div className="gp-checks">
            <label><input type="checkbox" checked={f.ativo} onChange={(e) => set('ativo', e.target.checked)} /> Acesso ativo</label>
            <label><input type="checkbox" checked={f.admin} onChange={(e) => set('admin', e.target.checked)} /> Administrador (gerencia logins)</label>
          </div>
          {msg && <div className={msg.erro ? 'error-box' : 'gp-ok'}>{msg.t}</div>}
          <div className="gp-rodape">
            <button type="button" className="btn btn-outline" onClick={() => setAberto(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={salvar} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ultimoAcessoTexto(p) {
  const t = Math.max(p.ultimo_acesso_em ? Date.parse(p.ultimo_acesso_em) : 0, p.ultimo_login ? Date.parse(p.ultimo_login) : 0)
  return t ? new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'nunca acessou'
}

export default function GerenciarProfissionais({ onVoltar, meuId, focoId, onAbrirEquipe }) {
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [mostrarInativos, setMostrarInativos] = useState(false)
  useEffect(() => { if (focoId) setMostrarInativos(true) }, [focoId])

  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [tipo, setTipo] = useState('enfermagem')
  const [registro, setRegistro] = useState('')
  const [uf, setUf] = useState('PA')
  const [criando, setCriando] = useState(false)
  const [erroCriar, setErroCriar] = useState('')
  const [loginCriado, setLoginCriado] = useState(null)

  const [confirmandoReset, setConfirmandoReset] = useState(null)
  const [resetando, setResetando] = useState(false)
  const [erroReset, setErroReset] = useState('')
  const [eu, setEu] = useState(meuId || null)

  useEffect(() => { carregar(); if (!meuId) supabase.auth.getUser().then(({ data }) => setEu(data?.user?.id || null)) }, [])

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase.rpc('painel_equipe')
    if (error) avisarErro('GerenciarProfissionais', error)
    setProfissionais(data ?? [])
    setCarregando(false)
  }

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase()
    return profissionais.filter((p) => (mostrarInativos || p.ativo !== false)
      && (filtroTipo === 'todos' || p.tipo === filtroTipo)
      && (!b || `${p.nome} ${p.nome_exibicao} ${p.usuario || ''} ${p.crm || ''} ${p.coren || ''}`.toLowerCase().includes(b)))
  }, [profissionais, busca, filtroTipo, mostrarInativos])
  const semRegistro = profissionais.filter((p) => p.ativo !== false && conselhoDe(p.tipo) && !registroDe(p)).length

  async function criarLogin(e) {
    e.preventDefault()
    setErroCriar(''); setLoginCriado(null)
    if (!nome.trim() || !username.trim()) { setErroCriar('Preencha nome e usuário.'); return }
    setCriando(true)
    const { data, error } = await supabase.functions.invoke('criar-login-profissional', {
      body: { nome: nome.trim(), username: username.trim(), tipo, crm: tipo === 'medico' ? registro.trim() : '' },
    })
    if (error || data?.error) { setCriando(false); setErroCriar(data?.error || 'Não foi possível criar o login. Tente de novo.'); return }
    // Registro do conselho e UF: gravados em seguida no perfil recém-criado.
    if (conselhoDe(tipo)) {
      const { data: novo } = await supabase.from('enfermeiros').select('id').eq('nome', nome.trim()).order('criado_em', { ascending: false }).limit(1).maybeSingle()
      if (novo?.id) await supabase.from('enfermeiros').update({ crm: tipo === 'medico' ? (registro.trim() || null) : null, coren: tipo === 'enfermagem' ? (registro.trim() || null) : null, conselho_uf: uf }).eq('id', novo.id)
    }
    setCriando(false)
    setLoginCriado(data)
    setNome(''); setUsername(''); setRegistro('')
    carregar()
  }

  async function confirmarReset() {
    if (!confirmandoReset) return
    setResetando(true); setErroReset('')
    const { data, error } = await supabase.functions.invoke('resetar-senha-profissional', { body: { profissional_id: confirmandoReset.id } })
    setResetando(false)
    if (error || data?.error) { setErroReset(data?.error || 'Não foi possível resetar a senha.'); return }
    setConfirmandoReset(null)
    carregar()
  }

  return (
    <div className="workspace gp-page">
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title">
          <h1>Profissionais (Logins)</h1>
          <p>Crie, edite e gerencie os acessos do sistema.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{onAbrirEquipe && <button className="btn btn-outline" onClick={onAbrirEquipe}><i className="ph ph-users-three" /> Painel de Equipe</button>}<button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left"></i> Voltar ao painel</button></div>
      </div>

      <div className="card gp-card">
        <div className="section-label">Criar login</div>
        <form onSubmit={criarLogin}>
          <div className="gp-linha2">
            <div className="gp-campo"><label>Nome completo</label><input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <div className="gp-campo"><label>Usuário (login)</label><input placeholder="ex: enf.maria" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          </div>
          <div className="gp-campo"><label>Tipo</label>
            <div className="toggle-group">{TIPOS.map((t) => <button key={t.valor} type="button" className={`toggle-btn ${tipo === t.valor ? 'on' : ''}`} onClick={() => setTipo(t.valor)}>{t.rotulo}</button>)}</div>
          </div>
          <CampoRegistro tipo={tipo} registro={registro} uf={uf} onRegistro={setRegistro} onUf={setUf} />
          {erroCriar && <div className="error-box" style={{ marginBottom: 12 }}>{erroCriar}</div>}
          {loginCriado && <p className="gp-ok">Login criado: <b>{loginCriado.username}</b> — senha padrão <b>{loginCriado.senha_padrao}</b> (o sistema pede a troca no primeiro acesso).</p>}
          <button type="submit" className="btn btn-primary" disabled={criando}><i className="ph ph-user-plus" /> {criando ? 'Criando...' : 'Criar login'}</button>
        </form>
      </div>

      <div className="card gp-card">
        <div className="gp-lista-topo">
          <div className="section-label" style={{ margin: 0 }}>Logins existentes ({lista.length})</div>
          {semRegistro > 0 && <span className="gp-falta"><i className="ph ph-warning" /> {semRegistro} sem COREN/CRM — necessário para os impressos</span>}
        </div>
        <div className="gp-filtros">
          <input placeholder="Buscar por nome, COREN ou CRM..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="toggle-group">
            {[{ valor: 'todos', rotulo: 'Todos' }, ...TIPOS].map((t) => <button key={t.valor} type="button" className={`toggle-btn ${filtroTipo === t.valor ? 'on' : ''}`} onClick={() => setFiltroTipo(t.valor)}>{t.rotulo}</button>)}
          </div>
          <label className="gp-check-inline"><input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} /> Mostrar desativados</label>
        </div>
        {carregando ? <p className="gp-vazio">Carregando...</p> : lista.length === 0 ? <p className="gp-vazio">Nenhum login encontrado.</p> : (
          <div className="gp-lista">{lista.map((p) => <LinhaProfissional key={p.id} p={p} meuId={eu} focar={p.id === focoId} onSalvo={carregar} onResetar={(x) => { setConfirmandoReset(x); setErroReset('') }} />)}</div>
        )}
      </div>

      {confirmandoReset && (
        <ConfirmModal
          titulo={`Resetar a senha de ${confirmandoReset.nome_exibicao || confirmandoReset.nome}?`}
          mensagem={`A senha volta para a padrão (123456) e o sistema vai exigir a troca no próximo acesso.${erroReset ? '\n\n' + erroReset : ''}`}
          confirmarTexto={resetando ? 'Aguarde...' : 'Resetar senha'}
          perigo
          onConfirmar={confirmarReset}
          onCancelar={() => setConfirmandoReset(null)}
        />
      )}
    </div>
  )
}
