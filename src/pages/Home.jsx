import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '../lib/AuthContext'
import ConfirmModal from './ConfirmModal'
import ErroAba from '../components/ErroAba'
import Sidebar from '../components/Sidebar'
import TopNav from '../layout/TopNav'
import './AberturaPlantao.css'
import { lerTelaSalva, salvarTela } from './inicio/regrasInicio'
import { usePlantao } from './inicio/usePlantao'
import { useSessaoInativa } from './inicio/useSessaoInativa'
import { useRelogio, useErroApp, useRascunhosPendentes } from './inicio/useAvisosInicio'
import { Carregando } from './inicio/Carregando'
import FaixaErroApp from './inicio/FaixaErroApp'
import ShellProfissional from './inicio/ShellProfissional'
import TopoEnfermagem from './inicio/TopoEnfermagem'
import TelasEnfermagem from './inicio/TelasEnfermagem'

// Início: decide o que cada perfil vê e guarda a tela aberta. O plantão de enfermagem, o
// encerramento por inatividade, o relógio e os avisos ficam em ./inicio/ (hooks), assim como
// o topo, as telas da enfermagem e o início de médico/recepção/apoio.

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
  // Nutricionista e assistente social: veem o painel de leitos e registram no prontuário multiprofissional.
  const ehMulti = ehApoio && ['nutricionista', 'assistente_social'].includes(enfermeiro?.funcao)
  // "Encerrar plantonista" é destrutivo demais pra qualquer conta admin — só o Marcus.
  // Telas de administração: qualquer conta com papel admin no banco.
  // Administrador geral OU quem recebeu algum cargo/permissão administrativa (ver Profissionais → Cargo).
  const podeAdministrar = isAdmin || (permissoes?.length > 0)
  // Nova interface (menu no topo, tela cheia): liberada por pessoa em enfermeiros.pep_beta.
  const novaUI = enfermeiro?.pep_beta === true
  // Marca a página para que os estilos da nova interface (janela flutuante etc.) valham só para quem tem acesso.
  useEffect(() => {
    document.body.classList.toggle('ui-v2', novaUI)
    return () => document.body.classList.remove('ui-v2')
  }, [novaUI])
  const [tela, setTela] = useState(lerTelaSalva)
  const rascunhosPendentes = useRascunhosPendentes(tela)
  const [focoProfissional, setFocoProfissional] = useState(null)
  // Cada tela só é montada (e só busca dados) quando é aberta. Painel, Passagem e
  // Recepção ficam vivas depois da 1ª visita; as demais recarregam a cada visita.
  const [visitadas, setVisitadas] = useState(() => new Set([lerTelaSalva()]))
  useEffect(() => { setVisitadas((v) => (v.has(tela) ? v : new Set([...v, tela]))) }, [tela])
  const horaFormatada = useRelogio()
  const [erroApp, setErroApp] = useErroApp()
  useSessaoInativa(logout)
  useEffect(() => { salvarTela(tela) }, [tela])

  const [modalConfirmar, setModalConfirmar] = useState(null)
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const { plantao, setoresIds, verificandoRetomada, encerrando, encerrarPlantao } = usePlantao({
    enfermeiro, isAdmin, semPlantao: ehMedico || ehRecepcao || ehApoio, setTela, setModalConfirmar,
  })

  if (verificandoRetomada) return <Carregando />

  if (ehMedico || ehRecepcao || ehApoio) {
    return (
      <ShellProfissional enfermeiro={enfermeiro} isAdmin={isAdmin} novaUI={novaUI} tela={tela} setTela={setTela} podeAdministrar={podeAdministrar}
        ehMedico={ehMedico} ehRecepcao={ehRecepcao} ehApoio={ehApoio} ehMulti={ehMulti} horaFormatada={horaFormatada}
        erroApp={erroApp} setErroApp={setErroApp} logout={logout} focoProfissional={focoProfissional} setFocoProfissional={setFocoProfissional} />
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
        {!novaUI && <TopoEnfermagem tela={tela} horaFormatada={horaFormatada} enfermeiro={enfermeiro} setSidebarAberta={setSidebarAberta} />}

        <main className="main-viewport">
          <FaixaErroApp erroApp={erroApp} onFechar={() => setErroApp(null)} />
          <ErroAba chave={tela}>
          <Suspense fallback={<Carregando texto="Carregando módulo..." />}>
            <TelasEnfermagem tela={tela} setTela={setTela} visitadas={visitadas} plantao={plantao} setoresIds={setoresIds}
              podeAdministrar={podeAdministrar} focoProfissional={focoProfissional} setFocoProfissional={setFocoProfissional} />
          </Suspense>
          </ErroAba>

          {modalConfirmar && <ConfirmModal {...modalConfirmar} onCancelar={() => setModalConfirmar(null)} />}
        </main>
      </div>
    </div>
  )
}
