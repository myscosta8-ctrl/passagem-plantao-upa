import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import AberturaPlantao from './AberturaPlantao'
import SelecaoSetores from './SelecaoSetores'
import Painel from './Painel'
import PrintView from './PrintView'
import Historico from './Historico'
import Ajuda from './Ajuda'
import AltasRecentes from './AltasRecentes'
import Pendencias from './Pendencias'
import './AberturaPlantao.css'

async function purgarHistoricoAntigo() {
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
  const limite = seteDiasAtras.toISOString().slice(0, 10)
  await supabase.from('plantoes').delete().lt('data', limite)
}

function hojeISOLocal() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

// Horário fixo de corte de cada turno, baseado na data do plantão (não em quando a pessoa logou)
function calcularCorte(plantao) {
  const [ano, mes, dia] = plantao.data.split('-').map(Number)
  if (plantao.turno === 'Diurno') {
    return new Date(ano, mes - 1, dia, 19, 20, 0)
  }
  // Noturno: corte é 07h20 da manhã seguinte
  return new Date(ano, mes - 1, dia + 1, 7, 20, 0)
}

export default function Home() {
  const { enfermeiro, logout } = useAuth()
  const isAdmin = enfermeiro?.role === 'admin'
  const [plantao, setPlantao] = useState(null)
  const [corteEm, setCorteEm] = useState(null)
  const [setoresIds, setSetoresIds] = useState(null)
  const [tela, setTela] = useState('painel')
  const [verificandoRetomada, setVerificandoRetomada] = useState(true)
  const [encerrando, setEncerrando] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [avisoEncerradoAutomatico, setAvisoEncerradoAutomatico] = useState(null)
  const [minutosParaCorte, setMinutosParaCorte] = useState(null)
  const intervaloRef = useRef(null)

  useEffect(() => {
    purgarHistoricoAntigo()
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

  async function entrarComoAdmin() {
    const { data: setores } = await supabase.from('setores').select('id')
    setSetoresIds((setores ?? []).map((s) => s.id))

    const hoje = hojeISOLocal()
    const horaAtual = new Date().getHours()
    const turno = horaAtual >= 7 && horaAtual < 19 ? 'Diurno' : 'Noturno'

    const { data: existente } = await supabase
      .from('plantoes')
      .select('id, data, turno, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
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
      .select('setores_ids, plantoes!inner(id, data, turno, status, created_at)')
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
      if (paraRetomar.setores_ids?.length) setSetoresIds(paraRetomar.setores_ids)
    }
    setVerificandoRetomada(false)
  }

  async function confirmarSetores(ids) {
    setSetoresIds(ids)
    if (plantao?.id && enfermeiro?.id) {
      await supabase
        .from('plantao_profissionais')
        .update({ setores_ids: ids })
        .eq('plantao_id', plantao.id)
        .eq('profissional_id', enfermeiro.id)
    }
  }

  function aoAbrirPlantao(p) {
    setPlantao(p)
    setCorteEm(calcularCorte(p))
    setMinutosParaCorte(null)
  }

  async function encerrarPlantao() {
    if (!plantao?.id) return
    const confirmado = window.confirm(
      'Encerrar sua participação neste plantão? Isso afeta só a sua sessão — o outro enfermeiro (se houver) continua normalmente até encerrar a dele.'
    )
    if (!confirmado) return

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
    window.alert('O horário deste plantão terminou e sua participação foi encerrada automaticamente. Se ainda estiver trabalhando, abra o plantão novamente.')
  }

  if (verificandoRetomada) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Carregando...
      </div>
    )
  }

  return (
    <div className="shell">
      <div className="topbar no-print">
        <div className="topbar-brand">
          <span className="topbar-mark">UPA</span>
          <span className="topbar-title">Passagem de Plantão</span>
        </div>
        <div className="topbar-user">
          {plantao && (
            <span className="topbar-turno">
              {plantao.turno} — {new Date(plantao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          )}

          {plantao && setoresIds && tela === 'painel' && (
            <div className="topbar-menu">
              <button className="topbar-menu-btn" onClick={() => setMenuAberto((v) => !v)}>
                ☰ Menu
              </button>
              {menuAberto && (
                <div className="topbar-menu-panel" onClick={() => setMenuAberto(false)}>
                  {!isAdmin && <button onClick={() => setSetoresIds(null)}>Trocar setores</button>}
                  <button onClick={() => setTela('print1')}>Imprimir Vermelha+Internação</button>
                  <button onClick={() => setTela('print2')}>Imprimir Pediátrico+Observação</button>
                  <button onClick={() => setTela('historico')}>Histórico</button>
                  <button onClick={() => setTela('altas')}>Desfechos (7 dias)</button>
                  <button onClick={() => setTela('pendencias')}>Pendências</button>
                  <button onClick={() => setTela('ajuda')}>Ajuda</button>
                  {!isAdmin && (
                    <button onClick={encerrarPlantao} disabled={encerrando} className="topbar-menu-danger">
                      {encerrando ? 'Encerrando...' : 'Encerrar minha participação'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!(plantao && setoresIds && tela === 'painel') && (
            <button onClick={() => setTela('ajuda')}>Ajuda</button>
          )}
          <span className="topbar-nome">
            {enfermeiro?.nome_exibicao || enfermeiro?.nome}
            {isAdmin && <span className="admin-badge">ADMIN</span>}
          </span>
          <button onClick={logout}>Sair</button>
        </div>
      </div>

      {avisoEncerradoAutomatico && (
        <div className="no-print" style={{ background: '#FFF3D6', color: '#8A5A00', padding: '10px 20px', fontSize: 13.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            ⚠ Sua participação no plantão de {new Date(avisoEncerradoAutomatico.data + 'T00:00:00').toLocaleDateString('pt-BR')} ({avisoEncerradoAutomatico.turno}) foi encerrada automaticamente por ter passado do horário.
          </span>
          <button onClick={() => setAvisoEncerradoAutomatico(null)} style={{ background: 'none', border: 'none', color: '#8A5A00', fontWeight: 700, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {minutosParaCorte !== null && plantao && (
        <div className="no-print" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '10px 20px', fontSize: 13.5, fontWeight: 600 }}>
          ⏰ Seu acesso a este plantão encerra em {minutosParaCorte} minuto(s) — finalize suas edições ou clique em "Encerrar minha participação".
        </div>
      )}

      {tela === 'ajuda' ? (
        <Ajuda onVoltar={() => setTela('painel')} />
      ) : (
        <>
          {!plantao && <AberturaPlantao onPlantaoAberto={aoAbrirPlantao} />}

          {plantao && !setoresIds && <SelecaoSetores onConfirmar={confirmarSetores} />}

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
        </>
      )}
    </div>
  )
}
