const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function agregarRegistroFaltante() {
  console.log('➕ === AGREGANDO REGISTRO FALTANTE ===\n');

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

    // 2. Buscar el reclutamiento faltante
    const { data: reclutamiento, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        estado_agendamiento_cat!inner(nombre)
      `)
      .eq('participantes_id', participante.id)
      .eq('fecha_sesion', '2025-07-28T17:08:00+00:00')
      .single();

    if (errorReclutamiento) {
      console.error('❌ Error obteniendo reclutamiento:', errorReclutamiento);
      return;
    }

    console.log(`✅ Reclutamiento encontrado: ${reclutamiento.id}, Estado: ${reclutamiento.estado_agendamiento_cat.nombre}`);

    // 3. Agregar el registro faltante al historial
    const nuevoRegistro = {
      participante_id: participante.id,
      investigacion_id: reclutamiento.investigacion_id,
      reclutamiento_id: reclutamiento.id,
      empresa_id: participante.empresa_id,
      fecha_participacion: '2025-07-28T17:08:00+00:00',
      estado_sesion: 'completada',
      duracion_sesion: reclutamiento.duracion_sesion,
      creado_por: reclutamiento.creado_por
    };

    console.log('➕ Agregando registro al historial...');
    const { data: resultado, error: errorInsert } = await supabase
      .from('historial_participacion_participantes')
      .insert(nuevoRegistro)
      .select();

    if (errorInsert) {
      console.error('❌ Error agregando registro:', errorInsert);
      return;
    }

    console.log('✅ Registro agregado exitosamente:', resultado[0]);

    // 4. Verificar el resultado final
    const { data: historialFinal, error: errorHistorialFinal } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('participante_id', participante.id);

    if (!errorHistorialFinal) {
      const completadas = historialFinal.filter(h => h.estado_sesion === 'completada').length;
      console.log(`📈 Historial final: ${historialFinal.length} registros, ${completadas} completadas`);
    }

    console.log('\n✅ === REGISTRO AGREGADO ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

agregarRegistroFaltante(); 