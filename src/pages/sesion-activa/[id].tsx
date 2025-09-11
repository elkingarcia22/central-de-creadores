import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader, InfoContainer, InfoItem } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import { SideModal, Input, Textarea, Select, ConfirmModal, EmptyState } from '../../components/ui';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon, AIIcon, MicIcon } from '../../components/icons';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText } from '../../utils/chipUtils';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
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
        loadUsuariosData()
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

  // Columnas para la tabla de dolores
  const columnsDolores = [
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <div className="font-medium text-gray-900">{dolor.titulo}</div>
      )
    },
    {
      key: 'categoria',
      label: 'Categoría',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <Chip variant="secondary" size="sm">{dolor.categoria}</Chip>
      )
    },
    {
      key: 'severidad',
      label: 'Severidad',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <Chip variant={getSeveridadVariant(dolor.severidad)} size="sm">
          {dolor.severidad}
        </Chip>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <Chip variant={getEstadoDolorVariant(dolor.estado)} size="sm">
          {getEstadoDolorText(dolor.estado)}
        </Chip>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha',
      sortable: true,
      render: (dolor: DolorParticipante) => (
        <div className="text-sm text-gray-600">
          {formatearFecha(dolor.fecha_creacion)}
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
  }> = ({ participante, empresa }) => {
    return (
      <div className="space-y-6">
        {/* Información básica */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <Typography variant="h3" className="text-gray-900">
                Información Básica
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Datos principales del participante
              </Typography>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Nombre</Typography>
                <Typography variant="body1" className="text-gray-900 font-medium">
                  {participante.nombre}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Email</Typography>
                <Typography variant="body1" className="text-gray-900">
                  {participante.email}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Teléfono</Typography>
                <Typography variant="body1" className="text-gray-900">
                  {participante.telefono || 'No disponible'}
                </Typography>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Tipo</Typography>
                <Chip variant={getTipoParticipanteVariant(participante.tipo)} size="sm">
                  {participante.tipo}
                </Chip>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Estado</Typography>
                <Chip variant={getEstadoParticipanteVariant(participante.estado)} size="sm">
                  {participante.estado || 'Activo'}
                </Chip>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-500 mb-1">Fecha de registro</Typography>
                <Typography variant="body1" className="text-gray-900">
                  {participante.created_at ? formatearFecha(participante.created_at) : 'No disponible'}
                </Typography>
              </div>
            </div>
          </div>
        </Card>

        {/* Información de empresa (si aplica) */}
        {empresa && participante.tipo === 'externo' && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <BuildingIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <Typography variant="h3" className="text-gray-900">
                  Información de Empresa
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Datos laborales del participante
                </Typography>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" className="text-gray-500 mb-1">Empresa</Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {empresa.nombre}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-500 mb-1">Rol</Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {participante.rol_empresa || 'No especificado'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-500 mb-1">Departamento</Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {participante.departamento_nombre || 'No especificado'}
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        )}
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
      />
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