const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function corregirHistorialParticipantesInternos() {
  console.log('🔧 === CORRIGIENDO HISTORIAL DE PARTICIPANTES INTERNOS ===');
  
  try {
    // 1. Limpiar historial actual
    console.log('\n1. Limpiando historial actual...');
    const { error: errorDelete } = await supabase
      .from('historial_participacion_participantes_internos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

    if (errorDelete) {
      throw new Error(`Error eliminando historial: ${errorDelete.message}`);
    }

    console.log('✅ Historial limpiado');

    // 2. Obtener reclutamientos con participantes internos
    console.log('\n2. Obteniendo reclutamientos con participantes internos...');
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

    console.log(`✅ Encontrados ${reclutamientos.length} reclutamientos`);

    // 3. Obtener información adicional
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes_internos')
      .select('id, nombre');
    
    const { data: investigaciones, error: errorInvestigaciones } = await supabase
      .from('investigaciones')
      .select('id, nombre');
    
    const { data: estadosAgendamiento, error: errorEstados } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre');

    if (errorParticipantes || errorInvestigaciones || errorEstados) {
      throw new Error('Error obteniendo datos adicionales');
    }

    const participantesMap = new Map(participantes.map(p => [p.id, p.nombre]));
    const investigacionesMap = new Map(investigaciones.map(i => [i.id, i.nombre]));
    const estadosMap = new Map(estadosAgendamiento.map(e => [e.id, e.nombre]));

    // 4. Preparar datos corregidos
    console.log('\n3. Preparando datos corregidos...');
    const datosParaInsertar = [];
    
    for (const reclutamiento of reclutamientos) {
      const estadoNombre = estadosMap.get(reclutamiento.estado_agendamiento) || 'Pendiente';
      
      // Solo marcar como 'completada' si realmente está finalizada
      // Los estados válidos son: 'completada', 'cancelada', 'reprogramada'
      let estadoSesion = 'reprogramada'; // Por defecto para estados no finalizados
      if (estadoNombre === 'Finalizado') {
        estadoSesion = 'completada';
      } else if (estadoNombre === 'Cancelado') {
        estadoSesion = 'cancelada';
      }
      // Para 'Pendiente' y otros estados, usar 'reprogramada'

      const participanteNombre = participantesMap.get(reclutamiento.participantes_internos_id) || 'N/A';
      const investigacionNombre = investigacionesMap.get(reclutamiento.investigacion_id) || 'N/A';

      datosParaInsertar.push({
        participante_interno_id: reclutamiento.participantes_internos_id,
        investigacion_id: reclutamiento.investigacion_id,
        fecha_participacion: reclutamiento.fecha_sesion,
        estado_sesion: estadoSesion,
        duracion_minutos: reclutamiento.duracion_sesion,
        reclutador_id: reclutamiento.reclutador_id,
        observaciones: `Sesión de ${investigacionNombre} - Estado real: ${estadoNombre}`
      });
    }

    console.log(`📝 Preparados ${datosParaInsertar.length} registros para inserción`);

    // 5. Insertar datos corregidos
    console.log('\n4. Insertando datos corregidos...');
    const { data: datosInsertados, error: errorInsercion } = await supabase
      .from('historial_participacion_participantes_internos')
      .insert(datosParaInsertar)
      .select();

    if (errorInsercion) {
      throw new Error(`Error insertando datos: ${errorInsercion.message}`);
    }

    console.log(`✅ Insertados ${datosInsertados.length} registros corregidos`);

    // 6. Verificar resultados
    console.log('\n5. Verificando resultados...');
    const { data: historialFinal, error: errorHistorialFinal } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('*');

    if (errorHistorialFinal) {
      throw new Error(`Error verificando historial final: ${errorHistorialFinal.message}`);
    }

    console.log('\n📋 Historial corregido:');
    historialFinal.forEach((h, i) => {
      const participanteNombre = participantesMap.get(h.participante_interno_id) || 'N/A';
      console.log(`  ${i + 1}. ${participanteNombre}`);
      console.log(`     Fecha: ${h.fecha_participacion}`);
      console.log(`     Estado: ${h.estado_sesion}`);
      console.log(`     Observaciones: ${h.observaciones}`);
      console.log('');
    });

    // 7. Verificar estadísticas específicas
    console.log('\n6. Verificando estadísticas específicas...');
    const participantePrueba1 = 'af4eb891-2a6e-44e0-84d3-b00592775c08';
    
    const historialPrueba1 = historialFinal.filter(h => h.participante_interno_id === participantePrueba1);
    const completadasPrueba1 = historialPrueba1.filter(h => h.estado_sesion === 'completada');
    const ultimaSesionPrueba1 = completadasPrueba1.length > 0 
      ? Math.max(...completadasPrueba1.map(h => new Date(h.fecha_participacion)))
      : null;

    console.log(`📊 Participante "prueba 1":`);
    console.log(`  - Total registros en historial: ${historialPrueba1.length}`);
    console.log(`  - Participaciones completadas: ${completadasPrueba1.length}`);
    console.log(`  - Última sesión: ${ultimaSesionPrueba1 ? ultimaSesionPrueba1.toISOString() : 'N/A'}`);

    // 8. Probar la API
    console.log('\n7. Probando API...');
    const response = await fetch(`http://localhost:3000/api/estadisticas-participante-interno?participante_interno_id=${participantePrueba1}`);
    if (response.ok) {
      const estadisticas = await response.json();
      console.log(`📊 API devuelve:`, estadisticas);
    } else {
      console.log(`❌ Error en API: ${response.status}`);
    }

    console.log('\n✅ === CORRECCIÓN COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error en la corrección:', error.message);
  }
}

// Ejecutar el script
corregirHistorialParticipantesInternos(); 