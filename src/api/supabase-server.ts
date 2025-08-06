import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para el servidor (sin RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las credenciales de Supabase para el servidor')
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

export { supabaseServer } 