const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function buscarParticipanteProblema() {
  console.log('🔍 === BUSCANDO PARTICIPANTE CON PROBLEMA ===\n');

  try {
    // 1. Obtener todos los participantes externos
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('*');

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    console.log(`✅ Participantes externos encontrados: ${participantes.length}`);

    for (const participante of participantes) {
      console.log(`\n🔍 Verificando: ${participante.nombre} (${participante.id})`);

      // 2. Verificar historial
      const { data: historial, error: errorHistorial } = await supabase
        .from('historial_participacion_participantes')
        .select('*')
        .eq('participante_id', participante.id);

      if (errorHistorial) {
        console.error(`❌ Error obteniendo historial para ${participante.nombre}:`, errorHistorial);
        continue;
      }

      const completadas = historial.filter(h => h.estado_sesion === 'completada').length;
      
      if (completadas > 0) {
        console.log(`  ⚠️  Tiene ${completadas} participaciones completadas en historial`);
        console.log(`  📊 Total registros en historial: ${historial.length}`);
        
        historial.forEach((hist, index) => {
          console.log(`    ${index + 1}. Fecha: ${hist.fecha_participacion}, Estado: ${hist.estado_sesion}`);
        });
      }

      // 3. Verificar reclutamientos actuales
      const { data: reclutamientos, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select(`
          *,
          estado_agendamiento_cat!inner(nombre)
        `)
        .eq('participantes_id', participante.id);

      if (errorReclutamientos) {
        console.error(`❌ Error obteniendo reclutamientos para ${participante.nombre}:`, errorReclutamientos);
        continue;
      }

      const finalizados = reclutamientos.filter(r => r.estado_agendamiento_cat.nombre === 'Finalizado').length;
      
      if (finalizados > 0) {
        console.log(`  ⚠️  Tiene ${finalizados} reclutamientos finalizados`);
        console.log(`  📊 Total reclutamientos: ${reclutamientos.length}`);
        
        reclutamientos.forEach((rec, index) => {
          console.log(`    ${index + 1}. Fecha: ${rec.fecha_sesion}, Estado: ${rec.estado_agendamiento_cat.nombre}`);
        });
      }

      // 4. Verificar si hay discrepancia
      if (completadas !== finalizados) {
        console.log(`  🚨 DISCREPANCIA: Historial=${completadas}, Reclutamientos=${finalizados}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

buscarParticipanteProblema(); 