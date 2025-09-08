import { createClient } from '@supabase/supabase-js'
import { supabaseMock, shouldUseMock } from './supabase-mock'

// Verificar si tenemos las credenciales de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// TEMPORAL: Forzar uso de mock debido a error 500 en trigger
const FORCE_MOCK = false; // Cambiado a false para usar Supabase real

// Crear cliente según disponibilidad de credenciales
let supabase: any;

// Verificar si estamos en un entorno de build (Netlify)
const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production';

if (FORCE_MOCK || (!isBuildTime && shouldUseMock())) {
  if (FORCE_MOCK) {
    console.warn('🚨 FORZANDO USO DE MOCK - Error 500 en Supabase detectado');
  } else {
    console.warn('⚠️ USANDO DATOS MOCK - Configura las credenciales de Supabase en .env.local');
  }
  supabase = supabaseMock;
} else {
  if (supabaseUrl && supabaseAnonKey) {
    console.log('✅ Usando Supabase real');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('⚠️ Variables de entorno de Supabase no disponibles, usando mock');
    supabase = supabaseMock;
  }
}

// Cliente de servidor con permisos completos
const supabaseServer = (supabaseServiceKey && supabaseUrl) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

export { supabase, supabaseServer };
