const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probarInsercionDirecta() {
  console.log('🧪 === PROBANDO INSERCIÓN DIRECTA ===\n');

  try {
    const reclutamientoId = '4fac3e97-5af8-450a-9da1-d3b6baa6212c';

    // Obtener información del reclutamiento
    const { data: reclutamiento, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamientoId)
      .single();

    if (errorReclutamiento) {
      console.error('❌ Error obteniendo reclutamiento:', errorReclutamiento);
      return;
    }

    console.log('✅ Reclutamiento encontrado:', reclutamiento.id);

    // Intentar insertar directamente
    const nuevoRegistro = {
      participante_interno_id: reclutamiento.participantes_internos_id,
      investigacion_id: reclutamiento.investigacion_id,
      reclutamiento_id: reclutamiento.id,
      fecha_participacion: reclutamiento.fecha_sesion,
      estado_sesion: 'completada',
      duracion_minutos: reclutamiento.duracion_sesion,
      reclutador_id: reclutamiento.reclutador_id,
      observaciones: 'Sincronizado automáticamente',
      creado_por: reclutamiento.creado_por
    };

    console.log('📋 Datos a insertar:');
    console.log(JSON.stringify(nuevoRegistro, null, 2));

    const { data: resultado, error: errorInsert } = await supabase
      .from('historial_participacion_participantes_internos')
      .insert(nuevoRegistro)
      .select();

    if (errorInsert) {
      console.error('❌ Error en inserción:', errorInsert);
    } else {
      console.log('✅ Inserción exitosa:', resultado);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

probarInsercionDirecta(); 