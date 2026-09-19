import { useState } from 'react'
import { lerTemaSalvo, alternarTema } from '../lib/theme'
import './Header.css'

const iconProps = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
}

const IconPainel = (p) => <svg {...iconProps} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
const IconImprimir = (p) => <svg {...iconProps} {...p}><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" /></svg>
const IconHistorico = (p) => <svg {...iconProps} {...p}><path d="M4 19V9M11 19V4M18 19v-7" /></svg>
const IconProfissionais = (p) => <svg {...iconProps} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20v-1.5A4 4 0 0 1 7 14.5h4a4 4 0 0 1 4 4V20M17 8h4M19 6v4" /></svg>
const IconConta = (p) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
const IconPendencias = (p) => <svg {...iconProps} {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 2h6v3H9zM8 11h8M8 15h5" /></svg>
const IconCompartilhar = (p) => <svg {...iconProps} {...p}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" /></svg>
const IconDesfechos = (p) => <svg {...iconProps} {...p}><path d="M12 3l8 4v5c0 5-3.4 7.9-8 9-4.6-1.1-8-4-8-9V7l8-4Z" /><path d="M9 12l2 2 4-4" /></svg>
const IconEncerrarPlantonista = (p) => <svg {...iconProps} {...p}><path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
const IconAjuda = (p) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1.1-1 1.7" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></svg>
const IconIndicadoresClinicos = (p) => <svg {...iconProps} {...p}><path d="M4 20V10M10 20V4M16 20v-7M4 20h16" /></svg>

const ICONE_GRUPO = { plantao: IconPainel, documentos: IconImprimir, indicadores: IconHistorico, administracao: IconProfissionais, conta: IconConta }
const ICONE_SUB = {
  painel: IconPainel, pendencias: IconPendencias, compartilhar: IconCompartilhar,
  print1: IconImprimir, print2: IconImprimir,
  historico: IconHistorico, altas: IconDesfechos, indicadoresClinicos: IconIndicadoresClinicos,
  profissionais: IconProfissionais, equipe: IconEncerrarPlantonista,
  conta: IconConta, ajuda: IconAjuda,
}

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
  indicadoresClinicos: 'indicadores',
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
      { tela: 'indicadoresClinicos', rotulo: 'Indicadores Clínicos' },
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
        {GRUPOS.map((g) => {
          const Icone = ICONE_GRUPO[g.chave]
          return (
            <button
              key={g.chave}
              className={`ph-aba-topo ${grupoAberto === g.chave ? 'ativa' : ''}`}
              onClick={() => abrirGrupo(g)}
            >
              <Icone />
              {g.rotulo}
            </button>
          )
        })}
      </nav>

      {SUB_ABAS[grupoAberto] && (
        <nav className="ph-abas-sub">
          {SUB_ABAS[grupoAberto].map((s) => {
            const Icone = ICONE_SUB[s.tela]
            return (
              <button
                key={s.tela}
                className={`ph-aba-sub ${telaAtual === s.tela ? 'ativa' : ''}`}
                onClick={() => irPara(s.tela)}
              >
                <Icone />
                {s.rotulo}
              </button>
            )
          })}
          {grupoAberto === 'conta' && (
            <button className="ph-aba-sub perigo" onClick={onLogout}>
              <svg {...iconProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sair
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
