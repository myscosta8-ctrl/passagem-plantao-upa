import { useState } from 'react'
import { lerTemaSalvo, alternarTema } from '../lib/theme'
import './Header.css'

// Mapa tela -> grupo, pra saber qual aba de topo fica destacada e qual
// fileira de sub-abas mostrar quando a pessoa já está numa tela do grupo.
const GRUPO_DA_TELA = {
  painel: 'plantao',
  pendencias: 'plantao',
  compartilhar: 'plantao',
  print1: 'documentos',
  print2: 'documentos',
  historico: 'indicadores',
  altas: 'indicadores',
  profissionais: 'administracao',
  equipe: 'administracao',
  conta: 'conta',
  ajuda: 'conta',
}

function iniciais(nome) {
  if (!nome) return '?'
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase()
}

// Cabeçalho + navegação em duas camadas (módulo → sub-aba), no lugar da
// sidebar-gaveta anterior — ver proposta de redesign aprovada na conversa.
export default function Header({
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
  const grupoDaTelaAtual = GRUPO_DA_TELA[telaAtual] || 'plantao'
  const [grupoAberto, setGrupoAberto] = useState(grupoDaTelaAtual)

  function trocarTema() {
    setTema(alternarTema())
  }

  function irPara(tela) {
    setGrupoAberto(GRUPO_DA_TELA[tela] || grupoAberto)
    onNavegar(tela)
  }

  function abrirGrupo(grupo) {
    setGrupoAberto(grupo.chave)
    if (GRUPO_DA_TELA[telaAtual] !== grupo.chave) {
      onNavegar(grupo.telaDefault)
    }
  }

  const GRUPOS = [
    { chave: 'plantao', rotulo: 'Painel', telaDefault: 'painel', mostrar: plantaoAberto },
    { chave: 'documentos', rotulo: 'Documentos', telaDefault: 'print1', mostrar: plantaoAberto },
    { chave: 'indicadores', rotulo: 'Indicadores', telaDefault: 'historico', mostrar: true },
    { chave: 'administracao', rotulo: 'Administração', telaDefault: 'profissionais', mostrar: plantaoAberto && podeAdministrar },
    { chave: 'conta', rotulo: 'Conta', telaDefault: 'conta', mostrar: true },
  ].filter((g) => g.mostrar)

  const SUB_ABAS = {
    plantao: [
      { tela: 'painel', rotulo: 'Painel' },
      { tela: 'pendencias', rotulo: 'Pendências' },
      { tela: 'compartilhar', rotulo: 'Compartilhar' },
    ],
    documentos: [
      { tela: 'print1', rotulo: 'Vermelha + Internação' },
      { tela: 'print2', rotulo: 'Pediátrico + Observação' },
    ],
    indicadores: [
      { tela: 'historico', rotulo: 'Histórico de plantões' },
      { tela: 'altas', rotulo: 'Desfechos' },
    ],
    administracao: [
      { tela: 'profissionais', rotulo: 'Gerenciar profissionais' },
      { tela: 'equipe', rotulo: 'Encerrar plantonista' },
    ],
    conta: [
      { tela: 'conta', rotulo: 'Minha conta' },
      { tela: 'ajuda', rotulo: 'Ajuda' },
    ],
  }

  const nome = enfermeiro?.nome_exibicao || enfermeiro?.nome

  return (
    <header className="ph-header no-print">
      <div className="ph-topo">
        <div className="ph-marca">
          <span className="ph-marca-icone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </span>
          <div>
            <span className="ph-marca-t1">Passagem de Plantão</span>
            <span className="ph-marca-t2">UPA 24h · Breves</span>
          </div>
        </div>

        <div className="ph-conta">
          {plantaoAberto && plantao && (
            <span className="ph-turno">{plantao.turno} · {new Date(plantao.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          )}
          {plantaoAberto && !isAdmin && (
            <button className="ph-encerrar-btn" onClick={onEncerrarPlantao} disabled={encerrandoPlantao}>
              {encerrandoPlantao ? 'Encerrando...' : 'Encerrar participação'}
            </button>
          )}
          <button className="ph-tema-btn" onClick={trocarTema} aria-label="Alternar tema">
            {tema === 'escuro' ? '☾' : '☀'}
          </button>
          <div className="ph-usuario">
            <span className="ph-usuario-nome">
              {nome}
              {isAdmin && <span className="ph-badge-admin">ADMIN</span>}
            </span>
          </div>
          <div className="ph-avatar">{iniciais(nome)}</div>
        </div>
      </div>

      <nav className="ph-abas-topo">
        {GRUPOS.map((g) => (
          <button
            key={g.chave}
            className={`ph-aba-topo ${grupoAberto === g.chave ? 'ativa' : ''}`}
            onClick={() => abrirGrupo(g)}
          >
            {g.rotulo}
          </button>
        ))}
      </nav>

      {SUB_ABAS[grupoAberto] && (
        <nav className="ph-abas-sub">
          {SUB_ABAS[grupoAberto].map((s) => (
            <button
              key={s.tela}
              className={`ph-aba-sub ${telaAtual === s.tela ? 'ativa' : ''}`}
              onClick={() => irPara(s.tela)}
            >
              {s.rotulo}
            </button>
          ))}
          {grupoAberto === 'conta' && (
            <button className="ph-aba-sub perigo" onClick={onLogout}>Sair</button>
          )}
        </nav>
      )}
    </header>
  )
}
