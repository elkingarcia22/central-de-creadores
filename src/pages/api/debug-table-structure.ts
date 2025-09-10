import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 === DEBUG TABLE STRUCTURE ===');

    // 1. Verificar si existe la tabla sesiones
    console.log('🔍 1. Verificando tabla sesiones...');
    const { data: sesionesData, error: sesionesError } = await supabaseServer
      .from('sesiones')
      .select('*')
      .limit(1);

    console.log('🔍 Tabla sesiones existe:', !sesionesError);
    console.log('🔍 Error en tabla sesiones:', sesionesError);

    // 2. Verificar estructura de google_calendar_events
    console.log('🔍 2. Verificando estructura de google_calendar_events...');
    const { data: eventsData, error: eventsError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .limit(1);

    console.log('🔍 Tabla google_calendar_events existe:', !eventsError);
    console.log('🔍 Error en google_calendar_events:', eventsError);
    console.log('🔍 Estructura de google_calendar_events:', eventsData);

    // 3. Verificar si existe la tabla reclutamientos
    console.log('🔍 3. Verificando tabla reclutamientos...');
    const { data: reclutamientosData, error: reclutamientosError } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .limit(1);

    console.log('🔍 Tabla reclutamientos existe:', !reclutamientosError);
    console.log('🔍 Error en tabla reclutamientos:', reclutamientosError);

    // 4. Intentar insertar un registro de prueba en google_calendar_events
    console.log('🔍 4. Probando inserción en google_calendar_events...');
    const testData = {
      user_id: 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
      sesion_id: '65b06097-d85a-40a2-90f8-1423786ce952', // ID de reclutamiento existente
      google_event_id: 'test-event-id',
      google_calendar_id: 'primary',
      sync_status: 'synced',
      last_sync_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabaseServer
      .from('google_calendar_events')
      .insert(testData)
      .select();

    console.log('🔍 Resultado de inserción de prueba:', { insertData, insertError });

    // Si la inserción falló, intentar con un ID de reclutamiento que sabemos que existe
    if (insertError) {
      console.log('🔍 5. Probando con ID de reclutamiento existente...');
      const { data: existingReclutamiento } = await supabaseServer
        .from('reclutamientos')
        .select('id')
        .limit(1)
        .single();

      if (existingReclutamiento) {
        const testData2 = {
          user_id: 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
          sesion_id: existingReclutamiento.id,
          google_event_id: 'test-event-id-2',
          google_calendar_id: 'primary',
          sync_status: 'synced',
          last_sync_at: new Date().toISOString()
        };

        const { data: insertData2, error: insertError2 } = await supabaseServer
          .from('google_calendar_events')
          .insert(testData2)
          .select();

        console.log('🔍 Resultado de inserción con ID existente:', { insertData2, insertError2 });
      }
    }

    return res.status(200).json({
      success: true,
      debug_info: {
        sesiones_table_exists: !sesionesError,
        sesiones_error: sesionesError,
        google_calendar_events_exists: !eventsError,
        google_calendar_events_error: eventsError,
        google_calendar_events_structure: eventsData,
        reclutamientos_table_exists: !reclutamientosError,
        reclutamientos_error: reclutamientosError,
        test_insert_result: { insertData, insertError }
      }
    });

  } catch (error) {
    console.error('❌ Error en debug table structure:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
