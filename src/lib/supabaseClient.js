import { createClient } from '@supabase/supabase-js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof globalThis !== 'undefined' && globalThis.process ? globalThis.process.env : {})
let url = env.VITE_SUPABASE_URL || 'https://supabase.local'
// Em desenvolvimento (localhost ou rede interna) o Vite faz proxy do Supabase.
// No build de produção isso nunca é aplicado.
const hostLocal = (h) => h === 'localhost' || h === '127.0.0.1' || /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)
if (env.DEV && typeof window !== 'undefined' && hostLocal(window.location.hostname)) {
  url = window.location.origin + '/api-supabase'
}
const key = env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(url, key)

