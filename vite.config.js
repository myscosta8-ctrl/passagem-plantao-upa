import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Guarda o "esqueleto" do app (JS/CSS/ícones) no aparelho, pra quando o
      // navegador recarregar a página sozinho (troca de app, minimizar) montar
      // a tela quase na hora em vez de baixar tudo de novo pela rede. Os dados
      // do paciente continuam vindo sempre do banco — nada disso fica em cache.
      registerType: 'autoUpdate',
      manifest: false, // usa o public/manifest.json existente, sem duplicar
      injectRegister: false, // registrado manualmente em src/main.jsx
      // Sem runtimeCaching: as chamadas ao Supabase são pra outro domínio e
      // nunca passam pelo cache — só o "esqueleto" do próprio app é guardado.
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
      },
    }),
  ],
  base: './',
})
