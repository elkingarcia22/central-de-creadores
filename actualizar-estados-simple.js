// ====================================
// ACTUALIZAR ESTADOS SIMPLE
// ====================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjI5NzIwMCwiZXhwIjoyMDQ3ODczMjAwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

const actualizarEstados = async () => {
  console.log('🚀 === ACTUALIZANDO ESTADOS ===');
  
  try {
    // 1. Verificar estados actuales
    console.log('1. Verificando estados actuales...');
    const { data: estadosActuales, error: errorEstados } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        estado_agendamiento_cat!inner(nombre)
      `)
      .order('fecha_sesion', { ascending: false })
      .limit(10);
    
    if (errorEstados) {
      console.error('Error al obtener estados:', errorEstados);
      return;
    }
    
    console.log('📊 Estados actuales:');
    estadosActuales.forEach(r => {
      console.log(`- ID: ${r.id}`);
      console.log(`  Fecha: ${r.fecha_sesion}`);
      console.log(`  Duración: ${r.duracion_sesion} min`);
      console.log(`  Estado: ${r.estado_agendamiento_cat.nombre}`);
      console.log('');
    });
    
    // 2. Obtener IDs de estados
    console.log('2. Obteniendo IDs de estados...');
    const { data: estados, error: errorEstadosCat } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre');
    
    if (errorEstadosCat) {
      console.error('Error al obtener catálogo de estados:', errorEstadosCat);
      return;
    }
    
    const estadoIds = {};
    estados.forEach(estado => {
      estadoIds[estado.nombre] = estado.id;
    });
    
    console.log('📋 IDs de estados:', estadoIds);
    
    // 3. Actualizar estados manualmente
    console.log('3. Actualizando estados...');
    
    for (const reclutamiento of estadosActuales) {
      if (!reclutamiento.fecha_sesion) {
        // Sin fecha = Pendiente de agendamiento
        await actualizarEstadoReclutamiento(reclutamiento.id, estadoIds['Pendiente de agendamiento']);
        continue;
      }
      
      const fechaSesion = new Date(reclutamiento.fecha_sesion);
      const duracionMinutos = reclutamiento.duracion_sesion || 60;
      const fechaFin = new Date(fechaSesion.getTime() + (duracionMinutos * 60 * 1000));
      const ahora = new Date();
      
      // Convertir a Colombia
      const fechaSesionColombia = fechaSesion.toLocaleString("en-US", { timeZone: "America/Bogota" });
      const fechaFinColombia = fechaFin.toLocaleString("en-US", { timeZone: "America/Bogota" });
      const ahoraColombia = ahora.toLocaleString("en-US", { timeZone: "America/Bogota" });
      
      const fechaSesionCol = new Date(fechaSesionColombia);
      const fechaFinCol = new Date(fechaFinColombia);
      const ahoraCol = new Date(ahoraColombia);
      
      let nuevoEstadoId;
      
      if (ahoraCol < fechaSesionCol) {
        nuevoEstadoId = estadoIds['Pendiente'];
      } else if (ahoraCol >= fechaSesionCol && ahoraCol <= fechaFinCol) {
        nuevoEstadoId = estadoIds['En progreso'];
      } else {
        nuevoEstadoId = estadoIds['Finalizado'];
      }
      
      // Solo actualizar si el estado es diferente
      if (reclutamiento.estado_agendamiento !== nuevoEstadoId) {
        await actualizarEstadoReclutamiento(reclutamiento.id, nuevoEstadoId);
        console.log(`✅ Actualizado ${reclutamiento.id}: ${reclutamiento.estado_agendamiento_cat.nombre} → ${estados.find(e => e.id === nuevoEstadoId)?.nombre}`);
      }
    }
    
    console.log('✅ Estados actualizados exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const actualizarEstadoReclutamiento = async (id, nuevoEstadoId) => {
  const { error } = await supabase
    .from('reclutamientos')
    .update({ 
      estado_agendamiento: nuevoEstadoId,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error(`Error actualizando ${id}:`, error);
  }
};

// Ejecutar
actualizarEstados(); 