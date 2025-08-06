const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function asignarEstadoReclutamiento() {
  try {
    console.log('🔍 Verificando investigaciones con libreto sin estado de reclutamiento...');
    
    // 1. Obtener investigaciones que tienen libreto pero no estado de reclutamiento
    const { data: investigacionesSinEstado, error: error1 } = await supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        estado,
        estado_reclutamiento,
        libretos_investigacion!inner(titulo)
      `)
      .or('estado_reclutamiento.is.null,estado_reclutamiento.eq.');

    if (error1) {
      console.error('Error obteniendo investigaciones:', error1);
      return;
    }

    console.log(`📋 Encontradas ${investigacionesSinEstado?.length || 0} investigaciones con libreto sin estado de reclutamiento:`);
    investigacionesSinEstado?.forEach(inv => {
      console.log(`  - ${inv.nombre} (${inv.id})`);
    });

    if (!investigacionesSinEstado || investigacionesSinEstado.length === 0) {
      console.log('✅ No hay investigaciones que necesiten actualización');
      return;
    }

    // 2. Obtener el ID del estado "Pendiente"
    const { data: estadoPendiente, error: error2 } = await supabase
      .from('estado_reclutamiento_cat')
      .select('id, nombre, color')
      .eq('nombre', 'Pendiente')
      .single();

    if (error2 || !estadoPendiente) {
      console.error('Error obteniendo estado Pendiente:', error2);
      return;
    }

    console.log(`🎯 Estado "Pendiente" encontrado: ${estadoPendiente.id}`);

    // 3. Actualizar investigaciones con estado "Pendiente"
    const idsParaActualizar = investigacionesSinEstado.map(inv => inv.id);
    
    const { data: resultado, error: error3 } = await supabase
      .from('investigaciones')
      .update({ estado_reclutamiento: estadoPendiente.id })
      .in('id', idsParaActualizar);

    if (error3) {
      console.error('Error actualizando investigaciones:', error3);
      return;
    }

    console.log(`✅ Actualizadas ${idsParaActualizar.length} investigaciones con estado "Pendiente"`);

    // 4. Verificar el resultado
    console.log('🔍 Verificando resultado...');
    const { data: investigacionesActualizadas, error: error4 } = await supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        estado,
        estado_reclutamiento,
        estado_reclutamiento_cat!inner(nombre, color),
        libretos_investigacion!inner(titulo)
      `)
      .in('id', idsParaActualizar);

    if (error4) {
      console.error('Error verificando resultado:', error4);
      return;
    }

    console.log('📊 Investigaciones actualizadas:');
    investigacionesActualizadas?.forEach(inv => {
      console.log(`  - ${inv.nombre}: ${inv.estado_reclutamiento_cat?.nombre} (${inv.estado_reclutamiento_cat?.color})`);
    });

    console.log('🎉 Proceso completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

// Ejecutar el script
asignarEstadoReclutamiento(); 