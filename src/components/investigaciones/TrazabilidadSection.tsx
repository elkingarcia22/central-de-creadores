import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Card, Button, Badge } from '../ui';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  CopyIcon,
  LinkIcon,
  InfoIcon
} from '../icons';
import { obtenerTrazabilidadCompleta } from '../../api/supabase-seguimientos';
import { formatearFecha } from '../../utils/fechas';

interface TrazabilidadSectionProps {
  investigacionId: string;
  investigacionNombre: string;
  usuarios: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  }>;
}

interface TrazabilidadData {
  investigacion_actual: {
    id: string;
    seguimientos: any[];
  };
  origen: {
    seguimientos: any[];
    investigaciones: any[];
  };
  derivadas: {
    investigaciones: any[];
    seguimientos: any[];
  };
}

export const TrazabilidadSection: React.FC<TrazabilidadSectionProps> = ({
  investigacionId,
  investigacionNombre,
  usuarios
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError } = useToast();
  
  const [trazabilidad, setTrazabilidad] = useState<TrazabilidadData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar trazabilidad
  const cargarTrazabilidad = async () => {
    try {
      setLoading(true);
      const response = await obtenerTrazabilidadCompleta(investigacionId);
      
      if (response.error) {
        showError('Error al cargar trazabilidad');
        return;
      }
      
      setTrazabilidad(response.data);
    } catch (error) {
      console.error('Error cargando trazabilidad:', error);
      showError('Error al cargar trazabilidad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTrazabilidad();
  }, [investigacionId]);

  // Obtener nombre del usuario
  const obtenerNombreUsuario = (userId: string) => {
    if (!userId) return 'Usuario desconocido';
    const usuario = usuarios.find(u => u.id === userId);
    return usuario?.full_name || usuario?.email || 'Usuario desconocido';
  };

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'default';
      case 'en_progreso': return 'warning';
      case 'completado': return 'success';
      case 'convertido': return 'success';
      case 'finalizado': return 'success';
      case 'en_borrador': return 'default';
      case 'por_iniciar': return 'warning';
      case 'pausado': return 'secondary';
      case 'cancelado': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          <Typography variant="h3" weight="medium">
            Trazabilidad
          </Typography>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!trazabilidad) {
    return null;
  }

  const tieneOrigen = trazabilidad.origen.seguimientos.length > 0 || trazabilidad.origen.investigaciones.length > 0;
  const tieneDerivadas = trazabilidad.derivadas.investigaciones.length > 0 || trazabilidad.derivadas.seguimientos.length > 0;

  // Si no hay trazabilidad, no mostrar la sección
  if (!tieneOrigen && !tieneDerivadas) {
    return null;
  }

  // Si no hay ningún elemento de trazabilidad, no mostrar nada
  if (
    (!trazabilidad.origen.seguimientos || trazabilidad.origen.seguimientos.length === 0) &&
    (!trazabilidad.origen.investigaciones || trazabilidad.origen.investigaciones.length === 0) &&
    (!trazabilidad.derivadas.investigaciones || trazabilidad.derivadas.investigaciones.length === 0) &&
    (!trazabilidad.derivadas.seguimientos || trazabilidad.derivadas.seguimientos.length === 0)
  ) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-primary" />
        <Typography variant="h3" weight="medium">
          Trazabilidad
        </Typography>
        <Chip variant="secondary" className="text-xs">
          {trazabilidad.origen.seguimientos.length + trazabilidad.derivadas.investigaciones.length} elementos relacionados
        </Chip>
      </div>

      {/* Origen - Investigaciones que dieron origen a esta */}
      {tieneOrigen && (
        <Card variant="outlined" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftIcon className="w-4 h-4 text-muted-foreground" />
            <Typography variant="h4" weight="medium">
              Origen
            </Typography>
            <Chip variant="secondary" className="text-xs">
              {trazabilidad.origen.investigaciones.length} investigación(es) • {trazabilidad.origen.seguimientos.length} seguimiento(s)
            </Chip>
          </div>

          <div className="space-y-4">
            {/* Investigaciones de origen */}
            {trazabilidad.origen.investigaciones.map((investigacion) => (
              <div key={investigacion.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Typography variant="subtitle2" weight="medium">
                      {investigacion.nombre}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {formatearFecha(investigacion.fecha_inicio)} - {formatearFecha(investigacion.fecha_fin)}
                    </Typography>
                  </div>
                  <Chip variant={getEstadoColor(investigacion.estado)}>
                    {investigacion.estado}
                  </Chip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/investigaciones/ver/${investigacion.id}`)}
                  className="flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Ver
                </Button>
              </div>
            ))}

            {/* Seguimientos de origen */}
            {trazabilidad.origen.seguimientos.map((seguimiento) => (
              <div key={seguimiento.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CopyIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Typography variant="subtitle2" weight="medium">
                      Seguimiento del {formatearFecha(seguimiento.fecha_seguimiento)}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {seguimiento.notas.substring(0, 100)}...
                    </Typography>
                  </div>
                  <Chip variant={getEstadoColor(seguimiento.estado)}>
                    {seguimiento.estado}
                  </Chip>
                </div>
                <div className="text-xs text-muted-foreground">
                  {obtenerNombreUsuario(seguimiento.responsable_id)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Derivadas - Investigaciones creadas desde esta */}
      {tieneDerivadas && (
        <Card variant="outlined" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftIcon className="w-4 h-4 text-muted-foreground" />
            <Typography variant="h4" weight="medium">
              Investigaciones Derivadas
            </Typography>
            <Chip variant="secondary" className="text-xs">
              {trazabilidad.derivadas.investigaciones.length} investigación(es) • {trazabilidad.derivadas.seguimientos.length} seguimiento(s)
            </Chip>
          </div>

          <div className="space-y-4">
            {/* Investigaciones derivadas */}
            {trazabilidad.derivadas.investigaciones.map((investigacion) => (
              <div key={investigacion.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Typography variant="subtitle2" weight="medium">
                      {investigacion.nombre}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {formatearFecha(investigacion.fecha_inicio)} - {formatearFecha(investigacion.fecha_fin)}
                    </Typography>
                  </div>
                  <Chip variant={getEstadoColor(investigacion.estado)}>
                    {investigacion.estado}
                  </Chip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/investigaciones/ver/${investigacion.id}`)}
                  className="flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Ver
                </Button>
              </div>
            ))}

            {/* Seguimientos que dieron origen a investigaciones derivadas */}
            {trazabilidad.derivadas.seguimientos.map((seguimiento) => (
              <div key={seguimiento.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CopyIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Typography variant="subtitle2" weight="medium">
                      Seguimiento del {formatearFecha(seguimiento.fecha_seguimiento)}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {seguimiento.notas.substring(0, 100)}...
                    </Typography>
                  </div>
                  <Chip variant={getEstadoColor(seguimiento.estado)}>
                    {seguimiento.estado}
                  </Chip>
                </div>
                <div className="text-xs text-muted-foreground">
                  {obtenerNombreUsuario(seguimiento.responsable_id)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}; 