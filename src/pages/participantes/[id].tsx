import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Layout, PageHeader, InfoContainer, InfoItem } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import DataTable from '../../components/ui/DataTable';
import { SideModal, Input, Textarea, Select } from '../../components/ui';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon as ClockIconSolid } from '../../components/icons';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant } from '../../utils/estadoUtils';
import { getChipVariant } from '../../utils/chipUtils';

interface Participante {
  id: string;
  nombre: string;
  email: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  estado_participante: string;
  fecha_ultima_participacion: string;
  total_participaciones: number;
  comentarios?: string;
  doleres_necesidades?: string;
  created_at: string;
  updated_at: string;
}

interface InvestigacionParticipante {
  id: string;
  nombre: string;
  fecha_participacion: string;
  estado: string;
  tipo_investigacion: string;
  responsable: string;
}

interface DolorParticipante {
  id: string;
  descripcion: string;
  sesion_relacionada?: string;
  fecha_creacion: string;
  creado_por: string;
}

interface ComentarioParticipante {
  id: string;
  contenido: string;
  sesion_relacionada?: string;
  fecha_creacion: string;
  creado_por: string;
}

export default function DetalleParticipante() {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showError } = useToast();

  const [participante, setParticipante] = useState<Participante | null>(null);
  const [investigaciones, setInvestigaciones] = useState<InvestigacionParticipante[]>([]);
  const [dolores, setDolores] = useState<DolorParticipante[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioParticipante[]>([]);
  const [participacionesPorMes, setParticipacionesPorMes] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');
  
  // Estados para modales
  const [showCrearDolorModal, setShowCrearDolorModal] = useState(false);
  const [showCrearComentarioModal, setShowCrearComentarioModal] = useState(false);

  useEffect(() => {
    if (id) {
      cargarParticipante();
      cargarInvestigaciones();
      cargarDolores();
      cargarComentarios();
    }
  }, [id]);

  // Manejar el tab desde la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['informacion', 'historial', 'dolores', 'comentarios'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  const cargarParticipante = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/participantes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setParticipante(data);
      } else {
        showError('Error al cargar el participante');
        router.push('/participantes');
      }
    } catch (error) {
      console.error('Error cargando participante:', error);
      showError('Error al cargar el participante');
      router.push('/participantes');
    } finally {
      setLoading(false);
    }
  };

  const cargarInvestigaciones = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/investigaciones`);
      
      if (response.ok) {
        const data = await response.json();
        setInvestigaciones(data.investigaciones || []);
        setParticipacionesPorMes(data.participacionesPorMes || {});
        console.log('🔍 Investigaciones cargadas:', data.investigaciones?.length || 0);
        console.log('🔍 Participaciones por mes:', data.participacionesPorMes);
        console.log('🔍 Debug - Participaciones por mes detallado:', Object.entries(data.participacionesPorMes || {}).map(([mes, cantidad]) => ({
          mes,
          cantidad,
          fecha: new Date(mes + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
        })));
      } else {
        console.error('Error cargando investigaciones:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const cargarDolores = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores`);
      if (response.ok) {
        const data = await response.json();
        setDolores(data.dolores || []);
      }
    } catch (error) {
      console.error('Error cargando dolores:', error);
    }
  };

  const cargarComentarios = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/comentarios`);
      if (response.ok) {
        const data = await response.json();
        setComentarios(data.comentarios || []);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'externo': return 'Cliente Externo';
      case 'interno': return 'Cliente Interno';
      case 'friend_family': return 'Friend and Family';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'externo': return <BuildingIcon className="w-5 h-5" />;
      case 'interno': return <UsersIcon className="w-5 h-5" />;
      case 'friend_family': return <UserIcon className="w-5 h-5" />;
      default: return <UserIcon className="w-5 h-5" />;
    }
  };

  const getEstadoVariant = (estado: string) => {
    return getEstadoParticipanteVariant(estado);
  };

  const getEstadoChipVariant = (estado: string) => {
    console.log('🔍 DEBUG - Estado para chip:', estado);
    const variant = getChipVariant(estado);
    console.log('🔍 DEBUG - Variant resultante:', variant);
    return variant;
  };

  // Componente de contenido de información
  const InformacionContent = () => (
    <div className="space-y-6">
      {/* Información básica */}
      <InfoContainer 
        title="Información Básica"
        icon={<UserIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Nombre" 
          value={participante.nombre}
        />
        <InfoItem 
          label="Email" 
          value={participante.email || 'No especificado'}
        />
        <InfoItem 
          label="Estado" 
          value={
            <Chip 
              variant={getEstadoChipVariant(participante.estado_participante || '') as any}
              size="sm"
            >
              {participante.estado_participante || 'Sin estado'}
            </Chip>
          }
        />
        <InfoItem 
          label="Tipo" 
          value={
            <Chip 
              variant={getChipVariant(participante.tipo || '') as any}
              size="sm"
            >
              {getTipoLabel(participante.tipo)}
            </Chip>
          }
        />
        {participante.rol_empresa && (
          <InfoItem 
            label="Rol en la Empresa" 
            value={participante.rol_empresa}
          />
        )}
      </InfoContainer>

      {/* Información organizacional */}
      <InfoContainer 
        title={participante.tipo === 'externo' ? 'Información de Empresa' : 'Información Organizacional'}
        icon={<BuildingIcon className="w-4 h-4" />}
      >
        {participante.tipo === 'externo' && participante.empresa_nombre && (
          <InfoItem 
            label="Empresa" 
            value={participante.empresa_nombre}
          />
        )}
        {(participante.tipo === 'interno' || participante.tipo === 'friend_family') && participante.departamento_nombre && (
          <InfoItem 
            label="Departamento" 
            value={participante.departamento_nombre}
          />
        )}
      </InfoContainer>



      {/* Información del sistema */}
      <InfoContainer 
        title="Información del Sistema"
        icon={<CalendarIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Fecha de Registro" 
          value={formatearFecha(participante.created_at)}
        />
        <InfoItem 
          label="Última Actualización" 
          value={formatearFecha(participante.updated_at)}
        />
      </InfoContainer>
    </div>
  );

  // Componente de contenido de estadísticas
  const EstadisticasContent = () => {
    // Calcular estadísticas básicas
    const totalInvestigaciones = investigaciones.length;
    
    // Debug: Ver qué estados están llegando
    console.log('🔍 Estados de agendamiento encontrados:', investigaciones.map(inv => inv.estado_agendamiento));
    
    // Filtrar por estado_agendamiento usando nombres exactos
    const investigacionesFinalizadas = investigaciones.filter(inv => 
      inv.estado_agendamiento === 'Finalizado'
    ).length;
    
    const investigacionesEnProgreso = investigaciones.filter(inv => 
      inv.estado_agendamiento === 'En progreso'
    ).length;
    
    const investigacionesPendientes = investigaciones.filter(inv => 
      inv.estado_agendamiento === 'Pendiente'
    ).length;
    
    // Calcular tiempo total de participación usando duracion_sesion
    const tiempoTotalHoras = Math.round(
      investigaciones.reduce((total, inv) => total + (inv.duracion_sesion || 60), 0) / 60
    );
    
    return (
      <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Participaciones */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={totalInvestigaciones}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Participaciones
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <TrendingUpIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Investigaciones Finalizadas */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={investigacionesFinalizadas}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Finalizadas
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Investigaciones En Progreso */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={investigacionesEnProgreso}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  En Progreso
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Tiempo Total Estimado */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter 
                    value={tiempoTotalHoras} 
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                    suffix="h"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Tiempo Total
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <ClockIconSolid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Investigaciones Pendientes */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter
                    value={investigacionesPendientes}
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Pendientes
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Información adicional */}
        <InfoContainer 
          title="Resumen de Participación"
          icon={<UserIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Última Participación" 
            value={
              (() => {
                if (investigaciones.length > 0) {
                  // Ordenar por fecha de participación y tomar la más reciente
                  const investigacionesOrdenadas = investigaciones.sort((a, b) => 
                    new Date(b.fecha_participacion).getTime() - new Date(a.fecha_participacion).getTime()
                  );
                  return formatearFecha(investigacionesOrdenadas[0].fecha_participacion);
                }
                return participante.fecha_ultima_participacion ? 
                  formatearFecha(participante.fecha_ultima_participacion) : 
                  'Sin participaciones';
              })()
            }
          />
          <InfoItem 
            label="Participaciones del Mes" 
            value={
              (() => {
                const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                const participacionesMesActual = participacionesPorMes[mesActual] || 0;
                const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                return `${participacionesMesActual} en ${nombreMes}`;
              })()
            }
          />

        </InfoContainer>

        {/* Participaciones por mes */}
        {Object.keys(participacionesPorMes).length > 0 && (
          <InfoContainer 
            title="Participaciones por Mes (Finalizadas)"
            icon={<TrendingUpIcon className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {Object.entries(participacionesPorMes)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([mes, cantidad]) => {
                  const fecha = new Date(mes + '-01');
                  const esMesActual = fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear();
                  const maxCantidad = Math.max(...Object.values(participacionesPorMes));
                  
                  return (
                    <div key={mes} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      esMesActual 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Typography variant="body2" color="secondary">
                          {fecha.toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </Typography>
                        {esMesActual && (
                          <Chip variant="primary" size="sm">
                            Actual
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              esMesActual ? 'bg-blue-500' : 'bg-primary'
                            }`}
                            style={{ 
                              width: `${Math.min((cantidad / maxCantidad) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <Typography variant="body2" weight="medium" className="w-12 text-right">
                          {cantidad}
                        </Typography>
                      </div>
                    </div>
                  );
                })}
            </div>
          </InfoContainer>
        )}

        {/* Estado vacío si no hay estadísticas */}
        {totalInvestigaciones === 0 && (
          <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/20">
            <div className="text-center py-12">
              <BarChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <Typography variant="h5" color="secondary" className="mb-2">
                Sin estadísticas disponibles
              </Typography>
              <Typography variant="body2" color="secondary">
                Este participante aún no ha participado en investigaciones.
              </Typography>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const columnsInvestigaciones = [
    {
      key: 'nombre',
      label: 'Investigación',
      render: (row: InvestigacionParticipante) => (
        <div>
          <Typography variant="subtitle2" weight="medium">
            {row.nombre}
          </Typography>
          <Typography variant="caption" color="secondary">
            {row.tipo_investigacion}
          </Typography>
        </div>
      )
    },
    {
      key: 'fecha_participacion',
      label: 'Fecha de Participación',
      render: (row: InvestigacionParticipante) => (
        <Typography variant="body2">
          {formatearFecha(row.fecha_participacion)}
        </Typography>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: InvestigacionParticipante) => (
        <Badge variant={getEstadoVariant(row.estado)}>
          {row.estado}
        </Badge>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (row: InvestigacionParticipante) => (
        <Typography variant="body2">
          {row.responsable}
        </Typography>
      )
    }
  ];

  const columnsDolores = [
    {
      key: 'descripcion',
      label: 'Descripción del Dolor',
      render: (row: DolorParticipante) => (
        <Typography variant="body2">
          {row.descripcion}
        </Typography>
      )
    },
    {
      key: 'sesion_relacionada',
      label: 'Sesión Relacionada',
      render: (row: DolorParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.sesion_relacionada || 'General'}
        </Typography>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha de Creación',
      render: (row: DolorParticipante) => (
        <Typography variant="caption">
          {formatearFecha(row.fecha_creacion)}
        </Typography>
      )
    },
    {
      key: 'creado_por',
      label: 'Creado por',
      render: (row: DolorParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.creado_por}
        </Typography>
      )
    }
  ];

  const columnsComentarios = [
    {
      key: 'contenido',
      label: 'Comentario',
      render: (row: ComentarioParticipante) => (
        <Typography variant="body2">
          {row.contenido}
        </Typography>
      )
    },
    {
      key: 'sesion_relacionada',
      label: 'Sesión Relacionada',
      render: (row: ComentarioParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.sesion_relacionada || 'General'}
        </Typography>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha de Creación',
      render: (row: ComentarioParticipante) => (
        <Typography variant="caption">
          {formatearFecha(row.fecha_creacion)}
        </Typography>
      )
    },
    {
      key: 'creado_por',
      label: 'Creado por',
      render: (row: ComentarioParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.creado_por}
        </Typography>
      )
    }
  ];

  if (loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!participante) {
    return null;
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/participantes')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title={participante.nombre}
              variant="compact"
              color="purple"
              className="mb-0"
              chip={{
                label: participante.estado_participante || 'Sin estado',
                variant: getEstadoChipVariant(participante.estado_participante || 'default'),
                size: 'sm'
              }}
            />
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => {
                setParticipanteParaEditar(participante);
                setShowModalEditar(true);
              }}
            >
              <EditIcon className="w-4 h-4" />
              Editar Participante
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
              {
                id: 'informacion',
                label: 'Información',
                content: <InformacionContent />
              },
              {
                id: 'estadisticas',
                label: 'Estadísticas',
                content: <EstadisticasContent />
              },
              {
                id: 'historial',
                label: 'Historial de Investigaciones',
                content: (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <UserIcon className="w-5 h-5 text-primary" />
                      <Typography variant="h4">Historial de Participación</Typography>
                    </div>
                    
                    {investigaciones.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <Typography variant="body2" color="secondary">
                            {investigaciones.length} participación{investigaciones.length !== 1 ? 'es' : ''} registrada{investigaciones.length !== 1 ? 's' : ''}
                          </Typography>
                        </div>
                        <DataTable
                          data={investigaciones}
                          columns={columnsInvestigaciones}
                          loading={false}
                          searchable={false}
                          filterable={false}
                          selectable={false}
                          emptyMessage="No se encontraron investigaciones"
                          rowKey="id"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h5" color="secondary" className="mb-2">
                          Sin participaciones
                        </Typography>
                        <Typography variant="body2" color="secondary">
                          Este participante aún no ha participado en ninguna investigación.
                        </Typography>
                      </div>
                    )}
                  </Card>
                )
              },
              {
                id: 'dolores',
                label: 'Dolores',
                content: (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h4">Dolores y Necesidades</Typography>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setShowCrearDolorModal(true)}
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Registrar Dolor
                      </Button>
                    </div>
                    
                    {dolores.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <Typography variant="body2" color="secondary">
                            {dolores.length} dolor{dolores.length !== 1 ? 'es' : ''} registrado{dolores.length !== 1 ? 's' : ''}
                          </Typography>
                        </div>
                        <DataTable
                          data={dolores}
                          columns={columnsDolores}
                          loading={false}
                          searchable={false}
                          filterable={false}
                          selectable={false}
                          emptyMessage="No se encontraron dolores registrados"
                          rowKey="id"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h5" color="secondary" className="mb-2">
                          Sin dolores registrados
                        </Typography>
                        <Typography variant="body2" color="secondary" className="mb-4">
                          Este participante no tiene dolores o necesidades registradas.
                        </Typography>
                        <Button
                          variant="primary"
                          onClick={() => setShowCrearDolorModal(true)}
                          className="flex items-center gap-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Registrar Primer Dolor
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              },
              {
                id: 'comentarios',
                label: 'Comentarios',
                content: (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <MessageIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h4">Comentarios</Typography>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setShowCrearComentarioModal(true)}
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Nuevo Comentario
                      </Button>
                    </div>
                    
                    {comentarios.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <Typography variant="body2" color="secondary">
                            {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''} registrado{comentarios.length !== 1 ? 's' : ''}
                          </Typography>
                        </div>
                        <DataTable
                          data={comentarios}
                          columns={columnsComentarios}
                          loading={false}
                          searchable={false}
                          filterable={false}
                          selectable={false}
                          emptyMessage="No se encontraron comentarios"
                          rowKey="id"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <MessageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h5" color="secondary" className="mb-2">
                          Sin comentarios
                        </Typography>
                        <Typography variant="body2" color="secondary" className="mb-4">
                          Este participante no tiene comentarios registrados.
                        </Typography>
                        <Button
                          variant="primary"
                          onClick={() => setShowCrearComentarioModal(true)}
                          className="flex items-center gap-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Crear Primer Comentario
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            fullWidth={true}
          />
      </div>
      
      {/* Modal para crear dolores */}
      <CrearDolorModal
        isOpen={showCrearDolorModal}
        onClose={() => setShowCrearDolorModal(false)}
        onSuccess={() => {
          cargarDolores();
          setShowCrearDolorModal(false);
        }}
        participanteId={id as string}
      />
      
      {/* Modal para crear comentarios */}
      <CrearComentarioModal
        isOpen={showCrearComentarioModal}
        onClose={() => setShowCrearComentarioModal(false)}
        onSuccess={() => {
          cargarComentarios();
          setShowCrearComentarioModal(false);
        }}
        participanteId={id as string}
      />
    </Layout>
  );
}

// Componente para crear dolores
function CrearDolorModal({ isOpen, onClose, onSuccess, participanteId }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  participanteId: string;
}) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    sesion_relacionada: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion.trim()) {
      showError('La descripción del dolor es obligatoria');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/participantes/${participanteId}/dolores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Dolor registrado exitosamente');
        setFormData({ descripcion: '', sesion_relacionada: '' });
        onSuccess();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al registrar dolor');
      }
    } catch (error) {
      console.error('Error registrando dolor:', error);
      showError('Error al registrar dolor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Dolor o Necesidad"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Descripción del Dolor/Necesidad *
          </Typography>
          <Textarea
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe el dolor o necesidad identificada..."
            rows={4}
            disabled={loading}
            fullWidth
          />
        </div>

        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Sesión Relacionada (Opcional)
          </Typography>
          <Input
            value={formData.sesion_relacionada}
            onChange={(e) => setFormData(prev => ({ ...prev, sesion_relacionada: e.target.value }))}
            placeholder="Ej: Sesión de Usabilidad 1, Entrevista inicial..."
            disabled={loading}
            fullWidth
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Registrando...' : 'Registrar Dolor'}
          </Button>
        </div>
      </form>
    </SideModal>
  );
}

// Componente para crear comentarios
function CrearComentarioModal({ isOpen, onClose, onSuccess, participanteId }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  participanteId: string;
}) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contenido: '',
    sesion_relacionada: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contenido.trim()) {
      showError('El contenido del comentario es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/participantes/${participanteId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Comentario creado exitosamente');
        setFormData({ contenido: '', sesion_relacionada: '' });
        onSuccess();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear comentario');
      }
    } catch (error) {
      console.error('Error creando comentario:', error);
      showError('Error al crear comentario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Comentario"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Contenido del Comentario *
          </Typography>
          <Textarea
            value={formData.contenido}
            onChange={(e) => setFormData(prev => ({ ...prev, contenido: e.target.value }))}
            placeholder="Escribe tu comentario aquí..."
            rows={4}
            disabled={loading}
            fullWidth
          />
        </div>

        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Sesión Relacionada (Opcional)
          </Typography>
          <Input
            value={formData.sesion_relacionada}
            onChange={(e) => setFormData(prev => ({ ...prev, sesion_relacionada: e.target.value }))}
            placeholder="Ej: Sesión de Usabilidad 1, Entrevista inicial..."
            disabled={loading}
            fullWidth
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creando...' : 'Crear Comentario'}
          </Button>
        </div>
      </form>
    </SideModal>
  );
}
