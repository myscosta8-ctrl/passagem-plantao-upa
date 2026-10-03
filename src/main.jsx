import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/ibm-plex-sans/400.css' // letra dos impressos embutida (imprime igual sem internet)
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import './index.css'
import './responsivo.css'
import './modais.css'
import './mobile.css'
import './subabas.css'
import './prontuario.css'
import './ajustes-responsivos.css'
import '@phosphor-icons/web/regular'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { lerTemaSalvo, aplicarTema } from './lib/theme.js'
import { mostrarAvisoAtualizacao } from './lib/avisoAtualizacao.js'
import { queryClient } from './lib/cache.js' // cache de dados entre abas (regras em lib/cache.js)

// Guarda o app no aparelho pra recarregar quase na hora quando o navegador
// derrubar a página sozinho (troca de app, minimizar). Versão nova publicada:
// aparece um aviso "Atualizar agora" — nunca recarrega sozinho no meio de um registro.


// Procura versão nova ao abrir e sempre que o app volta para a tela (celular
// tirado do bolso, troca de app). No Android o app fica aberto em segundo plano
// por dias; a checagem periódica só acontece com o app em segundo plano.
let atualizacaoPendente = false
const atualizarSW = registerSW({
  immediate: true,
  onNeedRefresh() { atualizacaoPendente = true; mostrarAvisoAtualizacao(() => atualizarSW(true)) },
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const checar = () => { if (navigator.onLine) reg.update().catch(() => {}) }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return
      checar()
      // Quem clicou em "Depois" volta a ver o aviso ao retornar ao app.
      if (atualizacaoPendente) mostrarAvisoAtualizacao(() => atualizarSW(true))
    })
    window.addEventListener('pageshow', (e) => { if (e.persisted) checar() })
    setInterval(() => { if (document.visibilityState === 'hidden') checar() }, 30 * 60 * 1000)
  },
})

// Celular: ao tocar num campo, traz o campo para o meio da tela (o teclado
// não fica por cima do que se está digitando).
if (window.matchMedia('(pointer: coarse)').matches) {
  document.addEventListener('focusin', (e) => {
    const el = e.target
    if (!el?.matches?.('input:not([type="checkbox"]):not([type="radio"]), textarea, select')) return
    setTimeout(() => { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }) } catch { /* navegador antigo */ } }, 350)
  })
}

// Aplica antes do primeiro render pra nunca piscar o tema errado.
aplicarTema(lerTemaSalvo())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <App />
    </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
