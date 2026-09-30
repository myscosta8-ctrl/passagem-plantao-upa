import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { listarAtendimentosDaPessoa, listarRegistrosClinicos, listarAlteracoes, buscarRegistroCompleto } from '../lib/historicoClinico'
import { invalidarRegistro } from '../lib/documentos'
import { useAuth } from '../lib/AuthContext'
import './HistoricoClinico.css'

const FichaMedicaPrint = lazy(() => import('./FichaMedicaPrint'))
const FichaClinicaPrint = lazy(() => import('./FichaClinicaPrint'))

// Visão única do paciente: registros clínicos de enfermagem e médicos em ordem
// cronológica. Fica recolhida — só carrega quando o profissional expande
// "Este atendimento" ou "Atendimentos anteriores", ou quando pesquisa.
const fmtData = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
const limpar = (v) => String(v || '').replace(/^#?\s*(PEP|AT|REG)-?/i, '')

const SITUACOES = { rascunho: 'Rascunho', finalizado: 'Finalizado', invalido: 'Invalidado' }
const fmtValor = (v) => (v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v))

const tipoImpresso = (fonte, registro) => (typeof fonte.impresso === 'function' ? fonte.impresso(registro) : fonte.impresso)

function Linha({ item, onImprimir, meuId, onAlterado }) {
  const [aberto, setAberto] = useState(false)
  const [invalidando, setInvalidando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [alteracoes, setAlteracoes] = useState(null)
  const { fonte, autor, registro } = item
  const situacao = registro.situacao || 'finalizado'
  const souAutor = registro.autor_auth && registro.autor_auth === meuId

  async function confirmarInvalidacao() {
    if (!motivo.trim()) { setErro('Informe o motivo.'); return }
    const { error } = await invalidarRegistro(fonte.tabela, registro.id, motivo.trim())
    if (error) { setErro(error.message || 'Não foi possível invalidar.'); return }
    setInvalidando(false); setMotivo(''); setErro('')
    onAlterado?.()
  }

  return (
    <div className={`hc-item ${fonte.area} ${situacao === 'invalido' ? 'hc-invalido' : ''}`}>
      <div className="hc-item-topo" onClick={() => setAberto((v) => !v)}>
        <span className="hc-data">{fmtData(item.data)}</span>
        <span className={`hc-tipo ${fonte.area}`}>{fonte.rotulo}</span>
        <span className={`hc-situacao ${situacao}`}>{SITUACOES[situacao] || situacao}</span>
        <span className="hc-autor">{autor ? `${autor.nome_exibicao || autor.nome}${autor.crm ? ` · CRM ${autor.crm}` : autor.coren ? ` · COREN ${autor.coren}` : ''}` : '—'}</span>
        <i className={`ph ph-caret-${aberto ? 'up' : 'down'}`} />
      </div>
      <div className={`hc-resumo ${aberto ? 'aberto' : ''}`}>{item.resumo || 'Sem texto registrado.'}</div>
      {aberto && situacao === 'invalido' && (
        <div className="hc-motivo"><i className="ph ph-prohibit" /> Invalidado em {fmtData(registro.invalidado_em)} — motivo: {registro.motivo_invalidacao || '—'}</div>
      )}
      {aberto && (
        <div className="hc-acoes">
          {tipoImpresso(fonte, registro) && <button type="button" className="hc-btn" onClick={() => onImprimir(item)}><i className="ph ph-printer" /> Ver / Imprimir documento</button>}
          <button type="button" className="hc-btn" onClick={async () => setAlteracoes(alteracoes ? null : await listarAlteracoes(fonte.tabela, registro.id))}><i className="ph ph-clock-counter-clockwise" /> Histórico de alterações</button>
          {souAutor && situacao !== 'invalido' && !invalidando && (
            <button type="button" className="hc-btn hc-btn-perigo" onClick={() => setInvalidando(true)}><i className="ph ph-prohibit" /> Invalidar</button>
          )}
          {!souAutor && situacao === 'finalizado' && (
            <span className="hc-aviso-autor"><i className="ph ph-info" /> Só quem registrou ({autor ? (autor.nome_exibicao || autor.nome) : 'o autor'}) pode invalidar este documento.</span>
          )}
        </div>
      )}
      {aberto && invalidando && (
        <div className="hc-invalidar">
          <input type="text" placeholder="Motivo da invalidação (obrigatório)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <button type="button" className="hc-btn hc-btn-perigo" onClick={confirmarInvalidacao}>Confirmar</button>
          <button type="button" className="hc-btn" onClick={() => { setInvalidando(false); setErro('') }}>Cancelar</button>
          {erro && <span className="hc-erro">{erro}</span>}
        </div>
      )}
      {aberto && alteracoes && (
        <div className="hc-alteracoes">
          {alteracoes.length === 0 && <p className="hc-vazio">Nenhuma alteração desde a criação.</p>}
          {alteracoes.map((a) => (
            <div key={a.id} className="hc-alteracao">
              <div className="hc-alteracao-topo">{fmtData(a.alterado_em)} · {a.autor ? (a.autor.nome_exibicao || a.autor.nome) : 'Sistema'}</div>
              {a.campos.map((c) => (
                <div key={c.campo} className="hc-alteracao-campo"><b>{c.campo}</b>: <s>{fmtValor(c.antes)}</s> → {fmtValor(c.depois)}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Bloco({ titulo, subtitulo, carregar, busca, filtroArea, onImprimir, agruparPorAtendimento, meuId, solto = false }) {
  const [aberto, setAberto] = useState(false)
  const [estado, setEstado] = useState({ carregando: false, itens: null, atendimentos: [] })

  async function recarregar() {
    const r = await carregar()
    setEstado({ carregando: false, ...r })
  }

  async function abrir() {
    const novo = !aberto
    setAberto(novo)
    if (novo && !estado.itens && !estado.carregando) {
      setEstado((s) => ({ ...s, carregando: true }))
      const r = await carregar()
      setEstado({ carregando: false, ...r })
    }
  }

  const termo = busca.trim().toLowerCase()
  const itens = (estado.itens || []).filter((i) =>
    (filtroArea === 'todos' || i.fonte.area === filtroArea) &&
    (!termo || `${i.fonte.rotulo} ${i.resumo} ${i.autor?.nome_exibicao || ''} ${i.autor?.nome || ''}`.toLowerCase().includes(termo)))

  // Solto (nova interface): os registros do atendimento atual já aparecem abertos, sem o título do bloco.
  useEffect(() => { if (solto && !aberto) abrir() }, [solto]) // eslint-disable-line react-hooks/exhaustive-deps

  // Com uma pesquisa digitada, o bloco abre sozinho.
  useEffect(() => { if (termo && !aberto) abrir() }, [termo]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={solto ? 'hc-bloco hc-solto' : 'hc-bloco'}>
      {!solto && <button type="button" className="hc-bloco-topo" onClick={abrir}>
        <i className={`ph ph-caret-${aberto ? 'down' : 'right'}`} />
        <span className="hc-bloco-titulo">{titulo}</span>
        <span className="hc-bloco-sub">{subtitulo}</span>
        {estado.itens && <span className="hc-contador">{itens.length}</span>}
      </button>}
      {aberto && (
        <div className="hc-bloco-corpo">
          {estado.carregando && <p className="hc-vazio">Carregando registros...</p>}
          {!estado.carregando && estado.itens && itens.length === 0 && <p className="hc-vazio">Nenhum registro encontrado.</p>}
          {!estado.carregando && agruparPorAtendimento
            ? estado.atendimentos.map((a) => {
              const doAt = itens.filter((i) => i.registro.atendimento_id === a.id)
              if (doAt.length === 0) return null
              return (
                <div key={a.id} className="hc-atendimento">
                  <div className="hc-atendimento-topo">
                    <i className="ph ph-folder-simple" /> Atendimento {limpar(a.numero_atendimento)} · {fmtData(a.criado_em)}{a.encerrado_em ? ` até ${fmtData(a.encerrado_em)}` : ''}
                  </div>
                  {doAt.map((i) => <Linha key={i.id} item={i} onImprimir={onImprimir} meuId={meuId} onAlterado={recarregar} />)}
                </div>
              )
            })
            : itens.map((i) => <Linha key={i.id} item={i} onImprimir={onImprimir} meuId={meuId} onAlterado={recarregar} />)}
        </div>
      )}
    </div>
  )
}

export default function HistoricoClinico({ atendimento, aberto, onFechar, embutido = false }) {
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('todos')
  const [imprimindo, setImprimindo] = useState(null)
  const { enfermeiro } = useAuth()
  async function abrirImpressao(item) {
    const completo = await buscarRegistroCompleto(item.fonte.tabela, item.registro.id, item.fonte.selectCompleto)
    setImprimindo({ ...item, registro: completo || item.registro })
  }
  const atendimentoId = atendimento?.atendimento_id
  const pessoaId = atendimento?.pessoa_id

  // Ao abrir um documento do histórico, só ele vai para a impressão.
  useEffect(() => {
    if (!imprimindo) return undefined
    document.body.classList.add('hc-imprimindo')
    return () => document.body.classList.remove('hc-imprimindo')
  }, [imprimindo])

  const carregarAtual = useMemo(() => async () => ({ itens: await listarRegistrosClinicos([atendimentoId]), atendimentos: [] }), [atendimentoId])
  const carregarAnteriores = useMemo(() => async () => {
    const ats = (await listarAtendimentosDaPessoa(pessoaId)).filter((a) => a.id !== atendimentoId)
    return { itens: await listarRegistrosClinicos(ats.map((a) => a.id)), atendimentos: ats }
  }, [pessoaId, atendimentoId])

  if (imprimindo) {
    const Print = imprimindo.fonte.area === 'medico' ? FichaMedicaPrint : FichaClinicaPrint
    return (
      <div className="hc-print-overlay">
        <Suspense fallback={<p style={{ padding: 20 }}>Carregando documento...</p>}>
          <Print atendimentoId={imprimindo.registro.atendimento_id} tipo={tipoImpresso(imprimindo.fonte, imprimindo.registro)} registro={imprimindo.registro} onVoltar={() => setImprimindo(null)} />
        </Suspense>
      </div>
    )
  }

  if (!aberto && !embutido) return null

  const corpo = (
        <div className="hc-corpo">
          <div className="hc-filtros">
            <div className="hc-busca"><i className="ph ph-magnifying-glass" /><input type="text" placeholder="Pesquisar no histórico (texto, tipo de documento ou profissional)..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            <div className="hc-areas">
              {[['todos', 'Todos'], ['enfermagem', 'Enfermagem'], ['medico', 'Médico']].map(([k, r]) => (
                <button key={k} type="button" className={filtroArea === k ? 'ativo' : ''} onClick={() => setFiltroArea(k)}>{r}</button>
              ))}
            </div>
          </div>
          <Bloco titulo="Este atendimento" subtitulo="Registros da internação atual, em ordem cronológica" solto={embutido} carregar={carregarAtual} busca={busca} filtroArea={filtroArea} onImprimir={abrirImpressao} meuId={enfermeiro?.id} />
          <Bloco titulo="Atendimentos anteriores" subtitulo="Passagens anteriores do paciente pela unidade" carregar={carregarAnteriores} busca={busca} filtroArea={filtroArea} onImprimir={abrirImpressao} agruparPorAtendimento meuId={enfermeiro?.id} />
          <p className="hc-nota">A Prescrição Médica continua no histórico da própria aba (com a opção Duplicar).</p>
        </div>
  )

  // Nova interface: histórico completo embutido na área livre abaixo das abas.
  if (embutido) {
    return (
      <section className="hc-embutido no-print">
        <div className="hc-gaveta-topo">
          <span><i className="ph ph-clock-counter-clockwise" /> Histórico Clínico do Paciente</span>
          <span className="hc-embutido-dica">Escolha uma aba acima para registrar um novo documento</span>
        </div>
        {corpo}
      </section>
    )
  }

  return (
    <div className="hc-gaveta-fundo no-print" onClick={onFechar}>
      <aside className="hc-gaveta" onClick={(e) => e.stopPropagation()}>
        <div className="hc-gaveta-topo">
          <span><i className="ph ph-clock-counter-clockwise" /> Histórico Clínico do Paciente</span>
          <button type="button" className="hc-fechar" onClick={onFechar} title="Fechar"><i className="ph ph-x" /></button>
        </div>
        {corpo}
      </aside>
    </div>
  )
}
