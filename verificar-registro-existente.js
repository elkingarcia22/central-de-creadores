const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarRegistroExistente() {
  console.log('🔍 === VERIFICANDO REGISTRO EXISTENTE ===\n');

  try {
    const participanteId = 'af4eb891-2a6e-44e0-84d3-b00592775c08';
    const fecha = '2025-07-28T11:04:00+00:00';

    // Verificar si ya existe un registro para esta fecha
    const { data: registros, error: errorRegistros } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('*')
      .eq('participante_interno_id', participanteId)
      .eq('fecha_participacion', fecha);

    if (errorRegistros) {
      console.error('❌ Error obteniendo registros:', errorRegistros);
      return;
    }

    console.log(`📊 Registros encontrados para fecha ${fecha}: ${registros.length}`);
    
    if (registros.length > 0) {
      console.log('📋 Registros existentes:');
      registros.forEach((reg, index) => {
        console.log(`  ${index + 1}. ID: ${reg.id}, Estado: ${reg.estado_sesion}`);
      });
    } else {
      console.log('✅ No hay registros existentes para esta fecha');
    }

    // Verificar todos los registros del participante
    const { data: todosRegistros, error: errorTodos } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('*')
      .eq('participante_interno_id', participanteId);

    if (!errorTodos) {
      console.log(`\n📊 Total de registros del participante: ${todosRegistros.length}`);
      todosRegistros.forEach((reg, index) => {
        console.log(`  ${index + 1}. Fecha: ${reg.fecha_participacion}, Estado: ${reg.estado_sesion}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarRegistroExistente(); 