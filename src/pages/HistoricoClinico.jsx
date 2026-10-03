import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { queryClient } from '../lib/cache'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import { listarAtendimentosDaPessoa, listarRegistrosClinicos, listarAlteracoes, buscarRegistroCompleto, ABA_EDICAO } from '../lib/historicoClinico'
import { invalidarRegistro } from '../lib/documentos'
import { useAuth } from '../lib/AuthContext'
import { definirDuplicacao } from '../lib/duplicarPendente'
import { precisaAtm, itensControlados, carregarCatalogo, impressaoVinculada } from '../lib/documentosVinculados'
import './HistoricoClinico.css'

// Módulos de impressão: baixados em segundo plano quando o histórico abre. Depois de prontos,
// o documento usa o módulo direto, sem passar pelo <Suspense> — no React 19, a primeira
// suspensão espera ~0,3 s antes de mostrar o conteúdo, mesmo com o módulo já baixado.
const prontos = {}
const importarMedica = () => import('./FichaMedicaPrint').then((m) => { prontos.medica = m.default; return m })
const importarClinica = () => import('./FichaClinicaPrint').then((m) => { prontos.clinica = m.default; return m })
const FichaMedicaPrintLazy = lazy(importarMedica)
const FichaClinicaPrintLazy = lazy(importarClinica)
function FichaMedicaPrint(props) { const C = prontos.medica || FichaMedicaPrintLazy; return <C {...props} /> }
function FichaClinicaPrint(props) { const C = prontos.clinica || FichaClinicaPrintLazy; return <C {...props} /> }

// Visão única do paciente: registros clínicos de enfermagem e médicos em ordem
// cronológica. Fica recolhida — só carrega quando o profissional expande
// "Este atendimento" ou "Atendimentos anteriores", ou quando pesquisa.
const fmtData = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
const limpar = (v) => String(v || '').replace(/^#?\s*(PEP|AT|REG)-?/i, '')

const fmtHora = (d) => (d ? new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—')
// Rótulo do dia no agrupamento: Hoje · 30/09, Ontem · 29/09, 28/09.
function rotuloDia(d) {
  const dt = new Date(d); const hoje = new Date(); const ontem = new Date(); ontem.setDate(hoje.getDate() - 1)
  const dm = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  if (dt.toDateString() === hoje.toDateString()) return `Hoje · ${dm}`
  if (dt.toDateString() === ontem.toDateString()) return `Ontem · ${dm}`
  return dt.getFullYear() === hoje.getFullYear() ? dm : dt.toLocaleDateString('pt-BR')
}
// Nome curto do tipo de documento na lista (o nome completo fica no impresso).
const ROTULO_CURTO = {
  'Admissão de Enfermagem (Histórico de Enfermagem)': 'Admissão de Enfermagem',
  'Admissão de Enfermagem (registro anterior)': 'Admissão (anterior)',
  'Evolução do Enfermeiro (SAE)': 'Evolução SAE',
  'Transferência SBAR': 'Transferência',
  'Nota de Intercorrência (Enfermagem)': 'Intercorrência',
  'Nota de Intercorrência Médica': 'Intercorrência Médica',
  'Atualização de Quadro Clínico': 'Atualização de Quadro',
}
const rotuloCurto = (fonte) => ROTULO_CURTO[fonte.rotulo] || fonte.rotulo

const SITUACOES = { rascunho: 'Rascunho', finalizado: 'Finalizado', invalido: 'Invalidado' }
const fmtValor = (v) => (v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v))

const tipoImpresso = (fonte, registro) => (typeof fonte.impresso === 'function' ? fonte.impresso(registro) : fonte.impresso)

function Linha({ item, onImprimir, meuId, onAlterado, onDuplicar, onEditar, soHora = false }) {
  const [aberto, setAberto] = useState(false)
  const [invalidando, setInvalidando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [alteracoes, setAlteracoes] = useState(null)
  const { fonte, autor, registro } = item
  const situacao = registro.situacao || 'finalizado'
  // Prescrição finalizada com antimicrobiano restrito EV / medicamento controlado: reimpressão da ATM e da Receita de Controle Especial.
  const ehPrescricao = fonte.tabela === 'prescricoes_medicas' && situacao === 'finalizado'
  const [catalogo, setCatalogo] = useState(null)
  useEffect(() => { if (ehPrescricao) carregarCatalogo().then(setCatalogo) }, [ehPrescricao])
  const temAtm = ehPrescricao && precisaAtm(registro)
  const temControle = ehPrescricao && !!catalogo && itensControlados(registro, catalogo).length > 0
  const souAutor = registro.autor_auth && registro.autor_auth === meuId
  // AIH pré-preenchida pela enfermagem/recepção e encaminhada a mim: posso revisar e assinar.
  const encaminhadaAMim = fonte.tabela === 'aih_solicitacoes' && registro.medico_destino_id === meuId && !!registro.encaminhado_em

  async function confirmarInvalidacao() {
    if (!motivo.trim()) { setErro('Informe o motivo.'); return }
    const { error } = await invalidarRegistro(fonte.tabela, registro.id, motivo.trim())
    if (error) { setErro(error.message || 'Não foi possível invalidar.'); return }
    setInvalidando(false); setMotivo(''); setErro('')
    onAlterado?.()
  }

  return (
    <div className={`hc-item ${fonte.area} ${situacao === 'invalido' ? 'hc-invalido' : ''}`}>
      <div className="hc-item-topo" onClick={() => setAberto((v) => !v)} title={aberto ? 'Fechar detalhes' : 'Ver detalhes e histórico de alterações'}>
        <span className={soHora ? 'hc-data hc-hora' : 'hc-data'}>{soHora ? fmtHora(item.data) : fmtData(item.data)}</span>
        <span className="hc-col-tipo"><span className={`hc-tipo ${fonte.area}`} title={fonte.rotulo}>{rotuloCurto(fonte)}</span></span>
        <span className="hc-autor">
          {autor ? <><b>{autor.nome_exibicao || autor.nome}</b>{(autor.crm || autor.coren) && <span className="hc-conselho">{autor.crm ? `CRM ${autor.crm}` : `COREN ${autor.coren}`}</span>}</> : '—'}
        </span>
        <span className="hc-col-sit"><span className={`hc-situacao ${situacao}`}>{SITUACOES[situacao] || situacao}</span></span>
        <span className="hc-acoes-linha" onClick={(e) => e.stopPropagation()}>
          {tipoImpresso(fonte, registro) && (
            <button type="button" className="hc-ic hc-sempre" title="Visualizar documento" aria-label="Visualizar" onClick={() => onImprimir(item)}><i className="ph ph-magnifying-glass" /></button>
          )}
          {tipoImpresso(fonte, registro) && situacao !== 'invalido' && (
            <button type="button" className="hc-ic hc-sempre" title="Imprimir documento" aria-label="Imprimir" onClick={() => onImprimir(item, { imprimir: true })}><i className="ph ph-printer" /></button>
          )}
          {temAtm && (
            <button type="button" className="hc-ic hc-sempre hc-vinc" title="Reimprimir Ficha de ATM (antimicrobiano restrito)" aria-label="Reimprimir ATM" onClick={() => onImprimir(item, { vinculado: 'atm' })}><i className="ph ph-shield-warning" /></button>
          )}
          {temControle && (
            <button type="button" className="hc-ic hc-sempre hc-vinc" title="Reimprimir Receita de Controle Especial (Portaria 344)" aria-label="Reimprimir Controle Especial" onClick={() => onImprimir(item, { vinculado: 'controle' })}><i className="ph ph-seal-warning" /></button>
          )}
          {onEditar && situacao === 'rascunho' && (souAutor || encaminhadaAMim) && onEditar.pode(item) && (
            <button type="button" className="hc-ic hc-sempre hc-editar" title="Editar rascunho" aria-label="Editar rascunho" onClick={() => onEditar.fazer(item)}><i className="ph ph-pencil-simple" /></button>
          )}
          {souAutor && situacao !== 'invalido' && (
            <button type="button" className="hc-ic perigo" title="Invalidar documento" aria-label="Invalidar" onClick={() => { setAberto(true); setInvalidando(true) }}><i className="ph ph-prohibit" /></button>
          )}
          {onDuplicar && situacao === 'finalizado' && onDuplicar.pode(item) && (
            <button type="button" className="hc-ic" title="Duplicar: copiar para uma nova evolução (sinais vitais não são copiados)" aria-label="Duplicar" onClick={() => onDuplicar.fazer(item)}><i className="ph ph-copy" /></button>
          )}
        </span>
      </div>
      {aberto && situacao === 'invalido' && (
        <div className="hc-motivo"><i className="ph ph-prohibit" /> Invalidado em {fmtData(registro.invalidado_em)} — motivo: {registro.motivo_invalidacao || '—'}</div>
      )}
      {aberto && (
        <div className="hc-acoes">
          <button type="button" className="hc-btn" onClick={async () => setAlteracoes(alteracoes ? null : await listarAlteracoes(fonte.tabela, registro.id))}><i className="ph ph-clock-counter-clockwise" /> Histórico de alterações</button>
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

// Lista guardada por alguns minutos (chave): ao reabrir o histórico aparece na hora o que já
// foi carregado e, ao mesmo tempo, busca de novo em segundo plano ("Atualizando...").
function Bloco({ titulo, subtitulo, chave, carregar, busca, filtroArea, onImprimir, agruparPorAtendimento, meuId, solto = false, onDuplicar, onEditar, mostrarInvalidados = true, onContarInvalidados }) {
  const [aberto, setAberto] = useState(false)
  const [estado, setEstado] = useState({ carregando: false, itens: null, atendimentos: [] })
  const [atualizando, setAtualizando] = useState(false)
  const ativo = useRef(true)
  useEffect(() => () => { ativo.current = false }, [])

  async function buscar() {
    const r = await carregar()
    if (!r.falhou) queryClient.setQueryData(chave, r)
    if (ativo.current) setEstado({ carregando: false, ...r })
    return r
  }

  async function recarregar() { await buscar() }

  async function abrir() {
    const novo = !aberto
    setAberto(novo)
    if (!novo || estado.itens || estado.carregando) return
    const guardado = queryClient.getQueryData(chave)
    if (guardado) {
      setEstado({ carregando: false, ...guardado })
      setAtualizando(true)
      await buscar()
      if (ativo.current) setAtualizando(false)
      return
    }
    setEstado((s) => ({ ...s, carregando: true }))
    await buscar()
  }

  const termo = busca.trim().toLowerCase()
  const nInvalidados = (estado.itens || []).filter((i) => i.registro.situacao === 'invalido').length
  useEffect(() => { onContarInvalidados?.(nInvalidados) }, [nInvalidados]) // eslint-disable-line react-hooks/exhaustive-deps
  const itens = (estado.itens || []).filter((i) => (mostrarInvalidados || i.registro.situacao !== 'invalido')).filter((i) =>
    (filtroArea === 'todos' || i.fonte.area === filtroArea || (filtroArea === 'multi' && ['nutricao', 'servico_social'].includes(i.fonte.area))) &&
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
        {atualizando && <span className="hc-bloco-sub">Atualizando...</span>}
      </button>}
      {aberto && (
        <div className="hc-bloco-corpo">
          {estado.carregando && <p className="hc-vazio">Carregando registros...</p>}
          {solto && atualizando && <p className="hc-vazio" style={{ padding: '2px 0', fontSize: 'var(--fs-xs)' }}>Atualizando...</p>}
          {!estado.carregando && estado.itens && itens.length === 0 && <p className="hc-vazio">Nenhum registro encontrado.</p>}
          {!estado.carregando && itens.length > 0 && (
            <div className={agruparPorAtendimento ? 'hc-cabecalho hc-data-completa' : 'hc-cabecalho'} aria-hidden="true">
              <span>{agruparPorAtendimento ? 'Data' : 'Hora'}</span><span>Documento</span><span>Profissional</span><span className="hc-col-sit">Situação</span><span className="hc-cab-acoes">Ações</span>
            </div>
          )}
          {!estado.carregando && agruparPorAtendimento
            ? estado.atendimentos.map((a) => {
              const doAt = itens.filter((i) => i.registro.atendimento_id === a.id)
              if (doAt.length === 0) return null
              return (
                <div key={a.id} className="hc-atendimento hc-data-completa">
                  <div className="hc-atendimento-topo">
                    <i className="ph ph-folder-simple" /> Atendimento {limpar(a.numero_atendimento)} · {fmtData(a.criado_em)}{a.encerrado_em ? ` até ${fmtData(a.encerrado_em)}` : ''}
                  </div>
                  {doAt.map((i) => <Linha key={i.id} item={i} onImprimir={onImprimir} meuId={meuId} onAlterado={recarregar} onDuplicar={onDuplicar} onEditar={onEditar} />)}
                </div>
              )
            })
            : itens.map((i, k) => (
              <div key={i.id}>
                {(k === 0 || rotuloDia(itens[k - 1].data) !== rotuloDia(i.data)) && (() => {
                  const n = itens.filter((x) => rotuloDia(x.data) === rotuloDia(i.data)).length
                  return <div className="hc-dia">{rotuloDia(i.data)}<small>{n} {n === 1 ? 'registro' : 'registros'}</small></div>
                })()}
                <Linha item={i} onImprimir={onImprimir} meuId={meuId} onAlterado={recarregar} onDuplicar={onDuplicar} onEditar={onEditar} soHora />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// Documento do histórico aberto em janela, com Voltar e Imprimir (também usado pela tela Desfechos).
export function VisualizarRegistro({ item, onFechar, imprimirAoAbrir = false }) {
  const conjunta = !!item.extras?.length
  useEffect(() => {
    if (conjunta) return undefined // impressão conjunta usa a própria tela (fora da janela do histórico)
    document.body.classList.add('hc-imprimindo')
    return () => document.body.classList.remove('hc-imprimindo')
  }, [conjunta])
  // Botão "Imprimir" da lista: espera o documento carregar e já abre a impressão.
  useEffect(() => {
    if (!imprimirAoAbrir) return undefined
    let tentativas = 0
    const t = setInterval(() => {
      tentativas += 1
      const pronto = document.querySelector('.hc-doc-corpo .print-page, .impressao-pacote .pacote-doc')
      if (pronto || tentativas > 40) {
        clearInterval(t)
        if (pronto) setTimeout(() => window.print(), 800)
      }
    }, 250)
    return () => clearInterval(t)
  }, [imprimirAoAbrir])
  const Print = item.fonte.area === 'medico' ? FichaMedicaPrint : FichaClinicaPrint
  // Janela abre na hora do clique; o documento completo chega em seguida.
  if (item.carregando) {
    return (
      <div className="hc-print-overlay" onClick={onFechar}>
        <div className="hc-doc-janela" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="hc-doc-corpo"><p style={{ padding: 20 }}>Carregando documento...</p></div>
          <div className="hc-doc-rodape no-print">
            <button type="button" className="hc-doc-voltar" onClick={onFechar}><i className="ph ph-arrow-left" /> Voltar</button>
          </div>
        </div>
      </div>
    )
  }
  // Mais de um documento (ex.: duas ATMs da mesma prescrição): impressão conjunta, com Voltar/Imprimir próprios.
  if (conjunta) {
    return (
      <Suspense fallback={<p style={{ padding: 20 }}>Carregando documento...</p>}>
        <FichaMedicaPrint atendimentoId={item.registro.atendimento_id} tipo={tipoImpresso(item.fonte, item.registro)} registro={item.registro} extras={item.extras} onVoltar={onFechar} />
      </Suspense>
    )
  }
  return (
    <div className="hc-print-overlay" onClick={onFechar}>
      <div className="hc-doc-janela" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="hc-doc-corpo">
          <Suspense fallback={<p style={{ padding: 20 }}>Carregando documento...</p>}>
            <Print atendimentoId={item.registro.atendimento_id} tipo={tipoImpresso(item.fonte, item.registro)} registro={item.registro} onVoltar={onFechar} />
          </Suspense>
        </div>
        <div className="hc-doc-rodape no-print">
          <button type="button" className="hc-doc-voltar" onClick={onFechar}><i className="ph ph-arrow-left" /> Voltar</button>
          <button type="button" className="hc-doc-imprimir" onClick={() => window.print()}><i className="ph ph-printer" /> Imprimir</button>
        </div>
      </div>
    </div>
  )
}

// Último documento (com impresso, não invalidado) que o profissional registrou no atendimento, já completo para impressão.
export async function ultimoDocumentoDoAutor(atendimentoId, autorId) {
  if (!atendimentoId || !autorId) return null
  const itens = (await listarRegistrosClinicos([atendimentoId]))
    .filter((i) => i.registro.autor_auth === autorId && i.registro.situacao !== 'invalido' && tipoImpresso(i.fonte, i.registro))
    .sort((a, b) => new Date(b.data) - new Date(a.data))
  const it = itens[0]
  if (!it) return null
  const completo = await buscarRegistroCompleto(it.fonte.tabela, it.registro.id, it.fonte.selectCompleto)
  return { ...it, registro: completo || it.registro }
}

export default function HistoricoClinico({ atendimento, aberto, onFechar, embutido = false, categoriaDuplicar, onDuplicado, onEditarRascunho }) {
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('todos')
  const [verInvalidados, setVerInvalidados] = useState(false)
  const [nInv, setNInv] = useState({ atual: 0, anteriores: 0 })
  const [imprimindo, setImprimindo] = useState(null)
  const { enfermeiro } = useAuth()
  // Cada clique abre a janela na hora ("Carregando documento..."); se o profissional voltar
  // antes de o documento chegar, a resposta atrasada não reabre a janela.
  const pedidoAtual = useRef(0)
  const fecharImpressao = () => { pedidoAtual.current += 1; setImprimindo(null) }
  async function abrirImpressao(item, opcoes = {}) {
    const pedido = ++pedidoAtual.current
    setImprimindo({ ...item, carregando: true })
    buscarCabecalhoImpressao(item.registro.atendimento_id).catch(() => {}) // em paralelo com o documento
    const completo = await buscarRegistroCompleto(item.fonte.tabela, item.registro.id, item.fonte.selectCompleto)
    if (pedido !== pedidoAtual.current) return
    if (opcoes.vinculado) {
      const vinc = await impressaoVinculada(opcoes.vinculado, completo || item.registro)
      if (pedido !== pedidoAtual.current) return
      if (!vinc) { setImprimindo(null); return }
      setImprimindo({ ...item, fonte: { ...item.fonte, area: 'medico', impresso: vinc.tipo }, registro: vinc.registro, extras: vinc.extras, imprimirAoAbrir: true })
      return
    }
    setImprimindo({ ...item, registro: completo || item.registro, imprimirAoAbrir: !!opcoes.imprimir })
  }
  // Os módulos de impressão já vêm baixados em segundo plano: o primeiro "Visualizar" não espera.
  useEffect(() => {
    const t = setTimeout(() => { importarMedica().catch(() => {}); importarClinica().catch(() => {}) }, 1500)
    return () => clearTimeout(t)
  }, [])
  const atendimentoId = atendimento?.atendimento_id
  // Botão "Duplicar" nas evoluções finalizadas do atendimento atual, da mesma categoria da ficha aberta.
  const TABELA_DUP = { enfermagem: 'evolucoes', medico: 'evolucoes_medicas' }
  const onDuplicar = categoriaDuplicar && onDuplicado ? {
    pode: (item) => item.fonte.tabela === TABELA_DUP[categoriaDuplicar] && item.registro.atendimento_id === atendimentoId && (categoriaDuplicar !== 'enfermagem' || item.registro.tipo !== 'medico'),
    fazer: async (item) => {
      const completo = await buscarRegistroCompleto(item.fonte.tabela, item.registro.id)
      if (!completo) return
      const quem = item.autor ? (item.autor.nome_exibicao || item.autor.nome) : '—'
      const quando = new Date(item.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      definirDuplicacao(categoriaDuplicar, completo, `Copiado da evolução de ${quando} (${quem}). Revise e atualize tudo antes de salvar — os sinais vitais não são copiados.`)
      onDuplicado()
    },
  } : null
  // "Editar rascunho": só os rascunhos do próprio profissional, deste atendimento e da ficha aberta (enfermagem/médico).
  const onEditar = onEditarRascunho && categoriaDuplicar ? {
    pode: (item) => item.registro.atendimento_id === atendimentoId && (item.fonte.area === categoriaDuplicar || (categoriaDuplicar === 'multi' && ['nutricao', 'servico_social'].includes(item.fonte.area))) && !!ABA_EDICAO[item.fonte.tabela],
    fazer: (item) => onEditarRascunho(item.fonte.tabela, item.registro.id, ABA_EDICAO[item.fonte.tabela]),
  } : null
  const pessoaId = atendimento?.pessoa_id

  const carregarAtual = useMemo(() => async () => ({ itens: await listarRegistrosClinicos([atendimentoId]), atendimentos: [] }), [atendimentoId])
  const carregarAnteriores = useMemo(() => async () => {
    const ats = (await listarAtendimentosDaPessoa(pessoaId)).filter((a) => a.id !== atendimentoId)
    return { itens: await listarRegistrosClinicos(ats.map((a) => a.id)), atendimentos: ats }
  }, [pessoaId, atendimentoId])

  if (!aberto && !embutido) return null

  // O documento abre POR CIMA do histórico: a lista continua carregada (e na mesma posição)
  // e "Voltar" é imediato, sem buscar evoluções e prescrições de novo.
  const janela = imprimindo && <VisualizarRegistro item={imprimindo} imprimirAoAbrir={imprimindo.imprimirAoAbrir} onFechar={fecharImpressao} />
  // Impressão conjunta ocupa a tela toda: o histórico fica escondido (sem desmontar) até voltar.
  const esconder = imprimindo?.extras?.length ? { display: 'none' } : undefined

  const corpo = (
        <div className="hc-corpo">
          <div className="hc-filtros">
            <div className="hc-busca"><i className="ph ph-magnifying-glass" /><input type="text" placeholder="Pesquisar no histórico (texto, tipo de documento ou profissional)..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            <div className="hc-areas">
              {[['todos', 'Todos'], ['enfermagem', 'Enfermagem'], ['medico', 'Médico'], ['multi', 'Multiprofissional']].map(([k, r]) => (
                <button key={k} type="button" className={filtroArea === k ? 'ativo' : ''} onClick={() => setFiltroArea(k)}>{r}</button>
              ))}
            </div>
            <label className="hc-ver-inv">
              <input type="checkbox" checked={verInvalidados} onChange={(e) => setVerInvalidados(e.target.checked)} />
              <span className="hc-switch" /> Mostrar invalidados{nInv.atual + nInv.anteriores > 0 ? ` (${nInv.atual + nInv.anteriores})` : ''}
            </label>
          </div>
          <Bloco titulo="Este atendimento" chave={['historico_clinico', 'atual', atendimentoId]} subtitulo="Registros da internação atual, do mais recente para o mais antigo" solto={embutido} carregar={carregarAtual} busca={busca} filtroArea={filtroArea} onImprimir={abrirImpressao} meuId={enfermeiro?.id} onDuplicar={onDuplicar} onEditar={onEditar} mostrarInvalidados={verInvalidados} onContarInvalidados={(n) => setNInv((v) => ({ ...v, atual: n }))} />
          <Bloco titulo="Atendimentos anteriores" chave={['historico_clinico', 'anteriores', pessoaId, atendimentoId]} subtitulo="Passagens anteriores do paciente pela unidade" carregar={carregarAnteriores} busca={busca} filtroArea={filtroArea} onImprimir={abrirImpressao} agruparPorAtendimento meuId={enfermeiro?.id} onDuplicar={onDuplicar} mostrarInvalidados={verInvalidados} onContarInvalidados={(n) => setNInv((v) => ({ ...v, anteriores: n }))} />
        </div>
  )

  // Nova interface: histórico completo embutido na área livre abaixo das abas.
  if (embutido) {
    return (
      <>
        <section className="hc-embutido no-print" style={esconder}>
          <div className="hc-gaveta-topo">
            <span><i className="ph ph-clock-counter-clockwise" /> Histórico Clínico do Paciente</span>
          </div>
          {corpo}
        </section>
        {janela}
      </>
    )
  }

  return (
    <>
      <div className="hc-gaveta-fundo no-print" onClick={onFechar} style={esconder}>
        <aside className="hc-gaveta" onClick={(e) => e.stopPropagation()}>
          <div className="hc-gaveta-topo">
            <span><i className="ph ph-clock-counter-clockwise" /> Histórico Clínico do Paciente</span>
            <button type="button" className="hc-fechar" onClick={onFechar} title="Fechar"><i className="ph ph-x" /></button>
          </div>
          {corpo}
        </aside>
      </div>
      {janela}
    </>
  )
}
