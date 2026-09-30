import { useEffect, useState } from 'react'
import { carregarLeitosOcupadosPep } from '../lib/pepAtendimentos'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import PassagemForm from './PassagemForm'
import MeusRascunhos from '../components/MeusRascunhos'
import './Pendencias.css'

export default function Pendencias({ plantao, onVoltar }) {
  const { enfermeiro } = useAuth()
  const [exames, setExames] = useState([])
  const [sorologiasPendentes, setSorologiasPendentes] = useState([])
  const [hemoderivados, setHemoderivados] = useState([])
  const [outras, setOutras] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalPassagem, setModalPassagem] = useState(null)
  const [filtroTab, setFiltroTab] = useState('Todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregar().catch((e) => { console.error("Falha ao carregar:", e); setCarregando(false) })
  }, [])

  async function carregar() {
    setCarregando(true)

    // Fonte oficial (PEP): pacientes com leito ativo + última passagem de cada um.
    const [{ pacientesPorLeito, passagemPorPaciente }, { data: leitos }] = await Promise.all([
      carregarLeitosOcupadosPep(),
      supabase.from('leitos').select('id, numero, setor_id, setores(nome)'),
    ])
    const leitoPorId = Object.fromEntries((leitos ?? []).map((l) => [l.id, l]))
    const pacientes = Object.values(pacientesPorLeito).map((p) => ({ ...p, leitos: leitoPorId[p.leito_atual_id] || null }))
    const ultimaPorPaciente = passagemPorPaciente

    const listaExames = []
    const listaSorologias = []
    const listaHemo = []
    const listaOutras = []

    for (const paciente of pacientes ?? []) {
      const p = ultimaPorPaciente[paciente.id]
      if (!p) continue

      if (p.exame_status === 'A realizar' || p.exame_status === 'Aguardando laudo') {
        listaExames.push({ paciente, passagem: p })
      }
      if (p.sorologia_status === 'Coleta pendente' || p.sorologia_status === 'Aguardando resultado') {
        listaSorologias.push({ paciente, passagem: p })
      }
      if (p.hemo_solicitado === true && p.hemo_transfundido !== true) {
        listaHemo.push({ paciente, passagem: p })
      }
      if (p.pendencias) {
        listaOutras.push({ paciente, passagem: p })
      }
    }

    setExames(listaExames)
    setSorologiasPendentes(listaSorologias)
    setHemoderivados(listaHemo)
    setOutras(listaOutras)
    setCarregando(false)
  }

  function abrirPaciente(paciente) {
    if (!paciente.leitos) return
    setModalPassagem({
      paciente,
      leito: paciente.leitos,
      setorNome: paciente.leitos.setores?.nome,
    })
  }

  const examesFiltrados = exames.filter(e => !busca || e.paciente.nome.toLowerCase().includes(busca.toLowerCase()))
  const soroFiltradas = sorologiasPendentes.filter(e => !busca || e.paciente.nome.toLowerCase().includes(busca.toLowerCase()))
  const hemoFiltrados = hemoderivados.filter(e => !busca || e.paciente.nome.toLowerCase().includes(busca.toLowerCase()))
  const outrasFiltradas = outras.filter(e => !busca || e.paciente.nome.toLowerCase().includes(busca.toLowerCase()))

  const totalPendencias = examesFiltrados.length + soroFiltradas.length + hemoFiltrados.length + outrasFiltradas.length

  const deveMostrar = (categoria) => filtroTab === 'Todas' || filtroTab === categoria

  // ===== Nova interface (contas pep_beta) — mockup 09 =====
  if (enfermeiro?.pep_beta === true) {
    const itens = [
      ...(deveMostrar('Exames') ? examesFiltrados.map(({ paciente, passagem }) => ({ k: 'ex_' + paciente.id, paciente, icone: 'ph-flask', titulo: passagem.exame_nome || 'Exame de laboratório / imagem', st: passagem.exame_status, tom: passagem.exame_status === 'Aguardando laudo' ? 'az' : 'am' })) : []),
      ...(deveMostrar('Sorologia') ? soroFiltradas.map(({ paciente, passagem }) => ({ k: 'so_' + paciente.id, paciente, icone: 'ph-test-tube', titulo: `Sorologia: ${passagem.sorologias || '—'}`, st: passagem.sorologia_status, tom: 'am' })) : []),
      ...(deveMostrar('Hemoderivados') ? hemoFiltrados.map(({ paciente, passagem }) => ({ k: 'hm_' + paciente.id, paciente, icone: 'ph-drop', titulo: `Transfusão: ${passagem.hemo_tipo || 'hemoderivado'}`, st: 'Aguardando transfusão', tom: 'vm' })) : []),
      ...(deveMostrar('Outras') ? outrasFiltradas.map(({ paciente, passagem }) => ({ k: 'ou_' + paciente.id, paciente, icone: 'ph-clipboard-text', titulo: passagem.pendencias, st: 'Outra', tom: '' })) : []),
    ]
    const setores = [...new Set(itens.map((i) => i.paciente.leitos?.setores?.nome || 'Sem setor'))].sort()
    const abas = [
      ['Todas', exames.length + sorologiasPendentes.length + hemoderivados.length + outras.length],
      ['Exames', exames.length], ['Sorologia', sorologiasPendentes.length, 'Sorologias'], ['Hemoderivados', hemoderivados.length], ['Outras', outras.length],
    ]
    return (
      <div className="page pd-v2">
        <div className="pd-topo">
          <h1>Pendências do Plantão</h1>
          <span className="pd-sub">Rascunhos, exames, sorologias e hemoderivados em aberto</span>
          <label className="pd-busca"><i className="ph ph-magnifying-glass" /><input type="text" placeholder="Buscar paciente…" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
        </div>
        <div className="doc-subtabs pd-abas">
          {abas.map(([k, n, r]) => (
            <button key={k} type="button" className={filtroTab === k ? 'active' : ''} onClick={() => setFiltroTab(k)}>{r || k} <span className="pd-cont">{n}</span></button>
          ))}
        </div>
        <div className="pd-grade">
          <div className="pd-lista">
            {carregando ? <p className="pd-vazio">Buscando pendências…</p> : itens.length === 0 ? (
              <div className="pd-vazio"><i className="ph ph-check-circle" /> Nenhuma pendência nesta categoria.</div>
            ) : setores.map((setor) => (
              <div key={setor}>
                <div className="pd-grupo">{setor}</div>
                {itens.filter((i) => (i.paciente.leitos?.setores?.nome || 'Sem setor') === setor).map((i) => (
                  <div key={i.k} className="pd-linha">
                    <span className="pd-ic"><i className={'ph ' + i.icone} /></span>
                    <div className="pd-txt"><b>{i.titulo}</b><small>{i.paciente.nome}{i.paciente.leitos?.numero ? ` · Leito ${i.paciente.leitos.numero}` : ''}</small></div>
                    {i.st && <span className={'pd-st ' + i.tom}>{i.st}</span>}
                    <button type="button" className="pd-abrir" onClick={() => abrirPaciente(i.paciente)}>Abrir</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <aside className="pd-lado">
            <MeusRascunhos compacto />
            <div className="pd-card">
              <h4>Resumo</h4>
              <div className="pd-resumo">
                <div><b>{exames.length}</b><small>exames</small></div>
                <div><b>{sorologiasPendentes.length}</b><small>sorologias</small></div>
                <div><b>{hemoderivados.length}</b><small>hemoderivados</small></div>
                <div><b>{outras.length}</b><small>outras</small></div>
              </div>
            </div>
          </aside>
        </div>
        {modalPassagem && (
          <PassagemForm paciente={modalPassagem.paciente} leito={modalPassagem.leito} setorNome={modalPassagem.setorNome} plantaoId={plantao.id} enfermeiroId={enfermeiro?.id}
            onFechar={() => setModalPassagem(null)} onSalvo={carregar} onRealocar={() => setModalPassagem(null)} />
        )}
      </div>
    )
  }

  return (
    <div className="workspace pendencias-tela">
      <div className="page-header">
        <div className="page-title">
          <h1>Pendências do Plantão</h1>
          <p>Seus documentos não finalizados, coletas de exames, laudos, sorologias e hemoderivados pendentes.</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <div className="tabs">
          <button className={`tab-btn ${filtroTab === 'Todas' ? 'active' : ''}`} onClick={() => setFiltroTab('Todas')}>
            Todas <span className="tab-badge">{exames.length + sorologiasPendentes.length + hemoderivados.length + outras.length}</span>
          </button>
          <button className={`tab-btn ${filtroTab === 'Exames' ? 'active' : ''}`} onClick={() => setFiltroTab('Exames')}>
            Exames <span className="tab-badge">{exames.length}</span>
          </button>
          <button className={`tab-btn ${filtroTab === 'Sorologia' ? 'active' : ''}`} onClick={() => setFiltroTab('Sorologia')}>
            Sorologias <span className="tab-badge">{sorologiasPendentes.length}</span>
          </button>
          <button className={`tab-btn ${filtroTab === 'Hemoderivados' ? 'active' : ''}`} onClick={() => setFiltroTab('Hemoderivados')}>
            Hemoderivados <span className="tab-badge">{hemoderivados.length}</span>
          </button>
          <button className={`tab-btn ${filtroTab === 'Outras' ? 'active' : ''}`} onClick={() => setFiltroTab('Outras')}>
            Outras <span className="tab-badge">{outras.length}</span>
          </button>
        </div>
        
        <div className="search-controls">
          <div className="search-input">
            <i className="ph ph-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar paciente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </div>

      <MeusRascunhos />

      <div className="tasks-container">
        {carregando ? (
          <p style={{ color: 'var(--c-text-muted)', padding: 20 }}>Buscando pendências...</p>
        ) : totalPendencias === 0 ? (
          <div className="empty-state">
            <i className="ph ph-check-circle"></i>
            <h3>Tudo certo por aqui!</h3>
            <p>Não há pendências na aba selecionada ou os filtros não retornaram resultados.</p>
          </div>
        ) : (
          <>
            {deveMostrar('Exames') && examesFiltrados.map(({paciente, passagem}) => (
              <div key={'ex_'+paciente.id} className="task-card urgency-info">
                <div className="task-main">
                  <div className="task-icon"><i className="ph ph-flask"></i></div>
                  <div className="task-details">
                    <div className="task-title">{passagem.exame_nome || 'Exame de Laboratório / Imagem'}</div>
                    <div className="task-meta">
                      <span><i className="ph ph-user"></i> <strong>{paciente.nome}</strong></span>
                      <span><i className="ph ph-bed"></i> <strong>Leito {paciente.leitos?.numero} ({paciente.leitos?.setores?.nome})</strong></span>
                      <span className="badge badge-blue">{passagem.exame_status}</span>
                    </div>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-outline" onClick={() => abrirPaciente(paciente)}>
                    <i className="ph ph-eye"></i> Atualizar
                  </button>
                </div>
              </div>
            ))}

            {deveMostrar('Sorologia') && soroFiltradas.map(({paciente, passagem}) => (
              <div key={'so_'+paciente.id} className="task-card urgency-medium">
                <div className="task-main">
                  <div className="task-icon"><i className="ph ph-test-tube"></i></div>
                  <div className="task-details">
                    <div className="task-title">Sorologia: {passagem.sorologias}</div>
                    <div className="task-meta">
                      <span><i className="ph ph-user"></i> <strong>{paciente.nome}</strong></span>
                      <span><i className="ph ph-bed"></i> <strong>Leito {paciente.leitos?.numero} ({paciente.leitos?.setores?.nome})</strong></span>
                      <span className="badge badge-yellow">{passagem.sorologia_status}</span>
                    </div>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-primary" onClick={() => abrirPaciente(paciente)}>
                    <i className="ph ph-check-square-offset"></i> Dar Baixa
                  </button>
                </div>
              </div>
            ))}

            {deveMostrar('Hemoderivados') && hemoFiltrados.map(({paciente, passagem}) => (
              <div key={'hm_'+paciente.id} className="task-card urgency-high">
                <div className="task-main">
                  <div className="task-icon"><i className="ph ph-drop"></i></div>
                  <div className="task-details">
                    <div className="task-title">Transfusão Solicitada: {passagem.hemo_tipo || 'Hemoderivado'}</div>
                    <div className="task-meta">
                      <span><i className="ph ph-user"></i> <strong>{paciente.nome}</strong></span>
                      <span><i className="ph ph-bed"></i> <strong>Leito {paciente.leitos?.numero} ({paciente.leitos?.setores?.nome})</strong></span>
                      <span className="badge badge-red">AGUARDANDO TRANSFUSÃO</span>
                    </div>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-primary" onClick={() => abrirPaciente(paciente)}>
                    <i className="ph ph-stethoscope"></i> Avaliar Agora
                  </button>
                </div>
              </div>
            ))}

            {deveMostrar('Outras') && outrasFiltradas.map(({paciente, passagem}) => (
              <div key={'ou_'+paciente.id} className="task-card urgency-low">
                <div className="task-main">
                  <div className="task-icon"><i className="ph ph-clipboard-text"></i></div>
                  <div className="task-details">
                    <div className="task-title">Observação Pendente</div>
                    <div className="task-meta">
                      <span><i className="ph ph-user"></i> <strong>{paciente.nome}</strong></span>
                      <span><i className="ph ph-bed"></i> <strong>Leito {paciente.leitos?.numero} ({paciente.leitos?.setores?.nome})</strong></span>
                      <span style={{ color: 'var(--c-text-muted)' }}>{passagem.pendencias}</span>
                    </div>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-outline" onClick={() => abrirPaciente(paciente)}>
                    <i className="ph ph-note-pencil"></i> Anotar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {modalPassagem && (
        <PassagemForm
          paciente={modalPassagem.paciente}
          leito={modalPassagem.leito}
          setorNome={modalPassagem.setorNome}
          plantaoId={plantao.id}
          enfermeiroId={enfermeiro?.id}
          onFechar={() => setModalPassagem(null)}
          onSalvo={carregar}
          onRealocar={() => setModalPassagem(null)}
        />
      )}
    </div>
  )
}
