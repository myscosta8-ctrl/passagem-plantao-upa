import { AuthProvider, useAuth } from './lib/AuthContext'
import Auth from './pages/Auth'
import Home from './pages/Home'
import CompletarPerfil from './pages/CompletarPerfil'
import BemVindoModal from './pages/BemVindoModal'
import TrocaSenhaObrigatoria from './pages/TrocaSenhaObrigatoria'

function Gate() {
  const { loading, session, enfermeiro, profileLoading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Carregando...
      </div>
    )
  }

  if (!session) return <Auth />

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Carregando perfil...
      </div>
    )
  }

  if (!enfermeiro) return <CompletarPerfil />

  if (enfermeiro.deve_trocar_senha) return <TrocaSenhaObrigatoria />

  // O guia de boas-vindas explica plantão/setores/impressão — fluxo de
  // enfermagem. Médico e recepção têm telas próprias, bem mais simples; não
  // faz sentido mostrar esse guia pra eles.
  const mostrarBemVindo = enfermeiro.primeiro_acesso && !['medico', 'recepcao'].includes(enfermeiro.tipo)

  return (
    <>
      <Home />
      {mostrarBemVindo && <BemVindoModal />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
