import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Painel from './Painel'
import PrintView from './PrintView'
import Historico from './Historico'
import Ajuda from './Ajuda'
import MinhaConta from './MinhaConta'
import AltasRecentes from './AltasRecentes'
import Pendencias from './Pendencias'
import IndicadoresPainel from './IndicadoresPainel'
import CompartilharPlantao from './CompartilharPlantao'
import ConfirmModal from './ConfirmModal'
import PainelEquipe from './PainelEquipe'
import GerenciarProfissionais from './GerenciarProfissionais'
import PainelMedico from './PainelMedico'
import CadastroPacientes from './CadastroPacientes'
import Sidebar from '../components/Sidebar'
import './AberturaPlantao.css'

async function purgarHistoricoAntigo() {
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
  const limite = seteDiasAtras.toISOString().slice(0, 10)
  await supabase.from('plantoes').delete().lt('data', limite)
}

// Leitos extras (superlotação) que ficaram vazios por mais de 3h se autoexcluem,
// pra não acumular leito criado e esquecido no sistema.
async function limparLeitosExtrasNaoUsados() {
  const tresHorasAtras = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  const { data: candidatos } = await supabase
    .from('leitos')
    .select('id')
    .eq('tipo', 'extra')
    .lt('criado_em', tresHorasAtras)
  if (!candidatos?.length) return

  const ids = candidatos.map((l) => l.id)
  const { data: ocupados } = await supabase
    .from('pacientes')
    .select('leito_atual_id')
    .eq('status', 'internado')
    .in('leito_atual_id', ids)
  const ocupadosSet = new Set((ocupados ?? []).map((p) => p.leito_atual_id))
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
  'ajuda', 'conta', 'profissionais',
]
const LIMITE_HORAS_TELA_SALVA = 4

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
    const { data: setores } = await supabase.from('setores').select('id')
    return (setores ?? []).map((s) => s.id)
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
      .select('id, data, turno, status, created_at')
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
      .select('plantoes!inner(id, data, turno, status, created_at)')
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
        {tela === 'conta' ? <MinhaConta onVoltar={() => setTela('painel')} /> : ehMedico ? <PainelMedico /> : <CadastroPacientes />}
      </div>
    )
  }

  return (
    <div className="app-shell-sidebar-layout">
      <Sidebar
        enfermeiro={enfermeiro}
        isAdmin={isAdmin}
        podeAdministrar={podeEncerrarQualquerPlantonista}
        plantaoAberto={Boolean(plantao && setoresIds)}
        plantao={plantao}
        telaAtual={tela}
        onNavegar={setTela}
        onEncerrarPlantao={encerrarPlantao}
        encerrandoPlantao={encerrando}
        onLogout={logout}
      />
      <main className="app-shell-conteudo shell">
        {tela === 'ajuda' ? (
          <Ajuda onVoltar={() => setTela('painel')} />
        ) : tela === 'conta' ? (
          <MinhaConta onVoltar={() => setTela('painel')} />
        ) : tela === 'recepcao' ? (
          <CadastroPacientes onVoltar={() => setTela('painel')} />
        ) : (
          <>
            {!plantao && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                Não foi possível abrir o plantão. Verifique a conexão e recarregue a página.
              </div>
            )}

            {plantao && setoresIds && tela === 'painel' && <Painel plantao={plantao} setoresIds={setoresIds} />}
            {plantao && setoresIds && tela === 'print1' && (
              <PrintView plantao={plantao} grupo="grupo1" onVoltar={() => setTela('painel')} />
            )}
            {plantao && setoresIds && tela === 'print2' && (
              <PrintView plantao={plantao} grupo="grupo2" onVoltar={() => setTela('painel')} />
            )}
            {plantao && setoresIds && tela === 'historico' && <Historico onVoltar={() => setTela('painel')} />}
            {plantao && setoresIds && tela === 'altas' && <AltasRecentes onVoltar={() => setTela('painel')} />}
            {plantao && setoresIds && tela === 'indicadoresClinicos' && <IndicadoresPainel onVoltar={() => setTela('painel')} />}
            {plantao && setoresIds && tela === 'pendencias' && <Pendencias plantao={plantao} onVoltar={() => setTela('painel')} />}
            {plantao && setoresIds && tela === 'compartilhar' && <CompartilharPlantao plantao={plantao} onVoltar={() => setTela('painel')} />}
            {plantao && setoresIds && tela === 'equipe' && podeEncerrarQualquerPlantonista && <PainelEquipe onVoltar={() => setTela('painel')} />}
            {plantao && setoresIds && tela === 'profissionais' && podeEncerrarQualquerPlantonista && <GerenciarProfissionais onVoltar={() => setTela('painel')} />}
          </>
        )}

        {modalConfirmar && <ConfirmModal {...modalConfirmar} onCancelar={() => setModalConfirmar(null)} />}
      </main>
    </div>
  )
}
