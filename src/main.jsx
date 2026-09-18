import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { lerTemaSalvo, aplicarTema } from './lib/theme.js'

// Guarda o app no aparelho pra recarregar quase na hora quando o navegador
// derrubar a página sozinho (troca de app, minimizar). Atualiza sozinho assim
// que uma versão nova é publicada — sem precisar desinstalar nada.
registerSW({ immediate: true })

// Aplica antes do primeiro render pra nunca piscar o tema errado.
aplicarTema(lerTemaSalvo())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
