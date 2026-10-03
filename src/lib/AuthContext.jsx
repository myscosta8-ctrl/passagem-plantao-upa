import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { limparPermissoes } from './permissoes'
import { encerrarSessaoNoCache } from './cache'

const AuthContext = createContext(null)

const EMAIL_DOMAIN = '@enfermagem.passagemplantao.com'

export function usernameToEmail(username) {
  return username.trim().toLowerCase().replace(/\s+/g, '.') + EMAIL_DOMAIN
}

// Rascunhos guardados só no navegador (passagem de plantão, internação) contêm dados de paciente:
// ao sair, são apagados para o próximo usuário do mesmo computador não vê-los.
function limparRascunhosLocais() {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('rascunho_') || k.startsWith('upa_rascunho_')) localStorage.removeItem(k)
    }
    sessionStorage.removeItem('prontuario_aberto_v1')
  } catch { /* navegador sem armazenamento */ }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [enfermeiro, setEnfermeiro] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  // Falha de rede/banco ao buscar o perfil ≠ perfil inexistente: mostra "tentar de novo"
  // em vez de cair na tela de completar cadastro.
  const [perfilErro, setPerfilErro] = useState(null)
  const [tentativaPerfil, setTentativaPerfil] = useState(0)
  const [permissoes, setPermissoes] = useState([]) // permissões administrativas da conta (cargo + ajustes)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
        const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Previne o bug de unmount (que causa perda de abas abertas) ao mudar de aba
      // ignorando eventos que enviam session vazia indevidamente, a menos que seja um logout real.
      if (event === 'SIGNED_OUT') {
        // Sessão encerrada (inclusive por expiração): primeiro sai da tela, depois apaga o cache
        // (nada de paciente fica na memória e nenhuma tela busca de novo já sem login).
        encerrarSessaoNoCache(() => setSession(null))
      } else if (s) {
        setSession(s)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Depende só do id (não do objeto session inteiro): o Supabase entrega uma
  // sessão NOVA (mesmo usuário) toda vez que a aba volta a ficar visível —
  // renovação de token, não troca de conta. Se dependesse de `session`, isso
  // recarregava o perfil do zero a cada troca de aba ("Carregando perfil...").
  const enfermeiroId = session?.user?.id

  useEffect(() => {
    if (!enfermeiroId) {
      setEnfermeiro(null)
      setPerfilErro(null)
      return
    }
    setProfileLoading(true)
    setPerfilErro(null)
    supabase
      .from('enfermeiros')
      .select('*')
      .eq('id', enfermeiroId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar perfil:', error)
          setPerfilErro(error)
        } else {
          setEnfermeiro(data ?? null)
        }
        setProfileLoading(false)
      })
      .catch((err) => {
        console.error('Erro fatal ao buscar perfil:', err)
        setPerfilErro(err)
        setProfileLoading(false)
      })
  }, [enfermeiroId, tentativaPerfil])

  // Permissões administrativas (cadastrar funcionários, resetar senha...). A regra real vive no banco.
  useEffect(() => {
    if (!enfermeiroId) { setPermissoes([]); return }
    supabase.rpc('minhas_permissoes').then(({ data, error }) => {
      if (error) console.error('Erro ao buscar permissões:', error)
      setPermissoes(Array.isArray(data) ? data : [])
    })
  }, [enfermeiroId])

  const ehAdminGeral = enfermeiro?.role === 'admin'
  const temPermissao = (k) => ehAdminGeral || permissoes.includes(k)

  async function completarPerfil(nome) {
    if (!session?.user) return { error: new Error('Sem sessão ativa') }
    const primeiroNome = nome.trim().split(/\s+/)[0]
    const nomeExibicao = 'ENF.' + primeiroNome.toUpperCase()
    const { error } = await supabase
      .from('enfermeiros')
      .update({ nome, nome_exibicao: nomeExibicao }).eq('id', session.user.id)
    if (!error) setEnfermeiro({ id: session.user.id, nome, nome_exibicao: nomeExibicao })
    return { error }
  }

  async function marcarIntroducaoVista() {
    if (!session?.user) return
    await supabase.from('enfermeiros').update({ primeiro_acesso: false }).eq('id', session.user.id)
    setEnfermeiro((prev) => (prev ? { ...prev, primeiro_acesso: false } : prev))
  }

  async function login(username, senha) {
    // Se o usuário digitou um e-mail real (contém @), usa direto
    // Caso contrário, converte username → domínio fictício
    const email = username.trim().includes('@')
      ? username.trim().toLowerCase()
      : usernameToEmail(username)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    // Novo login reinicia o contador de inatividade (2h — ver Home.jsx).
    if (!error) { try { localStorage.setItem('app_ultima_atividade', String(Date.now())) } catch { /* sem storage */ } }
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
    try { localStorage.removeItem('app_ultima_atividade') } catch { /* sem storage */ }
    limparRascunhosLocais()
    limparPermissoes()
    // Tira as telas do sistema e apaga o cache ANTES de encerrar a sessão: assim nenhuma
    // tela aberta (painel, ficha) dispara busca ao banco já sem login.
    await encerrarSessaoNoCache(() => setSession(null))
    await supabase.auth.signOut({ scope: 'local' }) // sai só deste aparelho; não derruba o mesmo usuário em outros computadores
  }

  // Corrige o nome de exibição depois do cadastro — hoje só era perguntado uma vez,
  // sem jeito nenhum de editar depois sem mexer direto no banco.
  async function atualizarNomeExibicao(nomeExibicao) {
    if (!session?.user) return { error: new Error('Sem sessão ativa') }
    const valor = nomeExibicao.trim()
    if (!valor) return { error: new Error('Nome não pode ficar vazio') }
    const { error } = await supabase.from('enfermeiros').update({ nome_exibicao: valor }).eq('id', session.user.id)
    if (!error) setEnfermeiro((prev) => (prev ? { ...prev, nome_exibicao: valor } : prev))
    return { error }
  }

  async function trocarSenha(novaSenha) {
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) return { error }
    if (!session?.user) return { error: null }
    // Se a troca foi forçada (primeiro login ou reset da direção), destrava o acesso.
    await supabase.from('enfermeiros').update({ deve_trocar_senha: false }).eq('id', session.user.id)
    setEnfermeiro((prev) => (prev ? { ...prev, deve_trocar_senha: false } : prev))
    return { error: null }
  }

  const value = {
    session,
    enfermeiro,
    loading: session === undefined,
    profileLoading,
    perfilErro,
    tentarPerfilDeNovo: () => setTentativaPerfil((n) => n + 1),
    permissoes,
    temPermissao,
    login,
    cadastrar,
    logout,
    completarPerfil,
    marcarIntroducaoVista,
    atualizarNomeExibicao,
    trocarSenha,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
