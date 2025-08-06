const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sincronizarHistoricoAutomatico() {
  console.log('🔄 === SINCRONIZACIÓN AUTOMÁTICA DE HISTORIAL ===\n');

  try {
    // 1. Obtener todos los reclutamientos finalizados
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        estado_agendamiento_cat!inner(nombre)
      `)
      .eq('estado_agendamiento_cat.nombre', 'Finalizado');

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return;
    }

    console.log(`📊 Reclutamientos finalizados encontrados: ${reclutamientos.length}`);

    let sincronizados = 0;
    let yaExistentes = 0;
    let errores = 0;

    for (const reclutamiento of reclutamientos) {
      console.log(`\n🔍 Procesando: ${reclutamiento.id}`);
      console.log(`   Fecha: ${reclutamiento.fecha_sesion}`);
      console.log(`   Tipo: ${reclutamiento.participantes_id ? 'Externo' : 'Interno'}`);

      // 2. Verificar si ya existe en el historial
      let existeEnHistorial = false;
      
      if (reclutamiento.participantes_id) {
        // Participante externo
        const { data: historialExterno, error: errorHistorialExterno } = await supabase
          .from('historial_participacion_participantes')
          .select('id')
          .eq('participante_id', reclutamiento.participantes_id)
          .eq('fecha_participacion', reclutamiento.fecha_sesion);

        if (!errorHistorialExterno && historialExterno.length > 0) {
          existeEnHistorial = true;
        }
      } else if (reclutamiento.participantes_internos_id) {
        // Participante interno
        const { data: historialInterno, error: errorHistorialInterno } = await supabase
          .from('historial_participacion_participantes_internos')
          .select('id')
          .eq('participante_interno_id', reclutamiento.participantes_internos_id)
          .eq('fecha_participacion', reclutamiento.fecha_sesion);

        if (!errorHistorialInterno && historialInterno.length > 0) {
          existeEnHistorial = true;
        }
      }

      if (existeEnHistorial) {
        console.log('   ✅ Ya existe en historial');
        yaExistentes++;
        continue;
      }

      // 3. Insertar en el historial correspondiente
      try {
        if (reclutamiento.participantes_id) {
          // Participante externo
          const { error: errorInsert } = await supabase
            .from('historial_participacion_participantes')
            .insert({
              participante_id: reclutamiento.participantes_id,
              investigacion_id: reclutamiento.investigacion_id,
              reclutamiento_id: reclutamiento.id,
              empresa_id: (await supabase.from('participantes').select('empresa_id').eq('id', reclutamiento.participantes_id).single()).data?.empresa_id,
              fecha_participacion: reclutamiento.fecha_sesion,
              estado_sesion: 'completada',
              duracion_sesion: reclutamiento.duracion_sesion,
              creado_por: reclutamiento.creado_por
            });

          if (errorInsert) {
            console.log(`   ❌ Error: ${errorInsert.message}`);
            errores++;
          } else {
            console.log('   ✅ Sincronizado (externo)');
            sincronizados++;
          }
        } else if (reclutamiento.participantes_internos_id) {
          // Participante interno
          const { error: errorInsert } = await supabase
            .from('historial_participacion_participantes_internos')
            .insert({
              participante_interno_id: reclutamiento.participantes_internos_id,
              investigacion_id: reclutamiento.investigacion_id,
              fecha_participacion: reclutamiento.fecha_sesion,
              estado_sesion: 'completada',
              duracion_minutos: reclutamiento.duracion_sesion,
              reclutador_id: reclutamiento.reclutador_id,
              observaciones: 'Sincronizado automáticamente'
            });

          if (errorInsert) {
            console.log(`   ❌ Error: ${errorInsert.message}`);
            errores++;
          } else {
            console.log('   ✅ Sincronizado (interno)');
            sincronizados++;
          }
        }
      } catch (error) {
        console.log(`   ❌ Error general: ${error.message}`);
        errores++;
      }
    }

    console.log('\n📊 === RESUMEN ===');
    console.log(`✅ Sincronizados: ${sincronizados}`);
    console.log(`⚠️  Ya existían: ${yaExistentes}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${reclutamientos.length}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

sincronizarHistoricoAutomatico(); 