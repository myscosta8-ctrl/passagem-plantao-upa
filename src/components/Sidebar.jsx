import { useState } from 'react'
import { lerTemaSalvo, alternarTema } from '../lib/theme'
import './Sidebar.css'

const iconProps = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
}

const IconPainel = (p) => <svg {...iconProps} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
const IconPendencias = (p) => <svg {...iconProps} {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 2h6v3H9zM8 11h8M8 15h5" /></svg>
const IconCompartilhar = (p) => <svg {...iconProps} {...p}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" /></svg>
const IconEncerrarParticipacao = (p) => <svg {...iconProps} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
const IconImprimir = (p) => <svg {...iconProps} {...p}><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" /></svg>
const IconHistorico = (p) => <svg {...iconProps} {...p}><path d="M4 19V9M11 19V4M18 19v-7" /></svg>
const IconDesfechos = (p) => <svg {...iconProps} {...p}><path d="M12 3l8 4v5c0 5-3.4 7.9-8 9-4.6-1.1-8-4-8-9V7l8-4Z" /><path d="M9 12l2 2 4-4" /></svg>
const IconProfissionais = (p) => <svg {...iconProps} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20v-1.5A4 4 0 0 1 7 14.5h4a4 4 0 0 1 4 4V20M17 8h4M19 6v4" /></svg>
const IconEncerrarPlantonista = (p) => <svg {...iconProps} {...p}><path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
const IconConta = (p) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
const IconAjuda = (p) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1.1-1 1.7" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></svg>
const IconSair = (p) => <svg {...iconProps} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>

// Sidebar persistente (padrão Vitaloop) que substitui os dois menus dropdown
// separados de antes (☰ operações + conta). Tudo concentrado aqui, agrupado
// por assunto — ver proposta de design aprovada na conversa.
export default function Sidebar({
  navOpen,
  onFecharNav,
  enfermeiro,
  isAdmin,
  podeAdministrar,
  plantaoAberto,
  telaAtual,
  onNavegar,
  onEncerrarPlantao,
  encerrandoPlantao,
  onLogout,
}) {
  const [tema, setTema] = useState(lerTemaSalvo)

  function navegarE(tela) {
    onNavegar(tela)
    onFecharNav()
  }

  function trocarTema() {
    setTema(alternarTema())
  }

  return (
    <>
      {navOpen && <div className="sidebar-scrim" onClick={onFecharNav} />}
      <aside className={`sidebar ${navOpen ? 'aberta' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-dot" />
          <div>
            <span className="sidebar-brand-t1">Passagem de Plantão</span>
            <span className="sidebar-brand-t2">UPA 24h · Breves</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {plantaoAberto && (
            <div className="sidebar-grupo">
              <h4>Plantão</h4>
              <button className={`sidebar-item ${telaAtual === 'painel' ? 'ativo' : ''}`} onClick={() => navegarE('painel')}>
                <IconPainel />Painel
              </button>
              <button className={`sidebar-item ${telaAtual === 'pendencias' ? 'ativo' : ''}`} onClick={() => navegarE('pendencias')}>
                <IconPendencias />Pendências
              </button>
              <button className={`sidebar-item ${telaAtual === 'compartilhar' ? 'ativo' : ''}`} onClick={() => navegarE('compartilhar')}>
                <IconCompartilhar />Compartilhar
              </button>
              {!isAdmin && (
                <button className="sidebar-item perigo" onClick={() => { onEncerrarPlantao(); onFecharNav() }} disabled={encerrandoPlantao}>
                  <IconEncerrarParticipacao />{encerrandoPlantao ? 'Encerrando...' : 'Encerrar minha participação'}
                </button>
              )}
            </div>
          )}

          {plantaoAberto && (
            <div className="sidebar-grupo">
              <h4>Documentos</h4>
              <button className={`sidebar-item ${telaAtual === 'print1' ? 'ativo' : ''}`} onClick={() => navegarE('print1')}>
                <IconImprimir />Vermelha + Internação
              </button>
              <button className={`sidebar-item ${telaAtual === 'print2' ? 'ativo' : ''}`} onClick={() => navegarE('print2')}>
                <IconImprimir />Pediátrico + Observação
              </button>
            </div>
          )}

          <div className="sidebar-grupo">
            <h4>Indicadores</h4>
            <button className={`sidebar-item ${telaAtual === 'historico' ? 'ativo' : ''}`} onClick={() => navegarE('historico')}>
              <IconHistorico />Histórico de plantões
            </button>
            <button className={`sidebar-item ${telaAtual === 'altas' ? 'ativo' : ''}`} onClick={() => navegarE('altas')}>
              <IconDesfechos />Desfechos
            </button>
          </div>

          {podeAdministrar && (
            <div className="sidebar-grupo">
              <h4>Administração</h4>
              <button className={`sidebar-item ${telaAtual === 'profissionais' ? 'ativo' : ''}`} onClick={() => navegarE('profissionais')}>
                <IconProfissionais />Gerenciar profissionais
              </button>
              <button className={`sidebar-item ${telaAtual === 'equipe' ? 'ativo' : ''}`} onClick={() => navegarE('equipe')}>
                <IconEncerrarPlantonista />Encerrar plantonista
              </button>
            </div>
          )}

          <div className="sidebar-grupo">
            <h4>Conta</h4>
            <button className={`sidebar-item ${telaAtual === 'conta' ? 'ativo' : ''}`} onClick={() => navegarE('conta')}>
              <IconConta />Minha conta
            </button>
            <button className={`sidebar-item ${telaAtual === 'ajuda' ? 'ativo' : ''}`} onClick={() => navegarE('ajuda')}>
              <IconAjuda />Ajuda
            </button>
            <button className="sidebar-item perigo" onClick={onLogout}>
              <IconSair />Sair
            </button>
          </div>
        </nav>

        <div className="sidebar-rodape">
          <span className="sidebar-nome">
            {enfermeiro?.nome_exibicao || enfermeiro?.nome}
            {isAdmin && <span className="sidebar-badge-admin">ADMIN</span>}
          </span>
          <button className="sidebar-tema-btn" onClick={trocarTema}>
            {tema === 'escuro' ? '☾ Tema escuro' : '☀ Tema claro'}
          </button>
        </div>
      </aside>
    </>
  )
}
