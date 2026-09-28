import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './responsivo.css'
import './modais.css'
import './mobile.css'
import '@phosphor-icons/web/regular'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { lerTemaSalvo, aplicarTema } from './lib/theme.js'

// Guarda o app no aparelho pra recarregar quase na hora quando o navegador
// derrubar a página sozinho (troca de app, minimizar). Atualiza sozinho assim
// que uma versão nova é publicada — sem precisar desinstalar nada.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Prevents excessive re-fetching on tab switch
    },
  },
})

// Procura versão nova ao abrir e sempre que o app volta para a tela (celular
// tirado do bolso, troca de app). No Android o app fica aberto em segundo plano
// por dias e só se atualizava ao fechar tudo. A checagem periódica acontece só
// com o app em segundo plano, para nunca recarregar no meio de uma digitação.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const checar = () => { if (navigator.onLine) reg.update().catch(() => {}) }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checar() })
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
