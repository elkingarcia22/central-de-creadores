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
import SimpleAvatar from '../../../components/ui/SimpleAvatar';
import EmpresaSideModal from '../../../components/empresas/EmpresaSideModal';
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
  console.log('🔍 getEstadoColor llamado con:', estado);
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('activo') || estadoLower.includes('activa')) return 'success';
  if (estadoLower.includes('inactivo') || estadoLower.includes('inactiva')) return 'warning';
  if (estadoLower.includes('pendiente')) return 'warning';
  if (estadoLower.includes('completado') || estadoLower.includes('finalizado')) return 'success';
  if (estadoLower.includes('cancelado') || estadoLower.includes('cancelada')) return 'danger';
  console.log('🎨 Color asignado: default');
  return 'default';
};

  const getRiesgoColor = (riesgo: string): string => {
    const riesgoLower = riesgo.toLowerCase();
    if (riesgoLower.includes('alto') || riesgoLower.includes('high')) return 'danger';
    if (riesgoLower.includes('medio') || riesgoLower.includes('medium')) return 'warning';
    if (riesgoLower.includes('bajo') || riesgoLower.includes('low')) return 'success';
    return 'default';
  };

  const getRelacionColor = (relacion: string): string => {
    const relacionLower = relacion.toLowerCase();
    if (relacionLower.includes('excelente')) return 'success';
    if (relacionLower.includes('buena')) return 'success';
    if (relacionLower.includes('regular')) return 'warning';
    if (relacionLower.includes('mala') || relacionLower.includes('pobre')) return 'danger';
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
  productos_nombres?: string[];
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    estados: [],
    tamanos: [],
    paises: [],
    kams: [],
    relaciones: [],
    productos: []
  });

  useEffect(() => {
    if (empresa.id) {
      cargarEstadisticas(empresa.id);
    }
    cargarDatosModal();
  }, [empresa.id]);

  const cargarDatosModal = async () => {
    try {
      console.log('🔄 Cargando datos del modal...');
      
      // Cargar usuarios
      const usuariosRes = await fetch('/api/usuarios');
      console.log('📡 Response usuarios status:', usuariosRes.status);
      const usuariosData = usuariosRes.ok ? await usuariosRes.json() : [];
      console.log('👥 Usuarios cargados:', usuariosData);
      console.log('👥 Tipo de usuariosData:', typeof usuariosData);
      console.log('👥 Es array:', Array.isArray(usuariosData));
      
      // Extraer usuarios del objeto si es necesario
      let usuariosArray = [];
      if (Array.isArray(usuariosData)) {
        usuariosArray = usuariosData;
      } else if (usuariosData && usuariosData.usuarios && Array.isArray(usuariosData.usuarios)) {
        usuariosArray = usuariosData.usuarios;
      }
      console.log('👥 UsuariosArray final:', usuariosArray.length);
      
      // Cargar catálogos - usar APIs correctas
      const estadosRes = await fetch('/api/estados-empresa');
      const estados = estadosRes.ok ? await estadosRes.json() : [];
      console.log('🏷️ Estados cargados:', estados.length);
      
      const tamanosRes = await fetch('/api/tamanos-empresa');
      const tamanos = tamanosRes.ok ? await tamanosRes.json() : [];
      console.log('📏 Tamaños cargados:', tamanos.length);
      
      const paisesRes = await fetch('/api/paises');
      const paises = paisesRes.ok ? await paisesRes.json() : [];
      console.log('🌍 Países cargados:', paises.length);
      
      const relacionesRes = await fetch('/api/relaciones-empresa');
      const relaciones = relacionesRes.ok ? await relacionesRes.json() : [];
      console.log('🤝 Relaciones cargadas:', relaciones.length);
      
      const productosRes = await fetch('/api/productos');
      console.log('📡 Response productos status:', productosRes.status);
      const productos = productosRes.ok ? await productosRes.json() : [];
      console.log('📦 Productos cargados:', productos);
      console.log('📦 Productos length:', productos.length);

      const kamsMapped = usuariosArray.map((u: any) => ({ 
        value: u.id, 
        label: u.full_name || u.nombre || u.email || u.correo || 'Sin nombre' 
      }));
      console.log('👥 KAMs mapeados:', kamsMapped);

      const productosMapped = productos.map((p: any) => ({ 
        value: p.id, 
        label: p.nombre 
      }));
      console.log('📦 Productos mapeados:', productosMapped);

      // Cargar industrias y modalidades
      const industriasRes = await fetch('/api/industrias');
      const industrias = industriasRes.ok ? await industriasRes.json() : [];
      console.log('🏭 Industrias cargadas:', industrias.length);
      
      const modalidadesRes = await fetch('/api/modalidades');
      const modalidades = modalidadesRes.ok ? await modalidadesRes.json() : [];
      console.log('📋 Modalidades cargadas:', modalidades.length);

      const filterOptionsData = {
        estados: estados.map((e: any) => ({ value: e.id, label: e.nombre })),
        tamanos: tamanos.map((t: any) => ({ value: t.id, label: t.nombre })),
        paises: paises.map((p: any) => ({ value: p.id, label: p.nombre })),
        kams: kamsMapped,
        relaciones: relaciones.map((r: any) => ({ value: r.id, label: r.nombre })),
        productos: productosMapped,
        industrias: industrias.map((i: any) => ({ value: i.id, label: i.nombre })),
        modalidades: modalidades.map((m: any) => ({ value: m.id, label: m.nombre }))
      };

      console.log('📋 FilterOptions configuradas:', filterOptionsData);
      
      setUsuarios(usuariosArray);
      setFilterOptions(filterOptionsData);
      
      console.log('✅ Datos del modal cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos del modal:', error);
    }
  };

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

  const handleSaveEmpresa = async (empresaData: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/empresas?id=${empresaData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresaData),
      });

      if (response.ok) {
        const updatedEmpresa = await response.json();
        setEmpresaData(prev => ({ ...prev, ...updatedEmpresa }));
        setShowEditModal(false);
        showSuccess('Empresa actualizada', 'Los cambios se han guardado correctamente');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al actualizar la empresa');
      }
    } catch (error) {
      console.error('Error actualizando empresa:', error);
      showError('Error al actualizar la empresa');
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState('informacion');

  // Componente de contenido de información
  const InformacionContent = () => {
    console.log('🔍 InformacionContent - empresaData:', empresaData);
    console.log('🔍 InformacionContent - filterOptions:', filterOptions);
    console.log('🔍 InformacionContent - productos_ids:', empresaData.productos_ids);
    console.log('🔍 InformacionContent - tamano_nombre:', empresaData.tamano_nombre);
    console.log('🔍 InformacionContent - relacion_nombre:', empresaData.relacion_nombre);
    
    return (
    <div className="space-y-6">
      {/* Información básica */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BuildingIcon className="w-5 h-5 text-primary" />
          <Typography variant="h5">Información Básica</Typography>
        </div>
        <div className="space-y-3">
          <div>
            <Typography variant="caption" color="secondary">Nombre</Typography>
            <Typography variant="body2">{empresaData.nombre}</Typography>
          </div>
          {empresaData.descripcion && (
            <div>
              <Typography variant="caption" color="secondary">Descripción</Typography>
              <Typography variant="body2">{empresaData.descripcion}</Typography>
            </div>
          )}
        </div>
      </Card>

      {/* Información de contacto */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-primary" />
          <Typography variant="h5">Información de Contacto</Typography>
        </div>
        <div className="space-y-3">
          {empresaData.kam_nombre && (
            <div>
              <Typography variant="caption" color="secondary">KAM Asignado</Typography>
              <div className="flex items-center gap-2">
                <SimpleAvatar
                  src={empresaData.kam_foto_url}
                  alt={empresaData.kam_nombre}
                  size="sm"
                />
                <Typography variant="body2">{empresaData.kam_nombre}</Typography>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Ubicación y Clasificación */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-primary" />
          <Typography variant="h5">Ubicación y Clasificación</Typography>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {empresaData.pais_nombre && (
            <div>
              <Typography variant="caption" color="secondary">País</Typography>
              <Typography variant="body2">{empresaData.pais_nombre}</Typography>
            </div>
          )}
          {empresaData.tamano_nombre && (
            <div>
              <Typography variant="caption" color="secondary">Tamaño</Typography>
              <Chip variant="default">
                {empresaData.tamano_nombre}
              </Chip>
            </div>
          )}
          {empresaData.relacion_nombre && (
            <div>
              <Typography variant="caption" color="secondary">Relación</Typography>
              <Chip variant={getRelacionColor(empresaData.relacion_nombre)}>
                {empresaData.relacion_nombre}
              </Chip>
            </div>
          )}
          {empresaData.productos_ids && empresaData.productos_ids.length > 0 && (
            <div>
              <Typography variant="caption" color="secondary">Productos</Typography>
              <div className="flex flex-wrap gap-2 mt-1">
                {empresaData.productos_ids.map((productoId: string, index: number) => {
                  const productoNombre = empresaData.productos_nombres?.[index];
                  return (
                    <Chip key={productoId} variant="outline" size="sm">
                      {productoNombre || `Producto ID: ${productoId}`}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}
          {empresaData.producto_id && !empresaData.productos_ids && (
            <div>
              <Typography variant="caption" color="secondary">Producto</Typography>
              <Chip variant="outline">
                {empresaData.producto_nombre || 'Producto asignado'}
              </Chip>
            </div>
          )}
          {empresaData.industria_nombre && (
            <div>
              <Typography variant="caption" color="secondary">Industria</Typography>
              <Typography variant="body2">{empresaData.industria_nombre}</Typography>
            </div>
          )}
          {empresaData.modalidad_nombre && (
            <div>
              <Typography variant="caption" color="secondary">Modalidad</Typography>
              <Typography variant="body2">{empresaData.modalidad_nombre}</Typography>
            </div>
          )}
        </div>
      </Card>


    </div>
  );
  };

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
                variant="ghost"
                onClick={() => router.push('/empresas')}
                className="p-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-4">
                <Typography variant="h3">{empresaData.nombre}</Typography>
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
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
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

      {/* Modal de edición */}
      {showEditModal && (
        <>
          {console.log('🔍 Modal abierto, empresaData:', empresaData)}
          {console.log('🔍 Modal abierto, usuarios:', usuarios.length)}
          {console.log('🔍 Modal abierto, filterOptions:', filterOptions)}
        </>
      )}
      <EmpresaSideModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEmpresa}
        empresa={empresaData}
        usuarios={usuarios}
        filterOptions={filterOptions}
        loading={saving}
      />
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
    // Importar directamente la función de la API
    const { supabaseServer } = await import('../../../api/supabase');
    
    console.log(`🔍 SSR - Obteniendo empresa: ${id}`);

    // Obtener información básica de la empresa
    const { data: empresa, error: errorEmpresa } = await supabaseServer
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (errorEmpresa || !empresa) {
      console.error('❌ SSR - Error obteniendo empresa:', errorEmpresa);
      return {
        notFound: true
      };
    }

    console.log('🏢 SSR - Empresa obtenida:', empresa);

    // Obtener datos relacionados por separado
    let kamData = null;
    let paisData = null;
    let estadoData = null;
    let tamanoData = null;
    let relacionData = null;
    let modalidadData = null;
    let industriaData = null;
    let productoData = null;

    if (empresa.kam_id) {
      const { data: kam } = await supabaseServer
        .from('usuarios')
        .select('id, nombre, correo')
        .eq('id', empresa.kam_id)
        .single();
      kamData = kam;
    }

    if (empresa.pais) {
      const { data: pais } = await supabaseServer
        .from('paises')
        .select('id, nombre')
        .eq('id', empresa.pais)
        .single();
      paisData = pais;
    }

    if (empresa.estado) {
      const { data: estado } = await supabaseServer
        .from('estados')
        .select('id, nombre')
        .eq('id', empresa.estado)
        .single();
      estadoData = estado;
    }

    if (empresa['tamaño']) {
      console.log('📏 SSR - Buscando tamaño con ID:', empresa['tamaño']);
      const { data: tamano } = await supabaseServer
        .from('tamanos')
        .select('id, nombre')
        .eq('id', empresa['tamaño'])
        .single();
      tamanoData = tamano;
      console.log('📏 SSR - Tamaño encontrado:', tamanoData);
    }

    if (empresa.relacion) {
      console.log('🤝 SSR - Buscando relación con ID:', empresa.relacion);
      const { data: relacion } = await supabaseServer
        .from('relaciones')
        .select('id, nombre')
        .eq('id', empresa.relacion)
        .single();
      relacionData = relacion;
      console.log('🤝 SSR - Relación encontrada:', relacionData);
    }

    if (empresa.modalidad) {
      const { data: modalidad } = await supabaseServer
        .from('modalidades')
        .select('id, nombre')
        .eq('id', empresa.modalidad)
        .single();
      modalidadData = modalidad;
    }

    if (empresa.industria) {
      console.log('🏭 SSR - Buscando industria con ID:', empresa.industria);
      const { data: industria } = await supabaseServer
        .from('industrias')
        .select('id, nombre')
        .eq('id', empresa.industria)
        .single();
      industriaData = industria;
      console.log('🏭 SSR - Industria encontrada:', industriaData);
    }

    if (empresa.producto_id) {
      const { data: producto } = await supabaseServer
        .from('productos')
        .select('id, nombre')
        .eq('id', empresa.producto_id)
        .single();
      productoData = producto;
    }

    // Obtener productos relacionados desde la tabla de relación
    let productosRelacionados = [];
    if (empresa.id) {
      const { data: productosEmpresa } = await supabaseServer
        .from('empresa_productos')
        .select('producto_id')
        .eq('empresa_id', empresa.id);
      
      if (productosEmpresa && productosEmpresa.length > 0) {
        const productoIds = productosEmpresa.map(p => p.producto_id);
        const { data: productos } = await supabaseServer
          .from('productos')
          .select('id, nombre')
          .in('id', productoIds);
        productosRelacionados = productos || [];
      }
    }

    // Formatear respuesta
    const empresaFormateada = {
      id: empresa.id,
      nombre: empresa.nombre,
      descripcion: empresa.descripcion || null,
      kam_id: empresa.kam_id || null,
      kam_nombre: kamData?.nombre || null,
      kam_email: kamData?.correo || null,
      pais_id: empresa.pais || null,
      pais_nombre: paisData?.nombre || null,
      estado_id: empresa.estado || null,
      estado_nombre: estadoData?.nombre || null,
      tamano_id: empresa['tamaño'] || null,
      tamano_nombre: tamanoData?.nombre || null,
      relacion_id: empresa.relacion || null,
      relacion_nombre: relacionData?.nombre || null,
      modalidad_id: empresa.modalidad || null,
      modalidad_nombre: modalidadData?.nombre || null,
      industria_id: empresa.industria || null,
      industria_nombre: industriaData?.nombre || null,
      producto_id: empresa.producto_id || null,
      producto_nombre: productoData?.nombre || null,
      productos_ids: productosRelacionados.map(p => p.id),
      productos_nombres: productosRelacionados.map(p => p.nombre),
      activo: empresa.activo ?? true,
      created_at: empresa.created_at || null,
      updated_at: empresa.updated_at || null
    };

    console.log(`✅ SSR - Empresa formateada: ${empresaFormateada.nombre}`);
    console.log('📊 SSR - Campos relacionados:', {
      tamano_nombre: empresaFormateada.tamano_nombre,
      relacion_nombre: empresaFormateada.relacion_nombre,
      industria_nombre: empresaFormateada.industria_nombre,
      modalidad_nombre: empresaFormateada.modalidad_nombre,
      productos_ids: empresaFormateada.productos_ids
    });

    return {
      props: {
        empresa: empresaFormateada
      }
    };
  } catch (error) {
    console.error('❌ SSR - Error en getServerSideProps:', error);
    return {
      notFound: true
    };
  }
};
