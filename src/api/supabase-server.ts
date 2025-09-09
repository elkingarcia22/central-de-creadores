import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para el servidor (preferir Service Key para evitar RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseKey = supabaseServiceKey || supabaseAnonKey

// Crear cliente solo si las credenciales están disponibles
const supabaseServer = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null

export { supabaseServer } 