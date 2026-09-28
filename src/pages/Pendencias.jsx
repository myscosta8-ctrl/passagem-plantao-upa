import { useEffect, useState } from 'react'
import { carregarLeitosOcupadosPep } from '../lib/pepAtendimentos'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import PassagemForm from './PassagemForm'
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

  return (
    <div className="workspace pendencias-tela">
      <div className="page-header">
        <div className="page-title">
          <h1>Pendências do Plantão</h1>
          <p>Acompanhe coletas de exames, laudos, sorologias e hemoderivados pendentes.</p>
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
