import { useEffect, useState } from 'react'
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

export default function Home() {
  const { enfermeiro, logout } = useAuth()
  const isAdmin = enfermeiro?.role === 'admin'
  const [plantao, setPlantao] = useState(null)
  const [setoresIds, setSetoresIds] = useState(null)
  const [tela, setTela] = useState('painel') // 'painel' | 'print1' | 'print2' | 'historico' | 'ajuda'
  const [verificandoRetomada, setVerificandoRetomada] = useState(true)
  const [encerrando, setEncerrando] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    purgarHistoricoAntigo()
    if (isAdmin) {
      entrarComoAdmin()
    } else {
      retomarPlantaoAtivo()
    }
  }, [])

  async function entrarComoAdmin() {
    // Admin não tem limite de acesso: sem exigência de equipe, vê todos os setores direto
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
    const { data } = await supabase
      .from('plantao_profissionais')
      .select('setores_ids, plantoes!inner(id, data, turno, status, created_at)')
      .eq('profissional_id', enfermeiro.id)
      .eq('encerrado', false)
      .order('created_at', { foreignTable: 'plantoes', ascending: false })
      .limit(1)
      .maybeSingle()

    if (data?.plantoes) {
      setPlantao(data.plantoes)
      if (data.setores_ids?.length) setSetoresIds(data.setores_ids)
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

  async function encerrarPlantao() {
    if (!plantao?.id) return
    const confirmado = window.confirm(
      'Encerrar sua participação neste plantão? Isso afeta só a sua sessão — o outro enfermeiro (se houver) continua normalmente até encerrar a dele. Use quando você tiver terminado suas edições.'
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
    setSetoresIds(null)
    setTela('painel')
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
                  <button onClick={() => setTela('altas')}>Altas recentes</button>
                  <button onClick={() => setTela('pendencias')}>Pendências</button>
                  <button onClick={() => setTela('ajuda')}>Ajuda</button>
                  {!isAdmin && (
                    <button
                      onClick={encerrarPlantao}
                      disabled={encerrando}
                      className="topbar-menu-danger"
                    >
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

      {tela === 'ajuda' ? (
        <Ajuda onVoltar={() => setTela('painel')} />
      ) : (
        <>
          {!plantao && <AberturaPlantao onPlantaoAberto={setPlantao} />}

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
