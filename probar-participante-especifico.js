const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probarParticipanteEspecifico() {
  console.log('🧪 === PROBANDO PARTICIPANTE ESPECÍFICO ===\n');

  try {
    // 1. Buscar el participante "prueba 12344"
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('*')
      .eq('nombre', 'prueba 12344');

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    if (!participantes || participantes.length === 0) {
      console.log('❌ No se encontró el participante "prueba 12344"');
      return;
    }

    const participante = participantes[0];
    console.log(`✅ Participante encontrado: ${participante.nombre} (${participante.id})`);

    // 2. Verificar reclutamientos actuales
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        estado_agendamiento_cat!inner(nombre)
      `)
      .eq('participantes_id', participante.id);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return;
    }

    console.log(`📊 Reclutamientos actuales: ${reclutamientos.length}`);
    const finalizados = reclutamientos.filter(r => r.estado_agendamiento_cat.nombre === 'Finalizado');
    console.log(`📊 Reclutamientos finalizados: ${finalizados.length}`);

    // 3. Verificar historial
    const { data: historial, error: errorHistorial } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('participante_id', participante.id);

    if (errorHistorial) {
      console.error('❌ Error obteniendo historial:', errorHistorial);
      return;
    }

    console.log(`📊 Registros en historial: ${historial.length}`);
    const completadas = historial.filter(h => h.estado_sesion === 'completada');
    console.log(`📊 Participaciones completadas: ${completadas.length}`);

    // 4. Llamar a la API de estadísticas
    console.log('\n🔍 Llamando a la API de estadísticas...');
    const response = await fetch(`http://localhost:3000/api/estadisticas-participante?participante_id=${participante.id}`);
    
    if (response.ok) {
      const estadisticas = await response.json();
      console.log(`✅ Estadísticas de la API:`, estadisticas);
      
      // 5. Verificar si coinciden
      const apiTotal = estadisticas.estadisticas?.total_participaciones || 0;
      if (apiTotal === completadas.length) {
        console.log(`✅ Sincronización exitosa: API=${apiTotal}, Historial=${completadas.length}`);
      } else {
        console.log(`⚠️  Discrepancia: API=${apiTotal}, Historial=${completadas.length}`);
      }
    } else {
      console.error(`❌ Error obteniendo estadísticas: ${response.status} ${response.statusText}`);
    }

    console.log('\n✅ === PRUEBA COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

probarParticipanteEspecifico(); 