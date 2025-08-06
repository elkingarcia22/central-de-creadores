const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Verificando configuración...');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada');
console.log('Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ No configurada');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n🔍 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabaseServer
      .from('reclutamientos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return;
    }
    
    console.log('✅ Conexión exitosa');
    
    // Verificar estructura de tablas
    console.log('\n🔍 Verificando estructura de tablas...');
    
    const tables = [
      'reclutamientos',
      'participantes',
      'participantes_internos',
      'empresas',
      'estado_participante_cat',
      'estado_agendamiento_cat',
      'productos',
      'roles_empresa'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseServer
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}:`, error.message);
        } else {
          console.log(`✅ ${table}: ${data.length} registros`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Error -`, err.message);
      }
    }
    
    // Verificar datos de reclutamientos
    console.log('\n🔍 Verificando datos de reclutamientos...');
    const { data: reclutamientos, error: reclutamientosError } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .limit(5);
    
    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
    } else {
      console.log(`✅ Reclutamientos encontrados: ${reclutamientos.length}`);
      if (reclutamientos.length > 0) {
        console.log('📋 Primer reclutamiento:', JSON.stringify(reclutamientos[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testConnection(); 