import { usePainel } from './PainelContext'
import { useState } from 'react'

export default function PainelControles({
  setoresVisiveis,
  busca,
  onBusca,
  setorFiltro,
  onSetorFiltro,
  statusFiltro,
  onStatusFiltro,
  visualizacao,
  onVisualizacao,
}) {
  const [filtroAberto, setFiltroAberto] = useState(false)

  return (
    <div className="painel-controls">
      <div className="search-bar">
        <i className="ph ph-magnifying-glass" />
        <input type="text" className="search-input" placeholder="Buscar paciente ou leito..." value={busca} onChange={(e) => onBusca(e.target.value)} />
      </div>
      <div style={{ position: 'relative' }}>
        <button type="button" className={`control-btn ${filtroAberto ? 'active' : ''}`} onClick={() => setFiltroAberto((v) => !v)}>
          <i className="ph ph-funnel" /> Filtrar
        </button>
        {filtroAberto && (
          <div className="painel-filtro-dropdown">
            <div className="tabela-filtro-campo">
              <label>Setor</label>
              <select value={setorFiltro} onChange={(e) => onSetorFiltro(e.target.value)}>
                <option value="">Todos os setores</option>
                {setoresVisiveis.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="tabela-filtro-campo">
              <label>Status</label>
              <select value={statusFiltro} onChange={(e) => onStatusFiltro(e.target.value)}>
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
        onClick={() => onVisualizacao('cards')}
      >
        <i className="ph ph-squares-four" /> Cards
      </button>
      <button
        type="button"
        className={`control-btn ${visualizacao === 'tabela' ? 'active' : ''}`}
        onClick={() => onVisualizacao('tabela')}
      >
        <i className="ph ph-list-dashes" /> Lista
      </button>
    </div>
  )
}
