const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraHistorico() {
  console.log('🔍 === VERIFICANDO ESTRUCTURA DE HISTORIAL PARTICIPANTES ===\n');

  try {
    // Verificar algunos registros de ejemplo
    const { data: registros, error: errorRegistros } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .limit(1);

    if (errorRegistros) {
      console.error('❌ Error obteniendo registros:', errorRegistros);
      return;
    }

    if (registros && registros.length > 0) {
      console.log('📊 Ejemplo de registro:');
      console.log(JSON.stringify(registros[0], null, 2));
      
      console.log('\n📋 Columnas disponibles:');
      Object.keys(registros[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
    } else {
      console.log('📊 No hay registros en la tabla');
      
      // Intentar insertar un registro de prueba para ver la estructura
      console.log('\n🔍 Intentando insertar registro de prueba...');
      const { error: errorInsert } = await supabase
        .from('historial_participacion_participantes')
        .insert({
          participante_id: 'test-id',
          investigacion_id: 'test-inv-id',
          fecha_participacion: '2025-07-28T10:00:00Z',
          estado_sesion: 'completada',
          duracion_minutos: 60,
          reclutador_id: 'test-rec-id',
          observaciones: 'test'
        });

      if (errorInsert) {
        console.log('❌ Error al insertar (esto nos ayuda a ver la estructura):');
        console.log(errorInsert);
      } else {
        console.log('✅ Registro de prueba insertado correctamente');
        // Eliminar el registro de prueba
        await supabase
          .from('historial_participacion_participantes')
          .delete()
          .eq('participante_id', 'test-id');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarEstructuraHistorico(); 