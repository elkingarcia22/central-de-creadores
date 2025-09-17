import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../api/supabase';
import { Layout, PageHeader, SideModal, Input, Textarea, Select, ConfirmModal, EmptyState, InfoContainer, InfoItem } from '../../components/ui';
import { DolorSideModal } from '../../components/ui/DolorSideModal';
import SeguimientoSideModal from '../../components/ui/SeguimientoSideModal';
import { CrearPerfilamientoModal } from '../../components/participantes/CrearPerfilamientoModal';
import { SeleccionarCategoriaPerfilamientoModal } from '../../components/participantes/SeleccionarCategoriaPerfilamientoModal';
import type { CategoriaPerfilamiento } from '../../types/perfilamientos';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { AIButton } from '../../components/ui/AIButton';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import { ArrowLeftIcon, EditIcon, BuildingIcon, UsersIcon, UserIcon, EmailIcon, CalendarIcon, PlusIcon, MessageIcon, AlertTriangleIcon, BarChartIcon, TrendingUpIcon, ClockIcon, EyeIcon, TrashIcon, CheckIcon, CheckCircleIcon, RefreshIcon, SearchIcon, FilterIcon, MoreVerticalIcon, FileTextIcon, AIIcon, MicIcon } from '../../components/icons';
import SimpleAvatar from '../../components/ui/SimpleAvatar';
import { formatearFecha } from '../../utils/fechas';
import { getEstadoParticipanteVariant, getEstadoReclutamientoVariant, getEstadoEmpresaVariant } from '../../utils/estadoUtils';
import { getChipVariant, getEstadoDolorVariant, getSeveridadVariant, getEstadoDolorText, getChipText } from '../../utils/chipUtils';
import { getTipoParticipanteVariant } from '../../utils/tipoParticipanteUtils';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import DoloresUnifiedContainer from '../../components/dolores/DoloresUnifiedContainer';
import { PerfilamientosTab } from '../../components/participantes/PerfilamientosTab';
import FilterDrawer from '../../components/ui/FilterDrawer';
import { NotasAutomaticasContent } from '../../components/transcripciones/NotasAutomaticasContent';
import { NotasManualesContent } from '../../components/notas/NotasManualesContent';
import { useWebSpeechTranscriptionSimple } from '../../hooks/useWebSpeechTranscriptionSimple';
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
  observadores?: string[];
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

interface SeguimientoFormData {
  investigacion_id: string;
  fecha_seguimiento: string;
  notas: string;
  responsable_id: string;
  estado: string;
  participante_externo_id?: string;
}

interface CategoriaPerfilamiento {
  id: string;
  nombre: string;
  descripcion?: string;
}

export default function SesionActivaPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [reclutamiento, setReclutamiento] = useState<Reclutamiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notas-manuales');
  
  // Estados para los nuevos tabs
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState<string | null>(null);
  const [dolores, setDolores] = useState<DolorParticipante[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [participacionesPorMes, setParticipacionesPorMes] = useState<{ [key: string]: number }>({});
  
  // Estados para modales de dolores
  const [dolorSeleccionado, setDolorSeleccionado] = useState<DolorParticipante | null>(null);
  const [showVerDolorModal, setShowVerDolorModal] = useState(false);
  const [showEditarDolorModal, setShowEditarDolorModal] = useState(false);
  const [dolorParaEliminar, setDolorParaEliminar] = useState<DolorParticipante | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
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
  
  // Estados para transcripción
  const [isRecording, setIsRecording] = useState(false);
  const [transcripcionId, setTranscripcionId] = useState<string | null>(null);
  const [duracionGrabacion, setDuracionGrabacion] = useState(0);
  const [transcripcionCompleta, setTranscripcionCompleta] = useState<string>('');
  const [segmentosTranscripcion, setSegmentosTranscripcion] = useState<any[]>([]);
  
  // Estados para modales de seguimiento y perfilamiento
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [showPerfilamientoModal, setShowPerfilamientoModal] = useState(false);
  const [showCrearPerfilamientoModal, setShowCrearPerfilamientoModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaPerfilamiento | null>(null);
  
  // Estados para crear dolor
  const [showCrearDolorModal, setShowCrearDolorModal] = useState(false);
  
  // Estados para conversión de notas
  const [contenidoNotaParaDolor, setContenidoNotaParaDolor] = useState<string>('');
  const [contenidoNotaParaPerfilamiento, setContenidoNotaParaPerfilamiento] = useState<string>('');
  const [notasManuales, setNotasManuales] = useState<any[]>([]);
  const [notaPreSeleccionada, setNotaPreSeleccionada] = useState<any>(null);
  
  // Estado para menú de 3 puntos
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  // Estado para la investigación actual de la sesión
  const [investigacionActual, setInvestigacionActual] = useState<any>(null);
  
  // Hook para transcripción de audio con Web Speech API
  const audioTranscription = useWebSpeechTranscriptionSimple();
  

  // Cargar datos del participante y reclutamiento
  useEffect(() => {
    if (id) {
      loadParticipantData();
    }
  }, [id]);

  // Cargar transcripciones cuando se carga el reclutamiento
  useEffect(() => {
    if (reclutamiento?.id) {
      loadTranscripciones();
    }
  }, [reclutamiento?.id]);

  // Listener para transcripción completada
  useEffect(() => {
    console.log('🔧 Configurando listener de transcripción...');
    
    const handleTranscriptionCompleted = async (event: any) => {
      console.log('🎉 TRANSCRIPCIÓN COMPLETADA - INICIO DEL LISTENER');
      console.log('🎉 Event detail completo:', JSON.stringify(event.detail, null, 2));
      console.log('🔍 Estado actual transcripcionCompleta ANTES:', transcripcionCompleta);
      console.log('🔍 Estado actual segmentosTranscripcion ANTES:', segmentosTranscripcion);
      console.log('🔍 Hook state transcription ANTES:', audioTranscription.state.transcription);
      console.log('🔍 Hook state segments ANTES:', audioTranscription.state.segments);
      
      // Actualizar estados locales usando función de actualización para evitar closure issues
      console.log('🔄 Llamando setTranscripcionCompleta con:', event.detail.transcription);
      setTranscripcionCompleta(prev => {
        console.log('🔍 Estado anterior transcripcionCompleta:', prev);
        console.log('🔍 Estado nuevo transcripcionCompleta:', event.detail.transcription);
        return event.detail.transcription;
      });
      
      console.log('🔄 Llamando setSegmentosTranscripcion con:', event.detail.segments);
      setSegmentosTranscripcion(prev => {
        console.log('🔍 Estado anterior segmentosTranscripcion:', prev);
        console.log('🔍 Estado nuevo segmentosTranscripcion:', event.detail.segments);
        return event.detail.segments;
      });
      
      console.log('✅ Estados actualizados en el listener');
      
      // Verificar inmediatamente después
      setTimeout(() => {
        console.log('⏰ DESPUÉS DE 100ms - hook transcription:', audioTranscription.state.transcription);
        console.log('⏰ DESPUÉS DE 100ms - hook segments:', audioTranscription.state.segments);
      }, 100);
      
      // Guardar en la base de datos
      if (transcripcionId && event.detail.transcription) {
        console.log('💾 Actualizando transcripción en base de datos...');
        console.log('📝 Datos a guardar:', {
          transcripcion_completa: event.detail.transcription,
          transcripcion_por_segmentos: event.detail.segments,
          duracion_total: Math.round(event.detail.duration),
          fecha_fin: new Date().toISOString(),
          estado: 'completada'
        });
        
        await updateTranscripcion(transcripcionId, {
          transcripcion_completa: event.detail.transcription,
          transcripcion_por_segmentos: event.detail.segments,
          duracion_total: Math.round(event.detail.duration),
          fecha_fin: new Date().toISOString(),
          estado: 'completada'
        });
        
        console.log('✅ Transcripción guardada en BD, recargando lista...');
        await loadTranscripciones();
      }
    };

    console.log('🔧 Agregando event listener...');
    window.addEventListener('transcriptionCompleted', handleTranscriptionCompleted);

    return () => {
      console.log('🔧 Removiendo event listener...');
      window.removeEventListener('transcriptionCompleted', handleTranscriptionCompleted);
    };
  }, [transcripcionId]); // Solo transcripcionId para evitar closure issues

  // Debug: Verificar cambios en estados locales
  useEffect(() => {
    console.log('🔄 Estado transcripcionCompleta cambió:', transcripcionCompleta);
  }, [transcripcionCompleta]);

  useEffect(() => {
    console.log('🔄 Estado segmentosTranscripcion cambió:', segmentosTranscripcion);
  }, [segmentosTranscripcion]);

  // Debug: Verificar cambios en el estado del hook
  useEffect(() => {
    console.log('🔄 Hook audioTranscription.state.transcription cambió:', audioTranscription.state.transcription);
  }, [audioTranscription.state.transcription]);

  useEffect(() => {
    console.log('🔄 Hook audioTranscription.state.segments cambió:', audioTranscription.state.segments);
  }, [audioTranscription.state.segments]);

  // Cargar estadísticas de empresa cuando se carga la empresa
  useEffect(() => {
    console.log('🔍 Estado de empresa cambiado:', empresa);
    console.log('🔍 Participante tipo:', participante?.tipo);
    console.log('🔍 Empresa ID:', empresa?.id);
    
    // Cargar estadísticas de empresa si es un participante externo
    if (empresa && participante?.tipo === 'externo' && empresa.id) {
      console.log('🔍 Cargando estadísticas de empresa...');
      cargarEstadisticasEmpresa(empresa.id);
    }
  }, [empresa, participante?.tipo]);

  // Cargar datos de empresa cuando el participante cambie
  useEffect(() => {
    if (participante && participante.tipo === 'externo') {
      loadEmpresaData();
    }
  }, [participante]);

  // Memoizar opciones de filtro para evitar re-renders infinitos
  const filterOptions = useMemo(() => {
    if (dolores.length === 0) {
      return {
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
          { value: 'alta', label: 'Alta' }
        ],
        categorias: [
          { value: 'todos', label: 'Todas las categorías' }
        ]
      };
    }

    // Extraer categorías únicas
    const categoriasUnicas = [...new Set(dolores.map(dolor => dolor.categoria_nombre).filter(Boolean))];
    const categoriasOptions = [
      { value: 'todos', label: 'Todas las categorías' },
      ...categoriasUnicas.map(categoria => ({ value: categoria, label: categoria }))
    ];
    
    // Extraer severidades únicas
    const severidadesUnicas = [...new Set(dolores.map(dolor => dolor.severidad).filter(Boolean))];
    const severidadesOptions = [
      { value: 'todos', label: 'Todas las severidades' },
      ...severidadesUnicas.map(severidad => ({ 
        value: severidad, 
        label: severidad ? severidad.charAt(0).toUpperCase() + severidad.slice(1) : 'Sin severidad'
      }))
    ];
    
    // Estados ya están definidos estáticamente
    const estadosOptions = [
      { value: 'todos', label: 'Todos los estados' },
      { value: 'activo', label: 'Activo' },
      { value: 'resuelto', label: 'Resuelto' },
      { value: 'archivado', label: 'Archivado' }
    ];
    
    return {
      estados: estadosOptions,
      severidades: severidadesOptions,
      categorias: categoriasOptions
    };
  }, [dolores]);

  // Cerrar menú de acciones cuando se hace clic fuera
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

  // Cargar investigación actual cuando se carga el reclutamiento
  useEffect(() => {
    if (reclutamiento?.investigacion_id) {
      loadInvestigacionActual();
    }
  }, [reclutamiento?.investigacion_id]);

  const loadParticipantData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del participante
      const participanteResponse = await fetch(`/api/participantes/${id}`);
      if (participanteResponse.ok) {
        const participanteData = await participanteResponse.json();
        setParticipante(participanteData);
      }

      // Cargar datos del reclutamiento específico de la sesión activa
      console.log('🔍 Cargando reclutamiento específico para sesión activa');
      const currentReclutamiento = localStorage.getItem('currentReclutamiento');
      if (currentReclutamiento) {
        try {
          const reclutamientoData = JSON.parse(currentReclutamiento);
          console.log('🔍 Datos de reclutamiento desde localStorage:', reclutamientoData);
          
          // Si tenemos un reclutamiento_id específico, cargar desde API con ese ID
          if (reclutamientoData.id) {
            console.log('🔍 Cargando reclutamiento específico con ID:', reclutamientoData.id);
            await loadReclutamientoSpecifico(reclutamientoData.id);
          } else {
            // Si no hay ID, usar los datos del localStorage directamente
        setReclutamiento(reclutamientoData);
      }
        } catch (error) {
          console.error('🔍 Error parseando reclutamiento desde localStorage:', error);
          // Fallback: cargar desde API
          await loadReclutamientoFromAPI();
        }
      } else {
        console.log('🔍 No hay reclutamiento en localStorage, cargando desde API');
        // Fallback: cargar desde API
        await loadReclutamientoFromAPI();
      }

      // Cargar datos adicionales para los nuevos tabs
      await Promise.all([
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

  const loadReclutamientoSpecifico = async (reclutamientoId: string) => {
    try {
      console.log('🔍 Cargando reclutamiento específico con ID:', reclutamientoId);
      const url = `/api/participantes/${id}/reclutamiento-actual?reclutamiento_id=${reclutamientoId}`;
      console.log('🔍 URL de API:', url);
      
      const reclutamientoResponse = await fetch(url);
      if (reclutamientoResponse.ok) {
        const data = await reclutamientoResponse.json();
        console.log('🔍 Datos de reclutamiento específico recibidos:', data);
        
        // La API devuelve { reclutamiento: {...} }
        const reclutamientoData = data.reclutamiento || data;
        console.log('🔍 Reclutamiento específico procesado:', reclutamientoData);
        setReclutamiento(reclutamientoData);
      } else {
        console.error('🔍 Error en respuesta de reclutamiento específico:', reclutamientoResponse.status);
        // Fallback: usar datos del localStorage
        const currentReclutamiento = localStorage.getItem('currentReclutamiento');
        if (currentReclutamiento) {
          const reclutamientoData = JSON.parse(currentReclutamiento);
          setReclutamiento(reclutamientoData);
        }
      }
    } catch (error) {
      console.error('🔍 Error cargando reclutamiento específico:', error);
      // Fallback: usar datos del localStorage
      const currentReclutamiento = localStorage.getItem('currentReclutamiento');
      if (currentReclutamiento) {
        const reclutamientoData = JSON.parse(currentReclutamiento);
        setReclutamiento(reclutamientoData);
      }
    }
  };

  const loadReclutamientoFromAPI = async () => {
    try {
      console.log('🔍 Cargando reclutamiento desde API para participante:', id);
      const reclutamientoResponse = await fetch(`/api/participantes/${id}/reclutamiento-actual`);
      if (reclutamientoResponse.ok) {
        const data = await reclutamientoResponse.json();
        console.log('🔍 Datos de reclutamiento recibidos desde API:', data);
        
        // La API devuelve { reclutamiento: {...} }
        const reclutamientoData = data.reclutamiento || data;
        console.log('🔍 Reclutamiento procesado desde API:', reclutamientoData);
        setReclutamiento(reclutamientoData);
      } else {
        console.error('🔍 Error en respuesta de reclutamiento desde API:', reclutamientoResponse.status);
      }
    } catch (error) {
      console.error('🔍 Error cargando reclutamiento desde API:', error);
    }
  };

  const loadEmpresaData = async () => {
    try {
      
      // Solo cargar empresa para participantes externos
      if (participante?.tipo === 'externo') {
        if (participante.empresa_id) {
          console.log('🔍 Cargando empresa por ID:', participante.empresa_id);
          await cargarEmpresaPorId(participante.empresa_id);
        } else if (participante.empresa_nombre) {
          console.log('🔍 Buscando empresa por nombre:', participante.empresa_nombre);
          await buscarEmpresaPorNombre(participante.empresa_nombre);
      } else {
          console.log('🔍 Participante externo sin empresa_id ni empresa_nombre');
        }
      } else {
        console.log('🔍 No se cargará empresa - Tipo:', participante?.tipo);
      }
    } catch (error) {
      console.error('🔍 Error cargando empresa:', error);
    }
  };

  const cargarEmpresaPorId = async (empresaId: string) => {
    try {
      console.log('🔍 Cargando empresa por ID:', empresaId);
      const response = await fetch(`/api/empresas/${empresaId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Empresa cargada por ID:', data);
        setEmpresa(data);
      } else {
        console.error('🔍 Error cargando empresa por ID:', response.status);
      }
    } catch (error) {
      console.error('🔍 Error cargando empresa por ID:', error);
    }
  };

  const buscarEmpresaPorNombre = async (empresaNombre: string) => {
    try {
      console.log('🔍 Buscando empresa por nombre:', empresaNombre);
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const empresas = await response.json();
        console.log('🔍 Todas las empresas cargadas:', empresas.length);
        
        // Buscar empresa por nombre (ignorando mayúsculas/minúsculas)
        const empresaEncontrada = empresas.find((empresa: any) => 
          empresa.nombre && empresa.nombre.toLowerCase() === empresaNombre.toLowerCase()
        );
        
        if (empresaEncontrada) {
          console.log('🔍 Empresa encontrada por nombre:', empresaEncontrada);
          setEmpresa(empresaEncontrada);
        } else {
          console.log('🔍 No se encontró empresa con el nombre:', empresaNombre);
        }
      } else {
        console.error('🔍 Error cargando empresas:', response.status);
      }
    } catch (error) {
      console.error('🔍 Error buscando empresa por nombre:', error);
    }
  };

  const cargarEstadisticasEmpresa = async (empresaId: string) => {
    setLoadingEstadisticas(true);
    setErrorEstadisticas(null);

    try {
      console.log('🔍 Cargando estadísticas de empresa:', empresaId);
      const response = await fetch(`/api/empresas/${empresaId}/estadisticas`);

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      console.log('🔍 Estadísticas de empresa cargadas:', data);

      setEmpresaData({
        ...empresa,
        estadisticas: data.estadisticas,
        participantes: data.participantes
      });
    } catch (err) {
      console.error('🔍 Error cargando estadísticas de empresa:', err);
      setErrorEstadisticas(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const loadDoloresData = async () => {
    try {
      const response = await fetch(`/api/participantes/${id}/dolores`);
      if (response.ok) {
        const data = await response.json();
        setDolores(data || []);
      } else {
        console.error('Error en respuesta de dolores:', response.status);
      }
    } catch (error) {
      console.error('Error cargando dolores:', error);
    }
  };

  const loadUsuariosData = async () => {
    try {
      console.log('🔍 Cargando usuarios...');
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Datos de usuarios recibidos:', data);
        console.log('🔍 Tipo de datos:', typeof data, 'Es array:', Array.isArray(data));
        
        // La API devuelve { usuarios: [...] }
        const usuariosArray = data.usuarios || data || [];
        console.log('🔍 Usuarios procesados:', usuariosArray);
        setUsuarios(usuariosArray);
          } else {
        console.error('🔍 Error en respuesta de usuarios:', response.status);
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
        
        // La API devuelve { investigaciones: [...], total: X, participacionesPorMes: {...} }
        const investigacionesArray = Array.isArray(data.investigaciones) ? data.investigaciones : [];
        console.log('🔍 Array de investigaciones:', investigacionesArray);
        setInvestigaciones(investigacionesArray);
        
        // Usar participacionesPorMes de la API si está disponible, sino calcular
        if (data.participacionesPorMes) {
          console.log('🔍 Participaciones por mes desde API:', data.participacionesPorMes);
          setParticipacionesPorMes(data.participacionesPorMes);
        } else {
          // Calcular participaciones por mes como fallback
          const participacionesPorMes: { [key: string]: number } = {};
          investigacionesArray.forEach((inv: any) => {
            if (inv.fecha_sesion || inv.fecha_participacion) {
              const fecha = new Date(inv.fecha_sesion || inv.fecha_participacion);
              const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
              participacionesPorMes[mes] = (participacionesPorMes[mes] || 0) + 1;
            }
          });
          console.log('🔍 Participaciones por mes calculadas:', participacionesPorMes);
          setParticipacionesPorMes(participacionesPorMes);
        }
          } else {
        console.error('🔍 Error en respuesta de investigaciones:', response.status);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const loadInvestigacionActual = async () => {
    if (reclutamiento?.investigacion_id) {
      try {
        console.log('🔍 Cargando investigación actual:', reclutamiento.investigacion_id);
        const response = await fetch(`/api/investigaciones/${reclutamiento.investigacion_id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Investigación actual cargada:', data);
          console.log('🔍 Investigación actual - responsable_id:', data.responsable_id);
          console.log('🔍 Investigación actual - nombre:', data.nombre);
          setInvestigacionActual(data);
        } else {
          console.error('🔍 Error cargando investigación actual:', response.status);
          const errorText = await response.text();
          console.error('🔍 Error response:', errorText);
        }
      } catch (error) {
        console.error('🔍 Error cargando investigación actual:', error);
      }
    } else {
      console.log('⚠️ No hay investigacion_id en el reclutamiento:', reclutamiento);
    }
  };

  const handleBackToSessions = () => {
    router.push('/sesiones');
  };

  const handleToggleRecording = async () => {
    try {
      if (audioTranscription.state.isRecording) {
        console.log('🛑 Deteniendo grabación...');
        audioTranscription.stopRecording();
        setIsRecording(false);
      } else {
        console.log('🎤 Iniciando grabación...');
        setIsRecording(true);
        
        // Crear nueva transcripción en la base de datos
        if (reclutamiento?.id) {
          console.log('📝 Creando nueva transcripción en BD...');
          const newTranscripcion = await createTranscripcion({
            reclutamiento_id: reclutamiento.id,
            meet_link: reclutamiento.meet_link || '',
            estado: 'grabando'
          });
          
          if (newTranscripcion?.id) {
            setTranscripcionId(newTranscripcion.id);
            console.log('✅ Transcripción creada con ID:', newTranscripcion.id);
          }
        }
        
        // Iniciar grabación con Web Speech API
        audioTranscription.startRecording();
      }
    } catch (error) {
      console.error('❌ Error en grabación:', error);
      setIsRecording(false);
    }
  };

  const startRecording = async () => {
    try {
      // Crear nueva transcripción en la base de datos
      const response = await fetch('/api/transcripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reclutamiento_id: reclutamiento?.id,
          meet_link: reclutamiento?.meet_link || '',
          estado: 'procesando',
          fecha_inicio: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranscripcionId(data.id);
        setIsRecording(true);
        setDuracionGrabacion(0);
        
        // Iniciar timer para duración
        const timer = setInterval(() => {
          setDuracionGrabacion(prev => prev + 1);
        }, 1000);
        
        // Guardar timer en el estado para poder limpiarlo después
        (window as any).recordingTimer = timer;
        
        console.log('🎤 Grabación iniciada:', data.id);
      } else {
        console.error('Error al crear transcripción');
      }
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (transcripcionId) {
        // Actualizar transcripción en la base de datos
        const response = await fetch(`/api/transcripciones/${transcripcionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'completada',
            fecha_fin: new Date().toISOString(),
            duracion_total: duracionGrabacion
          }),
        });

        if (response.ok) {
          console.log('🛑 Grabación detenida:', transcripcionId);
        }
      }
      
      // Limpiar timer
      if ((window as any).recordingTimer) {
        clearInterval((window as any).recordingTimer);
        (window as any).recordingTimer = null;
      }
      
      setIsRecording(false);
      setDuracionGrabacion(0);
      
    } catch (error) {
      console.error('Error al detener grabación:', error);
    }
  };

  // Función para crear nueva transcripción
  const createTranscripcion = async (data?: any) => {
    try {
      const transcripcionData = data || {
        reclutamiento_id: reclutamiento?.id,
        meet_link: reclutamiento?.meet_link || '',
        estado: 'procesando',
        fecha_inicio: new Date().toISOString()
      };

      const response = await fetch('/api/transcripciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transcripcionData),
        });

      if (response.ok) {
        const result = await response.json();
        setTranscripcionId(result.id);
        console.log('📝 Nueva transcripción creada:', result.id);
        return result;
      }
    } catch (error) {
      console.error('Error creando transcripción:', error);
    }
  };

  // Función para actualizar transcripción
  const updateTranscripcion = async (id: string, data: any) => {
    try {
      console.log('💾 Actualizando transcripción con ID:', id);
      console.log('📝 Datos a actualizar:', data);
      
      const response = await fetch(`/api/transcripciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Respuesta de actualización:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Transcripción actualizada exitosamente:', result);
        // Recargar transcripciones
        await loadTranscripciones();
      } else {
        const errorText = await response.text();
        console.error('❌ Error actualizando transcripción:', errorText);
      }
      } catch (error) {
      console.error('❌ Error actualizando transcripción:', error);
    }
  };

  // Función para cargar transcripciones existentes
  const loadTranscripciones = async () => {
    if (!reclutamiento?.id) {
      console.log('❌ No hay reclutamiento ID para cargar transcripciones');
      return;
    }
    
    try {
      console.log('📝 Cargando transcripciones para reclutamiento:', reclutamiento.id);
      const response = await fetch(`/api/transcripciones?reclutamiento_id=${reclutamiento.id}`);
      
      console.log('📥 Respuesta de carga de transcripciones:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Transcripciones cargadas:', data);
        console.log('📊 Cantidad de transcripciones:', data.length);
        
        // Si hay transcripciones, cargar la más reciente
        if (data.length > 0) {
          const ultimaTranscripcion = data[0];
          console.log('📄 Última transcripción:', ultimaTranscripcion);
          setTranscripcionCompleta(ultimaTranscripcion.transcripcion_completa || '');
          setSegmentosTranscripcion(ultimaTranscripcion.transcripcion_por_segmentos || []);
        } else {
          console.log('📭 No hay transcripciones disponibles');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error cargando transcripciones:', errorText);
      }
    } catch (error) {
      console.error('❌ Error cargando transcripciones:', error);
    }
  };

  const handleSaveAndViewSession = async () => {
    try {
      // Actualizar el estado del reclutamiento a "En progreso"
      if (reclutamiento?.investigacion_id) {
        try {
          // Primero obtener el ID del estado "En progreso"
          const estadosResponse = await fetch('/api/estados-reclutamiento');
          const estadosData = await estadosResponse.json();
          
          const estadoEnProgreso = estadosData.estados?.find((estado: any) => 
            estado.nombre?.toLowerCase().includes('progreso') || 
            estado.nombre?.toLowerCase().includes('activa') ||
            estado.nombre?.toLowerCase().includes('iniciada')
          );
          
          if (estadoEnProgreso) {
            const updateResponse = await fetch('/api/actualizar-estado-reclutamiento', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
                investigacion_id: reclutamiento.investigacion_id,
                estado_reclutamiento_id: estadoEnProgreso.id
          }),
        });

            if (updateResponse.ok) {
              console.log('✅ Estado del reclutamiento actualizado a "En progreso"');
            } else {
              console.error('❌ Error actualizando estado del reclutamiento');
            }
          }
        } catch (updateError) {
          console.error('❌ Error actualizando estado:', updateError);
        }
      }
      
      // Guardar la sesión actual en localStorage para futuras referencias
      if (participante?.id && reclutamiento?.id) {
        localStorage.setItem('currentReclutamiento', JSON.stringify({
          participante_id: participante.id,
          reclutamiento_id: reclutamiento.id,
          timestamp: new Date().toISOString()
        }));
      }
      
      // Redirigir a la vista de la sesión (vista completa con tabs)
      if (participante?.id && reclutamiento?.id) {
        router.push(`/participacion/${participante.id}?reclutamiento_id=${reclutamiento.id}`);
      } else {
        // Fallback a la página de sesiones si no hay datos suficientes
        router.push('/sesiones');
      }
      
    } catch (error) {
      console.error('❌ Error iniciando sesión:', error);
      alert('❌ Error al iniciar la sesión');
    }
  };

  // Funciones para dolores
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
        await loadDoloresData();
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
        await loadDoloresData();
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

  // Funciones para manejar seguimientos
  const handleCrearSeguimiento = async (data: SeguimientoFormData) => {
    try {
      const response = await fetch('/api/seguimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          participante_externo_id: participante?.id,
          investigacion_id: investigacionActual?.id || reclutamiento?.investigacion_id,
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

  // Funciones para manejar perfilamientos
  const handleCrearPerfilamiento = async (data: any) => {
    try {
      const response = await fetch('/api/perfilamientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          participante_id: participante?.id
        }),
      });

      if (response.ok) {
        showSuccess('Perfilamiento creado exitosamente');
        setShowCrearPerfilamientoModal(false);
        setCategoriaSeleccionada(null);
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Error al crear el perfilamiento');
      }
    } catch (error) {
      console.error('Error al crear perfilamiento:', error);
      showError('Error al crear el perfilamiento');
    }
  };

  // Funciones para manejar dolores
  const handleCrearDolor = async (data: any) => {
    try {
      console.log('🚀 [SesionActiva] handleCrearDolor INICIANDO');
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 [SesionActiva] Usuario obtenido:', user?.id);
      
      const response = await fetch(`/api/participantes/${id}/dolores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || '',
        },
        body: JSON.stringify(data),
      });
      
      console.log('🔍 [SesionActiva] Response status:', response.status);

      if (response.ok) {
        const dolorCreado = await response.json();
        showSuccess('Dolor creado exitosamente');
        setShowCrearDolorModal(false);
        
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
        await loadDoloresData();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al crear el dolor');
      }
    } catch (error) {
      console.error('Error al crear dolor:', error);
      showError('Error al crear el dolor');
    }
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
      label: 'Fecha',
      sortable: true,
      render: (value: any, row: DolorParticipante) => (
        <Typography variant="body2" color="secondary">
          {row.fecha_creacion ? formatearFecha(row.fecha_creacion) : '-'}
        </Typography>
      )
    }
  ];


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
    // Debug: Log de datos recibidos
    console.log('🔍 InformacionContent - investigaciones recibidas:', investigaciones);
    console.log('🔍 InformacionContent - participacionesPorMes recibidas:', participacionesPorMes);
    console.log('🔍 InformacionContent - participante recibido:', participante);
    
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

                  </div>
    );
  };

  // Componente para el contenido del tab de Información de la Sesión
  const ReclutamientoContent: React.FC<{ reclutamiento: Reclutamiento; participante: Participante }> = ({ reclutamiento, participante }) => {
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

        {/* Observadores */}
        {reclutamiento.observadores && reclutamiento.observadores.length > 0 && (
          <InfoContainer 
            title="Observadores"
            icon={<UsersIcon className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {reclutamiento.observadores.map((observadorId: string, index: number) => (
                <div key={observadorId} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="body1" className="font-medium">
                      {getNombreUsuario(observadorId)}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      {getEmailUsuario(observadorId)}
                    </Typography>
                  </div>
                  <Chip variant="secondary" size="sm">
                    Observador
                  </Chip>
                </div>
              ))}
            </div>
          </InfoContainer>
        )}
        </div>
    );
  };

  const tabs = [
    {
      id: 'notas-manuales',
      label: 'Notas Manuales',
      content: <NotasManualesContent 
        participanteId={participante!.id}
        sesionId={reclutamiento!.id}
        onConvertirADolor={(contenido) => {
          // Pre-llenar el modal de dolor con el contenido de la nota
          setShowCrearDolorModal(true);
          // Guardar el contenido para pre-llenar el modal
          setContenidoNotaParaDolor(contenido);
        }}
        onConvertirAPerfilamiento={(contenido) => {
          // Abrir modal de selección de categoría con todas las notas disponibles
          console.log('🔄 [CONVERSION] Convirtiendo nota a perfilamiento:', contenido);
          
          // Encontrar la nota que se está convirtiendo
          const notaSeleccionada = notasManuales.find(nota => nota.contenido === contenido);
          console.log('🔄 [CONVERSION] Nota encontrada:', notaSeleccionada);
          
          // Guardar la nota pre-seleccionada
          setNotaPreSeleccionada(notaSeleccionada);
          
          setShowPerfilamientoModal(true);
          console.log('🔄 [CONVERSION] Modal de selección de categoría abierto');
        }}
        onNotasChange={(notas) => {
          setNotasManuales(notas);
        }}
        onNotaConvertidaADolor={(notaId, dolorId) => {
          console.log('🔍 [DEBUG] Nota convertida a dolor:', { notaId, dolorId });
          // La función marcarNotaConvertidaADolor se ejecutará automáticamente
        }}
        onNotaConvertidaAPerfilamiento={(notaId, perfilamientoId) => {
          console.log('🔍 [DEBUG] Nota convertida a perfilamiento:', { notaId, perfilamientoId });
          // La función marcarNotaConvertidaAPerfilamiento se ejecutará automáticamente
        }}
      />
    },
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
                        variant={getEstadoEmpresaVariant(empresaData?.estado_nombre || empresa.estado_nombre || 'activa')}
                        size="sm"
                      >
                        {empresaData?.estado_nombre || empresa.estado_nombre || 'Activa'}
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
                        variant={empresaData.relacion_nombre?.toLowerCase() === 'buena' ? 'terminada' : getChipVariant(empresaData.relacion_nombre) as any}
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
              filterOptions={filterOptions}
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
    },
    {
      id: 'notas-automaticas',
      label: 'Notas Automáticas',
      content: (
        <NotasAutomaticasContent
          reclutamientoId={reclutamiento?.id}
          isRecording={audioTranscription.state.isRecording}
          duracionGrabacion={audioTranscription.state.duration}
          transcripcionCompleta={audioTranscription.state.transcription}
          segmentosTranscripcion={audioTranscription.state.segments}
          isProcessing={audioTranscription.state.isProcessing}
          error={audioTranscription.state.error}
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
            <Button 
              onClick={handleToggleRecording}
              variant={audioTranscription.state.isRecording ? "destructive" : "outline"}
              size="md"
              className="flex items-center gap-2"
              disabled={audioTranscription.state.isProcessing}
            >
              {audioTranscription.state.isProcessing ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : audioTranscription.state.isRecording ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Detener Grabación
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Grabar
                </>
              )}
            </Button>
            <Button 
              onClick={handleSaveAndViewSession}
              variant="primary"
              size="md"
            >
              Guardar
            </Button>
            
            {/* Menú de acciones con 3 puntos */}
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
                        setShowCrearDolorModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <AlertTriangleIcon className="w-4 h-4" />
                      Crear Dolor
                    </button>
                  </div>
                </div>
              )}
            </div>
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

      {/* Modales para dolores */}
      {showVerDolorModal && dolorSeleccionado && (
        <DolorSideModal
          isOpen={showVerDolorModal}
          onClose={() => {
            setShowVerDolorModal(false);
            setDolorSeleccionado(null);
          }}
          participanteId={participante?.id || ''}
          participanteNombre={participante?.nombre || ''}
          dolor={dolorSeleccionado}
          onSave={() => {}} // No se usa en modo view
          loading={false}
          readOnly={true}
          onEdit={() => {
            if (dolorSeleccionado) {
              setDolorSeleccionado(dolorSeleccionado);
            }
            setShowVerDolorModal(false);
            setShowEditarDolorModal(true);
          }}
        />
      )}

      {showEditarDolorModal && dolorSeleccionado && (
        <DolorSideModal
          isOpen={showEditarDolorModal}
          onClose={() => {
            setShowEditarDolorModal(false);
            setDolorSeleccionado(null);
          }}
          dolor={dolorSeleccionado}
          mode="edit"
          onSave={handleActualizarDolor}
        />
      )}

      {showDeleteConfirmModal && dolorParaEliminar && (
        <ConfirmModal
          isOpen={showDeleteConfirmModal}
          onClose={() => {
            setShowDeleteConfirmModal(false);
            setDolorParaEliminar(null);
          }}
          onConfirm={confirmarEliminarDolor}
          title="Eliminar Dolor"
          message={`¿Estás seguro de que quieres eliminar el dolor "${dolorParaEliminar.titulo}"? Esta acción no se puede deshacer.`}
          type="error"
          confirmText="Eliminar"
          cancelText="Cancelar"
          size="md"
        />
      )}

      {/* Modal de crear seguimiento */}
      {showSeguimientoModal && participante && (
        <SeguimientoSideModal
          isOpen={showSeguimientoModal}
          onClose={() => setShowSeguimientoModal(false)}
          onSave={handleCrearSeguimiento}
          investigacionId={investigacionActual?.id || reclutamiento?.investigacion_id || ''}
          usuarios={usuarios}
          participanteExternoPrecargado={participante}
          investigaciones={investigaciones}
          responsablePorDefecto={(() => {
            const responsableId = investigacionActual?.responsable_id;
            console.log('🔍 [SesionActiva] Pasando responsable al modal:', {
              investigacionActual: investigacionActual,
              responsableId: responsableId,
              tipo: typeof responsableId
            });
            return responsableId;
          })()}
        />
      )}

      {/* Modal de seleccionar categoría de perfilamiento */}
      {showPerfilamientoModal && participante && (
        <SeleccionarCategoriaPerfilamientoModal
          isOpen={showPerfilamientoModal}
          onClose={() => {
            setShowPerfilamientoModal(false);
            // NO limpiar notaPreSeleccionada aquí, se limpiará en onSuccess del modal de crear perfilamiento
          }}
          onCategoriaSeleccionada={(categoria, nota) => {
            console.log('🔄 [CONVERSION] Categoría seleccionada:', categoria);
            console.log('🔄 [CONVERSION] Nota seleccionada:', nota);
            
            setCategoriaSeleccionada(categoria);
            setNotaPreSeleccionada(nota);
            setShowPerfilamientoModal(false);
            setShowCrearPerfilamientoModal(true);
          }}
          participanteId={participante.id}
          participanteNombre={participante.nombre}
          notasParaConvertir={notasManuales.map(nota => ({
            id: nota.id,
            contenido: nota.contenido,
            fecha_creacion: nota.fecha_creacion
          }))}
          notaPreSeleccionada={notaPreSeleccionada ? {
            id: notaPreSeleccionada.id,
            contenido: notaPreSeleccionada.contenido,
            fecha_creacion: notaPreSeleccionada.fecha_creacion
          } : undefined}
        />
      )}

      {/* Modal de crear perfilamiento específico */}
      {showCrearPerfilamientoModal && categoriaSeleccionada && participante && (
        <CrearPerfilamientoModal
          isOpen={showCrearPerfilamientoModal}
          onClose={() => {
            setShowCrearPerfilamientoModal(false);
            setCategoriaSeleccionada(null);
            setNotaPreSeleccionada(null);
          }}
          participanteId={participante.id}
          participanteNombre={participante.nombre}
          categoria={categoriaSeleccionada}
          descripcionPrecargada={notaPreSeleccionada?.contenido || ''} // Pasar contenido de la nota
          onSuccess={(perfilamientoCreado) => {
            console.log('🔍 [DEBUG] onSuccess llamado con perfilamientoCreado:', perfilamientoCreado);
            console.log('🔍 [DEBUG] notaPreSeleccionada:', notaPreSeleccionada);
            console.log('🔍 [DEBUG] window.marcarNotaConvertidaAPerfilamiento existe:', !!(window as any).marcarNotaConvertidaAPerfilamiento);
            
            setShowCrearPerfilamientoModal(false);
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

      {/* Modal de crear dolor */}
      {showCrearDolorModal && participante && (
        <DolorSideModal
          isOpen={showCrearDolorModal}
          onClose={() => {
            setShowCrearDolorModal(false);
            setContenidoNotaParaDolor(''); // Limpiar contenido al cerrar
          }}
          participanteId={participante.id}
          participanteNombre={participante.nombre}
          onSave={handleCrearDolor}
          descripcionPrecargada={contenidoNotaParaDolor} // Pasar contenido de la nota
        />
      )}
    </Layout>
  );
}