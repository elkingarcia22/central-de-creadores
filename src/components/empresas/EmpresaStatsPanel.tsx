import React, { useState, useEffect } from 'react';
import SideModal from '../ui/SideModal';
import Typography from '../ui/Typography';
import Card from '../ui/Card';
import MetricCard from '../ui/MetricCard';
import Badge from '../ui/Badge';
import Chip from '../ui/Chip';
import Button from '../ui/Button';
import { 
  BuildingIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrendingUpIcon,
  UsersIcon,
  FileTextIcon,
  ExternalLinkIcon,
  MapPinIcon,
  StarIcon
} from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { Empresa } from '../../types/empresas';

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

interface EmpresaStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa | null;
}

export default function EmpresaStatsPanel({
  isOpen,
  onClose,
  empresa
}: EmpresaStatsPanelProps) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasEmpresa | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && empresa?.id) {
      cargarEstadisticas(empresa.id);
    }
  }, [isOpen, empresa?.id]);

  const cargarEstadisticas = async (empresaId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/empresas/${empresaId}/estadisticas`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      
      const data = await response.json();
      setEstadisticas(data.estadisticas);
      setParticipantes(data.participantes);
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

  if (!empresa) return null;

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Estadísticas de Participación"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header con información básica */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BuildingIcon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <Typography variant="h3" weight="bold" className="mb-2">
              {empresa.nombre}
            </Typography>
            <div className="flex items-center space-x-4">
              <Badge variant={empresa.activo ? 'success' : 'warning'}>
                {empresa.activo ? 'Activa' : 'Inactiva'}
              </Badge>
              {empresa.estado_nombre && (
                <Badge variant={getEstadoColor(empresa.estado_nombre)}>
                  {empresa.estado_nombre}
                </Badge>
              )}
            </div>
          </div>
        </div>

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
              onClick={() => empresa.id && cargarEstadisticas(empresa.id)}
            >
              Reintentar
            </Button>
          </Card>
        )}

        {/* Estadísticas principales */}
        {estadisticas && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Participaciones"
                value={estadisticas.totalParticipaciones}
                subtitle="Sesiones completadas"
                icon={<TrendingUpIcon />}
                color="blue"
              />
              
              <MetricCard
                title="Participantes"
                value={estadisticas.totalParticipantes}
                subtitle="Personas involucradas"
                icon={<UsersIcon />}
                color="green"
              />
              
              <MetricCard
                title="Investigaciones"
                value={estadisticas.investigacionesParticipadas}
                subtitle="Proyectos participados"
                icon={<FileTextIcon />}
                color="purple"
              />
              
              <MetricCard
                title="Tiempo Total"
                value={formatearDuracion(estadisticas.duracionTotalSesiones)}
                subtitle="Horas de participación"
                icon={<ClockIcon />}
                color="yellow"
              />
            </div>

            {/* Última participación */}
            {estadisticas.fechaUltimaParticipacion && (
              <Card>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <div>
                    <Typography variant="body2" color="secondary">
                      Última Participación
                    </Typography>
                    <Typography variant="body1" weight="medium">
                      {formatearFecha(estadisticas.fechaUltimaParticipacion)}
                    </Typography>
                  </div>
                </div>
              </Card>
            )}

            {/* Investigaciones en las que ha participado */}
            {estadisticas.investigaciones.length > 0 && (
              <div>
                <Typography variant="h4" weight="semibold" className="mb-4">
                  Investigaciones Participadas
                </Typography>
                
                <div className="space-y-3">
                  {estadisticas.investigaciones.map((investigacion) => (
                    <Card key={investigacion.id} className="hover: transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Typography variant="body1" weight="semibold">
                              {investigacion.nombre}
                            </Typography>
                            <Badge variant={getEstadoColor(investigacion.estado)}>
                              {investigacion.estado}
                            </Badge>
                            <Chip variant={getRiesgoColor(investigacion.riesgo_automatico)} size="sm">
                              {investigacion.riesgo_automatico}
                            </Chip>
                          </div>
                          
                          {investigacion.descripcion && (
                            <Typography variant="body2" color="secondary" className="mb-2">
                              {investigacion.descripcion}
                            </Typography>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
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
            {participantes.length > 0 && (
              <div>
                <Typography variant="h4" weight="semibold" className="mb-4">
                  Participantes de la Empresa
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {participantes.map((participante) => (
                    <Card key={participante.id} className="hover: transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Typography variant="body1" weight="medium" className="mb-1">
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
                        
                        <Badge variant="default">
                          {participante.total_participaciones > 0 ? 'Activo' : 'Sin participación'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Gráfico de participaciones por mes */}
            {Object.keys(estadisticas.participacionesPorMes).length > 0 && (
              <div>
                <Typography variant="h4" weight="semibold" className="mb-4">
                  Participaciones por Mes
                </Typography>
                
                <Card>
                  <div className="space-y-2">
                    {Object.entries(estadisticas.participacionesPorMes)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 6)
                      .map(([mes, cantidad]) => (
                        <div key={mes} className="flex items-center justify-between">
                          <Typography variant="body2" color="secondary">
                            {new Date(mes + '-01').toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((cantidad / Math.max(...Object.values(estadisticas.participacionesPorMes))) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <Typography variant="body2" weight="medium">
                              {cantidad}
                            </Typography>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Información de contacto */}
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Información de Contacto
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <Typography variant="body2" color="secondary">
                    KAM Asignado
                  </Typography>
                  <Typography variant="body1" weight="medium">
                    {empresa.kam_nombre || 'Sin asignar'}
                  </Typography>
                  {empresa.kam_email && (
                    <Typography variant="body2" color="secondary">
                      {empresa.kam_email}
                    </Typography>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <Typography variant="body2" color="secondary">
                    País
                  </Typography>
                  <Typography variant="body1" weight="medium">
                    {empresa.pais_nombre || 'Sin especificar'}
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Información de registro */}
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Información de Registro
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <Typography variant="body2" color="secondary">
                    Fecha de Creación
                  </Typography>
                  <Typography variant="body1" weight="medium">
                    {formatearFecha(empresa.created_at)}
                  </Typography>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <Typography variant="body2" color="secondary">
                    Última Actualización
                  </Typography>
                  <Typography variant="body1" weight="medium">
                    {formatearFecha(empresa.updated_at)}
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SideModal>
  );
}
