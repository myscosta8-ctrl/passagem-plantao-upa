import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { listarAtendimentosDaPessoa, listarRegistrosClinicos } from '../lib/historicoClinico'
import './HistoricoClinico.css'

const FichaMedicaPrint = lazy(() => import('./FichaMedicaPrint'))
const FichaClinicaPrint = lazy(() => import('./FichaClinicaPrint'))

// Visão única do paciente: registros clínicos de enfermagem e médicos em ordem
// cronológica. Fica recolhida — só carrega quando o profissional expande
// "Este atendimento" ou "Atendimentos anteriores", ou quando pesquisa.
const fmtData = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
const limpar = (v) => String(v || '').replace(/^(PEP|AT)-?/i, '')

function Linha({ item, onImprimir }) {
  const [aberto, setAberto] = useState(false)
  const { fonte, autor } = item
  return (
    <div className={`hc-item ${fonte.area}`}>
      <div className="hc-item-topo" onClick={() => setAberto((v) => !v)}>
        <span className="hc-data">{fmtData(item.data)}</span>
        <span className={`hc-tipo ${fonte.area}`}>{fonte.rotulo}</span>
        <span className="hc-autor">{autor ? `${autor.nome_exibicao || autor.nome}${autor.crm ? ` · CRM ${autor.crm}` : autor.coren ? ` · COREN ${autor.coren}` : ''}` : '—'}</span>
        <i className={`ph ph-caret-${aberto ? 'up' : 'down'}`} />
      </div>
      <div className={`hc-resumo ${aberto ? 'aberto' : ''}`}>{item.resumo || 'Sem texto registrado.'}</div>
      {aberto && fonte.impresso && (
        <div className="hc-acoes">
          <button type="button" className="hc-btn" onClick={() => onImprimir(item)}><i className="ph ph-printer" /> Ver / Imprimir documento</button>
        </div>
      )}
    </div>
  )
}

function Bloco({ titulo, subtitulo, carregar, busca, filtroArea, onImprimir, agruparPorAtendimento }) {
  const [aberto, setAberto] = useState(false)
  const [estado, setEstado] = useState({ carregando: false, itens: null, atendimentos: [] })

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

  // Com uma pesquisa digitada, o bloco abre sozinho.
  useEffect(() => { if (termo && !aberto) abrir() }, [termo]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="hc-bloco">
      <button type="button" className="hc-bloco-topo" onClick={abrir}>
        <i className={`ph ph-caret-${aberto ? 'down' : 'right'}`} />
        <span className="hc-bloco-titulo">{titulo}</span>
        <span className="hc-bloco-sub">{subtitulo}</span>
        {estado.itens && <span className="hc-contador">{itens.length}</span>}
      </button>
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
                    <i className="ph ph-folder-simple" /> Atendimento #{limpar(a.numero_atendimento)} · {fmtData(a.criado_em)}{a.encerrado_em ? ` até ${fmtData(a.encerrado_em)}` : ''}
                  </div>
                  {doAt.map((i) => <Linha key={i.id} item={i} onImprimir={onImprimir} />)}
                </div>
              )
            })
            : itens.map((i) => <Linha key={i.id} item={i} onImprimir={onImprimir} />)}
        </div>
      )}
    </div>
  )
}

export default function HistoricoClinico({ atendimento }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('todos')
  const [imprimindo, setImprimindo] = useState(null)
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
          <Print atendimentoId={imprimindo.registro.atendimento_id} tipo={imprimindo.fonte.impresso} registro={imprimindo.registro} onVoltar={() => setImprimindo(null)} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="hc-card no-print">
      <button type="button" className="hc-topo" onClick={() => setAberto((v) => !v)}>
        <span><i className="ph ph-clock-counter-clockwise" /> Histórico Clínico do Paciente</span>
        <span className="hc-topo-dica">{aberto ? 'Recolher' : 'Expandir para consultar evoluções, admissões, alta e demais registros'} <i className={`ph ph-caret-${aberto ? 'up' : 'down'}`} /></span>
      </button>
      {aberto && (
        <div className="hc-corpo">
          <div className="hc-filtros">
            <div className="hc-busca"><i className="ph ph-magnifying-glass" /><input type="text" placeholder="Pesquisar no histórico (texto, tipo de documento ou profissional)..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            <div className="hc-areas">
              {[['todos', 'Todos'], ['enfermagem', 'Enfermagem'], ['medico', 'Médico']].map(([k, r]) => (
                <button key={k} type="button" className={filtroArea === k ? 'ativo' : ''} onClick={() => setFiltroArea(k)}>{r}</button>
              ))}
            </div>
          </div>
          <Bloco titulo="Este atendimento" subtitulo="Registros da internação atual, em ordem cronológica" carregar={carregarAtual} busca={busca} filtroArea={filtroArea} onImprimir={setImprimindo} />
          <Bloco titulo="Atendimentos anteriores" subtitulo="Passagens anteriores do paciente pela unidade" carregar={carregarAnteriores} busca={busca} filtroArea={filtroArea} onImprimir={setImprimindo} agruparPorAtendimento />
          <p className="hc-nota">Exames, Prescrição Médica e AIH continuam no histórico da própria aba.</p>
        </div>
      )}
    </div>
  )
}
