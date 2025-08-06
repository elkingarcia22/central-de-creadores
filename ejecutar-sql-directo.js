const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarSQLDirecto() {
  console.log('🔧 === EJECUTANDO SQL DIRECTO ===\n');

  try {
    // SQL para crear el trigger
    const sql = `
      -- Trigger simple para participantes externos
      CREATE OR REPLACE FUNCTION sincronizar_historial_externos()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Solo cuando se actualiza a Finalizado
          IF TG_OP = 'UPDATE' AND NEW.estado_agendamiento = (
              SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
          ) AND OLD.estado_agendamiento != NEW.estado_agendamiento THEN
              
              -- Insertar en el historial si no existe
              INSERT INTO historial_participacion_participantes (
                  participante_id,
                  investigacion_id,
                  reclutamiento_id,
                  empresa_id,
                  fecha_participacion,
                  estado_sesion,
                  duracion_sesion,
                  creado_por
              ) VALUES (
                  NEW.participantes_id,
                  NEW.investigacion_id,
                  NEW.id,
                  (SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id),
                  NEW.fecha_sesion,
                  'completada',
                  NEW.duracion_sesion,
                  NEW.creado_por
              ) ON CONFLICT (participante_id, fecha_participacion) DO NOTHING;
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Crear el trigger
      DROP TRIGGER IF EXISTS trigger_sincronizar_externos ON reclutamientos;
      CREATE TRIGGER trigger_sincronizar_externos
          AFTER UPDATE ON reclutamientos
          FOR EACH ROW
          WHEN (NEW.participantes_id IS NOT NULL)
          EXECUTE FUNCTION sincronizar_historial_externos();
    `;

    console.log('📋 SQL a ejecutar:');
    console.log(sql);

    // Intentar ejecutar usando una función RPC personalizada
    console.log('\n🚀 Intentando ejecutar SQL...');
    
    // Primero, verificar si existe la función RPC
    const { data: funciones, error: errorFunciones } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'exec_sql');

    if (errorFunciones) {
      console.log('❌ No se puede verificar funciones RPC directamente');
      console.log('💡 Necesitas ejecutar este SQL manualmente en el dashboard de Supabase:');
      console.log('\n' + sql);
      return;
    }

    // Intentar ejecutar el SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      console.log('\n💡 Ejecuta este SQL manualmente en el dashboard de Supabase:');
      console.log('\n' + sql);
    } else {
      console.log('✅ SQL ejecutado correctamente');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    console.log('\n💡 Ejecuta este SQL manualmente en el dashboard de Supabase:');
    console.log('\n' + sql);
  }
}

ejecutarSQLDirecto(); 