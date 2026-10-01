import { numeroLimpo } from '../lib/numeros'
import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { registrarEventoAuditoria } from '../lib/pepAtendimentos'
import { VisualizarRegistro, ultimoDocumentoDoAutor } from './HistoricoClinico'
import './AltasRecentes.css'
import CampoPeriodo, { periodoPadrao } from '../components/CampoPeriodo'

const EspacoPaciente = lazy(() => import('./EspacoPaciente'))

const SELECT_DESFECHO = 'id, pessoa_id, encerrado_em, queixa_principal, pessoas(nome, prontuario_numero), internacoes(resumo_alta, diagnostico_admissao, desfecho_tipo, desfecho_obs, encerrado_em), leito_ocupacoes(liberado_em, leitos(numero, setor_id, setores(nome)))'
const semAcento = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Linha da lista a partir do atendimento encerrado.
function mapearDesfecho(a) {
  const internacao = (Array.isArray(a.internacoes) ? a.internacoes[0] : a.internacoes) || {}
  const ultimaOcupacao = [...(a.leito_ocupacoes ?? [])].sort((x, y) => new Date(y.liberado_em || 0) - new Date(x.liberado_em || 0))[0]
  const leito = ultimaOcupacao?.leitos
  const tipo = normalizarDesfecho(internacao.desfecho_tipo)
  return {
    id: `pep-${a.id}`,
    atendimentoId: a.id,
    pessoaId: a.pessoa_id,
    nome: a.pessoas?.nome || 'Não informado',
    tipo_desfecho: tipo,
    data_desfecho: a.encerrado_em || internacao.encerrado_em,
    // Transferência: desfecho_obs guarda o hospital de destino informado no desfecho.
    destino: tipo === 'Transferência' ? (internacao.desfecho_obs || '') : '',
    diagnostico: (tipo === 'Transferência' ? null : internacao.desfecho_obs) || internacao.resumo_alta || internacao.diagnostico_admissao || a.queixa_principal || '—',
    leito_info: leito ? `Leito ${leito.numero} – ${leito.setores?.nome || ''}` : 'Observação',
    leito: leito ? { id: `pos-alta-${a.id}`, numero: leito.numero, setor_id: leito.setor_id } : { id: `pos-alta-${a.id}`, numero: '—', setor_id: null },
    setorNome: leito?.setores?.nome || '',
    prontuario: numeroLimpo(a.pessoas?.prontuario_numero),
  }
}

// Busca por nome completo (ou parte) ou nº do prontuário em TODAS as saídas, sem limite de período.
async function buscarSaidas(termo) {
  const t = String(termo || '').replace(/[,()*%\\]/g, ' ').trim()
  if (!t) return []
  const numero = t.replace(/^#?\s*(PEP|AT|REG)-?/i, '')
  let q = supabase.from('pessoas').select('id').is('mesclado_com_id', null).limit(60)
  // Nome: vogais e "c" viram curinga de 1 letra, para achar com ou sem acento (Goncalves = Gonçalves); a lista refina depois.
  const padraoNome = `%${semAcento(t).split(/\s+/).map((w) => w.replace(/[aeiouc]/g, '_')).join('%')}%`
  q = /^\d+$/.test(numero) ? q.ilike('prontuario_numero', `%${numero}%`) : q.ilike('nome', padraoNome)
  const { data: pessoas, error: e1 } = await q
  if (e1) { console.error('Busca de pacientes (Desfechos):', e1); return [] }
  const ids = (pessoas ?? []).map((p) => p.id)
  if (!ids.length) return []
  const { data, error: e2 } = await supabase.from('atendimentos').select(SELECT_DESFECHO)
    .in('pessoa_id', ids).eq('status', 'alta').order('encerrado_em', { ascending: false }).limit(300)
  if (e2) { console.error('Busca de saídas (Desfechos):', e2); return [] }
  return (data ?? []).map(mapearDesfecho)
}

const CORES_DESFECHO = {
  'Alta':          { bg: '#dcfce7', txt: '#166534' },
  'Alta Médica':   { bg: '#dcfce7', txt: '#166534' },
  'Transferência': { bg: '#dbeafe', txt: '#1e40af' },
  'Evasão':        { bg: '#fef9c3', txt: '#854d0e' },
  'Óbito':         { bg: '#fee2e2', txt: '#991b1b' },
}

function calcularPeriodo(periodo, dataInicioCustom, dataFimCustom) {
  const hoje = new Date()
  if (periodo === 'hoje') {
    const inicio = new Date(hoje); inicio.setHours(0, 0, 0, 0)
    return { inicio: inicio.toISOString(), fim: hoje.toISOString() }
  }
  if (periodo === 'semana') {
    const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - 7)
    return { inicio: inicio.toISOString(), fim: hoje.toISOString() }
  }
  if (periodo === 'mes') {
    const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - 30)
    return { inicio: inicio.toISOString(), fim: hoje.toISOString() }
  }
  // custom
  const ini = dataInicioCustom ? dataInicioCustom + 'T00:00:00' : (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString() })()
  const fim = dataFimCustom ? dataFimCustom + 'T23:59:59' : hoje.toISOString()
  return { inicio: ini, fim }
}

function normalizarDesfecho(raw) {
  if (!raw) return 'Alta'
  const r = raw.toLowerCase()
  if (r.includes('óbito') || r.includes('obito')) return 'Óbito'
  if (r.includes('transfer')) return 'Transferência'
  if (r.includes('evas')) return 'Evasão'
  return 'Alta'
}

export default function AltasRecentes({ onVoltar }) {
  const { enfermeiro } = useAuth()
  const [desfechos, setDesfechos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [periodo, setPeriodo] = useState('semana')
  const [dataInicioCustom, setDataInicioCustom] = useState('')
  const [dataFimCustom, setDataFimCustom] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    const { inicio, fim } = calcularPeriodo(periodo, dataInicioCustom, dataFimCustom)

    // Fonte oficial (PEP): atendimentos encerrados no período.
    const { data: atendimentosAlta, error } = await supabase
      .from('atendimentos')
      .select(SELECT_DESFECHO)
      .eq('status', 'alta')
      .gte('encerrado_em', inicio)
      .lte('encerrado_em', fim)
      .order('encerrado_em', { ascending: false })
      .limit(2000)
    if (error) console.error('Erro ao carregar desfechos:', error)

    const todos = (atendimentosAlta ?? []).map(mapearDesfecho)

    todos.sort((a, b) => new Date(b.data_desfecho) - new Date(a.data_desfecho))
    setDesfechos(todos)
    setCarregando(false)
  }, [periodo, dataInicioCustom, dataFimCustom])

  useEffect(() => { carregar() }, [carregar])

  // Busca por nome/prontuário em todo o histórico (a partir de 3 letras ou qualquer número).
  const [resultadosBusca, setResultadosBusca] = useState(null)
  const [buscando, setBuscando] = useState(false)
  useEffect(() => {
    const t = busca.trim()
    if (!(t.length >= 3 || /^\d+$/.test(t))) { setResultadosBusca(null); return undefined }
    let vivo = true
    setBuscando(true)
    const tm = setTimeout(async () => {
      const r = await buscarSaidas(t)
      if (vivo) { setResultadosBusca(r); setBuscando(false) }
    }, 350)
    return () => { vivo = false; clearTimeout(tm) }
  }, [busca])

  // Prontuário de quem já saiu (somente consulta/impressão) e impressão rápida do último documento do profissional.
  const [abertoPac, setAbertoPac] = useState(null)
  const [docRapido, setDocRapido] = useState(null)
  const [avisoLinha, setAvisoLinha] = useState(null)
  function abrirProntuario(d) {
    registrarEventoAuditoria({ atendimentoId: d.atendimentoId, autorId: enfermeiro?.id, acao: 'prontuario_consultado_pos_alta', dados: { tipo_desfecho: d.tipo_desfecho } })
    setAbertoPac(d)
  }
  async function imprimirMeuUltimo(d) {
    setAvisoLinha({ id: d.id, texto: 'Procurando seu último documento…' })
    const item = await ultimoDocumentoDoAutor(d.atendimentoId, enfermeiro?.id)
    if (!item) { setAvisoLinha({ id: d.id, texto: 'Você não tem documento neste atendimento. Use "Abrir prontuário" para ver os da equipe.' }); return }
    registrarEventoAuditoria({ atendimentoId: d.atendimentoId, autorId: enfermeiro?.id, acao: 'documento_impresso_pos_alta', dados: { tabela: item.fonte.tabela, registro_id: item.registro.id } })
    setAvisoLinha(null)
    setDocRapido(item)
  }

  const termoBusca = semAcento(busca.trim())
  const baseLista = resultadosBusca ?? desfechos
  // Filtros aplicados: nome (sem acento) ou nº do prontuário, e tipo de desfecho.
  const filtrados = baseLista.filter(d => {
    const bateNome = !termoBusca || semAcento(d.nome).includes(termoBusca) || (d.prontuario && String(d.prontuario).includes(termoBusca.replace(/^#?\s*(pep|at|reg)-?/i, '')))
    const bateTipo = !filtroTipo || d.tipo_desfecho === filtroTipo
    return bateNome && bateTipo
  })

  const acoesLinha = (d) => (
    <span className="ds-acoes no-print">
      <button type="button" className="ds-acao" onClick={() => abrirProntuario(d)} title="Abrir o prontuário (consulta e impressão)"><i className="ph ph-folder-open" /> <span>Abrir prontuário</span></button>
      <button type="button" className="ds-acao ic" onClick={() => imprimirMeuUltimo(d)} title="Imprimir o meu último documento neste atendimento" aria-label="Imprimir meu último documento"><i className="ph ph-printer" /></button>
    </span>
  )
  const avisoDaLinha = (d) => (avisoLinha?.id === d.id ? <div className="ds-aviso-linha no-print"><i className="ph ph-info" /> {avisoLinha.texto}</div> : null)

  const sobreposicoes = (
    <>
      {abertoPac && (
        <Suspense fallback={<div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="modal-card" style={{ padding: 24 }}>Carregando prontuário do paciente...</div></div>}>
          <EspacoPaciente
            paciente={{ id: abertoPac.atendimentoId, pessoa_id: abertoPac.pessoaId, nome: abertoPac.nome, pep_nativo: true }}
            leito={abertoPac.leito}
            setorNome={abertoPac.setorNome}
            onFechar={() => setAbertoPac(null)}
            pilarInicial={enfermeiro?.tipo === 'medico' ? 'medico' : 'enfermagem'}
            posAlta={{ encerradoEm: abertoPac.data_desfecho, tipo: abertoPac.tipo_desfecho }}
          />
        </Suspense>
      )}
      {docRapido && <VisualizarRegistro item={docRapido} onFechar={() => setDocRapido(null)} />}
    </>
  )

  // Indicadores
  const total = filtrados.length
  const altas = filtrados.filter(d => d.tipo_desfecho === 'Alta').length
  const transferencias = filtrados.filter(d => d.tipo_desfecho === 'Transferência').length
  const obitos = filtrados.filter(d => d.tipo_desfecho === 'Óbito').length
  const evasoes = filtrados.filter(d => d.tipo_desfecho === 'Evasão').length

  const indicadores = [
    { label: 'Total de Saídas', valor: total, cor: 'var(--c-primary)' },
    { label: 'Altas', valor: altas, cor: '#166534' },
    { label: 'Transferências', valor: transferencias, cor: '#1e40af' },
    { label: 'Óbitos', valor: obitos, cor: '#991b1b' },
    { label: 'Evasões', valor: evasoes, cor: '#854d0e' },
  ]

  const PERIODOS = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Esta Semana' },
    { key: 'mes', label: 'Este Mês' },
    { key: 'custom', label: 'Período' },
  ]

  // ===== Nova interface (contas pep_beta) — mockup 10 =====
  if (enfermeiro?.pep_beta === true) {
    const porNome = baseLista.filter((d) => !termoBusca || semAcento(d.nome).includes(termoBusca) || (d.prontuario && String(d.prontuario).includes(termoBusca)))
    const conta = (t) => porNome.filter((d) => d.tipo_desfecho === t).length
    const kpis = [
      { t: '', n: porNome.length, r: 'saídas', ic: 'ph-list' },
      { t: 'Alta', n: conta('Alta'), r: 'altas', ic: 'ph-check' },
      { t: 'Transferência', n: conta('Transferência'), r: 'transferências', ic: 'ph-arrows-left-right' },
      { t: 'Óbito', n: conta('Óbito'), r: 'óbitos', ic: 'ph-cross' },
      { t: 'Evasão', n: conta('Evasão'), r: 'evasões', ic: 'ph-sign-out' },
    ]
    const CLS = { Alta: 'alta', 'Transferência': 'tr', 'Óbito': 'ob', 'Evasão': 'ev' }
    const dia = (d) => {
      const dt = new Date(d); const hoje = new Date(); const ontem = new Date(); ontem.setDate(hoje.getDate() - 1)
      const dm = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      return dt.toDateString() === hoje.toDateString() ? `Hoje · ${dm}` : dt.toDateString() === ontem.toDateString() ? `Ontem · ${dm}` : dt.toLocaleDateString('pt-BR')
    }
    const PER = [['hoje', 'Hoje'], ['semana', '7 dias'], ['mes', '30 dias'], ['custom', 'Personalizado']]
    return (
      <div className="workspace ds-v2">
        <div className="ds-topo">
          <h1>Desfechos e Saídas</h1>
          <span className="ds-sub">Altas, transferências, óbitos e evasões</span>
          <button type="button" className="ds-imprimir" onClick={() => window.print()}><i className="ph ph-printer" /> Imprimir</button>
        </div>
        <div className="ds-kpis no-print">
          {kpis.map((k) => (
            <button key={k.r} type="button" className={'ds-kpi' + (filtroTipo === k.t ? ' on' : '')} onClick={() => setFiltroTipo(k.t)} title={k.t ? `Mostrar só ${k.r}` : 'Mostrar todos'}>
              <span className="ds-k"><i className={'ph ' + k.ic} /></span><b>{carregando ? '—' : k.n}</b><small>{k.r}</small>
            </button>
          ))}
        </div>
        <div className="ds-filtros no-print">
          <div className="ds-seg">
            {PER.map(([k, r]) => <button key={k} type="button" className={periodo === k ? 'on' : ''} onClick={() => { if (k === 'custom' && !dataInicioCustom) { const d = periodoPadrao(); setDataInicioCustom(d.inicio); setDataFimCustom(d.fim) } setPeriodo(k) }}>{r}</button>)}
          </div>
          {periodo === 'custom' && <CampoPeriodo inicio={dataInicioCustom} fim={dataFimCustom} onInicio={setDataInicioCustom} onFim={setDataFimCustom} />}
          <label className="ds-busca"><i className="ph ph-magnifying-glass" /><input type="text" placeholder="Buscar por nome completo ou nº do prontuário…" value={busca} onChange={(e) => setBusca(e.target.value)} />{busca && <button type="button" className="ds-limpar" onClick={() => setBusca('')} aria-label="Limpar busca"><i className="ph ph-x" /></button>}</label>
        </div>
        {resultadosBusca && <div className="ds-busca-info no-print"><i className="ph ph-magnifying-glass" /> {buscando ? 'Buscando…' : `${filtrados.length} saída(s) encontrada(s) para "${busca.trim()}" em todo o histórico (sem limite de período).`}</div>}
        <div className="ds-lista">
          {carregando || (buscando && !resultadosBusca) ? <p className="ds-vazio">Carregando…</p> : filtrados.length === 0 ? <p className="ds-vazio">Nenhum registro para o período e filtros selecionados.</p> : filtrados.map((d, i) => (
            <div key={d.id}>
              {d.data_desfecho && (i === 0 || dia(filtrados[i - 1].data_desfecho) !== dia(d.data_desfecho)) && <div className="ds-grupo">{dia(d.data_desfecho)}</div>}
              <div className="ds-linha">
                <span className="ds-hora">{d.data_desfecho ? new Date(d.data_desfecho).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                <span className={'ds-tipo ' + (CLS[d.tipo_desfecho] || 'alta')}>{d.tipo_desfecho}</span>
                <div className="ds-pac"><b>{d.nome}</b>{d.prontuario && <small>Pront. {d.prontuario}</small>}</div>
                <span className="ds-set">{d.leito_info}</span>
                <div className="ds-mot">
                  {d.tipo_desfecho === 'Transferência'
                    ? <b className={d.destino ? 'ds-dest' : 'ds-dest vazio'}><i className="ph ph-hospital" /> Destino: {d.destino || 'não informado'}</b>
                    : <span title={d.diagnostico}>{d.diagnostico}</span>}
                </div>
                {acoesLinha(d)}
              </div>
              {avisoDaLinha(d)}
            </div>
          ))}
        </div>
        {sobreposicoes}
      </div>
    )
  }

  return (
    <div className="workspace" style={{ overflowY: 'auto', flex: 1 }}>
      {sobreposicoes}
      {/* Cabeçalho */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className="page-title">
          <h1>Desfechos e Saídas</h1>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>
            Altas médicas, transferências, óbitos e evasões — com indicadores e filtros por período.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={onVoltar}>
            <i className="ph ph-arrow-left" /> Voltar
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <i className="ph ph-printer" /> Imprimir
          </button>
        </div>
      </div>

      {/* Indicadores */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {indicadores.map(ind => (
          <div key={ind.label} style={{
            flex: '1 1 140px',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 10,
            padding: '16px 20px',
            minWidth: 120,
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: ind.cor, lineHeight: 1 }}>{carregando ? '—' : ind.valor}</div>
            <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 6 }}>{ind.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '12px 16px' }}>
        {/* Filtro de período */}
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODOS.map(p => (
            <button
              key={p.key}
              type="button"
              className={`control-btn${periodo === p.key ? ' active' : ''}`}
              onClick={() => setPeriodo(p.key)}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Datas customizadas */}
        {periodo === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="date"
              value={dataInicioCustom}
              onChange={e => setDataInicioCustom(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid var(--c-border)', borderRadius: 6, fontSize: 12 }}
            />
            <span style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>até</span>
            <input
              type="date"
              value={dataFimCustom}
              onChange={e => setDataFimCustom(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid var(--c-border)', borderRadius: 6, fontSize: 12 }}
            />
            <button className="control-btn active" onClick={carregar} style={{ fontSize: 12, padding: '6px 12px' }}>
              <i className="ph ph-magnifying-glass" /> Buscar
            </button>
          </div>
        )}

        {/* Separador */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {/* Filtro por tipo */}
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid var(--c-border)', borderRadius: 6, fontSize: 12 }}
          >
            <option value="">Todos os desfechos</option>
            <option value="Alta">Alta</option>
            <option value="Transferência">Transferência</option>
            <option value="Óbito">Óbito</option>
            <option value="Evasão">Evasão</option>
          </select>

          {/* Busca */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i className="ph ph-magnifying-glass" style={{ position: 'absolute', left: 10, color: 'var(--c-text-muted)', fontSize: 15 }} />
            <input
              type="text"
              placeholder="Nome completo ou nº do prontuário..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ padding: '6px 12px 6px 32px', border: '1px solid var(--c-border)', borderRadius: 6, fontSize: 12, width: 200 }}
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Paciente / Prontuário</th>
              <th>Setor de Origem</th>
              <th>Data / Hora</th>
              <th>Desfecho</th>
              <th>Motivo / Destino</th>
              <th className="no-print">Documentos</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: 40 }}>
                  <i className="ph ph-spinner" /> Carregando registros...
                </td>
              </tr>
            )}
            {!carregando && filtrados.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: 40 }}>
                  Nenhum registro encontrado para o período e filtros selecionados.
                </td>
              </tr>
            )}
            {!carregando && filtrados.map(d => {
              const cor = CORES_DESFECHO[d.tipo_desfecho] || CORES_DESFECHO['Alta']
              const dataHora = d.data_desfecho
                ? new Date(d.data_desfecho).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'
              return (
                <tr key={d.id}>
                  <td>
                    <strong>{d.nome}</strong>
                    {d.prontuario && (
                      <><br /><span style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>Pront. {d.prontuario}</span></>
                    )}
                  </td>
                  <td style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>{d.leito_info}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 14 }}>{dataHora}</td>
                  <td>
                    <span className="badge" style={{ background: cor.bg, color: cor.txt, fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                      {d.tipo_desfecho}
                    </span>
                  </td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--c-text-muted)', fontSize: 14 }} title={d.tipo_desfecho === 'Transferência' ? `Destino: ${d.destino || 'não informado'}` : d.diagnostico}>
                    {d.tipo_desfecho === 'Transferência'
                      ? <span style={{ fontWeight: 700, color: d.destino ? '#1e40af' : 'var(--c-text-muted)' }}><i className="ph ph-hospital" /> Destino: {d.destino || 'não informado'}</span>
                      : d.diagnostico}
                  </td>
                  <td className="no-print">{acoesLinha(d)}{avisoDaLinha(d)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Rodapé */}
        {!carregando && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--c-border)', color: 'var(--c-text-muted)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{filtrados.length}</strong> registro{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</span>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => window.print()}>
              <i className="ph ph-printer" /> Exportar / Imprimir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
