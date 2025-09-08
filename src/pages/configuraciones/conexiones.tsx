import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Card, Typography, Button, Badge } from '../../components/ui';
import { useFastUser } from '../../contexts/FastUserContext';
import { useToast } from '../../contexts/ToastContext';

interface ConnectionStatus {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  connected_at?: string;
  last_sync?: string;
  icon: React.ReactNode;
  color: string;
}

const ConexionesPage: NextPage = () => {
  const { userId, isAuthenticated } = useFastUser();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Manejar mensajes de éxito y error de la URL
  useEffect(() => {
    const { success, error } = router.query;
    
    if (success === 'google_calendar_connected') {
      showSuccess('Google Calendar', '¡Google Calendar conectado exitosamente!');
      // Actualizar estado de conexión
      setConnections(prev => prev.map(conn => 
        conn.id === 'google-calendar' 
          ? { ...conn, connected: true, connected_at: new Date().toISOString() }
          : conn
      ));
    }
    
    if (error) {
      let errorMessage = 'Error desconocido';
      switch (error) {
        case 'authorization_denied':
          errorMessage = 'Autorización denegada por el usuario';
          break;
        case 'no_code':
          errorMessage = 'No se recibió código de autorización';
          break;
        case 'no_user_id':
          errorMessage = 'Error de identificación de usuario';
          break;
        case 'database_error':
          errorMessage = 'Error al guardar la configuración';
          break;
        case 'callback_error':
          errorMessage = 'Error en el proceso de autorización';
          break;
      }
      showError('Google Calendar', errorMessage);
    }
  }, [router.query, showSuccess, showError]);

  // Estado inicial de conexiones
  useEffect(() => {
    const initialConnections: ConnectionStatus[] = [
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sincroniza sesiones con tu calendario de Google',
        connected: false,
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ),
        color: 'blue'
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Integra con tu CRM de HubSpot para gestionar leads',
        connected: false,
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
          </svg>
        ),
        color: 'orange'
      }
    ];
    
    setConnections(initialConnections);
    setLoading(false);
  }, []);

  const handleConnect = async (connectionId: string) => {
    if (connectionId === 'google-calendar') {
      try {
        // Redirigir a Google OAuth con el userId en el state
        const authUrl = `/api/auth/google?userId=${userId}&state=${userId}`;
        window.location.href = authUrl;
      } catch (error) {
        showError('Error', 'No se pudo conectar con Google Calendar');
      }
    } else if (connectionId === 'hubspot') {
      showError('HubSpot', 'Integración con HubSpot próximamente disponible');
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (connectionId === 'google-calendar') {
      try {
        const response = await fetch('/api/google-calendar/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        if (response.ok) {
          setConnections(prev => 
            prev.map(conn => 
              conn.id === connectionId 
                ? { ...conn, connected: false, connected_at: undefined, last_sync: undefined }
                : conn
            )
          );
          showSuccess('Google Calendar desconectado exitosamente');
        }
      } catch (error) {
        showError('Error', 'No se pudo desconectar Google Calendar');
      }
    }
  };

  const handleSync = async (connectionId: string) => {
    if (connectionId === 'google-calendar') {
      try {
        showSuccess('Google Calendar', 'Iniciando sincronización...');
        
        const response = await fetch('/api/google-calendar/sync-reclutamientos-with-meet-fixed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const result = await response.json();
        
        if (result.success) {
          showSuccess('Google Calendar', `Sincronización completada: ${result.synced} sesiones sincronizadas`);
        } else {
          showError('Google Calendar', result.error || 'Error en la sincronización');
        }
      } catch (error) {
        showError('Error', 'No se pudo sincronizar con Google Calendar');
      }
    }
  };

  const handleCleanDuplicates = async (connectionId: string) => {
    if (connectionId === 'google-calendar') {
      try {
        showSuccess('Google Calendar', 'Limpiando eventos duplicados...');
        
        const response = await fetch('/api/google-calendar/clean-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const result = await response.json();
        
        if (result.success) {
          showSuccess('Google Calendar', `Limpieza completada: ${result.deleted} eventos duplicados eliminados`);
        } else {
          showError('Google Calendar', result.error || 'Error en la limpieza');
        }
      } catch (error) {
        showError('Error', 'No se pudo limpiar eventos duplicados');
      }
    }
  };

  return (
    <Layout>
      <div className="py-8">
        <PageHeader
          title="Conexiones"
          subtitle="Gestiona las integraciones y conexiones con servicios externos"
          color="blue"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connections.map((connection) => (
            <Card key={connection.id} variant="elevated" padding="lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    connection.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {connection.icon}
                  </div>
                  <div>
                    <Typography variant="h6" className="text-foreground">
                      {connection.name}
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      {connection.description}
                    </Typography>
                  </div>
                </div>
                
                <Badge variant={connection.connected ? 'success' : 'secondary'}>
                  {connection.connected ? 'Conectado' : 'No conectado'}
                </Badge>
              </div>

              {connection.connected && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Typography variant="body2" className="text-green-800 dark:text-green-200">
                    <strong>Conectado desde:</strong> {new Date(connection.connected_at || '').toLocaleDateString()}
                  </Typography>
                  {connection.last_sync && (
                    <Typography variant="body2" className="text-green-800 dark:text-green-200">
                      <strong>Última sincronización:</strong> {new Date(connection.last_sync).toLocaleDateString()}
                    </Typography>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {connection.connected ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSync(connection.id)}
                    >
                      Sincronizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCleanDuplicates(connection.id)}
                    >
                      Limpiar Duplicados
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                    >
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConnect(connection.id)}
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Próximas integraciones */}
        <div className="mt-8">
          <Typography variant="h5" className="text-foreground mb-4">
            Próximas Integraciones
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="elevated" padding="md" className="opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <Typography variant="body1" className="text-muted-foreground">
                    Slack
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground/70">
                    Notificaciones
                  </Typography>
                </div>
              </div>
            </Card>
            
            <Card variant="elevated" padding="md" className="opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <Typography variant="body1" className="text-muted-foreground">
                    Zoom
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground/70">
                    Videollamadas
                  </Typography>
                </div>
              </div>
            </Card>
            
            <Card variant="elevated" padding="md" className="opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <Typography variant="body1" className="text-muted-foreground">
                    Mailchimp
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground/70">
                    Email Marketing
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConexionesPage;
