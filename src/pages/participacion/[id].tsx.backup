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
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon } from '../../components/icons';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText } from '../../utils/chipUtils';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import ParticipacionesUnifiedContainer from '../../components/participantes/ParticipacionesUnifiedContainer';
import FilterDrawer from '../../components/ui/FilterDrawer';
import type { FilterValuesDolores, FilterValuesParticipaciones } from '../../components/ui/FilterDrawer';
import { SeleccionarCategoriaPerfilamientoModal } from '../../components/participantes/SeleccionarCategoriaPerfilamientoModal';
import { CrearPerfilamientoModal } from '../../components/participantes/CrearPerfilamientoModal';
import EditarParticipanteModal from '../../components/ui/EditarParticipanteModal';
import EditarReclutamientoModal from '../../components/ui/EditarReclutamientoModal';

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
  // Campos adicionales para reclutamiento
  reclutamiento_id?: string;
  reclutador_id?: string;
  participantes_id?: string;
  participantes_internos_id?: string;
  participantes_friend_family_id?: string;
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
  const [reclutamientoActual, setReclutamientoActual] = useState<any>(null);
  
  // Estados para estadísticas de empresa
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState<string | null>(null);

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
  
  // Estados para modales de participación
  const [showEditarParticipacionModal, setShowEditarParticipacionModal] = useState(false);
  const [showEliminarParticipacionModal, setShowEliminarParticipacionModal] = useState(false);
  const [participacionParaEditar, setParticipacionParaEditar] = useState<any>(null);
  const [participacionParaEliminar, setParticipacionParaEliminar] = useState<any>(null);
  const [deletingParticipacion, setDeletingParticipacion] = useState(false);

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
        console.log('Participante cargado:', data);
        console.log('Tipo de participante:', data.tipo);
        console.log('Empresa ID:', data.empresa_id);
        setParticipante(data);
        
        // Cargar datos de la empresa solo para participantes externos
        if (data.tipo === 'externo') {
          if (data.empresa_id) {
            console.log('Cargando empresa por ID para participante externo...');
            await cargarEmpresa(data.empresa_id);
          } else if (data.empresa_nombre) {
            console.log('Buscando empresa por nombre para participante externo...');
            await buscarEmpresaPorNombre(data.empresa_nombre);
          } else {
            console.log('Participante externo sin empresa_id ni empresa_nombre');
          }
        } else {
          console.log('No se cargará empresa - Tipo:', data.tipo, 'Empresa ID:', data.empresa_id);
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



  // Cargar datos de la empresa por ID
  const cargarEmpresa = async (empresaId: string) => {
    try {
      console.log('Cargando empresa con ID:', empresaId);
      const response = await fetch(`/api/empresas/${empresaId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Empresa cargada por ID:', data);
        setEmpresa(data);
      } else {
        console.error('Error en respuesta de empresa:', response.status);
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
    }
  };

  // Buscar empresa por nombre
  const buscarEmpresaPorNombre = async (empresaNombre: string) => {
    try {
      console.log('Buscando empresa por nombre:', empresaNombre);
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const empresas = await response.json();
        console.log('Todas las empresas cargadas:', empresas);
        
        // Buscar empresa por nombre (ignorando mayúsculas/minúsculas)
        const empresaEncontrada = empresas.find((empresa: any) => 
          empresa.nombre && empresa.nombre.toLowerCase() === empresaNombre.toLowerCase()
        );
        
        if (empresaEncontrada) {
          console.log('Empresa encontrada por nombre:', empresaEncontrada);
          setEmpresa(empresaEncontrada);
        } else {
          console.log('No se encontró empresa con el nombre:', empresaNombre);
          console.log('Empresas disponibles:', empresas.map((e: any) => e.nombre));
        }
      } else {
        console.error('Error cargando empresas:', response.status);
      }
    } catch (error) {
      console.error('Error buscando empresa por nombre:', error);
    }
  };

  // Cargar datos adicionales
  useEffect(() => {
    if (id) {
      cargarParticipante();
      cargarReclutamientoActual();
      cargarDolores();
      cargarUsuarios();
    }
  }, [id, cargarParticipante]);

  // Debug: Monitorear cambios en el estado de empresa
  useEffect(() => {
    console.log('Estado de empresa cambiado:', empresa);
    
    // Cargar estadísticas de empresa si es un participante externo
    if (empresa && participante?.tipo === 'externo' && empresa.id) {
      cargarEstadisticasEmpresa(empresa.id);
    }
  }, [empresa, participante?.tipo]);

  // Cargar reclutamiento actual
  const cargarReclutamientoActual = async () => {
    if (!id) return;
    
    console.log('🔍 Frontend: Iniciando carga de reclutamiento actual para participante:', id);
    
    try {
      // Buscar el reclutamiento más reciente para este participante
      console.log('🔍 Frontend: Llamando API /api/participantes/${id}/reclutamiento-actual');
      const response = await fetch(`/api/participantes/${id}/reclutamiento-actual`);
      
      console.log('🔍 Frontend: Response status:', response.status);
      console.log('🔍 Frontend: Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend: Reclutamiento actual cargado exitosamente:', data);
        setReclutamientoActual(data.reclutamiento);
      } else {
        const errorData = await response.json();
        console.log('❌ Frontend: Error en API reclutamiento-actual:', errorData);
        console.log('🔍 Frontend: NO usando fallback a investigaciones para evitar datos incorrectos');
        // NO usar fallback a investigaciones para evitar datos históricos incorrectos
        setReclutamientoActual(null);
      }
    } catch (error) {
      console.error('❌ Frontend: Error cargando reclutamiento actual:', error);
      console.log('🔍 Frontend: NO usando fallback a investigaciones para evitar datos incorrectos');
      // NO usar fallback a investigaciones para evitar datos históricos incorrectos
      setReclutamientoActual(null);
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

  // Cargar investigaciones del participante
  const cargarInvestigaciones = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log('🔍 Iniciando carga de investigaciones para participante:', id);
      const response = await fetch(`/api/participantes/${id}/investigaciones`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Respuesta completa de la API:', JSON.stringify(data, null, 2));
        setInvestigaciones(data.investigaciones || []);
        setParticipacionesPorMes(data.participacionesPorMes || {});
        console.log('🔍 Investigaciones cargadas:', data.investigaciones?.length || 0);
        console.log('🔍 Participaciones por mes:', data.participacionesPorMes);
        
        // Debug detallado de las investigaciones
        if (data.investigaciones && data.investigaciones.length > 0) {
          console.log('🔍 Primera investigación:', JSON.stringify(data.investigaciones[0], null, 2));
        } else {
          console.log('⚠️ No se recibieron investigaciones de la API');
        }
      } else {
        console.error('Error cargando investigaciones:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  }, [id]);

  // Cargar estadísticas de empresa
  const cargarEstadisticasEmpresa = async (empresaId: string) => {
    setLoadingEstadisticas(true);
    setErrorEstadisticas(null);

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
      setErrorEstadisticas(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingEstadisticas(false);
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

  // Funciones para manejar participación
  const handleEditarParticipacion = () => {
    // Buscar la participación actual (primera investigación)
    if (investigaciones.length > 0) {
      const investigacion = investigaciones[0];
      
      console.log('🔍 === DEBUG INVESTIGACIÓN ===');
      console.log('🔍 Investigación completa:', investigacion);
      console.log('🔍 Campos disponibles:', Object.keys(investigacion));
      console.log('🔍 reclutador_id:', investigacion.reclutador_id);
      console.log('🔍 reclutamiento_id:', investigacion.reclutamiento_id);
      console.log('🔍 responsable:', investigacion.responsable);
      
      // Crear un objeto con la estructura que espera el modal EditarReclutamientoModal
      const participacionData = {
        id: investigacion.reclutamiento_id || investigacion.id, // Usar reclutamiento_id si está disponible
        participantes_id: id,
        reclutador_id: investigacion.reclutador_id || '',
        fecha_sesion: investigacion.fecha_participacion || '',
        hora_sesion: '', // La hora no está en investigaciones, se puede agregar después
        duracion_sesion: investigacion.duracion_sesion || 60,
        investigacion_id: investigacion.id,
        tipo_participante: participante?.tipo || 'externo',
        // Agregar información adicional
        nombre: participante?.nombre || '',
        email: participante?.email || '',
        empresa_nombre: participante?.empresa_nombre || ''
      };
      
      console.log('🔍 === DATOS FINALES ===');
      console.log('🔍 Datos de participación para editar:', participacionData);
      console.log('🔍 reclutador_id final:', participacionData.reclutador_id);
      console.log('🔍 participante:', participante);
      
      setParticipacionParaEditar(participacionData);
      setShowEditarParticipacionModal(true);
    } else {
      showError('No hay participación para editar');
    }
  };

  const handleEliminarParticipacion = () => {
    // Usar el reclutamiento actual si está disponible
    if (reclutamientoActual) {
      setParticipacionParaEliminar(reclutamientoActual);
      setShowEliminarParticipacionModal(true);
    } else if (investigaciones.length > 0) {
      // Fallback: usar la primera investigación
      setParticipacionParaEliminar(investigaciones[0]);
      setShowEliminarParticipacionModal(true);
    } else {
      showError('No hay participación para eliminar');
    }
  };

  const confirmarEliminacionParticipacion = async () => {
    if (!participacionParaEliminar) return;
    
    try {
      // Implementar eliminación real de la participación
      const response = await fetch(`/api/reclutamientos/${participacionParaEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Participación eliminada exitosamente');
        setShowEliminarParticipacionModal(false);
        setParticipacionParaEliminar(null);
        // Recargar datos
        await cargarInvestigaciones();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al eliminar la participación');
      }
    } catch (error) {
      console.error('Error eliminando participación:', error);
      showError('Error al eliminar la participación');
    }
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [empresaData, setEmpresaData] = useState<any>(null);

    useEffect(() => {
      if (empresa?.id) {
        cargarEstadisticasEmpresa(empresa.id);
      }
    }, [empresa?.id]);

    const cargarEstadisticasEmpresa = async (empresaId: string) => {
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

    console.log('EmpresaContent render - empresa:', empresa, 'participante:', participante);
    console.log('EmpresaContent - participante.tipo:', participante?.tipo);
    console.log('EmpresaContent - empresa.id:', empresa?.id);
    console.log('EmpresaContent - empresa.nombre:', empresa?.nombre);

    // Solo mostrar para participantes externos
    if (participante?.tipo !== 'externo') {
      return (
        <EmptyState
          icon={<BuildingIcon className="w-8 h-8" />}
          title="Información de Empresa no disponible"
          description="Este participante no está asociado a una empresa externa."
        />
      );
    }

    if (!empresa) {
      return (
        <EmptyState
          icon={<BuildingIcon className="w-8 h-8" />}
          title="Sin información de empresa"
          description="No se encontró información de la empresa asociada a este participante externo."
        />
      );
    }

    return (
      <div className="space-y-6">
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

        {/* Información básica */}
        <InfoContainer 
          title="Información Básica"
          icon={<BuildingIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Nombre" 
            value={empresa.nombre}
          />
          {empresa.estado_nombre && (
            <InfoItem 
              label="Estado" 
              value={
                <Chip 
                  variant={getChipVariant(empresa.estado_nombre) as any}
                  size="sm"
                >
                  {empresa.estado_nombre}
                </Chip>
              }
            />
          )}
          {empresa.pais && (
            <InfoItem 
              label="País" 
              value={empresa.pais}
            />
          )}
          {empresa.ciudad && (
            <InfoItem 
              label="Ciudad" 
              value={empresa.ciudad}
            />
          )}
          {empresa.industria && (
            <InfoItem 
              label="Industria" 
              value={empresa.industria}
            />
          )}
          {empresa.tamano && (
            <InfoItem 
              label="Tamaño" 
              value={empresa.tamano}
            />
          )}
          {empresa.direccion && (
            <InfoItem 
              label="Dirección" 
              value={empresa.direccion}
            />
          )}
          {empresa.telefono && (
            <InfoItem 
              label="Teléfono" 
              value={empresa.telefono}
            />
          )}
          {empresa.email && (
            <InfoItem 
              label="Email" 
              value={empresa.email}
            />
          )}
          {empresa.website && (
            <InfoItem 
              label="Website" 
              value={empresa.website}
            />
          )}
        </InfoContainer>

        {/* Fechas */}
        <InfoContainer 
          title="Fechas"
          icon={<ClockIcon className="w-4 h-4" />}
        >
          {empresa.fecha_creacion && (
            <InfoItem 
              label="Fecha de Creación" 
              value={formatearFecha(empresa.fecha_creacion)}
            />
          )}
          {empresa.fecha_actualizacion && (
            <InfoItem 
              label="Última Actualización" 
              value={formatearFecha(empresa.fecha_actualizacion)}
            />
          )}
        </InfoContainer>

        {/* Estadísticas */}
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
                onClick={() => empresa.id && cargarEstadisticasEmpresa(empresa.id)}
              >
                Reintentar
              </Button>
            </Card>
          )}

          {/* Estadísticas principales */}
          {empresaData?.estadisticas && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Participaciones */}
                <Card variant="elevated" padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                        <AnimatedCounter
                          value={empresaData.estadisticas.totalParticipaciones || 0}
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

                {/* Total Participantes */}
                <Card variant="elevated" padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                        <AnimatedCounter
                          value={empresaData.estadisticas.totalParticipantes || 0}
                          duration={2000}
                          className="text-gray-700 dark:text-gray-200"
                        />
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        Total Participantes
                      </Typography>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                      <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                </Card>

                {/* Investigaciones Participadas */}
                <Card variant="elevated" padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                        <AnimatedCounter
                          value={empresaData.estadisticas.investigacionesParticipadas || 0}
                          duration={2000}
                          className="text-gray-700 dark:text-gray-200"
                        />
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        Investigaciones
                      </Typography>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                      <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                </Card>

                {/* Tiempo Total */}
                <Card variant="elevated" padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                        <AnimatedCounter 
                          value={Math.round((empresaData.estadisticas.duracionTotalSesiones || 0) / 60)} 
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

              {/* Última participación y resumen del mes */}
              <InfoContainer 
                title="Resumen de Participación"
                icon={<UserIcon className="w-4 h-4" />}
              >
                {empresaData.estadisticas.fechaUltimaParticipacion && (
                  <InfoItem 
                    label="Última Participación" 
                    value={formatearFecha(empresaData.estadisticas.fechaUltimaParticipacion)}
                  />
                )}
                
                <InfoItem 
                  label="Participaciones del Mes" 
                  value={
                    (() => {
                      const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                      const participacionesMesActual = empresaData.estadisticas.participacionesPorMes?.[mesActual] || 0;
                      const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                      return `${participacionesMesActual} en ${nombreMes}`;
                    })()
                  }
                />
              </InfoContainer>

              {/* Participaciones por mes */}
              {empresaData.estadisticas.participacionesPorMes && Object.keys(empresaData.estadisticas.participacionesPorMes).length > 0 && (
                <InfoContainer 
                  title="Participaciones por Mes (Finalizadas)"
                  icon={<TrendingUpIcon className="w-4 h-4" />}
                >
                  <div className="space-y-3">
                    {Object.entries(empresaData.estadisticas.participacionesPorMes)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 6)
                      .map(([mes, cantidad]) => {
                        const [year, month] = mes.split('-');
                        const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
                        const esMesActual = fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear();
                        const maxCantidad = Math.max(...Object.values(empresaData.estadisticas.participacionesPorMes));
                        
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
            </>
          )}

          {/* Sin estadísticas */}
          {!loading && !error && !empresaData?.estadisticas && (
            <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/20">
              <div className="text-center py-12">
                <BarChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <Typography variant="h5" color="secondary" className="mb-2">
                  Sin estadísticas disponibles
                </Typography>
                <Typography variant="body2" color="secondary">
                  Esta empresa aún no tiene estadísticas de participación.
                </Typography>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  };



    // Componente para el contenido del tab de Información de Participación
  const ParticipacionContent: React.FC<{ 
    participante: Participante; 
    empresa?: Empresa; 
    investigaciones: InvestigacionParticipante[];
    participacionesPorMes: Record<string, number>;
  }> = ({ participante, empresa, investigaciones, participacionesPorMes }) => {
    return (
      <div className="space-y-6">
        {/* Información de Participación */}
        <InfoContainer 
          title="Información de Participación"
          icon={<UserIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Responsable del Agendamiento" 
            value={
              (() => {
                console.log('🔍 === DEBUG RESPONSABLE ===');
                console.log('🔍 Reclutamiento actual:', reclutamientoActual);
                console.log('🔍 Investigaciones disponibles:', investigaciones.length);
                console.log('🔍 Usuarios disponibles:', usuarios.length);
                
                // Priorizar reclutamiento actual
                if (reclutamientoActual?.responsable) {
                  const responsable = usuarios.find(u => u.full_name === reclutamientoActual.responsable);
                  if (responsable) {
                    return (
                      <div className="flex items-center gap-2">
                        <SimpleAvatar 
                          src={responsable.avatar_url} 
                          fallbackText={responsable.full_name || 'Usuario'}
                          size="sm"
                        />
                        <span>{responsable.full_name}</span>
                      </div>
                    );
                  }
                  return reclutamientoActual.responsable;
                }
                
                // Fallback a investigaciones solo si no hay reclutamiento actual
                if (!reclutamientoActual && investigaciones.length > 0 && investigaciones[0].responsable) {
                  const responsable = usuarios.find(u => u.full_name === investigaciones[0].responsable);
                  if (responsable) {
                    return (
                      <div className="flex items-center gap-2">
                        <SimpleAvatar 
                          src={responsable.avatar_url} 
                          fallbackText={responsable.full_name || 'Usuario'}
                          size="sm"
                        />
                        <span>{responsable.full_name}</span>
                      </div>
                    );
                  }
                  return investigaciones[0].responsable;
                }
                
                return 'No asignado';
              })()
            }
          />
          <InfoItem 
            label="Fecha de la Sesión"
            value={
              (() => {
                console.log('🔍 === DEBUG FECHA ===');
                console.log('🔍 Reclutamiento actual fecha:', reclutamientoActual?.fecha_inicio);
                console.log('🔍 Investigación fecha:', investigaciones[0]?.fecha_participacion);
                
                // Priorizar reclutamiento actual
                if (reclutamientoActual?.fecha_inicio) {
                  return formatearFecha(reclutamientoActual.fecha_inicio);
                }
                
                // Fallback a investigaciones solo si no hay reclutamiento actual
                if (!reclutamientoActual && investigaciones.length > 0 && investigaciones[0].fecha_participacion) {
                  return formatearFecha(investigaciones[0].fecha_participacion);
                }
                
                return 'Sin sesiones programadas';
              })()
            }
          />
          <InfoItem 
            label="Hora de la Sesión"
            value={
              (() => {
                console.log('🔍 === DEBUG HORA ===');
                console.log('🔍 Reclutamiento actual hora:', reclutamientoActual?.hora_inicio);
                console.log('🔍 Investigación fecha para hora:', investigaciones[0]?.fecha_participacion);
                
                // Priorizar reclutamiento actual
                if (reclutamientoActual?.fecha_sesion) {
                  const fecha = new Date(reclutamientoActual.fecha_sesion);
                  return fecha.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                }
                
                // Fallback a investigaciones solo si no hay reclutamiento actual
                if (!reclutamientoActual && investigaciones.length > 0 && investigaciones[0].fecha_participacion) {
                  const fecha = new Date(investigaciones[0].fecha_participacion);
                  return fecha.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                }
                
                return '--:--';
              })()
            }
          />
          <InfoItem 
            label="Duración de la Sesión (minutos)"
            value={
              (() => {
                console.log('🔍 === DEBUG DURACIÓN ===');
                console.log('🔍 Reclutamiento actual duración:', reclutamientoActual?.duracion_sesion);
                console.log('🔍 Investigación duración:', investigaciones[0]?.duracion_sesion);
                
                // Priorizar reclutamiento actual
                if (reclutamientoActual?.duracion_sesion) {
                  return `${reclutamientoActual.duracion_sesion} minutos`;
                }
                
                // Fallback a investigaciones solo si no hay reclutamiento actual
                if (!reclutamientoActual && investigaciones.length > 0 && investigaciones[0].duracion_sesion) {
                  return `${investigaciones[0].duracion_sesion} minutos`;
                }
                
                return '60 minutos';
              })()
            }
          />
          <InfoItem 
            label="Tipo de Participante"
            value={
              <Chip 
                variant={getTipoParticipanteVariant(participante.tipo)} 
                size="sm"
              >
                {participante.tipo === 'externo' ? 'Externo' : 
                 participante.tipo === 'interno' ? 'Interno' : 
                 'Friend & Family'}
              </Chip>
            }
          />

          <InfoItem 
            label="Participante"
            value={participante.nombre}
          />
        </InfoContainer>

        
      </div>
    );
  };

  // Componente para el contenido del tab de Información
  const InformacionContent: React.FC<{ 
    participante: Participante; 
    empresa?: Empresa;
    investigaciones: InvestigacionParticipante[];
    participacionesPorMes: { [key: string]: number };
  }> = ({ participante, empresa, investigaciones, participacionesPorMes }) => {
    // Debug: Log de datos recibidos
    console.log('🔍 InformacionContent - investigaciones:', investigaciones);
    console.log('🔍 InformacionContent - participacionesPorMes:', participacionesPorMes);
    
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
    
    console.log('🔍 InformacionContent - Métricas calculadas:', {
      totalInvestigaciones,
      investigacionesFinalizadas,
      investigacionesEnProgreso,
      tiempoTotalHoras
    });

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
                variant={getEstadoChipVariant(participante.estado_participante)}
                size="sm"
              >
                {participante.estado_participante || 'Sin estado'}
              </Chip>
            }
          />
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
          </InfoContainer>
        )}

        {/* Información adicional de empresa */}
        {participante.tipo === 'externo' && empresa && (empresa.descripcion || empresa.direccion) && (
          <>
            {empresa.descripcion && (
              <InfoContainer 
                title="Descripción"
                icon={<FileTextIcon className="w-4 h-4" />}
                variant="bordered"
                padding="md"
              >
                <div className="col-span-full">
                  <Typography variant="body2" color="secondary">
                    {empresa.descripcion}
                  </Typography>
                </div>
              </InfoContainer>
            )}

            {empresa.direccion && (
              <InfoContainer 
                title="Dirección"
                icon={<BuildingIcon className="w-4 h-4" />}
                variant="bordered"
                padding="md"
              >
                <div className="col-span-full">
                  <Typography variant="body2" color="secondary">
                    {empresa.direccion}
                  </Typography>
                </div>
              </InfoContainer>
            )}
          </>
        )}

        {/* Información de Rol en Empresa (para participantes internos) */}
        {participante.tipo === 'interno' && (participante.rol_empresa || participante.departamento_nombre) && (
          <InfoContainer 
            title="Información Laboral"
            icon={<UsersIcon className="w-4 h-4" />}
          >
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
          </InfoContainer>
        )}
      </div>
    );
  };

  // Componente para el contenido del tab de Información de Reclutamiento
  const ReclutamientoContent: React.FC<{ reclutamiento: any; participante: Participante }> = ({ reclutamiento, participante }) => {
    // Función para obtener el nombre del usuario por ID
    const getNombreUsuario = (userId: string) => {
      if (!usuarios || !userId) return 'Usuario no encontrado';
      const usuario = usuarios.find(u => u.id === userId);
      return usuario ? usuario.nombre || usuario.full_name || 'Sin nombre' : 'Usuario no encontrado';
    };

    // Función para obtener el email del usuario por ID
    const getEmailUsuario = (userId: string) => {
      if (!usuarios || !userId) return 'Email no encontrado';
      const usuario = usuarios.find(u => u.id === userId);
      return usuario ? usuario.correo || usuario.email || 'Sin email' : 'Email no encontrado';
    };

    // Función para formatear la duración
    const formatearDuracion = (duracion: number) => {
      if (!duracion) return '0 min';
      if (duracion >= 60) {
        const horas = Math.floor(duracion / 60);
        const minutos = duracion % 60;
        return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
      }
      return `${duracion} min`;
    };

    if (!reclutamiento) {
      return (
        <EmptyState
          icon={<AlertTriangleIcon className="w-8 h-8" />}
          title="Sin información de reclutamiento"
          description="No hay información de reclutamiento disponible para este participante."
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Información del Reclutamiento */}
        <InfoContainer 
          title="Detalles del Reclutamiento"
          icon={<FileTextIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="ID del Reclutamiento"
            value={reclutamiento.id}
          />
          <InfoItem 
            label="Reclutador"
            value={
              <div className="flex items-center gap-2">
                <span>{getNombreUsuario(reclutamiento.reclutador_id)}</span>
                <Chip variant="secondary" size="sm">
                  {getEmailUsuario(reclutamiento.reclutador_id)}
                </Chip>
              </div>
            }
          />
          <InfoItem 
            label="Participante"
            value={participante.nombre}
          />
          <InfoItem 
            label="Email del Participante"
            value={participante.email || 'Sin email'}
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
            label="Fecha de Sesión"
            value={reclutamiento.fecha_sesion ? 
              formatearFecha(reclutamiento.fecha_sesion) : 
              'No programada'
            }
          />
          <InfoItem 
            label="Hora de Sesión"
            value={reclutamiento.hora_sesion ? 
              (() => {
                try {
                  let hora = reclutamiento.hora_sesion;
                  if (hora.match(/^\d{2}:\d{2}:\d{2}$/)) {
                    hora = `2000-01-01T${hora}`;
                  }
                  if (hora.match(/^\d{2}:\d{2}$/)) {
                    hora = `2000-01-01T${hora}:00`;
                  }
                  const fechaHora = new Date(hora);
                  if (isNaN(fechaHora.getTime())) {
                    return reclutamiento.hora_sesion;
                  }
                  return fechaHora.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch (error) {
                  return reclutamiento.hora_sesion;
                }
              })() : 
              'No definida'
            }
          />
          <InfoItem 
            label="Duración de Sesión"
            value={formatearDuracion(reclutamiento.duracion_sesion)}
          />
          <InfoItem 
            label="Estado de Agendamiento"
            value={
              <Chip 
                variant={getChipVariant(reclutamiento.estado_reclutamiento_nombre || '') as any}
                size="sm"
              >
                {reclutamiento.estado_reclutamiento_nombre || 'Sin estado'}
              </Chip>
            }
          />
          <InfoItem 
            label="Última Actualización"
            value={reclutamiento.updated_at ? 
              formatearFecha(reclutamiento.updated_at) : 
              'No disponible'
            }
          />
        </InfoContainer>
      </div>
    );
  };

  // useEffect para cargar datos cuando se monta el componente
  useEffect(() => {
    if (id) {
      console.log('🔍 useEffect ejecutándose con id:', id);
      cargarParticipante();
      cargarInvestigaciones();
      cargarDolores();
      cargarUsuarios();
    }
  }, [id]);

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
              onClick={() => {
                // Usar el reclutamiento actual para volver a la vista correcta
                if (reclutamientoActual?.id) {
                  router.push(`/reclutamiento/ver/${reclutamientoActual.id}`);
                } else if (investigaciones.length > 0 && investigaciones[0].reclutamiento_id) {
                  // Fallback: usar el reclutamiento_id de las investigaciones
                  router.push(`/reclutamiento/ver/${investigaciones[0].reclutamiento_id}`);
                } else {
                  // Fallback final: ir al home de reclutamientos
                  router.push('/reclutamiento');
                }
              }}
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
                label: reclutamientoActual?.estado_reclutamiento_nombre || 'Sin estado',
                variant: getChipVariant(reclutamientoActual?.estado_reclutamiento_nombre || 'default') as any,
                size: 'sm'
              }}
            />
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <ActionsMenu
              actions={[
                {
                  label: 'Editar Participación',
                  icon: <EditIcon className="w-4 h-4" />,
                  onClick: () => handleEditarParticipacion()
                },
                {
                  label: 'Eliminar Participación',
                  icon: <TrashIcon className="w-4 h-4" />,
                  onClick: () => handleEliminarParticipacion(),
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
              label: 'Información de Participante',
              content: <InformacionContent 
                participante={participante} 
                empresa={empresa} 
                investigaciones={investigaciones}
                participacionesPorMes={participacionesPorMes}
              />
              main.js?ts=1756964141757:1155 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
              supabase.ts:23 ✅ Usando Supabase real
              websocket.js:46 [HMR] connected
              hot-dev-client.js:197 [Fast Refresh] rebuilding
              hot-dev-client.js:166 [Fast Refresh] done in 83ms
              hot-dev-client.js:166 [Fast Refresh] done in 252ms
              supabase-seguimientos.ts:11 Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
              GoTrueClient @ GoTrueClient.js:85
              SupabaseAuthClient @ SupabaseAuthClient.js:9
              _initSupabaseAuthClient @ SupabaseClient.js:199
              SupabaseClient @ SupabaseClient.js:76
              createClient @ index.js:34
              eval @ supabase-seguimientos.ts:11
              ./src/api/supabase-seguimientos.ts @ %5Bid%5D.js?ts=1756964141757:94
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              fn @ webpack.js?ts=1756964141757:310
              eval @ supabase-investigaciones.ts:24
              ./src/api/supabase-investigaciones.ts @ %5Bid%5D.js?ts=1756964141757:72
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              fn @ webpack.js?ts=1756964141757:310
              eval @ CrearParticipanteExternoModal.tsx:11
              ./src/components/ui/CrearParticipanteExternoModal.tsx @ %5Bid%5D.js?ts=1756964141757:314
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              fn @ webpack.js?ts=1756964141757:310
              eval @ AgregarParticipanteModal.tsx:24
              ./src/components/ui/AgregarParticipanteModal.tsx @ %5Bid%5D.js?ts=1756964141757:149
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              fn @ webpack.js?ts=1756964141757:310
              eval @ index.ts:163
              ./src/components/ui/index.ts @ %5Bid%5D.js?ts=1756964141757:1062
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              fn @ webpack.js?ts=1756964141757:310
              eval @ [id].tsx:12
              ./src/pages/reclutamiento/ver/[id].tsx @ %5Bid%5D.js?ts=1756964141757:1095
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              fn @ webpack.js?ts=1756964141757:310
              eval @ next-client-pages-loader.js?absolutePagePath=%2FUsers%2Felkinmac%2FDocuments%2Fcentral-de-creadores%2Fsrc%2Fpages%2Freclutamiento%2Fver%2F%5Bid%5D.tsx&page=%2Freclutamiento%2Fver%2F%5Bid%5D!:5
              eval @ route-loader.js:211
              Promise.then
              onEntrypoint @ route-loader.js:211
              register @ index.js:159
              eval @ next-client-pages-loader.js?absolutePagePath=%2FUsers%2Felkinmac%2FDocuments%2Fcentral-de-creadores%2Fsrc%2Fpages%2Freclutamiento%2Fver%2F%5Bid%5D.tsx&page=%2Freclutamiento%2Fver%2F%5Bid%5D!:2
              ./node_modules/next/dist/build/webpack/loaders/next-client-pages-loader.js?absolutePagePath=%2FUsers%2Felkinmac%2FDocuments%2Fcentral-de-creadores%2Fsrc%2Fpages%2Freclutamiento%2Fver%2F%5Bid%5D.tsx&page=%2Freclutamiento%2Fver%2F%5Bid%5D! @ %5Bid%5D.js?ts=1756964141757:17
              options.factory @ webpack.js?ts=1756964141757:655
              __webpack_require__ @ webpack.js?ts=1756964141757:37
              __webpack_exec__ @ %5Bid%5D.js?ts=1756964141757:7534
              (anonymous) @ %5Bid%5D.js?ts=1756964141757:7535
              __webpack_require__.O @ webpack.js?ts=1756964141757:86
              (anonymous) @ %5Bid%5D.js?ts=1756964141757:7536
              webpackJsonpCallback @ webpack.js?ts=1756964141757:1203
              (anonymous) @ %5Bid%5D.js?ts=1756964141757:9Understand this warning
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              Layout.tsx:43 🔍 Layout - useEffect inicialización
              Layout.tsx:48 Sidebar initial state: false
              Layout.tsx:60 🔍 Layout - useEffect rol: {rol: '', rolSeleccionado: ''}
              Layout.tsx:69 🔍 Layout - Ruta cambiada: /reclutamiento/ver/[id]
              Layout.tsx:75 🔍 Layout - useEffect sidebarCollapsed: {sidebarCollapsed: false}
              [id].tsx:278 🔄 Estado de participantes cambiado: 0 participantes
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              Layout.tsx:60 🔍 Layout - useEffect rol: {rol: 'administrador', rolSeleccionado: 'administrador'}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              Layout.tsx:69 🔍 Layout - Ruta cambiada: /reclutamiento/ver/df0a0338-fc66-4d15-bf63-1c6e82827386
              [id].tsx:271 🔄 ID disponible, cargando participantes: df0a0338-fc66-4d15-bf63-1c6e82827386
              [id].tsx:179 🔄 Cargando participantes...
              [id].tsx:180 🔍 ID usado para cargar: df0a0338-fc66-4d15-bf63-1c6e82827386
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              SimpleAvatar.tsx:68 🔍 SimpleAvatar para Elkin: {src: 'https://eloncaptettdvrvwypji.supabase.co/storage/v…s/e1d4eb8b-83ae-4acc-9d31-6cedc776b64d/avatar.png', trimmedSrc: 'https://eloncaptettdvrvwypji.supabase.co/storage/v…s/e1d4eb8b-83ae-4acc-9d31-6cedc776b64d/avatar.png', fallbackText: 'Elkin Garcia '}
              SimpleAvatar.tsx:92 🔄 Precargando imagen para Elkin: https://eloncaptettdvrvwypji.supabase.co/storage/v1/object/public/avatars/usuarios/e1d4eb8b-83ae-4acc-9d31-6cedc776b64d/avatar.png
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              SimpleAvatar.tsx:107 ✅ Imagen cargada exitosamente para Elkin
              [id].tsx:198 📊 Participantes cargados: {participantes: Array(5), total: 5}
              [id].tsx:199 🔍 Número de participantes: 5
              [id].tsx:204 🔍 Participante 1 - prueba 12344: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '18:14:00', reclutamiento_id: '846021f4-b76d-4b29-b41d-d210095bdd2a'}
              [id].tsx:213 🎯 PARTICIPANTE ESPECÍFICO - prueba 12344: {hora_sesion: '18:14:00', hora_sesion_tipo: 'string', hora_sesion_es_null: false, hora_sesion_es_undefined: false}
              [id].tsx:204 🔍 Participante 2 - prueba 12344: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '14:17:00', reclutamiento_id: 'de8f32a2-eb05-4ca9-92b9-64bebadbbb81'}
              [id].tsx:213 🎯 PARTICIPANTE ESPECÍFICO - prueba 12344: {hora_sesion: '14:17:00', hora_sesion_tipo: 'string', hora_sesion_es_null: false, hora_sesion_es_undefined: false}
              [id].tsx:204 🔍 Participante 3 - prueba 0000: {id: '30803140-e7ee-46ab-a511-4dba02c61566', nombre: 'prueba 0000', hora_sesion: '23:48:00', reclutamiento_id: '89abf2ad-dae3-43e8-9c66-3e8660bb0b77'}
              [id].tsx:204 🔍 Participante 4 - prueba email: {id: '9839dcad-f74a-440c-a68f-b0592eced0a0', nombre: 'prueba email', hora_sesion: '00:40:00', reclutamiento_id: '753b106f-10bd-4c17-a7d9-dda92752ee5f'}
              [id].tsx:204 🔍 Participante 5 - padre p: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', hora_sesion: '01:02:00', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200'}
              [id].tsx:226 🔄 Estado actualizado con participantes: 5
              [id].tsx:338 DEBUG actualización de estados: {success: true, message: 'Estados actualizados exitosamente', actualizados: 3, sinCambios: 13, total: 16, …}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:278 🔄 Estado de participantes cambiado: 5 participantes
              [id].tsx:280 🔍 Participante 1: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '18:14:00'}
              [id].tsx:280 🔍 Participante 2: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '14:17:00'}
              [id].tsx:280 🔍 Participante 3: {id: '30803140-e7ee-46ab-a511-4dba02c61566', nombre: 'prueba 0000', hora_sesion: '23:48:00'}
              [id].tsx:280 🔍 Participante 4: {id: '9839dcad-f74a-440c-a68f-b0592eced0a0', nombre: 'prueba email', hora_sesion: '00:40:00'}
              [id].tsx:280 🔍 Participante 5: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', hora_sesion: '01:02:00'}
              [id].tsx:230 🔍 Estado actual después de setParticipantes: []
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:45.761Z'}
              AgregarParticipanteModal.tsx:162 🔍 useEffect enfriamiento ejecutándose: {tipoParticipante: 'externo', participanteId: ''}
              AgregarParticipanteModal.tsx:201 🔍 No se ejecuta enfriamiento: {tipoParticipante: 'externo', participanteId: ''}
              AsignarAgendamientoModal.tsx:81 🔍 useEffect responsableActual: {isOpen: false, isEditMode: false, responsableActual: null, responsablesLength: 0, responsables: Array(0)}
              AsignarAgendamientoModal.tsx:131 🔍 No se precarga responsable - razón: {isOpen: false, isEditMode: false, responsableActual: null, responsablesLength: 0, razon: 'modal cerrado'}
              supabase-investigaciones.ts:472 🔍 Obteniendo investigación por ID: df0a0338-fc66-4d15-bf63-1c6e82827386
              [id].tsx:179 🔄 Cargando participantes...
              [id].tsx:180 🔍 ID usado para cargar: df0a0338-fc66-4d15-bf63-1c6e82827386
              supabase-investigaciones.ts:493 ✅ Investigación base obtenida: prueba ivestigacion nueva
              supabase-investigaciones.ts:496 🔄 Enriqueciendo datos con consultas separadas...
              fetch.js:30  GET https://eloncaptettdvrvwypji.supabase.co/rest/v1/periodo?select=id%2Cnombre%2Cetiqueta 400 (Bad Request)
              eval @ fetch.js:30
              eval @ fetch.js:51
              fulfilled @ fetch.js:11
              Promise.then
              step @ fetch.js:13
              eval @ fetch.js:14
              __awaiter @ fetch.js:10
              eval @ fetch.js:41
              then @ PostgrestBuilder.js:66Understand this error
              supabase-investigaciones.ts:602 ✅ Investigación formateada exitosamente
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:46.481Z'}
              supabase-libretos.ts:333 🔍 Buscando libreto para investigación: df0a0338-fc66-4d15-bf63-1c6e82827386
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: true
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:46.496Z'}
              [id].tsx:338 DEBUG actualización de estados: {success: true, message: 'Estados actualizados exitosamente', actualizados: 3, sinCambios: 13, total: 16, …}
              [id].tsx:198 📊 Participantes cargados: {participantes: Array(5), total: 5}
              [id].tsx:199 🔍 Número de participantes: 5
              [id].tsx:204 🔍 Participante 1 - prueba 12344: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '18:14:00', reclutamiento_id: '846021f4-b76d-4b29-b41d-d210095bdd2a'}
              [id].tsx:213 🎯 PARTICIPANTE ESPECÍFICO - prueba 12344: {hora_sesion: '18:14:00', hora_sesion_tipo: 'string', hora_sesion_es_null: false, hora_sesion_es_undefined: false}
              [id].tsx:204 🔍 Participante 2 - prueba 12344: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '14:17:00', reclutamiento_id: 'de8f32a2-eb05-4ca9-92b9-64bebadbbb81'}
              [id].tsx:213 🎯 PARTICIPANTE ESPECÍFICO - prueba 12344: {hora_sesion: '14:17:00', hora_sesion_tipo: 'string', hora_sesion_es_null: false, hora_sesion_es_undefined: false}
              [id].tsx:204 🔍 Participante 3 - prueba 0000: {id: '30803140-e7ee-46ab-a511-4dba02c61566', nombre: 'prueba 0000', hora_sesion: '23:48:00', reclutamiento_id: '89abf2ad-dae3-43e8-9c66-3e8660bb0b77'}
              [id].tsx:204 🔍 Participante 4 - prueba email: {id: '9839dcad-f74a-440c-a68f-b0592eced0a0', nombre: 'prueba email', hora_sesion: '00:40:00', reclutamiento_id: '753b106f-10bd-4c17-a7d9-dda92752ee5f'}
              [id].tsx:204 🔍 Participante 5 - padre p: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', hora_sesion: '01:02:00', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200'}
              [id].tsx:226 🔄 Estado actualizado con participantes: 5
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: true
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:46.526Z'}
              [id].tsx:278 🔄 Estado de participantes cambiado: 5 participantes
              [id].tsx:280 🔍 Participante 1: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '18:14:00'}
              [id].tsx:280 🔍 Participante 2: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '14:17:00'}
              [id].tsx:280 🔍 Participante 3: {id: '30803140-e7ee-46ab-a511-4dba02c61566', nombre: 'prueba 0000', hora_sesion: '23:48:00'}
              [id].tsx:280 🔍 Participante 4: {id: '9839dcad-f74a-440c-a68f-b0592eced0a0', nombre: 'prueba email', hora_sesion: '00:40:00'}
              [id].tsx:280 🔍 Participante 5: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', hora_sesion: '01:02:00'}
              [id].tsx:230 🔍 Estado actual después de setParticipantes: (5) [{…}, {…}, {…}, {…}, {…}]
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: false loadingLibreto: true
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:46.675Z'}
              supabase-libretos.ts:88 🔍 Iniciando consulta a roles_empresa...
              supabase-libretos.ts:216 🔍 Iniciando consulta a modalidades...
              supabase-libretos.ts:261 🔍 Iniciando consulta a tamano_empresa...
              supabase-libretos.ts:43 🔍 Iniciando consulta a tipos_prueba_cat...
              supabase-libretos.ts:171 �� Iniciando consulta a paises...
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: true
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 0, rolesEmpresa: 0, industrias: 0, modalidades: 0, tamanosEmpresa: 0}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:46.723Z'}
              supabase-libretos.ts:95 📊 Resultado de la consulta roles_empresa: {data: Array(100), error: null, dataLength: 100, dataType: 'object', isArray: true, …}
              supabase-libretos.ts:131 ✅ Roles de empresa cargados exitosamente: 100 roles
              supabase-libretos.ts:132 ✅ Primeros 3 roles: (3) [{…}, {…}, {…}]
              supabase-libretos.ts:50 📊 Resultado de la consulta tipos_prueba_cat: {data: Array(2), error: null, dataLength: 2, dataType: 'object', isArray: true}
              supabase-libretos.ts:71 ✅ Tipos de prueba cargados exitosamente: 2 tipos
              supabase-libretos.ts:72 ✅ Datos de tipos de prueba: (2) [{…}, {…}]
              supabase-libretos.ts:223 📊 Resultado de la consulta modalidades: {data: Array(3), error: null, dataLength: 3, dataType: 'object', isArray: true}
              supabase-libretos.ts:244 ✅ Modalidades cargadas exitosamente: 3 modalidades
              supabase-libretos.ts:245 ✅ Datos de modalidades: (3) [{…}, {…}, {…}]
              supabase-libretos.ts:178 📊 Resultado de la consulta paises: {data: Array(17), error: null, dataLength: 17, dataType: 'object', isArray: true}
              supabase-libretos.ts:199 ✅ Países cargados exitosamente: 17 países
              supabase-libretos.ts:200 ✅ Primeros 5 países: (5) [{…}, {…}, {…}, {…}, {…}]
              supabase-libretos.ts:268 📊 Resultado de la consulta tamano_empresa: {data: Array(3), error: null, dataLength: 3, dataType: 'object', isArray: true, …}
              supabase-libretos.ts:304 ✅ Tamaños de empresa cargados exitosamente: 3 tamaños
              supabase-libretos.ts:305 ✅ Datos de tamaños de empresa: (3) [{…}, {…}, {…}]
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:46.948Z'}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:47.184Z'}
              [id].tsx:477 🔍 INICIANDO handleEditParticipante con participante: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', nombre: 'padre p', email: 'padre@gmail.com', tipo: 'friend_family', …}
              [id].tsx:478 🔍 Nombre del participante: padre p
              [id].tsx:479 🔍 Estado agendamiento: En progreso
              [id].tsx:482 🔍 reclutamientoId obtenido: fa1dc511-f7b8-4248-bcda-c5382d4ae200
              [id].tsx:496 🔍 === DEBUG LÓGICA PENDIENTE ===
              [id].tsx:497 🔍 Tipo participante: friend_family
              [id].tsx:498 🔍 Estado agendamiento: En progreso
              [id].tsx:499 🔍 Nombre participante: padre p
              [id].tsx:500 🔍 Email participante: padre@gmail.com
              [id].tsx:501 🔍 Es pendiente de agendamiento: false
              [id].tsx:503 🔍 esPendienteDeAgendamiento: false
              [id].tsx:504 🔍 Estado agendamiento: En progreso
              [id].tsx:505 🔍 Fecha sesión: 2025-08-16T06:02:00+00:00
              [id].tsx:506 🔍 Tipo participante: friend_family
              [id].tsx:563 🔍 Debug handleEditParticipante - participante: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', nombre: 'padre p', email: 'padre@gmail.com', tipo: 'friend_family', …}
              [id].tsx:564 🔍 Debug handleEditParticipante - reclutamientoId: fa1dc511-f7b8-4248-bcda-c5382d4ae200
              [id].tsx:567 🔍 Response status: 200
              [id].tsx:571 🔍 Debug handleEditParticipante - debugData: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386', participantes_id: null, fecha_asignado: '2025-08-16T06:02:10.228306+00:00', fecha_sesion: '2025-08-16T06:02:00+00:00', …}
              [id].tsx:589 🔍 Debug handleEditParticipante - reclutamientoData: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', participantes_id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', fecha_sesion: '2025-08-16T06:02:00+00:00', investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386', …}
              [id].tsx:590 🔍 Configurando modal de edición...
              [id].tsx:593 🔍 Modal configurado, showEditModal debería ser true
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: []
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: []
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:35:49.178Z'}
              timezone.ts:220 🌍 === INFORMACIÓN DE ZONA HORARIA ===
              timezone.ts:221 📍 Zona horaria: America/Bogota
              timezone.ts:222 🌍 País: Colombia
              timezone.ts:223 🏙️ Ciudad: Bogotá
              timezone.ts:224 ⏰ Offset (minutos): 300
              timezone.ts:225 📅 Fecha actual: 2025-09-04
              timezone.ts:226 🕐 Hora actual: 00:35
              timezone.ts:227 📊 Fecha completa: 4/9/2025, 0:35:49
              timezone.ts:228 =====================================
              EditarReclutamientoModal.tsx:83 🔍 Debug EditarReclutamientoModal - reclutamiento: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', participantes_id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', fecha_sesion: '2025-08-16T06:02:00+00:00', investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386', …}
              EditarReclutamientoModal.tsx:95 🔍 === DEBUG FECHA Y HORA ===
              EditarReclutamientoModal.tsx:96 🔍 Fecha sesión recibida: 2025-08-16T06:02:00+00:00
              EditarReclutamientoModal.tsx:97 🔍 Fecha parseada: Sat Aug 16 2025 01:02:00 GMT-0500 (Colombia Standard Time)
              EditarReclutamientoModal.tsx:98 🔍 Hora UTC original: 01:02:00 GMT-0500 (Colombia Standard Time)
              EditarReclutamientoModal.tsx:99 🔍 Hora local: 1:02:00 AM
              EditarReclutamientoModal.tsx:105 🔍 Hora establecida en modal: 01:02
              EditarReclutamientoModal.tsx:113 🔍 === DEBUG DURACIÓN ===
              EditarReclutamientoModal.tsx:114 🔍 Duración recibida: 60
              EditarReclutamientoModal.tsx:115 🔍 Tipo de duración: number
              EditarReclutamientoModal.tsx:118 🔍 Duración establecida en modal: 60
              EditarReclutamientoModal.tsx:121 🔍 Debug - participanteId establecido: a0c3872b-ecd2-4479-9320-41d73b1c98ca
              EditarReclutamientoModal.tsx:150 🔍 No se puede sincronizar responsableId: {isOpen: true, responsables_length: 0, reclutamiento_reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'}
              EditarReclutamientoModal.tsx:161 🔍 useEffect enfriamiento ejecutándose: {tipoParticipante: 'externo', participanteId: ''}
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: []
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: []
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:161 🔍 useEffect enfriamiento ejecutándose: {tipoParticipante: 'friend_family', participanteId: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca'}
              EditarReclutamientoModal.tsx:219 🔍 Usuarios responsables cargados: 17
              EditarReclutamientoModal.tsx:220 🔍 Muestra de usuarios: (3) [{…}, {…}, {…}]
              EditarReclutamientoModal.tsx:221 🔍 Estructura completa del primer usuario: {id: '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6', full_name: 'a', email: 'a@gmail.com', avatar_url: 'https://eloncaptettdvrvwypji.supabase.co/storage/v…s/9b1ef1eb-fdb4-410f-ab22-bfedc68294d6/avatar.png', roles: Array(2)}
              EditarReclutamientoModal.tsx:222 🔍 Campos disponibles: (5) ['id', 'full_name', 'email', 'avatar_url', 'roles']
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:133 🔍 Sincronizando responsableId: {reclutamiento_reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', responsables_disponibles: Array(17), responsable_encontrado: {…}, total_responsables: 17}
              EditarReclutamientoModal.tsx:142 ✅ ResponsableId establecido: 5ff1169b-f725-4a8c-bc5d-0bead2c87afc
              2EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:257 🔍 Debug - participanteId: a0c3872b-ecd2-4479-9320-41d73b1c98ca
              EditarReclutamientoModal.tsx:258 🔍 Debug - participantesDisponibles: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
              EditarReclutamientoModal.tsx:259 🔍 Debug - participanteEncontrado: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', email: 'padre@gmail.com', departamento_id: '1c9dd717-5047-4f37-ba0d-b28487b3e737', departamento: 'Dirección General', …}
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:280 🔍 === DEBUG ENVÍO ===
              EditarReclutamientoModal.tsx:281 📅 Fecha seleccionada: 2025-09-05
              EditarReclutamientoModal.tsx:282 🕐 Hora seleccionada: 01:00
              EditarReclutamientoModal.tsx:283 📤 Fecha UTC enviada: 2025-09-05T06:00:00.000Z
              EditarReclutamientoModal.tsx:297 🔍 Modal: Usando función onSave de la página principal
              EditarReclutamientoModal.tsx:298 🔍 Modal: Datos a enviar: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', participantes_id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', fecha_sesion: '2025-09-05T06:00:00.000Z', hora_sesion: '01:00', …}
              [id].tsx:646 🔍 INICIANDO handleSaveEditParticipante con datos: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', participantes_id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', fecha_sesion: '2025-09-05T06:00:00.000Z', hora_sesion: '01:00', …}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:00.772Z'}
              [id].tsx:648  PUT http://localhost:3000/api/reclutamientos/fa1dc511-f7b8-4248-bcda-c5382d4ae200 500 (Internal Server Error)
              handleSaveEditParticipante @ [id].tsx:648
              handleSubmit @ EditarReclutamientoModal.tsx:300
              callCallback @ react-dom.development.js:4164
              invokeGuardedCallbackDev @ react-dom.development.js:4213
              invokeGuardedCallback @ react-dom.development.js:4277
              invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
              executeDispatch @ react-dom.development.js:9041
              processDispatchQueueItemsInOrder @ react-dom.development.js:9073
              processDispatchQueue @ react-dom.development.js:9086
              dispatchEventsForPlugins @ react-dom.development.js:9097
              eval @ react-dom.development.js:9288
              batchedUpdates$1 @ react-dom.development.js:26174
              batchedUpdates @ react-dom.development.js:3991
              dispatchEventForPluginEventSystem @ react-dom.development.js:9287
              dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
              dispatchEvent @ react-dom.development.js:6457
              dispatchDiscreteEvent @ react-dom.development.js:6430Understand this error
              [id].tsx:656 🔍 Response status: 500
              [id].tsx:669 ❌ Error actualizando reclutamiento: Internal Server Error
              console.error @ client.js:2
              window.console.error @ setup-hydration-warning.js:18
              handleSaveEditParticipante @ [id].tsx:669
              await in handleSaveEditParticipante
              handleSubmit @ EditarReclutamientoModal.tsx:300
              callCallback @ react-dom.development.js:4164
              invokeGuardedCallbackDev @ react-dom.development.js:4213
              invokeGuardedCallback @ react-dom.development.js:4277
              invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
              executeDispatch @ react-dom.development.js:9041
              processDispatchQueueItemsInOrder @ react-dom.development.js:9073
              processDispatchQueue @ react-dom.development.js:9086
              dispatchEventsForPlugins @ react-dom.development.js:9097
              eval @ react-dom.development.js:9288
              batchedUpdates$1 @ react-dom.development.js:26174
              batchedUpdates @ react-dom.development.js:3991
              dispatchEventForPluginEventSystem @ react-dom.development.js:9287
              dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
              dispatchEvent @ react-dom.development.js:6457
              dispatchDiscreteEvent @ react-dom.development.js:6430Understand this error
              EditarReclutamientoModal.tsx:301 🔍 Modal: onSave completado exitosamente
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:00.975Z'}
              [id].tsx:179 🔄 Cargando participantes...
              [id].tsx:180 🔍 ID usado para cargar: df0a0338-fc66-4d15-bf63-1c6e82827386
              [id].tsx:338 DEBUG actualización de estados: {success: true, message: 'Estados actualizados exitosamente', actualizados: 3, sinCambios: 13, total: 16, …}
              [id].tsx:198 📊 Participantes cargados: {participantes: Array(5), total: 5}
              [id].tsx:199 🔍 Número de participantes: 5
              [id].tsx:204 🔍 Participante 1 - prueba 12344: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '18:14:00', reclutamiento_id: '846021f4-b76d-4b29-b41d-d210095bdd2a'}
              [id].tsx:213 🎯 PARTICIPANTE ESPECÍFICO - prueba 12344: {hora_sesion: '18:14:00', hora_sesion_tipo: 'string', hora_sesion_es_null: false, hora_sesion_es_undefined: false}
              [id].tsx:204 🔍 Participante 2 - prueba 12344: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '14:17:00', reclutamiento_id: 'de8f32a2-eb05-4ca9-92b9-64bebadbbb81'}
              [id].tsx:213 🎯 PARTICIPANTE ESPECÍFICO - prueba 12344: {hora_sesion: '14:17:00', hora_sesion_tipo: 'string', hora_sesion_es_null: false, hora_sesion_es_undefined: false}
              [id].tsx:204 🔍 Participante 3 - prueba 0000: {id: '30803140-e7ee-46ab-a511-4dba02c61566', nombre: 'prueba 0000', hora_sesion: '23:48:00', reclutamiento_id: '89abf2ad-dae3-43e8-9c66-3e8660bb0b77'}
              [id].tsx:204 🔍 Participante 4 - prueba email: {id: '9839dcad-f74a-440c-a68f-b0592eced0a0', nombre: 'prueba email', hora_sesion: '00:40:00', reclutamiento_id: '753b106f-10bd-4c17-a7d9-dda92752ee5f'}
              [id].tsx:204 🔍 Participante 5 - padre p: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', hora_sesion: '01:02:00', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200'}
              [id].tsx:226 🔄 Estado actualizado con participantes: 5
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:01.949Z'}
              [id].tsx:278 🔄 Estado de participantes cambiado: 5 participantes
              [id].tsx:280 🔍 Participante 1: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '18:14:00'}
              [id].tsx:280 🔍 Participante 2: {id: '9155b800-f786-46d7-9294-bb385434d042', nombre: 'prueba 12344', hora_sesion: '14:17:00'}
              [id].tsx:280 🔍 Participante 3: {id: '30803140-e7ee-46ab-a511-4dba02c61566', nombre: 'prueba 0000', hora_sesion: '23:48:00'}
              [id].tsx:280 🔍 Participante 4: {id: '9839dcad-f74a-440c-a68f-b0592eced0a0', nombre: 'prueba email', hora_sesion: '00:40:00'}
              [id].tsx:280 🔍 Participante 5: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', hora_sesion: '01:02:00'}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:02.045Z'}
              [id].tsx:230 🔍 Estado actual después de setParticipantes: (5) [{…}, {…}, {…}, {…}, {…}]
              [id].tsx:477 🔍 INICIANDO handleEditParticipante con participante: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', nombre: 'padre p', email: 'padre@gmail.com', tipo: 'friend_family', …}
              [id].tsx:478 🔍 Nombre del participante: padre p
              [id].tsx:479 🔍 Estado agendamiento: En progreso
              [id].tsx:482 🔍 reclutamientoId obtenido: fa1dc511-f7b8-4248-bcda-c5382d4ae200
              [id].tsx:496 🔍 === DEBUG LÓGICA PENDIENTE ===
              [id].tsx:497 🔍 Tipo participante: friend_family
              [id].tsx:498 🔍 Estado agendamiento: En progreso
              [id].tsx:499 🔍 Nombre participante: padre p
              [id].tsx:500 🔍 Email participante: padre@gmail.com
              [id].tsx:501 🔍 Es pendiente de agendamiento: false
              [id].tsx:503 🔍 esPendienteDeAgendamiento: false
              [id].tsx:504 🔍 Estado agendamiento: En progreso
              [id].tsx:505 🔍 Fecha sesión: 2025-08-16T06:02:00+00:00
              [id].tsx:506 🔍 Tipo participante: friend_family
              [id].tsx:563 🔍 Debug handleEditParticipante - participante: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutamiento_id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', nombre: 'padre p', email: 'padre@gmail.com', tipo: 'friend_family', …}
              [id].tsx:564 🔍 Debug handleEditParticipante - reclutamientoId: fa1dc511-f7b8-4248-bcda-c5382d4ae200
              [id].tsx:567 🔍 Response status: 200
              [id].tsx:571 🔍 Debug handleEditParticipante - debugData: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386', participantes_id: null, fecha_asignado: '2025-08-16T06:02:10.228306+00:00', fecha_sesion: '2025-08-16T06:02:00+00:00', …}
              [id].tsx:589 🔍 Debug handleEditParticipante - reclutamientoData: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', participantes_id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', fecha_sesion: '2025-08-16T06:02:00+00:00', investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386', …}
              [id].tsx:590 🔍 Configurando modal de edición...
              [id].tsx:593 🔍 Modal configurado, showEditModal debería ser true
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: []
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: []
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:04.098Z'}
              timezone.ts:220 🌍 === INFORMACIÓN DE ZONA HORARIA ===
              timezone.ts:221 📍 Zona horaria: America/Bogota
              timezone.ts:222 🌍 País: Colombia
              timezone.ts:223 🏙️ Ciudad: Bogotá
              timezone.ts:224 ⏰ Offset (minutos): 300
              timezone.ts:225 📅 Fecha actual: 2025-09-04
              timezone.ts:226 🕐 Hora actual: 00:36
              timezone.ts:227 📊 Fecha completa: 4/9/2025, 0:36:04
              timezone.ts:228 =====================================
              EditarReclutamientoModal.tsx:83 🔍 Debug EditarReclutamientoModal - reclutamiento: {id: 'fa1dc511-f7b8-4248-bcda-c5382d4ae200', participantes_id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', fecha_sesion: '2025-08-16T06:02:00+00:00', investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386', …}
              EditarReclutamientoModal.tsx:95 🔍 === DEBUG FECHA Y HORA ===
              EditarReclutamientoModal.tsx:96 🔍 Fecha sesión recibida: 2025-08-16T06:02:00+00:00
              EditarReclutamientoModal.tsx:97 🔍 Fecha parseada: Sat Aug 16 2025 01:02:00 GMT-0500 (Colombia Standard Time)
              EditarReclutamientoModal.tsx:98 🔍 Hora UTC original: 01:02:00 GMT-0500 (Colombia Standard Time)
              EditarReclutamientoModal.tsx:99 🔍 Hora local: 1:02:00 AM
              EditarReclutamientoModal.tsx:105 🔍 Hora establecida en modal: 01:02
              EditarReclutamientoModal.tsx:113 🔍 === DEBUG DURACIÓN ===
              EditarReclutamientoModal.tsx:114 🔍 Duración recibida: 60
              EditarReclutamientoModal.tsx:115 🔍 Tipo de duración: number
              EditarReclutamientoModal.tsx:118 🔍 Duración establecida en modal: 60
              EditarReclutamientoModal.tsx:121 🔍 Debug - participanteId establecido: a0c3872b-ecd2-4479-9320-41d73b1c98ca
              EditarReclutamientoModal.tsx:150 🔍 No se puede sincronizar responsableId: {isOpen: true, responsables_length: 0, reclutamiento_reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'}
              EditarReclutamientoModal.tsx:161 🔍 useEffect enfriamiento ejecutándose: {tipoParticipante: 'externo', participanteId: ''}
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: []
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: []
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:161 🔍 useEffect enfriamiento ejecutándose: {tipoParticipante: 'friend_family', participanteId: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca'}
              EditarReclutamientoModal.tsx:219 🔍 Usuarios responsables cargados: 17
              EditarReclutamientoModal.tsx:220 🔍 Muestra de usuarios: (3) [{…}, {…}, {…}]
              EditarReclutamientoModal.tsx:221 🔍 Estructura completa del primer usuario: {id: '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6', full_name: 'a', email: 'a@gmail.com', avatar_url: 'https://eloncaptettdvrvwypji.supabase.co/storage/v…s/9b1ef1eb-fdb4-410f-ab22-bfedc68294d6/avatar.png', roles: Array(2)}
              EditarReclutamientoModal.tsx:222 🔍 Campos disponibles: (5) ['id', 'full_name', 'email', 'avatar_url', 'roles']
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:133 🔍 Sincronizando responsableId: {reclutamiento_reclutador_id: '5ff1169b-f725-4a8c-bc5d-0bead2c87afc', responsables_disponibles: Array(17), responsable_encontrado: {…}, total_responsables: 17}
              EditarReclutamientoModal.tsx:142 ✅ ResponsableId establecido: 5ff1169b-f725-4a8c-bc5d-0bead2c87afc
              2EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 0 filtered: 0 isOpen: false
              EditarReclutamientoModal.tsx:58 🔍 Modal: onSave recibido: true
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: title-only
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: undefined
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: 
              UserSelectorWithAvatar.tsx:48 🔍 UserSelectorWithAvatar - users recibidos: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              UserSelectorWithAvatar.tsx:51 🔍 UserSelectorWithAvatar - usuarios filtrados: (17) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
              Select.tsx:68 🔍 Select options: 3 filtered: 3 isOpen: false
              Select.tsx:68 🔍 Select options: 6 filtered: 6 isOpen: false
              EditarReclutamientoModal.tsx:257 🔍 Debug - participanteId: a0c3872b-ecd2-4479-9320-41d73b1c98ca
              EditarReclutamientoModal.tsx:258 🔍 Debug - participantesDisponibles: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
              EditarReclutamientoModal.tsx:259 🔍 Debug - participanteEncontrado: {id: 'a0c3872b-ecd2-4479-9320-41d73b1c98ca', nombre: 'padre p', email: 'padre@gmail.com', departamento_id: '1c9dd717-5047-4f37-ba0d-b28487b3e737', departamento: 'Dirección General', …}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:06.306Z'}
              [id].tsx:1856 🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto: true loadingLibreto: false
              [id].tsx:1857 🔍 Catálogos cargados en reclutamiento: {plataformas: 6, rolesEmpresa: 100, industrias: 17, modalidades: 3, tamanosEmpresa: 3}
              [id].tsx:2561 🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento: null
              [id].tsx:2562 🔍 Modal AsignarAgendamientoModal - responsableActual: null
              [id].tsx:2563 🔍 Modal AsignarAgendamientoModal - reclutador objeto: undefined
              [id].tsx:2564 🔍 Modal AsignarAgendamientoModal - reclutador_id: undefined
              PageHeader.tsx:124 🔍 DEBUG PageHeader - variant: compact
              PageHeader.tsx:125 🔍 DEBUG PageHeader - className recibido: mb-0
              PageHeader.tsx:126 🔍 DEBUG PageHeader - className final: mb-0
              AgregarParticipanteModal.tsx:501 🔍 DEBUG AgregarParticipanteModal - Renderizando modal
              AgregarParticipanteModal.tsx:502 🔍 DEBUG - isOpen: false
              AgregarParticipanteModal.tsx:503 🔍 DEBUG - SideModal props: {isOpen: false, width: 'lg', showCloseButton: false}
              AgregarParticipanteModal.tsx:504 🔍 DEBUG - Header className: mb-0 -mx-6 -mt-6
              AgregarParticipanteModal.tsx:505 🔍 DEBUG - Header estructura: div con -mx-6 -mt-6
              AgregarParticipanteModal.tsx:708 🔍 Debug participante seleccionado: {participanteId: '', tipoParticipante: 'externo', participante: undefined, estado_calculado: undefined, tiene_mensaje: undefined}
              AsignarAgendamientoModal.tsx:57 🔍 AsignarAgendamientoModal RENDERIZADO - props: {isOpen: false, isEditMode: false, reclutamientoId: null, responsableActual: null, timestamp: '2025-09-04T05:36:06.345Z'}            },
            {
              id: 'reclutamiento',
              label: 'Información de Reclutamiento',
              content: <ReclutamientoContent reclutamiento={reclutamientoActual} participante={participante} />
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
               id: 'perfilamientos',
               label: 'Perfilamiento',
               content: (
                 <PerfilamientosTab
                   participanteId={id as string}
                   participanteNombre={participante?.nombre || ''}
                   usuarios={usuarios}
                 />
               )
             },
             {
               id: 'empresa-informacion',
               label: 'Información Empresa',
               content: (
                 <div className="space-y-6">
                   {empresa && participante?.tipo === 'externo' ? (
                     <>
                       {/* Descripción */}
                       {(empresaData?.descripcion || empresa.descripcion) && (
                         <InfoContainer 
                           title="Descripción"
                           icon={<FileTextIcon className="w-4 h-4" />}
                         >
                           <InfoItem 
                             label="Descripción" 
                             value={empresaData?.descripcion || empresa.descripcion}
                           />
                         </InfoContainer>
                       )}

                       {/* Estadísticas principales */}
                       {empresaData && empresaData.estadisticas && (
                         <>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             {/* Total Participaciones */}
                             <Card variant="elevated" padding="md">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                                     <AnimatedCounter
                                       value={empresaData.estadisticas.totalParticipaciones || 0}
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

                             {/* Total Participantes */}
                             <Card variant="elevated" padding="md">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                                     <AnimatedCounter
                                       value={empresaData.estadisticas.totalParticipantes || 0}
                                       duration={2000}
                                       className="text-gray-700 dark:text-gray-200"
                                     />
                                   </Typography>
                                   <Typography variant="body2" color="secondary">
                                     Total Participantes
                                   </Typography>
                                 </div>
                                 <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                                   <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 </div>
                               </div>
                             </Card>

                             {/* Investigaciones Participadas */}
                             <Card variant="elevated" padding="md">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                                     <AnimatedCounter
                                       value={empresaData.estadisticas.investigacionesParticipadas || 0}
                                       duration={2000}
                                       className="text-gray-700 dark:text-gray-200"
                                     />
                                   </Typography>
                                   <Typography variant="body2" color="secondary">
                                     Investigaciones
                                   </Typography>
                                 </div>
                                 <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                                   <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 </div>
                               </div>
                             </Card>

                             {/* Tiempo Total */}
                             <Card variant="elevated" padding="md">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                                     <AnimatedCounter 
                                       value={Math.round((empresaData.estadisticas.duracionTotalSesiones || 0) / 60)} 
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

                           {/* Última participación y resumen del mes */}
                           <InfoContainer 
                             title="Resumen de Participación"
                             icon={<UserIcon className="w-4 h-4" />}
                           >
                             {empresaData.estadisticas.fechaUltimaParticipacion && (
                               <InfoItem 
                                 label="Última Participación" 
                                 value={formatearFecha(empresaData.estadisticas.fechaUltimaParticipacion)}
                               />
                             )}
                             
                             <InfoItem 
                               label="Participaciones del Mes" 
                               value={
                                 (() => {
                                   const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                                   const participacionesMesActual = empresaData.estadisticas.participacionesPorMes?.[mesActual] || 0;
                                   const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                                   return `${participacionesMesActual} en ${nombreMes}`;
                                 })()
                               }
                             />
                           </InfoContainer>
                         </>
                       )}

                       {/* Información básica */}
                       <InfoContainer 
                         title="Información Básica"
                         icon={<BuildingIcon className="w-4 h-4" />}
                       >
                         <InfoItem 
                           label="Nombre" 
                           value={empresa.nombre}
                         />
                         {(empresaData?.estado_nombre || empresa.estado_nombre) && (
                           <InfoItem 
                             label="Estado" 
                             value={
                               <Chip 
                                 variant={getChipVariant(empresaData?.estado_nombre || empresa.estado_nombre || '') as any}
                                 size="sm"
                               >
                                 {empresaData?.estado_nombre || empresa.estado_nombre}
                               </Chip>
                             }
                           />
                         )}
                         {(empresaData?.pais_nombre || empresa.pais) && (
                           <InfoItem label="País" value={empresaData?.pais_nombre || empresa.pais} />
                         )}
                         {(empresaData?.industria_nombre || empresa.industria) && (
                           <InfoItem label="Industria" value={empresaData?.industria_nombre || empresa.industria} />
                         )}
                         {(empresaData?.modalidad_nombre) && (
                           <InfoItem label="Modalidad" value={empresaData.modalidad_nombre} />
                         )}
                         {(empresaData?.tamano_nombre || empresa.tamano) && (
                           <InfoItem label="Tamaño" value={empresaData?.tamano_nombre || empresa.tamano} />
                         )}
                         {(empresaData?.relacion_nombre) && (
                           <InfoItem 
                             label="Relación" 
                             value={
                               <Chip 
                                 variant={getChipVariant(empresaData.relacion_nombre) as any}
                                 size="sm"
                               >
                                 {empresaData.relacion_nombre}
                               </Chip>
                             }
                           />
                         )}
                         {(empresaData?.productos_nombres) && (
                           <InfoItem 
                             label="Productos" 
                             value={empresaData.productos_nombres.join(', ')}
                           />
                         )}
                         {(empresaData?.kam_nombre) && (
                           <InfoItem 
                             label="KAM Asignado" 
                             value={
                               <div className="flex items-center gap-2">
                                 <SimpleAvatar 
                                   fallbackText={empresaData.kam_nombre}
                                   size="sm"
                                 />
                                 <span>{empresaData.kam_nombre}</span>
                               </div>
                             }
                           />
                         )}
                         {empresa.ciudad && <InfoItem label="Ciudad" value={empresa.ciudad} />}
                         {empresa.direccion && <InfoItem label="Dirección" value={empresa.direccion} />}
                         {empresa.telefono && <InfoItem label="Teléfono" value={empresa.telefono} />}
                         {empresa.email && <InfoItem label="Email" value={empresa.email} />}
                         {empresa.website && <InfoItem label="Website" value={empresa.website} />}
                       </InfoContainer>

                       {/* Fechas */}
                       <InfoContainer 
                         title="Fechas"
                         icon={<ClockIcon className="w-4 h-4" />}
                       >
                         {(empresaData?.created_at || empresa.fecha_creacion) && (
                           <InfoItem 
                             label="Fecha de Creación" 
                             value={formatearFecha(empresaData?.created_at || empresa.fecha_creacion)}
                           />
                         )}
                         {(empresaData?.updated_at || empresa.fecha_actualizacion) && (
                           <InfoItem 
                             label="Última Actualización" 
                             value={formatearFecha(empresaData?.updated_at || empresa.fecha_actualizacion)}
                           />
                         )}
                       </InfoContainer>
                     </>
                   ) : (
                     <EmptyState
                       icon={<BuildingIcon className="w-8 h-8" />}
                       title="Información de Empresa no disponible"
                       description="Este participante no está asociado a una empresa externa."
                     />
                   )}
                 </div>
               )
             },

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

      {/* Modal de edición de participación */}
      {showEditarParticipacionModal && participacionParaEditar && (
        <EditarReclutamientoModal
          isOpen={showEditarParticipacionModal}
          onClose={() => {
            setShowEditarParticipacionModal(false);
            setParticipacionParaEditar(null);
          }}
          onSuccess={async () => {
            setShowEditarParticipacionModal(false);
            setParticipacionParaEditar(null);
            // Recargar datos
            await cargarInvestigaciones();
            showSuccess('Participación actualizada exitosamente');

          }}
          onSave={async (reclutamientoData: any) => {
            try {
              const response = await fetch(`/api/reclutamientos/${participacionParaEditar.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(reclutamientoData),
              });

              if (response.ok) {
                showSuccess('Participación actualizada exitosamente');
                // Recargar datos
                await cargarInvestigaciones();
                return Promise.resolve();
              } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar la participación');
              }
            } catch (error) {
              console.error('Error actualizando participación:', error);
              throw error;
            }
          }}
          reclutamiento={participacionParaEditar}
        />
      )}

      {/* Modal de confirmación para eliminar participación */}
      {showEliminarParticipacionModal && participacionParaEliminar && (
        <ConfirmModal
          isOpen={showEliminarParticipacionModal}
          onClose={() => {
            setShowEliminarParticipacionModal(false);
            setParticipacionParaEliminar(null);
          }}
          onConfirm={confirmarEliminacionParticipacion}
          title="Eliminar Participación"
          message={`¿Estás seguro de que quieres eliminar la participación "${participacionParaEliminar.nombre}"? Esta acción no se puede deshacer y eliminará permanentemente la participación.`}
          type="error"
          confirmText="Eliminar"
          cancelText="Cancelar"
          size="md"
        />
      )}


    </Layout>
  );
}

// Componente EmpresaContent con información básica y estadísticas
const EmpresaContent = ({ empresa, participante }: { empresa: Empresa | null, participante: Participante | null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);

  useEffect(() => {
    if (empresa?.id) {
      cargarEstadisticasEmpresa(empresa.id);
    }
  }, [empresa?.id]);

  const cargarEstadisticasEmpresa = async (empresaId: string) => {
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

  console.log('EmpresaContent render - empresa:', empresa, 'participante:', participante);
  console.log('EmpresaContent - participante.tipo:', participante?.tipo);
  console.log('EmpresaContent - empresa.id:', empresa?.id);
  console.log('EmpresaContent - empresa.nombre:', empresa?.nombre);

  // Solo mostrar para participantes externos
  if (participante?.tipo !== 'externo') {
    return (
      <EmptyState
        icon={<BuildingIcon className="w-8 h-8" />}
        title="Información de Empresa no disponible"
        description="Este participante no está asociado a una empresa externa."
      />
    );
  }

  if (!empresa) {
    return (
      <EmptyState
        icon={<BuildingIcon className="w-8 h-8" />}
        title="Sin información de empresa"
        description="No se encontró información de la empresa asociada a este participante externo."
      />
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Información básica */}
      <InfoContainer 
        title="Información Básica"
        icon={<BuildingIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Nombre" 
          value={empresa.nombre}
        />
        {empresa.estado_nombre && (
          <InfoItem 
            label="Estado" 
            value={
              <Chip 
                variant={getChipVariant(empresa.estado_nombre) as any}
                size="sm"
              >
                {empresa.estado_nombre}
              </Chip>
            }
          />
        )}
        {empresa.pais && (
          <InfoItem 
            label="País" 
            value={empresa.pais}
          />
        )}
        {empresa.ciudad && (
          <InfoItem 
            label="Ciudad" 
            value={empresa.ciudad}
          />
        )}
        {empresa.industria && (
          <InfoItem 
            label="Industria" 
            value={empresa.industria}
          />
        )}
        {empresa.tamano && (
          <InfoItem 
            label="Tamaño" 
            value={empresa.tamano}
          />
        )}
        {empresa.direccion && (
          <InfoItem 
            label="Dirección" 
            value={empresa.direccion}
          />
        )}
        {empresa.telefono && (
          <InfoItem 
            label="Teléfono" 
            value={empresa.telefono}
          />
        )}
        {empresa.email && (
          <InfoItem 
            label="Email" 
            value={empresa.email}
          />
        )}
        {empresa.website && (
          <InfoItem 
            label="Website" 
            value={empresa.website}
          />
        )}
      </InfoContainer>

      {/* Fechas */}
      <InfoContainer 
        title="Fechas"
        icon={<ClockIcon className="w-4 h-4" />}
      >
        {empresa.fecha_creacion && (
          <InfoItem 
            label="Fecha de Creación" 
            value={formatearFecha(empresa.fecha_creacion)}
          />
        )}
        {empresa.fecha_actualizacion && (
          <InfoItem 
            label="Última Actualización" 
            value={formatearFecha(empresa.fecha_actualizacion)}
          />
        )}
      </InfoContainer>

      {/* Estadísticas */}
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
              onClick={() => empresa.id && cargarEstadisticasEmpresa(empresa.id)}
            >
              Reintentar
            </Button>
          </Card>
        )}

        {/* Estadísticas principales */}
        {empresaData?.estadisticas && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Participaciones */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter
                        value={empresaData.estadisticas.totalParticipaciones || 0}
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

              {/* Total Participantes */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter
                        value={empresaData.estadisticas.totalParticipantes || 0}
                        duration={2000}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Total Participantes
                    </Typography>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                    <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>

              {/* Investigaciones Participadas */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter
                        value={empresaData.estadisticas.investigacionesParticipadas || 0}
                        duration={2000}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Investigaciones
                    </Typography>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                    <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>

              {/* Tiempo Total */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter 
                        value={Math.round((empresaData.estadisticas.duracionTotalSesiones || 0) / 60)} 
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

            {/* Última participación y resumen del mes */}
            <InfoContainer 
              title="Resumen de Participación"
              icon={<UserIcon className="w-4 h-4" />}
            >
              {empresaData.estadisticas.fechaUltimaParticipacion && (
                <InfoItem 
                  label="Última Participación" 
                  value={formatearFecha(empresaData.estadisticas.fechaUltimaParticipacion)}
                />
              )}
              
              <InfoItem 
                label="Participaciones del Mes" 
                value={
                  (() => {
                    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
                    const participacionesMesActual = empresaData.estadisticas.participacionesPorMes?.[mesActual] || 0;
                    const nombreMes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    return `${participacionesMesActual} en ${nombreMes}`;
                  })()
                }
              />
            </InfoContainer>

            {/* Participaciones por mes */}
            {empresaData.estadisticas.participacionesPorMes && Object.keys(empresaData.estadisticas.participacionesPorMes).length > 0 && (
              <InfoContainer 
                title="Participaciones por Mes (Finalizadas)"
                icon={<TrendingUpIcon className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  {Object.entries(empresaData.estadisticas.participacionesPorMes)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 6)
                    .map(([mes, cantidad]) => {
                      const [year, month] = mes.split('-');
                      const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
                      const esMesActual = fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear();
                      const maxCantidad = Math.max(...Object.values(empresaData.estadisticas.participacionesPorMes));
                      
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
          </>
        )}

        {/* Sin estadísticas */}
        {!loading && !error && !empresaData?.estadisticas && (
          <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/20">
            <div className="text-center py-12">
              <BarChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <Typography variant="h5" color="secondary" className="mb-2">
                Sin estadísticas disponibles
              </Typography>
              <Typography variant="body2" color="secondary">
                Esta empresa aún no tiene estadísticas de participación.
              </Typography>
            </div>
          </Card>
        )}


      </div>
    </div>
  );
};
