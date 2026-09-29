import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { avisarErro } from '../lib/erros'
import { useAuth } from '../lib/AuthContext'
import { PERMISSOES, nomeCargo } from '../lib/cargos'
import './GerenciarProfissionais.css'

const TIPOS = [
  { valor: 'medico', rotulo: 'Médico', conselho: 'CRM' },
  { valor: 'enfermagem', rotulo: 'Enfermagem', conselho: 'COREN' },
  { valor: 'recepcao', rotulo: 'Recepção', conselho: null },
]
const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']
const FILTROS = [...TIPOS, { valor: 'apoio', rotulo: 'Outros' }]
const ROTULO_TIPO = { medico: 'Médico', enfermagem: 'Enfermagem', recepcao: 'Recepção', apoio: 'Apoio' }
// Conselho profissional: vem da função escolhida; sem função, deduz pelo tipo.
const conselhoDe = (tipo, funcao, funcoes = []) => {
  if (funcao) return funcoes.find((x) => x.chave === funcao)?.conselho || null
  return TIPOS.find((t) => t.valor === tipo)?.conselho || null
}
const registroDe = (p) => (p.tipo === 'medico' ? p.crm : p.tipo === 'enfermagem' ? (p.coren || p.registro_profissional) : p.registro_profissional) || ''
const nomeFuncao = (p, funcoes) => p.funcao_nome || funcoes.find((x) => x.chave === p.funcao)?.nome || ROTULO_TIPO[p.tipo] || p.tipo
// Onde gravar o número do registro, conforme o conselho.
function camposRegistro(tipo, conselho, registro, uf) {
  const r = (registro || '').trim() || null
  return {
    crm: tipo === 'medico' ? r : null,
    coren: tipo !== 'medico' && conselho === 'COREN' ? r : null,
    registro_profissional: tipo !== 'medico' && conselho && conselho !== 'COREN' ? r : null,
    conselho_uf: conselho ? uf : null,
  }
}
const nomeDe = (p) => p.nome_exibicao || p.nome

// Permissões que a pessoa tem de fato: as do cargo, mais as extras, menos as removidas.
function permsEfetivas(p, cargos) {
  const c = cargos.find((x) => x.chave === p.cargo_admin)
  const base = new Set(c?.permissoes || [])
  ;(p.permissoes_extra || []).forEach((k) => base.add(k))
  ;(p.permissoes_removidas || []).forEach((k) => base.delete(k))
  return PERMISSOES.map((x) => x.k).filter((k) => base.has(k))
}
// O que gravar: só a diferença em relação ao cargo escolhido.
function calcularAjustes(cargoChave, marcadas, cargos) {
  const doCargo = new Set(cargos.find((x) => x.chave === cargoChave)?.permissoes || [])
  return { extra: marcadas.filter((k) => !doCargo.has(k)), removidas: [...doCargo].filter((k) => !marcadas.includes(k)) }
}

function ultimoAcessoTexto(p) {
  const t = Math.max(p.ultimo_acesso_em ? Date.parse(p.ultimo_acesso_em) : 0, p.ultimo_login ? Date.parse(p.ultimo_login) : 0)
  return t ? new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'nunca acessou'
}

// Janela de confirmação/resultado centralizada sobre a tela.
function Janela({ titulo, icone, tom = 'padrao', children, acoes, onFechar }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onFechar?.() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onFechar])
  return (
    <div className="gp-janela-fundo" onClick={onFechar}>
      <div className={`gp-janela ${tom}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="gp-janela-topo"><i className={`ph ${icone}`} /><h3>{titulo}</h3></div>
        <div className="gp-janela-corpo">{children}</div>
        <div className="gp-janela-acoes">{acoes}</div>
      </div>
    </div>
  )
}

function SenhaGerada({ usuario, senha }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => { try { await navigator.clipboard.writeText(`Usuário: ${usuario}\nSenha provisória: ${senha}`); setCopiado(true) } catch { setCopiado(false) } }
  return (
    <div className="gp-senha">
      {usuario && <div><span>Usuário</span><b>{usuario}</b></div>}
      <div><span>Senha provisória</span><b className="gp-senha-valor">{senha}</b></div>
      <button type="button" className="gp-btn gp-btn-sec" onClick={copiar}><i className={`ph ${copiado ? 'ph-check' : 'ph-copy'}`} /> {copiado ? 'Copiado' : 'Copiar usuário e senha'}</button>
      <p>Repasse ao profissional exatamente assim, <b>tudo em letras minúsculas</b>. No primeiro acesso o sistema exige a criação de uma senha própria. Cada novo reset anula a senha anterior.</p>
    </div>
  )
}

function CampoRegistro({ conselho, registro, uf, onRegistro, onUf }) {
  if (!conselho) return null
  return (
    <div className="gp-linha2">
      <div className="gp-campo">
        <label>Nº do {conselho}</label>
        <input value={registro} onChange={(e) => onRegistro(e.target.value.replace(/[^\dA-Za-z.-]/g, ''))} placeholder="ex: 123456" />
      </div>
      <div className="gp-campo gp-uf">
        <label>UF do {conselho}</label>
        <select value={uf} onChange={(e) => onUf(e.target.value)}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
      </div>
    </div>
  )
}

function SeletorFuncao({ valor, funcoes, onChange, vazio }) {
  return (
    <select value={valor} onChange={(e) => onChange(e.target.value)}>
      {vazio && <option value="">{vazio}</option>}
      {funcoes.map((x) => <option key={x.chave} value={x.chave}>{x.nome}</option>)}
    </select>
  )
}

function LinhaProfissional({ p, funcoes, meuId, onSalvo, onResetar, onAlternarAtivo, focar, perm, souAdmin, cargos }) {
  const bloqueado = p.role === 'admin' && !souAdmin // só o administrador geral mexe em outro administrador
  const [aberto, setAberto] = useState(false)
  const [f, setF] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)
  const abrir = () => { setF({ nome: p.nome || '', nome_exibicao: p.nome_exibicao || '', tipo: p.tipo || 'enfermagem', funcao: p.funcao || '', registro: registroDe(p), uf: p.conselho_uf || 'PA', admin: p.role === 'admin', cargo: p.cargo_admin || '', perms: permsEfetivas(p, cargos) }); setMsg(null); setAberto(true) }
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  useEffect(() => { if (focar) abrir() }, [focar])

  async function salvar() {
    if (!f.nome.trim()) { setMsg({ erro: true, t: 'Informe o nome.' }); return }
    if (souAdmin && p.id === meuId && !f.admin) { setMsg({ erro: true, t: 'Você não pode retirar o seu próprio acesso de administrador geral.' }); return }
    setSalvando(true)
    const dados = { nome: f.nome.trim(), nome_exibicao: f.nome_exibicao.trim() || null, ...camposRegistro(f.tipo, conselhoDe(f.tipo, f.funcao, funcoes), f.registro, f.uf) }
    if (f.funcao && f.funcao !== (p.funcao || '')) dados.funcao = f.funcao
    if (souAdmin) dados.role = f.admin ? 'admin' : 'enfermeiro'
    const { error } = await supabase.from('enfermeiros').update(dados).eq('id', p.id)
    if (error) { setSalvando(false); avisarErro('GerenciarProfissionais', error); setMsg({ erro: true, t: 'Não foi possível salvar.' }); return }
    if (souAdmin && !f.admin) {
      const { extra, removidas } = calcularAjustes(f.cargo, f.perms, cargos)
      const { error: erroCargo } = await supabase.rpc('definir_cargo_profissional', { p_id: p.id, p_cargo: f.cargo || null, p_extra: extra, p_removidas: removidas })
      if (erroCargo) { setSalvando(false); avisarErro('GerenciarProfissionais', erroCargo); setMsg({ erro: true, t: 'Os dados foram salvos, mas não foi possível gravar o cargo e as permissões.' }); return }
    }
    setSalvando(false)
    setAberto(false); onSalvo()
  }

  const conselho = conselhoDe(p.tipo, p.funcao, funcoes)
  const ativo = p.ativo !== false
  return (
    <div className={`gp-item ${!ativo ? 'inativo' : ''} ${aberto ? 'aberto' : ''}`}>
      <div className="gp-item-topo">
        <div className={`gp-av tipo-${p.tipo}`}>{String(p.nome || '?').trim().split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'}</div>
        <div className="gp-item-info">
          <div className="gp-nome">{nomeDe(p)} {p.role === 'admin' && <span className="gp-selo admin">Administrador geral</span>}{p.role !== 'admin' && p.cargo_admin && <span className="gp-selo">{nomeCargo(p.cargo_admin, cargos)}</span>} {!ativo && <span className="gp-selo">Desativado</span>} {p.deve_trocar_senha && <span className="gp-selo ambar">Trocar senha</span>}</div>
          <div className="gp-sub">
            {p.nome} · {nomeFuncao(p, funcoes)}
            {conselho && (registroDe(p) ? ` · ${conselho}-${p.conselho_uf || 'PA'} ${registroDe(p)}` : <span className="gp-falta"> · {conselho} não informado</span>)}
          </div>
          <div className="gp-sub gp-meta">{p.usuario && <span><i className="ph ph-at" /> {p.usuario}</span>}<span><i className="ph ph-clock" /> {ultimoAcessoTexto(p)}</span></div>
        </div>
        <div className="gp-acoes">
          {bloqueado && <span className="gp-sub">Conta do administrador geral</span>}
          {!bloqueado && (perm.editar || souAdmin) && <button type="button" className="gp-btn gp-btn-sec" onClick={aberto ? () => setAberto(false) : abrir}><i className={`ph ${aberto ? 'ph-x' : 'ph-pencil-simple'}`} /> {aberto ? 'Fechar' : 'Editar'}</button>}
          {!bloqueado && perm.resetar && <button type="button" className="gp-btn gp-btn-sec" onClick={() => onResetar(p)} disabled={!ativo}><i className="ph ph-key" /> Resetar senha</button>}
          {!bloqueado && perm.ativar && p.id !== meuId && (
            <button type="button" className={`gp-btn ${ativo ? 'gp-btn-perigo' : 'gp-btn-ok'}`} onClick={() => onAlternarAtivo(p)}>
              <i className={`ph ${ativo ? 'ph-prohibit' : 'ph-lock-open'}`} /> {ativo ? 'Desativar' : 'Reativar'}
            </button>
          )}
        </div>
      </div>
      {aberto && f && (
        <div className="gp-editor">
          <div className="gp-linha2">
            <div className="gp-campo"><label>Nome completo</label><input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></div>
            <div className="gp-campo"><label>Nome de exibição (sai nos documentos)</label><input value={f.nome_exibicao} onChange={(e) => set('nome_exibicao', e.target.value.toUpperCase())} placeholder="ex: ENF.MARIA / DR.JOAO" /></div>
          </div>
          <div className="gp-campo"><label>Função</label>
            {souAdmin || perm.editar
              ? <SeletorFuncao valor={f.funcao} funcoes={funcoes} vazio={`${ROTULO_TIPO[f.tipo] || f.tipo} (escolher função)`} onChange={(v) => setF((x) => ({ ...x, funcao: v, tipo: funcoes.find((y) => y.chave === v)?.perfil_base || x.tipo }))} />
              : <input value={nomeFuncao(p, funcoes)} disabled />}
          </div>
          <CampoRegistro conselho={conselhoDe(f.tipo, f.funcao, funcoes)} registro={f.registro} uf={f.uf} onRegistro={(v) => set('registro', v)} onUf={(v) => set('uf', v)} />
          {souAdmin && (
            <>
              <label className="gp-check"><input type="checkbox" checked={f.admin} onChange={(e) => set('admin', e.target.checked)} /> Administrador geral (acesso total ao sistema — use só para você)</label>
              {!f.admin && (
                <div className="gp-cargo">
                  <div className="gp-campo"><label>Cargo administrativo</label>
                    <select value={f.cargo} onChange={(e) => { const c = cargos.find((x) => x.chave === e.target.value); setF((x) => ({ ...x, cargo: e.target.value, perms: c ? [...c.permissoes] : [] })) }}>
                      <option value="">Nenhum (só atua no plantão)</option>
                      {cargos.map((c) => <option key={c.chave} value={c.chave}>{c.nome}</option>)}
                    </select>
                    {f.cargo && <p className="gp-dica">{cargos.find((c) => c.chave === f.cargo)?.descricao}</p>}
                  </div>
                  <div className="gp-perms">
                    <label>Permissões desta pessoa <small>(ajuste individual sobre o cargo)</small></label>
                    {PERMISSOES.map((x) => (
                      <label key={x.k} className="gp-check">
                        <input type="checkbox" checked={f.perms.includes(x.k)} onChange={(e) => setF((y) => ({ ...y, perms: e.target.checked ? [...y.perms, x.k] : y.perms.filter((k) => k !== x.k) }))} />
                        <span><b>{x.nome}</b> — {x.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {msg && <div className={msg.erro ? 'gp-erro' : 'gp-ok'}>{msg.t}</div>}
          <div className="gp-rodape">
            <button type="button" className="gp-btn gp-btn-sec" onClick={() => setAberto(false)}>Cancelar</button>
            <button type="button" className="gp-btn gp-btn-pri" onClick={salvar} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GerenciarProfissionais({ onVoltar, meuId, focoId, onAbrirEquipe }) {
  const { enfermeiro: euPerfil, temPermissao } = useAuth()
  const souAdmin = euPerfil?.role === 'admin'
  const perm = { criar: temPermissao('cadastrar_funcionarios'), editar: temPermissao('editar_cadastro'), resetar: temPermissao('resetar_senha'), ativar: temPermissao('ativar_desativar') }
  const [cargos, setCargos] = useState([])
  const [funcoes, setFuncoes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [mostrarInativos, setMostrarInativos] = useState(!!focoId)

  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [exibicao, setExibicao] = useState('')
  const [funcao, setFuncao] = useState('enfermeiro')
  const [registro, setRegistro] = useState('')
  const [uf, setUf] = useState('PA')
  const [criando, setCriando] = useState(false)
  const [erroCriar, setErroCriar] = useState('')

  const [janela, setJanela] = useState(null) // { tipo: 'reset'|'ativo'|'senha', p, ... }
  const [ocupado, setOcupado] = useState(false)
  const [eu, setEu] = useState(meuId || null)

  useEffect(() => { carregar(); if (!meuId) supabase.auth.getUser().then(({ data }) => setEu(data?.user?.id || null)) }, [])

  async function carregar() {
    const { data, error } = await supabase.rpc('painel_equipe')
    if (error) avisarErro('GerenciarProfissionais', error)
    setProfissionais(data ?? [])
    const { data: cg } = await supabase.from('cargos_admin').select('*').order('ordem')
    setCargos(cg ?? [])
    const { data: fn } = await supabase.from('funcoes_profissionais').select('*').order('ordem')
    setFuncoes(fn ?? [])
    setCarregando(false)
  }

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase()
    return profissionais.filter((p) => (mostrarInativos || p.ativo !== false)
      && (filtroTipo === 'todos' || p.tipo === filtroTipo)
      && (!b || `${p.nome} ${p.nome_exibicao} ${p.usuario || ''} ${p.crm || ''} ${p.coren || ''} ${p.registro_profissional || ''} ${p.funcao_nome || ''}`.toLowerCase().includes(b)))
  }, [profissionais, busca, filtroTipo, mostrarInativos])
  const semRegistro = profissionais.filter((p) => p.ativo !== false && conselhoDe(p.tipo, p.funcao, funcoes) && !registroDe(p)).length

  async function criarLogin(e) {
    e.preventDefault()
    setErroCriar('')
    if (!nome.trim() || !username.trim()) { setErroCriar('Preencha nome e usuário.'); return }
    setCriando(true)
    const { data, error } = await supabase.functions.invoke('criar-login-profissional', {
      body: { nome: nome.trim(), username: username.trim(), nome_exibicao: exibicao.trim(), funcao, registro: registro.trim(), conselho_uf: uf },
    })
    setCriando(false)
    if (error || data?.error || !data?.senha_provisoria) {
      let m = data?.error
      if (!m && error?.context?.json) { try { m = (await error.context.json())?.error } catch { /* sem corpo */ } }
      setErroCriar(m || 'Não foi possível criar o login. Tente de novo.')
      return
    }
    setJanela({ tipo: 'senha', titulo: 'Login criado', usuario: data.username, senha: data.senha_provisoria })
    setNome(''); setUsername(''); setExibicao(''); setRegistro('')
    carregar()
  }

  async function confirmarReset() {
    const p = janela.p
    setOcupado(true)
    const { data, error } = await supabase.functions.invoke('resetar-senha-profissional', { body: { profissional_id: p.id } })
    setOcupado(false)
    if (error || data?.error || !data?.senha_provisoria) {
      let m = data?.error
      if (!m && error?.context?.json) { try { m = (await error.context.json())?.error } catch { /* sem corpo */ } }
      setJanela({ ...janela, erro: m || 'Não foi possível resetar a senha.' })
      return
    }
    setJanela({ tipo: 'senha', titulo: `Nova senha de ${nomeDe(p)}`, usuario: p.usuario, senha: data.senha_provisoria })
    carregar()
  }

  async function confirmarAtivo() {
    const p = janela.p
    setOcupado(true)
    const { error } = await supabase.from('enfermeiros').update({ ativo: p.ativo === false }).eq('id', p.id)
    setOcupado(false)
    if (error) { avisarErro('GerenciarProfissionais', error); setJanela({ ...janela, erro: 'Não foi possível alterar o acesso.' }); return }
    setJanela(null)
    carregar()
  }

  return (
    <div className="workspace gp-page">
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title">
          <h1>Profissionais (Logins)</h1>
          <p>Crie, edite e gerencie os acessos do sistema.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {onAbrirEquipe && <button className="gp-btn gp-btn-sec" onClick={onAbrirEquipe}><i className="ph ph-users-three" /> Painel de Equipe</button>}
          <button className="gp-btn gp-btn-sec" onClick={onVoltar}><i className="ph ph-arrow-left" /> Voltar ao painel</button>
        </div>
      </div>

      {perm.criar && (
      <div className="card gp-card">
        <div className="section-label">Criar login</div>
        <form onSubmit={criarLogin} className="gp-form">
          <div className="gp-form-l1">
            <div className="gp-campo"><label>Nome completo</label><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome como no documento" /></div>
            <div className="gp-campo"><label>Usuário (login)</label><input placeholder="ex: enf.maria" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            <div className="gp-campo"><label>Nome de exibição <small>(sai nos documentos)</small></label><input value={exibicao} onChange={(e) => setExibicao(e.target.value.toUpperCase())} placeholder={`ex: ${funcoes.find((x) => x.chave === funcao)?.prefixo_exibicao || ''}${(nome.trim().split(/\s+/)[0] || 'MARIA').toUpperCase()}`} /></div>
          </div>
          <div className="gp-form-l2">
            <div className="gp-campo"><label>Função</label>
              <SeletorFuncao valor={funcao} funcoes={funcoes} onChange={setFuncao} />
            </div>
            <CampoRegistro conselho={conselhoDe(null, funcao, funcoes)} registro={registro} uf={uf} onRegistro={setRegistro} onUf={setUf} />
            <button type="submit" className="gp-btn gp-btn-pri gp-criar" disabled={criando}><i className="ph ph-user-plus" /> {criando ? 'Criando...' : 'Criar login'}</button>
          </div>
          <p className="gp-dica">Se o nome de exibição ficar em branco, ele é gerado a partir do primeiro nome. A senha provisória aparece logo após criar.</p>
          {erroCriar && <div className="gp-erro">{erroCriar}</div>}
        </form>
      </div>
      )}

      <div className="card gp-card">
        <div className="gp-lista-topo">
          <div className="section-label" style={{ margin: 0 }}>Logins ({lista.length})</div>
          {semRegistro > 0 && <span className="gp-falta"><i className="ph ph-warning" /> {semRegistro} sem COREN/CRM — necessário para os impressos</span>}
        </div>
        <div className="gp-filtros">
          <label className="gp-busca"><i className="ph ph-magnifying-glass" /><input type="search" placeholder="Buscar por nome, usuário, COREN ou CRM" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
          <div className="gp-segmento gp-seg-suave">
            {[{ valor: 'todos', rotulo: 'Todos' }, ...FILTROS].map((t) => <button key={t.valor} type="button" className={filtroTipo === t.valor ? 'on' : ''} onClick={() => setFiltroTipo(t.valor)}>{t.rotulo}</button>)}
          </div>
          <label className="gp-switch"><input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} /><span aria-hidden="true" /> Mostrar desativados</label>
        </div>
        {carregando ? <p className="gp-vazio">Carregando...</p> : lista.length === 0 ? <p className="gp-vazio">Nenhum login encontrado.</p> : (
          <div className="gp-lista">{lista.map((p) => (
            <LinhaProfissional key={p.id} p={p} funcoes={funcoes} meuId={eu} focar={p.id === focoId} onSalvo={carregar} perm={perm} souAdmin={souAdmin} cargos={cargos}
              onResetar={(x) => setJanela({ tipo: 'reset', p: x })}
              onAlternarAtivo={(x) => setJanela({ tipo: 'ativo', p: x })} />
          ))}</div>
        )}
      </div>

      {janela?.tipo === 'reset' && (
        <Janela titulo={`Resetar a senha de ${nomeDe(janela.p)}?`} icone="ph-key" tom="alerta" onFechar={() => !ocupado && setJanela(null)}
          acoes={<>
            <button type="button" className="gp-btn gp-btn-sec" onClick={() => setJanela(null)} disabled={ocupado}>Cancelar</button>
            <button type="button" className="gp-btn gp-btn-pri" onClick={confirmarReset} disabled={ocupado}><i className="ph ph-key" /> {ocupado ? 'Gerando...' : 'Gerar nova senha'}</button>
          </>}>
          <p>Uma senha provisória nova será gerada e mostrada a seguir. A senha atual deixa de funcionar e o profissional terá que criar uma senha própria no próximo acesso.</p>
          {janela.erro && <div className="gp-erro">{janela.erro}</div>}
        </Janela>
      )}
      {janela?.tipo === 'ativo' && (() => {
        const desativar = janela.p.ativo !== false
        return (
          <Janela titulo={`${desativar ? 'Desativar' : 'Reativar'} o acesso de ${nomeDe(janela.p)}?`} icone={desativar ? 'ph-prohibit' : 'ph-lock-open'} tom={desativar ? 'perigo' : 'padrao'} onFechar={() => !ocupado && setJanela(null)}
            acoes={<>
              <button type="button" className="gp-btn gp-btn-sec" onClick={() => setJanela(null)} disabled={ocupado}>Cancelar</button>
              <button type="button" className={`gp-btn ${desativar ? 'gp-btn-perigo-cheio' : 'gp-btn-pri'}`} onClick={confirmarAtivo} disabled={ocupado}>{ocupado ? 'Aguarde...' : desativar ? 'Desativar acesso' : 'Reativar acesso'}</button>
            </>}>
            <p>{desativar
              ? 'O profissional não conseguirá mais ver nem registrar nada no sistema. Os documentos que ele já assinou continuam no prontuário, com o nome dele. Dá para reativar depois.'
              : 'O profissional volta a acessar o sistema com o mesmo usuário e senha.'}</p>
            {janela.erro && <div className="gp-erro">{janela.erro}</div>}
          </Janela>
        )
      })()}
      {janela?.tipo === 'senha' && (
        <Janela titulo={janela.titulo} icone="ph-check-circle" tom="sucesso" onFechar={() => setJanela(null)}
          acoes={<button type="button" className="gp-btn gp-btn-pri" onClick={() => setJanela(null)}>Concluído</button>}>
          <SenhaGerada usuario={janela.usuario} senha={janela.senha} />
        </Janela>
      )}
    </div>
  )
}
