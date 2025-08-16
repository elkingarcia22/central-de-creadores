import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para el servidor (sin RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase para el servidor')
}

const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)

export { supabaseServer } 