const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verificarInvestigacionesReclutamiento() {
  try {
    console.log('🔍 Verificando investigaciones para reclutamiento...');
    
    // 1. Obtener todas las investigaciones con estados de reclutamiento
    const { data: investigaciones, error: errorInv } = await supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        estado,
        fecha_inicio,
        fecha_fin,
        riesgo_automatico,
        libreto,
        responsable_id,
        implementador_id
      `)
      .in('estado', ['en_borrador', 'en_progreso', 'pausado', 'deprecado'])
      .order('fecha_inicio', { ascending: true });

    if (errorInv) {
      console.log('❌ Error obteniendo investigaciones:', errorInv.message);
      return;
    }

    console.log('📊 Total investigaciones encontradas:', investigaciones?.length || 0);
    
    if (investigaciones && investigaciones.length > 0) {
      console.log('📋 Detalles de investigaciones:');
      investigaciones.forEach((inv, index) => {
        console.log(`${index + 1}. ${inv.nombre} - Estado: ${inv.estado} - Responsable: ${inv.responsable_id}`);
      });
    }

    // 2. Verificar si hay investigaciones con otros estados
    const { data: todasInvestigaciones, error: errorTodas } = await supabase
      .from('investigaciones')
      .select('estado')
      .order('estado');

    if (errorTodas) {
      console.log('❌ Error obteniendo todas las investigaciones:', errorTodas.message);
      return;
    }

    // Contar estados únicos
    const estadosUnicos = [...new Set(todasInvestigaciones.map(inv => inv.estado))];
    console.log('\n📊 Estados únicos en investigaciones:', estadosUnicos);
    
    // Contar por estado
    const conteoEstados = {};
    todasInvestigaciones.forEach(inv => {
      conteoEstados[inv.estado] = (conteoEstados[inv.estado] || 0) + 1;
    });
    
    console.log('📈 Conteo por estado:', conteoEstados);

    // 3. Verificar si hay investigaciones con estado_reclutamiento
    const { data: investigacionesConEstadoReclutamiento, error: errorEstadoReclutamiento } = await supabase
      .from('investigaciones')
      .select('id, nombre, estado, estado_reclutamiento')
      .not('estado_reclutamiento', 'is', null);

    if (errorEstadoReclutamiento) {
      console.log('❌ Error obteniendo investigaciones con estado_reclutamiento:', errorEstadoReclutamiento.message);
    } else {
      console.log('\n📊 Investigaciones con estado_reclutamiento:', investigacionesConEstadoReclutamiento?.length || 0);
      if (investigacionesConEstadoReclutamiento && investigacionesConEstadoReclutamiento.length > 0) {
        console.log('📋 Detalles:', investigacionesConEstadoReclutamiento);
      }
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

verificarInvestigacionesReclutamiento(); 