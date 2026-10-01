import { useEffect, useRef, useState } from 'react'

// Abas numa linha só. Quando não cabem na largura da tela, aparecem setas
// (‹ ›) para deslizar as abas para a esquerda e para a direita — sem barra de rolagem.
// A aba ativa é trazida para a área visível sempre que muda.
export default function AbasRolaveis({ children, ativa }) {
  const ref = useRef(null)
  const [setas, setSetas] = useState({ esq: false, dir: false })

  function medir() {
    const el = ref.current
    if (!el) return
    const sobra = el.scrollWidth - el.clientWidth
    setSetas({ esq: sobra > 1 && el.scrollLeft > 1, dir: sobra > 1 && el.scrollLeft < sobra - 1 })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    medir()
    el.addEventListener('scroll', medir, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null
    ro?.observe(el)
    window.addEventListener('resize', medir)
    return () => { el.removeEventListener('scroll', medir); ro?.disconnect(); window.removeEventListener('resize', medir) }
  }, [])

  // Aba ativa sempre visível (sem mexer na rolagem vertical da página).
  useEffect(() => {
    const el = ref.current
    const atual = el?.querySelector('.tab-btn.active')
    if (!el || !atual) return
    const ini = atual.offsetLeft - el.offsetLeft
    const fim = ini + atual.offsetWidth
    if (ini < el.scrollLeft) el.scrollTo({ left: ini - 8, behavior: 'smooth' })
    else if (fim > el.scrollLeft + el.clientWidth) el.scrollTo({ left: fim - el.clientWidth + 8, behavior: 'smooth' })
    medir()
  }, [ativa])

  const mover = (sentido) => {
    const el = ref.current
    if (el) el.scrollBy({ left: sentido * Math.max(160, el.clientWidth * 0.6), behavior: 'smooth' })
  }

  return (
    <div className={`abas-rolagem${setas.esq ? ' tem-esq' : ''}${setas.dir ? ' tem-dir' : ''}`}>
      {(setas.esq || setas.dir) && (
        <button type="button" className="abas-seta" onClick={() => mover(-1)} disabled={!setas.esq} aria-label="Ver abas anteriores" title="Abas anteriores">
          <i className="ph ph-caret-left" />
        </button>
      )}
      <div className="clinical-tabs" ref={ref}>{children}</div>
      {(setas.esq || setas.dir) && (
        <button type="button" className="abas-seta" onClick={() => mover(1)} disabled={!setas.dir} aria-label="Ver próximas abas" title="Próximas abas">
          <i className="ph ph-caret-right" />
        </button>
      )}
    </div>
  )
}
