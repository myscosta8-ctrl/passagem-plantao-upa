import { useState } from 'react'
import { lerTemaSalvo, alternarTema } from '../lib/theme'
import './Sidebar.css'

function iniciais(nome) {
  if (!nome) return '?'
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase()
}

export default function Sidebar({
  enfermeiro,
  isAdmin,
  podeAdministrar,
  plantaoAberto,
  plantao,
  telaAtual,
  onNavegar,
  onEncerrarPlantao,
  encerrandoPlantao,
  onLogout,
}) {
  const [tema, setTema] = useState(lerTemaSalvo)
  const [fechado, setFechado] = useState(() => {
    try {
      return localStorage.getItem('sidebar_fechado') === 'true'
    } catch {
      return false
    }
  })
  const [abertoMobile, setAbertoMobile] = useState(false)

  function toggleSidebar() {
    setFechado((prev) => {
      const novo = !prev
      try {
        localStorage.setItem('sidebar_fechado', String(novo))
      } catch {}
      return novo
    })
  }


  function trocarTema() {
    setTema(alternarTema())
  }

  const nome = enfermeiro?.nome_exibicao || enfermeiro?.nome || 'Profissional'

  return (
    <>
      {/* Hambúrguer fixo — em telas pequenas é o único elemento do menu
          visível por padrão; a sidebar inteira fica escondida até abrir. */}
      <button
        type="button"
        className="sidebar-hamburguer-mobile"
        onClick={() => setAbertoMobile(true)}
        title="Abrir menu"
        aria-label="Abrir menu"
      >
        <i className="ph ph-list" />
      </button>

      {abertoMobile && <div className="sidebar-backdrop-mobile" onClick={() => setAbertoMobile(false)} />}

      <aside className={`sidebar ${fechado ? 'fechado' : ''} ${abertoMobile ? 'aberto-mobile' : ''}`} id="sidebar">
      {/* Topo com botão hambúrguer */}
      <div className="sidebar-topo">
        <button
          type="button"
          className="sidebar-hamburguer"
          onClick={() => (abertoMobile ? setAbertoMobile(false) : toggleSidebar())}
          title={fechado ? 'Expandir menu' : 'Recolher menu'}
          aria-label="Alternar menu"
        >
          <i className="ph ph-list" />
        </button>
        <div className="sidebar-marca">
          <span className="sidebar-marca-titulo">Passagem de Plantão</span>
          <span className="sidebar-marca-sub">UPA 24h · Breves</span>
        </div>
      </div>

      {/* Corpo de Navegação */}
      <nav className="sidebar-corpo" onClick={() => setAbertoMobile(false)}>
        {/* GRUPO ASSISTENCIAL */}
        <div className="sidebar-grupo-label">Assistencial</div>
        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'painel' ? 'ativo' : ''}`}
          onClick={() => onNavegar('painel')}
          title="Painel de Leitos"
        >
          <i className="ph ph-bed sidebar-item-icone" />
          <span className="sidebar-item-texto">Painel de Leitos</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'recepcao' ? 'ativo' : ''}`}
          onClick={() => onNavegar('recepcao')}
          title="Recepção"
        >
          <i className="ph ph-user-plus sidebar-item-icone" />
          <span className="sidebar-item-texto">Recepção</span>
          <span className="sidebar-item-tag-novo">NOVO</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'historico' ? 'ativo' : ''}`}
          onClick={() => onNavegar('historico')}
          title="Histórico de Plantões"
        >
          <i className="ph ph-clock-counter-clockwise sidebar-item-icone" />
          <span className="sidebar-item-texto">Histórico</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'altas' ? 'ativo' : ''}`}
          onClick={() => onNavegar('altas')}
          title="Desfechos e Altas"
        >
          <i className="ph ph-check-circle sidebar-item-icone" />
          <span className="sidebar-item-texto">Desfechos</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'pendencias' ? 'ativo' : ''}`}
          onClick={() => onNavegar('pendencias')}
          title="Pendências do Plantão"
        >
          <i className="ph ph-hourglass sidebar-item-icone" />
          <span className="sidebar-item-texto">Pendências</span>
        </button>

        {plantaoAberto && (
          <>
            <button
              type="button"
              className={`sidebar-item ${telaAtual === 'print1' ? 'ativo' : ''}`}
              onClick={() => onNavegar('print1')}
              title="Imprimir: Vermelha + Internação"
            >
              <i className="ph ph-printer sidebar-item-icone" />
              <span className="sidebar-item-texto">Imprimir Vermelha</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${telaAtual === 'print2' ? 'ativo' : ''}`}
              onClick={() => onNavegar('print2')}
              title="Imprimir: Pediátrico + Observação"
            >
              <i className="ph ph-file-text sidebar-item-icone" />
              <span className="sidebar-item-texto">Imprimir Observação</span>
            </button>
          </>
        )}

        {/* GRUPO INDICADORES */}
        <div className="sidebar-grupo-label">Indicadores</div>
        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'indicadoresClinicos' ? 'ativo' : ''}`}
          onClick={() => onNavegar('indicadoresClinicos')}
          title="Indicadores Clínicos"
        >
          <i className="ph ph-chart-bar sidebar-item-icone" />
          <span className="sidebar-item-texto">Indicadores Clínicos</span>
          <span className="sidebar-item-tag-novo">NOVO</span>
        </button>

        {/* GRUPO EQUIPE */}
        <div className="sidebar-grupo-label">Equipe</div>
        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'compartilhar' ? 'ativo' : ''}`}
          onClick={() => onNavegar('compartilhar')}
          title="Compartilhar Plantão"
        >
          <i className="ph ph-chat-circle-text sidebar-item-icone" />
          <span className="sidebar-item-texto">Compartilhar Plantão</span>
        </button>

        {podeAdministrar && (
          <>
            <button
              type="button"
              className={`sidebar-item ${telaAtual === 'equipe' ? 'ativo' : ''}`}
              onClick={() => onNavegar('equipe')}
              title="Painel de Equipe"
            >
              <i className="ph ph-users sidebar-item-icone" />
              <span className="sidebar-item-texto">Painel de Equipe</span>
            </button>

            <button
              type="button"
              className={`sidebar-item ${telaAtual === 'profissionais' ? 'ativo' : ''}`}
              onClick={() => onNavegar('profissionais')}
              title="Gerenciar Profissionais"
            >
              <i className="ph ph-identification-badge sidebar-item-icone" />
              <span className="sidebar-item-texto">Profissionais</span>
            </button>
          </>
        )}

        {/* GRUPO CONTA / SISTEMA */}
        <div className="sidebar-grupo-label">Conta</div>
        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'conta' ? 'ativo' : ''}`}
          onClick={() => onNavegar('conta')}
          title="Minha Conta"
        >
          <i className="ph ph-gear-six sidebar-item-icone" />
          <span className="sidebar-item-texto">Minha Conta</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${telaAtual === 'ajuda' ? 'ativo' : ''}`}
          onClick={() => onNavegar('ajuda')}
          title="Ajuda e Documentação"
        >
          <i className="ph ph-question sidebar-item-icone" />
          <span className="sidebar-item-texto">Ajuda</span>
        </button>

        <button
          type="button"
          className="sidebar-item"
          onClick={trocarTema}
          title={`Tema: ${tema === 'escuro' ? 'Escuro' : 'Claro'}`}
        >
          <i className={`ph sidebar-item-icone ${tema === 'escuro' ? 'ph-moon' : 'ph-sun'}`} />
          <span className="sidebar-item-texto">{tema === 'escuro' ? 'Tema Escuro' : 'Tema Claro'}</span>
        </button>
      </nav>

      {/* Rodapé com Informações do Usuário e Sair */}
      <div className="sidebar-rodape">
        <div className="sidebar-user-bloco">
          <div className="sidebar-avatar">{iniciais(nome)}</div>
          <div className="sidebar-user-detalhes">
            <span className="sidebar-user-nome">
              {nome} {isAdmin && '· Admin'}
            </span>
            {plantaoAberto && plantao && (
              <span className="sidebar-user-turno">
                {plantao.turno} · {new Date(plantao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        <div className="sidebar-botoes-rodape">
          {plantaoAberto && !isAdmin && (
            <button
              type="button"
              className="sidebar-btn-acao"
              onClick={onEncerrarPlantao}
              disabled={encerrandoPlantao}
              title="Encerrar participação no plantão"
            >
              <i className="ph ph-sign-out" />
              <span className="sidebar-btn-encerrar-texto">
                {encerrandoPlantao ? 'Saindo...' : 'Encerrar turno'}
              </span>
            </button>
          )}

          <button
            type="button"
            className="sidebar-btn-acao"
            onClick={onLogout}
            title="Sair do sistema"
          >
            <i className="ph ph-sign-out" />
            <span className="sidebar-btn-encerrar-texto">Sair</span>
          </button>
        </div>
      </div>
      </aside>
    </>
  )
}
