import React from 'react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';

interface GoogleCalendarSyncProps {
  sesionId?: string;
  onSyncComplete?: (result: any) => void;
}

export function GoogleCalendarSync({ sesionId, onSyncComplete }: GoogleCalendarSyncProps) {
  const { status, loading, error, connect, disconnect, syncToGoogle, syncFromGoogle } = useGoogleCalendar();
  const { showToast } = useToast();

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = async () => {
    const result = await disconnect();
    if (result) {
      showToast('Google Calendar desconectado exitosamente', 'success');
    }
  };

  const handleSyncToGoogle = async () => {
    if (!sesionId) {
      showToast('No hay sesión seleccionada para sincronizar', 'error');
      return;
    }

    const result = await syncToGoogle(sesionId);
    if (result.success) {
      showToast('Sesión sincronizada con Google Calendar', 'success');
      onSyncComplete?.(result);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleSyncFromGoogle = async () => {
    const result = await syncFromGoogle();
    if (result.success) {
      showToast(`Sincronizados ${result.synced_events?.length || 0} eventos de Google Calendar`, 'success');
      onSyncComplete?.(result);
    } else {
      showToast(result.message, 'error');
    }
  };

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <Typography variant="body2" className="text-red-800">
          Error: {error}
        </Typography>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          <div>
            <Typography variant="h6" className="text-gray-900">
              Google Calendar
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Sincronización bidireccional
            </Typography>
          </div>
        </div>
        
        {status?.connected ? (
          <Badge variant="success">Conectado</Badge>
        ) : (
          <Badge variant="secondary">No conectado</Badge>
        )}
      </div>

      {status?.connected ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Conectado desde: {new Date(status.connected_at || '').toLocaleDateString()}</p>
            {status.last_sync && (
              <p>Última sincronización: {new Date(status.last_sync).toLocaleDateString()}</p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {sesionId && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSyncToGoogle}
                disabled={loading}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                }
              >
                Sincronizar a Google
              </Button>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncFromGoogle}
              disabled={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              Sincronizar desde Google
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={handleDisconnect}
              disabled={loading}
            >
              Desconectar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Typography variant="body2" className="text-gray-600">
            Conecta tu Google Calendar para sincronizar sesiones automáticamente.
          </Typography>
          
          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={loading}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Conectar con Google Calendar
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Procesando...
        </div>
      )}
    </Card>
  );
}
