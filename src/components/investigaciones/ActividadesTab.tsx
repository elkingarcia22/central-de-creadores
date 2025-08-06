import React, { useState, useEffect } from 'react';
import { Card, Typography, Chip, UserAvatar } from '../../components/ui';
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

const getTipoActividadInfo = (tipo: string) => {
  const tipos = {
    creacion: { label: 'Creación', color: 'success', icon: '🟢' },
    edicion: { label: 'Edición', color: 'info', icon: '✏️' },
    cambio_estado: { label: 'Cambio de Estado', color: 'warning', icon: '🔄' },
    cambio_fechas: { label: 'Cambio de Fechas', color: 'info', icon: '📅' },
    cambio_responsable: { label: 'Cambio de Responsable', color: 'warning', icon: '👤' },
    cambio_implementador: { label: 'Cambio de Implementador', color: 'warning', icon: '🔧' },
    cambio_producto: { label: 'Cambio de Producto', color: 'info', icon: '📦' },
    cambio_tipo_investigacion: { label: 'Cambio de Tipo', color: 'info', icon: '🏷️' },
    cambio_periodo: { label: 'Cambio de Período', color: 'info', icon: '📊' },
    cambio_link_prueba: { label: 'Cambio de Link Prueba', color: 'info', icon: '🔗' },
    cambio_link_resultados: { label: 'Cambio de Link Resultados', color: 'info', icon: '📊' },
    cambio_libreto: { label: 'Cambio de Libreto', color: 'info', icon: '📋' },
    cambio_descripcion: { label: 'Cambio de Descripción', color: 'info', icon: '📝' },
    eliminacion: { label: 'Eliminación', color: 'danger', icon: '🗑️' }
  };
  return tipos[tipo as keyof typeof tipos] || { label: tipo, color: 'default', icon: '📌' };
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
        <Typography variant="h5" className="font-semibold">
          Actividades ({actividades.length})
        </Typography>
      </div>
      <div className="space-y-4">
        {actividades.map((actividad) => {
          const tipoInfo = getTipoActividadInfo(actividad.tipo_actividad);
          const resumen = getResumenActividad(actividad);
          console.log('🔍 Renderizando actividad:', actividad.id, tipoInfo, resumen);
          return (
            <div key={actividad.id} className="flex items-start gap-3 relative group">
              {/* Línea vertical del timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60 group-last:hidden" style={{zIndex:0}} />
              {/* Punto del timeline */}
              <div className="z-10 w-8 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-muted border-2 border-white shadow">
                  {tipoInfo.icon}
                </div>
              </div>
              <Card className="flex-1 p-4 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Chip variant={tipoInfo.color as any} size="sm">{tipoInfo.label}</Chip>
                  <Typography variant="body2" className="font-medium">
                    {actividad.usuario?.full_name || 'Desconocido'}
                  </Typography>
                  <UserAvatar src={actividad.usuario?.avatar_url} fallbackText={actividad.usuario?.full_name || ''} size="sm" />
                  <Typography variant="body2" className="text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(actividad.fecha_creacion), { addSuffix: true, locale: enUS })}
                    <span className="ml-2 text-xs text-muted-foreground">({format(new Date(actividad.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: enUS })})</span>
                  </Typography>
                </div>
                <Typography variant="body1" className="mb-1">
                  {resumen}
                </Typography>
                {/* Ya no mostramos el detalle de cambios */}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActividadesTab; 