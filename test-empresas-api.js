// ====================================
// TEST API EMPRESAS
// ====================================

// Función para probar la API de empresas
async function testEmpresasAPI() {
  console.log('🔄 Probando API de empresas...');
  
  try {
    // Probar la API local
    const response = await fetch('http://localhost:3000/api/empresas');
    
    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Total de empresas:', data.length);
      
      if (data.length > 0) {
        console.log('🏢 Primera empresa:', data[0]);
      } else {
        console.log('⚠️ No hay empresas en la base de datos');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', errorText);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

// Función para probar directamente Supabase
async function testSupabaseDirect() {
  console.log('🔄 Probando Supabase directamente...');
  
  try {
    // Necesitarías configurar las credenciales aquí
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Credenciales de Supabase no configuradas');
      return;
    }
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('empresas')
      .select('id, nombre')
      .order('nombre');
    
    if (error) {
      console.error('❌ Error de Supabase:', error);
    } else {
      console.log('✅ Datos de Supabase:', data);
      console.log('📊 Total de empresas:', data?.length || 0);
    }
  } catch (error) {
    console.error('❌ Error probando Supabase:', error);
  }
}

// Ejecutar pruebas
console.log('🚀 Iniciando pruebas de API de empresas...');
testEmpresasAPI();

// Comentado porque requiere configuración de credenciales
// testSupabaseDirect(); 