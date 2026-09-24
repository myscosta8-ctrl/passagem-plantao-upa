// Módulo de Resiliência Offline e Gestão de Conexão
// Passagem de Plantão & PEP — UPA 24h Breves

const PREFIXO_RASCUNHO = 'upa_rascunho_'

export function estaOnline() {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine
  }
  return true
}

export function ouvirStatusConexao(callback) {
  if (typeof window === 'undefined') return () => {}

  const onOnline = () => callback(true)
  const onOffline = () => callback(false)

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

export function salvarRascunhoOffline(chave, dados) {
  try {
    const payload = {
      dados,
      salvoEm: new Date().toISOString(),
      versao: 1,
    }
    localStorage.setItem(`${PREFIXO_RASCUNHO}${chave}`, JSON.stringify(payload))
    return true
  } catch (err) {
    console.warn('Falha ao salvar rascunho offline:', err)
    return false
  }
}

export function recuperarRascunhoOffline(chave) {
  try {
    const item = localStorage.getItem(`${PREFIXO_RASCUNHO}${chave}`)
    if (!item) return null
    return JSON.parse(item)
  } catch (err) {
    console.warn('Falha ao recuperar rascunho offline:', err)
    return null
  }
}

export function limparRascunhoOffline(chave) {
  try {
    localStorage.removeItem(`${PREFIXO_RASCUNHO}${chave}`)
    return true
  } catch {
    return false
  }
}

export function listarRascunhosPendentes() {
  try {
    const lista = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIXO_RASCUNHO)) {
        const item = JSON.parse(localStorage.getItem(k) || '{}')
        lista.push({
          chave: k.replace(PREFIXO_RASCUNHO, ''),
          salvoEm: item.salvoEm,
          dados: item.dados,
        })
      }
    }
    return lista
  } catch {
    return []
  }
}
