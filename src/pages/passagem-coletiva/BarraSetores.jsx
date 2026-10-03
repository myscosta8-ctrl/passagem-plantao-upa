// Barra do topo: setores (com ocupação), modo de vista, filtros, recolher/conferir todos,
// imprimir e compartilhar. Duas versões: tela nova (pep_beta) e a anterior.
export default function BarraSetores({ novaUI, plantao, setoresVisiveis, leitos, pacientesPorLeito, setorAtivo, escolherSetor, modo, setModo, filtro, setFiltro, contagens, recolhidos, alternarTodos, conferirTodos, conferindoTodos, onImprimir, onCompartilhar, menuImprimir, setMenuImprimir }) {
  return (
    <>
      {novaUI ? (
      <div className="sector-control-card pcv2">
        <div className="pcv2-linha">
          <div className="sector-nav-pills">
            {setoresVisiveis.map((s) => {
              const ls = leitos.filter((l) => l.setor_id === s.id)
              const ocupados = ls.filter((l) => pacientesPorLeito[l.id]).length
              return (
                <button key={s.id} type="button" className={`sec-pill ${setorAtivo?.id === s.id ? 'active' : ''}`} onClick={() => escolherSetor(s.id)}>
                  <span>{s.nome}</span>
                  <span className="badge-count">{ocupados}/{ls.length}</span>
                </button>
              )
            })}
          </div>
          <div className="view-toggle pcv2-vistas">
            <button type="button" className={`vt-btn ${modo === 'cards' ? 'active' : ''}`} onClick={() => setModo('cards')} title="Grade" aria-label="Grade"><i className="ph ph-squares-four" /></button>
            <button type="button" className={`vt-btn ${modo === 'table' ? 'active' : ''}`} onClick={() => setModo('table')} title="Tabela" aria-label="Tabela"><i className="ph ph-table" /></button>
            <button type="button" className={`vt-btn ${modo === 'focus' ? 'active' : ''}`} onClick={() => setModo('focus')} title="Detalhe" aria-label="Detalhe"><i className="ph ph-user" /></button>
          </div>
        </div>
        <div className="pcv2-linha">
          <div className="filter-row">
            <button type="button" className={`filter-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
            <button type="button" className={`filter-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com pendências ({contagens.pendencias})</button>
            <button type="button" className={`filter-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A conferir ({contagens['a-conferir']})</button>
            <button type="button" className={`filter-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
          </div>
          <div className="pcv2-acoes">
            <button type="button" className="btn-compact-tool pcv2-ic" onClick={alternarTodos} title={recolhidos.size > 0 ? 'Expandir todos' : 'Recolher todos'} aria-label={recolhidos.size > 0 ? 'Expandir todos' : 'Recolher todos'}>
              <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} />
            </button>
            <button type="button" className="btn-compact-tool" onClick={conferirTodos} disabled={conferindoTodos || contagens['a-conferir'] === 0}>
              <i className="ph ph-check-square" /> {conferindoTodos ? 'Conferindo...' : 'Conferir todos'}
            </button>
            {onImprimir && (
              <div className="pcv2-menu">
                <button type="button" className="btn-compact-tool primary" onClick={() => setMenuImprimir((v) => !v)} aria-expanded={menuImprimir}>
                  <i className="ph ph-printer" /> Imprimir <i className="ph ph-caret-down" />
                </button>
                {menuImprimir && (
                  <div className="pcv2-menu-lista" onMouseLeave={() => setMenuImprimir(false)}>
                    <button type="button" onClick={() => { setMenuImprimir(false); onImprimir('print1') }}>Sala Vermelha e Internação</button>
                    <button type="button" onClick={() => { setMenuImprimir(false); onImprimir('print2') }}>Pediatria e Observação</button>
                  </div>
                )}
              </div>
            )}
            {onCompartilhar && (
              <button type="button" className="btn-compact-tool pcv2-ic" onClick={onCompartilhar} title="Compartilhar plantão (resumo para WhatsApp)" aria-label="Compartilhar plantão">
                <i className="ph ph-share-network" />
              </button>
            )}
          </div>
        </div>
      </div>
      ) : (
      <div className="sector-control-card">
        <div className="scc-top">
          <div className="sector-nav-pills">
            {setoresVisiveis.map((s) => {
              const ls = leitos.filter((l) => l.setor_id === s.id)
              const ocupados = ls.filter((l) => pacientesPorLeito[l.id]).length
              return (
                <button key={s.id} type="button" className={`sec-pill ${setorAtivo?.id === s.id ? 'active' : ''}`} onClick={() => escolherSetor(s.id)}>
                  <span>{s.nome}</span>
                  <span className="badge-count">{ocupados}/{ls.length}</span>
                </button>
              )
            })}
          </div>

          <div className="scc-actions">
            <button type="button" className="btn-compact-tool" onClick={alternarTodos} title="Recolher ou expandir todos os leitos">
              <i className={`ph ${recolhidos.size > 0 ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'}`} /> {recolhidos.size > 0 ? 'Expandir Todos' : 'Recolher Todos'}
            </button>
            <button type="button" className="btn-compact-tool" onClick={conferirTodos} disabled={conferindoTodos || contagens['a-conferir'] === 0}>
              <i className="ph ph-check-square" /> {conferindoTodos ? 'Conferindo...' : 'Conferir Todos'}
            </button>
            {onImprimir && (
              <>
                <button type="button" className="btn-compact-tool primary" onClick={() => onImprimir('print1')}>
                  <i className="ph ph-printer" /> Imprimir Sala Vermelha e Internação
                </button>
                <button type="button" className="btn-compact-tool primary" onClick={() => onImprimir('print2')}>
                  <i className="ph ph-printer" /> Imprimir Pediatria e Observação
                </button>
              </>
            )}
            {onCompartilhar && (
              <button type="button" className="btn-compact-tool" onClick={onCompartilhar} title="Gerar o resumo do plantão para enviar no WhatsApp">
                <i className="ph ph-share-network" /> Compartilhar Plantão
              </button>
            )}
            <div className="view-toggle">
              <button type="button" className={`vt-btn ${modo === 'cards' ? 'active' : ''}`} onClick={() => setModo('cards')}><i className="ph ph-squares-four" /> Grade</button>
              <button type="button" className={`vt-btn ${modo === 'table' ? 'active' : ''}`} onClick={() => setModo('table')}><i className="ph ph-table" /> Tabela</button>
              <button type="button" className={`vt-btn ${modo === 'focus' ? 'active' : ''}`} onClick={() => setModo('focus')}><i className="ph ph-user" /> Detalhe</button>
            </div>
          </div>
        </div>

        <div className="scc-meta">
          <div className="team-flow">
            {plantao?.turno && <span>Turno: <strong>{plantao.turno}</strong></span>}
          </div>
          <div className="filter-row">
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginRight: 4 }}>Filtro:</span>
            <button type="button" className={`filter-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({contagens.todos})</button>
            <button type="button" className={`filter-chip ${filtro === 'pendencias' ? 'active' : ''}`} onClick={() => setFiltro('pendencias')}>Com Pendências ({contagens.pendencias})</button>
            <button type="button" className={`filter-chip ${filtro === 'a-conferir' ? 'active' : ''}`} onClick={() => setFiltro('a-conferir')}>A Conferir ({contagens['a-conferir']})</button>
            <button type="button" className={`filter-chip ${filtro === 'conferidos' ? 'active' : ''}`} onClick={() => setFiltro('conferidos')}>Conferidos ({contagens.conferidos})</button>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
