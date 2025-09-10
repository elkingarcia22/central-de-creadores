import { supabaseServer } from '../api/supabase-server';
import { google } from 'googleapis';

interface SimpleSyncOptions {
  userId: string;
  reclutamientoId: string;
  action: 'create' | 'update' | 'delete';
  reclutamiento?: any; // Datos del reclutamiento (opcional para compatibilidad)
}

export async function simpleSyncCalendar({ userId, reclutamientoId, action, reclutamiento }: SimpleSyncOptions) {
  try {
    console.log(`🔄 === SIMPLE SYNC INICIADO ===`);
    console.log(`🔄 Action: ${action}`);
    console.log(`🔄 Reclutamiento ID: ${reclutamientoId}`);
    console.log(`🔄 User ID: ${userId}`);
    console.log(`🔄 Timestamp: ${new Date().toISOString()}`);

    // 1. Verificar tokens de Google Calendar
    console.log(`🔍 1. Verificando tokens de Google Calendar...`);
    const { data: tokens, error: tokensError } = await supabaseServer
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      console.log(`❌ No se encontraron tokens para el usuario: ${userId}`);
      return { success: false, reason: 'No Google Calendar tokens found' };
    }

    console.log(`✅ Tokens encontrados para usuario: ${userId}`);

    // 2. Configurar Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 3. Obtener datos del reclutamiento
    console.log(`🔍 2. Obteniendo datos del reclutamiento...`);
    console.log(`🔍 Buscando reclutamiento con ID: ${reclutamientoId}`);
    
    let reclutamientoData = reclutamiento;
    
    // Si no se pasaron los datos del reclutamiento, buscarlos en la base de datos
    if (!reclutamientoData) {
      const { data: reclutamientoFromDB, error: reclutamientoError } = await supabaseServer
        .from('reclutamientos')
        .select(`
          *,
          participante:participantes(*)
        `)
        .eq('id', reclutamientoId)
        .single();
      
      console.log(`🔍 Resultado de búsqueda de reclutamiento:`, { reclutamientoFromDB, reclutamientoError });
      
      if (reclutamientoError || !reclutamientoFromDB) {
        console.log(`❌ No se encontró el reclutamiento: ${reclutamientoId}`);
        return { success: false, reason: 'Reclutamiento not found' };
      }
      
      reclutamientoData = reclutamientoFromDB;
    } else {
      console.log(`🔍 Usando datos del reclutamiento pasados como parámetro`);
    }

    console.log(`✅ Reclutamiento encontrado: ${reclutamientoId}`);

    // 4. Buscar eventos existentes en Google Calendar por título
    const eventTitle = `Sesión de Reclutamiento - ${reclutamientoData.participante?.nombre || 'Sin nombre'}`;
    console.log(`🔍 3. Buscando eventos existentes con título: "${eventTitle}"`);

    let existingEventId: string | null = null;

    try {
      const eventsResponse = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      // Buscar por ID del reclutamiento en la descripción (más confiable que el título)
      console.log(`🔍 Buscando eventos existentes para reclutamiento: ${reclutamientoId}`);
      console.log(`🔍 Total eventos encontrados: ${eventsResponse.data.items?.length || 0}`);
      
      const existingEvent = eventsResponse.data.items?.find(event => 
        event.description?.includes(`ID Reclutamiento: ${reclutamientoId}`)
      );

      if (existingEvent) {
        existingEventId = existingEvent.id || null;
        console.log(`✅ Evento existente encontrado: ${existingEventId}`);
        console.log(`🔍 Título del evento existente: ${existingEvent.summary}`);
        console.log(`🔍 Descripción del evento existente: ${existingEvent.description}`);
      } else {
        console.log(`ℹ️ No se encontró evento existente para reclutamiento: ${reclutamientoId}`);
        console.log(`🔍 Eventos disponibles:`, eventsResponse.data.items?.map(e => ({
          id: e.id,
          summary: e.summary,
          description: e.description?.substring(0, 100) + '...'
        })));
      }
    } catch (searchError) {
      console.log(`⚠️ Error buscando eventos existentes:`, searchError);
    }

    // 5. Ejecutar acción según el tipo
    switch (action) {
      case 'create':
        if (existingEventId) {
          console.log(`⚠️ Evento ya existe, actualizando en lugar de crear`);
          return await updateEvent(calendar, existingEventId, reclutamientoData);
        } else {
          return await createEvent(calendar, reclutamientoData);
        }

      case 'update':
        if (existingEventId) {
          return await updateEvent(calendar, existingEventId, reclutamientoData);
        } else {
          console.log(`⚠️ No se encontró evento para actualizar, creando nuevo`);
          return await createEvent(calendar, reclutamientoData);
        }

      case 'delete':
        if (existingEventId) {
          return await deleteEvent(calendar, existingEventId);
        } else {
          console.log(`ℹ️ No se encontró evento para eliminar`);
          return { success: true, reason: 'No event found to delete' };
        }

      default:
        return { success: false, reason: 'Invalid action' };
    }

  } catch (error) {
    console.error('❌ Error en simple sync:', error);
    return { 
      success: false, 
      reason: 'Sync error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function createEvent(calendar: any, reclutamiento: any) {
  try {
    console.log(`🔄 === CREANDO NUEVO EVENTO ===`);
    
    const startDate = new Date(reclutamiento.fecha_sesion);
    const duration = reclutamiento.duracion_sesion || 60;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const event = {
      summary: `Sesión de Reclutamiento - ${reclutamiento.participante?.nombre || 'Sin nombre'}`,
      description: `Participante: ${reclutamiento.participante?.nombre || 'Sin nombre'}\n` +
                   `Duración: ${duration} minutos\n` +
                   `Enlace Meet: ${reclutamiento.meet_link || 'No disponible'}\n` +
                   `ID Reclutamiento: ${reclutamiento.id}`,
      location: reclutamiento.meet_link || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Bogota',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log(`✅ Evento creado en Google Calendar:`, response.data);
    return { success: true, reason: 'Event created', eventId: response.data.id };

  } catch (error) {
    console.error('❌ Error creando evento:', error);
    return { success: false, reason: 'Create error', error };
  }
}

async function updateEvent(calendar: any, eventId: string, reclutamiento: any) {
  try {
    console.log(`🔄 === ACTUALIZANDO EVENTO ===`);
    console.log(`🔄 Event ID: ${eventId}`);
    
    const startDate = new Date(reclutamiento.fecha_sesion);
    const duration = reclutamiento.duracion_sesion || 60;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const event = {
      summary: `Sesión de Reclutamiento - ${reclutamiento.participante?.nombre || 'Sin nombre'}`,
      description: `Participante: ${reclutamiento.participante?.nombre || 'Sin nombre'}\n` +
                   `Duración: ${duration} minutos\n` +
                   `Enlace Meet: ${reclutamiento.meet_link || 'No disponible'}\n` +
                   `ID Reclutamiento: ${reclutamiento.id}`,
      location: reclutamiento.meet_link || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Bogota',
      },
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
    });

    console.log(`✅ Evento actualizado en Google Calendar:`, response.data);
    return { success: true, reason: 'Event updated', eventId: response.data.id };

  } catch (error) {
    console.error('❌ Error actualizando evento:', error);
    return { success: false, reason: 'Update error', error };
  }
}

async function deleteEvent(calendar: any, eventId: string) {
  try {
    console.log(`🔄 === ELIMINANDO EVENTO ===`);
    console.log(`🔄 Event ID: ${eventId}`);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    console.log(`✅ Evento eliminado de Google Calendar: ${eventId}`);
    return { success: true, reason: 'Event deleted' };

  } catch (error) {
    console.error('❌ Error eliminando evento:', error);
    return { success: false, reason: 'Delete error', error };
  }
}
