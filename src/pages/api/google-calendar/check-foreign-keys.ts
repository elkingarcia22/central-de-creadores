import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar si el ID del reclutamiento existe en la tabla reclutamientos
    const reclutamientoId = 'baceab76-4714-4278-afe1-fcac1066ef35';
    
    const { data: reclutamiento, error: reclutamientoError } = await supabase
      .from('reclutamientos')
      .select('id, fecha_sesion, hora_sesion')
      .eq('id', reclutamientoId)
      .single();

    console.log('🔍 Reclutamiento encontrado:', reclutamiento ? 'Sí' : 'No', reclutamientoError?.message);

    // Verificar si existe en otras tablas posibles
    const tablasPosibles = ['sesiones', 'eventos', 'calendario_events'];
    const resultados = [];

    for (const tabla of tablasPosibles) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('id')
          .eq('id', reclutamientoId)
          .limit(1);

        resultados.push({
          tabla: tabla,
          existe: !error && data && data.length > 0,
          error: error?.message
        });
      } catch (err) {
        resultados.push({
          tabla: tabla,
          existe: false,
          error: err instanceof Error ? err.message : 'Error desconocido'
        });
      }
    }

    // Intentar insertar en google_calendar_events con diferentes enfoques
    const testInserts = [];

    // 1. Intentar con el ID del reclutamiento
    try {
      const { data, error } = await supabase
        .from('google_calendar_events')
        .insert({
          user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
          sesion_id: reclutamientoId,
          google_event_id: 'test_event_reclutamiento',
          google_calendar_id: 'primary',
          sync_status: 'synced',
          last_sync_at: new Date().toISOString()
        })
        .select()
        .single();

      testInserts.push({
        tipo: 'reclutamiento_id',
        sesion_id: reclutamientoId,
        success: !error,
        error: error?.message,
        data: data
      });

      if (data) {
        // Eliminar el registro de prueba
        await supabase
          .from('google_calendar_events')
          .delete()
          .eq('id', data.id);
      }
    } catch (err) {
      testInserts.push({
        tipo: 'reclutamiento_id',
        sesion_id: reclutamientoId,
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      });
    }

    // 2. Intentar con un UUID válido pero que no existe
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    try {
      const { data, error } = await supabase
        .from('google_calendar_events')
        .insert({
          user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
          sesion_id: fakeUuid,
          google_event_id: 'test_event_fake',
          google_calendar_id: 'primary',
          sync_status: 'synced',
          last_sync_at: new Date().toISOString()
        })
        .select()
        .single();

      testInserts.push({
        tipo: 'fake_uuid',
        sesion_id: fakeUuid,
        success: !error,
        error: error?.message,
        data: data
      });

      if (data) {
        // Eliminar el registro de prueba
        await supabase
          .from('google_calendar_events')
          .delete()
          .eq('id', data.id);
      }
    } catch (err) {
      testInserts.push({
        tipo: 'fake_uuid',
        sesion_id: fakeUuid,
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verificación de foreign keys completada',
      reclutamiento: {
        id: reclutamientoId,
        existe: !!reclutamiento,
        error: reclutamientoError?.message,
        data: reclutamiento
      },
      tablas_verificadas: resultados,
      test_inserts: testInserts
    });

  } catch (error) {
    console.error('❌ Error verificando foreign keys:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
