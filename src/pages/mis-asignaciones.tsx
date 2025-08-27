import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Typography, Card, Badge, DataTable } from '../components/ui';
import { CalendarIcon, ClockIcon, UserIcon, PhoneIcon, EmailIcon } from '../components/icons';
import { getChipVariant, getChipText } from '../utils/chipUtils';

interface Asignacion {
  reclutamiento_id: string;
  investigacion_id: string;
  participante_id: string;
  investigacion_nombre: string;
  investigacion_estado: string;
  participante_nombre: string;
  participante_email: string;
  participante_telefono: string;
  estado_agendamiento: string;
  fecha_sesion: string | null;
  hora_sesion: string | null;
  duracion_sesion: number | null;
  libreto_nombre: string;
  libreto_participantes: number;
  libreto_duracion: string;
  creado_el: string;
  actualizado_el: string;
}

export default function MisAsignaciones() {
  const router = useRouter();
  const { userProfile } = useUser();
  const { theme } = useTheme();
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile?.id) {
      cargarAsignaciones();
    }
  }, [userProfile?.id]);

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mis-asignaciones-agendamiento?usuarioId=${userProfile?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAsignaciones(data.asignaciones || []);
      } else {
        setError('Error cargando asignaciones');
      }
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeVariant = (estado: string): any => {
    return getChipVariant(estado);
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'd32b84d1-6209-41d9-8108-03588ca1f9b5': // Pendiente de agendamiento
        return 'Pendiente de agendamiento';
      case 'agendada':
        return 'Agendada';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No programada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string | null) => {
    if (!hora) return 'No programada';
    return hora;
  };

  const columns = [
    {
      key: 'investigacion',
      label: 'Investigación',
      render: (asignacion: Asignacion) => (
        <div>
          <Typography variant="body1" weight="semibold">
            {asignacion.investigacion_nombre}
          </Typography>
          <Typography variant="body2" color="secondary">
            {asignacion.libreto_nombre}
          </Typography>
        </div>
      )
    },
    {
      key: 'participante',
      label: 'Participante',
      render: (asignacion: Asignacion) => (
        <div>
          <Typography variant="body1" weight="semibold">
            {asignacion.participante_nombre}
          </Typography>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <EmailIcon className="w-3 h-3" />
            {asignacion.participante_email}
          </div>
          {asignacion.participante_telefono && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <PhoneIcon className="w-3 h-3" />
              {asignacion.participante_telefono}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha y Hora',
      render: (asignacion: Asignacion) => (
        <div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <Typography variant="body2">
              {formatearFecha(asignacion.fecha_sesion)}
            </Typography>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <Typography variant="body2">
              {formatearHora(asignacion.hora_sesion)}
            </Typography>
          </div>
          {asignacion.duracion_sesion && (
            <Typography variant="body2" color="secondary">
              {asignacion.duracion_sesion} min
            </Typography>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (asignacion: Asignacion) => (
        <Badge variant={getEstadoBadgeVariant(asignacion.estado_agendamiento)}>
          {getEstadoText(asignacion.estado_agendamiento)}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (asignacion: Asignacion) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/reclutamiento/ver-reclutamiento/${asignacion.reclutamiento_id}`)}
          >
            Ver Reclutamiento
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/reclutamiento/ver/${asignacion.reclutamiento_id}?tab=agendamiento`)}
          >
            Agendar Sesión
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="h1" weight="bold" className="mb-2">
                Mis Asignaciones de Agendamiento
              </Typography>
              <Typography variant="body1" color="secondary">
                Gestiona las sesiones que tienes asignadas para agendar
              </Typography>
            </div>
            <button
              onClick={() => router.back()}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold" className="text-blue-600">
                {asignaciones.length}
              </Typography>
              <Typography variant="body2" color="secondary">
                Total Asignaciones
              </Typography>
            </Card>
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold" className="text-gray-600">
                {asignaciones.filter(a => a.estado_agendamiento === 'd32b84d1-6209-41d9-8108-03588ca1f9b5').length}
              </Typography>
              <Typography variant="body2" color="secondary">
                Pendientes de Agendar
              </Typography>
            </Card>
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold" className="text-green-600">
                {asignaciones.filter(a => a.estado_agendamiento === 'agendada').length}
              </Typography>
              <Typography variant="body2" color="secondary">
                Agendadas
              </Typography>
            </Card>
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold" className="text-purple-600">
                {asignaciones.filter(a => a.estado_agendamiento === 'completada').length}
              </Typography>
              <Typography variant="body2" color="secondary">
                Completadas
              </Typography>
            </Card>
            <Card variant="elevated" padding="md">
              <Typography variant="h3" weight="bold" className="text-red-600">
                {asignaciones.filter(a => a.estado_agendamiento === 'cancelada').length}
              </Typography>
              <Typography variant="body2" color="secondary">
                Canceladas
              </Typography>
            </Card>
          </div>
        </div>

        {/* Tabla de asignaciones */}
        {error ? (
          <Card variant="elevated" padding="lg">
                          <Typography variant="body1" color="danger">
              {error}
            </Typography>
          </Card>
        ) : asignaciones.length === 0 ? (
          <Card variant="elevated" padding="lg">
            <div className="text-center py-8">
              <Typography variant="h3" color="secondary" className="mb-2">
                No tienes asignaciones de agendamiento
              </Typography>
              <Typography variant="body1" color="secondary">
                Cuando te asignen reclutamientos para agendar, aparecerán aquí.
              </Typography>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="lg">
                    <DataTable
          data={asignaciones}
          columns={columns}
          searchable={true}
        />
          </Card>
        )}
      </div>
    </div>
  );
}
