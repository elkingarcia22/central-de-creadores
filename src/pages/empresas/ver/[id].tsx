import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { usePermisos } from '../../../utils/permisosUtils';
import { Empresa } from '../../../types/empresas';

import { Layout } from '../../../components/ui';
import Typography from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Chip from '../../../components/ui/Chip';
import MetricCard from '../../../components/ui/MetricCard';
import Tabs from '../../../components/ui/Tabs';
import { 
  BuildingIcon, 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrendingUpIcon,
  UsersIcon,
  FileTextIcon,
  ExternalLinkIcon,
  StarIcon,
  ArrowLeftIcon,
  EditIcon,
  BarChartIcon,
  HistoryIcon,
  InfoIcon,
  ConfiguracionesIcon
} from '../../../components/icons';
import { formatearFecha } from '../../../utils/fechas';

// Funciones de utilidad para colores
const getEstadoColor = (estado: string): string => {
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('activo') || estadoLower.includes('activa')) return 'success';
  if (estadoLower.includes('inactivo') || estadoLower.includes('inactiva')) return 'warning';
  if (estadoLower.includes('pendiente')) return 'warning';
  if (estadoLower.includes('completado') || estadoLower.includes('finalizado')) return 'success';
  if (estadoLower.includes('cancelado') || estadoLower.includes('cancelada')) return 'danger';
  return 'default';
};

const getRiesgoColor = (riesgo: string): string => {
  const riesgoLower = riesgo.toLowerCase();
  if (riesgoLower.includes('alto') || riesgoLower.includes('high')) return 'danger';
  if (riesgoLower.includes('medio') || riesgoLower.includes('medium')) return 'warning';
  if (riesgoLower.includes('bajo') || riesgoLower.includes('low')) return 'success';
  return 'default';
};

interface EstadisticasEmpresa {
  totalParticipaciones: number;
  totalParticipantes: number;
  fechaUltimaParticipacion: string | null;
  investigacionesParticipadas: number;
  duracionTotalSesiones: number;
  participacionesPorMes: { [key: string]: number };
  investigaciones: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    tipo_sesion: string;
    riesgo_automatico: string;
    responsable: { id: string; full_name: string; email: string } | null;
    implementador: { id: string; full_name: string; email: string } | null;
    participaciones: number;
  }>;
}

interface Participante {
  id: string;
  nombre: string;
  rol_empresa_id: string;
  fecha_ultima_participacion: string | null;
  total_participaciones: number;
}

interface EmpresaDetallada extends Empresa {
  estadisticas?: EstadisticasEmpresa;
  participantes?: Participante[];
}

interface EmpresaVerPageProps {
  empresa: EmpresaDetallada;
}

export default function EmpresaVerPage({ empresa }: EmpresaVerPageProps) {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { userProfile } = useUser();
  const { tienePermiso } = usePermisos();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaData, setEmpresaData] = useState<EmpresaDetallada>(empresa);

  useEffect(() => {
    if (empresa.id) {
      cargarEstadisticas(empresa.id);
    }
  }, [empresa.id]);

  const cargarEstadisticas = async (empresaId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/empresas/${empresaId}/estadisticas`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      
      const data = await response.json();
      setEmpresaData({
        ...empresa,
        estadisticas: data.estadisticas,
        participantes: data.participantes
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activa':
      case 'completada':
        return 'success';
      case 'en_progreso':
      case 'en progreso':
        return 'warning';
      case 'pausada':
      case 'cancelada':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getRiesgoColor = (riesgo: string) => {
    switch (riesgo?.toLowerCase()) {
      case 'bajo':
        return 'success';
      case 'medio':
        return 'warning';
      case 'alto':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatearDuracion = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const abrirInvestigacion = (investigacionId: string) => {
    window.open(`/investigaciones/ver/${investigacionId}`, '_blank');
  };

  const [activeTab, setActiveTab] = useState('informacion');

  // Componente de contenido de información
  const InformacionContent = () => (
    <div className="space-y-6">
      {/* Información básica */}
      <Card className="p-6">
        <div className="mb-4">
          <Typography variant="h3" className="mb-2">{empresaData.nombre}</Typography>
          <div className="flex items-center gap-3">
            <Chip variant={empresaData.activo ? 'success' : 'warning'}>
              {empresaData.activo ? 'Activa' : 'Inactiva'}
            </Chip>
            {empresaData.estado_nombre && (
              <Chip variant={getEstadoColor(empresaData.estado_nombre)}>
                {empresaData.estado_nombre}
              </Chip>
            )}
          </div>
        </div>
        
        {empresaData.descripcion && (
          <div className="mb-4">
            <Typography variant="subtitle2" className="mb-2">Descripción</Typography>
            <Typography variant="body1" color="secondary">
              {empresaData.descripcion}
            </Typography>
          </div>
        )}
      </Card>

      {/* Detalles de la empresa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contacto */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Contacto</Typography>
          </div>
          <div className="space-y-3">
            <div>
              <Typography variant="caption" color="secondary">KAM Asignado</Typography>
              <Typography variant="body2">{empresaData.kam_nombre || 'Sin asignar'}</Typography>
              {empresaData.kam_email && (
                <Typography variant="caption" color="secondary" className="block">
                  {empresaData.kam_email}
                </Typography>
              )}
            </div>
            <div>
              <Typography variant="caption" color="secondary">País</Typography>
              <Typography variant="body2">{empresaData.pais_nombre || 'Sin especificar'}</Typography>
            </div>
          </div>
        </Card>

        {/* Fechas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Fechas</Typography>
          </div>
          <div className="space-y-3">
            <div>
              <Typography variant="caption" color="secondary">Fecha de creación</Typography>
              <Typography variant="body2">{formatearFecha(empresaData.created_at)}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="secondary">Última actualización</Typography>
              <Typography variant="body2">{formatearFecha(empresaData.updated_at)}</Typography>
            </div>
          </div>
        </Card>

        {/* Estado */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BuildingIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Estado</Typography>
          </div>
          <div className="space-y-3">
            <div>
              <Typography variant="caption" color="secondary">Estado</Typography>
              {empresaData.estado_nombre ? (
                <Chip variant={getEstadoColor(empresaData.estado_nombre)}>
                  {empresaData.estado_nombre}
                </Chip>
              ) : (
                <Typography variant="body2">Sin especificar</Typography>
              )}
            </div>
            {empresaData.tamano_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Tamaño</Typography>
                <Typography variant="body2">{empresaData.tamano_nombre}</Typography>
              </div>
            )}
            {empresaData.relacion_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Relación</Typography>
                <Typography variant="body2">{empresaData.relacion_nombre}</Typography>
              </div>
            )}
          </div>
        </Card>

        {/* Configuración */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ConfiguracionesIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Configuración</Typography>
          </div>
          <div className="space-y-3">
            {empresaData.producto_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Producto</Typography>
                <Typography variant="body2">{empresaData.producto_nombre}</Typography>
              </div>
            )}
            {empresaData.modalidad_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Modalidad</Typography>
                <Typography variant="body2">{empresaData.modalidad_nombre}</Typography>
              </div>
            )}
            {empresaData.industria_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Industria</Typography>
                <Typography variant="body2">{empresaData.industria_nombre}</Typography>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  // Componente de contenido de estadísticas
  const EstadisticasContent = () => (
    <div className="space-y-6">
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <Typography variant="body1" className="ml-3">
            Cargando estadísticas...
          </Typography>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <Typography variant="body1" color="danger">
            Error: {error}
          </Typography>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => empresaData.id && cargarEstadisticas(empresaData.id)}
          >
            Reintentar
          </Button>
        </Card>
      )}

      {/* Estadísticas */}
      {empresaData.estadisticas && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Participaciones"
              value={empresaData.estadisticas.totalParticipaciones}
              subtitle="Sesiones completadas"
              icon={<TrendingUpIcon />}
              color="blue"
            />
            
            <MetricCard
              title="Participantes"
              value={empresaData.estadisticas.totalParticipantes}
              subtitle="Personas involucradas"
              icon={<UsersIcon />}
              color="green"
            />
            
            <MetricCard
              title="Investigaciones"
              value={empresaData.estadisticas.investigacionesParticipadas}
              subtitle="Proyectos participados"
              icon={<FileTextIcon />}
              color="purple"
            />
            
            <MetricCard
              title="Tiempo Total"
              value={formatearDuracion(empresaData.estadisticas.duracionTotalSesiones)}
              subtitle="Horas de participación"
              icon={<ClockIcon />}
              color="yellow"
            />
          </div>

          {/* Última participación */}
          {empresaData.estadisticas.fechaUltimaParticipacion && (
            <Card className="p-6">
              <Typography variant="h5" className="mb-4">Última Participación</Typography>
              <div className="space-y-3">
                <div>
                  <Typography variant="caption" color="secondary">Fecha</Typography>
                  <Typography variant="body2">{formatearFecha(empresaData.estadisticas.fechaUltimaParticipacion)}</Typography>
                </div>
              </div>
            </Card>
          )}

          {/* Gráfico de participaciones por mes */}
          {Object.keys(empresaData.estadisticas.participacionesPorMes).length > 0 && (
            <Card className="p-6">
              <Typography variant="h5" className="mb-4">Participaciones por Mes</Typography>
              <div className="space-y-3">
                {Object.entries(empresaData.estadisticas.participacionesPorMes)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 12)
                  .map(([mes, cantidad]) => (
                    <div key={mes} className="flex items-center justify-between">
                      <Typography variant="body2" color="secondary">
                        {new Date(mes + '-01').toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </Typography>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((cantidad / Math.max(...Object.values(empresaData.estadisticas.participacionesPorMes))) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <Typography variant="body2" weight="medium" className="w-8 text-right">
                          {cantidad}
                        </Typography>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  // Componente de contenido de historial
  const HistorialContent = () => (
    <div className="space-y-6">
      {/* Investigaciones participadas */}
      {empresaData.estadisticas?.investigaciones && empresaData.estadisticas.investigaciones.length > 0 && (
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Investigaciones Participadas
          </Typography>
          
          <div className="space-y-4">
            {empresaData.estadisticas.investigaciones.map((investigacion) => (
              <Card key={investigacion.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Typography variant="body1" weight="semibold">
                        {investigacion.nombre}
                      </Typography>
                      <Chip variant={getEstadoColor(investigacion.estado)}>
                        {investigacion.estado}
                      </Chip>
                      <Chip variant={getRiesgoColor(investigacion.riesgo_automatico)} size="sm">
                        {investigacion.riesgo_automatico}
                      </Chip>
                    </div>
                    
                    {investigacion.descripcion && (
                      <Typography variant="body2" color="secondary" className="mb-3">
                        {investigacion.descripcion}
                      </Typography>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatearFecha(investigacion.fecha_inicio)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{investigacion.participaciones} participaciones</span>
                      </div>
                      
                      {investigacion.responsable && (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{investigacion.responsable.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirInvestigacion(investigacion.id)}
                    className="ml-4"
                  >
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Participantes de la empresa */}
      {empresaData.participantes && empresaData.participantes.length > 0 && (
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Participantes de la Empresa
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresaData.participantes.map((participante) => (
              <Card key={participante.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Typography variant="body1" weight="medium" className="mb-2">
                      {participante.nombre}
                    </Typography>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <TrendingUpIcon className="w-4 h-4" />
                        <span>{participante.total_participaciones} participaciones</span>
                      </div>
                      
                      {participante.fecha_ultima_participacion && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Última: {formatearFecha(participante.fecha_ultima_participacion)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Chip variant="default">
                    {participante.total_participaciones > 0 ? 'Activo' : 'Sin participación'}
                  </Chip>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {(!empresaData.estadisticas?.investigaciones || empresaData.estadisticas.investigaciones.length === 0) &&
       (!empresaData.participantes || empresaData.participantes.length === 0) && (
        <Card className="text-center py-12">
          <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Typography variant="h5" weight="medium" className="mb-2">
            Sin historial de participaciones
          </Typography>
          <Typography variant="body2" color="secondary">
            Esta empresa aún no ha participado en investigaciones
          </Typography>
        </Card>
      )}
    </div>
  );

  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: <InfoIcon className="w-4 h-4" />,
      content: <InformacionContent />
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: <BarChartIcon className="w-4 h-4" />,
      content: <EstadisticasContent />
    },
    {
      id: 'historial',
      label: 'Historial de Participaciones',
      icon: <HistoryIcon className="w-4 h-4" />,
      content: <HistorialContent />
    }
  ];

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver</span>
              </Button>
              
              <div>
                <Typography variant="h3">{empresaData.nombre}</Typography>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/empresas/editar/${empresaData.id}`)}
                className="flex items-center space-x-2"
              >
                <EditIcon className="w-4 h-4" />
                <span>Editar</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="border-b border-gray-200 dark:border-gray-700"
          />

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <Typography variant="body1" className="ml-3">
                Cargando estadísticas...
              </Typography>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <Typography variant="body1" color="danger">
                Error: {error}
              </Typography>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => empresaData.id && cargarEstadisticas(empresaData.id)}
              >
                Reintentar
              </Button>
            </Card>
          )}


        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || typeof id !== 'string') {
    return {
      notFound: true
    };
  }

  try {
    const response = await fetch(`http://localhost:3000/api/empresas/${id}`);
    
    if (!response.ok) {
      return {
        notFound: true
      };
    }

    const empresa = await response.json();

    return {
      props: {
        empresa
      }
    };
  } catch (error) {
    console.error('Error en SSR:', error);
    return {
      notFound: true
    };
  }
};
