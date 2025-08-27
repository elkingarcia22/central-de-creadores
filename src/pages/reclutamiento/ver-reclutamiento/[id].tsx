import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Card, Button, Tabs, Badge } from '../../../components/ui';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from '../../../components/icons';

interface ReclutamientoIndividual {
  id: string;
  investigacion_id: string;
  participantes_id: string;
  estado_agendamiento: string;
  reclutador_id: string;
  fecha_sesion: string | null;
  investigacion_nombre: string;
  participante_nombre: string;
  estado_agendamiento_nombre: string;
  estado_agendamiento_color: string;
}

const VerReclutamientoIndividual: React.FC = () => {
  const router = useRouter();
  const { id: reclutamientoId } = router.query;
  
  const [reclutamiento, setReclutamiento] = useState<ReclutamientoIndividual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('informacion');

  useEffect(() => {
    if (!reclutamientoId) return;
    
    const cargarReclutamiento = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reclutamiento-individual?id=${reclutamientoId}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el reclutamiento');
        }
        
        const data = await response.json();
        setReclutamiento(data.reclutamiento);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    cargarReclutamiento();
  }, [reclutamientoId]);

  const handleVolver = () => {
    router.push('/mis-asignaciones');
  };

  const handleAgendar = () => {
    router.push(`/reclutamiento/agendar/${reclutamientoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !reclutamiento) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated" padding="lg">
            <Typography variant="h2" color="danger">
              {error || 'Reclutamiento no encontrado'}
            </Typography>
            <Button onClick={handleVolver} className="mt-4">
              Volver a Mis Asignaciones
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: <InfoIcon className="w-4 h-4" />
    },
    {
      id: 'libreto',
      label: 'Libreto',
      icon: <FileTextIcon className="w-4 h-4" />
    },
    {
      id: 'participantes',
      label: 'Participantes',
      icon: <UserIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <div>
                <Typography variant="h1" weight="bold">
                  Reclutamiento Individual
                </Typography>
                <Typography variant="body1" color="secondary">
                  {reclutamiento.investigacion_nombre}
                </Typography>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleAgendar}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Agendar Sesión
              </Button>
            </div>
          </div>

          {/* Estado y Progreso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" style={{ backgroundColor: reclutamiento.estado_agendamiento_color }}>
                  {reclutamiento.estado_agendamiento_nombre}
                </Badge>
              </div>
              <Typography variant="body2" color="secondary" className="mt-2">
                Estado del Agendamiento
              </Typography>
            </Card>
            
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold">
                {reclutamiento.participante_nombre}
              </Typography>
              <Typography variant="body2" color="secondary">
                Participante Asignado
              </Typography>
            </Card>
            
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold">
                {reclutamiento.fecha_sesion ? 'Programada' : 'Pendiente'}
              </Typography>
              <Typography variant="body2" color="secondary">
                Fecha de Sesión
              </Typography>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {/* Tab: Información */}
          {activeTab === 'informacion' && (
            <Card variant="elevated" padding="lg">
              <Typography variant="h2" className="mb-4">
                Información del Reclutamiento
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="h3" className="mb-3">
                    Detalles Generales
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="body2" color="secondary">
                        ID del Reclutamiento
                      </Typography>
                      <Typography variant="body1">
                        {reclutamiento.id}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="secondary">
                        Investigación
                      </Typography>
                      <Typography variant="body1">
                        {reclutamiento.investigacion_nombre}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="secondary">
                        Participante
                      </Typography>
                      <Typography variant="body1">
                        {reclutamiento.participante_nombre}
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Typography variant="h3" className="mb-3">
                    Estado y Agendamiento
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography variant="body2" color="secondary">
                        Estado
                      </Typography>
                      <Badge variant="secondary" style={{ backgroundColor: reclutamiento.estado_agendamiento_color }}>
                        {reclutamiento.estado_agendamiento_nombre}
                      </Badge>
                    </div>
                    <div>
                      <Typography variant="body2" color="secondary">
                        Fecha de Sesión
                      </Typography>
                      <Typography variant="body1">
                        {reclutamiento.fecha_sesion ? 
                          new Date(reclutamiento.fecha_sesion).toLocaleDateString('es-ES') : 
                          'No programada'
                        }
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab: Libreto */}
          {activeTab === 'libreto' && (
            <Card variant="elevated" padding="lg">
              <Typography variant="h2" className="mb-4">
                Libreto de la Investigación
              </Typography>
              <Typography variant="body1" color="secondary">
                El libreto se cargará desde la investigación asociada.
              </Typography>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/investigaciones/libreto/${reclutamiento.investigacion_id}`)}
              >
                Ver Libreto Completo
              </Button>
            </Card>
          )}

          {/* Tab: Participantes */}
          {activeTab === 'participantes' && (
            <Card variant="elevated" padding="lg">
              <Typography variant="h2" className="mb-4">
                Participante Asignado
              </Typography>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Typography variant="h3">
                      {reclutamiento.participante_nombre}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Participante asignado a este reclutamiento
                    </Typography>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" color="secondary">
                      ID del Participante
                    </Typography>
                    <Typography variant="body1">
                      {reclutamiento.participantes_id}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Estado de Participación
                    </Typography>
                    <Badge variant="secondary">
                      Asignado
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default VerReclutamientoIndividual;
