import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../api/supabase';
import { Layout, PageHeader, InfoContainer, InfoItem, AIButton } from '../../components/ui';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { AnalyzeResultPanelV2 } from '../../components/ai/AnalyzeResultPanelV2';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import DataTable from '../../components/ui/DataTable';
import { SideModal, Input, Textarea, Select, DolorSideModal, ConfirmModal, Subtitle, EmptyState, SeguimientoSideModal } from '../../components/ui';
import { DolorParticipanteCompleto } from '../../types/dolores';
import ActionsMenu from '../../components/ui/ActionsMenu';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon, MicIcon, ClipboardListIcon } from '../../components/icons';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText, getChipText } from '../../utils/chipUtils';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import ParticipacionesUnifiedContainer from '../../components/participantes/ParticipacionesUnifiedContainer';
import { NotasManualesContent } from '../../components/notas/NotasManualesContent';
import { NotasAutomaticasContent } from '../../components/transcripciones/NotasAutomaticasContent';
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
  const { id, reclutamiento_id, returnUrl } = router.query;
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
  const [showModalCrearPerfilamiento, setShowModalCrearPerfilamiento] = useState(false);
  
  // Estados para conversión de notas (igual que en sesiones/index.tsx)
  const [contenidoNotaParaDolor, setContenidoNotaParaDolor] = useState<string>('');
  const [contenidoNotaParaPerfilamiento, setContenidoNotaParaPerfilamiento] = useState<string>('');
  const [notasManuales, setNotasManuales] = useState<any[]>([]);
  const [notaPreSeleccionada, setNotaPreSeleccionada] = useState<any>(null);
  
  // Estados para menú de acciones (igual que sesión activa)
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  // Estado para análisis de IA
  const { analyzeSession, loadExistingAnalysis, isAnalyzing, isLoading: isLoadingAI, result: aiResult, meta: aiMeta, reset: resetAI } = useAIAnalysis();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [showPerfilamientoModal, setShowPerfilamientoModal] = useState(false);
  
  // Estado para la investigación actual (igual que sesión activa)
  const [investigacionActual, setInvestigacionActual] = useState<any>(null);
  
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

  // Debug: Monitorear cambios en estados de modales
  useEffect(() => {
    console.log('🔍 [Participacion] Estados de modales cambiaron:', {
      showVerDolorModal,
      showEditarDolorModal,
      dolorSeleccionado: dolorSeleccionado?.id,
      dolorParaEditar: dolorParaEditar?.id
    });
  }, [showVerDolorModal, showEditarDolorModal, dolorSeleccionado, dolorParaEditar]);

  // Cerrar menú de acciones cuando se hace clic fuera (igual que sesión activa)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsMenu) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowActionsMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  // Cargar investigación actual cuando se carga el reclutamiento (igual que sesión activa)
  useEffect(() => {
    if (reclutamientoActual?.investigacion_id) {
      loadInvestigacionActual();
    }
  }, [reclutamientoActual?.investigacion_id]);

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
  }, [id, reclutamiento_id, cargarParticipante]);

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
    console.log('🔍 Frontend: reclutamiento_id específico:', reclutamiento_id);
    
    try {
      // Si hay un reclutamiento_id específico, usar ese; sino, usar el más reciente
      const url = reclutamiento_id 
        ? `/api/participantes/${id}/reclutamiento-actual?reclutamiento_id=${reclutamiento_id}`
        : `/api/participantes/${id}/reclutamiento-actual`;
      
      console.log('🔍 Frontend: Llamando API:', url);
      const response = await fetch(url);
      
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
  const handleCrearDolor = async (data: any) => {
    try {
      console.log('🚀 [Participacion] handleCrearDolor INICIANDO');
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 [Participacion] Usuario obtenido:', user?.id);
      
      const response = await fetch(`/api/participantes/${id}/dolores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || '',
        },
        body: JSON.stringify(data),
      });
      
      console.log('🔍 [Participacion] Response status:', response.status);

      if (response.ok) {
        const dolorCreado = await response.json();
        showSuccess('Dolor creado exitosamente');
        setShowModalCrearDolor(false);
        
        // Marcar la nota como convertida a dolor si hay contenido pre-cargado
        if (contenidoNotaParaDolor && (window as any).marcarNotaConvertidaADolor) {
          console.log('🔍 [DEBUG] Marcando nota como convertida a dolor:', { contenidoNotaParaDolor, dolorCreadoId: dolorCreado.id });
          // Encontrar la nota que se convirtió
          const notaConvertida = notasManuales.find(nota => nota.contenido === contenidoNotaParaDolor);
          if (notaConvertida) {
            console.log('🔍 [DEBUG] Nota encontrada para marcar como convertida:', notaConvertida);
            (window as any).marcarNotaConvertidaADolor(notaConvertida.id, dolorCreado.id);
          } else {
            console.log('🔍 [DEBUG] No se encontró la nota para marcar como convertida');
          }
        } else {
          console.log('🔍 [DEBUG] No se puede marcar la nota como convertida a dolor:', {
            contenidoNotaParaDolor: !!contenidoNotaParaDolor,
            marcarNotaConvertidaADolor: !!(window as any).marcarNotaConvertidaADolor
          });
        }
        
        // Limpiar el contenido pre-cargado
        setContenidoNotaParaDolor('');
        
        // Recargar dolores
        await cargarDolores();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear el dolor');
      }
    } catch (error) {
      console.error('Error al crear dolor:', error);
      showError('Error al crear el dolor');
    }
  };

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
    } finally {
      setShowDeleteConfirmModal(false);
      setDolorParaEliminar(null);
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

  const handleCrearDolorClick = () => {
    setShowModalCrearDolor(true);
  };

  const handleCrearPerfilamiento = (participante: Participante) => {
    setParticipanteParaPerfilamiento(participante);
    setShowModalPerfilamiento(true);
  };

  // Funciones para crear desde análisis de IA
  const handleCreateDolorFromAI = async (dolorData: any) => {
    try {
      console.log('🚀 [Participacion] Creando dolor desde IA:', dolorData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`/api/participantes/${id}/dolores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || '',
        },
        body: JSON.stringify({
          categoria_id: dolorData.categoria_id,
          titulo: dolorData.titulo,
          descripcion: dolorData.descripcion,
          severidad: dolorData.severidad,
          ejemplo: dolorData.ejemplo,
          evidencia_segmento: dolorData.evidence?.seg_id || null,
          fuente: 'ai_analysis'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear dolor');
      }

      const newDolor = await response.json();
      console.log('✅ [Participacion] Dolor creado desde IA:', newDolor);
      
      // Actualizar la lista de dolores
      setDolores(prev => [...prev, newDolor]);
      showSuccess('Dolor creado exitosamente desde el análisis de IA');
      
    } catch (error) {
      console.error('❌ [Participacion] Error creando dolor desde IA:', error);
      showError('Error al crear el dolor desde el análisis de IA');
    }
  };

  const handleCreatePerfilamientoFromAI = async (perfilData: any) => {
    try {
      console.log('🚀 [Participacion] Creando perfilamiento desde IA:', perfilData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`/api/participantes/${id}/perfilamientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || '',
        },
        body: JSON.stringify({
          categoria_perfilamiento: perfilData.categoria,
          valor_principal: perfilData.valor_principal,
          observaciones: perfilData.observaciones,
          contexto_interaccion: perfilData.contexto_interaccion,
          confianza_observacion: perfilData.confianza_observacion,
          etiquetas_contexto: perfilData.etiquetas_contexto,
          fuente: 'ai_analysis'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear perfilamiento');
      }

      const newPerfilamiento = await response.json();
      console.log('✅ [Participacion] Perfilamiento creado desde IA:', newPerfilamiento);
      
      // Actualizar la lista de perfilamientos
      setPerfilamientos(prev => [...prev, newPerfilamiento]);
      showSuccess('Perfilamiento creado exitosamente desde el análisis de IA');
      
    } catch (error) {
      console.error('❌ [Participacion] Error creando perfilamiento desde IA:', error);
      showError('Error al crear el perfilamiento desde el análisis de IA');
    }
  };

  // Cargar investigación actual (igual que sesión activa)
  const loadInvestigacionActual = async () => {
    if (reclutamientoActual?.investigacion_id) {
      try {
        console.log('🔍 [Participacion] Cargando investigación actual:', reclutamientoActual.investigacion_id);
        const response = await fetch(`/api/investigaciones/${reclutamientoActual.investigacion_id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [Participacion] Investigación actual cargada:', data);
          console.log('🔍 [Participacion] Investigación actual - responsable_id:', data.responsable_id);
          console.log('🔍 [Participacion] Investigación actual - nombre:', data.nombre);
          setInvestigacionActual(data);
        } else {
          console.error('🔍 [Participacion] Error cargando investigación actual:', response.status);
          const errorText = await response.text();
          console.error('🔍 [Participacion] Error response:', errorText);
        }
      } catch (error) {
        console.error('🔍 [Participacion] Error cargando investigación actual:', error);
      }
    }
  };

  // Funciones para manejar seguimientos (igual que sesión activa)
  const handleCrearSeguimiento = async (data: any) => {
    try {
      const response = await fetch('/api/seguimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          participante_externo_id: participante?.id,
          investigacion_id: investigacionActual?.id || reclutamientoActual?.investigacion_id,
          responsable_id: investigacionActual?.responsable_id || data.responsable_id
        }),
      });

      if (response.ok) {
        showSuccess('Seguimiento creado exitosamente');
        setShowSeguimientoModal(false);
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Error al crear el seguimiento');
      }
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
      showError('Error al crear el seguimiento');
    }
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
                variant={getEstadoParticipanteVariant(participante.estado_participante || 'disponible')}
                size="sm"
              >
                {getChipText(participante.estado_participante || 'disponible')}
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
                  variant={getEstadoParticipanteVariant(empresa.estado_nombre || 'disponible')}
                  size="sm"
                >
                  {getChipText(empresa.estado_nombre || 'disponible')}
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

  // Componente para el contenido del tab de Información de la Sesión
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
          {reclutamiento.meet_link && (
            <InfoItem 
              label="Enlace de Google Meet"
              value={
                <div className="flex items-center gap-2">
                  <a 
                    href={reclutamiento.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
                  >
                    {reclutamiento.meet_link}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(reclutamiento.meet_link)}
                    className="p-1 h-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              }
            />
          )}
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

  // useEffect para cargar análisis de IA existente
  useEffect(() => {
    if (reclutamiento_id && typeof reclutamiento_id === 'string') {
      console.log('🔍 Cargando análisis de IA existente para sesión:', reclutamiento_id);
      loadExistingAnalysis(reclutamiento_id);
    }
  }, [reclutamiento_id, loadExistingAnalysis]);

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
      {/* Componente de transcripción automática simple */}
      {/* TODO: Implementar SimpleMeetDetector cuando sea necesario */}
      {/* {reclutamientoActual?.meet_link && (
        <SimpleMeetDetector
          reclutamientoId={Array.isArray(id) ? id[0] : id}
          meetLink={reclutamientoActual.meet_link}
        />
      )} */}
      
      {/* Mejorador de enlaces de Meet */}
      {/* TODO: Implementar MeetLinkEnhancer cuando sea necesario */}
      {/* {reclutamientoActual?.meet_link && (
        <MeetLinkEnhancer
          reclutamientoId={Array.isArray(id) ? id[0] : id}
          meetLink={reclutamientoActual.meet_link}
        />
      )} */}
      
      <div className="py-8" data-reclutamiento-id={id}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                console.log('🔙 NAVEGACIÓN ATRÁS - Iniciando navegación...');
                console.log('🔍 reclutamientoActual:', reclutamientoActual);
                console.log('🔍 returnUrl:', returnUrl);
                
                // Si tenemos returnUrl, usarlo para regresar a la página anterior
                if (returnUrl && typeof returnUrl === 'string') {
                  const decodedReturnUrl = decodeURIComponent(returnUrl);
                  console.log('🔙 Navegando a returnUrl:', decodedReturnUrl);
                  router.push(decodedReturnUrl);
                } else if (reclutamientoActual?.investigacion_id) {
                  // Si tenemos investigacion_id, navegar a la vista específica del reclutamiento
                  const targetUrl = `/reclutamiento/ver/${reclutamientoActual.investigacion_id}`;
                  console.log('🔙 Navegando a vista específica del reclutamiento:', targetUrl);
                  router.push(targetUrl);
                } else {
                  // Fallback al home de reclutamientos si no hay investigacion_id
                  console.log('🔙 Fallback - Navegando al home de reclutamientos (sin investigacion_id)');
                  router.push('/reclutamiento');
                }
              }}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title={`Sesión: ${participante.nombre}`}
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
            <AIButton 
              onClick={async () => {
                if (!reclutamientoActual?.id) return;
                
                try {
                  await analyzeSession(reclutamientoActual.id);
                  setShowAIPanel(true);
                } catch (error) {
                  console.error('Error en análisis de IA:', error);
                }
              }}
              loading={isAnalyzing}
              disabled={isAnalyzing}
              size="md"
            >
              {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
            </AIButton>
            {/* Menú de acciones con 3 puntos (igual que sesión activa) */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="w-10 h-10 rounded-md border border-border bg-card text-card-foreground hover:bg-accent flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                aria-label="Más opciones"
              >
                <MoreVerticalIcon className="w-4 h-4" />
              </button>
              
              {/* Menú desplegable */}
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowSeguimientoModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <MessageIcon className="w-4 h-4" />
                      Crear Seguimiento
                    </button>
                    <button
                      onClick={() => {
                        setShowPerfilamientoModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <UserIcon className="w-4 h-4" />
                      Crear Perfilamiento
                    </button>
                    <button
                      onClick={() => {
                        setShowModalCrearDolor(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <AlertTriangleIcon className="w-4 h-4" />
                      Crear Dolor
                    </button>
                    <button
                      onClick={() => {
                        handleEditarParticipacion();
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <EditIcon className="w-4 h-4" />
                      Editar Participación
                    </button>
                    <button
                      onClick={() => {
                        handleEliminarParticipacion();
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Eliminar Participación
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            },
            {
              id: 'reclutamiento',
              label: 'Información de la Sesión',
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
                           className: 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300',
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
             {
               id: 'notas-manuales',
               label: 'Notas Manuales',
               content: (
                 <NotasManualesContent 
                   participanteId={id as string}
                   sesionId={reclutamiento_id as string}
                   onConvertirADolor={(contenido) => {
                     console.log('🔍 [DEBUG] onConvertirADolor llamado desde participacion/[id].tsx, contenido:', contenido);
                     setContenidoNotaParaDolor(contenido);
                     setShowModalCrearDolor(true);
                   }}
                   onNotaConvertidaADolor={(notaId, dolorId) => {
                     console.log('🔍 [DEBUG] Nota convertida a dolor:', { notaId, dolorId });
                     // La función marcarNotaConvertidaADolor se ejecutará automáticamente
                   }}
                   onNotaConvertidaAPerfilamiento={(notaId, perfilamientoId) => {
                     console.log('🔍 [DEBUG] Nota convertida a perfilamiento:', { notaId, perfilamientoId });
                     // La función marcarNotaConvertidaAPerfilamiento se ejecutará automáticamente
                   }}
                   onConvertirAPerfilamiento={(contenido) => {
                     console.log('🔍 [DEBUG] onConvertirAPerfilamiento llamado desde participacion/[id].tsx, contenido:', contenido);
                     // Abrir modal de selección de categoría con todas las notas disponibles
                     console.log('🔄 [CONVERSION] Convirtiendo nota a perfilamiento:', contenido);
                     
                     // Encontrar la nota que se está convirtiendo
                     const notaSeleccionada = notasManuales.find(nota => nota.contenido === contenido);
                     console.log('🔄 [CONVERSION] Nota encontrada:', notaSeleccionada);
                     console.log('🔄 [CONVERSION] Todas las notas disponibles:', notasManuales);
                     
                     // Guardar la nota pre-seleccionada
                     setNotaPreSeleccionada(notaSeleccionada);
                     
                     setShowPerfilamientoModal(true);
                     console.log('🔄 [CONVERSION] Modal de selección de categoría abierto');
                   }}
                   onNotasChange={(notas) => {
                     console.log('🔍 [DEBUG] onNotasChange llamado desde participacion/[id].tsx, notas:', notas);
                     setNotasManuales(notas);
                   }}
                 />
               )
             },
             {
               id: 'notas-automaticas',
               label: 'Notas Automáticas',
               content: (
                 <NotasAutomaticasContent
                   reclutamientoId={reclutamiento_id as string}
                   isRecording={false}
                   duracionGrabacion={0}
                   transcripcionCompleta=""
                   segmentosTranscripcion={[]}
                   isProcessing={false}
                   error={null}
                 />
               )
             },
             {
               id: 'ai-analysis',
               label: 'Análisis IA',
               content: isLoadingAI ? (
                 <div className="text-center py-8">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                   <Typography variant="body1" color="secondary">
                     Cargando análisis de IA...
                   </Typography>
                 </div>
               ) : aiResult && aiMeta ? (
                 <AnalyzeResultPanelV2
                   result={aiResult}
                   meta={aiMeta}
                   sessionId={reclutamiento_id}
                   onClose={() => {
                     // No cerrar el panel, solo mostrar mensaje
                     console.log('Panel de análisis cerrado');
                   }}
                   onEditDolor={(dolor) => {
                     console.log('Editar dolor:', dolor);
                     // TODO: Implementar edición de dolor
                   }}
                   onEditPerfil={(perfil) => {
                     console.log('Editar perfil:', perfil);
                     // TODO: Implementar edición de perfil
                   }}
                   onReanalyze={async () => {
                     if (!reclutamiento_id) return;
                     try {
                       await analyzeSession(reclutamiento_id);
                     } catch (error) {
                       console.error('Error en re-análisis:', error);
                     }
                   }}
                   onCreateDolor={handleCreateDolorFromAI}
                   onCreatePerfilamiento={handleCreatePerfilamientoFromAI}
                 />
               ) : (
                 <div className="text-center py-8">
                   <Typography variant="h4" weight="semibold" className="mb-2">
                     Análisis de IA
                   </Typography>
                   <Typography variant="body1" color="secondary" className="mb-4">
                     Haz clic en "Analizar con IA" para obtener insights automáticos de esta sesión.
                   </Typography>
                   <Button
                     variant="outline"
                     onClick={async () => {
                       if (!reclutamiento_id) return;
                       try {
                         await analyzeSession(reclutamiento_id as string);
                         setShowAIPanel(true);
                       } catch (error) {
                         console.error('Error en análisis de IA:', error);
                       }
                     }}
                     loading={isAnalyzing}
                     disabled={isAnalyzing}
                   >
                     {isAnalyzing ? 'Analizando...' : 'Iniciar Análisis'}
                   </Button>
                 </div>
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
        onSave={handleCrearDolor}
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
          console.log('🔍 [Participacion] onEdit llamado con dolor:', dolorSeleccionado);
          if (dolorSeleccionado) {
            console.log('🔍 [Participacion] Estableciendo dolorParaEditar:', dolorSeleccionado);
            setDolorParaEditar(dolorSeleccionado);
            // Usar setTimeout para asegurar que el estado se actualice antes de abrir el modal
            setTimeout(() => {
              console.log('🔍 [Participacion] Cerrando modal de ver y abriendo modal de editar');
              setShowVerDolorModal(false);
              setShowEditarDolorModal(true);
            }, 0);
          }
        }}
      />

      {showEditarDolorModal && dolorParaEditar && (
        <DolorSideModal
          isOpen={showEditarDolorModal}
          onClose={() => {
            console.log('🔍 [Participacion] Cerrando modal de editar');
            setShowEditarDolorModal(false);
            setDolorParaEditar(null);
          }}
          participanteId={id as string}
          participanteNombre={participante?.nombre || ''}
          dolor={dolorParaEditar as DolorParticipanteCompleto}
          onSave={handleActualizarDolor}
          loading={false}
          readOnly={false}
          key={`editar-${dolorParaEditar?.id}-${showEditarDolorModal}`}
        />
      )}

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

      {/* Modal de crear dolor (igual que sesión activa) */}
      {showModalCrearDolor && participante && (
        <DolorSideModal
          isOpen={showModalCrearDolor}
          onClose={() => setShowModalCrearDolor(false)}
          participanteId={participante.id}
          participanteNombre={participante.nombre}
          onSave={handleCrearDolor}
        />
      )}


      {showModalCrearPerfilamiento && categoriaSeleccionada && participante && (
        <CrearPerfilamientoModal
          isOpen={showModalCrearPerfilamiento}
          onClose={() => {
            setShowModalCrearPerfilamiento(false);
            setCategoriaSeleccionada(null);
            setNotaPreSeleccionada(null);
          }}
          participanteId={participante.id}
          participanteNombre={participante.nombre}
          categoria={categoriaSeleccionada}
          descripcionPrecargada={notaPreSeleccionada?.contenido || ''}
          onBack={() => {
            setShowModalCrearPerfilamiento(false);
            setCategoriaSeleccionada(null);
            setShowModalPerfilamiento(true);
          }}
          onSuccess={(perfilamientoCreado) => {
            console.log('🔍 [DEBUG] onSuccess llamado con perfilamientoCreado:', perfilamientoCreado);
            console.log('🔍 [DEBUG] notaPreSeleccionada:', notaPreSeleccionada);
            console.log('🔍 [DEBUG] window.marcarNotaConvertidaAPerfilamiento existe:', !!(window as any).marcarNotaConvertidaAPerfilamiento);
            
            setShowModalCrearPerfilamiento(false);
            setCategoriaSeleccionada(null);
            
            // Marcar la nota como convertida a perfilamiento
            if (notaPreSeleccionada && (window as any).marcarNotaConvertidaAPerfilamiento) {
              console.log('🔍 [DEBUG] Llamando marcarNotaConvertidaAPerfilamiento con:', {
                notaId: notaPreSeleccionada.id,
                perfilamientoId: perfilamientoCreado?.id
              });
              (window as any).marcarNotaConvertidaAPerfilamiento(notaPreSeleccionada.id, perfilamientoCreado.id);
            } else {
              console.log('🔍 [DEBUG] No se puede marcar la nota como convertida:', {
                notaPreSeleccionada: !!notaPreSeleccionada,
                marcarNotaConvertidaAPerfilamiento: !!(window as any).marcarNotaConvertidaAPerfilamiento
              });
            }
            
            setNotaPreSeleccionada(null);
            showSuccess('Perfilamiento creado exitosamente');
          }}
        />
      )}

      {/* Modal de crear seguimiento (igual que sesión activa) */}
      {showSeguimientoModal && participante && (
        <SeguimientoSideModal
          isOpen={showSeguimientoModal}
          onClose={() => setShowSeguimientoModal(false)}
          onSave={handleCrearSeguimiento}
          investigacionId={investigacionActual?.id || reclutamientoActual?.investigacion_id || ''}
          usuarios={usuarios}
          participanteExternoPrecargado={participante}
          investigaciones={investigaciones}
          responsablePorDefecto={(() => {
            const responsableId = investigacionActual?.responsable_id;
            console.log('🔍 [Participacion] Pasando responsable al modal:', {
              investigacionActual: investigacionActual,
              responsableId: responsableId,
              tipo: typeof responsableId
            });
            return responsableId;
          })()}
        />
      )}

      {/* Modal de selección de categoría de perfilamiento */}
      {showPerfilamientoModal && notaPreSeleccionada && (() => {
        console.log('🔍 [DEBUG] Renderizando modal con notaPreSeleccionada:', notaPreSeleccionada);
        console.log('🔍 [DEBUG] notasParaConvertir será:', [notaPreSeleccionada]);
        return (
        <SeleccionarCategoriaPerfilamientoModal
          isOpen={showPerfilamientoModal}
          onClose={() => setShowPerfilamientoModal(false)}
          participanteId={id as string}
          participanteNombre={participante?.nombre || ''}
          notasParaConvertir={[notaPreSeleccionada]}
          notaPreSeleccionada={notaPreSeleccionada}
          onCategoriaSeleccionada={(categoria, nota) => {
            console.log('🔍 [DEBUG] Categoría seleccionada:', categoria, 'Nota:', nota);
            setCategoriaSeleccionada(categoria);
            setNotaPreSeleccionada(nota);
            setShowPerfilamientoModal(false);
            setShowModalCrearPerfilamiento(true);
          }}
        />
        );
      })()}

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
