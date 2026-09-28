import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './responsivo.css'
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

registerSW({ immediate: true })

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
