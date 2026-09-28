// Falha de consulta não pode virar "lista vazia" silenciosa: registra no
// console e avisa a tela (Home mostra uma faixa de alerta).
let ultimoAviso = 0
export function avisarErro(contexto, error) {
  if (!error) return
  console.error(`[${contexto}]`, error)
  const agora = Date.now()
  if (agora - ultimoAviso < 3000) return
  ultimoAviso = agora
  try {
    window.dispatchEvent(new CustomEvent('app-erro', { detail: { contexto, mensagem: error.message || String(error) } }))
  } catch { /* fora do navegador */ }
}
