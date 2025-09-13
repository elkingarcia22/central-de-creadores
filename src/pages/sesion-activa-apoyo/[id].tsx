import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Tabs, Card, Typography, Button, Chip } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircleIcon, ClockIcon, UserIcon, VideoIcon, HelpIcon } from '../../components/icons';

interface SesionApoyoData {
  id: string;
  meet_link: string;
  titulo: string;
  fecha: string;
  moderador_id: string;
  moderador_nombre: string;
  objetivo_sesion: string;
  observadores: string[];
  tipo: 'apoyo';
}

interface Usuario {
  id: string;
  full_name: string;
  email: string;
  foto_url?: string;
}

export default function SesionActivaApoyoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();
  
  const [sesionApoyo, setSesionApoyo] = useState<SesionApoyoData | null>(null);
  const [moderador, setModerador] = useState<Usuario | null>(null);
  const [observadores, setObservadores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalles');

  useEffect(() => {
    if (id) {
      loadSesionApoyoData();
    }
  }, [id]);

  const loadSesionApoyoData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de la sesión de apoyo desde localStorage
      const currentSesionApoyo = localStorage.getItem('currentSesionApoyo');
      if (currentSesionApoyo) {
        try {
          const sesionData = JSON.parse(currentSesionApoyo);
          console.log('🔍 Datos de sesión de apoyo desde localStorage:', sesionData);
          setSesionApoyo(sesionData);
          
          // Cargar información del moderador
          await loadModeradorData(sesionData.moderador_id);
          
          // Cargar información de los observadores
          if (sesionData.observadores && sesionData.observadores.length > 0) {
            await loadObservadoresData(sesionData.observadores);
          }
          
        } catch (error) {
          console.error('🔍 Error parseando sesión de apoyo desde localStorage:', error);
          showError('Error al cargar los datos de la sesión de apoyo');
        }
      } else {
        console.log('🔍 No hay sesión de apoyo en localStorage');
        showError('No se encontraron datos de la sesión de apoyo');
      }
    } catch (error) {
      console.error('Error cargando datos de sesión de apoyo:', error);
      showError('Error al cargar los datos de la sesión');
    } finally {
      setLoading(false);
    }
  };

  const loadModeradorData = async (moderadorId: string) => {
    try {
      const response = await fetch(`/api/usuarios/${moderadorId}`);
      if (response.ok) {
        const data = await response.json();
        setModerador(data);
      }
    } catch (error) {
      console.error('Error cargando datos del moderador:', error);
    }
  };

  const loadObservadoresData = async (observadoresIds: string[]) => {
    try {
      const observadoresData = [];
      for (const observadorId of observadoresIds) {
        const response = await fetch(`/api/usuarios/${observadorId}`);
        if (response.ok) {
          const data = await response.json();
          observadoresData.push(data);
        }
      }
      setObservadores(observadoresData);
    } catch (error) {
      console.error('Error cargando datos de observadores:', error);
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      const fechaObj = new Date(fecha);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fechaObj);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleVolver = () => {
    router.push('/sesiones');
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <Typography variant="body1" color="secondary">
                Cargando sesión de apoyo...
              </Typography>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!sesionApoyo) {
    return (
      <Layout>
        <div className="py-8">
          <div className="text-center py-12">
            <HelpIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="mb-2">
              Sesión de apoyo no encontrada
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No se pudieron cargar los datos de la sesión de apoyo
            </Typography>
            <Button onClick={handleVolver} variant="primary">
              Volver a Sesiones
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      id: 'detalles',
      label: 'Detalles',
      content: (
        <div className="space-y-6">
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <Typography variant="h3" className="mb-2">
                  {sesionApoyo.titulo}
                </Typography>
                <Typography variant="body1" color="secondary">
                  {sesionApoyo.objetivo_sesion}
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1">
                    {formatFecha(sesionApoyo.fecha)}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Moderador
                  </Typography>
                  <Typography variant="body1">
                    {moderador?.full_name || 'Cargando...'}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Estado
                  </Typography>
                  <Chip variant="success" size="sm">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    En Progreso
                  </Chip>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Observadores
                  </Typography>
                  <Typography variant="body1">
                    {observadores.length} persona(s)
                  </Typography>
                </div>
              </div>
            </div>
          </Card>

          {sesionApoyo.meet_link && (
            <Card padding="lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <VideoIcon className="w-5 h-5 text-primary" />
                  <div>
                    <Typography variant="body1" className="font-medium">
                      Sesión de Google Meet
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      La sesión está activa en otra pestaña
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(sesionApoyo.meet_link, '_blank')}
                >
                  Abrir Meet
                </Button>
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'participantes',
      label: 'Participantes',
      content: (
        <div className="space-y-4">
          <Card padding="lg">
            <Typography variant="h4" className="mb-4">
              Moderador
            </Typography>
            {moderador ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Typography variant="body1" className="font-medium">
                    {moderador.full_name}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {moderador.email}
                  </Typography>
                </div>
                <Chip variant="primary" size="sm">
                  Moderador
                </Chip>
              </div>
            ) : (
              <Typography variant="body2" color="secondary">
                Cargando información del moderador...
              </Typography>
            )}
          </Card>

          {observadores.length > 0 && (
            <Card padding="lg">
              <Typography variant="h4" className="mb-4">
                Observadores ({observadores.length})
              </Typography>
              <div className="space-y-3">
                {observadores.map((observador) => (
                  <div key={observador.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <Typography variant="body1" className="font-medium">
                        {observador.full_name}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {observador.email}
                      </Typography>
                    </div>
                    <Chip variant="secondary" size="sm">
                      Observador
                    </Chip>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'notas',
      label: 'Notas',
      content: (
        <Card padding="lg">
          <Typography variant="h4" className="mb-4">
            Notas de la Sesión
          </Typography>
          <div className="text-center py-8">
            <HelpIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="body1" color="secondary">
              Las notas de la sesión de apoyo se guardarán aquí
            </Typography>
            <Typography variant="body2" color="secondary" className="mt-2">
              Esta funcionalidad estará disponible próximamente
            </Typography>
          </div>
        </Card>
      )
    }
  ];

  return (
    <Layout>
      <div className="py-8">
        <PageHeader
          title="Sesión de Apoyo Activa"
          subtitle={`${sesionApoyo.titulo} - ${moderador?.full_name || 'Cargando...'}`}
          icon={<HelpIcon className="w-8 h-8" />}
          color="blue"
          chip={{
            label: "En Progreso",
            variant: "success",
            size: "sm",
            icon: <ClockIcon className="w-3 h-3" />
          }}
          secondaryActions={[
            {
              label: "Volver a Sesiones",
              onClick: handleVolver,
              variant: "outline"
            }
          ]}
        />

        <div className="mt-8">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        </div>
      </div>
    </Layout>
  );
}
