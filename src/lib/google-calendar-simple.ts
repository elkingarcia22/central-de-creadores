import { google } from 'googleapis';

// Configuración simple para Google Calendar
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Crear cliente de autenticación con Service Account
export function getAuthClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Service Account credentials not configured');
  }

  return new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/calendar']
  );
}

// Crear cliente de Google Calendar
export function getCalendarClient() {
  const auth = getAuthClient();
  return google.calendar({ version: 'v3', auth });
}

// Interfaz para eventos de Google Calendar
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

// Convertir sesión a evento de Google Calendar
export function sesionToGoogleEvent(sesion: any): GoogleCalendarEvent {
  const startDate = new Date(sesion.fecha_programada);
  const endDate = new Date(startDate.getTime() + (sesion.duracion_minutos * 60000));

  return {
    summary: sesion.titulo,
    description: sesion.descripcion || `Sesión de investigación: ${sesion.investigacion_nombre || 'Sin investigación'}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    location: sesion.ubicacion || sesion.sala || 'Oficina Principal',
    attendees: sesion.observadores?.map((obs: any) => ({
      email: obs.email || obs,
      displayName: obs.nombre || obs
    })) || []
  };
}

// Crear evento en Google Calendar
export async function createCalendarEvent(event: GoogleCalendarEvent) {
  try {
    const calendar = getCalendarClient();
    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      resource: event
    });
    return response.data;
  } catch (error) {
    console.error('Error creando evento en Google Calendar:', error);
    throw error;
  }
}

// Actualizar evento en Google Calendar
export async function updateCalendarEvent(eventId: string, event: GoogleCalendarEvent) {
  try {
    const calendar = getCalendarClient();
    const response = await calendar.events.update({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId: eventId,
      resource: event
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando evento en Google Calendar:', error);
    throw error;
  }
}

// Eliminar evento de Google Calendar
export async function deleteCalendarEvent(eventId: string) {
  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId: eventId
    });
    return true;
  } catch (error) {
    console.error('Error eliminando evento de Google Calendar:', error);
    throw error;
  }
}

// Listar eventos de Google Calendar
export async function listCalendarEvents(timeMin?: string, timeMax?: string) {
  try {
    const calendar = getCalendarClient();
    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Error listando eventos de Google Calendar:', error);
    throw error;
  }
}

// Verificar conexión con Google Calendar
export async function testGoogleCalendarConnection() {
  try {
    const calendar = getCalendarClient();
    const response = await calendar.calendarList.list();
    return {
      success: true,
      calendars: response.data.items?.length || 0
    };
  } catch (error) {
    console.error('Error probando conexión con Google Calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
