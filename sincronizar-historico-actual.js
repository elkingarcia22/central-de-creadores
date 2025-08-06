const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sincronizarHistoricoActual() {
  console.log('🔄 === SINCRONIZANDO HISTORIAL CON RECLUTAMIENTOS ACTUALES ===\n');

  try {
    // 1. Obtener todos los participantes internos
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes_internos')
      .select('*');

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    console.log(`✅ Participantes internos encontrados: ${participantes.length}`);

    for (const participante of participantes) {
      console.log(`\n🔍 Procesando: ${participante.nombre} (${participante.id})`);

      // 2. Obtener reclutamientos actuales del participante
      const { data: reclutamientos, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_internos_id', participante.id);

      if (errorReclutamientos) {
        console.error(`❌ Error obteniendo reclutamientos para ${participante.nombre}:`, errorReclutamientos);
        continue;
      }

      console.log(`  📊 Reclutamientos actuales: ${reclutamientos.length}`);

      // 3. Obtener historial actual del participante
      const { data: historial, error: errorHistorial } = await supabase
        .from('historial_participacion_participantes_internos')
        .select('*')
        .eq('participante_interno_id', participante.id);

      if (errorHistorial) {
        console.error(`❌ Error obteniendo historial para ${participante.nombre}:`, errorHistorial);
        continue;
      }

      console.log(`  📊 Registros en historial: ${historial.length}`);

      // 4. Crear un mapa de reclutamientos actuales por fecha
      const reclutamientosPorFecha = new Map();
      reclutamientos.forEach(rec => {
        const fecha = rec.fecha_sesion;
        if (fecha) {
          reclutamientosPorFecha.set(fecha, rec);
        }
      });

      // 5. Eliminar registros del historial que no tienen reclutamiento correspondiente
      let eliminados = 0;
      for (const registro of historial) {
        const fecha = registro.fecha_participacion;
        const tieneReclutamiento = reclutamientosPorFecha.has(fecha);
        
        if (!tieneReclutamiento) {
          console.log(`    🗑️  Eliminando registro de historial: ${registro.id} (fecha: ${fecha})`);
          
          const { error: errorDelete } = await supabase
            .from('historial_participacion_participantes_internos')
            .delete()
            .eq('id', registro.id);

          if (errorDelete) {
            console.error(`    ❌ Error eliminando registro ${registro.id}:`, errorDelete);
          } else {
            eliminados++;
          }
        }
      }

      console.log(`  ✅ Registros eliminados: ${eliminados}`);

      // 6. Verificar resultado final
      const { data: historialFinal, error: errorHistorialFinal } = await supabase
        .from('historial_participacion_participantes_internos')
        .select('*')
        .eq('participante_interno_id', participante.id);

      if (!errorHistorialFinal) {
        const completadas = historialFinal.filter(h => h.estado_sesion === 'completada').length;
        console.log(`  📈 Historial final: ${historialFinal.length} registros, ${completadas} completadas`);
      }
    }

    console.log('\n✅ === SINCRONIZACIÓN COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

sincronizarHistoricoActual(); 