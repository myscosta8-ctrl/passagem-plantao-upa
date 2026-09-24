import { createClient } from '@supabase/supabase-js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (process.env || {})
const url = env.VITE_SUPABASE_URL || 'https://supabase.local'
const key = env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(url, key)

