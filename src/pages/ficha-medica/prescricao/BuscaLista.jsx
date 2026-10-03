import { useState } from 'react'
import { filtrarOpcoes, normalizar } from './catalogoCuidados'

// Campo de busca que abre uma lista agrupada logo abaixo (dentro da página, sem cobrir nada). Clique (ou ↑↓ + Enter) põe/tira o item;
// a lista continua aberta para escolher vários. Opcional: texto livre quando não estiver na lista.
export default function BuscaLista({ opcoes, escolhidos, onEscolher, onTextoLivre, placeholder, rotulo }) {
  const [termo, setTermo] = useState('')
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const lista = filtrarOpcoes(opcoes, termo)
  const exato = lista.some((o) => normalizar(o.texto) === normalizar(termo))
  const livre = onTextoLivre && termo.trim() && !exato
  const total = lista.length + (livre ? 1 : 0)

  function escolher(i) {
    if (i < lista.length) onEscolher(lista[i])
    else if (livre) onTextoLivre(termo.trim())
    setTermo('')
    setAtivo(0)
  }

  function teclar(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAberto(true); setAtivo((a) => Math.min(a + 1, total - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (aberto && total) escolher(Math.min(ativo, total - 1)) }
    else if (e.key === 'Escape') setAberto(false)
  }

  return (
    <div className="bl-wrap">
      <div className="bl-busca">
        <i className="ph ph-magnifying-glass" />
        <input
          type="text"
          className="form-control"
          value={termo}
          placeholder={placeholder}
          aria-label={rotulo || placeholder}
          autoComplete="off"
          onChange={(e) => { setTermo(e.target.value); setAberto(true); setAtivo(0) }}
          onFocus={() => setAberto(true)}
          onBlur={() => setAberto(false)}
          onKeyDown={teclar}
        />
        <button type="button" className="bl-abrir" tabIndex={-1} aria-label={aberto ? 'Fechar lista' : 'Abrir lista'}
          onMouseDown={(e) => { e.preventDefault(); setAberto((a) => !a) }}>
          <i className={`ph ${aberto ? 'ph-caret-up' : 'ph-caret-down'}`} />
        </button>
      </div>
      {aberto && (
        <div className="bl-lista" role="listbox">
          {lista.map((o, i) => {
            const marcado = escolhidos.has(o.chave)
            return (
              <div key={o.chave}>
                {(i === 0 || lista[i - 1].grupo !== o.grupo) && <div className="bl-grupo">{o.grupo}</div>}
                <button type="button" role="option" aria-selected={marcado}
                  className={`bl-item${i === ativo ? ' ativo' : ''}${marcado ? ' marcado' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); escolher(i) }}
                  onMouseEnter={() => setAtivo(i)}>
                  <i className={`ph ${marcado ? 'ph-check-square' : 'ph-square'}`} />
                  <span className="bl-texto">{o.texto}</span>
                  {o.extra && <span className="bl-extra">{o.extra}</span>}
                </button>
              </div>
            )
          })}
          {livre && (
            <button type="button" className={`bl-item bl-livre${ativo === lista.length ? ' ativo' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); escolher(lista.length) }}
              onMouseEnter={() => setAtivo(lista.length)}>
              <i className="ph ph-plus" />
              <span className="bl-texto">Adicionar “{termo.trim()}” como texto livre</span>
              <span className="bl-extra">Enter</span>
            </button>
          )}
          {total === 0 && <div className="bl-vazio">Nada encontrado.</div>}
        </div>
      )}
    </div>
  )
}
