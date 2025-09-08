import { useState, useEffect } from 'react';
import { useFastUser } from '../contexts/FastUserContext';

interface GoogleCalendarStatus {
  connected: boolean;
  connected_at?: string;
  last_sync?: string;
  has_refresh_token?: boolean;
  message: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  synced_events?: any[];
  errors?: any[];
  total_events?: number;
  google_event_id?: string;
}

export function useGoogleCalendar() {
  const { userId, isAuthenticated } = useFastUser();
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar estado de conexión
  const checkStatus = async () => {
    if (!isAuthenticated || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/google-calendar/status?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setStatus(data);
      } else {
        setError(data.error || 'Error verificando estado');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Conectar con Google Calendar
  const connect = () => {
    if (!isAuthenticated || !userId) return;

    // Redirigir a Google OAuth
    const authUrl = `/api/auth/google?userId=${userId}`;
    window.location.href = authUrl;
  };

  // Desconectar Google Calendar
  const disconnect = async () => {
    if (!isAuthenticated || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ connected: false, message: 'Google Calendar desconectado' });
      } else {
        setError(data.error || 'Error desconectando');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar sesión hacia Google Calendar
  const syncToGoogle = async (sesionId: string): Promise<SyncResult> => {
    if (!isAuthenticated || !userId) return { success: false, message: 'Usuario no autenticado' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'sync_to_google',
          sesionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        setError(data.error || 'Error sincronizando');
        return { success: false, message: data.error || 'Error sincronizando' };
      }
    } catch (err) {
      setError('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar desde Google Calendar
  const syncFromGoogle = async (): Promise<SyncResult> => {
    if (!isAuthenticated || !userId) return { success: false, message: 'Usuario no autenticado' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'sync_from_google',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        setError(data.error || 'Error sincronizando');
        return { success: false, message: data.error || 'Error sincronizando' };
      }
    } catch (err) {
      setError('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  // Verificar estado al montar el componente
  useEffect(() => {
    checkStatus();
  }, [isAuthenticated, userId]);

  return {
    status,
    loading,
    error,
    connect,
    disconnect,
    syncToGoogle,
    syncFromGoogle,
    checkStatus,
  };
}