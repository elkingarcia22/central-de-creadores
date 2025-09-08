import { NextApiRequest, NextApiResponse } from 'next';
import { getCalendarClient, sesionToGoogleEvent, googleEventToSesion, setCredentials } from '../../../lib/google-calendar';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId, action, sesionId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    // Obtener tokens de Google Calendar del usuario
    const { data: tokens, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokens) {
      return res.status(404).json({ error: 'Usuario no tiene Google Calendar conectado' });
    }

    // Configurar cliente con tokens
    setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope
    });

    const calendar = getCalendarClient();

    if (action === 'sync_to_google') {
      // Sincronizar sesión hacia Google Calendar
      if (!sesionId) {
        return res.status(400).json({ error: 'ID de sesión requerido' });
      }

      // Obtener sesión de la base de datos
      const { data: sesion, error: sesionError } = await supabase
        .from('sesiones')
        .select(`
          *,
          investigaciones!inner(
            id,
            nombre,
            color
          )
        `)
        .eq('id', sesionId)
        .single();

      if (sesionError || !sesion) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      // Convertir sesión a evento de Google Calendar
      const googleEvent = sesionToGoogleEvent(sesion);

      // Crear evento en Google Calendar
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: googleEvent
      });

      // Actualizar sesión con ID del evento de Google
      const { error: updateError } = await supabase
        .from('sesiones')
        .update({
          google_calendar_id: 'primary',
          google_event_id: response.data.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sesionId);

      if (updateError) {
        console.error('Error actualizando sesión:', updateError);
      }

      return res.status(200).json({
        success: true,
        google_event_id: response.data.id,
        message: 'Sesión sincronizada con Google Calendar'
      });

    } else if (action === 'sync_from_google') {
      // Sincronizar eventos de Google Calendar hacia la plataforma
      const { data: events, error: eventsError } = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
      });

      if (eventsError) {
        console.error('Error obteniendo eventos:', eventsError);
        return res.status(500).json({ error: 'Error obteniendo eventos de Google Calendar' });
      }

      const syncedEvents = [];
      const errors = [];

      for (const event of events.data.items || []) {
        try {
          // Verificar si el evento ya existe en la plataforma
          const { data: existingSesion } = await supabase
            .from('sesiones')
            .select('id')
            .eq('google_event_id', event.id)
            .single();

          if (existingSesion) {
            // Actualizar sesión existente
            const sesionData = googleEventToSesion(event);
            const { error: updateError } = await supabase
              .from('sesiones')
              .update({
                ...sesionData,
                updated_at: new Date().toISOString()
              })
              .eq('google_event_id', event.id);

            if (updateError) {
              errors.push({ event_id: event.id, error: updateError.message });
            } else {
              syncedEvents.push({ action: 'updated', event_id: event.id });
            }
          } else {
            // Crear nueva sesión
            const sesionData = googleEventToSesion(event);
            const { data: newSesion, error: createError } = await supabase
              .from('sesiones')
              .insert({
                ...sesionData,
                google_calendar_id: 'primary',
                google_event_id: event.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              errors.push({ event_id: event.id, error: createError.message });
            } else {
              syncedEvents.push({ action: 'created', event_id: event.id, sesion_id: newSesion.id });
            }
          }
        } catch (error) {
          errors.push({ event_id: event.id, error: error.message });
        }
      }

      return res.status(200).json({
        success: true,
        synced_events: syncedEvents,
        errors: errors,
        total_events: events.data.items?.length || 0,
        message: `Sincronizados ${syncedEvents.length} eventos de Google Calendar`
      });

    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }

  } catch (error) {
    console.error('Error en sincronización:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
