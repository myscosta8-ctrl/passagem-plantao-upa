import { useEffect, useState, lazy, Suspense, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Painel from './Painel'
import PassagemColetivaTela from './PassagemColetivaTela'
import ConfirmModal from './ConfirmModal'
import Sidebar from '../components/Sidebar'
import TopNav from '../layout/TopNav'
import './AberturaPlantao.css'
import { avisarErro } from '../lib/erros'
import { listarMeusRascunhos } from '../components/MeusRascunhos'
import { EVENTO_DOCUMENTOS } from '../lib/documentos'

// Telas carregadas sob demanda via React.lazy (Code-Splitting)
const PrintView = lazy(() => import('./PrintView'))
const Ajuda = lazy(() => import('./Ajuda'))
const MinhaConta = lazy(() => import('./MinhaConta'))
const AltasRecentes = lazy(() => import('./AltasRecentes'))
const Pendencias = lazy(() => import('./Pendencias'))
const IndicadoresPainel = lazy(() => import('./IndicadoresPainel'))
const CompartilharPlantao = lazy(() => import('./CompartilharPlantao'))
const PainelEquipe = lazy(() => import('./PainelEquipe'))
const GerenciarProfissionais = lazy(() => import('./GerenciarProfissionais'))
const TelaApoio = lazy(() => import('./TelaApoio'))
const CadastroPacientes = lazy(() => import('./CadastroPacientes'))

// Leitos extras que não possuem paciente ativo desaparecem automaticamente
async function limparLeitosExtrasNaoUsados() {
  const { data: candidatos, error: erroConsulta1 } = await supabase
    .from('leitos')
    .select('id')
    .eq('tipo', 'extra')
  if (erroConsulta1) avisarErro('Home', erroConsulta1)
  if (!candidatos?.length) return

  const ids = candidatos.map((l) => l.id)
  const { data: ocupacoesPep, error: erroConsulta2 } = await supabase.from('leito_ocupacoes').select('leito_id').eq('status', 'ativo').in('leito_id', ids)
  if (erroConsulta2) avisarErro('Home', erroConsulta2)
  const ocupadosSet = new Set((ocupacoesPep ?? []).map((o) => o.leito_id))
  const paraExcluir = ids.filter((id) => !ocupadosSet.has(id))
  if (paraExcluir.length) await supabase.from('leitos').delete().in('id', paraExcluir)
}

function hojeISOLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

// Guarda em qual tela a pessoa estava, pra voltar pro mesmo lugar se o app recarregar sozinho
// (comum no celular). Expira depois de um tempo, pra nunca reabrir num lugar "velho" demais.
const TELAS_VALIDAS = [
  'painel', 'recepcao', 'print1', 'print2', 'altas',
  'indicadoresClinicos', 'pendencias', 'compartilhar', 'equipe',
  'ajuda', 'conta', 'profissionais', 'passagemColetiva',
]
const LIMITE_HORAS_TELA_SALVA = 4

const TITULO_TELA = {
  painel: 'Painel de Leitos',
  recepcao: 'Recepção',
  passagemColetiva: 'Passagem de Plantão',
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
  const { enfermeiro, logout, permissoes } = useAuth()
  const isAdmin = enfermeiro?.role === 'admin'
  // Médico não participa do fluxo de plantão de enfermagem (abertura/setores) —
  // vai direto pro painel dele, sobre a estrutura nova (atendimentos/leito_ocupacoes).
  const ehMedico = enfermeiro?.tipo === 'medico'
  // Mesmo raciocínio do médico: recepção não abre plantão de enfermagem, vai
  // direto pro cadastro de pacientes — trabalho dela é identidade, não leito.
  const ehRecepcao = enfermeiro?.tipo === 'recepcao'
  // Demais funções da UPA (farmácia, serviço social, etc.): só consulta, sem plantão de enfermagem.
  const ehApoio = enfermeiro?.tipo === 'apoio'
  // "Encerrar plantonista" é destrutivo demais pra qualquer conta admin — só o Marcus.
  // Telas de administração: qualquer conta com papel admin no banco.
  // Administrador geral OU quem recebeu algum cargo/permissão administrativa (ver Profissionais → Cargo).
  const podeAdministrar = isAdmin || (permissoes?.length > 0)
  // Nova interface (menu no topo, tela cheia): liberada por pessoa em enfermeiros.pep_beta.
  const novaUI = enfermeiro?.pep_beta === true
  const [plantao, setPlantao] = useState(null)
  const [setoresIds, setSetoresIds] = useState(null)
  const [tela, setTela] = useState(lerTelaSalva)
  // Aviso no menu (Pendências) de documentos do próprio profissional salvos e não finalizados.
  const [rascunhosPendentes, setRascunhosPendentes] = useState(0)
  useEffect(() => {
    let t
    const atualizar = () => listarMeusRascunhos().then((l) => setRascunhosPendentes(l.length))
    // Após salvar/finalizar/cancelar um documento (espera 1s para o banco concluir)
    const aoMudar = () => { clearTimeout(t); t = setTimeout(atualizar, 1000) }
    const aoVoltar = () => { if (document.visibilityState === 'visible') atualizar() }
    atualizar()
    window.addEventListener(EVENTO_DOCUMENTOS, aoMudar)
    document.addEventListener('visibilitychange', aoVoltar)
    return () => { clearTimeout(t); window.removeEventListener(EVENTO_DOCUMENTOS, aoMudar); document.removeEventListener('visibilitychange', aoVoltar) }
  }, [tela])
  const [focoProfissional, setFocoProfissional] = useState(null)
  // Cada tela só é montada (e só busca dados) quando é aberta. Painel, Passagem e
  // Recepção ficam vivas depois da 1ª visita; as demais recarregam a cada visita.
  const [visitadas, setVisitadas] = useState(() => new Set([lerTelaSalva()]))
  useEffect(() => { setVisitadas((v) => (v.has(tela) ? v : new Set([...v, tela]))) }, [tela])
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

  const [erroApp, setErroApp] = useState(null)
  useEffect(() => {
    let t
    const aoErro = (e) => { setErroApp(e.detail); clearTimeout(t); t = setTimeout(() => setErroApp(null), 12000) }
    window.addEventListener('app-erro', aoErro)
    return () => { window.removeEventListener('app-erro', aoErro); clearTimeout(t) }
  }, [])

  const logoutRef = useRef(logout)
  logoutRef.current = logout

  // Encerramento automático do login após 2 horas sem uso (sem clique,
  // digitação, toque ou rolagem). A última atividade fica no localStorage para
  // valer entre abas abertas do mesmo navegador.
  useEffect(() => {
    const LIMITE = 2 * 60 * 60 * 1000
    const CHAVE = 'app_ultima_atividade'
    const marcar = () => { try { localStorage.setItem(CHAVE, String(Date.now())) } catch { /* sem storage */ } }
    const ultima = () => { try { return Number(localStorage.getItem(CHAVE)) || Date.now() } catch { return Date.now() } }
    let ultimaMarcacao = 0
    let encerrado = false
    const encerrar = () => { if (!encerrado) { encerrado = true; logoutRef.current() } }
    const expirou = () => Date.now() - ultima() >= LIMITE
    // Antes de registrar uso, confere se já passou das 2h (ex.: celular/aba parados
    // e a pessoa volta mexendo na tela) — senão o movimento "renovava" a sessão vencida.
    const aoUsar = () => { if (expirou()) { encerrar(); return } const agora = Date.now(); if (agora - ultimaMarcacao > 30000) { ultimaMarcacao = agora; marcar() } }
    const aoVoltar = () => { if (document.visibilityState === 'visible' && expirou()) encerrar() }
    // Ao reabrir o app depois de mais de 2h parado, encerra antes de continuar.
    if (Date.now() - ultima() >= LIMITE) { logoutRef.current(); return }
    marcar()
    const eventos = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove']
    eventos.forEach((e) => window.addEventListener(e, aoUsar, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('focus', aoVoltar)
    window.addEventListener('pageshow', aoVoltar)
    const t = setInterval(() => { if (expirou()) encerrar() }, 30000)
    // Sinal de atividade para o Painel de Equipe ("online agora"): a cada 2 min, se houve uso recente.
    const sinal = () => { if (Date.now() - ultima() < 3 * 60000 && document.visibilityState === 'visible') supabase.rpc('registrar_atividade').then(() => {}, () => {}) }
    sinal()
    const tSinal = setInterval(sinal, 120000)
    return () => { clearInterval(t); clearInterval(tSinal); document.removeEventListener('visibilitychange', aoVoltar); window.removeEventListener('focus', aoVoltar); window.removeEventListener('pageshow', aoVoltar); eventos.forEach((e) => window.removeEventListener(e, aoUsar, { capture: true })) }
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
    if (ehMedico || ehRecepcao || ehApoio) {
      setVerificandoRetomada(false)
      return
    }
    limparLeitosExtrasNaoUsados()
    if (isAdmin) {
      entrarComoAdmin()
    } else {
      retomarPlantaoAtivo()
    }
  }, [])

  async function carregarTodosSetoresIds() {
    const { data: setores, error: erroConsulta3 } = await supabase.from('setores').select('id').in('id', [1, 2, 3, 4])
    if (erroConsulta3) avisarErro('Home', erroConsulta3)
    if (setores && setores.length > 0) return setores.map((s) => s.id)
    const { data: todos, error: erroConsulta4 } = await supabase.from('setores').select('id')
    if (erroConsulta4) avisarErro('Home', erroConsulta4)
    return (todos ?? []).map((s) => s.id)
  }

  function turnoAtualPorHora() {
    const horaAtual = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Belem', hour: 'numeric', hour12: false }).format(new Date())
    )
    return horaAtual >= 7 && horaAtual < 19 ? 'Diurno' : 'Noturno'
  }

  async function buscarOuAbrirPlantao(hoje, turno) {
    const { data: existente, error: erroConsulta5 } = await supabase
      .from('plantoes')
      .select('id, data, turno, status, created_at, enfermeiro_chefe_id')
      .eq('data', hoje)
      .eq('turno', turno)
      .maybeSingle()
    if (erroConsulta5) avisarErro('Home', erroConsulta5)
    if (existente) return existente

    const { data: criado, error: erroConsulta6 } = await supabase.from('plantoes').insert({ data: hoje, turno }).select().single()
    if (erroConsulta6) avisarErro('Home', erroConsulta6)
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

    const { data: abertos, error: erroConsulta7 } = await supabase
      .from('plantao_profissionais')
      .select('plantoes!inner(id, data, turno, status, created_at, enfermeiro_chefe_id)')
      .eq('profissional_id', enfermeiro.id)
      .eq('encerrado', false)
      .order('created_at', { foreignTable: 'plantoes', ascending: false })
      .limit(1)
    if (erroConsulta7) avisarErro('Home', erroConsulta7)

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

  if (ehMedico || ehRecepcao || ehApoio) {
    // Mesmo esqueleto visual da enfermagem (topo com trilha, relógio e avatar),
    // sem o fluxo de plantão.
    const tituloInicio = ehMedico ? 'Painel Médico' : ehRecepcao ? 'Recepção' : 'Início'
    const tituloTela = tela === 'conta' ? 'Minha conta' : tela === 'equipe' && podeAdministrar ? 'Painel de Equipe' : tela === 'profissionais' && podeAdministrar ? 'Profissionais' : tituloInicio
    const itensShell = [
      { tela: 'painel', rotulo: tituloInicio, icone: ehMedico ? 'ph-bed' : ehRecepcao ? 'ph-identification-card' : 'ph-house' },
      ...(podeAdministrar ? [{ tela: 'equipe', rotulo: 'Equipe', icone: 'ph-users-three' }, { tela: 'profissionais', rotulo: 'Profissionais', icone: 'ph-identification-badge' }] : []),
    ]
    return (
      <div className={novaUI ? 'app-v2' : 'app-shell-sidebar-layout'}>
        <div className="main-content">
          {novaUI && <TopNav itens={itensShell} telaAtual={tela} onNavegar={setTela} enfermeiro={enfermeiro} isAdmin={isAdmin} onLogout={logout} />}
          {!novaUI && <header className="topbar no-print">
            <div className="topbar-left">
              <div className="breadcrumb">
                <i className="ph ph-house" />
                <button type="button" onClick={() => setTela('painel')} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}>Prontuário Eletrônico</button>
                <i className="ph ph-caret-right" />
                <span className="current">{tituloTela}</span>
              </div>
            </div>
            <div className="topbar-right">
              <div className="sys-time"><i className="ph ph-clock" /> {horaFormatada}</div>
              <div className="topbar-menu">
                <button type="button" className="top-avatar" title={enfermeiro?.nome_exibicao || enfermeiro?.nome} onClick={() => setContaMenuAberto((v) => !v)} style={{ cursor: 'pointer' }}>
                  {iniciais(enfermeiro?.nome_exibicao || enfermeiro?.nome)}
                </button>
                {contaMenuAberto && (
                  <div className="topbar-menu-panel topbar-menu-panel-conta" style={{ right: 0 }} onClick={() => setContaMenuAberto(false)}>
                    <div style={{ padding: '8px 12px', fontWeight: 600 }}>{enfermeiro?.nome_exibicao || enfermeiro?.nome}</div>
                    <button onClick={() => setTela('painel')}>{tituloInicio}</button>
                    <button onClick={() => setTela('conta')}>Minha conta</button>
                    {podeAdministrar && <button onClick={() => setTela('equipe')}>Painel de Equipe</button>}
                    {podeAdministrar && <button onClick={() => setTela('profissionais')}>Profissionais</button>}
                    <button onClick={logout} className="topbar-menu-danger">Sair</button>
                  </div>
                )}
              </div>
            </div>
          </header>}
          <main className="main-viewport">
            {erroApp && (<div role="alert" className="faixa-erro-app"><i className="ph ph-warning-circle" /> Falha ao carregar dados ({erroApp.contexto}). Verifique a conexão — as informações exibidas podem estar incompletas.<button type="button" onClick={() => setErroApp(null)}>Fechar</button></div>)}
            <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Carregando módulo...</div>}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {tela === 'conta' ? <MinhaConta onVoltar={() => setTela('painel')} />
                  : tela === 'equipe' && podeAdministrar ? <PainelEquipe onVoltar={() => setTela('painel')} podeAdministrar={podeAdministrar} onGerenciar={(id) => { setFocoProfissional(id); setTela('profissionais') }} />
                  : tela === 'profissionais' && podeAdministrar ? <GerenciarProfissionais onVoltar={() => setTela('painel')} focoId={focoProfissional} onAbrirEquipe={() => setTela('equipe')} />
                  : ehApoio ? <TelaApoio enfermeiro={enfermeiro} podeAdministrar={podeAdministrar} onEquipe={() => setTela('equipe')} onProfissionais={() => setTela('profissionais')} onConta={() => setTela('conta')} />
                  : ehMedico ? <Painel modo="medico" />
                  : <CadastroPacientes />}
              </div>
            </Suspense>
          </main>
        </div>
      </div>
    )
  }

  const itensEnf = [
    { tela: 'painel', rotulo: 'Leitos', icone: 'ph-bed' },
    { tela: 'passagemColetiva', rotulo: 'Passagem', icone: 'ph-arrows-left-right' },
    { tela: 'pendencias', rotulo: 'Pendências', icone: 'ph-warning', contador: rascunhosPendentes },
    { tela: 'altas', rotulo: 'Desfechos', icone: 'ph-sign-out' },
    { tela: 'recepcao', rotulo: 'Recepção', icone: 'ph-identification-card' },
    { tela: 'indicadoresClinicos', rotulo: 'Indicadores', icone: 'ph-chart-bar' },
  ]
  const extrasContaEnf = podeAdministrar ? [{ tela: 'equipe', rotulo: 'Painel de Equipe', icone: 'ph-users-three' }, { tela: 'profissionais', rotulo: 'Profissionais', icone: 'ph-identification-badge' }] : []
  return (
    <div className={novaUI ? 'app-v2' : 'app-shell-sidebar-layout'}>
      {!novaUI && <Sidebar
        aberto={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
        enfermeiro={enfermeiro}
        isAdmin={isAdmin}
        podeAdministrar={podeAdministrar}
        plantaoAberto={Boolean(plantao && setoresIds)}
        plantao={plantao}
        telaAtual={tela}
        rascunhosPendentes={rascunhosPendentes}
        onNavegar={(t) => {
          setTela(t)
          setSidebarAberta(false)
        }}
        onEncerrarPlantao={encerrarPlantao}
        encerrandoPlantao={encerrando}
        onLogout={logout}
      />}
      <div className="main-content">
        {novaUI && <TopNav itens={itensEnf} extrasConta={extrasContaEnf} telaAtual={tela} onNavegar={setTela} enfermeiro={enfermeiro} isAdmin={isAdmin} plantao={plantao} podeEncerrar={Boolean(plantao && setoresIds) && !isAdmin} onEncerrarPlantao={encerrarPlantao} encerrando={encerrando} onLogout={logout} />}
        {!novaUI && <header className="topbar">
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
        </header>}

        <main className="main-viewport">

          {erroApp && (

            <div role="alert" className="faixa-erro-app">

              <i className="ph ph-warning-circle" /> Falha ao carregar dados ({erroApp.contexto}). Verifique a conexão — as informações exibidas podem estar incompletas.

              <button type="button" onClick={() => setErroApp(null)}>Fechar</button>

            </div>

          )}
          <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Carregando módulo...</div>}>
            
            <div style={{ display: tela === 'ajuda' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {tela === 'ajuda' && <Ajuda onVoltar={() => setTela('painel')} />}
            </div>

            <div style={{ display: tela === 'conta' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {tela === 'conta' && <MinhaConta onVoltar={() => setTela('painel')} />}
            </div>

            <div style={{ display: tela === 'recepcao' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {visitadas.has('recepcao') && <CadastroPacientes onVoltar={() => setTela('painel')} />}
            </div>

            {(!plantao && tela !== 'conta' && tela !== 'recepcao' && tela !== 'ajuda') && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                Não foi possível abrir o plantão. Verifique a conexão e recarregue a página.
              </div>
            )}

            {plantao && setoresIds && (
              <>
                <div style={{ display: tela === 'painel' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {visitadas.has('painel') && <Painel plantao={plantao} setoresIds={setoresIds} />}
                </div>
                
                <div style={{ display: tela === 'passagemColetiva' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {visitadas.has('passagemColetiva') && <PassagemColetivaTela plantao={plantao} setoresIds={setoresIds} onImprimir={setTela} onCompartilhar={() => setTela('compartilhar')} onVoltar={() => setTela('painel')} />}
                </div>

                <div style={{ display: tela === 'print1' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {tela === 'print1' && <PrintView plantao={plantao} grupo="grupo1" onVoltar={() => setTela('passagemColetiva')} />}
                </div>

                <div style={{ display: tela === 'print2' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {tela === 'print2' && <PrintView plantao={plantao} grupo="grupo2" onVoltar={() => setTela('passagemColetiva')} />}
                </div>

                <div style={{ display: tela === 'altas' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {tela === 'altas' && <AltasRecentes onVoltar={() => setTela('painel')} />}
                </div>

                <div style={{ display: tela === 'indicadoresClinicos' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {tela === 'indicadoresClinicos' && <IndicadoresPainel onVoltar={() => setTela('painel')} />}
                </div>

                <div style={{ display: tela === 'pendencias' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {tela === 'pendencias' && <Pendencias plantao={plantao} onVoltar={() => setTela('painel')} />}
                </div>

                <div style={{ display: tela === 'compartilhar' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {tela === 'compartilhar' && <CompartilharPlantao plantao={plantao} onVoltar={() => setTela('passagemColetiva')} />}
                </div>

                {podeAdministrar && (
                  <>
                    <div style={{ display: tela === 'equipe' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      {tela === 'equipe' && <PainelEquipe onVoltar={() => setTela('painel')} podeAdministrar={podeAdministrar} onGerenciar={(id) => { setFocoProfissional(id); setTela('profissionais') }} />}
                    </div>

                    <div style={{ display: tela === 'profissionais' ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      {tela === 'profissionais' && <GerenciarProfissionais onVoltar={() => setTela('painel')} focoId={focoProfissional} onAbrirEquipe={() => setTela('equipe')} />}
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
