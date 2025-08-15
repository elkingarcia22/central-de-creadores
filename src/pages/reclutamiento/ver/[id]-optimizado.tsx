import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { Layout, Typography, Card, Button, Tabs, Badge, Chip } from '../../../components/ui';
import { 
  ArrowLeftIcon,
  ClipboardListIcon,
  UserIcon,
  CalendarIcon,
  LinkIcon,
  SettingsIcon,
  PlusIcon,
  EditIcon,
  TrashIcon
} from '../../../components/icons';
import { useReclutamientoData } from '../../../hooks/useReclutamientoData';
import AsignarAgendamientoModal from '../../../components/ui/AsignarAgendamientoModal';

// Interfaces simplificadas
interface ReclutamientoDetalle {
  id: string;
  investigacion_id: string;
  investigacion_nombre: string;
  estado_agendamiento: {
    id: string;
    nombre: string;
    color: string;
  };
  reclutador: {
    id: string;
    nombre: string;
    email: string;
  };
  implementador?: {
    id: string;
    nombre: string;
    email: string;
  };
  fecha_asignado: string;
  fecha_sesion?: string;
}

interface InvestigacionDetalle {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  producto: {
    nombre: string;
  };
  tipo_investigacion: {
    nombre: string;
  };
  libreto?: {
    titulo: string;
    numero_participantes: number;
  };
}

const VerReclutamientoOptimizado: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showError, showSuccess } = useToast();
  const { userProfile } = useUser();
  
  // Estados para modales
  const [showAsignarAgendamientoModal, setShowAsignarAgendamientoModal] = useState(false);
  const [participanteToEditAgendamiento, setParticipanteToEditAgendamiento] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('informacion');

  // Usar el hook optimizado para cargar datos
  const {
    reclutamiento,
    investigacion,
    participantes,
    loading,
    isInitializing,
    cargarDatosCompletos
  } = useReclutamientoData({ id });

  // Función para manejar el éxito de asignar agendamiento
  const handleSuccessAsignarAgendamiento = useCallback(async () => {
    await cargarDatosCompletos();
    setShowAsignarAgendamientoModal(false);
    setParticipanteToEditAgendamiento(null);
  }, [cargarDatosCompletos]);

  // Función para formatear fechas
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Función para obtener el variant del badge según el estado
  const getEstadoBadgeVariant = (estado: string) => {
    const estados: { [key: string]: string } = {
      'Pendiente': 'warning',
      'Agendada': 'success',
      'En Progreso': 'accent-purple',
      'Finalizada': 'success',
      'Cancelada': 'destructive'
    };
    return estados[estado] || 'secondary';
  };

  // Renderizar contenido de información
  const InformacionTabContent = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fechas */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <Typography variant="h6">Fechas</Typography>
        </div>
        <div className="space-y-3">
          {investigacion?.fecha_inicio && (
            <div>
              <Typography variant="caption" color="secondary">Fecha de inicio</Typography>
              <Typography variant="body2">{formatearFecha(investigacion.fecha_inicio)}</Typography>
            </div>
          )}
          {investigacion?.fecha_fin && (
            <div>
              <Typography variant="caption" color="secondary">Fecha de fin</Typography>
              <Typography variant="body2">{formatearFecha(investigacion.fecha_fin)}</Typography>
            </div>
          )}
          {reclutamiento?.fecha_asignado && (
            <div>
              <Typography variant="caption" color="secondary">Creada</Typography>
              <Typography variant="body2">{formatearFecha(reclutamiento.fecha_asignado)}</Typography>
            </div>
          )}
        </div>
      </Card>

      {/* Enlaces */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-primary" />
          <Typography variant="h6">Enlaces</Typography>
        </div>
        <div className="space-y-4">
          <div>
            <Typography variant="body2" className="mb-2">Link de prueba</Typography>
            <Button variant="secondary" size="sm">
              Agregar link
            </Button>
          </div>
          <div>
            <Typography variant="body2" className="mb-2">Link de resultados</Typography>
            <Button variant="secondary" size="sm">
              Agregar link
            </Button>
          </div>
        </div>
      </Card>

      {/* Equipo */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-primary" />
          <Typography variant="h6">Equipo</Typography>
        </div>
        <div className="space-y-4">
          {reclutamiento?.reclutador && (
            <div>
              <Typography variant="caption" color="secondary">Responsable</Typography>
              <Typography variant="body2">{reclutamiento.reclutador.nombre}</Typography>
              <Typography variant="body2" color="secondary">{reclutamiento.reclutador.email}</Typography>
            </div>
          )}
          {reclutamiento?.implementador && (
            <div>
              <Typography variant="caption" color="secondary">Implementador</Typography>
              <Typography variant="body2">{reclutamiento.implementador.nombre}</Typography>
              <Typography variant="body2" color="secondary">{reclutamiento.implementador.email}</Typography>
            </div>
          )}
        </div>
      </Card>

      {/* Configuración */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <Typography variant="h6">Configuración</Typography>
        </div>
        <div className="space-y-3">
          {investigacion?.producto && (
            <div>
              <Typography variant="caption" color="secondary">Producto</Typography>
              <Typography variant="body2">{investigacion.producto.nombre}</Typography>
            </div>
          )}
          {investigacion?.tipo_investigacion && (
            <div>
              <Typography variant="caption" color="secondary">Tipo de Investigación</Typography>
              <Typography variant="body2">{investigacion.tipo_investigacion.nombre}</Typography>
            </div>
          )}
        </div>
      </Card>
    </div>
  ), [investigacion, reclutamiento]);

  // Renderizar contenido de participantes
  const ParticipantesTabContent = useMemo(() => (
    <div className="space-y-6">
      {/* Estado del reclutamiento */}
      {reclutamiento && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardListIcon className="w-5 h-5 text-primary" />
              <Typography variant="h6">Estado del Reclutamiento</Typography>
            </div>
            <Badge variant={getEstadoBadgeVariant(reclutamiento.estado_agendamiento.nombre)}>
              {reclutamiento.estado_agendamiento.nombre}
            </Badge>
          </div>
          
          {/* Información del libreto */}
          {investigacion?.libreto && (
            <div className="mb-4">
              <Typography variant="caption" color="secondary">Libreto</Typography>
              <Typography variant="body2">{investigacion.libreto.titulo}</Typography>
              <Typography variant="body2" color="secondary">
                {investigacion.libreto.numero_participantes} participantes requeridos
              </Typography>
            </div>
          )}

          {/* Progreso */}
          <div className="flex items-center gap-2">
            <Typography variant="caption" color="secondary">Progreso</Typography>
            <Typography variant="body2">
              {participantes.length}/{investigacion?.libreto?.numero_participantes || 0}
            </Typography>
          </div>
        </Card>
      )}

      {/* Lista de participantes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6">Participantes</Typography>
          <Button variant="primary" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Participante
          </Button>
        </div>
        
        {participantes.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="body2" color="secondary">
              No hay participantes asignados
            </Typography>
          </div>
        ) : (
          <div className="space-y-3">
            {participantes.map((participante, index) => (
              <div key={participante.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Typography variant="body2" weight="medium">
                    {participante.nombre || 'Sin nombre'}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {participante.email || 'Sin email'}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setParticipanteToEditAgendamiento(participante);
                      setShowAsignarAgendamientoModal(true);
                    }}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  ), [reclutamiento, investigacion, participantes]);

  // Loading state
  if (isInitializing || loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted-solid rounded w-1/3"></div>
            <div className="h-64 bg-muted-solid rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (!reclutamiento) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <Card className="p-8 text-center">
            <Typography variant="h4" className="mb-4">Reclutamiento no encontrado</Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              El reclutamiento solicitado no existe o no tienes permisos para verlo.
            </Typography>
            <Button variant="primary" onClick={() => router.push('/reclutamiento')}>
              Volver a Reclutamiento
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/reclutamiento')}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <Typography variant="h3" weight="bold">
                {reclutamiento.investigacion_nombre}
              </Typography>
              <Typography variant="body1" color="secondary">
                Reclutamiento • {formatearFecha(reclutamiento.fecha_asignado)}
              </Typography>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          items={[
            {
              value: 'informacion',
              label: 'Información',
              icon: <ClipboardListIcon className="w-4 h-4" />
            },
            {
              value: 'participantes',
              label: 'Participantes',
              icon: <UserIcon className="w-4 h-4" />
            }
          ]}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'informacion' && InformacionTabContent}
          {activeTab === 'participantes' && ParticipantesTabContent}
        </div>

        {/* Modal de Asignar Agendamiento */}
        <AsignarAgendamientoModal
          isOpen={showAsignarAgendamientoModal}
          onClose={() => {
            setShowAsignarAgendamientoModal(false);
            setParticipanteToEditAgendamiento(null);
          }}
          onSuccess={handleSuccessAsignarAgendamiento}
          investigacionId={reclutamiento.investigacion_id}
          investigacionNombre={reclutamiento.investigacion_nombre}
          isEditMode={!!participanteToEditAgendamiento}
          reclutamientoId={participanteToEditAgendamiento?.reclutamiento_id}
          responsableActual={participanteToEditAgendamiento?.reclutador_id}
        />
      </div>
    </Layout>
  );
};

export default VerReclutamientoOptimizado;
