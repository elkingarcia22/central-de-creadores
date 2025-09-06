import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Card, Button, Chip, Subtitle, UserAvatar } from '../ui';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  CopyIcon,
  LinkIcon,
  InfoIcon,
  BarChartIcon
} from '../icons';
import { obtenerTrazabilidadCompleta } from '../../api/supabase-seguimientos';
import { formatearFecha } from '../../utils/fechas';
import { getChipVariant, getChipText } from '../../utils/chipUtils';

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
      
      console.log('🔍 Datos de trazabilidad recibidos:', response.data);
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
  const getEstadoColor = (estado: string): any => {
    return getChipVariant(estado);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Subtitle>
            Trazabilidad
          </Subtitle>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Subtitle>
          Trazabilidad ({trazabilidad.origen.seguimientos.length + trazabilidad.derivadas.investigaciones.length})
        </Subtitle>
      </div>

      {/* Origen - Investigaciones que dieron origen a esta */}
      {tieneOrigen && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
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
            {trazabilidad.origen.investigaciones.map((investigacion, index) => (
              <div key={investigacion.id} className="flex items-start gap-3 relative group">
                {/* Línea vertical del timeline */}
                <div 
                  className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60"
                  style={{zIndex:0}} 
                />
                
                {/* Punto del timeline */}
                <div className="z-10 w-8 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border-2 border-white shadow">
                    <FileTextIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <Card className="flex-1 p-4 mb-2">
                  {/* Header con metadata */}
                  <div className="flex items-center gap-2 mb-2">
                    <Chip variant={getEstadoColor(investigacion.estado)} size="sm">
                      {investigacion.estado}
                    </Chip>
                    <Typography 
                      variant="body2" 
                      className="!text-gray-600 dark:!text-gray-300 font-medium"
                    >
                      {formatearFecha(investigacion.fecha_inicio)} - {formatearFecha(investigacion.fecha_fin)}
                    </Typography>
                  </div>
                  
                  {/* Título de la investigación */}
                  <Typography 
                    variant="body1" 
                    className="!text-gray-700 dark:!text-gray-200 mb-3"
                  >
                    {investigacion.nombre}
                  </Typography>

                  {/* Botón de acción */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 [ORIGEN] Datos completos de investigación:', investigacion);
                      console.log('🔍 [ORIGEN] ID de investigación:', investigacion.id);
                      console.log('🔍 [ORIGEN] URL completa:', `/investigaciones/ver/${investigacion.id}`);
                      console.log('🔍 [ORIGEN] Router actual:', router);
                      router.push(`/investigaciones/ver/${investigacion.id}`);
                    }}
                    className="flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Ver
                  </Button>
                </Card>
              </div>
            ))}

            {/* Seguimientos de origen */}
            {trazabilidad.origen.seguimientos.map((seguimiento, index) => (
              <div key={seguimiento.id} className="flex items-start gap-3 relative group">
                {/* Línea vertical del timeline */}
                <div 
                  className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60"
                  style={{zIndex:0}} 
                />
                
                {/* Punto del timeline */}
                <div className="z-10 w-8 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border-2 border-white shadow">
                    <CopyIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <Card className="flex-1 p-4 mb-2">
                  {/* Header con metadata */}
                  <div className="flex items-center gap-2 mb-2">
                    <Chip variant={getEstadoColor(seguimiento.estado)} size="sm">
                      {seguimiento.estado}
                    </Chip>
                    <Typography 
                      variant="body2" 
                      className="!text-gray-600 dark:!text-gray-300 font-medium"
                    >
                      {obtenerNombreUsuario(seguimiento.responsable_id)}
                    </Typography>
                    <UserAvatar 
                      src={usuarios.find(u => u.id === seguimiento.responsable_id)?.avatar_url} 
                      fallbackText={obtenerNombreUsuario(seguimiento.responsable_id)} 
                      size="sm" 
                    />
                  </div>
                  
                  {/* Título del seguimiento */}
                  <Typography 
                    variant="body1" 
                    className="!text-gray-700 dark:!text-gray-200 mb-2"
                  >
                    Seguimiento del {formatearFecha(seguimiento.fecha_seguimiento)}
                  </Typography>

                  {/* Descripción del seguimiento */}
                  <Typography 
                    variant="body2" 
                    className="!text-gray-600 dark:!text-gray-300"
                  >
                    {seguimiento.notas.substring(0, 100)}...
                  </Typography>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derivadas - Investigaciones creadas desde esta */}
      {tieneDerivadas && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChartIcon className="w-4 h-4 text-muted-foreground" />
            <Typography variant="h4" weight="medium">
              Investigaciones Derivadas
            </Typography>
            <Chip variant="secondary" className="text-xs">
              {trazabilidad.derivadas.investigaciones.length} investigación(es) • {trazabilidad.derivadas.seguimientos.length} seguimiento(s)
            </Chip>
          </div>

          <div className="space-y-4">
            {/* Investigaciones derivadas */}
            {trazabilidad.derivadas.investigaciones.map((investigacion, index) => (
              <div key={investigacion.id} className="flex items-start gap-3 relative group">
                {/* Línea vertical del timeline */}
                <div 
                  className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60"
                  style={{zIndex:0}} 
                />
                
                {/* Punto del timeline */}
                <div className="z-10 w-8 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border-2 border-white shadow">
                    <FileTextIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <Card className="flex-1 p-4 mb-2">
                  {/* Header con metadata */}
                  <div className="flex items-center gap-2 mb-2">
                    <Chip variant={getEstadoColor(investigacion.estado)} size="sm">
                      {investigacion.estado}
                    </Chip>
                    <Typography 
                      variant="body2" 
                      className="!text-gray-600 dark:!text-gray-300 font-medium"
                    >
                      {formatearFecha(investigacion.fecha_inicio)} - {formatearFecha(investigacion.fecha_fin)}
                    </Typography>
                  </div>
                  
                  {/* Título de la investigación */}
                  <Typography 
                    variant="body1" 
                    className="!text-gray-700 dark:!text-gray-200 mb-3"
                  >
                    {investigacion.nombre}
                  </Typography>

                  {/* Botón de acción */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 [DERIVADAS] Datos completos de investigación:', investigacion);
                      console.log('🔍 [DERIVADAS] ID de investigación:', investigacion.id);
                      console.log('🔍 [DERIVADAS] URL completa:', `/investigaciones/ver/${investigacion.id}`);
                      console.log('🔍 [DERIVADAS] Router actual:', router);
                      router.push(`/investigaciones/ver/${investigacion.id}`);
                    }}
                    className="flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Ver
                  </Button>
                </Card>
              </div>
            ))}

            {/* Seguimientos que dieron origen a investigaciones derivadas */}
            {trazabilidad.derivadas.seguimientos.map((seguimiento, index) => (
              <div key={seguimiento.id} className="flex items-start gap-3 relative group">
                {/* Línea vertical del timeline */}
                <div 
                  className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60"
                  style={{zIndex:0}} 
                />
                
                {/* Punto del timeline */}
                <div className="z-10 w-8 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border-2 border-white shadow">
                    <CopyIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <Card className="flex-1 p-4 mb-2">
                  {/* Header con metadata */}
                  <div className="flex items-center gap-2 mb-2">
                    <Chip variant={getEstadoColor(seguimiento.estado)} size="sm">
                      {seguimiento.estado}
                    </Chip>
                    <Typography 
                      variant="body2" 
                      className="!text-gray-600 dark:!text-gray-300 font-medium"
                    >
                      {obtenerNombreUsuario(seguimiento.responsable_id)}
                    </Typography>
                    <UserAvatar 
                      src={usuarios.find(u => u.id === seguimiento.responsable_id)?.avatar_url} 
                      fallbackText={obtenerNombreUsuario(seguimiento.responsable_id)} 
                      size="sm" 
                    />
                  </div>
                  
                  {/* Título del seguimiento */}
                  <Typography 
                    variant="body1" 
                    className="!text-gray-700 dark:!text-gray-200 mb-2"
                  >
                    Seguimiento del {formatearFecha(seguimiento.fecha_seguimiento)}
                  </Typography>

                  {/* Descripción del seguimiento */}
                  <Typography 
                    variant="body2" 
                    className="!text-gray-600 dark:!text-gray-300"
                  >
                    {seguimiento.notas.substring(0, 100)}...
                  </Typography>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 