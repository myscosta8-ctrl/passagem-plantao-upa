import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { avisarErro } from '../lib/erros'
import './PainelEquipe.css'

const TIPO = { medico: 'Médico', enfermagem: 'Enfermagem', recepcao: 'Recepção' }
const CONSELHO = { medico: 'CRM', enfermagem: 'COREN' }
const MIN = 60000
const ONLINE_MS = 5 * MIN

const registro = (p) => (p.tipo === 'medico' ? p.crm : p.tipo === 'enfermagem' ? p.coren : null)
const semRegistro = (p) => !!CONSELHO[p.tipo] && !registro(p)
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
      && (!b || `${p.nome} ${p.nome_exibicao} ${p.usuario} ${p.crm || ''} ${p.coren || ''}`.toLowerCase().includes(b)))
    const peso = (p) => (online(p, agora) ? 0 : p.em_plantao ? 1 : 2)
    return r.sort((a, c) => ordem === 'nome' ? String(a.nome).localeCompare(c.nome)
      : ordem === 'acesso' ? (ultimoUso(c) || 0) - (ultimoUso(a) || 0)
      : peso(a) - peso(c) || String(a.nome).localeCompare(c.nome))
  }, [base, filtro, tipo, busca, ordem, agora])

  return (
    <div className="workspace pe-page">
      <div className="page-header" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="page-title">
          <h1>Painel de Equipe</h1>
          <p>Todos os profissionais com login: quem está online, em plantão e o que falta no cadastro.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={carregar}><i className="ph ph-arrows-clockwise" /> Atualizar</button>
          {podeAdministrar && <button className="btn btn-primary" onClick={() => onGerenciar?.(null)}><i className="ph ph-user-plus" /> Gerenciar logins</button>}
          <button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left" /> Voltar ao painel</button>
        </div>
      </div>

      <div className="pe-resumo">
        {FILTROS.map((x) => (
          <button key={x.k} type="button" className={`pe-chip pe-${x.k} ${filtro === x.k ? 'on' : ''}`} onClick={() => setFiltro(filtro === x.k && x.k !== 'todos' ? 'todos' : x.k)}>
            <b>{contagem[x.k] ?? 0}</b> {x.r}
          </button>
        ))}
      </div>

      <div className="pe-filtros">
        <input placeholder="Buscar por nome, usuário, COREN ou CRM..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="todos">Todos os tipos</option>
          {Object.entries(TIPO).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
        </select>
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          <option value="status">Ordenar: online e em plantão primeiro</option>
          <option value="nome">Ordenar: nome</option>
          <option value="acesso">Ordenar: último acesso</option>
        </select>
        <label><input type="checkbox" checked={inativos} onChange={(e) => setInativos(e.target.checked)} /> Incluir desativados</label>
      </div>

      {carregando ? <p className="pe-vazio">Carregando...</p> : visiveis.length === 0 ? <p className="pe-vazio">Nenhum profissional neste filtro.</p> : (
        <div className="pe-grade">
          {visiveis.map((p) => {
            const on = online(p, agora)
            const reg = registro(p)
            return (
              <div key={p.id} className={`pe-card ${!p.ativo ? 'inativo' : ''}`}>
                <div className="pe-topo">
                  <div className={`pe-avatar ${on ? 'on' : ''}`} title={on ? 'Online agora' : 'Offline'}>{iniciais(p.nome)}<span /></div>
                  <div className="pe-id">
                    <div className="pe-nome">{p.nome}</div>
                    <div className="pe-sub">{p.nome_exibicao || '—'} · {TIPO[p.tipo] || p.tipo}{p.usuario ? ` · usuário: ${p.usuario}` : ''}</div>
                  </div>
                </div>
                <div className="pe-selos">
                  {on ? <span className="pe-selo verde"><i className="ph ph-circle-fill" /> Online</span> : <span className="pe-selo">Offline</span>}
                  {p.em_plantao && <span className="pe-selo teal"><i className="ph ph-first-aid-kit" /> Em plantão · {p.plantao_atual}</span>}
                  {p.role === 'admin' && <span className="pe-selo azul">Administrador</span>}
                  {!p.ativo && <span className="pe-selo cinza">Desativado</span>}
                  {p.deve_trocar_senha && <span className="pe-selo ambar">Trocar senha</span>}
                  {semRegistro(p) && <span className="pe-selo ambar"><i className="ph ph-warning" /> Sem {CONSELHO[p.tipo]}</span>}
                </div>
                <dl className="pe-dados">
                  <div><dt>{CONSELHO[p.tipo] || 'Registro'}</dt><dd>{reg ? `${CONSELHO[p.tipo]}-${p.conselho_uf || 'PA'} ${reg}` : '—'}</dd></div>
                  <div><dt>Último acesso</dt><dd>{haQuanto(ultimoUso(p), agora)}</dd></div>
                  <div><dt>Último plantão</dt><dd>{p.ultimo_plantao || '—'}</dd></div>
                  <div><dt>Plantões (30 dias)</dt><dd>{p.plantoes_30d ?? 0}</dd></div>
                </dl>
                {podeAdministrar && (
                  <div className="pe-acoes"><button type="button" className="btn btn-outline" onClick={() => onGerenciar?.(p.id)}><i className="ph ph-pencil-simple" /> Editar cadastro</button></div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
