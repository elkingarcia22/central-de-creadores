import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Badge, Switch } from '../ui';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { SesionEvent, GoogleCalendarEvent } from '../../types/sesiones';
import { 
  CalendarIcon, 
  SyncIcon, 
  CheckIcon, 
  XIcon, 
  AlertCircleIcon,
  SettingsIcon,
  ExternalLinkIcon,
  CheckCircleIcon
} from '../icons';

interface GoogleCalendarSyncProps {
  sesion: SesionEvent;
  onSync?: (sesion: SesionEvent, googleEvent: GoogleCalendarEvent) => void;
  onUnsync?: (sesion: SesionEvent) => void;
  className?: string;
}

const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  sesion,
  onSync,
  onUnsync,
  className = ''
}) => {
  const [isEnabled, setIsEnabled] = useState(!!sesion.google_event_id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Configuración de Google Calendar
  const googleConfig = {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scopes: 'https://www.googleapis.com/auth/calendar'
  };

  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    authenticate,
    signOut,
    createEvent,
    updateEvent,
    deleteEvent,
    syncEvent
  } = useGoogleCalendar({
    config: googleConfig,
    onAuthSuccess: (token) => {
      console.log('Autenticación exitosa:', token);
    },
    onAuthError: (error) => {
      console.error('Error de autenticación:', error);
      setError('Error de autenticación con Google Calendar');
    }
  });

  // Convertir sesión a evento de Google Calendar
  const convertToGoogleEvent = (sesion: SesionEvent): GoogleCalendarEvent => {
    return {
      summary: sesion.titulo,
      description: sesion.descripcion || '',
      start: {
        dateTime: sesion.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: sesion.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: sesion.ubicacion || '',
      attendees: sesion.participantes?.map(p => ({
        email: p.participante_email || '',
        displayName: p.participante_nombre || '',
        responseStatus: p.estado === 'confirmado' ? 'accepted' : 'needsAction'
      })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'email', minutes: 60 }
        ]
      }
    };
  };

  // Sincronizar con Google Calendar
  const handleSync = async () => {
    if (!isAuthenticated) {
      await authenticate();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const googleEvent = convertToGoogleEvent(sesion);
      let result: GoogleCalendarEvent;

      if (sesion.google_event_id) {
        // Actualizar evento existente
        result = await updateEvent(sesion.google_event_id, googleEvent);
      } else {
        // Crear nuevo evento
        result = await createEvent(googleEvent);
      }

      setLastSync(new Date());
      onSync?.(sesion, result);
    } catch (err) {
      setError('Error sincronizando con Google Calendar');
      console.error('Error de sincronización:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Desincronizar de Google Calendar
  const handleUnsync = async () => {
    if (!sesion.google_event_id) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteEvent(sesion.google_event_id);
      onUnsync?.(sesion);
    } catch (err) {
      setError('Error desincronizando de Google Calendar');
      console.error('Error de desincronización:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambio de estado
  const handleToggle = async (enabled: boolean) => {
    setIsEnabled(enabled);
    
    if (enabled) {
      await handleSync();
    } else {
      await handleUnsync();
    }
  };

  // Abrir Google Calendar
  const openGoogleCalendar = () => {
    if (sesion.google_event_id) {
      window.open(`https://calendar.google.com/calendar/event?eid=${sesion.google_event_id}`, '_blank');
    } else {
      window.open('https://calendar.google.com/calendar', '_blank');
    }
  };

  return (
    <Card variant="elevated" padding="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <Typography variant="h4" weight="semibold">
            Google Calendar
          </Typography>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Badge variant="success" size="sm">
              <CheckIcon className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" size="sm">
              <XIcon className="w-3 h-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </div>

      {/* Estado de sincronización */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="body1" weight="medium">
              Sincronizar con Google Calendar
            </Typography>
            <Typography variant="body2" color="secondary">
              {isEnabled 
                ? 'Esta sesión está sincronizada con Google Calendar'
                : 'Habilita para sincronizar con Google Calendar'
              }
            </Typography>
          </div>
          
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || authLoading}
          />
        </div>

        {/* Información de sincronización */}
        {isEnabled && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" weight="medium">
                  Estado de sincronización
                </Typography>
                <Typography variant="caption" color="secondary">
                  {sesion.google_event_id 
                    ? `Evento ID: ${sesion.google_event_id}`
                    : 'Pendiente de sincronización'
                  }
                </Typography>
                {lastSync && (
                  <Typography variant="caption" color="secondary" className="block">
                    Última sincronización: {lastSync.toLocaleString('es-ES')}
                  </Typography>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={openGoogleCalendar}
                disabled={!sesion.google_event_id}
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Ver en Google
              </Button>
            </div>
          </div>
        )}

        {/* Información de conexión */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <Typography variant="body2">
                Google Calendar no conectado
              </Typography>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              <Typography variant="body2">
                Google Calendar conectado - Sincronización automática activa
              </Typography>
            </div>
          )}
        </div>

        {/* Errores */}
        {(error || authError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 text-red-600" />
              <Typography variant="body2" className="text-red-800">
                {error || authError}
              </Typography>
            </div>
          </div>
        )}

        {/* Loading */}
        {(isLoading || authLoading) && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <Typography variant="body2" color="secondary" className="ml-2">
              {authLoading ? 'Autenticando...' : 'Sincronizando...'}
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GoogleCalendarSync;
