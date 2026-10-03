import { useState, lazy, Suspense } from 'react'
import Painel from '../Painel'
import ErroAba from '../../components/ErroAba'
import TopNav from '../../layout/TopNav'
import FaixaErroApp from './FaixaErroApp'
import { Carregando } from './Carregando'
import { iniciais } from './regrasInicio'

const MinhaConta = lazy(() => import('../MinhaConta'))
const PainelEquipe = lazy(() => import('../PainelEquipe'))
const GerenciarProfissionais = lazy(() => import('../GerenciarProfissionais'))
const TelaApoio = lazy(() => import('../TelaApoio'))
const CadastroPacientes = lazy(() => import('../CadastroPacientes'))

// Início do médico, da recepção e das demais funções (apoio/multiprofissional): mesmo esqueleto
// visual da enfermagem (topo com trilha, relógio e avatar), sem o fluxo de plantão.
export default function ShellProfissional({ enfermeiro, isAdmin, novaUI, tela, setTela, podeAdministrar, ehMedico, ehRecepcao, ehApoio, ehMulti, horaFormatada, erroApp, setErroApp, logout, focoProfissional, setFocoProfissional }) {
  const [contaMenuAberto, setContaMenuAberto] = useState(false)
  const tituloInicio = ehMedico ? 'Painel Médico' : ehRecepcao ? 'Recepção' : ehMulti ? 'Painel de Leitos' : 'Início'
  const tituloTela = tela === 'conta' ? 'Minha conta' : tela === 'equipe' && podeAdministrar ? 'Painel de Equipe' : tela === 'profissionais' && podeAdministrar ? 'Profissionais' : tituloInicio
  const itensShell = [
    { tela: 'painel', rotulo: tituloInicio, icone: ehMedico || ehMulti ? 'ph-bed' : ehRecepcao ? 'ph-identification-card' : 'ph-house' },
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
          <FaixaErroApp erroApp={erroApp} onFechar={() => setErroApp(null)} />
          <ErroAba chave={tela}>
          <Suspense fallback={<Carregando texto="Carregando módulo..." />}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {tela === 'conta' ? <MinhaConta onVoltar={() => setTela('painel')} />
                : tela === 'equipe' && podeAdministrar ? <PainelEquipe onVoltar={() => setTela('painel')} podeAdministrar={podeAdministrar} onGerenciar={(id) => { setFocoProfissional(id); setTela('profissionais') }} />
                : tela === 'profissionais' && podeAdministrar ? <GerenciarProfissionais onVoltar={() => setTela('painel')} focoId={focoProfissional} onAbrirEquipe={() => setTela('equipe')} />
                : ehMulti ? <Painel modo="multi" />
                : ehApoio ? <TelaApoio enfermeiro={enfermeiro} podeAdministrar={podeAdministrar} onEquipe={() => setTela('equipe')} onProfissionais={() => setTela('profissionais')} onConta={() => setTela('conta')} />
                : ehMedico ? <Painel modo="medico" />
                : <CadastroPacientes />}
            </div>
          </Suspense>
          </ErroAba>
        </main>
      </div>
    </div>
  )
}
