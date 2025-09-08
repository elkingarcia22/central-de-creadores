import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AutoSyncOptions {
  userId: string;
  reclutamientoId: string;
  action: 'create' | 'update' | 'delete';
}

/**
 * Sincroniza automáticamente un reclutamiento con Google Calendar
 */
export async function autoSyncCalendar({ userId, reclutamientoId, action }: AutoSyncOptions) {
  try {
    console.log(`🔄 Auto-sync: ${action} reclutamiento ${reclutamientoId} para usuario ${userId}`);

    // Verificar si el usuario tiene Google Calendar conectado
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      console.log('⚠️ Usuario no tiene Google Calendar conectado, saltando auto-sync');
      return { success: false, reason: 'No Google Calendar connected' };
    }

    // Configurar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    // Crear cliente de Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    if (action === 'delete') {
      // Eliminar evento de Google Calendar
      const { data: existingEvent } = await supabase
        .from('google_calendar_events')
        .select('google_event_id')
        .eq('sesion_id', reclutamientoId)
        .eq('user_id', userId)
        .single();

      if (existingEvent) {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: existingEvent.google_event_id,
        });

        // Eliminar referencia de la base de datos
        await supabase
          .from('google_calendar_events')
          .delete()
          .eq('sesion_id', reclutamientoId)
          .eq('user_id', userId);

        console.log(`✅ Evento eliminado de Google Calendar: ${existingEvent.google_event_id}`);
      }
    } else {
      // Obtener datos completos del reclutamiento
      const { data: reclutamiento, error: reclutamientoError } = await supabase
        .from('reclutamientos')
        .select(`
          *,
          investigaciones!inner(
            nombre,
            descripcion,
            responsable_id,
            implementador_id
          )
        `)
        .eq('id', reclutamientoId)
        .single();

      if (reclutamientoError || !reclutamiento) {
        console.error('Error obteniendo reclutamiento para auto-sync:', reclutamientoError);
        return { success: false, reason: 'Reclutamiento not found' };
      }

      // Verificar si el usuario tiene acceso a este reclutamiento
      const hasAccess = 
        reclutamiento.reclutador_id === userId ||
        reclutamiento.investigaciones?.responsable_id === userId ||
        reclutamiento.investigaciones?.implementador_id === userId;

      if (!hasAccess) {
        console.log('⚠️ Usuario no tiene acceso a este reclutamiento, saltando auto-sync');
        return { success: false, reason: 'No access to reclutamiento' };
      }

      // Obtener datos relacionados
      let participante = null;
      let participanteInterno = null;
      let participanteFriendFamily = null;

      if (reclutamiento.participantes_id) {
        const { data } = await supabase
          .from('participantes')
          .select('*')
          .eq('id', reclutamiento.participantes_id)
          .single();
        participante = data;
      }

      if (reclutamiento.participantes_internos_id) {
        const { data } = await supabase
          .from('participantes_internos')
          .select('*')
          .eq('id', reclutamiento.participantes_internos_id)
          .single();
        participanteInterno = data;
      }

      if (reclutamiento.participantes_friend_family_id) {
        const { data } = await supabase
          .from('participantes_friend_family')
          .select('*')
          .eq('id', reclutamiento.participantes_friend_family_id)
          .single();
        participanteFriendFamily = data;
      }

      // Crear evento de Google Calendar
      const googleEvent = await createGoogleCalendarEvent(calendar, {
        ...reclutamiento,
        participante,
        participanteInterno,
        participanteFriendFamily
      });

      // Verificar si ya existe en Google Calendar
      const { data: existingEvent } = await supabase
        .from('google_calendar_events')
        .select('google_event_id')
        .eq('sesion_id', reclutamientoId)
        .eq('user_id', userId)
        .single();

      if (existingEvent) {
        // Actualizar evento existente
        await calendar.events.update({
          calendarId: 'primary',
          eventId: existingEvent.google_event_id,
          requestBody: googleEvent,
        });

        // Actualizar referencia en la base de datos
        await supabase
          .from('google_calendar_events')
          .update({
            google_event_id: googleEvent.id,
            sync_status: 'synced',
            last_sync_at: new Date().toISOString()
          })
          .eq('sesion_id', reclutamientoId)
          .eq('user_id', userId);

        console.log(`✅ Evento actualizado en Google Calendar: ${googleEvent.id}`);
      } else {
        // Crear nuevo evento
        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: googleEvent,
        });

        // Guardar referencia en la base de datos
        await supabase
          .from('google_calendar_events')
          .insert({
            user_id: userId,
            sesion_id: reclutamientoId,
            google_event_id: createdEvent.data.id,
            google_calendar_id: 'primary',
            sync_status: 'synced',
            last_sync_at: new Date().toISOString()
          });

        console.log(`✅ Evento creado en Google Calendar: ${createdEvent.data.id}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error en auto-sync:', error);
    return { success: false, reason: 'Sync error', error };
  }
}

// Función para crear evento en Google Calendar
async function createGoogleCalendarEvent(calendar: any, reclutamiento: any) {
  const startDate = new Date(reclutamiento.fecha_sesion);
  const endDate = new Date(startDate.getTime() + (reclutamiento.duracion_sesion || 60) * 60000);

  // Determinar el participante
  let participanteNombre = 'Participante no asignado';
  let participanteEmail = '';

  if (reclutamiento.participante) {
    participanteNombre = reclutamiento.participante.nombre || 'Participante';
    participanteEmail = reclutamiento.participante.email || '';
  } else if (reclutamiento.participanteInterno) {
    participanteNombre = reclutamiento.participanteInterno.nombre || 'Participante Interno';
    participanteEmail = reclutamiento.participanteInterno.email || '';
  } else if (reclutamiento.participanteFriendFamily) {
    participanteNombre = reclutamiento.participanteFriendFamily.nombre || 'Participante Friend & Family';
    participanteEmail = reclutamiento.participanteFriendFamily.email || '';
  }

  // Crear título del evento
  const titulo = `${reclutamiento.investigaciones?.nombre || 'Sesión'} - ${participanteNombre}`;

  // Crear descripción
  const descripcion = [
    `Participante: ${participanteNombre}`,
    `Investigación: ${reclutamiento.investigaciones?.nombre || 'Sin nombre'}`,
    `Duración: ${reclutamiento.duracion_sesion || 60} minutos`,
    reclutamiento.meet_link ? `Enlace Meet: ${reclutamiento.meet_link}` : '',
    reclutamiento.investigaciones?.descripcion ? `Descripción: ${reclutamiento.investigaciones.descripcion}` : ''
  ].filter(Boolean).join('\n');

  return {
    summary: titulo,
    description: descripcion,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    location: reclutamiento.meet_link || '',
    attendees: participanteEmail ? [{
      email: participanteEmail,
      displayName: participanteNombre,
      responseStatus: 'needsAction'
    }] : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 60 }
      ]
    }
  };
}
