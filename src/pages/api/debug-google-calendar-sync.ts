import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';
import { autoSyncCalendar } from '../../lib/auto-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { action, reclutamiento_id, user_id } = req.body;

    if (!action || !reclutamiento_id || !user_id) {
      return res.status(400).json({ 
        error: 'Parámetros requeridos: action, reclutamiento_id, user_id' 
      });
    }

    console.log('🔍 === DEBUG GOOGLE CALENDAR SYNC ===');
    console.log('🔍 Action:', action);
    console.log('🔍 Reclutamiento ID:', reclutamiento_id);
    console.log('🔍 User ID:', user_id);

    // 1. Verificar si el usuario tiene Google Calendar conectado
    console.log('🔍 1. Verificando conexión de Google Calendar...');
    const { data: tokens, error: tokensError } = await supabaseServer
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user_id)
      .single();

    console.log('🔍 Tokens encontrados:', tokens ? 'Sí' : 'No');
    console.log('🔍 Error en tokens:', tokensError);

    if (tokensError || !tokens) {
      return res.status(200).json({
        success: false,
        step: 'tokens_check',
        error: 'Usuario no tiene Google Calendar conectado',
        details: tokensError?.message
      });
    }

    // 2. Verificar si los tokens son válidos
    console.log('🔍 2. Verificando validez de tokens...');
    const areTestTokens = tokens.access_token?.startsWith('test_access_token_');
    console.log('🔍 Son tokens de prueba:', areTestTokens);

    if (areTestTokens) {
      return res.status(200).json({
        success: false,
        step: 'tokens_validation',
        error: 'Tokens de prueba detectados',
        details: 'No se puede sincronizar con tokens de prueba'
      });
    }

    // 3. Verificar eventos existentes en google_calendar_events
    console.log('🔍 3. Verificando eventos existentes en google_calendar_events...');
    const { data: existingEvents, error: eventsError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('sesion_id', reclutamiento_id)
      .eq('user_id', user_id);

    console.log('🔍 Eventos existentes encontrados:', existingEvents?.length || 0);
    console.log('🔍 Error en eventos:', eventsError);
    console.log('🔍 Eventos:', existingEvents);

    // 4. Obtener datos del reclutamiento
    console.log('🔍 4. Obteniendo datos del reclutamiento...');
    const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamiento_id)
      .single();

    console.log('🔍 Reclutamiento encontrado:', reclutamiento ? 'Sí' : 'No');
    console.log('🔍 Error en reclutamiento:', reclutamientoError);
    console.log('🔍 Datos del reclutamiento:', reclutamiento);

    if (reclutamientoError || !reclutamiento) {
      return res.status(200).json({
        success: false,
        step: 'reclutamiento_check',
        error: 'Reclutamiento no encontrado',
        details: reclutamientoError?.message
      });
    }

    // 5. Verificar acceso del usuario al reclutamiento
    console.log('🔍 5. Verificando acceso del usuario...');
    const hasAccess = reclutamiento.reclutador_id === user_id;
    console.log('🔍 Usuario tiene acceso:', hasAccess);
    console.log('🔍 Reclutador ID del reclutamiento:', reclutamiento.reclutador_id);
    console.log('🔍 User ID solicitado:', user_id);

    if (!hasAccess) {
      return res.status(200).json({
        success: false,
        step: 'access_check',
        error: 'Usuario no tiene acceso a este reclutamiento',
        details: `Reclutador: ${reclutamiento.reclutador_id}, Usuario: ${user_id}`
      });
    }

    // 6. Ejecutar la sincronización
    console.log('🔍 6. Ejecutando sincronización...');
    const syncResult = await autoSyncCalendar({
      userId: user_id,
      reclutamientoId: reclutamiento_id,
      action: action
    });

    console.log('🔍 Resultado de sincronización:', syncResult);

    // 7. Verificar el estado después de la sincronización
    console.log('🔍 7. Verificando estado después de sincronización...');
    const { data: eventsAfterSync, error: eventsAfterError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('sesion_id', reclutamiento_id)
      .eq('user_id', user_id);

    console.log('🔍 Eventos después de sincronización:', eventsAfterSync?.length || 0);
    console.log('🔍 Eventos después:', eventsAfterSync);

    return res.status(200).json({
      success: true,
      debug_info: {
        step: 'sync_completed',
        tokens_found: !!tokens,
        tokens_are_test: areTestTokens,
        existing_events_before: existingEvents?.length || 0,
        existing_events_after: eventsAfterSync?.length || 0,
        reclutamiento_found: !!reclutamiento,
        user_has_access: hasAccess,
        sync_result: syncResult,
        events_before: existingEvents,
        events_after: eventsAfterSync
      }
    });

  } catch (error) {
    console.error('❌ Error en debug Google Calendar sync:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
