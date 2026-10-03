import { usePainel } from './PainelContext'
import { useState } from 'react'

// O setor é escolhido nos botões do topo do painel (PainelResumo); aqui ficam busca, status e vista.
export default function PainelControles() {
  const {
    buscaTabela,
    setBuscaTabela,
    statusFiltro,
    setStatusFiltro,
    visualizacao,
    setVisualizacao,
  } = usePainel()

  const [filtroAberto, setFiltroAberto] = useState(false)

  return (
    <div className="painel-controls">
      <div className="search-bar">
        <i className="ph ph-magnifying-glass" />
        <input type="text" className="search-input" placeholder="Buscar paciente ou leito..." value={buscaTabela} onChange={(e) => setBuscaTabela(e.target.value)} />
      </div>
      <div style={{ position: 'relative' }}>
        <button type="button" className={`control-btn ${filtroAberto ? 'active' : ''}`} onClick={() => setFiltroAberto((v) => !v)}>
          <i className="ph ph-funnel" /> Filtrar
        </button>
        {filtroAberto && (
          <div className="painel-filtro-dropdown">
            <div className="tabela-filtro-campo">
              <label>Status</label>
              <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                <option value="">Todos</option>
                <option value="ocupado">Ocupados</option>
                <option value="vazio">Vazios</option>
                <option value="internado">Internado</option>
                <option value="observacao">Em observação</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        className={`control-btn ${visualizacao === 'cards' ? 'active' : ''}`}
        onClick={() => setVisualizacao('cards')}
      >
        <i className="ph ph-squares-four" /> Cards
      </button>
      <button
        type="button"
        className={`control-btn ${visualizacao === 'tabela' ? 'active' : ''}`}
        onClick={() => setVisualizacao('tabela')}
      >
        <i className="ph ph-list-dashes" /> Lista
      </button>
    </div>
  )
}
