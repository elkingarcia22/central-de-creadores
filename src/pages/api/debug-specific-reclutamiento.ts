import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';
import { autoSyncCalendar } from '../../lib/auto-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, reclutamientoId } = req.body;

    if (!userId || !reclutamientoId) {
      return res.status(400).json({ error: 'userId y reclutamientoId son requeridos' });
    }

    console.log('🔍 Debugging reclutamiento específico:', { userId, reclutamientoId });

    // 1. Verificar que el reclutamiento existe
    const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
      .from('reclutamientos')
      .select(`
        *,
        investigaciones!inner(
          id,
          nombre,
          descripcion,
          responsable_id,
          implementador_id
        )
      `)
      .eq('id', reclutamientoId)
      .eq('reclutador_id', userId)
      .single();

    if (reclutamientoError || !reclutamiento) {
      return res.status(404).json({ 
        error: 'Reclutamiento no encontrado',
        details: reclutamientoError?.message
      });
    }

    console.log('✅ Reclutamiento encontrado:', reclutamiento);

    // 2. Verificar tokens de Google Calendar
    const { data: tokens, error: tokensError } = await supabaseServer
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      return res.status(400).json({ 
        error: 'No hay tokens de Google Calendar',
        details: 'Usuario no tiene Google Calendar conectado'
      });
    }

    console.log('✅ Tokens de Google Calendar encontrados');

    // 3. Verificar si ya existe un evento de Google Calendar
    const { data: existingEvent, error: existingEventError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('sesion_id', reclutamientoId)
      .single();

    console.log('🔍 Evento existente:', existingEvent);
    console.log('🔍 Error al buscar evento:', existingEventError?.message);

    // 4. Obtener datos del participante
    let participante = null;
    if (reclutamiento.participantes_id) {
      const { data: participanteData, error: participanteError } = await supabaseServer
        .from('participantes')
        .select('*')
        .eq('id', reclutamiento.participantes_id)
        .single();

      if (participanteError) {
        console.log('⚠️ Error obteniendo participante:', participanteError.message);
      } else {
        participante = participanteData;
        console.log('✅ Participante encontrado:', participante);
      }
    }

    // 5. Intentar sincronización con logging detallado
    console.log('🔄 Intentando sincronización...');
    
    try {
      const syncResult = await autoSyncCalendar({
        userId,
        reclutamientoId,
        action: 'create'
      });

      console.log('📊 Resultado de sincronización:', syncResult);

      return res.status(200).json({
        success: true,
        reclutamiento: {
          id: reclutamiento.id,
          fecha_sesion: reclutamiento.fecha_sesion,
          duracion_sesion: reclutamiento.duracion_sesion,
          meet_link: reclutamiento.meet_link,
          investigacion: reclutamiento.investigaciones,
          participante
        },
        tokens: {
          hasTokens: !!tokens,
          accessToken: tokens.access_token ? 'Presente' : 'Ausente',
          refreshToken: tokens.refresh_token ? 'Presente' : 'Ausente'
        },
        existingEvent,
        syncResult,
        debug: {
          reclutamientoFound: !!reclutamiento,
          tokensFound: !!tokens,
          participanteFound: !!participante,
          existingEventFound: !!existingEvent
        }
      });

    } catch (syncError) {
      console.error('❌ Error en sincronización:', syncError);
      
      return res.status(500).json({
        success: false,
        error: 'Error en sincronización',
        details: syncError instanceof Error ? syncError.message : 'Error desconocido',
        reclutamiento: {
          id: reclutamiento.id,
          fecha_sesion: reclutamiento.fecha_sesion,
          duracion_sesion: reclutamiento.duracion_sesion,
          meet_link: reclutamiento.meet_link,
          investigacion: reclutamiento.investigaciones,
          participante
        },
        tokens: {
          hasTokens: !!tokens,
          accessToken: tokens.access_token ? 'Presente' : 'Ausente',
          refreshToken: tokens.refresh_token ? 'Presente' : 'Ausente'
        },
        existingEvent
      });
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
