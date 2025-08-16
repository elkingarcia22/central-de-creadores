import React from 'react';
import { useRouter } from 'next/router';
import { Typography, Card, Button, Tabs, Badge } from '../../../components/ui';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  UserIcon,
  CalendarIcon,
  InfoIcon
} from '../../../components/icons';

const TestReclutamiento: React.FC = () => {
  const router = useRouter();

  const handleVolver = () => {
    router.push('/mis-asignaciones');
  };

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
              <Button
                variant="outline"
                size="sm"
                onClick={handleVolver}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <Typography variant="h1" weight="bold">
                  Reclutamiento Individual (Test)
                </Typography>
                <Typography variant="body1" color="secondary">
                  prueba ivestigacion nueva
                </Typography>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => alert('Función de agendar')}
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
                <Badge variant="secondary" style={{ backgroundColor: '#F59E0B' }}>
                  Pendiente de agendamiento
                </Badge>
              </div>
              <Typography variant="body2" color="secondary" className="mt-2">
                Estado del Agendamiento
              </Typography>
            </Card>
            
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold">
                Participante Placeholder
              </Typography>
              <Typography variant="body2" color="secondary">
                Participante Asignado
              </Typography>
            </Card>
            
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold">
                Pendiente
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
          activeTab="informacion"
          onTabChange={(tab) => alert(`Cambiando a tab: ${tab}`)}
        >
          {/* Tab: Información */}
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
                      4934c0eb-4e41-45e9-b64a-25895acc167c
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Investigación
                    </Typography>
                    <Typography variant="body1">
                      prueba ivestigacion nueva
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Participante
                    </Typography>
                    <Typography variant="body1">
                      Participante Placeholder
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
                    <Badge variant="secondary" style={{ backgroundColor: '#F59E0B' }}>
                      Pendiente de agendamiento
                    </Badge>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Fecha de Sesión
                    </Typography>
                    <Typography variant="body1">
                      No programada
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default TestReclutamiento;
