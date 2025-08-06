const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function poblarHistorialConDatosReales() {
  console.log('🔄 === POBLANDO HISTORIAL CON DATOS REALES ===');
  
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

    if (reclutamientos.length === 0) {
      console.log('⚠️ No hay reclutamientos con participantes internos para poblar');
      return;
    }

    // 2. Obtener información adicional por separado
    console.log('\n2. Obteniendo información adicional...');
    
    // Obtener participantes internos
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes_internos')
      .select('id, nombre');
    
    if (errorParticipantes) {
      throw new Error(`Error obteniendo participantes: ${errorParticipantes.message}`);
    }

    // Obtener investigaciones
    const { data: investigaciones, error: errorInvestigaciones } = await supabase
      .from('investigaciones')
      .select('id, nombre');
    
    if (errorInvestigaciones) {
      throw new Error(`Error obteniendo investigaciones: ${errorInvestigaciones.message}`);
    }

    // Obtener estados de agendamiento
    const { data: estadosAgendamiento, error: errorEstados } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre');
    
    if (errorEstados) {
      throw new Error(`Error obteniendo estados: ${errorEstados.message}`);
    }

    // Crear mapas para búsqueda rápida
    const participantesMap = new Map(participantes.map(p => [p.id, p.nombre]));
    const investigacionesMap = new Map(investigaciones.map(i => [i.id, i.nombre]));
    const estadosMap = new Map(estadosAgendamiento.map(e => [e.id, e.nombre]));

    // Mostrar los reclutamientos encontrados
    console.log('\n📋 Reclutamientos encontrados:');
    reclutamientos.forEach((r, i) => {
      const participanteNombre = participantesMap.get(r.participantes_internos_id) || 'N/A';
      const investigacionNombre = investigacionesMap.get(r.investigacion_id) || 'N/A';
      const estadoNombre = estadosMap.get(r.estado_agendamiento) || 'N/A';
      console.log(`  ${i + 1}. ${participanteNombre} - ${investigacionNombre} - ${estadoNombre}`);
    });

    // 3. Verificar qué datos ya existen en el historial
    console.log('\n3. Verificando datos existentes en historial...');
    const { data: historialExistente, error: errorHistorial } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('participante_interno_id, investigacion_id, fecha_participacion');

    if (errorHistorial) {
      throw new Error(`Error verificando historial existente: ${errorHistorial.message}`);
    }

    console.log(`✅ Encontrados ${historialExistente.length} registros en historial existente`);

    // 4. Preparar datos para inserción (evitar duplicados)
    const datosParaInsertar = [];
    
    for (const reclutamiento of reclutamientos) {
      // Verificar si ya existe en el historial
      const existe = historialExistente.some(h => 
        h.participante_interno_id === reclutamiento.participantes_internos_id &&
        h.investigacion_id === reclutamiento.investigacion_id &&
        h.fecha_participacion === reclutamiento.fecha_sesion
      );

      if (!existe) {
        // Determinar estado de sesión basado en estado de agendamiento
        const estadoNombre = estadosMap.get(reclutamiento.estado_agendamiento) || 'Pendiente';
        let estadoSesion = 'completada';
        if (estadoNombre === 'Cancelado') {
          estadoSesion = 'cancelada';
        } else if (estadoNombre === 'Pendiente de agendamiento') {
          estadoSesion = 'reprogramada';
        }

        const participanteNombre = participantesMap.get(reclutamiento.participantes_internos_id) || 'N/A';
        const investigacionNombre = investigacionesMap.get(reclutamiento.investigacion_id) || 'N/A';

        datosParaInsertar.push({
          participante_interno_id: reclutamiento.participantes_internos_id,
          investigacion_id: reclutamiento.investigacion_id,
          fecha_participacion: reclutamiento.fecha_sesion,
          estado_sesion: estadoSesion,
          duracion_minutos: reclutamiento.duracion_sesion,
          reclutador_id: reclutamiento.reclutador_id,
          observaciones: `Sesión de ${investigacionNombre} - Estado: ${estadoNombre}`
        });
      }
    }

    console.log(`📝 Preparados ${datosParaInsertar.length} registros para inserción`);

    if (datosParaInsertar.length === 0) {
      console.log('✅ No hay nuevos datos para insertar');
    } else {
      // 5. Insertar datos en el historial
      console.log('\n4. Insertando datos en el historial...');
      const { data: datosInsertados, error: errorInsercion } = await supabase
        .from('historial_participacion_participantes_internos')
        .insert(datosParaInsertar)
        .select();

      if (errorInsercion) {
        throw new Error(`Error insertando datos: ${errorInsercion.message}`);
      }

      console.log(`✅ Insertados ${datosInsertados.length} registros en el historial`);
    }

    // 6. Verificar estadísticas finales
    console.log('\n5. Verificando estadísticas finales...');
    const { data: estadisticas, error: errorEstadisticas } = await supabase
      .from('historial_participacion_participantes_internos')
      .select(`
        participante_interno_id,
        estado_sesion,
        fecha_participacion,
        participantes_internos!inner(nombre)
      `)
      .eq('estado_sesion', 'completada');

    if (errorEstadisticas) {
      throw new Error(`Error obteniendo estadísticas: ${errorEstadisticas.message}`);
    }

    // Agrupar por participante
    const estadisticasPorParticipante = {};
    estadisticas.forEach(registro => {
      const participanteId = registro.participante_interno_id;
      const participanteNombre = registro.participantes_internos.nombre;
      
      if (!estadisticasPorParticipante[participanteId]) {
        estadisticasPorParticipante[participanteId] = {
          nombre: participanteNombre,
          total_completadas: 0,
          ultima_sesion: null
        };
      }
      
      estadisticasPorParticipante[participanteId].total_completadas++;
      
      const fechaSesion = new Date(registro.fecha_participacion);
      if (!estadisticasPorParticipante[participanteId].ultima_sesion || 
          fechaSesion > new Date(estadisticasPorParticipante[participanteId].ultima_sesion)) {
        estadisticasPorParticipante[participanteId].ultima_sesion = registro.fecha_participacion;
      }
    });

    console.log('\n📊 Estadísticas por participante interno:');
    Object.values(estadisticasPorParticipante).forEach(participante => {
      console.log(`  ${participante.nombre}:`);
      console.log(`    - Participaciones completadas: ${participante.total_completadas}`);
      console.log(`    - Última sesión: ${participante.ultima_sesion || 'N/A'}`);
    });

    console.log('\n✅ === POBLADO COMPLETADO ===');

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  }
}

// Ejecutar el script
poblarHistorialConDatosReales(); 