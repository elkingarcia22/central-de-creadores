import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, SideModal, Input, Textarea, Select, ConfirmModal, EmptyState, InfoContainer, InfoItem } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon, AIIcon, MicIcon } from '../../components/icons';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText, getChipText } from '../../utils/chipUtils';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import FilterDrawer from '../../components/ui/FilterDrawer';
import type { FilterValuesDolores } from '../../components/ui/FilterDrawer';

interface Participante {
  id: string;
  nombre: string;
  email: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

interface Reclutamiento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  meet_link?: string;
  estado: string;
  participante?: Participante;
  reclutador?: {
    id: string;
    nombre: string;
    email: string;
  };
}

interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  tamano?: string;
  modalidad?: string;
  relacion?: string;
  creado_el: string;
  actualizado_el: string;
}

interface DolorParticipante {
  id: string;
  participante_id: string;
  titulo: string;
  descripcion: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activo' | 'resuelto' | 'archivado';
  categoria: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  creado_por: string;
  actualizado_por: string;
}

interface Usuario {
  id: string;
  nombre: string;
  full_name: string;
  email: string;
  foto_url?: string;
  activo: boolean;
}

export default function SesionActivaPage() {
  const router = useRouter();
  const { id } = router.query;
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [reclutamiento, setReclutamiento] = useState<Reclutamiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');
  
  // Estados para los nuevos tabs
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [dolores, setDolores] = useState<DolorParticipante[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [participacionesPorMes, setParticipacionesPorMes] = useState<{ [key: string]: number }>({});
  
  // Estados para filtros de dolores
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValuesDolores>({
    busqueda: '',
    severidad: 'todos',
    estado: 'todos',
    categoria: 'todos',
    fecha_creacion_desde: '',
    fecha_creacion_hasta: ''
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Cargar datos del participante y reclutamiento
  useEffect(() => {
    if (id) {
      loadParticipantData();
    }
  }, [id]);

  const loadParticipantData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del participante
      const participanteResponse = await fetch(`/api/participantes/${id}`);
      if (participanteResponse.ok) {
        const participanteData = await participanteResponse.json();
        setParticipante(participanteData);
      }

      // Cargar datos del reclutamiento actual
      const reclutamientoResponse = await fetch(`/api/participantes/${id}/reclutamiento-actual`);
      if (reclutamientoResponse.ok) {
        const reclutamientoData = await reclutamientoResponse.json();
        setReclutamiento(reclutamientoData);
      }

      // Cargar datos adicionales para los nuevos tabs
      await Promise.all([
        loadEmpresaData(),
        loadDoloresData(),
        loadUsuariosData(),
        loadInvestigacionesData()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresaData = async () => {
    try {
      if (participante?.empresa_nombre) {
        const response = await fetch(`/api/empresas/buscar?nombre=${encodeURIComponent(participante.empresa_nombre)}`);
      if (response.ok) {
        const data = await response.json();
          setEmpresa(data);
        }
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
    }
  };

  const loadDoloresData = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores`);
      if (response.ok) {
        const data = await response.json();
        setDolores(data || []);
      }
    } catch (error) {
      console.error('Error cargando dolores:', error);
    }
  };

  const loadUsuariosData = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadInvestigacionesData = async () => {
    try {
      console.log('🔍 Cargando investigaciones para participante:', id);
      const response = await fetch(`/api/participantes/${id}/investigaciones`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Datos de investigaciones recibidos:', data);
        const investigacionesArray = Array.isArray(data) ? data : [];
        console.log('🔍 Array de investigaciones:', investigacionesArray);
        setInvestigaciones(investigacionesArray);
        
        // Calcular participaciones por mes
        const participacionesPorMes: { [key: string]: number } = {};
        investigacionesArray.forEach((inv: any) => {
          if (inv.fecha_sesion || inv.fecha_participacion) {
            const fecha = new Date(inv.fecha_sesion || inv.fecha_participacion);
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            participacionesPorMes[mes] = (participacionesPorMes[mes] || 0) + 1;
          }
        });
        console.log('🔍 Participaciones por mes:', participacionesPorMes);
        setParticipacionesPorMes(participacionesPorMes);
      } else {
        console.error('🔍 Error en respuesta de investigaciones:', response.status);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const handleBackToSessions = () => {
    router.push('/sesiones');
  };

  const handleSaveAndViewSession = async () => {
    try {
      // Redirigir a la vista de la sesión
      if (participante?.id) {
        router.push(`/participacion/${participante.id}`);
      } else {
        alert('❌ No se pudo obtener el ID del participante');
      }
      
    } catch (error) {
      console.error('❌ Error redirigiendo:', error);
      alert('❌ Error al redirigir. Intenta nuevamente.');
    }
  };

  // Funciones para dolores
  const handleVerDolor = (dolor: DolorParticipante) => {
    console.log('Ver dolor:', dolor);
  };

  const handleEditarDolor = (dolor: DolorParticipante) => {
    console.log('Editar dolor:', dolor);
  };

  const handleEliminarDolor = (dolor: DolorParticipante) => {
    console.log('Eliminar dolor:', dolor);
  };

  const handleCambiarEstadoDolor = async (dolor: DolorParticipante, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores/${dolor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dolor, estado: nuevoEstado }),
      });

      if (response.ok) {
        // Recargar dolores
        await loadDoloresData();
      }
      } catch (error) {
      console.error('Error cambiando estado del dolor:', error);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.severidad && filters.severidad !== 'todos') count++;
    if (filters.estado && filters.estado !== 'todos') count++;
    if (filters.categoria && filters.categoria !== 'todos') count++;
    if (filters.fecha_creacion_desde) count++;
    if (filters.fecha_creacion_hasta) count++;
    return count;
  };

  // Función para obtener el estado del chip
  const getEstadoChipVariant = (estado: string) => {
    if (!estado) return 'default';
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('activo') || estadoLower.includes('activa')) return 'success';
    if (estadoLower.includes('pendiente')) return 'warning';
    if (estadoLower.includes('completado') || estadoLower.includes('finalizada')) return 'success';
    if (estadoLower.includes('cancelado') || estadoLower.includes('cancelada')) return 'destructive';
    if (estadoLower.includes('pausado') || estadoLower.includes('pausada')) return 'secondary';
    return 'default';
  };

  // Columnas para la tabla de dolores
  const columnsDolores = [
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <div className="font-medium text-gray-900">{dolor?.titulo || 'Sin título'}</div>
      )
    },
    {
      key: 'categoria',
      label: 'Categoría',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <Chip variant="secondary" size="sm">{dolor?.categoria || 'Sin categoría'}</Chip>
      )
    },
    {
      key: 'severidad',
      label: 'Severidad',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <Chip variant={getSeveridadVariant(dolor?.severidad || 'baja')} size="sm">
          {dolor?.severidad || 'Sin severidad'}
        </Chip>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <Chip variant={getEstadoDolorVariant(dolor?.estado || 'activo')} size="sm">
          {getEstadoDolorText(dolor?.estado || 'activo')}
        </Chip>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <div className="text-sm text-gray-600">
          {dolor?.fecha_creacion ? formatearFecha(dolor.fecha_creacion) : 'Sin fecha'}
        </div>
      )
    }
  ];

  // Opciones de filtros para dolores
  const filterOptions = {
    estados: [
      { value: 'todos', label: 'Todos los estados' },
      { value: 'activo', label: 'Activo' },
      { value: 'resuelto', label: 'Resuelto' },
      { value: 'archivado', label: 'Archivado' }
    ],
    severidades: [
      { value: 'todos', label: 'Todas las severidades' },
      { value: 'baja', label: 'Baja' },
      { value: 'media', label: 'Media' },
      { value: 'alta', label: 'Alta' },
      { value: 'critica', label: 'Crítica' }
    ],
    categorias: [
      { value: 'todos', label: 'Todas las categorías' },
      { value: 'funcional', label: 'Funcional' },
      { value: 'usabilidad', label: 'Usabilidad' },
      { value: 'rendimiento', label: 'Rendimiento' },
      { value: 'seguridad', label: 'Seguridad' }
    ]
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography variant="body1" className="text-gray-600">
              Cargando sesión...
            </Typography>
          </div>
        </div>
      </Layout>
    );
  }

  if (!participante || !reclutamiento) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-900 mb-2">
              Sesión no encontrada
                  </Typography>
            <Typography variant="body1" className="text-gray-600 mb-4">
              No se pudo cargar la información de la sesión
                  </Typography>
            <Button onClick={handleBackToSessions} variant="secondary">
              Volver a Sesiones
                    </Button>
                  </div>
                </div>
      </Layout>
    );
  }

  // Componente para el contenido del tab de Información
  const InformacionContent: React.FC<{ 
    participante: Participante; 
    empresa?: Empresa;
    investigaciones: any[];
    participacionesPorMes: { [key: string]: number };
  }> = ({ participante, empresa, investigaciones, participacionesPorMes }) => {
    const totalInvestigaciones = investigaciones.length;
    const investigacionesFinalizadas = investigaciones.filter(inv => 
      inv.estado === 'finalizada' || inv.estado === 'completada'
    ).length;
    const investigacionesEnProgreso = investigaciones.filter(inv => 
      inv.estado === 'en_progreso' || inv.estado === 'activa'
    ).length;
    
    const tiempoTotalHoras = investigaciones.reduce((total, inv) => {
      if (inv.duracion_sesion) {
        const duracion = parseInt(inv.duracion_sesion);
        return total + (isNaN(duracion) ? 0 : duracion);
      }
      return total;
    }, 0) / 60; // Convertir minutos a horas

    return (
      <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Investigaciones */}
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
                  Total
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <FileTextIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
                <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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

        {/* Información del Participante */}
        <InfoContainer 
          title="Información del Participante"
          icon={<UserIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Nombre Completo"
            value={participante.nombre}
          />
          <InfoItem 
            label="Email"
            value={participante.email}
          />
          <InfoItem 
            label="Tipo de Participante"
            value={
              <Chip 
                variant={getTipoParticipanteVariant(participante.tipo as any)}
                size="sm"
              >
                {participante.tipo === 'externo' ? 'Externo' : 
                 participante.tipo === 'interno' ? 'Interno' : 'Friend & Family'}
              </Chip>
            }
          />
          <InfoItem 
            label="Estado"
            value={
              <Chip 
                variant={getEstadoParticipanteVariant(participante.estado_participante || 'disponible')}
                size="sm"
              >
                {getChipText(participante.estado_participante || 'disponible')}
              </Chip>
            }
          />
          <InfoItem 
            label="Total de Participaciones"
            value={participante.total_participaciones?.toString() || '0'}
          />
          <InfoItem 
            label="Última Participación"
            value={
              participante.fecha_ultima_participacion ? 
              formatearFecha(participante.fecha_ultima_participacion) : 
              'Sin participaciones'
            }
          />
          <InfoItem 
            label="Fecha de Registro"
            value={formatearFecha(participante.created_at)}
          />
          <InfoItem 
            label="Última Actualización"
            value={formatearFecha(participante.updated_at)}
          />
        </InfoContainer>

        {/* Información adicional */}
        {participante.comentarios && (
          <InfoContainer 
            title="Comentarios"
            icon={<MessageIcon className="w-4 h-4" />}
            variant="bordered"
            padding="md"
          >
            <div className="col-span-full">
              <Typography variant="body2" color="secondary">
                {participante.comentarios}
              </Typography>
            </div>
          </InfoContainer>
        )}

        {participante.doleres_necesidades && (
          <InfoContainer 
            title="Dolores y Necesidades"
            icon={<AlertTriangleIcon className="w-4 h-4" />}
            variant="bordered"
            padding="md"
          >
            <div className="col-span-full">
              <Typography variant="body2" color="secondary">
                {participante.doleres_necesidades}
              </Typography>
            </div>
          </InfoContainer>
        )}

        {/* Información de la Empresa (solo para participantes externos) */}
        {participante.tipo === 'externo' && empresa && (
          <InfoContainer 
            title="Información de la Empresa"
            icon={<BuildingIcon className="w-4 h-4" />}
          >
            <InfoItem 
              label="Nombre de la Empresa"
              value={empresa.nombre}
            />
            <InfoItem 
              label="Estado"
              value={
                <Chip 
                  variant={getEstadoChipVariant(empresa.estado_nombre || '')}
                  size="sm"
                >
                  {getChipText(empresa.estado_nombre || 'disponible')}
                </Chip>
              }
            />
            {empresa.descripcion && (
              <InfoItem 
                label="Descripción"
                value={empresa.descripcion}
              />
            )}
          </InfoContainer>
        )}
      </div>
    );
  };

  // Componente para el contenido del tab de Información de la Sesión
  const ReclutamientoContent: React.FC<{ reclutamiento: Reclutamiento; participante: Participante }> = ({ reclutamiento, participante }) => {
    return (
        <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-gray-900">
                Información de la Sesión
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                Detalles del reclutamiento actual
                    </Typography>
                  </div>
                </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Título</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {reclutamiento.titulo}
                      </Typography>
                    </div>
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Fecha</Typography>
                <Typography variant="body1" className="text-gray-900">
                  {formatearFecha(reclutamiento.fecha)}
                </Typography>
              </div>
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Estado</Typography>
                <Chip variant={getEstadoReclutamientoVariant(reclutamiento.estado)} size="sm">
                        {reclutamiento.estado}
                      </Chip>
                    </div>
                  </div>
                  
            <div className="space-y-4">
              {reclutamiento.reclutador && (
                  <div>
                  <Typography variant="body2" className="text-gray-500 mb-1">Reclutador</Typography>
                    <Typography variant="body1" className="text-gray-900">
                    {reclutamiento.reclutador.nombre}
                    </Typography>
                  </div>
              )}
              {reclutamiento.meet_link && (
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Enlace de Meet</Typography>
                        <a 
                          href={reclutamiento.meet_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                        >
                    Abrir en Google Meet
                        </a>
                </div>
                      )}
                    </div>
                  </div>
          
          {reclutamiento.descripcion && (
            <div className="mt-6">
              <Typography variant="body2" className="text-gray-500 mb-2">Descripción</Typography>
              <Typography variant="body1" className="text-gray-900">
                {reclutamiento.descripcion}
              </Typography>
                </div>
          )}
              </Card>
      </div>
    );
  };

  const tabs = [
    {
      id: 'informacion',
      label: 'Información de Participante',
      content: <InformacionContent 
        participante={participante!} 
        empresa={empresa} 
        investigaciones={investigaciones}
        participacionesPorMes={participacionesPorMes}
      />
    },
    {
      id: 'reclutamiento',
      label: 'Información de la Sesión',
      content: <ReclutamientoContent reclutamiento={reclutamiento!} participante={participante!} />
    },
    {
      id: 'empresa-informacion',
      label: 'Información Empresa',
      content: (
        <div className="space-y-6">
          {empresa && participante?.tipo === 'externo' ? (
            <>
              {/* Descripción */}
              {empresa.descripcion && (
                <InfoContainer 
                  title="Descripción"
                  icon={<FileTextIcon className="w-4 h-4" />}
                >
                  <InfoItem 
                    label="Descripción" 
                    value={empresa.descripcion}
                  />
                </InfoContainer>
              )}

              {/* Información básica de la empresa */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <BuildingIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <Typography variant="h3" className="text-gray-900">
                      Información de la Empresa
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                      Datos corporativos
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="text-gray-500 mb-1">Nombre</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {empresa.nombre}
                      </Typography>
                    </div>
                    {empresa.tamano && (
                    <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Tamaño</Typography>
                      <Typography variant="body1" className="text-gray-900">
                          {empresa.tamano}
                      </Typography>
                    </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {empresa.modalidad && (
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Modalidad</Typography>
                        <Typography variant="body1" className="text-gray-900">
                          {empresa.modalidad}
                        </Typography>
                      </div>
                    )}
                    {empresa.relacion && (
                      <div>
                        <Typography variant="body2" className="text-gray-500 mb-1">Relación</Typography>
                        <Typography variant="body1" className="text-gray-900">
                          {empresa.relacion}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={<BuildingIcon className="w-12 h-12 text-gray-400" />}
              title="Sin información de empresa"
              description="Este participante no tiene información de empresa asociada"
            />
          )}
        </div>
      )
    },
    {
      id: 'dolores',
      label: 'Dolores',
      content: (
        <>
          {dolores.length > 0 ? (
            <DoloresUnifiedContainer
              dolores={dolores}
              loading={false}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              showFilterDrawer={showFilterDrawer}
              setShowFilterDrawer={setShowFilterDrawer}
              getActiveFiltersCount={getActiveFiltersCount}
              columns={columnsDolores}
              actions={[
                {
                  label: 'Ver detalles',
                  icon: <EyeIcon className="w-4 h-4" />,
                  onClick: handleVerDolor,
                  title: 'Ver detalles del dolor'
                },
                {
                  label: 'Editar',
                  icon: <EditIcon className="w-4 h-4" />,
                  onClick: handleEditarDolor,
                  title: 'Editar dolor'
                },
                {
                  label: 'Marcar como Resuelto',
                  icon: <CheckIcon className="w-4 h-4" />,
                  onClick: (dolor: DolorParticipante) => handleCambiarEstadoDolor(dolor, 'resuelto'),
                  title: 'Marcar dolor como resuelto',
                  show: (dolor: DolorParticipante) => dolor.estado !== 'resuelto'
                },
                {
                  label: 'Archivar',
                  icon: <CheckCircleIcon className="w-4 h-4" />,
                  onClick: (dolor: DolorParticipante) => handleCambiarEstadoDolor(dolor, 'archivado'),
                  title: 'Archivar dolor',
                  show: (dolor: DolorParticipante) => dolor.estado !== 'archivado'
                },
                {
                  label: 'Reactivar',
                  icon: <RefreshIcon className="w-4 h-4" />,
                  onClick: (dolor: DolorParticipante) => handleCambiarEstadoDolor(dolor, 'activo'),
                  title: 'Reactivar dolor',
                  show: (dolor: DolorParticipante) => dolor.estado !== 'activo'
                },
                {
                  label: 'Eliminar',
                  icon: <TrashIcon className="w-4 h-4" />,
                  onClick: handleEliminarDolor,
                  className: 'text-red-600 hover:text-red-700',
                  title: 'Eliminar dolor'
                }
              ]}
              filterOptions={filterOptions}
            />
          ) : (
            <EmptyState
              icon={<AlertTriangleIcon className="w-8 h-8" />}
              title="Sin dolores registrados"
              description="Este participante no tiene dolores o necesidades registradas."
            />
          )}
        </>
      )
    },
    {
      id: 'perfilamientos',
      label: 'Perfilamiento',
      content: (
        <PerfilamientosTab
          participanteId={id as string}
          participanteNombre={participante?.nombre || ''}
          usuarios={usuarios}
        />
      )
    }
  ];

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSessions}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          <PageHeader
            title="Sesión Activa"
              variant="compact"
            color="blue"
              className="mb-0"
              chip={{
                label: participante.nombre,
                variant: getTipoParticipanteVariant(participante.tipo),
                size: 'sm'
              }}
            />
            </div>
            
          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleSaveAndViewSession} 
              className="flex items-center gap-2 bg-white border-2 border-blue-500 text-gray-800 hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 rounded-full px-4 py-2 font-medium shadow-sm hover:shadow-md"
            >
              <AIIcon className="w-4 h-4 text-blue-500" />
              Guardar y Analizar con IA
            </button>
            </div>
          </div>

        {/* Tabs */}
          <div className="space-y-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
        </div>
      </div>
    </Layout>
  );
}