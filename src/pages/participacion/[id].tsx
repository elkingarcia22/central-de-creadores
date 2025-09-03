import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { SideModal, Input, Textarea, Select, DolorSideModal, ConfirmModal, Subtitle, EmptyState } from '../../components/ui';
import ActionsMenu from '../../components/ui/ActionsMenu';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon as ClockIconSolid, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon } from '../../components/icons';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText } from '../../utils/chipUtils';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import ParticipacionesUnifiedContainer from '../../components/participantes/ParticipacionesUnifiedContainer';
import FilterDrawer from '../../components/ui/FilterDrawer';
import type { FilterValuesDolores, FilterValuesParticipaciones } from '../../components/ui/FilterDrawer';
import { SeleccionarCategoriaPerfilamientoModal } from '../../components/participantes/SeleccionarCategoriaPerfilamientoModal';
import { CrearPerfilamientoModal } from '../../components/participantes/CrearPerfilamientoModal';
import EditarParticipanteModal from '../../components/ui/EditarParticipanteModal';

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

interface Empresa {
  id: string;
  nombre: string;
  estado_nombre?: string;
  descripcion?: string;
  industria?: string;
  tamano?: string;
  pais?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  website?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

interface InvestigacionParticipante {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_sesion?: string;
  riesgo_automatico?: string;
  fecha_participacion: string;
  estado_agendamiento?: string;
  duracion_sesion?: string;
  tipo_investigacion: string;
  responsable: string;
}

interface DolorParticipante {
  id: string;
  participante_id: string;
  participante_nombre: string;
  participante_email: string;
  categoria_id: string;
  categoria_nombre: string;
  categoria_color: string;
  categoria_icono?: string;
  titulo: string;
  descripcion?: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activo' | 'resuelto' | 'archivado';
  investigacion_relacionada_id?: string;
  investigacion_nombre?: string;
  sesion_relacionada_id?: string;
  creado_por?: string;
  creado_por_nombre?: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  fecha_actualizacion: string;
}

interface ComentarioParticipante {
  id: string;
  contenido: string;
  sesion_relacionada?: string;
  fecha_creacion: string;
  creado_por: string;
}

export default function VistaParticipacion() {
  const router = useRouter();
  const { id } = router.query;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showError, showSuccess } = useToast();

  // Estados principales
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacion');

  // Estados para datos
  const [investigaciones, setInvestigaciones] = useState<InvestigacionParticipante[]>([]);
  const [dolores, setDolores] = useState<DolorParticipante[]>([]);
  const [participacionesPorMes, setParticipacionesPorMes] = useState<{ [key: string]: number }>({});
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Estados para modales
  const [showCrearDolorModal, setShowCrearDolorModal] = useState(false);
  const [showCrearComentarioModal, setShowCrearComentarioModal] = useState(false);
  const [showVerDolorModal, setShowVerDolorModal] = useState(false);
  const [showEditarDolorModal, setShowEditarDolorModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalCrearDolor, setShowModalCrearDolor] = useState(false);
  const [showModalPerfilamiento, setShowModalPerfilamiento] = useState(false);
  const [showModalCrearPerfilamiento, setShowModalCrearPerfilamiento] = useState(false);

  // Estados para datos seleccionados
  const [dolorSeleccionado, setDolorSeleccionado] = useState<DolorParticipante | null>(null);
  const [dolorParaEliminar, setDolorParaEliminar] = useState<DolorParticipante | null>(null);
  const [dolorParaEditar, setDolorParaEditar] = useState<DolorParticipante | null>(null);
  const [participanteParaEditar, setParticipanteParaEditar] = useState<Participante | null>(null);
  const [participanteParaEliminar, setParticipanteParaEliminar] = useState<Participante | null>(null);
  const [participanteParaCrearDolor, setParticipanteParaCrearDolor] = useState<Participante | null>(null);
  const [participanteParaPerfilamiento, setParticipanteParaPerfilamiento] = useState<Participante | null>(null);
  const [participantePerfilamientoTemp, setParticipantePerfilamientoTemp] = useState<Participante | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any>(null);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [searchTermParticipaciones, setSearchTermParticipaciones] = useState('');
  const [filtersParticipaciones, setFiltersParticipaciones] = useState<any>({});
  const [showFilterDrawerParticipaciones, setShowFilterDrawerParticipaciones] = useState(false);

  // Estados para opciones de filtros
  const [filterOptions, setFilterOptions] = useState<any>({
    categorias: [],
    estados: [],
    severidades: [],
    usuarios: []
  });

  const [filterOptionsParticipaciones, setFilterOptionsParticipaciones] = useState<any>({
    estados: [],
    tipos: [],
    responsables: [],
    implementadores: []
  });

  // Función para obtener el estado del chip
  const getEstadoChipVariant = (estado: string) => {
    if (!estado) return 'default';
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('activo') || estadoLower.includes('activa')) return 'success';
    if (estadoLower.includes('pendiente')) return 'warning';
    if (estadoLower.includes('completado') || estadoLower.includes('finalizada')) return 'success';
    if (estadoLower.includes('cancelado') || estadoLower.includes('cancelada')) return 'danger';
    if (estadoLower.includes('bloqueado') || estadoLower.includes('bloqueada')) return 'danger';
    return 'default';
  };

  // Función para obtener el contador de filtros activos
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const getActiveFiltersCountParticipaciones = () => {
    return Object.values(filtersParticipaciones).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  // Cargar datos del participante
  const cargarParticipante = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/participantes/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setParticipante(data);
        
        // Si es participante externo, cargar datos de la empresa
        if (data.tipo === 'externo' && data.empresa_id) {
          await cargarEmpresa(data.empresa_id);
        }
      } else {
        showError('Error al cargar el participante');
      }
    } catch (error) {
      console.error('Error cargando participante:', error);
      showError('Error al cargar el participante');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  // Cargar datos de la empresa
  const cargarEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}`);
      if (response.ok) {
        const data = await response.json();
        setEmpresa(data);
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
    }
  };

  // Cargar datos adicionales
  useEffect(() => {
    if (id) {
      cargarParticipante();
      cargarInvestigaciones();
      cargarDolores();
      cargarUsuarios();
    }
  }, [id, cargarParticipante]);

  // Cargar investigaciones
  const cargarInvestigaciones = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/participantes/${id}/investigaciones`);
      if (response.ok) {
        const data = await response.json();
        setInvestigaciones(data.investigaciones || []);
        setParticipacionesPorMes(data.participacionesPorMes || {});
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  // Cargar dolores
  const cargarDolores = async () => {
    if (!id) return;
    
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

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data?.usuarios || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  // Funciones para manejar dolores
  const handleDolorGuardado = useCallback(async (dolorData: any) => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dolorData),
      });

      if (response.ok) {
        setShowCrearDolorModal(false);
        showSuccess('Dolor registrado exitosamente');
        await cargarDolores();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear el dolor');
      }
    } catch (error) {
      console.error('Error al crear dolor:', error);
      showError('Error al crear el dolor');
    }
  }, [id, showSuccess, showError]);

  const handleVerDolor = (dolor: DolorParticipante) => {
    setDolorSeleccionado(dolor);
    setShowVerDolorModal(true);
  };

  const handleEditarDolor = (dolor: DolorParticipante) => {
    setDolorSeleccionado(dolor);
    setShowEditarDolorModal(true);
  };

  const handleEliminarDolor = (dolor: DolorParticipante) => {
    setDolorParaEliminar(dolor);
    setShowDeleteConfirmModal(true);
  };

  const handleActualizarDolor = async (dolorData: any) => {
    if (!dolorSeleccionado) return;
    
    try {
      const response = await fetch(`/api/participantes/${id}/dolores/${dolorSeleccionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dolorData),
      });

      if (response.ok) {
        showSuccess('Dolor actualizado exitosamente');
        setShowEditarDolorModal(false);
        setDolorSeleccionado(null);
        await cargarDolores();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al actualizar el dolor');
      }
    } catch (error) {
      console.error('Error al actualizar dolor:', error);
      showError('Error al actualizar el dolor');
    }
  };

  const confirmarEliminarDolor = async () => {
    if (!dolorParaEliminar) return;
    
    try {
      const response = await fetch(`/api/participantes/${id}/dolores/${dolorParaEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Dolor eliminado exitosamente');
        await cargarDolores();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al eliminar el dolor');
      }
    } catch (error) {
      console.error('Error al eliminar dolor:', error);
      showError('Error al eliminar el dolor');
    }
  };

  // Funciones para manejar participante
  const handleEditarParticipante = (participante: Participante) => {
    setParticipanteParaEditar(participante);
    setShowModalEditar(true);
  };

  const handleEliminarParticipante = (participante: Participante) => {
    setParticipanteParaEliminar(participante);
    setShowModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!participanteParaEliminar) return;
    
    try {
      const response = await fetch(`/api/participantes/${participanteParaEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Participante eliminado exitosamente');
        router.push('/participantes');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al eliminar el participante');
      }
    } catch (error) {
      console.error('Error al eliminar participante:', error);
      showError('Error al eliminar el participante');
    }
  };

  const handleCrearDolor = (participante: Participante) => {
    setParticipanteParaCrearDolor(participante);
    setShowModalCrearDolor(true);
  };

  const handleCrearPerfilamiento = (participante: Participante) => {
    setParticipanteParaPerfilamiento(participante);
    setShowModalPerfilamiento(true);
  };

  // Funciones para manejar perfilamiento
  const handleCambiarEstadoDolor = async (dolor: DolorParticipante, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores/${dolor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dolor, estado: nuevoEstado }),
      });

      if (response.ok) {
        showSuccess(`Dolor marcado como ${nuevoEstado}`);
        await cargarDolores();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al cambiar el estado del dolor');
      }
    } catch (error) {
      console.error('Error al cambiar estado del dolor:', error);
      showError('Error al cambiar el estado del dolor');
    }
  };

  // Columnas para las tablas
  const columnsInvestigaciones = [
    {
      key: 'nombre',
      label: 'Investigación',
      render: (value: any, row: any) => (
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
      render: (value: any, row: any) => (
        <Typography variant="body2">
          {formatearFecha(row.fecha_participacion)}
        </Typography>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: any, row: any) => (
        <Chip variant={getChipVariant(row.estado_agendamiento) as any}>
          {row.estado_agendamiento}
        </Chip>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (value: any, row: any) => (
        <Typography variant="body2">
          {row.responsable}
        </Typography>
      )
    }
  ];

  const columnsDolores = [
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      render: (value: any, row: DolorParticipante) => (
        <Typography variant="body2" weight="semibold">
          {row.titulo || '-'}
        </Typography>
      )
    },
    {
      key: 'categoria_nombre',
      label: 'Categoría',
      sortable: true,
      render: (value: any, row: DolorParticipante) => (
        <Typography variant="caption" color="secondary">
          {row.categoria_nombre || '-'}
        </Typography>
      )
    },
    {
      key: 'severidad',
      label: 'Severidad',
      sortable: true,
      render: (value: any, row: DolorParticipante) => (
        <Chip variant={getSeveridadVariant(row.severidad)} size="sm">
          {row.severidad ? row.severidad.charAt(0).toUpperCase() + row.severidad.slice(1) : '-'}
        </Chip>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (value: any, row: DolorParticipante) => (
        <Typography variant="body2" className="max-w-xs truncate">
          {row.descripcion || '-'}
        </Typography>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (value: any, row: DolorParticipante) => (
        <Chip variant={getEstadoDolorVariant(row.estado)} size="sm">
          {getEstadoDolorText(row.estado)}
        </Chip>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha de Creación',
      sortable: true,
      render: (value: any, row: DolorParticipante) => (
        <Typography variant="caption">
          {formatearFecha(row.fecha_creacion)}
        </Typography>
      )
    }
  ];

  // Componente para el contenido del tab de Empresa
  const EmpresaContent: React.FC<{ empresa?: Empresa; participante: Participante }> = ({ empresa, participante }) => {
    if (participante.tipo !== 'externo' || !empresa) {
      return (
        <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/20">
          <div className="text-center py-12">
            <BuildingIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <Typography variant="h5" color="secondary" className="mb-2">
              Información de Empresa no disponible
            </Typography>
            <Typography variant="body2" color="secondary">
              {participante.tipo === 'externo' 
                ? 'No se encontró información de la empresa asociada.'
                : 'Este participante no está asociado a una empresa externa.'}
            </Typography>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Información básica de la empresa */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <BuildingIcon className="w-5 h-5 text-green-600" />
            <Typography variant="h5" weight="semibold">
              Información General
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                    {empresa.estado_nombre || 'Sin estado'}
                  </Chip>
                }
              />
              <InfoItem 
                label="Industria"
                value={empresa.industria || 'No especificada'}
              />
              <InfoItem 
                label="Tamaño"
                value={empresa.tamano || 'No especificado'}
              />
            </div>
            
            <div className="space-y-4">
              <InfoItem 
                label="País"
                value={empresa.pais || 'No especificado'}
              />
              <InfoItem 
                label="Ciudad"
                value={empresa.ciudad || 'No especificada'}
              />
              <InfoItem 
                label="Email"
                value={empresa.email || 'No especificado'}
              />
              <InfoItem 
                label="Website"
                value={
                  empresa.website ? (
                    <a 
                      href={empresa.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {empresa.website}
                    </a>
                  ) : (
                    'No especificado'
                  )
                }
              />
            </div>
          </div>

          {empresa.descripcion && (
            <div className="mt-6 pt-6 border-t border-border">
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Descripción
              </Typography>
              <Typography variant="body2" color="secondary">
                {empresa.descripcion}
              </Typography>
            </div>
          )}

          {empresa.direccion && (
            <div className="mt-4">
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Dirección
              </Typography>
              <Typography variant="body2" color="secondary">
                {empresa.direccion}
              </Typography>
            </div>
          )}
        </Card>

        {/* Estadísticas de la empresa */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChartIcon className="w-5 h-5 text-blue-600" />
            <Typography variant="h5" weight="semibold">
              Estadísticas de Participación
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Typography variant="h4" weight="bold" className="text-blue-600">
                {investigaciones.length}
              </Typography>
              <Typography variant="body2" color="secondary">
                Investigaciones
              </Typography>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Typography variant="h4" weight="bold" className="text-green-600">
                {participante.total_participaciones}
              </Typography>
              <Typography variant="body2" color="secondary">
                Participaciones
              </Typography>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Typography variant="h4" weight="bold" className="text-purple-600">
                {empresa.fecha_creacion ? 
                  new Date(empresa.fecha_creacion).getFullYear() : 
                  'N/A'
                }
              </Typography>
              <Typography variant="body2" color="secondary">
                Año de Registro
              </Typography>
            </div>
          </div>
        </Card>

        {/* Información de contacto */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <UsersIcon className="w-5 h-5 text-indigo-600" />
            <Typography variant="h5" weight="semibold">
              Información de Contacto
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoItem 
                label="Email Corporativo"
                value={empresa.email || 'No especificado'}
              />
              <InfoItem 
                label="Teléfono"
                value={empresa.telefono || 'No especificado'}
              />
            </div>
            
            <div className="space-y-4">
              <InfoItem 
                label="Website"
                value={
                  empresa.website ? (
                    <a 
                      href={empresa.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visitar sitio web
                    </a>
                  ) : (
                    'No especificado'
                  )
                }
              />
              <InfoItem 
                label="Fecha de Registro"
                value={empresa.fecha_creacion ? formatearFecha(empresa.fecha_creacion) : 'No especificada'}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Componente para el contenido del tab de Estadísticas
  const EstadisticasContent: React.FC = () => {
    const totalInvestigaciones = investigaciones.length;
    const investigacionesFinalizadas = investigaciones.filter(inv => 
      inv.estado === 'finalizada' || inv.estado === 'completada'
    ).length;
    const investigacionesEnProgreso = investigaciones.filter(inv => 
      inv.estado === 'en_progreso' || inv.estado === 'activa'
    ).length;
    const investigacionesPendientes = investigaciones.filter(inv => 
      inv.estado === 'pendiente' || inv.estado === 'por_iniciar'
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
                <ClockIconSolid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
                  const [year, month] = mes.split('-');
                  const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
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

  // Componente para el contenido del tab de Información
  const InformacionContent: React.FC<{ participante: Participante; empresa?: Empresa }> = ({ participante, empresa }) => {
    return (
      <div className="space-y-6">
        {/* Información del Participante */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <UserIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5" weight="semibold">
              Información del Participante
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                    variant={participante.tipo === 'externo' ? 'primary' : participante.tipo === 'interno' ? 'success' : 'warning'}
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
                    variant={getEstadoChipVariant(participante.estado_participante)}
                    size="sm"
                  >
                    {participante.estado_participante || 'Sin estado'}
                  </Chip>
                }
              />
            </div>
            
            <div className="space-y-4">
              <InfoItem 
                label="Total de Participaciones"
                value={participante.total_participaciones.toString()}
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
            </div>
          </div>

          {/* Información adicional */}
          {participante.comentarios && (
            <div className="mt-6 pt-6 border-t border-border">
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Comentarios
              </Typography>
              <Typography variant="body2" color="secondary">
                {participante.comentarios}
              </Typography>
            </div>
          )}

          {participante.doleres_necesidades && (
            <div className="mt-4">
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Dolores y Necesidades
              </Typography>
              <Typography variant="body2" color="secondary">
                {participante.doleres_necesidades}
              </Typography>
            </div>
          )}
        </Card>

        {/* Información de la Empresa (solo para participantes externos) */}
        {participante.tipo === 'externo' && empresa && (
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <BuildingIcon className="w-5 h-5 text-green-600" />
              <Typography variant="h5" weight="semibold">
                Información de la Empresa
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                      {empresa.estado_nombre || 'Sin estado'}
                    </Chip>
                  }
                />
                <InfoItem 
                  label="Industria"
                  value={empresa.industria || 'No especificada'}
                />
                <InfoItem 
                  label="Tamaño"
                  value={empresa.tamano || 'No especificado'}
                />
              </div>
              
              <div className="space-y-4">
                <InfoItem 
                  label="País"
                  value={empresa.pais || 'No especificado'}
                />
                <InfoItem 
                  label="Ciudad"
                  value={empresa.ciudad || 'No especificada'}
                />
                <InfoItem 
                  label="Email"
                  value={empresa.email || 'No especificado'}
                />
                <InfoItem 
                  label="Website"
                  value={
                    empresa.website ? (
                      <a 
                        href={empresa.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {empresa.website}
                      </a>
                    ) : (
                      'No especificado'
                    )
                  }
                />
              </div>
            </div>

            {empresa.descripcion && (
              <div className="mt-6 pt-6 border-t border-border">
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Descripción
                </Typography>
                <Typography variant="body2" color="secondary">
                  {empresa.descripcion}
                </Typography>
              </div>
            )}

            {empresa.direccion && (
              <div className="mt-4">
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Dirección
                </Typography>
                <Typography variant="body2" color="secondary">
                  {empresa.direccion}
                </Typography>
              </div>
            )}
          </Card>
        )}

        {/* Información de Rol en Empresa (para participantes internos) */}
        {participante.tipo === 'interno' && (participante.rol_empresa || participante.departamento_nombre) && (
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              <Typography variant="h5" weight="semibold">
                Información Laboral
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {participante.rol_empresa && (
                <InfoItem 
                  label="Rol en la Empresa"
                  value={participante.rol_empresa}
                />
              )}
              {participante.departamento_nombre && (
                <InfoItem 
                  label="Departamento"
                  value={participante.departamento_nombre}
                />
              )}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Estados de loading
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
              onClick={() => router.push('/reclutamiento')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title={`Participación: ${participante.nombre}`}
              variant="compact"
              color="purple"
              className="mb-0"
              chip={{
                label: participante.estado_participante || 'Sin estado',
                variant: getEstadoChipVariant(participante.estado_participante || 'default') as any,
                size: 'sm'
              }}
            />
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <ActionsMenu
              actions={[
                {
                  label: 'Editar',
                  icon: <EditIcon className="w-4 h-4" />,
                  onClick: () => handleEditarParticipante(participante)
                },
                {
                  label: 'Crear Dolor',
                  icon: <AlertTriangleIcon className="w-4 h-4" />,
                  onClick: () => handleCrearDolor(participante)
                },
                {
                  label: 'Crear Perfilamiento',
                  icon: <MessageIcon className="w-4 h-4" />,
                  onClick: () => handleCrearPerfilamiento(participante),
                  className: 'text-popover-foreground hover:text-popover-foreground/80'
                },
                {
                  label: 'Eliminar',
                  icon: <TrashIcon className="w-4 h-4" />,
                  onClick: () => handleEliminarParticipante(participante),
                  className: 'text-red-600 hover:text-red-700'
                }
              ]}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
                         {
               id: 'informacion',
               label: 'Información',
               content: <InformacionContent participante={participante} empresa={empresa} />
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
                <ParticipacionesUnifiedContainer
                  participaciones={investigaciones}
                  loading={false}
                  searchTerm={searchTermParticipaciones}
                  setSearchTerm={setSearchTermParticipaciones}
                  filters={filtersParticipaciones}
                  setFilters={setFiltersParticipaciones}
                  showFilterDrawer={showFilterDrawerParticipaciones}
                  setShowFilterDrawer={setShowFilterDrawerParticipaciones}
                  getActiveFiltersCount={getActiveFiltersCountParticipaciones}
                  columns={columnsInvestigaciones}
                  filterOptions={filterOptionsParticipaciones}
                />
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
                      actionText="Registrar Primer Dolor"
                      onAction={() => setShowCrearDolorModal(true)}
                    />
                  )}
                </>
              )
            },
                         {
               id: 'empresa',
               label: 'Empresa',
               content: <EmpresaContent empresa={empresa} participante={participante} />
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
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="default"
          fullWidth={true}
        />
      </div>

      {/* Modales */}
      <DolorSideModal
        isOpen={showCrearDolorModal}
        onClose={() => setShowCrearDolorModal(false)}
        participanteId={id as string}
        participanteNombre={participante?.nombre || ''}
        onSave={handleDolorGuardado}
      />

      <DolorSideModal
        isOpen={showVerDolorModal}
        onClose={() => {
          setShowVerDolorModal(false);
          setDolorSeleccionado(null);
        }}
        participanteId={id as string}
        participanteNombre={participante?.nombre || ''}
        dolor={dolorSeleccionado}
        onSave={() => {}}
        loading={false}
        readOnly={true}
        onEdit={() => {
          if (dolorSeleccionado) {
            setDolorParaEditar(dolorSeleccionado);
          }
          setShowVerDolorModal(false);
          setShowEditarDolorModal(true);
        }}
      />

      <DolorSideModal
        isOpen={showEditarDolorModal}
        onClose={() => {
          setShowEditarDolorModal(false);
          setDolorParaEditar(null);
        }}
        participanteId={id as string}
        participanteNombre={participante?.nombre || ''}
        dolor={dolorParaEditar as any}
        onSave={handleActualizarDolor}
        loading={false}
        readOnly={false}
        key={`editar-${dolorParaEditar?.id}-${showEditarDolorModal}`}
      />

      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setDolorParaEliminar(null);
        }}
        onConfirm={confirmarEliminarDolor}
        title="Eliminar Dolor"
        message={`¿Estás seguro de que quieres eliminar el dolor "${dolorParaEliminar?.titulo}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Eliminar"
        cancelText="Cancelar"
        size="md"
      />

      <EditarParticipanteModal
        isOpen={showModalEditar}
        onClose={() => {
          setShowModalEditar(false);
          setParticipanteParaEditar(null);
        }}
        onSuccess={() => {
          cargarParticipante();
          setShowModalEditar(false);
          setParticipanteParaEditar(null);
        }}
        participante={participanteParaEditar}
      />

      <ConfirmModal
        isOpen={showModalEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setParticipanteParaEliminar(null);
        }}
        onConfirm={confirmarEliminacion}
        title="Eliminar Participante"
        message={`¿Estás seguro de que quieres eliminar al participante "${participanteParaEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Eliminar"
        cancelText="Cancelar"
        size="md"
      />

      <DolorSideModal
        isOpen={showModalCrearDolor}
        onClose={() => {
          setShowModalCrearDolor(false);
          setParticipanteParaCrearDolor(null);
        }}
        participanteId={participanteParaCrearDolor?.id || ''}
        participanteNombre={participanteParaCrearDolor?.nombre || ''}
        onSave={handleDolorGuardado}
      />

      <SeleccionarCategoriaPerfilamientoModal
        isOpen={showModalPerfilamiento}
        onClose={() => {
          setShowModalPerfilamiento(false);
          setParticipanteParaPerfilamiento(null);
        }}
        participanteId={participanteParaPerfilamiento?.id || ''}
        participanteNombre={participanteParaPerfilamiento?.nombre || ''}
        onCategoriaSeleccionada={(categoria) => {
          setCategoriaSeleccionada(categoria);
          setShowModalCrearPerfilamiento(true);
          setShowModalPerfilamiento(false);
        }}
      />

      {showModalCrearPerfilamiento && categoriaSeleccionada && participantePerfilamientoTemp && (
        <CrearPerfilamientoModal
          isOpen={true}
          onClose={() => {
            setShowModalCrearPerfilamiento(false);
            setCategoriaSeleccionada(null);
            setParticipantePerfilamientoTemp(null);
          }}
          participanteId={participantePerfilamientoTemp.id}
          participanteNombre={participantePerfilamientoTemp.nombre}
          categoria={categoriaSeleccionada}
          onBack={() => {
            setShowModalCrearPerfilamiento(false);
            setCategoriaSeleccionada(null);
            setShowModalPerfilamiento(true);
          }}
          onSuccess={() => {
            setShowModalCrearPerfilamiento(false);
            setCategoriaSeleccionada(null);
            setParticipantePerfilamientoTemp(null);
            showSuccess('Perfilamiento creado exitosamente');
          }}
        />
      )}
    </Layout>
  );
}
