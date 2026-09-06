import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

// Guarda o app no aparelho pra recarregar quase na hora quando o navegador
// derrubar a página sozinho (troca de app, minimizar). Atualiza sozinho assim
// que uma versão nova é publicada — sem precisar desinstalar nada.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
