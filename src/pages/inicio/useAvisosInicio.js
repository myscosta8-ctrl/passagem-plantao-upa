import { useEffect, useState } from 'react'
import { listarMeusRascunhos } from '../../components/MeusRascunhos'
import { EVENTO_DOCUMENTOS } from '../../lib/documentos'

// Data e hora do topo (atualiza a cada 30 s).
export function useRelogio() {
  const [horaFormatada, setHoraFormatada] = useState('')
  useEffect(() => {
    function atualizarHora() {
      const agora = new Date()
      const d = agora.toLocaleDateString('pt-BR')
      const h = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setHoraFormatada(`${d} ${h}`)
    }
    atualizarHora()
    const timer = setInterval(atualizarHora, 30000)
    return () => clearInterval(timer)
  }, [])
  return horaFormatada
}

// Faixa vermelha de "Falha ao carregar dados" (some sozinha em 12 s).
export function useErroApp() {
  const [erroApp, setErroApp] = useState(null)
  useEffect(() => {
    let t
    const aoErro = (e) => { setErroApp(e.detail); clearTimeout(t); t = setTimeout(() => setErroApp(null), 12000) }
    window.addEventListener('app-erro', aoErro)
    return () => { window.removeEventListener('app-erro', aoErro); clearTimeout(t) }
  }, [])
  return [erroApp, setErroApp]
}

// Aviso no menu (Pendências) de documentos do próprio profissional salvos e não finalizados.
export function useRascunhosPendentes(tela) {
  const [rascunhosPendentes, setRascunhosPendentes] = useState(0)
  useEffect(() => {
    let t
    const atualizar = () => listarMeusRascunhos().then((l) => setRascunhosPendentes(l.length))
    // Após salvar/finalizar/cancelar um documento (espera 1s para o banco concluir)
    const aoMudar = () => { clearTimeout(t); t = setTimeout(atualizar, 1000) }
    const aoVoltar = () => { if (document.visibilityState === 'visible') atualizar() }
    atualizar()
    window.addEventListener(EVENTO_DOCUMENTOS, aoMudar)
    document.addEventListener('visibilitychange', aoVoltar)
    return () => { clearTimeout(t); window.removeEventListener(EVENTO_DOCUMENTOS, aoMudar); document.removeEventListener('visibilitychange', aoVoltar) }
  }, [tela])
  return rascunhosPendentes
}
