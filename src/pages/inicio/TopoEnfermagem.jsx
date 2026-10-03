import { TITULO_TELA, iniciais } from './regrasInicio'

// Topo da interface anterior da enfermagem: menu lateral, trilha, relógio e avatar.
export default function TopoEnfermagem({ tela, horaFormatada, enfermeiro, setSidebarAberta }) {
  return (
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
  )
}
