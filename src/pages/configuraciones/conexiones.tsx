import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Card, Typography, Button, Badge, Chip } from '../../components/ui';
import { useFastUser } from '../../contexts/FastUserContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  CalendarIcon, 
  DatabaseIcon, 
  MessageIcon, 
  PhoneIcon, 
  EmailIcon,
  SettingsIcon,
  CheckCircleIcon,
  XCircleIcon
} from '../../components/icons';
import { getChipVariant, getChipText } from '../../utils/chipUtils';

interface ConnectionStatus {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  connected_at?: string;
  last_sync?: string;
  icon: React.ReactNode;
  category: string;
}

const ConexionesPage: NextPage = () => {
  const { userId, isAuthenticated } = useFastUser();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Manejar mensajes de éxito y error de la URL
  useEffect(() => {
    const { google_calendar_connected, error } = router.query;
    
    if (google_calendar_connected === 'true') {
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

  // Estado inicial de conexiones y verificación de estado real
  useEffect(() => {
    const loadConnections = async () => {
      const initialConnections: ConnectionStatus[] = [
        {
          id: 'google-calendar',
          name: 'Google Calendar',
          description: 'Sincroniza sesiones con tu calendario de Google',
          connected: false,
          icon: <CalendarIcon className="w-6 h-6" />,
          category: 'desconectado'
        },
        {
          id: 'hubspot',
          name: 'HubSpot',
          description: 'Integra con tu CRM de HubSpot para gestionar leads',
          connected: false,
          icon: <DatabaseIcon className="w-6 h-6" />,
          category: 'desconectado'
        }
      ];

      // Verificar estado real de Google Calendar
      if (userId) {
        try {
          const response = await fetch(`/api/google-calendar/connection-status?userId=${userId}`);
          const status = await response.json();
          
          if (status.connected) {
            initialConnections[0].connected = true;
            initialConnections[0].connected_at = status.connected_at;
            initialConnections[0].last_sync = status.last_sync;
            initialConnections[0].category = 'conectado';
          }
        } catch (error) {
          console.error('Error verificando estado de Google Calendar:', error);
        }
      }
      
      setConnections(initialConnections);
      setLoading(false);
    };

    loadConnections();
  }, [userId]);

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
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-muted-foreground">
                      {connection.icon}
                    </div>
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
                
                <Chip variant={getChipVariant(connection.connected ? 'conectado' : 'desconectado')}>
                  {getChipText(connection.connected ? 'conectado' : 'desconectado')}
                </Chip>
              </div>

              {connection.connected && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <Typography variant="body2" className="text-foreground">
                      <strong>Conectado desde:</strong> {new Date(connection.connected_at || '').toLocaleDateString()}
                    </Typography>
                  </div>
                  {connection.last_sync && (
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <Typography variant="body2" className="text-foreground">
                        <strong>Última sincronización:</strong> {new Date(connection.last_sync).toLocaleDateString()}
                      </Typography>
                    </div>
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
                  <MessageIcon className="w-5 h-5 text-muted-foreground" />
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
                  <PhoneIcon className="w-5 h-5 text-muted-foreground" />
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
                  <EmailIcon className="w-5 h-5 text-muted-foreground" />
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
