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

    // Intentar obtener sesiones con diferentes nombres de tabla posibles
    let sesiones = null;
    let sesionesError = null;
    let tablaUsada = '';

    // Lista de posibles nombres de tabla
    const posiblesTablas = [
      'sesiones',
      'reclutamientos',
      'participantes_reclutamiento',
      'agendamientos',
      'citas',
      'eventos'
    ];

    for (const tabla of posiblesTablas) {
      try {
        console.log(`Intentando con tabla: ${tabla}`);
        
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(5); // Limitar a 5 para prueba

        if (!error && data && data.length > 0) {
          sesiones = data;
          sesionesError = null;
          tablaUsada = tabla;
          console.log(`Tabla encontrada: ${tabla} con ${data.length} registros`);
          break;
        }
      } catch (error) {
        console.log(`Error con tabla ${tabla}:`, error);
        continue;
      }
    }

    if (sesionesError || !sesiones || sesiones.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No se encontraron sesiones para sincronizar',
        tabla_usada: tablaUsada,
        synced: 0,
        errors: 0,
        detalles: 'No hay datos en las tablas verificadas'
      });
    }

    let syncedCount = 0;
    let errorCount = 0;

    // Sincronizar cada sesión
    for (const sesion of sesiones) {
      try {
        // Crear evento en Google Calendar
        const googleEvent = await createGoogleCalendarEvent(calendar, sesion, tablaUsada);
        
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

        syncedCount++;
      } catch (error) {
        console.error(`Error sincronizando sesión ${sesion.id}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sincronización completada: ${syncedCount} sesiones sincronizadas, ${errorCount} errores`,
      tabla_usada: tablaUsada,
      synced: syncedCount,
      errors: errorCount,
      total_sesiones: sesiones.length
    });

  } catch (error) {
    console.error('Error en sincronización:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// Función para crear evento en Google Calendar
async function createGoogleCalendarEvent(calendar: any, sesion: any, tablaUsada: string) {
  // Determinar campos según la tabla usada
  let titulo, descripcion, fecha, duracion, ubicacion;

  switch (tablaUsada) {
    case 'sesiones':
      titulo = sesion.titulo || sesion.nombre || 'Sesión sin título';
      descripcion = sesion.descripcion || 'Sesión de investigación';
      fecha = sesion.fecha_programada || sesion.fecha;
      duracion = sesion.duracion_minutos || 60;
      ubicacion = sesion.ubicacion || sesion.sala || 'Oficina Principal';
      break;
    case 'reclutamientos':
      titulo = sesion.titulo || sesion.nombre || 'Reclutamiento sin título';
      descripcion = sesion.descripcion || 'Sesión de reclutamiento';
      fecha = sesion.fecha_programada || sesion.fecha;
      duracion = sesion.duracion_minutos || 60;
      ubicacion = sesion.ubicacion || sesion.sala || 'Oficina Principal';
      break;
    case 'participantes_reclutamiento':
      titulo = `Reclutamiento - ${sesion.nombre || 'Participante'}`;
      descripcion = 'Sesión de reclutamiento con participante';
      fecha = sesion.fecha_programada || sesion.fecha;
      duracion = 60; // Duración por defecto
      ubicacion = 'Oficina Principal';
      break;
    default:
      titulo = sesion.titulo || sesion.nombre || 'Evento sin título';
      descripcion = sesion.descripcion || 'Evento de la aplicación';
      fecha = sesion.fecha_programada || sesion.fecha || sesion.created_at;
      duracion = sesion.duracion_minutos || 60;
      ubicacion = sesion.ubicacion || sesion.sala || 'Oficina Principal';
  }

  const startDate = new Date(fecha);
  const endDate = new Date(startDate.getTime() + (duracion * 60000));

  const event = {
    summary: titulo,
    description: descripcion,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    location: ubicacion,
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
        tabla_origen: tablaUsada,
        tipo_sesion: 'presencial'
      }
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });

  return response.data;
}
