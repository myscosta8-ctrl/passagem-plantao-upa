// Lembra qual prontuário estava aberto na aba do navegador, para reabrir depois de
// atualizar a página (F5). Fica só na sessão desta aba (sessionStorage): some ao
// fechar a aba e não guarda nenhum dado clínico — só os identificadores.
const CHAVE = 'prontuario_aberto_v1'

export function lembrarProntuario(dados) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify({ ...lerProntuarioLembrado(), ...dados })) } catch { /* navegador sem armazenamento */ }
}
export function lerProntuarioLembrado() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE) || 'null') || {} } catch { return {} }
}
export function esquecerProntuario() {
  try { sessionStorage.removeItem(CHAVE) } catch { /* idem */ }
}
