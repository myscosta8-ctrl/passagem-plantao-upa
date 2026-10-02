import { AuthProvider, useAuth } from './lib/AuthContext'
import Auth from './pages/Auth'
import Home from './pages/Home'
import CompletarPerfil from './pages/CompletarPerfil'
import BemVindoModal from './pages/BemVindoModal'
import TrocaSenhaObrigatoria from './pages/TrocaSenhaObrigatoria'
import StatusConexao from './components/StatusConexao'

function Gate() {
  const { loading, session, enfermeiro, profileLoading, perfilErro, tentarPerfilDeNovo, logout } = useAuth()

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

  // Sem conexão / erro do banco: não é cadastro incompleto — oferece tentar de novo.
  if (perfilErro && !enfermeiro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', alignItems: 'center', justifyContent: 'center', padding: 16, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div>Não foi possível carregar seu perfil. Verifique a conexão com a internet.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-save-print" onClick={tentarPerfilDeNovo}>Tentar de novo</button>
          <button type="button" className="btn-cancel" onClick={logout}>Sair</button>
        </div>
      </div>
    )
  }

  if (!enfermeiro) return <CompletarPerfil />

  if (enfermeiro.deve_trocar_senha) return <TrocaSenhaObrigatoria />

  // O guia de boas-vindas explica plantão/setores/impressão — fluxo de
  // enfermagem. Médico e recepção têm telas próprias, bem mais simples; não
  // faz sentido mostrar esse guia pra eles.
  const mostrarBemVindo = enfermeiro.primeiro_acesso && !['medico', 'recepcao', 'apoio'].includes(enfermeiro.tipo)

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
      <StatusConexao />
      <Gate />
    </AuthProvider>
  )
}
