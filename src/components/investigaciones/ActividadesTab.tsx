import React, { useState, useEffect } from 'react';
import { Card, Typography, Chip, UserAvatar, Subtitle, ActivityCard } from '../../components/ui';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface Actividad {
  id: string;
  investigacion_id: string;
  tipo_actividad: string;
  descripcion: string;
  cambios?: any;
  usuario_id: string;
  fecha_creacion: string;
  usuario?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface ActividadesTabProps {
  investigacionId: string;
}

import { 
  PlusIcon, 
  EditIcon, 
  RefreshIcon, 
  CalendarIcon, 
  UserIcon, 
  SettingsIcon, 
  BarChartIcon, 
  LinkIcon, 
  FileTextIcon, 
  TrashIcon,
  InfoIcon
} from '../../components/icons';

const getTipoActividadInfo = (tipo: string) => {
  const tipos = {
    creacion: { 
      label: 'Creación', 
      color: 'success' as const, 
      icon: <PlusIcon className="w-4 h-4" />
    },
    edicion: { 
      label: 'Edición', 
      color: 'info' as const, 
      icon: <EditIcon className="w-4 h-4" />
    },
    cambio_estado: { 
      label: 'Cambio de Estado', 
      color: 'warning' as const, 
      icon: <RefreshIcon className="w-4 h-4" />
    },
    cambio_fechas: { 
      label: 'Cambio de Fechas', 
      color: 'info' as const, 
      icon: <CalendarIcon className="w-4 h-4" />
    },
    cambio_responsable: { 
      label: 'Cambio de Responsable', 
      color: 'warning' as const, 
      icon: <UserIcon className="w-4 h-4" />
    },
    cambio_implementador: { 
      label: 'Cambio de Implementador', 
      color: 'warning' as const, 
      icon: <SettingsIcon className="w-4 h-4" />
    },
    cambio_producto: { 
      label: 'Cambio de Producto', 
      color: 'info' as const, 
      icon: <BarChartIcon className="w-4 h-4" />
    },
    cambio_tipo_investigacion: { 
      label: 'Cambio de Tipo', 
      color: 'info' as const, 
      icon: <InfoIcon className="w-4 h-4" />
    },
    cambio_periodo: { 
      label: 'Cambio de Período', 
      color: 'info' as const, 
      icon: <BarChartIcon className="w-4 h-4" />
    },
    cambio_link_prueba: { 
      label: 'Cambio de Link Prueba', 
      color: 'info' as const, 
      icon: <LinkIcon className="w-4 h-4" />
    },
    cambio_link_resultados: { 
      label: 'Cambio de Link Resultados', 
      color: 'info' as const, 
      icon: <BarChartIcon className="w-4 h-4" />
    },
    cambio_libreto: { 
      label: 'Cambio de Libreto', 
      color: 'info' as const, 
      icon: <FileTextIcon className="w-4 h-4" />
    },
    cambio_descripcion: { 
      label: 'Cambio de Descripción', 
      color: 'info' as const, 
      icon: <EditIcon className="w-4 h-4" />
    },
    eliminacion: { 
      label: 'Eliminación', 
      color: 'danger' as const, 
      icon: <TrashIcon className="w-4 h-4" />
    }
  };
  return tipos[tipo as keyof typeof tipos] || { 
    label: tipo, 
    color: 'default' as const, 
    icon: <InfoIcon className="w-4 h-4" />
  };
};

// Extrae un resumen humano de los cambios
function getResumenActividad(actividad: Actividad): string {
  if (!actividad.cambios) return actividad.descripcion;
  // Casos especiales para cambios de estado
  if (actividad.tipo_actividad === 'cambio_estado' && actividad.cambios.estado_anterior && actividad.cambios.estado_nuevo) {
    return `Cambio de estado: ${actividad.cambios.estado_anterior} → ${actividad.cambios.estado_nuevo}`;
  }
  // Si hay valores_nuevos y valores_anteriores
  if (actividad.cambios.valores_nuevos && actividad.cambios.valores_anteriores) {
    // Detectar campos cambiados
    const nuevos = actividad.cambios.valores_nuevos;
    const anteriores = actividad.cambios.valores_anteriores;
    const cambios = Object.keys(nuevos).filter(k => nuevos[k] !== anteriores[k]);
    if (cambios.length === 1) {
      return `Cambio en "${cambios[0]}"`;
    } else if (cambios.length > 1) {
      return `Cambios en: ${cambios.map(c => `"${c}"`).join(', ')}`;
    }
  }
  // Por defecto, mostrar la descripción
  return actividad.descripcion;
}

const ActividadesTab: React.FC<ActividadesTabProps> = ({ investigacionId }) => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Cargando actividades para investigación:', investigacionId);
        const response = await fetch(`/api/actividades-investigacion?investigacion_id=${investigacionId}`);
        if (!response.ok) throw new Error('Error al cargar actividades');
        const data = await response.json();
        console.log('📊 Actividades recibidas:', data);
        setActividades(data);
      } catch (err) {
        console.error('❌ Error cargando actividades:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setActividades([]);
      } finally {
        setLoading(false);
      }
    };
    if (investigacionId) cargarActividades();
  }, [investigacionId]);

  console.log('🔍 Estado del componente:', { loading, error, actividadesCount: actividades.length });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6" className="text-danger mb-2">
          Error al cargar actividades
        </Typography>
        <Typography variant="body2" className="text-muted-foreground">
          {error}
        </Typography>
      </div>
    );
  }
  if (actividades.length === 0) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h6" className="text-muted-foreground mb-2">
          No hay actividades registradas
        </Typography>
        <Typography variant="body2" className="text-muted-foreground">
          Las actividades se registrarán automáticamente cuando se realicen cambios en la investigación.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <Subtitle>
          Actividades ({actividades.length})
        </Subtitle>
      </div>
      <div className="space-y-4">
        {actividades.map((actividad, index) => {
          const tipoInfo = getTipoActividadInfo(actividad.tipo_actividad);
          const resumen = getResumenActividad(actividad);
          console.log('🔍 Renderizando actividad:', actividad.id, tipoInfo, resumen);
          return (
            <ActivityCard
              key={actividad.id}
              id={actividad.id}
              tipo={actividad.tipo_actividad}
              label={tipoInfo.label}
              color={tipoInfo.color}
              icon={tipoInfo.icon}
              userName={actividad.usuario?.full_name || 'Desconocido'}
              userAvatar={actividad.usuario?.avatar_url}
              fechaCreacion={actividad.fecha_creacion}
              resumen={resumen}
              isLast={index === actividades.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ActividadesTab; 