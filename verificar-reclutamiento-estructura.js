const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarReclutamientoEstructura() {
  console.log('🔍 === VERIFICANDO ESTRUCTURA DEL RECLUTAMIENTO ===\n');

  try {
    const reclutamientoId = '4fac3e97-5af8-450a-9da1-d3b6baa6212c';

    // Obtener información del reclutamiento
    const { data: reclutamiento, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        participantes(id, empresa_id),
        participantes_internos(id)
      `)
      .eq('id', reclutamientoId)
      .single();

    if (errorReclutamiento) {
      console.error('❌ Error obteniendo reclutamiento:', errorReclutamiento);
      return;
    }

    console.log('✅ Reclutamiento encontrado:');
    console.log(JSON.stringify(reclutamiento, null, 2));

    // Verificar si es participante interno o externo
    if (reclutamiento.participantes_id) {
      console.log('\n👤 Es participante EXTERNO');
      console.log('   participante_id:', reclutamiento.participantes_id);
      console.log('   empresa_id:', reclutamiento.participantes?.empresa_id);
    } else if (reclutamiento.participantes_internos_id) {
      console.log('\n👤 Es participante INTERNO');
      console.log('   participante_interno_id:', reclutamiento.participantes_internos_id);
    } else {
      console.log('\n❌ No se pudo determinar el tipo de participante');
    }

    // Verificar estado
    const { data: estado, error: errorEstado } = await supabase
      .from('estado_agendamiento_cat')
      .select('nombre')
      .eq('id', reclutamiento.estado_agendamiento)
      .single();

    if (!errorEstado) {
      console.log('\n📊 Estado:', estado.nombre);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarReclutamientoEstructura(); 