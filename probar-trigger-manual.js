const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probarTriggerManual() {
  console.log('🧪 === PROBANDO TRIGGER MANUAL ===\n');

  try {
    // 1. Obtener el ID del estado "Finalizado"
    const { data: estadoFinalizado, error: errorEstado } = await supabase
      .from('estado_agendamiento_cat')
      .select('id')
      .eq('nombre', 'Finalizado')
      .single();

    if (errorEstado) {
      console.error('❌ Error obteniendo estado Finalizado:', errorEstado);
      return;
    }

    console.log(`✅ Estado Finalizado ID: ${estadoFinalizado.id}`);

    // 2. Buscar un reclutamiento de participante externo que no esté finalizado
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        estado_agendamiento_cat!inner(nombre)
      `)
      .eq('participantes_id', '9155b800-f786-46d7-9294-bb385434d042') // prueba 12344
      .neq('estado_agendamiento', estadoFinalizado.id)
      .limit(1);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return;
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('❌ No se encontraron reclutamientos pendientes para probar');
      return;
    }

    const reclutamiento = reclutamientos[0];
    console.log(`✅ Reclutamiento encontrado: ${reclutamiento.id}`);
    console.log(`   Estado actual: ${reclutamiento.estado_agendamiento_cat.nombre}`);
    console.log(`   Fecha: ${reclutamiento.fecha_sesion}`);

    // 3. Verificar historial antes
    const { data: historialAntes, error: errorHistorialAntes } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('participante_id', reclutamiento.participantes_id);

    if (!errorHistorialAntes) {
      console.log(`📊 Historial antes: ${historialAntes.length} registros`);
    }

    // 4. Actualizar el reclutamiento a Finalizado
    console.log('\n🔄 Actualizando reclutamiento a Finalizado...');
    const { data: resultadoUpdate, error: errorUpdate } = await supabase
      .from('reclutamientos')
      .update({ estado_agendamiento: estadoFinalizado.id })
      .eq('id', reclutamiento.id)
      .select();

    if (errorUpdate) {
      console.error('❌ Error actualizando reclutamiento:', errorUpdate);
      return;
    }

    console.log('✅ Reclutamiento actualizado correctamente');

    // 5. Verificar historial después
    const { data: historialDespues, error: errorHistorialDespues } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('participante_id', reclutamiento.participantes_id);

    if (!errorHistorialDespues) {
      console.log(`📊 Historial después: ${historialDespues.length} registros`);
      
      if (historialDespues.length > historialAntes.length) {
        console.log('✅ Trigger funcionó: Se agregó un registro al historial');
        
        // Mostrar el nuevo registro
        const nuevoRegistro = historialDespues.find(h => 
          h.fecha_participacion === reclutamiento.fecha_sesion
        );
        if (nuevoRegistro) {
          console.log('📋 Nuevo registro:', nuevoRegistro);
        }
      } else {
        console.log('⚠️  Trigger no funcionó o el registro ya existía');
      }
    }

    console.log('\n✅ === PRUEBA COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

probarTriggerManual(); 