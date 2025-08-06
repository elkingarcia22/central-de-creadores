const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probarEstadisticasParticipantesExternos() {
  console.log('🧪 === PROBANDO ESTADÍSTICAS DE PARTICIPANTES EXTERNOS ===\n');

  try {
    // 1. Obtener participantes externos
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('*')
      .limit(5);

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    console.log(`✅ Participantes externos encontrados: ${participantes.length}`);

    for (const participante of participantes) {
      console.log(`\n🔍 Probando estadísticas para: ${participante.nombre} (${participante.id})`);

      // 2. Llamar a la API de estadísticas
      const response = await fetch(`http://localhost:3000/api/estadisticas-participante?participante_id=${participante.id}`);
      
      if (response.ok) {
        const estadisticas = await response.json();
        console.log(`✅ Estadísticas obtenidas:`, estadisticas);
      } else {
        console.error(`❌ Error obteniendo estadísticas: ${response.status} ${response.statusText}`);
      }
    }

    console.log('\n✅ === PRUEBA COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

probarEstadisticasParticipantesExternos(); 