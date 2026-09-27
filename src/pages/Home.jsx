import { useEffect, useState, lazy, Suspense } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Painel from './Painel'
import PassagemColetivaTela from './PassagemColetivaTela'
import ConfirmModal from './ConfirmModal'
import Sidebar from '../components/Sidebar'
import './AberturaPlantao.css'

// Telas carregadas sob demanda via React.lazy (Code-Splitting)
const PrintView = lazy(() => import('./PrintView'))
const Historico = lazy(() => import('./Historico'))
const Ajuda = lazy(() => import('./Ajuda'))
const MinhaConta = lazy(() => import('./MinhaConta'))
const AltasRecentes = lazy(() => import('./AltasRecentes'))
const Pendencias = lazy(() => import('./Pendencias'))
const IndicadoresPainel = lazy(() => import('./IndicadoresPainel'))
const CompartilharPlantao = lazy(() => import('./CompartilharPlantao'))
const PainelEquipe = lazy(() => import('./PainelEquipe'))
const GerenciarProfissionais = lazy(() => import('./GerenciarProfissionais'))
const PainelMedico = lazy(() => import('./PainelMedico'))
const CadastroPacientes = lazy(() => import('./CadastroPacientes'))

async function purgarHistoricoAntigo() {
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
  const limite = seteDiasAtras.toISOString().slice(0, 10)
  await supabase.from('plantoes').delete().lt('data', limite)
}

// Leitos extras que não possuem paciente ativo desaparecem automaticamente
async function limparLeitosExtrasNaoUsados() {
  const { data: candidatos } = await supabase
    .from('leitos')
    .select('id')
    .eq('tipo', 'extra')
  if (!candidatos?.length) return

  const ids = candidatos.map((l) => l.id)
  const [{ data: ocupadosPacientes }, { data: ocupacoesPep }] = await Promise.all([
    supabase.from('pacientes').select('leito_atual_id').eq('status', 'internado').in('leito_atual_id', ids),
    supabase.from('leito_ocupacoes').select('leito_id').eq('status', 'ativo').in('leito_id', ids),
  ])
  const ocupadosSet = new Set([
    ...(ocupadosPacientes ?? []).map((p) => p.leito_atual_id),
    ...(ocupacoesPep ?? []).map((o) => o.leito_id),
  ])
  const paraExcluir = ids.filter((id) => !ocupadosSet.has(id))
  if (paraExcluir.length) await supabase.from('leitos').delete().in('id', paraExcluir)
}

function hojeISOLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

// Guarda em qual tela a pessoa estava, pra voltar pro mesmo lugar se o app recarregar sozinho
// (comum no celular). Expira depois de um tempo, pra nunca reabrir num lugar "velho" demais.
const TELAS_VALIDAS = [
  'painel', 'recepcao', 'print1', 'print2', 'historico', 'altas',
  'indicadoresClinicos', 'pendencias', 'compartilhar', 'equipe',
  'ajuda', 'conta', 'profissionais', 'passagemColetiva',
]
const LIMITE_HORAS_TELA_SALVA = 4

const TITULO_TELA = {
  painel: 'Painel de Leitos',
  recepcao: 'Recepção',
  passagemColetiva: 'Passagem de Plantão',
  historico: 'Histórico',
  altas: 'Desfechos',
  indicadoresClinicos: 'Indicadores Clínicos',
  pendencias: 'Pendências',
  compartilhar: 'Compartilhar Plantão',
  equipe: 'Painel de Equipe',
  profissionais: 'Gerenciar Profissionais',
  conta: 'Minha Conta',
  ajuda: 'Ajuda',
  print1: 'Impressão — Grupo 1',
  print2: 'Impressão — Grupo 2',
}

function iniciais(nome) {
  if (!nome) return 'MC'
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase()
}

function lerTelaSalva() {
  try {
    const bruto = localStorage.getItem('app_tela_v2')
    if (!bruto) return 'painel'
    const { tela, quando } = JSON.parse(bruto)
    const horasPassadas = (Date.now() - quando) / (1000 * 60 * 60)
    if (horasPassadas > LIMITE_HORAS_TELA_SALVA) return 'painel'
    if (!TELAS_VALIDAS.includes(tela)) return 'painel' // valor desconhecido/antigo — nunca deixa em branco
    return tela
  } catch {
    return 'painel'
  }
}

export default function Home() {
  const { enfermeiro, logout } = useAuth()
  const isAdmin = enfermeiro?.role === 'admin'
  // Médico não participa do fluxo de plantão de enfermagem (abertura/setores) —
  // vai direto pro painel dele, sobre a estrutura nova (atendimentos/leito_ocupacoes).
  const ehMedico = enfermeiro?.tipo === 'medico'
  // Mesmo raciocínio do médico: recepção não abre plantão de enfermagem, vai
  // direto pro cadastro de pacientes — trabalho dela é identidade, não leito.
  const ehRecepcao = enfermeiro?.tipo === 'recepcao'
  // "Encerrar plantonista" é destrutivo demais pra qualquer conta admin — só o Marcus.
  const ID_MARCUS_ADMIN = '66901c7a-d3b9-435a-932c-276659210f69'
  const podeEncerrarQualquerPlantonista = enfermeiro?.id === ID_MARCUS_ADMIN
  const [plantao, setPlantao] = useState(null)
  const [setoresIds, setSetoresIds] = useState(null)
  const [tela, setTela] = useState(lerTelaSalva)
  const [horaFormatada, setHoraFormatada] = useState('')

  useEffect(() => {
    function atualizarHora() {
      const agora = new Date()
      const d = agora.toLocaleDateString('pt-BR')
      const h = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setHoraFormatada(`${d} ${h}`)
    }
    atualizarHora()
    const timer = setInterval(atualizarHora, 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('app_tela_v2', JSON.stringify({ tela, quando: Date.now() }))
    } catch {
      // localStorage indisponível (modo privado, etc.) — não é crítico, só não persiste
    }
  }, [tela])

  const [verificandoRetomada, setVerificandoRetomada] = useState(true)
  const [encerrando, setEncerrando] = useState(false)
  const [contaMenuAberto, setContaMenuAberto] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(null)
  const [sidebarAberta, setSidebarAberta] = useState(false)

  useEffect(() => {
    if (ehMedico || ehRecepcao) {
      setVerificandoRetomada(false)
      return
    }
    purgarHistoricoAntigo()
    limparLeitosExtrasNaoUsados()
    if (isAdmin) {
      entrarComoAdmin()
    } else {
      retomarPlantaoAtivo()
    }
  }, [])

  async function carregarTodosSetoresIds() {
    const { data: setores } = await supabase.from('setores').select('id').in('id', [1, 2, 3, 4])
    if (setores && setores.length > 0) return setores.map((s) => s.id)
    const { data: todos } = await supabase.from('setores').select('id')
    return (todos ?? []).map((s) => s.id)
  }

  function turnoAtualPorHora() {
    const horaAtual = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Belem', hour: 'numeric', hour12: false }).format(new Date())
    )
    return horaAtual >= 7 && horaAtual < 19 ? 'Diurno' : 'Noturno'
  }

  async function buscarOuAbrirPlantao(hoje, turno) {
    const { data: existente } = await supabase
      .from('plantoes')
      .select('id, data, turno, status, created_at, enfermeiro_chefe_id')
      .eq('data', hoje)
      .eq('turno', turno)
      .maybeSingle()
    if (existente) return existente

    const { data: criado } = await supabase.from('plantoes').insert({ data: hoje, turno }).select().single()
    return criado
  }

  async function entrarComoAdmin() {
    setSetoresIds(await carregarTodosSetoresIds())
    const plantao = await buscarOuAbrirPlantao(hojeISOLocal(), turnoAtualPorHora())
    if (plantao) setPlantao(plantao)
    setVerificandoRetomada(false)
  }

  // Sem tela de "abrir plantão" — a data/turno são detectados automaticamente
  // (turno pelo horário atual) e a participação é registrada em silêncio.
  // Se já existe uma participação aberta (não encerrada), retoma ela em vez
  // de entrar num plantão novo, mesmo que o turno "natural" já tenha virado.
  async function retomarPlantaoAtivo() {
    if (!enfermeiro?.id) {
      setVerificandoRetomada(false)
      return
    }

    const { data: abertos } = await supabase
      .from('plantao_profissionais')
      .select('plantoes!inner(id, data, turno, status, created_at, enfermeiro_chefe_id)')
      .eq('profissional_id', enfermeiro.id)
      .eq('encerrado', false)
      .order('created_at', { foreignTable: 'plantoes', ascending: false })
      .limit(1)

    const paraRetomar = abertos?.[0]?.plantoes
    const plantao = paraRetomar || await buscarOuAbrirPlantao(hojeISOLocal(), turnoAtualPorHora())

    if (plantao) {
      if (!paraRetomar) {
        await supabase
          .from('plantao_profissionais')
          .upsert({ plantao_id: plantao.id, profissional_id: enfermeiro.id, encerrado: false }, { onConflict: 'plantao_id,profissional_id' })
      }
      setPlantao(plantao)
      setSetoresIds(await carregarTodosSetoresIds())
    }
    setVerificandoRetomada(false)
  }

  async function encerrarPlantao() {
    if (!plantao?.id) return
    setModalConfirmar({
      titulo: 'Encerrar sua participação?',
      mensagem: 'Isso afeta só a sua sessão — o outro enfermeiro (se houver) continua normalmente até encerrar a dele.',
      confirmarTexto: 'Encerrar',
      onConfirmar: async () => {
        setModalConfirmar(null)
        setEncerrando(true)
        await supabase
          .from('plantao_profissionais')
          .update({ encerrado: true, encerrado_em: new Date().toISOString() })
          .eq('plantao_id', plantao.id)
          .eq('profissional_id', enfermeiro?.id)
        setEncerrando(false)
        setPlantao(null)
        setSetoresIds(null)
        setTela('painel')
        // Sem tela manual de "abrir plantão" pra voltar — reabre sozinho,
        // igual ao que aconteceria se a página fosse recarregada agora.
        setVerificandoRetomada(true)
        await retomarPlantaoAtivo()
      },
    })
  }

  if (verificandoRetomada) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Carregando...
      </div>
    )
  }

  if (ehMedico || ehRecepcao) {
    return (
      <div className="shell">
        <div className="topbar no-print">
          <div className="topbar-brand">
            <span className="topbar-title">Passagem de Plantão</span>
          </div>
          <div className="topbar-user">
            <div className="topbar-group">
              <div className="topbar-menu">
                <button className="topbar-conta-btn" onClick={() => setContaMenuAberto((v) => !v)}>
                  <span className="topbar-nome">{enfermeiro?.nome_exibicao || enfermeiro?.nome}</span>
                  <span aria-hidden="true">▾</span>
                </button>
                {contaMenuAberto && (
                  <div className="topbar-menu-panel topbar-menu-panel-conta" onClick={() => setContaMenuAberto(false)}>
                    <button onClick={() => setTela('conta')}>Minha conta</button>
                    <button onClick={logout} className="topbar-menu-danger">Sair</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Carregando módulo...</div>}>
          {tela === 'conta' ? <MinhaConta onVoltar={() => setTela('painel')} /> : ehMedico ? <PainelMedico /> : <CadastroPacientes />}
        </Suspense>
      </div>
    )
  }

  return (
    <div className="app-shell-sidebar-layout">
      <Sidebar
        aberto={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
        enfermeiro={enfermeiro}
        isAdmin={isAdmin}
        podeAdministrar={podeEncerrarQualquerPlantonista}
        plantaoAberto={Boolean(plantao && setoresIds)}
        plantao={plantao}
        telaAtual={tela}
        onNavegar={(t) => {
          setTela(t)
          setSidebarAberta(false)
        }}
        onEncerrarPlantao={encerrarPlantao}
        encerrandoPlantao={encerrando}
        onLogout={logout}
      />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-hamburguer-btn"
              onClick={() => setSidebarAberta((v) => !v)}
              title="Abrir menu"
              aria-label="Abrir menu"
            >
              <i className="ph ph-list" />
            </button>
            <div className="breadcrumb">
              <i className="ph ph-house" />
              <span>Prontuário Eletrônico</span>
              <i className="ph ph-caret-right" />
              <span className="current">{TITULO_TELA[tela] || 'Painel de Leitos'}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="sys-time">
              <i className="ph ph-clock" /> {horaFormatada}
            </div>
            <div className="top-avatar" title={enfermeiro?.nome_exibicao || enfermeiro?.nome}>
              {iniciais(enfermeiro?.nome_exibicao || enfermeiro?.nome)}
            </div>
          </div>
        </header>

        <main className="main-viewport">
          <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Carregando módulo...</div>}>
            
            <div style={{ display: tela === 'ajuda' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
              <Ajuda onVoltar={() => setTela('painel')} />
            </div>

            <div style={{ display: tela === 'conta' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
              <MinhaConta onVoltar={() => setTela('painel')} />
            </div>

            <div style={{ display: tela === 'recepcao' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
              <CadastroPacientes onVoltar={() => setTela('painel')} />
            </div>

            {(!plantao && tela !== 'conta' && tela !== 'recepcao' && tela !== 'ajuda') && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                Não foi possível abrir o plantão. Verifique a conexão e recarregue a página.
              </div>
            )}

            {plantao && setoresIds && (
              <>
                <div style={{ display: tela === 'painel' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <Painel plantao={plantao} setoresIds={setoresIds} />
                </div>
                
                <div style={{ display: tela === 'passagemColetiva' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <PassagemColetivaTela plantao={plantao} setoresIds={setoresIds} onImprimir={setTela} onVoltar={() => setTela('painel')} />
                </div>

                <div style={{ display: tela === 'print1' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <PrintView plantao={plantao} grupo="grupo1" onVoltar={() => setTela('passagemColetiva')} />
                </div>

                <div style={{ display: tela === 'print2' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <PrintView plantao={plantao} grupo="grupo2" onVoltar={() => setTela('passagemColetiva')} />
                </div>

                <div style={{ display: tela === 'historico' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <Historico onVoltar={() => setTela('painel')} />
                </div>

                <div style={{ display: tela === 'altas' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <AltasRecentes onVoltar={() => setTela('painel')} />
                </div>

                <div style={{ display: tela === 'indicadoresClinicos' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <IndicadoresPainel onVoltar={() => setTela('painel')} />
                </div>

                <div style={{ display: tela === 'pendencias' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <Pendencias plantao={plantao} onVoltar={() => setTela('painel')} />
                </div>

                <div style={{ display: tela === 'compartilhar' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                  <CompartilharPlantao plantao={plantao} onVoltar={() => setTela('painel')} />
                </div>

                {podeEncerrarQualquerPlantonista && (
                  <>
                    <div style={{ display: tela === 'equipe' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                      <PainelEquipe onVoltar={() => setTela('painel')} />
                    </div>

                    <div style={{ display: tela === 'profissionais' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden' }}>
                      <GerenciarProfissionais onVoltar={() => setTela('painel')} />
                    </div>
                  </>
                )}
              </>
            )}
          </Suspense>

          {modalConfirmar && <ConfirmModal {...modalConfirmar} onCancelar={() => setModalConfirmar(null)} />}
        </main>
      </div>
    </div>
  )
}
