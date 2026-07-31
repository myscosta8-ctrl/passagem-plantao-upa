import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

const EMAIL_DOMAIN = '@enfermagem.passagemplantao.com'

export function usernameToEmail(username) {
  return username.trim().toLowerCase().replace(/\s+/g, '.') + EMAIL_DOMAIN
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [enfermeiro, setEnfermeiro] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setEnfermeiro(null)
      return
    }
    setProfileLoading(true)
    supabase
      .from('enfermeiros')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setEnfermeiro(data ?? null)
        setProfileLoading(false)
      })
  }, [session])

  async function completarPerfil(nome) {
    if (!session?.user) return { error: new Error('Sem sessão ativa') }
    const primeiroNome = nome.trim().split(/\s+/)[0]
    const nomeExibicao = 'ENF.' + primeiroNome.toUpperCase()
    const { error } = await supabase
      .from('enfermeiros')
      .upsert({ id: session.user.id, nome, nome_exibicao: nomeExibicao })
    if (!error) setEnfermeiro({ id: session.user.id, nome, nome_exibicao: nomeExibicao })
    return { error }
  }

  async function marcarIntroducaoVista() {
    if (!session?.user) return
    await supabase.from('enfermeiros').update({ primeiro_acesso: false }).eq('id', session.user.id)
    setEnfermeiro((prev) => (prev ? { ...prev, primeiro_acesso: false } : prev))
  }

  async function login(username, senha) {
    const email = usernameToEmail(username)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return { error }
  }

  async function cadastrar(nome, username, senha) {
    const email = usernameToEmail(username)
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    if (error) return { error }

    if (data.user) {
      const primeiroNome = nome.trim().split(/\s+/)[0]
      const nomeExibicao = 'ENF.' + primeiroNome.toUpperCase()
      const { error: profileError } = await supabase
        .from('enfermeiros')
        .insert({ id: data.user.id, nome, nome_exibicao: nomeExibicao })
      if (profileError) return { error: profileError }
    }

    if (!data.session) {
      // Supabase is set to require email confirmation, but we use fake
      // addresses internally so no real confirmation email can be received.
      return { error: null, precisaConfirmacaoEmail: true }
    }

    return { error: null }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    enfermeiro,
    loading: session === undefined,
    profileLoading,
    login,
    cadastrar,
    logout,
    completarPerfil,
    marcarIntroducaoVista,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
