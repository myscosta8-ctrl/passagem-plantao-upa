import { createClient } from '@supabase/supabase-js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof globalThis !== 'undefined' && globalThis.process ? globalThis.process.env : {})
let url = env.VITE_SUPABASE_URL || 'https://supabase.local'
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  url = window.location.origin + '/api-supabase'
}
const key = env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(url, key)

