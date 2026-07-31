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

export default function Home() {
  const { enfermeiro, logout } = useAuth()
  const [plantao, setPlantao] = useState(null)
  const [setoresIds, setSetoresIds] = useState(null)
  const [tela, setTela] = useState('painel') // 'painel' | 'print1' | 'print2' | 'historico' | 'ajuda'
  const [verificandoRetomada, setVerificandoRetomada] = useState(true)
  const [encerrando, setEncerrando] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    purgarHistoricoAntigo()
    retomarPlantaoAtivo()
  }, [])

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
                  <button onClick={() => setSetoresIds(null)}>Trocar setores</button>
                  <button onClick={() => setTela('print1')}>Imprimir Vermelha+Internação</button>
                  <button onClick={() => setTela('print2')}>Imprimir Pediátrico+Observação</button>
                  <button onClick={() => setTela('historico')}>Histórico</button>
                  <button onClick={() => setTela('altas')}>Altas recentes</button>
                  <button onClick={() => setTela('pendencias')}>Pendências</button>
                  <button onClick={() => setTela('ajuda')}>Ajuda</button>
                  <button
                    onClick={encerrarPlantao}
                    disabled={encerrando}
                    className="topbar-menu-danger"
                  >
                    {encerrando ? 'Encerrando...' : 'Encerrar minha participação'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!(plantao && setoresIds && tela === 'painel') && (
            <button onClick={() => setTela('ajuda')}>Ajuda</button>
          )}
          <span className="topbar-nome">{enfermeiro?.nome_exibicao || enfermeiro?.nome}</span>
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
