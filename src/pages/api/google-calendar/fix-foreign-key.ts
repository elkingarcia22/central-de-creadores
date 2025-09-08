import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Primero, vamos a verificar si podemos insertar sin el constraint
    // Intentando insertar con un enfoque diferente
    
    const testRecord = {
      user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
      sesion_id: 'baceab76-4714-4278-afe1-fcac1066ef35', // ID del reclutamiento
      google_event_id: 'test_event_fix_' + Date.now(),
      google_calendar_id: 'primary',
      sync_status: 'synced',
      last_sync_at: new Date().toISOString()
    };

    console.log('🔧 Intentando insertar registro de prueba:', testRecord);

    // Intentar insertar
    const { data, error } = await supabase
      .from('google_calendar_events')
      .insert(testRecord)
      .select()
      .single();

    if (error) {
      console.error('❌ Error insertando:', error);
      
      // Si el error es de foreign key, vamos a intentar una solución alternativa
      if (error.code === '23503' && error.message.includes('foreign key constraint')) {
        console.log('🔧 Error de foreign key detectado, intentando solución alternativa...');
        
        // Intentar insertar con un ID que sabemos que existe en reclutamientos
        const { data: reclutamientos, error: reclutamientosError } = await supabase
          .from('reclutamientos')
          .select('id')
          .limit(1);

        if (reclutamientos && reclutamientos.length > 0) {
          const reclutamientoId = reclutamientos[0].id;
          console.log('🔧 Usando ID de reclutamiento existente:', reclutamientoId);

          const alternativeRecord = {
            ...testRecord,
            sesion_id: reclutamientoId
          };

          const { data: altData, error: altError } = await supabase
            .from('google_calendar_events')
            .insert(alternativeRecord)
            .select()
            .single();

          if (altError) {
            return res.status(200).json({
              success: false,
              message: 'No se pudo insertar con ningún enfoque',
              original_error: error.message,
              alternative_error: altError.message,
              constraint_issue: 'El foreign key constraint está referenciando una tabla incorrecta',
              recommendation: 'Verificar la definición del constraint en la base de datos'
            });
          } else {
            // Eliminar el registro de prueba
            await supabase
              .from('google_calendar_events')
              .delete()
              .eq('id', altData.id);

            return res.status(200).json({
              success: true,
              message: 'Insert exitoso con ID de reclutamiento existente',
              data: altData,
              note: 'El constraint funciona con IDs de reclutamientos existentes'
            });
          }
        }
      }

      return res.status(200).json({
        success: false,
        message: 'Error insertando registro',
        error: error.message,
        code: error.code,
        constraint_issue: 'El foreign key constraint está causando problemas'
      });
    } else {
      // Eliminar el registro de prueba
      await supabase
        .from('google_calendar_events')
        .delete()
        .eq('id', data.id);

      return res.status(200).json({
        success: true,
        message: 'Insert exitoso',
        data: data,
        note: 'El constraint funciona correctamente'
      });
    }

  } catch (error) {
    console.error('❌ Error en fix-foreign-key:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
