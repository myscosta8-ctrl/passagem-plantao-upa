import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import AberturaPlantao from './AberturaPlantao'
import Painel from './Painel'
import PrintView from './PrintView'
import Historico from './Historico'
import Ajuda from './Ajuda'
import MinhaConta from './MinhaConta'
import AltasRecentes from './AltasRecentes'
import Pendencias from './Pendencias'
import CompartilharPlantao from './CompartilharPlantao'
import ConfirmModal from './ConfirmModal'
import PainelEquipe from './PainelEquipe'
import GerenciarProfissionais from './GerenciarProfissionais'
import PainelMedico from './PainelMedico'
import CadastroPacientes from './CadastroPacientes'
import Header from '../components/Header'
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

// Horário fixo de corte de cada turno, baseado na data do plantão (não em quando a pessoa logou)
function calcularCorte(plantao) {
  const [ano, mes, dia] = plantao.data.split('-').map(Number)
  // America/Belém é sempre UTC-3, sem horário de verão — calculado direto em UTC
  // pra nunca depender do fuso configurado no aparelho de quem está usando.
  if (plantao.turno === 'Diurno') {
    return new Date(Date.UTC(ano, mes - 1, dia, 19 + 3, 20, 0))
  }
  // Noturno: corte é 07h20 da manhã seguinte
  return new Date(Date.UTC(ano, mes - 1, dia + 1, 7 + 3, 20, 0))
}

// Guarda em qual tela a pessoa estava, pra voltar pro mesmo lugar se o app recarregar sozinho
// (comum no celular). Expira depois de um tempo, pra nunca reabrir num lugar "velho" demais.
const TELAS_VALIDAS = ['painel', 'print1', 'print2', 'historico', 'altas', 'pendencias', 'ajuda', 'conta', 'profissionais']
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
  const [corteEm, setCorteEm] = useState(null)
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
  const [avisoEncerradoAutomatico, setAvisoEncerradoAutomatico] = useState(null)
  const [minutosParaCorte, setMinutosParaCorte] = useState(null)
  const [modalConfirmar, setModalConfirmar] = useState(null)
  const intervaloRef = useRef(null)

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
    return () => clearInterval(intervaloRef.current)
  }, [])

  // Fica de olho no relógio enquanto a pessoa está com um plantão aberto
  useEffect(() => {
    clearInterval(intervaloRef.current)
    if (!plantao || !corteEm || isAdmin) return

    intervaloRef.current = setInterval(() => {
      const agora = new Date()
      const diffMin = Math.round((corteEm.getTime() - agora.getTime()) / 60000)
      if (diffMin <= 0) {
        encerrarPorSistema()
      } else if (diffMin <= 20) {
        setMinutosParaCorte(diffMin)
      }
    }, 30000)

    return () => clearInterval(intervaloRef.current)
  }, [plantao, corteEm])

  async function carregarTodosSetoresIds() {
    const { data: setores } = await supabase.from('setores').select('id')
    return (setores ?? []).map((s) => s.id)
  }

  async function entrarComoAdmin() {
    setSetoresIds(await carregarTodosSetoresIds())

    const hoje = hojeISOLocal()
    const horaAtual = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Belem', hour: 'numeric', hour12: false }).format(new Date())
    )
    const turno = horaAtual >= 7 && horaAtual < 19 ? 'Diurno' : 'Noturno'

    const { data: existente } = await supabase
      .from('plantoes')
      .select('id, data, turno, status, created_at')
      .eq('data', hoje)
      .eq('turno', turno)
      .maybeSingle()

    if (existente) {
      setPlantao(existente)
    } else {
      const { data: criado } = await supabase
        .from('plantoes')
        .insert({ data: hoje, turno })
        .select()
        .single()
      if (criado) setPlantao(criado)
    }
    setVerificandoRetomada(false)
  }

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

    const agora = new Date()
    let paraRetomar = null
    let algumEncerradoAgora = null

    for (const item of abertos ?? []) {
      const corte = calcularCorte(item.plantoes)
      if (agora >= corte) {
        // passou do horário — encerra automaticamente, não retoma
        await supabase
          .from('plantao_profissionais')
          .update({ encerrado: true, encerrado_em: agora.toISOString(), encerrado_por_sistema: true })
          .eq('plantao_id', item.plantoes.id)
          .eq('profissional_id', enfermeiro.id)
        if (!algumEncerradoAgora) algumEncerradoAgora = item.plantoes
      } else if (!paraRetomar) {
        paraRetomar = item
      }
    }

    if (algumEncerradoAgora) {
      setAvisoEncerradoAutomatico(algumEncerradoAgora)
    }

    if (paraRetomar) {
      setPlantao(paraRetomar.plantoes)
      setCorteEm(calcularCorte(paraRetomar.plantoes))
      setSetoresIds(await carregarTodosSetoresIds())
    }
    setVerificandoRetomada(false)
  }

  async function aoAbrirPlantao(p) {
    setPlantao(p)
    setCorteEm(calcularCorte(p))
    setMinutosParaCorte(null)
    setSetoresIds(await carregarTodosSetoresIds())
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
        setCorteEm(null)
        setSetoresIds(null)
        setTela('painel')
      },
    })
  }

  async function encerrarPorSistema() {
    if (!plantao?.id) return
    await supabase
      .from('plantao_profissionais')
      .update({ encerrado: true, encerrado_em: new Date().toISOString(), encerrado_por_sistema: true })
      .eq('plantao_id', plantao.id)
      .eq('profissional_id', enfermeiro?.id)
    setPlantao(null)
    setCorteEm(null)
    setSetoresIds(null)
    setTela('painel')
    setMinutosParaCorte(null)
    setModalConfirmar({
      titulo: 'Horário do plantão encerrado',
      mensagem: 'O horário deste plantão terminou e sua participação foi encerrada automaticamente. Se ainda estiver trabalhando, abra o plantão novamente.',
      confirmarTexto: 'Entendi',
      somenteAviso: true,
      onConfirmar: () => setModalConfirmar(null),
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
    <div className="app-shell">
      <Header
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
      <div className="app-shell-main shell">
      {avisoEncerradoAutomatico && (
        <div className="no-print" style={{ background: 'var(--c-warning-light)', color: 'var(--c-warning)', borderLeft: '3px solid var(--c-warning)', padding: '10px 20px', fontSize: 13.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            ⚠ Sua participação no plantão de {new Date(avisoEncerradoAutomatico.data + 'T00:00:00').toLocaleDateString('pt-BR')} ({avisoEncerradoAutomatico.turno}) foi encerrada automaticamente por ter passado do horário.
          </span>
          <button onClick={() => setAvisoEncerradoAutomatico(null)} style={{ background: 'none', border: 'none', color: 'var(--c-warning)', fontWeight: 700, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {minutosParaCorte !== null && plantao && (
        <div className="no-print" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '10px 20px', fontSize: 13.5, fontWeight: 600 }}>
          ⏰ Seu acesso a este plantão encerra em {minutosParaCorte} minuto(s) — finalize suas edições ou clique em "Encerrar minha participação".
        </div>
      )}

      {tela === 'ajuda' ? (
        <Ajuda onVoltar={() => setTela('painel')} />
      ) : tela === 'conta' ? (
        <MinhaConta onVoltar={() => setTela('painel')} />
      ) : (
        <>
          {!plantao && <AberturaPlantao onPlantaoAberto={aoAbrirPlantao} />}

          {plantao && setoresIds && tela === 'painel' && <Painel plantao={plantao} setoresIds={setoresIds} />}
          {plantao && setoresIds && tela === 'print1' && (
            <PrintView plantao={plantao} grupo="grupo1" onVoltar={() => setTela('painel')} />
          )}
          {plantao && setoresIds && tela === 'print2' && (
            <PrintView plantao={plantao} grupo="grupo2" onVoltar={() => setTela('painel')} />
          )}
          {plantao && setoresIds && tela === 'historico' && <Historico onVoltar={() => setTela('painel')} />}
          {plantao && setoresIds && tela === 'altas' && <AltasRecentes onVoltar={() => setTela('painel')} />}
          {plantao && setoresIds && tela === 'pendencias' && <Pendencias plantao={plantao} onVoltar={() => setTela('painel')} />}
          {plantao && setoresIds && tela === 'compartilhar' && <CompartilharPlantao plantao={plantao} onVoltar={() => setTela('painel')} />}
          {plantao && setoresIds && tela === 'equipe' && podeEncerrarQualquerPlantonista && <PainelEquipe onVoltar={() => setTela('painel')} />}
          {plantao && setoresIds && tela === 'profissionais' && podeEncerrarQualquerPlantonista && <GerenciarProfissionais onVoltar={() => setTela('painel')} />}
        </>
      )}

      {modalConfirmar && <ConfirmModal {...modalConfirmar} onCancelar={() => setModalConfirmar(null)} />}
      </div>
    </div>
  )
}
