import { useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Encerramento automático do login após 2 horas sem uso (sem clique,
// digitação, toque ou rolagem). A última atividade fica no localStorage para
// valer entre abas abertas do mesmo navegador. Também manda o sinal de
// "online agora" do Painel de Equipe.
export function useSessaoInativa(logout) {
  const logoutRef = useRef(logout)
  logoutRef.current = logout

  useEffect(() => {
    const LIMITE = 2 * 60 * 60 * 1000
    const CHAVE = 'app_ultima_atividade'
    const marcar = () => { try { localStorage.setItem(CHAVE, String(Date.now())) } catch { /* sem storage */ } }
    const ultima = () => { try { return Number(localStorage.getItem(CHAVE)) || Date.now() } catch { return Date.now() } }
    let ultimaMarcacao = 0
    let encerrado = false
    const encerrar = () => { if (!encerrado) { encerrado = true; logoutRef.current() } }
    const expirou = () => Date.now() - ultima() >= LIMITE
    // Antes de registrar uso, confere se já passou das 2h (ex.: celular/aba parados
    // e a pessoa volta mexendo na tela) — senão o movimento "renovava" a sessão vencida.
    const aoUsar = () => { if (expirou()) { encerrar(); return } const agora = Date.now(); if (agora - ultimaMarcacao > 30000) { ultimaMarcacao = agora; marcar() } }
    const aoVoltar = () => { if (document.visibilityState === 'visible' && expirou()) encerrar() }
    // Ao reabrir o app depois de mais de 2h parado, encerra antes de continuar.
    if (Date.now() - ultima() >= LIMITE) { logoutRef.current(); return }
    marcar()
    const eventos = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove']
    eventos.forEach((e) => window.addEventListener(e, aoUsar, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('focus', aoVoltar)
    window.addEventListener('pageshow', aoVoltar)
    const t = setInterval(() => { if (expirou()) encerrar() }, 30000)
    // Sinal de atividade para o Painel de Equipe ("online agora"): a cada 2 min, se houve uso recente.
    const sinal = () => { if (Date.now() - ultima() < 3 * 60000 && document.visibilityState === 'visible') supabase.rpc('registrar_atividade').then(() => {}, () => {}) }
    sinal()
    const tSinal = setInterval(sinal, 120000)
    return () => { clearInterval(t); clearInterval(tSinal); document.removeEventListener('visibilitychange', aoVoltar); window.removeEventListener('focus', aoVoltar); window.removeEventListener('pageshow', aoVoltar); eventos.forEach((e) => window.removeEventListener(e, aoUsar, { capture: true })) }
  }, [])
}
