const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarParticipacionesActuales() {
  console.log('🔍 === VERIFICANDO PARTICIPACIONES ACTUALES ===\n');

  try {
    // 1. Obtener el participante interno "prueba 1"
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes_internos')
      .select('*')
      .eq('nombre', 'prueba 1');

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    if (!participantes || participantes.length === 0) {
      console.log('❌ No se encontró el participante "prueba 1"');
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
      .eq('participantes_internos_id', participante.id);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return;
    }

    console.log(`\n📊 Reclutamientos actuales: ${reclutamientos.length}`);
    reclutamientos.forEach((rec, index) => {
      console.log(`  ${index + 1}. ID: ${rec.id}`);
      console.log(`     Fecha: ${rec.fecha_sesion}`);
      console.log(`     Estado: ${rec.estado_agendamiento_cat.nombre}`);
      console.log(`     Finalizado: ${rec.estado_agendamiento_cat.nombre === 'Finalizado'}`);
      console.log('');
    });

    // 3. Verificar historial actual
    const { data: historial, error: errorHistorial } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('*')
      .eq('participante_interno_id', participante.id);

    if (errorHistorial) {
      console.error('❌ Error obteniendo historial:', errorHistorial);
      return;
    }

    console.log(`📊 Registros en historial: ${historial.length}`);
    historial.forEach((hist, index) => {
      console.log(`  ${index + 1}. ID: ${hist.id}`);
      console.log(`     Fecha: ${hist.fecha_participacion}`);
      console.log(`     Estado: ${hist.estado_sesion}`);
      console.log(`     Completada: ${hist.estado_sesion === 'completada'}`);
      console.log('');
    });

    // 4. Contar participaciones finalizadas
    const reclutamientosFinalizados = reclutamientos.filter(
      rec => rec.estado_agendamiento_cat.nombre === 'Finalizado'
    );
    
    const historialCompletadas = historial.filter(
      hist => hist.estado_sesion === 'completada'
    );

    console.log('📈 === RESUMEN ===');
    console.log(`✅ Reclutamientos finalizados: ${reclutamientosFinalizados.length}`);
    console.log(`✅ Historial completadas: ${historialCompletadas.length}`);
    
    if (reclutamientosFinalizados.length !== historialCompletadas.length) {
      console.log('⚠️  DISCREPANCIA: Los números no coinciden');
    } else {
      console.log('✅ Los números coinciden');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarParticipacionesActuales(); 