const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDiscrepanciaEspecifica() {
  console.log('🔍 === VERIFICANDO DISCREPANCIA ESPECÍFICA ===\n');

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

    // 2. Verificar reclutamientos finalizados
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

    const finalizados = reclutamientos.filter(r => r.estado_agendamiento_cat.nombre === 'Finalizado');
    console.log(`📊 Reclutamientos finalizados: ${finalizados.length}`);
    
    finalizados.forEach((rec, index) => {
      console.log(`  ${index + 1}. ID: ${rec.id}, Fecha: ${rec.fecha_sesion}, Estado: ${rec.estado_agendamiento_cat.nombre}`);
    });

    // 3. Verificar historial
    const { data: historial, error: errorHistorial } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('participante_id', participante.id);

    if (errorHistorial) {
      console.error('❌ Error obteniendo historial:', errorHistorial);
      return;
    }

    const completadas = historial.filter(h => h.estado_sesion === 'completada');
    console.log(`📊 Participaciones completadas en historial: ${completadas.length}`);
    
    completadas.forEach((hist, index) => {
      console.log(`  ${index + 1}. ID: ${hist.id}, Fecha: ${hist.fecha_participacion}, Estado: ${hist.estado_sesion}`);
    });

    // 4. Encontrar la discrepancia
    console.log('\n🔍 === ANÁLISIS DE DISCREPANCIA ===');
    
    const fechasFinalizadas = finalizados.map(r => r.fecha_sesion);
    const fechasHistorial = completadas.map(h => h.fecha_participacion);
    
    console.log('Fechas de reclutamientos finalizados:', fechasFinalizadas);
    console.log('Fechas en historial:', fechasHistorial);
    
    const faltantes = fechasFinalizadas.filter(fecha => !fechasHistorial.includes(fecha));
    const sobrantes = fechasHistorial.filter(fecha => !fechasFinalizadas.includes(fecha));
    
    if (faltantes.length > 0) {
      console.log('❌ Fechas faltantes en historial:', faltantes);
    }
    
    if (sobrantes.length > 0) {
      console.log('❌ Fechas sobrantes en historial:', sobrantes);
    }
    
    if (faltantes.length === 0 && sobrantes.length === 0) {
      console.log('✅ No hay discrepancias');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarDiscrepanciaEspecifica(); 