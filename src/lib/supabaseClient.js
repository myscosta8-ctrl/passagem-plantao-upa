import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('As variáveis de ambiente do Supabase não estão definidas.')
}

export const supabase = createClient(url, key)
