import { createClient } from '@supabase/supabase-js'
import { supabaseMock, shouldUseMock } from './supabase-mock'

// Verificar si tenemos las credenciales de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// TEMPORAL: Forzar uso de mock debido a error 500 en trigger
const FORCE_MOCK = false; // Cambiado a false para usar Supabase real

// Crear cliente según disponibilidad de credenciales
let supabase: any;

if (FORCE_MOCK || shouldUseMock()) {
  if (FORCE_MOCK) {
    console.warn('🚨 FORZANDO USO DE MOCK - Error 500 en Supabase detectado');
  } else {
    console.warn('⚠️ USANDO DATOS MOCK - Configura las credenciales de Supabase en .env.local');
  }
  supabase = supabaseMock;
} else {
  console.log('✅ Usando Supabase real');
  supabase = createClient(supabaseUrl!, supabaseAnonKey!);
}

export { supabase };
