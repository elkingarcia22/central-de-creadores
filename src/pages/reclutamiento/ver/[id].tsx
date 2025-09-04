import React, { useState, useEffect, memo, useCallback } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { Layout, Typography, Card, Button, Tabs, Badge, ActionsMenu, LinkModal, SideModal, ConfirmModal, ProgressBar, ProgressCard, Chip, PageHeader, InfoContainer, InfoItem, ParticipantCard, Subtitle } from '../../../components/ui';
import EditarReclutamientoModal from '../../../components/ui/EditarReclutamientoModal';
import EditarResponsableAgendamientoModal from '../../../components/ui/EditarResponsableAgendamientoModal';
import AgregarParticipanteModal from '../../../components/ui/AgregarParticipanteModal';
import AsignarAgendamientoModal from '../../../components/ui/AsignarAgendamientoModal';
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  DocumentIcon,
  EyeIcon,
  InfoIcon,
  UserIcon,
  ReclutamientoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  MoreVerticalIcon,
  EditIcon,
  CopyIcon,
  TrashIcon,
  PlusIcon,
  SettingsIcon,
  ClipboardListIcon,
  BarChartIcon,
  SesionesIcon,
  LinkIcon,
  ConfiguracionesIcon,
  XIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  EmailIcon,
  UsersIcon
} from '../../../components/icons';
import { formatearFecha } from '../../../utils/fechas';
import { getChipVariant, getChipText } from '../../../utils/chipUtils';
import { getTipoParticipanteVariant, getTipoParticipanteText, getTipoParticipante, getTipoParticipanteBadge } from '../../../utils/tipoParticipanteUtils';
import { getEstadoReclutamientoText, getEstadoReclutamientoVariant, getEstadoAgendamientoBadgeVariant, getEstadoParticipanteVariant, getEstadoParticipanteText } from '../../../utils/estadoUtils';
import { getEstadoAgendamientoText } from '../../../types/reclutamientos';
import { 
  obtenerInvestigacionPorId,
  actualizarLinkPrueba,
  eliminarLinkPrueba,
  actualizarLinkResultados,
  eliminarLinkResultados
} from '../../../api/supabase-investigaciones';
import { 
  obtenerLibretoPorInvestigacion,
  obtenerPlataformas,
  obtenerRolesEmpresa,
  obtenerIndustrias,
  obtenerModalidades,
  obtenerTamanosEmpresa,
  obtenerTiposPrueba,
  obtenerPaises
} from '../../../api/supabase-libretos';
// DropdownMenu import removed - using ActionsMenu instead

interface ReclutamientoDetalle {
  reclutamiento_id: string;
  investigacion_id: string;
  investigacion_nombre: string;
  estado_investigacion: string;
  investigacion_fecha_inicio: string;
  investigacion_fecha_fin: string;
  investigacion_riesgo: string;
  libreto_titulo: string;
  libreto_descripcion: string;
  libreto_numero_participantes: number;
  responsable_nombre: string;
  responsable_correo: string;
  implementador_nombre: string;
  implementador_correo: string;
  estado_reclutamiento_id: string;
  estado_reclutamiento_nombre: string;
  estado_reclutamiento_color: string;
  participantes_reclutados: number;
  progreso_reclutamiento: string;
  porcentaje_completitud: number;
  riesgo_reclutamiento: string;
  riesgo_reclutamiento_color: string;
  dias_restantes_inicio: number;
}

// Interfaz para los datos completos de la investigación (igual que en investigaciones)
interface InvestigacionDetalle {
  id: string;
  nombre: string;
  descripcion?: string;
  objetivo?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  responsable_email?: string;
  implementador_id?: string;
  implementador_nombre?: string;
  implementador_email?: string;
  tipo_investigacion?: string;
  tipo_investigacion_nombre?: string;
  tipo_sesion?: string;
  producto_id?: string;
  producto_nombre?: string;
  periodo_id?: string;
  periodo_nombre?: string;
  link_prueba?: string;
  link_resultados?: string;
  creado_el?: string;
  actualizado_el?: string;
  libreto?: string;
}

const VerReclutamiento: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const reclutamientoId = Array.isArray(id) ? id[0] : id;
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const { userProfile } = useUser();
  
  const [reclutamiento, setReclutamiento] = useState<ReclutamientoDetalle | null>(null);
  const [investigacion, setInvestigacion] = useState<InvestigacionDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Estado inicial de carga
  const [activeTab, setActiveTab] = useState('informacion');
  const [libreto, setLibreto] = useState<any>(null);
  const [loadingLibreto, setLoadingLibreto] = useState(false);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [estadisticasParticipante, setEstadisticasParticipante] = useState<any>(null);
  const [estadisticasEmpresa, setEstadisticasEmpresa] = useState<any>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);  
  // Estados para catálogos de libretos
  const [catalogosLibreto, setCatalogosLibreto] = useState({
    plataformas: [],
    rolesEmpresa: [],
    industrias: [],
    modalidades: [],
    tamanosEmpresa: [],
    tiposPrueba: [],
    paises: []
  });
  
  // Estados para modales y menús
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [currentLinkType, setCurrentLinkType] = useState<'prueba' | 'resultados'>('prueba');
  const [currentLink, setCurrentLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [participanteToEdit, setParticipanteToEdit] = useState<any>(null);
  const [participanteToDelete, setParticipanteToDelete] = useState<any>(null);
  const [deletingParticipante, setDeletingParticipante] = useState(false);
  const [showAgregarParticipanteModal, setShowAgregarParticipanteModal] = useState(false);
  const [showAgregarParticipanteModalNuevo, setShowAgregarParticipanteModalNuevo] = useState(false);
  const [participantePendiente, setParticipantePendiente] = useState<any>(null);
  const [reclutamientoParaModal, setReclutamientoParaModal] = useState<any>(null);
  const [showAsignarAgendamientoModal, setShowAsignarAgendamientoModal] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState('reclutamiento');
  const [isEditing, setIsEditing] = useState(false); // Bandera para evitar recargas durante edición
  const [participanteToEditAgendamiento, setParticipanteToEditAgendamiento] = useState<any>(null);
  const [isClosingAsignarModal, setIsClosingAsignarModal] = useState(false); // Controlar cierre del modal

  // Función global para cargar participantes
  const cargarParticipantes = async () => {
    try {
      console.log('🔄 Cargando participantes...');
      console.log('🔍 ID usado para cargar:', id);
      
      // Verificar que el ID esté disponible
      if (!id) {
        console.log('⚠️ ID no disponible aún, esperando...');
        return;
      }
      
      // Primero obtener todos los reclutamientos de la investigación
      const response = await fetch(`/api/participantes-reclutamiento?investigacion_id=${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Participantes cargados:', data);
        console.log('🔍 Número de participantes:', data.participantes?.length || data.length);
        
        // Log específico para ver los valores de hora_sesion
        if (data.participantes) {
          data.participantes.forEach((participante: any, index: number) => {
            console.log(`🔍 Participante ${index + 1} - ${participante.nombre}:`, {
              id: participante.id,
              nombre: participante.nombre,
              hora_sesion: participante.hora_sesion,
              reclutamiento_id: participante.reclutamiento_id
            });
            
            // Log específico para el participante que estamos editando
            if (participante.nombre === 'prueba 12344') {
              console.log('🎯 PARTICIPANTE ESPECÍFICO - prueba 12344:', {
                hora_sesion: participante.hora_sesion,
                hora_sesion_tipo: typeof participante.hora_sesion,
                hora_sesion_es_null: participante.hora_sesion === null,
                hora_sesion_es_undefined: participante.hora_sesion === undefined
              });
            }
          });
        }
        
        setParticipantes(data.participantes || data);
        
        // Forzar la actualización del estado
        console.log('🔄 Estado actualizado con participantes:', data.participantes?.length || data.length);
        
        // Log específico para ver el estado actual
        setTimeout(() => {
          console.log('🔍 Estado actual después de setParticipantes:', participantes);
        }, 100);
      } else {
        console.error('❌ Error cargando participantes:', response.statusText);
        setParticipantes([]);
      }
    } catch (error) {
      console.error('❌ Error cargando participantes:', error);
      setParticipantes([]);
    }
  };

  // Función para cargar estadísticas del participante
  const cargarEstadisticasParticipante = async (participante: any) => {
    if (!participante) return;
    
    try {
      setLoadingEstadisticas(true);
      setEstadisticasParticipante(null);
      
      const response = await fetch(`/api/estadisticas-participante?email=${encodeURIComponent(participante.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Estadísticas del participante cargadas:', data);
        setEstadisticasParticipante(data);
      } else {
        console.error('❌ Error cargando estadísticas:', response.statusText);
        setEstadisticasParticipante(null);
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      setEstadisticasParticipante(null);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  // Cargar participantes cuando el ID esté disponible
  useEffect(() => {
    if (id) {
      console.log('🔄 ID disponible, cargando participantes:', id);
      cargarParticipantes();
    }
  }, [id]);

  // Monitorear cambios en el estado de participantes
  useEffect(() => {
    console.log('🔄 Estado de participantes cambiado:', participantes.length, 'participantes');
    participantes.forEach((participante, index) => {
      console.log(`🔍 Participante ${index + 1}:`, {
        id: participante.id,
        nombre: participante.nombre,
        hora_sesion: participante.hora_sesion
      });
    });
  }, [participantes]);

  const recargarDatosCompletos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarParticipantes(),
        cargarInvestigacion()
      ]);
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
      showError('Error recargando datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarInvestigacion = async () => {
    try {
      if (!id) return;
      
      const response = await fetch(`/api/investigaciones/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInvestigacion(data);
      }
    } catch (error) {
      console.error('❌ Error cargando investigación:', error);
    }
  };

  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarParticipantes(),
        cargarInvestigacion()
      ]);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      showError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar y cargar datos del reclutamiento
  const actualizarYcargarReclutamiento = useCallback(async () => {
    // 1. Actualizar estados en el backend
    try {
      const res = await fetch('/api/actualizar-estados-reclutamiento', { method: 'POST' });
      const json = await res.json();
      console.log('DEBUG actualización de estados:', json);
    } catch (e) {
      console.warn('No se pudo actualizar estados automáticamente:', e);
    }
    
    // 2. Cargar datos del reclutamiento
    if (!id || typeof id !== 'string') return;
    try {
      if (isInitializing) {
        // Durante la inicialización, usar setLoading para el skeleton
        setLoading(true);
      }
      const response = await fetch('/api/metricas-reclutamientos');
      if (response.ok) {
        const data = await response.json();
        // Buscar por reclutamiento_id o investigacion_id
        const reclutamientoEncontrado = data.investigaciones?.find(
          (r: ReclutamientoDetalle) => 
            r.reclutamiento_id === id || r.investigacion_id === id
        );
        if (reclutamientoEncontrado) {
          setReclutamiento(reclutamientoEncontrado);
        } else {
          showError('No se pudo encontrar el reclutamiento', 'El reclutamiento solicitado no existe');
        }
      } else {
        throw new Error('Error al obtener datos del reclutamiento');
      }
    } catch (error) {
      console.error('Error cargando reclutamiento:', error);
      showError('Error inesperado al cargar el reclutamiento');
    } finally {
      setLoading(false);
      setIsInitializing(false); // Finalizar inicialización
    }
  }, [id, isInitializing, showError]);

  // Cargar los datos del reclutamiento
  useEffect(() => {
    if (!isEditing && id) {
      actualizarYcargarReclutamiento();
    }
  }, [id, isEditing, actualizarYcargarReclutamiento]);

  // Cargar estadísticas del participante cuando se cambie al tab de participante
  useEffect(() => {
    if (modalActiveTab === 'participante' && selectedParticipante) {
      console.log('🔄 Cambiando a tab participante, cargando estadísticas...');
      cargarEstadisticasParticipante(selectedParticipante);
    }
  }, [modalActiveTab, selectedParticipante]);

  // Cargar los datos completos de la investigación cuando tengamos el reclutamiento
  useEffect(() => {
    const cargarInvestigacion = async () => {
      if (reclutamiento?.investigacion_id) {
        try {
          const resultado = await obtenerInvestigacionPorId(reclutamiento.investigacion_id);
          if (!resultado.error && resultado.data) {
            setInvestigacion(resultado.data);
          } else {
            console.error('Error cargando investigación:', resultado.error);
          }
        } catch (error) {
          console.error('Error cargando investigación:', error);
        }
      }
    };
    cargarInvestigacion();
  }, [reclutamiento?.investigacion_id]);

  // Cargar libreto y catálogos cuando tengamos la investigación
  useEffect(() => {
    const cargarDatosCompletos = async () => {
      if (investigacion?.id) {
        try {
          setLoadingLibreto(true);
          
          // Cargar libreto
          const libretoResultado = await obtenerLibretoPorInvestigacion(investigacion.id);
          if (!libretoResultado.error && libretoResultado.data) {
            setLibreto(libretoResultado.data);
          }
          
          // Cargar catálogos
          const [
            plataformasResponse,
            rolesResponse,
            industriasResponse,
            modalidadesResponse,
            tamanosResponse,
            tiposResponse,
            paisesResponse
          ] = await Promise.all([
            obtenerPlataformas(),
            obtenerRolesEmpresa(),
            obtenerIndustrias(),
            obtenerModalidades(),
            obtenerTamanosEmpresa(),
            obtenerTiposPrueba(),
            obtenerPaises()
          ]);
          
          setCatalogosLibreto({
            plataformas: plataformasResponse.data || [],
            rolesEmpresa: rolesResponse.data || [],
            industrias: industriasResponse.data || [],
            modalidades: modalidadesResponse.data || [],
            tamanosEmpresa: tamanosResponse.data || [],
            tiposPrueba: tiposResponse.data || [],
            paises: paisesResponse.data || []
          });
          
        } catch (error) {
          console.error('Error cargando datos completos:', error);
        } finally {
          setLoadingLibreto(false);
        }
      }
    };
    cargarDatosCompletos();
  }, [investigacion?.id]);

  // Cargar participantes cuando cambie el reclutamiento
  useEffect(() => {
    if (!isEditing && (reclutamiento?.reclutamiento_id || reclutamiento?.investigacion_id)) {
      cargarParticipantes();
    }
  }, [reclutamiento?.reclutamiento_id, reclutamiento?.investigacion_id, isEditing]);

  // Ajustar tab activo cuando no hay participantes
  useEffect(() => {
    if (participantes.length === 0 && activeTab === 'reclutamiento') {
      setActiveTab('informacion');
    }
  }, [participantes.length, activeTab]);

  // Función para manejar la edición de un participante
  const handleEditParticipante = async (participante: any) => {
    console.log('🔍 INICIANDO handleEditParticipante con participante:', participante);
    console.log('🔍 Nombre del participante:', participante.nombre);
    console.log('🔍 Estado agendamiento:', participante.estado_agendamiento);
    
    const reclutamientoId = participante.reclutamiento_id || participante.id;
    console.log('🔍 reclutamientoId obtenido:', reclutamientoId);
    
    if (!reclutamientoId) {
      console.error('❌ No se encontró reclutamientoId');
      showError('No se encontró el ID del reclutamiento para este participante.');
      return;
    }
    
    // Verificar si es "Agendamiento Pendiente" - Lógica mejorada
    const esPendienteDeAgendamiento = !participante.fecha_sesion || 
                                     participante.estado_agendamiento === 'Pendiente de agendamiento' || 
                                     participante.estado_agendamiento === 'Pendiente' ||
                                     (participante.tipo === 'agendamiento_pendiente') ||
                                     (participante.reclutador_id && !participante.participante_id) ||
                                     (participante.estado_agendamiento?.nombre === 'Pendiente de agendamiento');
    
    console.log('🔍 esPendienteDeAgendamiento:', esPendienteDeAgendamiento);
    console.log('🔍 Estado agendamiento:', participante.estado_agendamiento);
    console.log('🔍 Fecha sesión:', participante.fecha_sesion);
    console.log('🔍 Tipo participante:', participante.tipo);
    
    if (esPendienteDeAgendamiento) {
      // Para "Agendamiento Pendiente", usar AsignarAgendamientoModal para editar solo el responsable
      console.log('🔍 Abriendo AsignarAgendamientoModal para editar responsable');
      console.log('🔍 Participante completo:', participante);
      console.log('🔍 reclutador_id:', participante.reclutador_id);
      console.log('🔍 reclutador:', participante.reclutador);
      console.log('🔍 reclutador_nombre:', participante.reclutador_nombre);
      console.log('🔍 reclutamiento_id:', participante.reclutamiento_id);
      
      // Obtener el reclutador del reclutamiento
      try {
        console.log('🔍 Obteniendo datos del reclutamiento para obtener reclutador...');
        const response = await fetch(`/api/reclutamientos/${participante.reclutamiento_id}`);
        
        if (response.ok) {
          const reclutamientoData = await response.json();
          console.log('🔍 Datos del reclutamiento obtenidos:', reclutamientoData);
          
          // Crear un participante con el reclutador_id del reclutamiento
          const participanteConReclutador = {
            ...participante,
            reclutador_id: reclutamientoData.reclutador_id || participante.reclutador_id,
            reclutador: reclutamientoData.reclutador || participante.reclutador
          };
          
          console.log('🔍 PARTICIPANTE CON RECLUTADOR:', JSON.stringify(participanteConReclutador, null, 2));
          console.log('🔍 CAMPOS DEL PARTICIPANTE:');
          console.log('- id:', participanteConReclutador.id);
          console.log('- reclutamiento_id:', participanteConReclutador.reclutamiento_id);
          console.log('- reclutador_id:', participanteConReclutador.reclutador_id);
          console.log('- reclutador:', participanteConReclutador.reclutador);
          console.log('- reclutador_nombre:', participanteConReclutador.reclutador_nombre);
          console.log('- nombre:', participanteConReclutador.nombre);
          console.log('- email:', participanteConReclutador.email);
          console.log('- estado_agendamiento:', participanteConReclutador.estado_agendamiento);
          
          setParticipanteToEditAgendamiento(participanteConReclutador);
          setShowAsignarAgendamientoModal(true);
        } else {
          console.error('❌ Error obteniendo datos del reclutamiento:', response.statusText);
          // Usar el participante original si no se pueden obtener los datos del reclutamiento
          setParticipanteToEditAgendamiento(participante);
          setShowAsignarAgendamientoModal(true);
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos del reclutamiento:', error);
        // Usar el participante original si hay error
        setParticipanteToEditAgendamiento(participante);
        setShowAsignarAgendamientoModal(true);
      }
      return;
    }
    
    // Para participantes normales, usar el flujo existente
    try {
      console.log('🔍 Debug handleEditParticipante - participante:', participante);
      console.log('🔍 Debug handleEditParticipante - reclutamientoId:', reclutamientoId);
      
      const response = await fetch(`/api/reclutamientos/${reclutamientoId}`);
      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const debugData = await response.json();
        console.log('🔍 Debug handleEditParticipante - debugData:', debugData);
        
        if (!debugData) {
          console.error('❌ No se obtuvieron datos del reclutamiento');
          showError('No se pudieron obtener los datos del reclutamiento.');
          return;
        }
        
        const reclutamientoData = {
          id: reclutamientoId,
          participantes_id: debugData.participantes_id || participante.id,
          reclutador_id: debugData.reclutador_id || '',
          fecha_sesion: debugData.fecha_sesion || participante.fecha_sesion,
          investigacion_id: reclutamiento?.investigacion_id || '',
          duracion_sesion: debugData.duracion_sesion,
          tipo_participante: participante.tipo || 'externo',
          es_agendamiento_pendiente: false // Participantes normales no son agendamiento pendiente
        };
        console.log('🔍 Debug handleEditParticipante - reclutamientoData:', reclutamientoData);
        console.log('🔍 Configurando modal de edición...');
        setParticipanteToEdit(reclutamientoData);
        setShowEditModal(true);
        console.log('🔍 Modal configurado, showEditModal debería ser true');
      } else {
        console.error('❌ Error obteniendo datos del reclutamiento:', response.statusText);
        showError('Error obteniendo datos del reclutamiento');
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos del reclutamiento:', error);
      showError('Error obteniendo datos del reclutamiento');
    }
  };

  // Función para manejar la eliminación de un participante
  const handleDeleteParticipante = (participante: any) => {
    setParticipanteToDelete(participante);
    setShowDeleteModal(true);
  };

  // Función para confirmar la eliminación
  const confirmDeleteParticipante = async () => {
    if (!participanteToDelete) return;
    
    try {
      setDeletingParticipante(true);
      
      // Eliminar el reclutamiento por su id
      const reclutamientoId = participanteToDelete.reclutamiento_id || participanteToDelete.id;
      const response = await fetch(`/api/reclutamientos/${reclutamientoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Reclutamiento eliminado correctamente');
        // Recargar datos completos (participantes + reclutamiento + métricas)
        await recargarDatosCompletos();
        await actualizarYcargarReclutamiento();
        setShowDeleteModal(false);
        setParticipanteToDelete(null);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al eliminar el reclutamiento');
      }
    } catch (error) {
      console.error('Error eliminando reclutamiento:', error);
      showError('Error al eliminar el reclutamiento');
    } finally {
      setDeletingParticipante(false);
    }
  };

  // Función para guardar la edición del participante
  const handleSaveEditParticipante = async (reclutamientoData: any) => {
    try {
      setIsEditing(true); // Activar bandera de edición
      console.log('🔍 INICIANDO handleSaveEditParticipante con datos:', reclutamientoData);
      
      const response = await fetch(`/api/reclutamientos/${reclutamientoData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reclutamientoData),
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const updatedReclutamiento = await response.json();
        console.log('✅ Reclutamiento actualizado exitosamente:', updatedReclutamiento);
        
        console.log('🔄 Recargando datos después de editar...');
        
        // Solo recargar datos completos una vez
        await recargarDatosCompletos();
        
        console.log('✅ Datos recargados exitosamente');
      } else {
        console.error('❌ Error actualizando reclutamiento:', response.statusText);
        showError('Error al actualizar el reclutamiento');
      }
    } catch (error) {
      console.error('❌ Error en handleSaveEditParticipante:', error);
      showError('Error al actualizar el reclutamiento');
    } finally {
      setIsEditing(false); // Desactivar bandera de edición
    }
  };

  // Manejar el parámetro URL del tab activo
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [router.query]);

  // Funciones para manejar links (igual que en investigaciones)
  const handleSaveLinkPrueba = async (link: string) => {
    if (!investigacion?.id) return;
    try {
      const resultado = await actualizarLinkPrueba(investigacion.id, link);
      if (!resultado.error) {
        showSuccess('Link de prueba actualizado correctamente');
        setShowLinkModal(false);
        // Actualizar el estado local
        setInvestigacion(prev => prev ? { ...prev, link_prueba: link } : null);
      } else {
        showError('Error al actualizar el link de prueba', resultado.error);
      }
    } catch (error) {
      showError('Error al actualizar el link de prueba');
    }
  };

  const handleDeleteLinkPrueba = async () => {
    if (!investigacion?.id) return;
    try {
      const resultado = await eliminarLinkPrueba(investigacion.id);
      if (!resultado.error) {
        showSuccess('Link de prueba eliminado correctamente');
        setShowLinkModal(false);
        // Actualizar el estado local
        setInvestigacion(prev => prev ? { ...prev, link_prueba: undefined } : null);
      } else {
        showError('Error al eliminar el link de prueba', resultado.error);
      }
    } catch (error) {
      showError('Error al eliminar el link de prueba');
    }
  };

  const handleSaveLinkResultados = async (link: string) => {
    if (!investigacion?.id) return;
    try {
      const resultado = await actualizarLinkResultados(investigacion.id, link);
      if (!resultado.error) {
        showSuccess('Link de resultados actualizado correctamente');
        setShowLinkModal(false);
        // Actualizar el estado local
        setInvestigacion(prev => prev ? { ...prev, link_resultados: link } : null);
      } else {
        showError('Error al actualizar el link de resultados', resultado.error);
      }
    } catch (error) {
      showError('Error al actualizar el link de resultados');
    }
  };

  const handleDeleteLinkResultados = async () => {
    if (!investigacion?.id) return;
    try {
      const resultado = await eliminarLinkResultados(investigacion.id);
      if (!resultado.error) {
        showSuccess('Link de resultados eliminado correctamente');
        setShowLinkModal(false);
        // Actualizar el estado local
        setInvestigacion(prev => prev ? { ...prev, link_resultados: undefined } : null);
      } else {
        showError('Error al eliminar el link de resultados', resultado.error);
      }
    } catch (error) {
      showError('Error al eliminar el link de resultados');
    }
  };

  // Acciones del menú
  const menuActions = [
    {
      label: 'Editar Reclutamiento',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: () => {
        showInfo('Funcionalidad en desarrollo', 'La edición de reclutamientos estará disponible próximamente');
      }
    },
    {
      label: 'Duplicar Reclutamiento',
      icon: <CopyIcon className="w-4 h-4" />,
      onClick: () => {
        showInfo('Funcionalidad en desarrollo', 'La duplicación de reclutamientos estará disponible próximamente');
      }
    },
    {
      label: 'Eliminar Reclutamiento',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => {
        showWarning('Funcionalidad en desarrollo', 'La eliminación de reclutamientos estará disponible próximamente'); 
      },
      variant: 'destructive'
    }
  ];

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'en_borrador':
        return 'default';
      case 'por_agendar':
        return 'warning';
      case 'por_iniciar':
        return 'info';
      case 'en_progreso':
        return 'info';
      case 'finalizado':
        return 'success';
      case 'pausado':
        return 'secondary';
      case 'cancelado':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Formatear el estado para mostrar
  const formatearEstado = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'en_borrador':
        return 'En Borrador';
      case 'por_agendar':
        return 'Por Agendar';
      case 'por_iniciar':
        return 'Por Iniciar';
      case 'en_progreso':
        return 'En Progreso';
      case 'finalizado':
        return 'Finalizado';
      case 'pausado':
        return 'Pausado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado || 'Sin estado';
    }
  };

  // Función para obtener el color del estado de agendamiento
  const getEstadoAgendamientoColor = (estado: string): string => {
    if (!estado) return '#6B7280';
    
    switch (estado.toLowerCase()) {
      case 'pendiente de agendamiento':
        return '#F59E0B'; // Amarillo
      case 'pendiente':
        return '#F59E0B'; // Amarillo
      case 'en progreso':
        return '#3B82F6'; // Azul
      case 'finalizado':
        return '#10B981'; // Verde
      case 'cancelado':
        return '#EF4444'; // Rojo
      case 'confirmado':
        return '#8B5CF6'; // Púrpura
      case 'reprogramado':
        return '#6B7280'; // Gris
      case 'no show':
        return '#6B7280'; // Gris
      default:
        return '#6B7280'; // Gris por defecto
    }
  };

  // Función para obtener el variant del badge basado en el estado
  const getEstadoAgendamientoBadgeVariant = (estado: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
    if (!estado) return 'default';
    
    switch (estado.toLowerCase()) {
      case 'pendiente de agendamiento':
        return 'warning';
      case 'pendiente':
        return 'warning';
      case 'en progreso':
        return 'primary';
      case 'finalizado':
        return 'success';
      case 'cancelado':
        return 'danger';
      case 'confirmado':
        return 'info';
      case 'reprogramado':
        return 'secondary';
      case 'no show':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Función para determinar el tipo de participante
  const getTipoParticipante = (participante: any): 'externo' | 'interno' | 'friend_family' => {
    // Usar el campo tipo_participante si está disponible
    if (participante.tipo_participante) {
      switch (participante.tipo_participante) {
        case 'interno':
          return 'interno';
        case 'friend_family':
          return 'friend_family';
        case 'externo':
          return 'externo';
        default:
          return 'externo';
      }
    }
    
    // Fallback a la lógica anterior si no hay tipo_participante
    if (participante.participantes_internos_id) {
      return 'interno';
    }
    if (participante.participantes_friend_family_id) {
      return 'friend_family';
    }
    
    return 'externo';
  };

  // Función para obtener el badge del tipo de participante
  const getTipoParticipanteBadge = (participante: any) => {
    const tipo = getTipoParticipante(participante);
    
    switch (tipo) {
      case 'interno':
        return (
          <Chip variant="info" size="sm">
            Participante Interno
          </Chip>
        );
      case 'friend_family':
        return (
          <Chip variant="secondary" size="sm">
            Friend and Family
          </Chip>
        );
      case 'externo':
      default:
        return (
          <Chip variant="primary" size="sm">
            Participante Externo
          </Chip>
        );
    }
  };

  // Función para obtener datos específicos según el tipo de participante
  const getDatosEspecificosParticipante = (participante: any) => {
    const tipo = getTipoParticipante(participante);
    
    switch (tipo) {
      case 'interno':
        return {
          departamento: typeof participante.departamento === 'object' && participante.departamento?.nombre
            ? participante.departamento.nombre
            : (typeof participante.departamento === 'string' 
                ? participante.departamento 
                : 'Sin departamento'),
          rol: participante.rol_empresa || 'Empleado Interno'
        };
      case 'friend_family':
        return {
          departamento: typeof participante.departamento === 'object' && participante.departamento?.nombre
            ? participante.departamento.nombre
            : (typeof participante.departamento === 'string' 
                ? participante.departamento 
                : 'Sin departamento'),
          rol: participante.rol_empresa || 'Sin rol especificado'
        };
      case 'externo':
      default:
        return {
          empresa: typeof participante.empresa === 'object' && participante.empresa?.nombre 
            ? participante.empresa.nombre 
            : (typeof participante.empresa === 'string' 
                ? participante.empresa 
                : 'Sin empresa asignada'),
          rol: participante.rol_empresa || 'Sin rol especificado',
          cargo: participante.cargo
        };
    }
  };

  // Componente para el contenido del tab de Reclutamiento - SOLO INFORMACIÓN DEL AGENDAMIENTO
  const ReclutamientoTabContent = memo(() => (
    <div className="space-y-6">
      {/* Información del agendamiento */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <Typography variant="h5">Información del Agendamiento</Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedParticipante.fecha_sesion && (
            <div>
              <Typography variant="caption" color="secondary">Fecha de Sesión</Typography>
              <Typography variant="body2" className="font-medium">
                {new Date(selectedParticipante.fecha_sesion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </div>
          )}
          
          {selectedParticipante.hora_sesion && (
            <div>
              <Typography variant="caption" color="secondary">Hora de Sesión</Typography>
              <Typography variant="body2" className="font-medium">
                {selectedParticipante.hora_sesion}
              </Typography>
            </div>
          )}
          
          <div>
            <Typography variant="caption" color="secondary">Estado del Agendamiento</Typography>
            <div className="mt-1">
              <Chip 
                variant={getEstadoAgendamientoBadgeVariant(
                  typeof selectedParticipante.estado_agendamiento === 'object' 
                    ? selectedParticipante.estado_agendamiento.nombre 
                    : selectedParticipante.estado_agendamiento
                )}
                size="sm"
              >
                {typeof selectedParticipante.estado_agendamiento === 'object' 
                  ? selectedParticipante.estado_agendamiento.nombre 
                  : selectedParticipante.estado_agendamiento || 'Sin estado'}
              </Chip>
            </div>
          </div>
          
          <div>
            <Typography variant="caption" color="secondary">Responsable del Agendamiento</Typography>
            <Typography variant="body2" className="font-medium">
              {selectedParticipante.responsable_agendamiento?.nombre || 
               selectedParticipante.responsable_agendamiento?.full_name || 
               selectedParticipante.reclutador_nombre || 
               'Sin responsable'}
            </Typography>
          </div>

          {selectedParticipante.duracion_sesion && (
            <div>
              <Typography variant="caption" color="secondary">Duración de Sesión</Typography>
              <Typography variant="body2">
                {selectedParticipante.duracion_sesion} minutos
              </Typography>
            </div>
          )}

          {selectedParticipante.modalidad && (
            <div>
              <Typography variant="caption" color="secondary">Modalidad</Typography>
              <Typography variant="body2">
                {selectedParticipante.modalidad}
              </Typography>
            </div>
          )}

          {selectedParticipante.plataforma && (
            <div>
              <Typography variant="caption" color="secondary">Plataforma</Typography>
              <Typography variant="body2">
                {selectedParticipante.plataforma}
              </Typography>
            </div>
          )}

          {selectedParticipante.fecha_asignado && (
            <div>
              <Typography variant="caption" color="secondary">Fecha de Asignación</Typography>
              <Typography variant="body2">
                {formatearFecha(selectedParticipante.fecha_asignado)}
              </Typography>
            </div>
          )}

          {selectedParticipante.fecha_creacion && (
            <div>
              <Typography variant="caption" color="secondary">Fecha de Creación</Typography>
              <Typography variant="body2">
                {formatearFecha(selectedParticipante.fecha_creacion)}
              </Typography>
            </div>
          )}
        </div>
      </Card>
    </div>
  ));

  // Componente para el contenido del tab de Participante
  const ParticipanteTabContent = memo(() => (
    <div className="space-y-6">
      {/* Estadísticas de Participación */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <Typography variant="h5">Estadísticas de Participación</Typography>
        </div>
        
        {loadingEstadisticas ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <Typography variant="body2" className="ml-2">Cargando estadísticas...</Typography>
          </div>
        ) : estadisticasParticipante ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total de Participaciones */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChartIcon className="w-5 h-5 text-blue-600" />
                <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-300">
                  Total de Participaciones
                </Typography>
              </div>
              <Typography variant="h4" className="text-blue-600 font-bold">
                {estadisticasParticipante.total_participaciones}
              </Typography>
              <Typography variant="caption" color="secondary">
                Todas las participaciones en reclutamientos
              </Typography>
            </div>

            {/* Última Sesión */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-green-600" />
                <Typography variant="subtitle2" className="font-semibold text-green-700 dark:text-green-300">
                  Última Sesión
                </Typography>
              </div>
              {(() => {
                // Manejar diferentes estructuras de ultima_sesion según el tipo de participante
                const tipoParticipante = getTipoParticipante(selectedParticipante);
                
                if (tipoParticipante === 'externo') {
                  // Para participantes externos, ultima_sesion tiene estructura { fecha, investigacion }
                  return estadisticasParticipante.ultima_sesion && estadisticasParticipante.ultima_sesion.fecha ? (
                    <>
                      <Typography variant="h4" className="text-green-600 font-bold">
                        {new Date(estadisticasParticipante.ultima_sesion.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="caption" color="secondary" className="block mb-2">
                        {estadisticasParticipante.ultima_sesion.investigacion || 'Investigación sin nombre'}
                      </Typography>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline p-0 h-auto"
                        onClick={() => {
                          if ((estadisticasParticipante as any).ultima_investigacion?.id) {
                            router.push(`/investigaciones/ver/${(estadisticasParticipante as any).ultima_investigacion.id}`);
                          }
                        }}
                      >
                        Ver investigación
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" className="text-green-600 font-bold">
                        -
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Sin sesiones registradas
                      </Typography>
                    </>
                  );
                } else {
                  // Para participantes internos y friend & family, ultima_sesion es directamente la fecha
                  return estadisticasParticipante.ultima_sesion ? (
                    <>
                      <Typography variant="h4" className="text-green-600 font-bold">
                        {new Date(estadisticasParticipante.ultima_sesion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="caption" color="secondary" className="block mb-2">
                        {(estadisticasParticipante as any).ultima_investigacion?.nombre || 'Investigación sin nombre'}
                      </Typography>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline p-0 h-auto"
                        onClick={() => {
                          if ((estadisticasParticipante as any).ultima_investigacion?.id) {
                            router.push(`/investigaciones/ver/${(estadisticasParticipante as any).ultima_investigacion.id}`);
                          }
                        }}
                      >
                        Ver investigación
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" className="text-green-600 font-bold">
                        -
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Sin sesiones registradas
                      </Typography>
                    </>
                  );
                }
              })()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h6" color="secondary">Sin estadísticas disponibles</Typography>
            <Typography variant="body2" color="secondary">
              Este participante aún no tiene registros de participación en investigaciones.
            </Typography>
            {/* Debug info */}
            <div className="mt-4 p-2 bg-red-100 text-xs">
              DEBUG: estadisticasParticipante es null o undefined
            </div>
          </div>
        )}
      </Card>

      {/* Información personal */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-primary" />
          <Typography variant="h5">Información Personal</Typography>
        </div>
        <div className="space-y-3">
          <div>
            <Typography variant="caption" color="secondary">Nombre</Typography>
            <Typography variant="body2">
              {typeof selectedParticipante.nombre === 'object' && selectedParticipante.nombre.nombre 
                ? selectedParticipante.nombre.nombre 
                : typeof selectedParticipante.nombre === 'string' 
                  ? selectedParticipante.nombre 
                  : 'Sin nombre'}
            </Typography>
          </div>
          {selectedParticipante.email && (
            <div>
              <Typography variant="caption" color="secondary">Email</Typography>
              <Typography variant="body2">{selectedParticipante.email}</Typography>
            </div>
          )}
          {selectedParticipante.tipo && (
            <div>
              <Typography variant="caption" color="secondary">Tipo de Cliente</Typography>
              <Chip variant={getTipoParticipanteVariant(selectedParticipante.tipo)} size="sm">
                {getTipoParticipanteText(selectedParticipante.tipo)}
              </Chip>
            </div>
          )}
          {selectedParticipante.tipo === 'externo' && selectedParticipante.estado_participante && (
            <div>
              <Typography variant="caption" color="secondary">Estado del Participante</Typography>
              <Badge variant="success" size="sm">
                {selectedParticipante.estado_participante}
              </Badge>
            </div>
          )}
          {/* Cargo solo para participantes externos que lo tengan */}
          {selectedParticipante.tipo === 'externo' && selectedParticipante.cargo && (
            <div>
              <Typography variant="caption" color="secondary">Cargo</Typography>
              <Typography variant="body2">{selectedParticipante.cargo}</Typography>
            </div>
          )}
          {(selectedParticipante.tipo === 'externo' || selectedParticipante.tipo === 'friend_family') && selectedParticipante.rol_empresa && (
            <div>
              <Typography variant="caption" color="secondary">Rol en la Empresa</Typography>
              <Typography variant="body2">{selectedParticipante.rol_empresa}</Typography>
            </div>
          )}
          {selectedParticipante.tipo === 'interno' && (
            <div>
              <Typography variant="caption" color="secondary">Rol en la Empresa</Typography>
              <Typography variant="body2">Empleado Interno</Typography>
            </div>
          )}
          {(selectedParticipante.tipo === 'interno' || selectedParticipante.tipo === 'friend_family') && selectedParticipante.departamento && (
            <div>
              <Typography variant="caption" color="secondary">Departamento</Typography>
              {typeof selectedParticipante.departamento === 'object' && selectedParticipante.departamento.nombre ? (
                <>
                  <Typography variant="body2">{selectedParticipante.departamento.nombre}</Typography>
                  {selectedParticipante.departamento.categoria && (
                    <Typography variant="caption" color="secondary" className="block mt-1">
                      Categoría: {selectedParticipante.departamento.categoria}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2">
                  {typeof selectedParticipante.departamento === 'string' 
                    ? selectedParticipante.departamento 
                    : 'Sin departamento'}
                </Typography>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dolores y Necesidades (solo para externos) */}
      {selectedParticipante.tipo === 'externo' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangleIcon className="w-5 h-5 text-warning" />
            <Typography variant="h5">Dolores y Necesidades</Typography>
          </div>
          <div className="space-y-3">
            <div>
              <Typography variant="body2" className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {selectedParticipante.doleres_necesidades || 'Sin dolores y necesidades registrados'}
              </Typography>
            </div>
          </div>
        </Card>
      )}

      {/* Comentarios del Participante (solo para externos) */}
      {selectedParticipante.tipo === 'externo' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <InfoIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Comentarios</Typography>
          </div>
          <div className="space-y-3">
            <div>
              <Typography variant="body2" className="whitespace-pre-wrap">
                {selectedParticipante.comentarios || 'Sin comentarios registrados'}
              </Typography>
            </div>
          </div>
        </Card>
      )}


    </div>
  ));

  // Componente para el contenido del tab de Empresa
  const EmpresaTabContent = memo(() => {
    console.log('🔍 DEBUG: EmpresaTabContent renderizando');
    console.log('🔍 DEBUG: selectedParticipante:', selectedParticipante);
    console.log('🔍 DEBUG: selectedParticipante.tipo:', selectedParticipante?.tipo);
    console.log('🔍 DEBUG: estadisticasEmpresa:', estadisticasEmpresa);
    console.log('🔍 DEBUG: loadingEstadisticas:', loadingEstadisticas);
    console.log('🔍 DEBUG: modalActiveTab:', modalActiveTab);
    
    // Verificar si la pestaña está activa
    const isActive = modalActiveTab === 'empresa';
    console.log('🔍 DEBUG: ¿Pestaña empresa activa?:', isActive);
    
    return (
      <div className="space-y-6">
        {/* Estadísticas de Participación de la Empresa */}
        {selectedParticipante.tipo === 'externo' && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <Typography variant="h5">Estadísticas de Participación</Typography>
            </div>
            
            {loadingEstadisticas ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <Typography variant="body2" className="ml-2">Cargando estadísticas...</Typography>
              </div>
            ) : estadisticasEmpresa ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total de Participaciones - RECREADO DESDE CERO */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChartIcon className="w-5 h-5 text-blue-600" />
                    <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-300">
                      Total de Participaciones
                    </Typography>
                  </div>
                  <Typography variant="h4" className="text-blue-600 font-bold">
                    {(() => {
                      const total = estadisticasEmpresa.total_participaciones;
                      console.log('🎯 RENDERIZANDO TOTAL PARTICIPACIONES:', total);
                      console.log('🎯 TIPO DE VALOR:', typeof total);
                      console.log('🎯 ESTADISTICAS COMPLETAS:', estadisticasEmpresa);
                      return total;
                    })()}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    investigaciones completadas
                  </Typography>
                </div>

                {/* Última Sesión */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                    <Typography variant="subtitle2" className="font-semibold text-green-700 dark:text-green-300">
                      Última Sesión
                    </Typography>
                  </div>
                  {estadisticasEmpresa.ultima_sesion ? (
                    <>
                      <Typography variant="body2" className="font-medium">
                        Última participación
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        {(() => {
                          try {
                            // Manejar tanto formato objeto como cadena
                            const fecha = typeof estadisticasEmpresa.ultima_sesion === 'string' 
                              ? estadisticasEmpresa.ultima_sesion 
                              : estadisticasEmpresa.ultima_sesion.fecha;
                            
                            return new Date(fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                          } catch (error) {
                            console.error('Error formateando fecha:', error);
                            return 'Fecha no disponible';
                          }
                        })()}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="secondary">
                      Sin sesiones registradas
                    </Typography>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Typography variant="h6" color="secondary">Sin estadísticas disponibles</Typography>
                <Typography variant="body2" color="secondary">
                  Esta empresa aún no tiene registros de participación en investigaciones.
                </Typography>
              </div>
            )}
          </Card>
        )}

        {/* Información básica de la empresa */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BuildingIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Información de la Empresa</Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedParticipante.empresa_nombre && (
              <div>
                <Typography variant="caption" color="secondary">Nombre de la Empresa</Typography>
                <Typography variant="body2" className="font-medium">
                  {selectedParticipante.empresa_nombre}
                </Typography>
              </div>
            )}

            {selectedParticipante.empresa_id && (
              <div>
                <Typography variant="caption" color="secondary">ID de la Empresa</Typography>
                <Typography variant="body2" className="font-mono text-xs">
                  {selectedParticipante.empresa_id}
                </Typography>
              </div>
            )}

            {selectedParticipante.rol_empresa && (
              <div>
                <Typography variant="caption" color="secondary">Rol en la Empresa</Typography>
                <Typography variant="body2">
                  {selectedParticipante.rol_empresa}
                </Typography>
              </div>
            )}

            {selectedParticipante.cargo && (
              <div>
                <Typography variant="caption" color="secondary">Cargo</Typography>
                <Typography variant="body2">
                  {selectedParticipante.cargo}
                </Typography>
              </div>
            )}
          </div>
        </Card>

        {/* Estado del participante */}
        {selectedParticipante.estado_calculado && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangleIcon className="w-5 h-5 text-primary" />
              <Typography variant="h5">Estado del Participante</Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="caption" color="secondary">Estado Actual</Typography>
                <div className="mt-1">
                  <Chip
                    variant={selectedParticipante.estado_calculado.estado === 'Enfriamiento' ? 'warning' : 'success'}
                    size="sm"
                    className="text-white"
                  >
                    {selectedParticipante.estado_calculado.estado}
                  </Chip>
                </div>
              </div>

              {selectedParticipante.cantidad_participaciones && (
                <div>
                  <Typography variant="caption" color="secondary">Cantidad de Participaciones</Typography>
                  <Typography variant="body2" className="font-medium">
                    {selectedParticipante.cantidad_participaciones} sesiones
                  </Typography>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Productos relacionados */}
        {selectedParticipante.productos_relacionados && selectedParticipante.productos_relacionados.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BuildingIcon className="w-5 h-5 text-primary" />
              <Typography variant="h5">Productos Relacionados</Typography>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedParticipante.productos_relacionados.map((producto: any, index: number) => (
                <Chip key={index} variant="secondary" size="sm">
                  {producto}
                </Chip>
              ))}
            </div>
          </Card>
        )}

        {/* Información de contacto */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <EmailIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Información de Contacto</Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="caption" color="secondary">Email</Typography>
              <Typography variant="body2">
                {selectedParticipante.email || 'Sin email'}
              </Typography>
            </div>

            {selectedParticipante.telefono && (
              <div>
                <Typography variant="caption" color="secondary">Teléfono</Typography>
                <Typography variant="body2">
                  {selectedParticipante.telefono}
                </Typography>
              </div>
            )}
          </div>
        </Card>

        {/* Información adicional */}
        {selectedParticipante.dolores_necesidades && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangleIcon className="w-5 h-5 text-warning" />
              <Typography variant="h5">Dolores y Necesidades</Typography>
            </div>
            
            <Typography variant="body2">
              {selectedParticipante.dolores_necesidades}
            </Typography>
          </Card>
        )}

        {selectedParticipante.comentarios && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileTextIcon className="w-5 h-5 text-primary" />
              <Typography variant="h5">Comentarios</Typography>
            </div>
            
            <Typography variant="body2">
              {selectedParticipante.comentarios}
            </Typography>
          </Card>
        )}

        {/* Información de fechas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-primary" />
            <Typography variant="h5">Información de Fechas</Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedParticipante.created_at && (
              <div>
                <Typography variant="caption" color="secondary">Fecha de Creación</Typography>
                <Typography variant="body2">
                  {new Date(selectedParticipante.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </div>
            )}

            {selectedParticipante.updated_at && (
              <div>
                <Typography variant="caption" color="secondary">Última Actualización</Typography>
                <Typography variant="body2">
                  {new Date(selectedParticipante.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  });



  const EmptyState: React.FC<{
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    actionText?: string;
    onAction?: () => void;
  }> = ({ icon, title, description, actionText, onAction }) => (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-muted rounded-full">
          {icon}
        </div>
      </div>
      <Typography variant="h4" className="mb-2">{title}</Typography>
      <Typography variant="body1" color="secondary" className="mb-6 max-w-md mx-auto">
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );

  // Contenido del tab Información - usando datos de la investigación (igual que en investigaciones)
  const InformacionGeneral: React.FC = () => (
    <div className="space-y-6">
      {/* Información básica */}
      {investigacion?.objetivo && (
        <InfoContainer title="Objetivo" icon={<CheckCircleIcon className="w-4 h-4" />}>
          <InfoItem 
            label="Descripción del objetivo" 
            value={investigacion.objetivo}
            size="lg"
          />
        </InfoContainer>
      )}

      {/* Detalles del proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fechas */}
        <InfoContainer 
          title="Fechas"
          icon={<ClockIcon className="w-4 h-4" />}
        >
          {investigacion?.fecha_inicio && (
            <InfoItem 
              label="Fecha de inicio" 
              value={formatearFecha(investigacion.fecha_inicio)}
            />
          )}
          {investigacion?.fecha_fin && (
            <InfoItem 
              label="Fecha de fin" 
              value={formatearFecha(investigacion.fecha_fin)}
            />
          )}
          <InfoItem 
            label="Creada" 
            value={formatearFecha(investigacion?.creado_el || '')}
          />
        </InfoContainer>

        {/* Equipo */}
        <InfoContainer 
          title="Equipo"
          icon={<UsersIcon className="w-4 h-4" />}
        >
          {investigacion?.responsable_nombre && (
            <InfoItem 
              label="Responsable" 
              value={
                <div>
                  <div>{investigacion.responsable_nombre}</div>
                  {investigacion.responsable_email && (
                    <div className="text-sm text-gray-500">{investigacion.responsable_email}</div>
                  )}
                </div>
              }
            />
          )}
          {investigacion?.implementador_nombre && (
            <InfoItem 
              label="Implementador" 
              value={
                <div>
                  <div>{investigacion.implementador_nombre}</div>
                  {investigacion.implementador_email && (
                    <div className="text-sm text-gray-500">{investigacion.implementador_email}</div>
                  )}
                </div>
              }
            />
          )}
        </InfoContainer>

        {/* Links */}
        <InfoContainer 
          title="Enlaces"
          icon={<LinkIcon className="w-4 h-4" />}
        >
          <div>
            <InfoItem 
              label="Link de prueba"
              value={
                investigacion?.link_prueba ? (
                  <div className="flex items-center gap-2">
                    <a 
                      href={investigacion.link_prueba} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                    >
                      {investigacion.link_prueba}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentLinkType('prueba');
                        setCurrentLink(investigacion.link_prueba || '');
                        setShowLinkModal(true);
                      }}
                    >
                      <EditIcon className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCurrentLinkType('prueba');
                      setCurrentLink('');
                      setShowLinkModal(true);
                    }}
                  >
                    Agregar link
                  </Button>
                )
              }
            />
          </div>

          <div>
            <InfoItem 
              label="Link de resultados"
              value={
                investigacion?.link_resultados ? (
                  <div className="flex items-center gap-2">
                    <a 
                      href={investigacion.link_resultados} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                    >
                      {investigacion.link_resultados}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentLinkType('resultados');
                        setCurrentLink(investigacion.link_resultados || '');
                        setShowLinkModal(true);
                      }}
                    >
                      <EditIcon className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCurrentLinkType('resultados');
                      setCurrentLink('');
                      setShowLinkModal(true);
                    }}
                  >
                    Agregar link
                  </Button>
                )
              }
            />
          </div>
        </InfoContainer>

        {/* Configuración */}
        <InfoContainer 
          title="Configuración"
          icon={<SettingsIcon className="w-4 h-4" />}
        >
          {investigacion?.producto_nombre && (
            <InfoItem 
              label="Producto" 
              value={investigacion.producto_nombre}
            />
          )}
          {investigacion?.periodo_nombre && (
            <InfoItem 
              label="Período" 
              value={investigacion.periodo_nombre}
            />
          )}
          {investigacion?.tipo_sesion && (
            <InfoItem 
              label="Tipo de sesión" 
              value={investigacion.tipo_sesion}
            />
          )}
        </InfoContainer>
      </div>
    </div>
  );

  // Logs para debug de catálogos
  if (typeof window !== 'undefined') {
    console.log('🔍 LIBRETOCONTENT RECLUTAMIENTO - libreto:', !!libreto, 'loadingLibreto:', loadingLibreto);
    console.log('🔍 Catálogos cargados en reclutamiento:', {
      plataformas: catalogosLibreto.plataformas.length,
      rolesEmpresa: catalogosLibreto.rolesEmpresa.length,
      industrias: catalogosLibreto.industrias.length,
      modalidades: catalogosLibreto.modalidades.length,
      tamanosEmpresa: catalogosLibreto.tamanosEmpresa.length
    });
  }

  // Contenido del tab Libreto - usando datos reales del libreto (igual que en investigaciones)
  const LibretoContent: React.FC = () => {
    if (loadingLibreto) {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
      );
    }

    if (libreto) {
      return (
        <div className="space-y-6">
          {/* Header del Libreto */}
          <div className="flex items-center justify-between mb-6">
            <Subtitle>
              Libreto de la Investigación
            </Subtitle>
          </div>

          {/* Contenido del Libreto */}
          <div className="space-y-8">
            {/* Problema y Objetivos */}
            <InfoContainer 
              title="Problema y Objetivos"
              icon={<CheckCircleIcon className="w-4 h-4" />}
            >
              <InfoItem 
                label="Problema o Situación"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.problema_situacion || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
              
              <InfoItem 
                label="Hipótesis"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.hipotesis || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
              
              <InfoItem 
                label="Objetivos"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.objetivos || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
              
              <InfoItem 
                label="Resultado Esperado"
                value={
                  <div className="p-4 bg-muted rounded-lg">
                    <Typography variant="body2">
                      {libreto.resultado_esperado || 'No especificado'}
                    </Typography>
                  </div>
                }
              />
            </InfoContainer>

            {/* Configuración de la Sesión */}
            <InfoContainer 
              title="Configuración de la Sesión"
              icon={<SettingsIcon className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Nombre de la Sesión"
                  value={libreto.nombre_sesion || 'No especificado'}
                />

                <InfoItem 
                  label="Duración Estimada (minutos)"
                  value={libreto.duracion_estimada ? `${libreto.duracion_estimada} minutos` : 'No especificado'}
                />

                <InfoItem 
                  label="Número de Participantes"
                  value={libreto.numero_participantes || 'No especificado'}
                />

                <InfoItem 
                  label="Plataforma"
                  value={catalogosLibreto.plataformas.find(p => p.id === libreto.plataforma_id)?.nombre || 'No especificado'}
                />

                <div className="md:col-span-2">
                  <InfoItem 
                    label="Link del Prototipo"
                    value={
                      libreto.link_prototipo ? (
                        <a href={libreto.link_prototipo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {libreto.link_prototipo}
                        </a>
                      ) : (
                        'No especificado'
                      )
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <InfoItem 
                    label="Descripción General"
                    value={
                      <div className="p-4 bg-muted rounded-lg">
                        <Typography variant="body2">
                          {libreto.descripcion_general || 'No especificado'}
                        </Typography>
                      </div>
                    }
                  />
                </div>
              </div>
            </InfoContainer>

            {/* Perfil de Participantes */}
            <InfoContainer 
              title="Perfil de Participantes"
              icon={<UsersIcon className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="Rol en Empresa"
                  value={catalogosLibreto.rolesEmpresa.find(r => r.id === libreto.rol_empresa_id)?.nombre || 'No especificado'}
                />

                <InfoItem 
                  label="Industria"
                  value={catalogosLibreto.industrias.find(i => i.id === libreto.industria_id)?.nombre || 'No especificado'}
                />

                <InfoItem 
                  label="Modalidad"
                  value={(() => {
                    if (!libreto.modalidad_id) return 'No especificado';
                    
                    const modalidadIds = Array.isArray(libreto.modalidad_id) ? libreto.modalidad_id : [libreto.modalidad_id];
                    
                    // Usar catálogos reales
                    const nombres = modalidadIds
                      .filter(id => id)
                      .map(id => catalogosLibreto.modalidades.find(m => m.id === id)?.nombre || id)
                      .filter(Boolean);
                    
                    return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
                  })()}
                />

                <InfoItem 
                  label="Tamaño de Empresa"
                  value={(() => {
                    if (!libreto.tamano_empresa_id) return 'No especificado';
                    
                    const tamanoIds = Array.isArray(libreto.tamano_empresa_id) ? libreto.tamano_empresa_id : [libreto.tamano_empresa_id];
                    
                    // Usar catálogos reales
                    const nombres = tamanoIds
                      .filter(id => id)
                      .map(id => catalogosLibreto.tamanosEmpresa.find(t => t.id === id)?.nombre || id)
                      .filter(Boolean);
                    
                    return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
                  })()}
                />
              </div>
            </InfoContainer>
          </div>
        </div>
      );
    }

    // Estado vacío para libreto
    return (
      <EmptyState
        icon={<FileTextIcon className="w-8 h-8" />}
        title="Sin Libreto"
        description="Esta investigación aún no tiene un libreto configurado."
      />
    );
  };

  const ParticipantesContent: React.FC = () => {
    if (loadingParticipantes) {
      return (
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={`skeleton-${i}`} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (participantes.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardListIcon className="w-8 h-8" />}
          title="Sin Participantes"
          description="Aún no se han reclutado participantes para esta investigación."
          actionText="Agregar Participante"
          onAction={() => {
            showInfo('Funcionalidad en desarrollo', 'La gestión de participantes estará disponible próximamente');
          }}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Subtitle>
              Participantes Reclutados
            </Subtitle>
            <Typography variant="body2" color="secondary">
              {participantes.length} participante{participantes.length !== 1 ? 's' : ''} reclutado{participantes.length !== 1 ? 's' : ''}
            </Typography>
          </div>
          {/* Botón eliminado: Agregar Participante */}
        </div>

        {/* Cards de Participantes */}
        <div className="space-y-4">
          {participantes.map((participante, index) => (
            <ParticipantCard
              key={`${participante.id}-${index}`}
              participante={participante}
              onEdit={handleEditParticipante}
              onDelete={handleDeleteParticipante}
              onConvertAgendamiento={handleConvertirAgendamientoPendiente}
            />
          ))}
        </div>

        {/* Modal de detalles del participante - Sin animaciones */}
        {showModal && selectedParticipante && (
          <div className="fixed inset-0 z-50 flex" >
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => {
                setShowModal(false);
                // Limpiar estadísticas al cerrar el modal
                setEstadisticasEmpresa(null);
                setEstadisticasParticipante(null);
              }}
              aria-hidden="true"
            />
            
            {/* Modal estático sin animaciones */}
            <div 
              className="fixed top-0 right-0 bottom-0 max-w-lg w-full bg-card "
              style={{ height: '100vh' }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex flex-col" style={{ height: '100vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-primary" />
                    <Typography variant="h4" weight="semibold" className="text-card-foreground">
                      Detalles
                    </Typography>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowModal(false);
                      // Limpiar estadísticas al cerrar el modal
                      setEstadisticasEmpresa(null);
                      setEstadisticasParticipante(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Cerrar modal"
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto scrollbar-dropdown p-6">
                  {/* Tabs Manuales para evitar re-renderizados */}
                  <div className="space-y-4">
                    {/* Tab Headers */}
                    <div className="flex border-b border-border">
                      <button
                        onClick={() => setModalActiveTab('reclutamiento')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                          modalActiveTab === 'reclutamiento'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border'
                        }`}
                      >
                        <ClipboardListIcon className="w-4 h-4" />
                        <span>Reclutamiento</span>
                      </button>
                      <button
                        onClick={() => setModalActiveTab('participante')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                          modalActiveTab === 'participante'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Participante</span>
                      </button>
                      {selectedParticipante?.tipo === 'externo' && (
                        <button
                          onClick={() => setModalActiveTab('empresa')}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                            modalActiveTab === 'empresa'
                              ? 'text-primary border-b-2 border-primary'
                              : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border'
                          }`}
                        >
                          <BuildingIcon className="w-4 h-4" />
                          <span>Empresa</span>
                        </button>
                      )}
                    </div>

                    {/* Tab Content - Solo reclutamiento y participante */}
                    <div className="min-h-[200px]">
                      <div className={modalActiveTab === 'reclutamiento' ? 'block' : 'hidden'}>
                        <ReclutamientoTabContent />
                      </div>
                      <div className={modalActiveTab === 'participante' ? 'block' : 'hidden'}>
                        <ParticipanteTabContent />
                      </div>
                      <div className={modalActiveTab === 'empresa' ? 'block' : 'hidden'}>
                        <EmpresaTabContent />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      );
    };

  // Tabs dinámicos - usando datos de la investigación
  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: <InfoIcon className="w-4 h-4" />, 
      content: <InformacionGeneral />
    },
    ...(libreto ? [{
      id: 'libreto',
      label: 'Libreto',
      icon: <FileTextIcon className="w-4 h-4" />, 
      content: <LibretoContent />
    }] : []),
    // Solo mostrar el tab de participantes si hay participantes o asignaciones
    ...(true ? [{
      id: 'reclutamiento',
      label: 'Participantes y Asignaciones',
      icon: <ClipboardListIcon className="w-4 h-4" />, 
      content: <ParticipantesContent />
    }] : [])
  ];

  if (isInitializing || loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="w-24 h-6 bg-muted rounded"></div>
            </div>
            
            {/* Actions skeleton */}
            <div className="flex gap-3 mb-6">
              <div className="w-40 h-10 bg-muted rounded"></div>
              <div className="w-40 h-10 bg-muted rounded"></div>
            </div>
            
            {/* Progress bar skeleton */}
            <div className="p-4 bg-card rounded-lg border mb-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-1/5"></div>
                <div className="h-3 bg-muted rounded w-1/5"></div>
              </div>
            </div>
            
            {/* Tabs skeleton */}
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-10 bg-muted rounded"></div>
              <div className="w-24 h-10 bg-muted rounded"></div>
              <div className="w-24 h-10 bg-muted rounded"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!reclutamiento) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-8">
          <Card className="p-8 text-center">
            <Typography variant="h4" className="mb-4">Reclutamiento no encontrado</Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              No se pudo encontrar el reclutamiento solicitado
            </Typography>
            <Button variant="primary" onClick={() => router.push('/reclutamiento')}>
              Volver a Reclutamiento
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Función para forzar actualización de estado (temporal)
  const forzarActualizacionEstado = async () => {
    try {
      console.log('🔄 Forzando actualización de estado...');
      const response = await fetch('/api/forzar-actualizacion-estado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investigacion_id: reclutamiento?.investigacion_id || id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Estado actualizado:', data);
        showSuccess('Estado actualizado correctamente');
        // Recargar datos
        await actualizarYcargarReclutamiento();
      } else {
        const error = await response.json();
        console.error('❌ Error actualizando estado:', error);
        showError('Error actualizando estado');
      }
    } catch (error) {
      console.error('❌ Error forzando actualización:', error);
      showError('Error forzando actualización');
    }
  };

  // Función para manejar asignación de agendamiento
  const handleAsignarAgendamiento = () => {
    setShowAsignarAgendamientoModal(true);
  };

  // Función para manejar la conversión de agendamiento pendiente a participante real
  const handleConvertirAgendamientoPendiente = async (participante: any) => {
    console.log('🔍 handleConvertirAgendamientoPendiente - participante:', participante);
    console.log('🔍 Reclutador ID:', participante.reclutador_id);
    console.log('🔍 Reclutamiento ID:', participante.reclutamiento_id);
    console.log('🔍 Reclutador objeto:', participante.reclutador);
    
    // Guardar el participante pendiente para el modal
    setParticipantePendiente(participante);
    
    // Crear un objeto de reclutamiento con el responsable pre-cargado
    const reclutamientoConResponsable = {
      ...reclutamiento,
      responsable_pre_cargado: {
        id: participante.reclutador?.id || participante.reclutador_id, // Usar el ID correcto del reclutador
        nombre: participante.reclutador?.full_name || participante.reclutador_nombre || 'Responsable',
        full_name: participante.reclutador?.full_name || participante.reclutador_nombre || 'Responsable'
      }
    };
    
    console.log('🔍 Reclutamiento con responsable pre-cargado:', reclutamientoConResponsable);
    console.log('🔍 ID del responsable pre-cargado:', reclutamientoConResponsable.responsable_pre_cargado.id);
    
    // Guardar el reclutamiento para el modal y abrirlo
    setReclutamientoParaModal(reclutamientoConResponsable);
    setShowAgregarParticipanteModalNuevo(true);
  };

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
              title=""
              subtitle="Ver Reclutamiento"
              variant="compact"
              color="teal"
              className="mb-0"
              chip={{
                label: getEstadoReclutamientoText(reclutamiento?.estado_reclutamiento_nombre || ''),
                variant: getEstadoReclutamientoVariant(reclutamiento?.estado_reclutamiento_nombre || ''),
                size: 'sm'
              }}
            />
            {/* Debug del estado */}
            {reclutamiento?.estado_reclutamiento_nombre && (
              <div style={{display: 'none'}}>
                Debug Estado: {reclutamiento.estado_reclutamiento_nombre} | 
                Variant: {getEstadoReclutamientoVariant(reclutamiento.estado_reclutamiento_nombre)} | 
                Text: {getEstadoReclutamientoText(reclutamiento.estado_reclutamiento_nombre)}
              </div>
            )}
          </div>

          {/* Acciones principales */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => setShowAgregarParticipanteModal(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Agregar Participante
            </Button>
            <Button
              variant="outline"
              onClick={handleAsignarAgendamiento}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <ClipboardListIcon className="w-4 h-4 mr-2" />
              Asignar Agendamiento
            </Button>
          </div>
        </div>



        {/* Barra de Progreso del Reclutamiento */}
        {reclutamiento && (
          <ProgressCard
            title="Progreso del Reclutamiento"
            currentValue={reclutamiento.participantes_reclutados || 0}
            maxValue={reclutamiento.libreto_numero_participantes || 0}
            unit="participantes"
            percentage={reclutamiento.porcentaje_completitud || 0}
            objectiveText={`Objetivo: ${reclutamiento.libreto_numero_participantes || 0} participantes`}
            progressText={`Reclutados: ${reclutamiento.participantes_reclutados || 0} participantes`}
            className="mb-6"
          />
        )}

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="default"
          fullWidth={true}
        />
      </div>

      {/* Modal unificado para gestionar links */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title={currentLinkType === 'prueba' ? 'Gestionar Link de Prueba' : 'Gestionar Link de Resultados'}
        description={currentLinkType === 'prueba' 
          ? 'Configura el enlace donde los participantes realizarán las pruebas de usabilidad'
          : 'Configura el enlace donde se pueden consultar los resultados y hallazgos'
        }
        placeholder={currentLinkType === 'prueba' 
          ? 'https://prototipo.ejemplo.com'
          : 'https://resultados.ejemplo.com'
        }
        currentLink={currentLink}
        onSave={currentLinkType === 'prueba' ? handleSaveLinkPrueba : handleSaveLinkResultados}
        onDelete={currentLink ? (currentLinkType === 'prueba' ? handleDeleteLinkPrueba : handleDeleteLinkResultados) : undefined}
        linkType={currentLinkType}
        initialMode={currentLink ? 'edit' : 'add'}
      />

      {/* Modal de confirmación para eliminar participante */}
      {showDeleteModal && participanteToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setParticipanteToDelete(null);
          }}
          onConfirm={confirmDeleteParticipante}
          title="Eliminar Participante"
          message={`¿Estás seguro de que quieres eliminar al participante "${participanteToDelete.nombre}"? Esta acción no se puede deshacer y eliminará permanentemente al participante del reclutamiento.`}
          type="error"
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deletingParticipante}
        />
      )}

      {/* Modal de edición de reclutamiento */}
      {showEditModal && participanteToEdit && (
        <EditarReclutamientoModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setParticipanteToEdit(null);
          }}
          onSuccess={async () => {
            // Solo cerrar el modal, la recarga ya se hace en handleSaveEditParticipante
            setShowEditModal(false);
            setParticipanteToEdit(null);
          }}
          onSave={handleSaveEditParticipante}
          reclutamiento={participanteToEdit}
        />
      )}

      {/* Modal de agregar participante */}
      <AgregarParticipanteModal
        isOpen={showAgregarParticipanteModal}
        onClose={() => setShowAgregarParticipanteModal(false)}
        onSuccess={async () => {
          // Recargar datos completos (participantes + reclutamiento + métricas)
          await recargarDatosCompletos();
          await actualizarYcargarReclutamiento();
          setShowAgregarParticipanteModal(false);
        }}
        reclutamiento={reclutamiento}
      />

      {/* Modal de edición de reclutamiento para asignar agendamiento */}
      <AsignarAgendamientoModal
        isOpen={showAsignarAgendamientoModal}
        onClose={() => {
          setShowAsignarAgendamientoModal(false);
          setParticipanteToEditAgendamiento(null);
        }}
        onSuccess={async () => {
          // Solo recargar una vez para evitar recargas múltiples
          await recargarDatosCompletos();
          setShowAsignarAgendamientoModal(false);
          setParticipanteToEditAgendamiento(null);
        }}
        investigacionId={(() => {
          if (typeof reclutamiento?.investigacion_id === 'string') return reclutamiento.investigacion_id;
          if (Array.isArray(reclutamiento?.investigacion_id)) return reclutamiento.investigacion_id[0] || '';
          if (typeof id === 'string') return id;
          if (Array.isArray(id)) return id[0] || '';
          return '';
        })()}
        investigacionNombre={reclutamiento?.investigacion_nombre || ''}
        isEditMode={participanteToEditAgendamiento ? true : false}
        reclutamientoId={participanteToEditAgendamiento?.reclutamiento_id || null}
        responsableActual={(() => {
          const responsable = participanteToEditAgendamiento?.reclutador?.id || participanteToEditAgendamiento?.reclutador_id || null;
          console.log('🔍 Modal AsignarAgendamientoModal - participanteToEditAgendamiento:', participanteToEditAgendamiento);
          console.log('🔍 Modal AsignarAgendamientoModal - responsableActual:', responsable);
          console.log('🔍 Modal AsignarAgendamientoModal - reclutador objeto:', participanteToEditAgendamiento?.reclutador);
          console.log('🔍 Modal AsignarAgendamientoModal - reclutador_id:', participanteToEditAgendamiento?.reclutador_id);
          return responsable;
        })()}
      />

      {/* Modal para agregar participante desde "Agendamiento Pendiente" */}
      {showAgregarParticipanteModalNuevo && reclutamientoParaModal && (
        <AgregarParticipanteModal
          isOpen={showAgregarParticipanteModalNuevo}
          onClose={() => {
            setShowAgregarParticipanteModalNuevo(false);
            setReclutamientoParaModal(null);
          }}
          onSuccess={async (nuevoReclutamiento) => {
            console.log('✅ Nuevo reclutamiento creado:', nuevoReclutamiento);
            console.log('🔍 Participante pendiente a eliminar:', participantePendiente);
            
            try {
              // Eliminar el reclutamiento de "Agendamiento Pendiente" original
              // Usar el ID del reclutamiento, no del participante
              const reclutamientoId = participantePendiente?.reclutamiento_id || participantePendiente?.id;
              
              if (reclutamientoId) {
                console.log('🗑️ Eliminando reclutamiento pendiente con ID:', reclutamientoId);
                const response = await fetch(`/api/reclutamientos/${reclutamientoId}`, {
                  method: 'DELETE',
                });
                
                if (response.ok) {
                  console.log('✅ Reclutamiento pendiente eliminado exitosamente');
                } else {
                  const errorData = await response.json();
                  console.error('❌ Error eliminando reclutamiento pendiente:', errorData);
                }
              } else {
                console.error('❌ No se encontró ID de reclutamiento para eliminar');
              }
            } catch (error) {
              console.error('❌ Error eliminando reclutamiento pendiente:', error);
            }
            
            // Limpiar estados
            setParticipantePendiente(null);
            setReclutamientoParaModal(null);
            
            // Forzar una recarga completa de los datos con delay
            setTimeout(async () => {
              console.log('🔄 Forzando recarga de datos después de crear reclutamiento...');
              await cargarParticipantes();
              await recargarDatosCompletos();
              await actualizarYcargarReclutamiento();
            }, 500);
            
            setShowAgregarParticipanteModalNuevo(false);
          }}
          reclutamiento={reclutamientoParaModal}
          esDesdeAgendamientoPendiente={true}
        />
      )}

      {/* Debug temporal */}
      {participanteToEditAgendamiento && (
        <div style={{display: 'none'}}>
          Debug: {JSON.stringify(participanteToEditAgendamiento)}
        </div>
      )}
    </Layout>
  );
};

export default VerReclutamiento; 