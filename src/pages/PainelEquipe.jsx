import { nomeCargo } from '../lib/cargos'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { avisarErro } from '../lib/erros'
import './PainelEquipe.css'

const TIPO = { medico: 'Médico', enfermagem: 'Enfermagem', recepcao: 'Recepção', apoio: 'Apoio' }
const CONSELHO = { medico: 'CRM', enfermagem: 'COREN' }
const conselhoDe = (p) => (p.funcao ? p.funcao_conselho : CONSELHO[p.tipo]) || null
const MIN = 60000
const ONLINE_MS = 5 * MIN

const registro = (p) => (p.tipo === 'medico' ? p.crm : p.tipo === 'enfermagem' ? (p.coren || p.registro_profissional) : p.registro_profissional) || null
const semRegistro = (p) => !!conselhoDe(p) && !registro(p)
const ultimoUso = (p) => Math.max(p.ultimo_acesso_em ? Date.parse(p.ultimo_acesso_em) : 0, p.ultimo_login ? Date.parse(p.ultimo_login) : 0) || null
const online = (p, agora) => p.ultimo_acesso_em && agora - Date.parse(p.ultimo_acesso_em) < ONLINE_MS
function haQuanto(ms, agora) {
  if (!ms) return 'nunca acessou'
  const d = agora - ms
  if (d < 2 * MIN) return 'agora'
  if (d < 60 * MIN) return `há ${Math.round(d / MIN)} min`
  if (d < 24 * 60 * MIN) return `há ${Math.round(d / (60 * MIN))} h`
  const dias = Math.round(d / (24 * 60 * MIN))
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}
const iniciais = (n) => String(n || '?').trim().split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const FILTROS = [
  { k: 'todos', r: 'Todos', f: () => true },
  { k: 'online', r: 'Online agora', f: (p, a) => online(p, a) },
  { k: 'plantao', r: 'Em plantão', f: (p) => p.em_plantao },
  { k: 'semreg', r: 'Sem COREN/CRM', f: (p) => semRegistro(p) },
  { k: 'senha', r: 'Aguardando troca de senha', f: (p) => p.deve_trocar_senha },
  { k: 'ausente', r: 'Sem acesso há 30+ dias', f: (p, a) => !ultimoUso(p) || a - ultimoUso(p) > 30 * 24 * 60 * MIN },
  { k: 'admin', r: 'Administradores', f: (p) => p.role === 'admin' },
]

export default function PainelEquipe({ onVoltar, podeAdministrar, onGerenciar }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [agora, setAgora] = useState(Date.now())
  const [filtro, setFiltro] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [busca, setBusca] = useState('')
  const [inativos, setInativos] = useState(false)
  const [ordem, setOrdem] = useState('status')

  async function carregar() {
    const { data, error } = await supabase.rpc('painel_equipe')
    if (error) avisarErro('PainelEquipe', error)
    setLista(data ?? [])
    setAgora(Date.now())
    setCarregando(false)
  }
  useEffect(() => { carregar(); const t = setInterval(carregar, 60000); return () => clearInterval(t) }, [])

  const base = useMemo(() => lista.filter((p) => inativos || p.ativo), [lista, inativos])
  const contagem = useMemo(() => Object.fromEntries(FILTROS.map((x) => [x.k, base.filter((p) => x.f(p, agora)).length])), [base, agora])
  const visiveis = useMemo(() => {
    const f = FILTROS.find((x) => x.k === filtro)?.f || (() => true)
    const b = busca.trim().toLowerCase()
    const r = base.filter((p) => f(p, agora) && (tipo === 'todos' || p.tipo === tipo)
      && (!b || `${p.nome} ${p.nome_exibicao} ${p.usuario} ${p.crm || ''} ${p.coren || ''} ${p.registro_profissional || ''} ${p.funcao_nome || ''}`.toLowerCase().includes(b)))
    const peso = (p) => (online(p, agora) ? 0 : p.em_plantao ? 1 : 2)
    return r.sort((a, c) => ordem === 'nome' ? String(a.nome).localeCompare(c.nome)
      : ordem === 'acesso' ? (ultimoUso(c) || 0) - (ultimoUso(a) || 0)
      : peso(a) - peso(c) || String(a.nome).localeCompare(c.nome))
  }, [base, filtro, tipo, busca, ordem, agora])

  const TIPOS_SEG = [['todos', 'Todos'], ['enfermagem', 'Enfermagem'], ['medico', 'Médico'], ['recepcao', 'Recepção'], ['apoio', 'Outros']]
  const ICONE_FILTRO = { todos: 'ph-users-three', online: 'ph-wifi-high', plantao: 'ph-first-aid-kit', semreg: 'ph-identification-card', senha: 'ph-key', ausente: 'ph-clock-counter-clockwise', admin: 'ph-shield-check' }

  return (
    <div className="workspace pe-page">
      <header className="pe-cabecalho">
        <div>
          <h1>Painel de Equipe</h1>
          <p>Todos os profissionais com login: quem está online, em plantão e o que falta no cadastro.</p>
        </div>
        <div className="pe-cab-acoes">
          <button type="button" className="pe-btn pe-btn-sec" onClick={carregar} title="Atualizar"><i className="ph ph-arrows-clockwise" /> <span>Atualizar</span></button>
          {podeAdministrar && <button type="button" className="pe-btn pe-btn-pri" onClick={() => onGerenciar?.(null)}><i className="ph ph-user-plus" /> <span>Gerenciar logins</span></button>}
          <button type="button" className="pe-btn pe-btn-sec" onClick={onVoltar}><i className="ph ph-arrow-left" /> <span>Voltar</span></button>
        </div>
      </header>

      <div className="pe-resumo" role="tablist">
        {FILTROS.map((x) => (
          <button key={x.k} type="button" role="tab" aria-selected={filtro === x.k}
            className={`pe-tile pe-f-${x.k} ${filtro === x.k ? 'on' : ''} ${x.k !== 'todos' && !contagem[x.k] ? 'zero' : ''}`}
            onClick={() => setFiltro(filtro === x.k && x.k !== 'todos' ? 'todos' : x.k)}>
            <i className={`ph ${ICONE_FILTRO[x.k]}`} />
            <b>{contagem[x.k] ?? 0}</b>
            <span>{x.r}</span>
          </button>
        ))}
      </div>

      <div className="pe-barra">
        <label className="pe-busca">
          <i className="ph ph-magnifying-glass" />
          <input type="search" placeholder="Buscar por nome, usuário, COREN ou CRM" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {busca && <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca"><i className="ph ph-x" /></button>}
        </label>
        <div className="pe-seg">
          {TIPOS_SEG.map(([k, r]) => <button key={k} type="button" className={tipo === k ? 'on' : ''} onClick={() => setTipo(k)}>{r}</button>)}
        </div>
        <label className="pe-ordem">
          <i className="ph ph-sort-ascending" />
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
            <option value="status">Online e em plantão primeiro</option>
            <option value="nome">Nome (A–Z)</option>
            <option value="acesso">Último acesso</option>
          </select>
        </label>
        <label className="pe-switch">
          <input type="checkbox" checked={inativos} onChange={(e) => setInativos(e.target.checked)} />
          <span className="pe-switch-trilho" aria-hidden="true" />
          Desativados
        </label>
      </div>

      <div className="pe-contador">{carregando ? 'Carregando...' : `${visiveis.length} profissional${visiveis.length === 1 ? '' : 'is'}`}</div>

      {!carregando && visiveis.length === 0 ? <p className="pe-vazio"><i className="ph ph-user-circle-dashed" /> Nenhum profissional neste filtro.</p> : (
        <div className="pe-grade">
          {visiveis.map((p) => {
            const on = online(p, agora)
            const reg = registro(p)
            const conselho = conselhoDe(p)
            return (
              <article key={p.id} className={`pe-card tipo-${p.tipo} ${!p.ativo ? 'inativo' : ''}`}>
                <div className="pe-topo">
                  <div className={`pe-avatar ${on ? 'on' : ''}`} title={on ? 'Online agora' : 'Offline'}>{iniciais(p.nome)}<span /></div>
                  <div className="pe-id">
                    <div className="pe-nome" title={p.nome}>{p.nome}</div>
                    <div className="pe-exib" title={p.nome_exibicao || ''}>{p.nome_exibicao || 'Sem nome de exibição'}</div>
                  </div>
                  <span className={`pe-tipo tipo-${p.tipo}`}>{p.funcao_nome || TIPO[p.tipo] || p.tipo}</span>
                </div>

                <div className="pe-status">
                  <span className={`pe-online ${on ? 'on' : ''}`}><i />{on ? 'Online agora' : `Visto ${haQuanto(ultimoUso(p), agora)}`}</span>
                  {p.em_plantao && <span className="pe-selo teal"><i className="ph ph-first-aid-kit" /> {p.plantao_atual}</span>}
                </div>

                <dl className="pe-dados">
                  <div>
                    <dt><i className="ph ph-identification-card" /> {conselho || 'Registro'}</dt>
                    <dd className={conselho && !reg ? 'falta' : ''}>{!conselho ? 'Não se aplica' : reg ? `${conselho}-${p.conselho_uf || 'PA'} ${reg}` : 'Não informado'}</dd>
                  </div>
                  <div>
                    <dt><i className="ph ph-at" /> Usuário</dt>
                    <dd className="mono">{p.usuario || '—'}</dd>
                  </div>
                  <div>
                    <dt><i className="ph ph-calendar-check" /> Último plantão</dt>
                    <dd>{p.ultimo_plantao || '—'}</dd>
                  </div>
                  <div>
                    <dt><i className="ph ph-chart-bar" /> Plantões 30 dias</dt>
                    <dd>{p.plantoes_30d ?? 0}</dd>
                  </div>
                </dl>

                <footer className="pe-rodape">
                  <div className="pe-selos">
                    {p.role === 'admin' && <span className="pe-selo azul"><i className="ph ph-shield-check" /> Admin geral</span>}
                    {p.role !== 'admin' && p.cargo_admin && <span className="pe-selo teal"><i className="ph ph-briefcase" /> {nomeCargo(p.cargo_admin)}</span>}
                    {p.deve_trocar_senha && <span className="pe-selo ambar"><i className="ph ph-key" /> Trocar senha</span>}
                    {!p.ativo && <span className="pe-selo cinza">Desativado</span>}
                  </div>
                  {podeAdministrar && <button type="button" className="pe-btn pe-btn-sec pe-btn-p" onClick={() => onGerenciar?.(p.id)}><i className="ph ph-pencil-simple" /> Editar</button>}
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
