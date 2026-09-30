import { numeroLimpo } from '../lib/numeros'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import './AltasRecentes.css'

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
      .select('id, encerrado_em, queixa_principal, pessoas(nome, prontuario_numero), internacoes(resumo_alta, diagnostico_admissao, desfecho_tipo, desfecho_obs, encerrado_em), leito_ocupacoes(liberado_em, leitos(numero, setores(nome)))')
      .eq('status', 'alta')
      .gte('encerrado_em', inicio)
      .lte('encerrado_em', fim)
      .order('encerrado_em', { ascending: false })
      .limit(2000)
    if (error) console.error('Erro ao carregar desfechos:', error)

    const todos = (atendimentosAlta ?? []).map((a) => {
      const internacao = (Array.isArray(a.internacoes) ? a.internacoes[0] : a.internacoes) || {}
      const ultimaOcupacao = [...(a.leito_ocupacoes ?? [])].sort((x, y) => new Date(y.liberado_em || 0) - new Date(x.liberado_em || 0))[0]
      const leito = ultimaOcupacao?.leitos
      return {
        id: `pep-${a.id}`,
        nome: a.pessoas?.nome || 'Não informado',
        tipo_desfecho: normalizarDesfecho(internacao.desfecho_tipo),
        data_desfecho: a.encerrado_em || internacao.encerrado_em,
        // Transferência: desfecho_obs guarda o hospital de destino informado no desfecho.
        destino: normalizarDesfecho(internacao.desfecho_tipo) === 'Transferência' ? (internacao.desfecho_obs || '') : '',
        diagnostico: (normalizarDesfecho(internacao.desfecho_tipo) === 'Transferência' ? null : internacao.desfecho_obs) || internacao.resumo_alta || internacao.diagnostico_admissao || a.queixa_principal || '—',
        leito_info: leito ? `Leito ${leito.numero} – ${leito.setores?.nome || ''}` : 'Observação',
        prontuario: numeroLimpo(a.pessoas?.prontuario_numero),
      }
    })

    todos.sort((a, b) => new Date(b.data_desfecho) - new Date(a.data_desfecho))
    setDesfechos(todos)
    setCarregando(false)
  }, [periodo, dataInicioCustom, dataFimCustom])

  useEffect(() => { carregar() }, [carregar])

  // Filtros aplicados
  const filtrados = desfechos.filter(d => {
    const bateNome = !busca || d.nome.toLowerCase().includes(busca.toLowerCase())
    const bateTipo = !filtroTipo || d.tipo_desfecho === filtroTipo
    return bateNome && bateTipo
  })

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
    const porNome = desfechos.filter((d) => !busca || d.nome.toLowerCase().includes(busca.toLowerCase()))
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
            {PER.map(([k, r]) => <button key={k} type="button" className={periodo === k ? 'on' : ''} onClick={() => setPeriodo(k)}>{r}</button>)}
          </div>
          {periodo === 'custom' && (
            <div className="ds-datas">
              <input type="date" value={dataInicioCustom} onChange={(e) => setDataInicioCustom(e.target.value)} />
              <span>até</span>
              <input type="date" value={dataFimCustom} onChange={(e) => setDataFimCustom(e.target.value)} />
            </div>
          )}
          <label className="ds-busca"><i className="ph ph-magnifying-glass" /><input type="text" placeholder="Buscar paciente…" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
        </div>
        <div className="ds-lista">
          {carregando ? <p className="ds-vazio">Carregando…</p> : filtrados.length === 0 ? <p className="ds-vazio">Nenhum registro para o período e filtros selecionados.</p> : filtrados.map((d, i) => (
            <div key={d.id}>
              {d.data_desfecho && (i === 0 || dia(filtrados[i - 1].data_desfecho) !== dia(d.data_desfecho)) && <div className="ds-grupo">{dia(d.data_desfecho)}</div>}
              <div className="ds-linha">
                <span className="ds-hora">{d.data_desfecho ? new Date(d.data_desfecho).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                <span className={'ds-tipo ' + (CLS[d.tipo_desfecho] || 'alta')}>{d.tipo_desfecho}</span>
                <div className="ds-pac"><b>{d.nome}</b>{d.prontuario && <small>Pront. {d.prontuario}</small>}</div>
                <span className="ds-set">{d.leito_info}</span>
                <div className="ds-mot">
                  {d.tipo_desfecho === 'Transferência' && <b className={d.destino ? 'ds-dest' : 'ds-dest vazio'}><i className="ph ph-arrow-right" /> {d.destino || 'Destino não informado'}</b>}
                  <span title={d.diagnostico}>{d.diagnostico}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="workspace" style={{ overflowY: 'auto', flex: 1 }}>
      {/* Cabeçalho */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className="page-title">
          <h1>Desfechos e Saídas</h1>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>
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
              placeholder="Buscar paciente..."
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
              <th>Motivo / Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: 40 }}>
                  <i className="ph ph-spinner" /> Carregando registros...
                </td>
              </tr>
            )}
            {!carregando && filtrados.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: 40 }}>
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
                      <><br /><span style={{ color: 'var(--c-text-muted)', fontSize: 11 }}>Pront. {d.prontuario}</span></>
                    )}
                  </td>
                  <td style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>{d.leito_info}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{dataHora}</td>
                  <td>
                    <span className="badge" style={{ background: cor.bg, color: cor.txt, fontWeight: 700, fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>
                      {d.tipo_desfecho}
                    </span>
                    {d.tipo_desfecho === 'Transferência' && (
                      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, color: d.destino ? '#1e40af' : 'var(--c-text-muted)' }}>
                        <i className="ph ph-arrow-right" /> {d.destino || 'Destino não informado'}
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--c-text-muted)', fontSize: 13 }} title={d.diagnostico}>
                    {d.diagnostico}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Rodapé */}
        {!carregando && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--c-border)', color: 'var(--c-text-muted)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{filtrados.length}</strong> registro{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</span>
            <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 12px' }} onClick={() => window.print()}>
              <i className="ph ph-printer" /> Exportar / Imprimir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
