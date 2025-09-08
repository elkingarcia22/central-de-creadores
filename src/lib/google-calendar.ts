import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Configuración de Google Calendar
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// Crear cliente OAuth2
export const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Configurar scopes necesarios para Google Calendar
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Generar URL de autorización
export function getAuthUrl(state?: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Forzar consentimiento para obtener refresh token
    redirect_uri: GOOGLE_REDIRECT_URI, // Incluir redirect_uri explícitamente
    state: state // Incluir state para identificar al usuario
  });
}

// Intercambiar código de autorización por tokens
export async function getTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error obteniendo tokens:', error);
    throw error;
  }
}

// Configurar cliente con tokens
export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens);
}

// Crear cliente de Google Calendar
export function getCalendarClient() {
  return google.calendar({ version: 'v3', auth: oauth2Client });
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
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  extendedProperties?: {
    private?: Record<string, string>;
  };
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
    })) || [],
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
}

// Convertir evento de Google Calendar a sesión
export function googleEventToSesion(event: any, investigacionId?: string) {
  const startDate = new Date(event.start.dateTime || event.start.date);
  const endDate = new Date(event.end.dateTime || event.end.date);
  const duracionMinutos = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  return {
    titulo: event.summary || 'Sesión sincronizada',
    descripcion: event.description || '',
    fecha_programada: startDate.toISOString(),
    duracion_minutos: duracionMinutos,
    ubicacion: event.location || '',
    tipo_sesion: 'presencial',
    estado: 'programada',
    grabacion_permitida: true,
    google_calendar_id: 'primary', // Usar calendario principal por defecto
    google_event_id: event.id,
    investigacion_id: investigacionId || event.extendedProperties?.private?.investigacion_id,
    observadores: event.attendees?.map((attendee: any) => ({
      email: attendee.email,
      nombre: attendee.displayName || attendee.email
    })) || []
  };
}
