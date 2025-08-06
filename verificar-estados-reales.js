const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verificarEstadosReales() {
  console.log('🔍 === VERIFICANDO ESTADOS REALES ===');
  
  try {
    // 1. Verificar reclutamientos con participantes internos
    console.log('\n1. Verificando reclutamientos con participantes internos...');
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        participantes_internos_id,
        investigacion_id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        reclutador_id
      `)
      .not('participantes_internos_id', 'is', null)
      .not('fecha_sesion', 'is', null);

    if (errorReclutamientos) {
      throw new Error(`Error obteniendo reclutamientos: ${errorReclutamientos.message}`);
    }

    console.log(`✅ Encontrados ${reclutamientos.length} reclutamientos con participantes internos`);

    // 2. Obtener estados de agendamiento
    const { data: estadosAgendamiento, error: errorEstados } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre');
    
    if (errorEstados) {
      throw new Error(`Error obteniendo estados: ${errorEstados.message}`);
    }

    const estadosMap = new Map(estadosAgendamiento.map(e => [e.id, e.nombre]));

    // 3. Mostrar reclutamientos con sus estados reales
    console.log('\n📋 Reclutamientos con estados reales:');
    reclutamientos.forEach((r, i) => {
      const estadoNombre = estadosMap.get(r.estado_agendamiento) || 'N/A';
      console.log(`  ${i + 1}. ID: ${r.id}`);
      console.log(`     Participante: ${r.participantes_internos_id}`);
      console.log(`     Fecha: ${r.fecha_sesion}`);
      console.log(`     Estado: ${estadoNombre}`);
      console.log(`     Duración: ${r.duracion_sesion} min`);
      console.log('');
    });

    // 4. Verificar qué hay en el historial actual
    console.log('\n2. Verificando historial actual...');
    const { data: historialActual, error: errorHistorial } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('*');

    if (errorHistorial) {
      throw new Error(`Error verificando historial: ${errorHistorial.message}`);
    }

    console.log(`✅ Encontrados ${historialActual.length} registros en historial`);
    
    if (historialActual.length > 0) {
      console.log('\n📋 Registros en historial:');
      historialActual.forEach((h, i) => {
        console.log(`  ${i + 1}. Participante: ${h.participante_interno_id}`);
        console.log(`     Fecha: ${h.fecha_participacion}`);
        console.log(`     Estado: ${h.estado_sesion}`);
        console.log(`     Observaciones: ${h.observaciones}`);
        console.log('');
      });
    }

    // 5. Verificar específicamente el participante "prueba 1"
    console.log('\n3. Verificando participante "prueba 1"...');
    const participantePrueba1 = 'af4eb891-2a6e-44e0-84d3-b00592775c08';
    
    const reclutamientosPrueba1 = reclutamientos.filter(r => r.participantes_internos_id === participantePrueba1);
    const historialPrueba1 = historialActual.filter(h => h.participante_interno_id === participantePrueba1);
    
    console.log(`📊 Participante "prueba 1" tiene:`);
    console.log(`  - ${reclutamientosPrueba1.length} reclutamientos`);
    console.log(`  - ${historialPrueba1.length} registros en historial`);
    
    console.log('\n📋 Reclutamientos de "prueba 1":');
    reclutamientosPrueba1.forEach((r, i) => {
      const estadoNombre = estadosMap.get(r.estado_agendamiento) || 'N/A';
      console.log(`  ${i + 1}. ID: ${r.id} - Estado: ${estadoNombre} - Fecha: ${r.fecha_sesion}`);
    });
    
    console.log('\n📋 Historial de "prueba 1":');
    historialPrueba1.forEach((h, i) => {
      console.log(`  ${i + 1}. Estado: ${h.estado_sesion} - Fecha: ${h.fecha_participacion}`);
    });

    // 6. Contar cuántos están realmente finalizados
    const finalizados = reclutamientosPrueba1.filter(r => {
      const estadoNombre = estadosMap.get(r.estado_agendamiento);
      return estadoNombre === 'Finalizado';
    });
    
    const completadosEnHistorial = historialPrueba1.filter(h => h.estado_sesion === 'completada');
    
    console.log('\n📊 Análisis:');
    console.log(`  - Reclutamientos finalizados: ${finalizados.length}`);
    console.log(`  - Registros "completados" en historial: ${completadosEnHistorial.length}`);
    
    if (finalizados.length !== completadosEnHistorial.length) {
      console.log('⚠️ ¡DISCREPANCIA DETECTADA!');
      console.log('   Los números no coinciden. Necesitamos corregir el historial.');
    }

    console.log('\n✅ === VERIFICACIÓN COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  }
}

// Ejecutar el script
verificarEstadosReales(); 