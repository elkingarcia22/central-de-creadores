import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    // Obtener tokens del usuario
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      return res.status(400).json({ error: 'Usuario no tiene Google Calendar conectado' });
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

    // Obtener sesiones del usuario
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesiones')
      .select(`
        *,
        investigaciones (
          nombre,
          descripcion
        )
      `)
      .eq('creado_por', userId)
      .order('fecha_programada', { ascending: true });

    if (sesionesError) {
      console.error('Error obteniendo sesiones:', sesionesError);
      return res.status(500).json({ error: 'Error obteniendo sesiones' });
    }

    let syncedCount = 0;
    let errorCount = 0;

    // Sincronizar cada sesión
    for (const sesion of sesiones || []) {
      try {
        // Verificar si ya existe en Google Calendar
        const { data: existingEvent } = await supabase
          .from('google_calendar_events')
          .select('google_event_id')
          .eq('sesion_id', sesion.id)
          .eq('user_id', userId)
          .single();

        if (existingEvent) {
          // Actualizar evento existente
          await updateGoogleCalendarEvent(calendar, existingEvent.google_event_id, sesion);
        } else {
          // Crear nuevo evento
          const googleEvent = await createGoogleCalendarEvent(calendar, sesion);
          
          // Guardar referencia en la base de datos
          await supabase
            .from('google_calendar_events')
            .insert({
              user_id: userId,
              sesion_id: sesion.id,
              google_event_id: googleEvent.id,
              google_calendar_id: 'primary',
              sync_status: 'synced',
              last_sync_at: new Date().toISOString()
            });
        }

        syncedCount++;
      } catch (error) {
        console.error(`Error sincronizando sesión ${sesion.id}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sincronización completada: ${syncedCount} sesiones sincronizadas, ${errorCount} errores`,
      synced: syncedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Error en sincronización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para crear evento en Google Calendar
async function createGoogleCalendarEvent(calendar: any, sesion: any) {
  const startDate = new Date(sesion.fecha_programada);
  const endDate = new Date(startDate.getTime() + (sesion.duracion_minutos * 60000));

  const event = {
    summary: sesion.titulo,
    description: sesion.descripcion || `Sesión de investigación: ${sesion.investigaciones?.nombre || 'Sin investigación'}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    location: sesion.ubicacion || sesion.sala || 'Oficina Principal',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 día antes
        { method: 'popup', minutes: 30 } // 30 minutos antes
      ]
    },
    extendedProperties: {
      private: {
        sesion_id: sesion.id,
        investigacion_id: sesion.investigacion_id || '',
        tipo_sesion: sesion.tipo_sesion || 'presencial'
      }
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });

  return response.data;
}

// Función para actualizar evento en Google Calendar
async function updateGoogleCalendarEvent(calendar: any, googleEventId: string, sesion: any) {
  const startDate = new Date(sesion.fecha_programada);
  const endDate = new Date(startDate.getTime() + (sesion.duracion_minutos * 60000));

  const event = {
    summary: sesion.titulo,
    description: sesion.descripcion || `Sesión de investigación: ${sesion.investigaciones?.nombre || 'Sin investigación'}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    location: sesion.ubicacion || sesion.sala || 'Oficina Principal',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 día antes
        { method: 'popup', minutes: 30 } // 30 minutos antes
      ]
    },
    extendedProperties: {
      private: {
        sesion_id: sesion.id,
        investigacion_id: sesion.investigacion_id || '',
        tipo_sesion: sesion.tipo_sesion || 'presencial'
      }
    }
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: googleEventId,
    resource: event
  });

  return response.data;
}
