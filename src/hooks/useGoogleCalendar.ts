import { useState, useCallback } from 'react';
import { GoogleCalendarEvent } from '../types/sesiones';

interface GoogleCalendarConfig {
  clientId: string;
  apiKey: string;
  discoveryDocs: string[];
  scopes: string;
}

interface UseGoogleCalendarOptions {
  config: GoogleCalendarConfig;
  onAuthSuccess?: (token: string) => void;
  onAuthError?: (error: any) => void;
}

interface UseGoogleCalendarReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
  signOut: () => void;
  createEvent: (event: GoogleCalendarEvent) => Promise<GoogleCalendarEvent>;
  updateEvent: (eventId: string, event: GoogleCalendarEvent) => Promise<GoogleCalendarEvent>;
  deleteEvent: (eventId: string) => Promise<void>;
  listEvents: (calendarId?: string, timeMin?: Date, timeMax?: Date) => Promise<GoogleCalendarEvent[]>;
  syncEvent: (event: GoogleCalendarEvent) => Promise<GoogleCalendarEvent>;
}

export const useGoogleCalendar = (options: UseGoogleCalendarOptions): UseGoogleCalendarReturn => {
  const { config, onAuthSuccess, onAuthError } = options;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gapi, setGapi] = useState<any>(null);

  // Inicializar Google API
  const initializeGapi = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // Cargar Google API si no está cargada
      if (!window.gapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Inicializar gapi
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', { callback: resolve, onerror: reject });
      });

      // Configurar cliente
      await window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: config.discoveryDocs,
        scope: config.scopes
      });

      setGapi(window.gapi);
      setIsAuthenticated(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    } catch (err) {
      setError('Error inicializando Google API');
      console.error('Error inicializando Google API:', err);
    }
  }, [config]);

  // Autenticar con Google
  const authenticate = useCallback(async () => {
    if (!gapi) {
      await initializeGapi();
    }

    if (!gapi) {
      setError('Google API no disponible');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      setIsAuthenticated(true);
      onAuthSuccess?.(user.getAuthResponse().access_token);
    } catch (err) {
      setError('Error de autenticación');
      onAuthError?.(err);
      console.error('Error de autenticación:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gapi, initializeGapi, onAuthSuccess, onAuthError]);

  // Cerrar sesión
  const signOut = useCallback(() => {
    if (gapi) {
      const authInstance = gapi.auth2.getAuthInstance();
      authInstance.signOut();
      setIsAuthenticated(false);
    }
  }, [gapi]);

  // Crear evento
  const createEvent = useCallback(async (event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> => {
    if (!gapi || !isAuthenticated) {
      throw new Error('No autenticado con Google Calendar');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.result;
    } catch (err) {
      setError('Error creando evento en Google Calendar');
      console.error('Error creando evento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gapi, isAuthenticated]);

  // Actualizar evento
  const updateEvent = useCallback(async (eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> => {
    if (!gapi || !isAuthenticated) {
      throw new Error('No autenticado con Google Calendar');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });

      return response.result;
    } catch (err) {
      setError('Error actualizando evento en Google Calendar');
      console.error('Error actualizando evento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gapi, isAuthenticated]);

  // Eliminar evento
  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    if (!gapi || !isAuthenticated) {
      throw new Error('No autenticado con Google Calendar');
    }

    setIsLoading(true);
    setError(null);

    try {
      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
    } catch (err) {
      setError('Error eliminando evento de Google Calendar');
      console.error('Error eliminando evento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gapi, isAuthenticated]);

  // Listar eventos
  const listEvents = useCallback(async (
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date
  ): Promise<GoogleCalendarEvent[]> => {
    if (!gapi || !isAuthenticated) {
      throw new Error('No autenticado con Google Calendar');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.result.items || [];
    } catch (err) {
      setError('Error listando eventos de Google Calendar');
      console.error('Error listando eventos:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gapi, isAuthenticated]);

  // Sincronizar evento
  const syncEvent = useCallback(async (event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> => {
    if (!gapi || !isAuthenticated) {
      throw new Error('No autenticado con Google Calendar');
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: GoogleCalendarEvent;
      
      if (event.id) {
        // Actualizar evento existente
        result = await updateEvent(event.id, event);
      } else {
        // Crear nuevo evento
        result = await createEvent(event);
      }

      return result;
    } catch (err) {
      setError('Error sincronizando evento con Google Calendar');
      console.error('Error sincronizando evento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gapi, isAuthenticated, createEvent, updateEvent]);

  return {
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    signOut,
    createEvent,
    updateEvent,
    deleteEvent,
    listEvents,
    syncEvent
  };
};

// Declarar gapi en window
declare global {
  interface Window {
    gapi: any;
  }
}
