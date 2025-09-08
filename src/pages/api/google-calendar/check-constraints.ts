import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar la estructura de google_calendar_events
    const { data: events, error: eventsError } = await supabase
      .from('google_calendar_events')
      .select('*')
      .limit(1);

    console.log('🔍 Estructura de google_calendar_events:', eventsError?.message);

    // Verificar si hay registros existentes
    const { data: existingEvents, error: existingError } = await supabase
      .from('google_calendar_events')
      .select('*');

    console.log('🔍 Eventos existentes:', existingEvents?.length || 0, existingError?.message);

    // Intentar insertar un registro de prueba con diferentes valores
    const testRecords = [
      {
        user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
        sesion_id: 'baceab76-4714-4278-afe1-fcac1066ef35', // ID de reclutamiento
        google_event_id: 'test_event_1',
        google_calendar_id: 'primary',
        sync_status: 'synced',
        last_sync_at: new Date().toISOString()
      },
      {
        user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
        sesion_id: 'test-sesion-id', // ID de prueba
        google_event_id: 'test_event_2',
        google_calendar_id: 'primary',
        sync_status: 'synced',
        last_sync_at: new Date().toISOString()
      }
    ];

    const results = [];

    for (const testRecord of testRecords) {
      try {
        const { data, error } = await supabase
          .from('google_calendar_events')
          .insert(testRecord)
          .select()
          .single();

        if (error) {
          results.push({
            test_record: testRecord,
            success: false,
            error: error.message,
            code: error.code
          });
        } else {
          results.push({
            test_record: testRecord,
            success: true,
            data: data
          });

          // Eliminar el registro de prueba
          await supabase
            .from('google_calendar_events')
            .delete()
            .eq('id', data.id);
        }
      } catch (err) {
        results.push({
          test_record: testRecord,
          success: false,
          error: err instanceof Error ? err.message : 'Error desconocido'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Verificación de constraints completada',
      events_structure: eventsError?.message || 'OK',
      existing_events: existingEvents?.length || 0,
      test_results: results
    });

  } catch (error) {
    console.error('❌ Error verificando constraints:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
