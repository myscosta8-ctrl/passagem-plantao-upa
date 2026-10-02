import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Permissões configuráveis (item 14): a regra vive no banco (tabela regras_acesso, função pode).
// A tela só pergunta para esconder o que o banco recusaria. Enquanto não responde, nada aparece.
const cache = new Map()

export function podeArea(area) {
  if (!cache.has(area)) {
    cache.set(area, supabase.rpc('pode', { p_area: area }).then(({ data, error }) => {
      if (error) { cache.delete(area); return false }
      return data === true
    }))
  }
  return cache.get(area)
}

export function limparPermissoes() { cache.clear() }

export function usePode(area) {
  const [pode, setPode] = useState(null) // null = consultando
  useEffect(() => {
    let vivo = true
    podeArea(area).then((v) => { if (vivo) setPode(v) })
    return () => { vivo = false }
  }, [area])
  return pode
}
