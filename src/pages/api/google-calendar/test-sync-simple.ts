import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🧪 TEST: Iniciando test de sincronización simple para usuario:', userId);

    // 1. Verificar tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      return res.status(400).json({ 
        error: 'Usuario no tiene Google Calendar conectado',
        details: tokensError?.message 
      });
    }

    console.log('🧪 TEST: Tokens encontrados');

    // 2. Buscar reclutamientos (simplificado)
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message 
      });
    }

    console.log('🧪 TEST: Reclutamientos encontrados:', reclutamientos?.length || 0);

    if (!reclutamientos || reclutamientos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay reclutamientos para sincronizar',
        synced: 0,
        errors: 0
      });
    }

    let syncedCount = 0;
    let errorCount = 0;
    const errors = [];

    // 3. Procesar cada reclutamiento (sin Google Calendar API)
    for (const reclutamiento of reclutamientos) {
      try {
        console.log('🧪 TEST: Procesando reclutamiento:', reclutamiento.id);

        // Verificar si ya existe en google_calendar_events
        const { data: existingEvent, error: existingError } = await supabase
          .from('google_calendar_events')
          .select('*')
          .eq('user_id', userId)
          .eq('sesion_id', reclutamiento.id)
          .single();

        if (existingEvent && !existingError) {
          console.log('🧪 TEST: Evento existente encontrado, actualizando timestamp');
          
          // Actualizar timestamp de sincronización
          const { error: updateError } = await supabase
            .from('google_calendar_events')
            .update({
              sync_status: 'synced',
              last_sync_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('sesion_id', reclutamiento.id);

          if (updateError) {
            console.error('❌ Error actualizando evento existente:', updateError);
            errors.push(`Error actualizando evento ${reclutamiento.id}: ${updateError.message}`);
            errorCount++;
          } else {
            console.log('✅ Evento existente actualizado');
            syncedCount++;
          }
        } else {
          console.log('🧪 TEST: Creando nuevo evento simulado');
          
          // Crear referencia simulada (sin Google Calendar API)
          const { error: insertError } = await supabase
            .from('google_calendar_events')
            .insert({
              user_id: userId,
              sesion_id: reclutamiento.id,
              google_event_id: `test_event_${reclutamiento.id}_${Date.now()}`,
              google_calendar_id: 'primary',
              sync_status: 'synced',
              last_sync_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('❌ Error insertando evento simulado:', insertError);
            errors.push(`Error insertando evento ${reclutamiento.id}: ${insertError.message}`);
            errorCount++;
          } else {
            console.log('✅ Evento simulado creado');
            syncedCount++;
          }
        }

      } catch (error) {
        console.error(`❌ Error procesando reclutamiento ${reclutamiento.id}:`, error);
        errors.push(`Error procesando reclutamiento ${reclutamiento.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        errorCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Test de sincronización completado: ${syncedCount} eventos procesados, ${errorCount} errores`,
      synced: syncedCount,
      errors: errorCount,
      error_details: errors,
      total_reclutamientos: reclutamientos.length
    });

  } catch (error) {
    console.error('❌ Error en test de sincronización:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
