const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sincronizarHistoricoExternos() {
  console.log('🔄 === SINCRONIZANDO HISTORIAL DE PARTICIPANTES EXTERNOS ===\n');

  try {
    // 1. Obtener todos los participantes externos
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('*');

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    console.log(`✅ Participantes externos encontrados: ${participantes.length}`);

    for (const participante of participantes) {
      console.log(`\n🔍 Procesando: ${participante.nombre} (${participante.id})`);

      // 2. Obtener reclutamientos actuales del participante
      const { data: reclutamientos, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select(`
          *,
          estado_agendamiento_cat!inner(nombre)
        `)
        .eq('participantes_id', participante.id);

      if (errorReclutamientos) {
        console.error(`❌ Error obteniendo reclutamientos para ${participante.nombre}:`, errorReclutamientos);
        continue;
      }

      console.log(`  📊 Reclutamientos actuales: ${reclutamientos.length}`);

      // 3. Obtener historial actual del participante
      const { data: historial, error: errorHistorial } = await supabase
        .from('historial_participacion_participantes')
        .select('*')
        .eq('participante_id', participante.id);

      if (errorHistorial) {
        console.error(`❌ Error obteniendo historial para ${participante.nombre}:`, errorHistorial);
        continue;
      }

      console.log(`  📊 Registros en historial: ${historial.length}`);

      // 4. Crear un mapa de reclutamientos finalizados por fecha
      const reclutamientosFinalizadosPorFecha = new Map();
      reclutamientos.forEach(rec => {
        if (rec.estado_agendamiento_cat.nombre === 'Finalizado' && rec.fecha_sesion) {
          reclutamientosFinalizadosPorFecha.set(rec.fecha_sesion, rec);
        }
      });

      // 5. Crear un mapa del historial actual por fecha
      const historialPorFecha = new Map();
      historial.forEach(hist => {
        historialPorFecha.set(hist.fecha_participacion, hist);
      });

      // 6. Eliminar registros del historial que no tienen reclutamiento correspondiente
      let eliminados = 0;
      for (const registro of historial) {
        const fecha = registro.fecha_participacion;
        const tieneReclutamiento = reclutamientosFinalizadosPorFecha.has(fecha);
        
        if (!tieneReclutamiento) {
          console.log(`    🗑️  Eliminando registro de historial: ${registro.id} (fecha: ${fecha})`);
          
          const { error: errorDelete } = await supabase
            .from('historial_participacion_participantes')
            .delete()
            .eq('id', registro.id);

          if (errorDelete) {
            console.error(`    ❌ Error eliminando registro ${registro.id}:`, errorDelete);
          } else {
            eliminados++;
          }
        }
      }

      // 7. Agregar registros faltantes al historial
      let agregados = 0;
      for (const [fecha, reclutamiento] of reclutamientosFinalizadosPorFecha) {
        if (!historialPorFecha.has(fecha)) {
          console.log(`    ➕ Agregando registro al historial: ${fecha}`);
          
          const nuevoRegistro = {
            participante_id: participante.id,
            investigacion_id: reclutamiento.investigacion_id,
            reclutamiento_id: reclutamiento.id,
            empresa_id: participante.empresa_id,
            fecha_participacion: fecha,
            estado_sesion: 'completada',
            duracion_sesion: reclutamiento.duracion_sesion,
            creado_por: reclutamiento.creado_por
          };

          const { error: errorInsert } = await supabase
            .from('historial_participacion_participantes')
            .insert(nuevoRegistro);

          if (errorInsert) {
            console.error(`    ❌ Error agregando registro:`, errorInsert);
          } else {
            agregados++;
          }
        }
      }

      console.log(`  ✅ Registros eliminados: ${eliminados}, agregados: ${agregados}`);

      // 8. Verificar resultado final
      const { data: historialFinal, error: errorHistorialFinal } = await supabase
        .from('historial_participacion_participantes')
        .select('*')
        .eq('participante_id', participante.id);

      if (!errorHistorialFinal) {
        const completadas = historialFinal.filter(h => h.estado_sesion === 'completada').length;
        const reclutamientosFinalizados = reclutamientos.filter(r => r.estado_agendamiento_cat.nombre === 'Finalizado').length;
        console.log(`  📈 Historial final: ${historialFinal.length} registros, ${completadas} completadas`);
        console.log(`  📈 Reclutamientos finalizados: ${reclutamientosFinalizados}`);
        
        if (completadas === reclutamientosFinalizados) {
          console.log(`  ✅ Sincronización exitosa`);
        } else {
          console.log(`  ⚠️  Aún hay discrepancia`);
        }
      }
    }

    console.log('\n✅ === SINCRONIZACIÓN COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

sincronizarHistoricoExternos(); 