import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { usePermisos } from '../utils/permisosUtils';

import { Layout } from '../components/ui';
import Typography from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import DataTable from '../components/ui/DataTable';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';
import FilterDrawer from '../components/ui/FilterDrawer';
import Chip from '../components/ui/Chip';
import type { FilterValuesInvestigacion, FilterOptions } from '../components/ui/FilterDrawer';
import ActionsMenu from '../components/ui/ActionsMenu';
import GroupedActions from '../components/ui/GroupedActions';
import { InlineSelect, InlineDate } from '../components/ui/InlineEdit';
import InlineUserSelect from '../components/ui/InlineUserSelect';
import SeguimientoSideModal from '../components/ui/SeguimientoSideModal';
import { SearchIcon, PlusIcon, MoreVerticalIcon, EditIcon, CopyIcon, FileTextIcon, LinkIcon, BarChartIcon, TrashIcon, EyeIcon, FilterIcon, UserIcon, InvestigacionesIcon, AlertTriangleIcon, CheckCircleIcon, ClipboardListIcon, InfoIcon } from '../components/icons';
import { 
  obtenerInvestigaciones, 
  actualizarInvestigacion, 
  eliminarInvestigacion, 
  obtenerUsuarios, 
  obtenerPeriodos,
  obtenerEstadosInvestigacion,
  obtenerCategoriasRiesgo,
  obtenerTiposInvestigacion,
  actualizarLinkPrueba,
  eliminarLinkPrueba,
  actualizarLinkResultados,
  eliminarLinkResultados
} from '../api/supabase-investigaciones';
import { 
  obtenerLibretoPorInvestigacion,
  crearLibreto,
  actualizarLibreto,
  eliminarLibreto
} from '../api/supabase-libretos';
import { obtenerSeguimientosPorInvestigacion, crearSeguimiento } from '../api/supabase-seguimientos';
import { formatearFecha } from '../utils/fechas';
import { getRiesgoBadgeVariant, getRiesgoIconName, getRiesgoText, getRiesgoDescripcion, getRiesgoPrioridad } from '../utils/riesgoUtils';
import { getEstadoInvestigacionVariant, getEstadoInvestigacionText } from '../utils/estadoUtils';
import type { Investigacion as InvestigacionSupabase, Usuario as UsuarioSupabase, Periodo as PeriodoSupabase } from '../types/supabase-investigaciones';
import type { LibretoInvestigacion, LibretoFormData } from '../types/libretos';
import type { SeguimientoFormData } from '../types/seguimientos';
import DonutChart from '../components/ui/DonutChart';

// Interfaces locales para la página
interface Investigacion extends InvestigacionSupabase {
  tipo_investigacion: string;
  fecha_creacion: string;
  // Datos relacionados
  responsable?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  implementador?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  creador?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  periodo?: {
    id: string;
    nombre: string;
  };
}

interface Usuario {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Periodo {
  id: string;
  nombre: string;
}



// Función para calcular el nivel de riesgo automáticamente
const calcularNivelRiesgo = (investigacion: any): {
  nivel: 'bajo' | 'medio' | 'alto' | 'completado' | 'sin_fecha';
  diasRestantes: number;
  descripcion: string;
} => {
  // Si la investigación está finalizada, pausada, cancelada o despreciada, no hay riesgo
  if (["finalizado", "pausado", "cancelado", "deprecado"].includes((investigacion.estado || '').toLowerCase())) {
    return {
      nivel: 'completado',
      diasRestantes: 0,
      descripcion: 'Investigación sin riesgo'
    };
  }

  // Si está en borrador, calcular respecto a la fecha de inicio
  if ((investigacion.estado || '').toLowerCase() === 'en_borrador') {
    if (!investigacion.fecha_inicio) {
      return {
        nivel: 'sin_fecha',
        diasRestantes: 0,
        descripcion: 'Sin fecha de inicio definida'
      };
    }
    const fechaInicio = new Date(investigacion.fecha_inicio);
    const fechaActual = new Date();
    const diasRestantes = Math.ceil((fechaInicio.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes < 0) {
      return {
        nivel: 'alto',
        diasRestantes,
        descripcion: `La fecha de inicio del reclutamiento ya pasó hace ${Math.abs(diasRestantes)} días`
      };
    } else if (diasRestantes < 14) {
      return {
        nivel: 'alto',
        diasRestantes,
        descripcion: `Faltan ${diasRestantes} días para el inicio del reclutamiento (¡Alerta alta! - Crear libreto con anticipación)`
      };
    } else if (diasRestantes <= 30) {
      return {
        nivel: 'medio',
        diasRestantes,
        descripcion: `Faltan ${diasRestantes} días para el inicio del reclutamiento (Recordar crear libreto con 2 semanas de anticipación)`
      };
    } else {
      return {
        nivel: 'bajo',
        diasRestantes,
        descripcion: `Faltan ${diasRestantes} días para el inicio del reclutamiento`
      };
    }
  }

  // Para todos los demás estados, calcular respecto a la fecha de finalización
  if (!investigacion.fecha_fin) {
    return {
      nivel: 'sin_fecha',
      diasRestantes: 0,
      descripcion: 'Sin fecha de finalización definida'
    };
  }
  const fechaFin = new Date(investigacion.fecha_fin);
  const fechaActual = new Date();
  const diasRestantes = Math.ceil((fechaFin.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));
  if (diasRestantes < 0) {
    return {
      nivel: 'alto',
      diasRestantes,
      descripcion: `Vencida hace ${Math.abs(diasRestantes)} días`
    };
  } else if (diasRestantes <= 7) {
    return {
      nivel: 'alto',
      diasRestantes,
      descripcion: `Vence en ${diasRestantes} días`
    };
  } else if (diasRestantes <= 30) {
    return {
      nivel: 'medio',
      diasRestantes,
      descripcion: `Vence en ${diasRestantes} días`
    };
  } else {
    return {
      nivel: 'bajo',
      diasRestantes,
      descripcion: `Vence en ${diasRestantes} días`
    };
  }
};



export default function InvestigacionesPage() {
  const { rolSeleccionado, loading: rolLoading } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const { userProfile } = useUser();
  const { tienePermiso, esAdministrador, usuarioId, tienePermisoSobreElemento, usuarioEsCreador } = usePermisos();
  const router = useRouter();

  // TODOS LOS ESTADOS JUNTOS AL INICIO
  const [investigaciones, setInvestigaciones] = useState<Investigacion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [estadosInvestigacion, setEstadosInvestigacion] = useState<Array<{value: string, label: string}>>([]);
  const [categoriasRiesgo, setCategoriasRiesgo] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [investigacionToDelete, setInvestigacionToDelete] = useState<Investigacion | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados para modal de libreto - ELIMINADO
  const [currentInvestigacion, setCurrentInvestigacion] = useState<Investigacion | null>(null);

  // Estados para modal de seguimiento
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [investigacionParaSeguimiento, setInvestigacionParaSeguimiento] = useState<Investigacion | null>(null);

  // Estados para filtros avanzados
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<Array<{value: string, label: string}>>([]);
  const [metricasSeguimientos, setMetricasSeguimientos] = useState<any>(null);
  const [seguimientos, setSeguimientos] = useState<{[investigacionId: string]: any[]}>({});
  const [filters, setFilters] = useState<FilterValuesInvestigacion>({
    busqueda: '',
    estado: 'todos',
    tipo: 'todos',
    periodo: 'todos',
    responsable: 'todos',
    implementador: 'todos',
    creador: 'todos',
    fecha_inicio_desde: '',
    fecha_inicio_hasta: '',
    fecha_fin_desde: '',
    fecha_fin_hasta: '',
    tieneLibreto: 'todos',
    nivelRiesgo: [],
    linkPrueba: 'todos',
    linkResultados: 'todos',
    seguimiento: 'todos',
    estadoSeguimiento: []
  });

  // REF DESPUÉS DE TODOS LOS ESTADOS
  const investigacionesRef = useRef(investigaciones);

  // EFFECTS DESPUÉS DE REF
  // Actualizar ref cuando cambie investigaciones
  useEffect(() => {
    investigacionesRef.current = investigaciones;
  }, [investigaciones]);

  // Cargar datos iniciales y cuando cambie el rol o usuario
  useEffect(() => {
    console.log('🚀 useEffect ejecutándose - cargando datos iniciales');
    console.log('🎭 Rol actual:', rolSeleccionado);
    console.log('👤 Usuario ID:', usuarioId);
    
    // Solo cargar si tenemos el rol y el usuario
    if (rolSeleccionado && usuarioId) {
      Promise.all([
        fetchInvestigaciones(),
        fetchUsuarios(),
        fetchPeriodos(),
        fetchEstadosInvestigacion(),
        fetchCategoriasRiesgo(),
        fetchTiposInvestigacion(),
        fetchMetricasSeguimientos()
      ]);
    }
  }, [rolSeleccionado, usuarioId]); // Se ejecuta cuando cambia el rol o el usuario

  // ====================================
  // FUNCIÓN PARA OBTENER MÉTRICAS DE SEGUIMIENTOS
  // ====================================
  
  const fetchMetricasSeguimientos = async () => {
    try {
      const response = await fetch('/api/metricas-investigaciones');
      if (response.ok) {
        const data = await response.json();
        setMetricasSeguimientos(data);
      }
    } catch (error) {
      console.error('❌ Error obteniendo métricas de seguimientos:', error);
    }
  };

  // ====================================
  // FUNCIÓN PARA CARGAR SEGUIMIENTOS DE TODAS LAS INVESTIGACIONES
  // ====================================
  
  const fetchSeguimientos = async (investigaciones: Investigacion[]) => {
    try {
      console.log('🔍 Cargando seguimientos para todas las investigaciones...');
      const seguimientosMap: {[investigacionId: string]: any[]} = {};
      
      // Cargar seguimientos para cada investigación
      for (const inv of investigaciones) {
        const { data: seguimientosInv, error } = await obtenerSeguimientosPorInvestigacion(inv.id);
        if (!error && seguimientosInv) {
          seguimientosMap[inv.id] = seguimientosInv;
        } else {
          seguimientosMap[inv.id] = [];
        }
      }
      
      setSeguimientos(seguimientosMap);
      console.log('✅ Seguimientos cargados para', Object.keys(seguimientosMap).length, 'investigaciones');
    } catch (error) {
      console.error('❌ Error cargando seguimientos:', error);
    }
  };

  // CALLBACKS DESPUÉS DE TODOS LOS EFFECTS
  // Callback para manejar cambios (memoizado para evitar loops)
  const handleDataChange = useCallback(() => {
    // Datos actualizados
  }, []);

  // ====================================
  // FUNCIONES PARA GESTIONAR LIBRETOS
  // ====================================

  const [libretosMap, setLibretosMap] = useState<Map<string, any>>(new Map());

  // Función para verificar si una investigación tiene libreto
  const tieneLibreto = (investigacionId: string): boolean => {
    return libretosMap.has(investigacionId);
  };

  // Función para filtrar investigaciones con filtros avanzados
  const filtrarInvestigaciones = useCallback((investigaciones: any[], searchTerm: string, filters: FilterValuesInvestigacion) => {
    let filtradas = [...investigaciones];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(inv => 
        inv?.nombre?.toLowerCase().includes(termino) ||
        inv?.descripcion?.toLowerCase().includes(termino) ||
        inv?.investigador_principal?.toLowerCase().includes(termino)
      );
    }
    
    // Filtrar por estado (select simple)
    if (filters.estado && filters.estado !== 'todos') {
      console.log('🔍 Aplicando filtro de estado:', filters.estado);
      console.log('🔍 Investigaciones antes del filtro:', filtradas.length);
      console.log('🔍 Estados disponibles:', [...new Set(filtradas.map(inv => inv?.estado))]);
      
      filtradas = filtradas.filter(inv => {
        const coincide = inv?.estado === filters.estado;
        console.log(`  - ${inv?.nombre}: estado=${inv?.estado}, coincide=${coincide}`);
        return coincide;
      });
      
      console.log('🔍 Investigaciones después del filtro:', filtradas.length);
    }
    
    // Filtrar por tipo de investigación
    if (filters.tipo && filters.tipo !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.tipo_investigacion_id === filters.tipo);
    }
    
    // Filtrar por período
    if (filters.periodo && filters.periodo !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.periodo_id === filters.periodo);
    }
    
    // Filtrar por responsable
    if (filters.responsable && filters.responsable !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.responsable_id === filters.responsable);
    }
    
    // Filtrar por implementador
    if (filters.implementador && filters.implementador !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.implementador_id === filters.implementador);
    }
    
    // Filtrar por creador
    if (filters.creador && filters.creador !== 'todos') {
      filtradas = filtradas.filter(inv => inv?.creado_por === filters.creador);
    }
    
    // Filtrar por fecha de inicio
    if (filters.fecha_inicio_desde) {
      filtradas = filtradas.filter(inv => inv?.fecha_inicio >= filters.fecha_inicio_desde);
    }
    if (filters.fecha_inicio_hasta) {
      filtradas = filtradas.filter(inv => inv?.fecha_inicio <= filters.fecha_inicio_hasta);
    }
    
    // Filtrar por fecha de fin
    if (filters.fecha_fin_desde) {
      filtradas = filtradas.filter(inv => inv?.fecha_fin >= filters.fecha_fin_desde);
    }
    if (filters.fecha_fin_hasta) {
      filtradas = filtradas.filter(inv => inv?.fecha_fin <= filters.fecha_fin_hasta);
    }
    
    // Filtrar por libreto
    if (filters.tieneLibreto && filters.tieneLibreto !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneLibretoInv = tieneLibreto(inv.id);
        return filters.tieneLibreto === 'con_libreto' ? tieneLibretoInv : !tieneLibretoInv;
      });
    }
    
    // Filtrar por nivel de riesgo
    if (filters.nivelRiesgo && filters.nivelRiesgo.length > 0) {
      filtradas = filtradas.filter(inv => {
        const nivelRiesgo = calcularNivelRiesgo(inv).nivel;
        return filters.nivelRiesgo!.includes(nivelRiesgo);
      });
    }
    
    // Filtrar por link de prueba
    if (filters.linkPrueba && filters.linkPrueba !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneLink = !!inv?.link_prueba;
        return filters.linkPrueba === 'con_link' ? tieneLink : !tieneLink;
      });
    }
    
    // Filtrar por link de resultados
    if (filters.linkResultados && filters.linkResultados !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneLink = !!inv?.link_resultados;
        return filters.linkResultados === 'con_link' ? tieneLink : !tieneLink;
      });
    }
    
    // Filtrar por seguimiento
    if (filters.seguimiento && filters.seguimiento !== 'todos') {
      filtradas = filtradas.filter(inv => {
        const tieneSeguimiento = seguimientos[inv.id] && seguimientos[inv.id].length > 0;
        return filters.seguimiento === 'con_seguimiento' ? tieneSeguimiento : !tieneSeguimiento;
      });
    }
    
    // Filtrar por estado de seguimiento
    if (filters.estadoSeguimiento && filters.estadoSeguimiento.length > 0) {
      filtradas = filtradas.filter(inv => {
        const seguimientosInv = seguimientos[inv.id] || [];
        return seguimientosInv.some(seg => filters.estadoSeguimiento!.includes(seg.estado));
      });
    }
    
    return filtradas;
  }, [tieneLibreto, seguimientos]);

  const fetchInvestigaciones = async () => {
    try {
      setLoading(true);
      
      // Verificar permisos antes de cargar
      if (!tienePermiso('investigaciones', 'ver')) {
        console.log('❌ Usuario no tiene permisos para ver investigaciones');
        setInvestigaciones([]);
        return;
      }
      
      // Verificar si el rol activo es administrador
      const rolActivoEsAdmin = rolSeleccionado?.toLowerCase() === 'administrador';
      console.log('🎭 Rol Activo:', rolSeleccionado, 'Es Admin:', rolActivoEsAdmin);
      console.log('👤 Usuario ID:', usuarioId);
      console.log('🔒 Aplicando filtros de asignación:', !rolActivoEsAdmin);
      
      const response = await obtenerInvestigaciones(usuarioId, rolActivoEsAdmin);
      
      if (response.data && response.data.length > 0) {
        // Primera investigación cargada
      }
      
      const investigacionesData = (response.data || []) as Investigacion[];
      setInvestigaciones(investigacionesData);
      
      // Cargar libretos y seguimientos para cada investigación
      if (investigacionesData.length > 0) {
        await Promise.all([
          fetchLibretos(investigacionesData),
          fetchSeguimientos(investigacionesData)
        ]);
      }
    } catch (error) {
      console.error('❌ Error al obtener investigaciones:', error);
      setInvestigaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar libretos de las investigaciones
  const fetchLibretos = async (investigaciones: any[]) => {
    try {
      const libretosMap = new Map<string, LibretoInvestigacion>();
      
      // Cargar libretos en paralelo
      const promesasLibretos = investigaciones.map(async (inv) => {
        try {
          const response = await obtenerLibretoPorInvestigacion(inv.id);
          if (response.data) {
            libretosMap.set(inv.id, response.data);
          }
        } catch (error) {
          console.error(`Error cargando libreto para investigación ${inv.id}:`, error);
        }
      });
      
      await Promise.all(promesasLibretos);
      
      setLibretosMap(libretosMap);
    } catch (error) {
      console.error('Error cargando libretos:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await obtenerUsuarios();
      
      if (response.error) {
        console.error('Error al obtener usuarios:', response.error);
        return;
      }
      
      // Mapear usuarios correctamente
      const usuariosMapeados = (response.data || []).map((user: any) => ({
        id: user.id,
        name: user.full_name || user.name || user.email || 'Sin nombre',
        email: user.email || 'sin-email@ejemplo.com',
        avatar_url: user.avatar_url || null
      }));
      
      setUsuarios(usuariosMapeados);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchPeriodos = async () => {
    try {
      const response = await obtenerPeriodos();
      
      if (response.error) {
        console.error('Error al obtener períodos:', response.error);
        return;
      }
      
      // Mapear períodos correctamente
      const periodosMapeados = (response.data || []).map((periodo: any) => ({
        id: periodo.id,
        nombre: periodo.nombre || periodo.etiqueta || 'Sin nombre'
      }));
      
      setPeriodos(periodosMapeados);
    } catch (error) {
      console.error('Error al obtener períodos:', error);
    }
  };

  const fetchEstadosInvestigacion = async () => {
    try {
      const response = await obtenerEstadosInvestigacion();
      
      if (response.error) {
        console.error('Error al obtener estados:', response.error);
        // Los estados fallback ya están incluidos en la respuesta
      }
      
      setEstadosInvestigacion(response.data || []);
    } catch (error) {
      console.error('Error al obtener estados:', error);
      // Usar estados fallback si hay error - estados reales de la base de datos
      setEstadosInvestigacion([
        { value: 'en_borrador', label: 'En Borrador' },
        { value: 'por_iniciar', label: 'Por Iniciar' },
        { value: 'en_progreso', label: 'En Progreso' },
        { value: 'finalizado', label: 'Finalizado' },
        { value: 'pausado', label: 'Pausado' },
        { value: 'por_agendar', label: 'Por Agendar' },
        { value: 'deprecado', label: 'Deprecado' }
      ]);
    }
  };

  const fetchCategoriasRiesgo = async () => {
    try {
      const response = await obtenerCategoriasRiesgo();
      
      if (response.error) {
        console.error('Error al obtener categorías de riesgo:', response.error);
        return;
      }
      
      // Mapear categorías de riesgo correctamente
      const categoriasMapeadas = (response.data || []).map((categoria: any) => ({
        value: categoria.id,
        label: categoria.nombre || 'Sin nombre'
      }));
      
      setCategoriasRiesgo(categoriasMapeadas);
    } catch (error) {
      console.error('Error al obtener categorías de riesgo:', error);
      // Usar categorías fallback si hay error
      setCategoriasRiesgo([
        { value: 'bajo', label: 'Bajo' },
        { value: 'medio', label: 'Medio' },
        { value: 'alto', label: 'Alto' }
      ]);
    }
  };

  const fetchTiposInvestigacion = async () => {
    try {
      // Usar función de investigaciones para obtener tipos
      const response = await obtenerTiposInvestigacion();
      
      if (response.error) {
        console.error('Error al obtener tipos de investigación:', response.error);
        return;
      }
      
      // Mapear tipos de investigación correctamente
      const tiposMapeados = (response.data || []).map((tipo: any) => ({
        value: tipo.id,
        label: tipo.nombre || 'Sin nombre'
      }));
      
      setTiposInvestigacion(tiposMapeados);
    } catch (error) {
      console.error('Error al obtener tipos de investigación:', error);
      // Usar tipos fallback si hay error
      setTiposInvestigacion([
        { value: 'usabilidad', label: 'Usabilidad' },
        { value: 'entrevista', label: 'Entrevista' },
        { value: 'encuesta', label: 'Encuesta' }
      ]);
    }
  };

  const handleInlineUpdate = async (id: string, field: string, value: any) => {
    try {
      const response = await actualizarInvestigacion(id, { [field]: value });
      
      if (response.error) {
        showError('Error al actualizar');
        return;
      }
      
      showSuccess('Actualizado correctamente');
      fetchInvestigaciones(); // Recargar datos
    } catch (error) {
      console.error('Error actualizando investigación:', error);
      showError('Error al actualizar');
    }
  };

  const handleDelete = async (investigacion: Investigacion) => {
    // Verificar permisos antes de eliminar
    if (!tienePermisoSobreElemento(investigacion, 'investigaciones', 'eliminar')) {
      showError('No tienes permisos para eliminar esta investigación');
      return;
    }
    
    setInvestigacionToDelete(investigacion);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (investigacionToDelete) {
      try {
        const response = await eliminarInvestigacion(investigacionToDelete.id);
        
        if (response.error) {
          showError('Error al eliminar la investigación');
          return;
        }
        
        showSuccess('Investigación eliminada exitosamente');
        fetchInvestigaciones(); // Recargar la lista
        setInvestigacionToDelete(null);
        setShowDeleteModal(false);
    } catch (error) {
      console.error('Error eliminando investigación:', error);
        showError('Error al eliminar la investigación');
      }
    }
  };

  // Handler para crear investigación
  const handleCrearInvestigacion = () => {
    router.push('/investigaciones/crear');
  };

  // Función para manejar la creación de seguimientos
  const handleCrearSeguimiento = async (data: SeguimientoFormData) => {
    try {
      const response = await crearSeguimiento(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showSuccess('Seguimiento creado exitosamente');
      setShowSeguimientoModal(false);
      setInvestigacionParaSeguimiento(null);
      
      // Recargar investigaciones para actualizar el estado
      await fetchInvestigaciones();
    } catch (error: any) {
      console.error('Error creando seguimiento:', error);
      showError(error.message || 'Error al crear el seguimiento');
      throw error;
    }
  };

  // Manejar clic en fila de investigación
  const handleRowClick = (row: any) => {
    router.push(`/investigaciones/ver/${row.id}`);
  };

  // Funciones para manejar filtros avanzados
  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  const handleFiltersChange = (newFilters: FilterValuesInvestigacion) => {
    console.log('🔍 handleFiltersChange llamado con:', newFilters);
    console.log('🔍 Estado anterior:', filters.estado);
    console.log('🔍 Estado nuevo:', newFilters.estado);
    setFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.estado && filters.estado !== 'todos') count++;
    if (filters.tipo && filters.tipo !== 'todos') count++;
    if (filters.periodo && filters.periodo !== 'todos') count++;
    if (filters.responsable && filters.responsable !== 'todos') count++;
    if (filters.implementador && filters.implementador !== 'todos') count++;
    if (filters.creador && filters.creador !== 'todos') count++;
    if (filters.fecha_inicio_desde) count++;
    if (filters.fecha_inicio_hasta) count++;
    if (filters.fecha_fin_desde) count++;
    if (filters.fecha_fin_hasta) count++;
    if (filters.tieneLibreto && filters.tieneLibreto !== 'todos') count++;
    if (filters.nivelRiesgo && filters.nivelRiesgo.length > 0) count++;
    if (filters.linkPrueba && filters.linkPrueba !== 'todos') count++;
    if (filters.linkResultados && filters.linkResultados !== 'todos') count++;
    if (filters.seguimiento && filters.seguimiento !== 'todos') count++;
    if (filters.estadoSeguimiento && filters.estadoSeguimiento.length > 0) count++;
    return count;
  };

  // ====================================
  // FUNCIONES PARA GESTIONAR LINKS
  // ====================================

  const handleSaveLinkPrueba = async (investigacionId: string, link: string) => {
    try {
      const response = await actualizarLinkPrueba(investigacionId, link);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Actualizar la investigación en la lista local
      setInvestigaciones(prev => prev.map(inv => 
        inv.id === investigacionId 
          ? { ...inv, link_prueba: link }
          : inv
      ));
      
      showSuccess('Link de prueba actualizado correctamente');
    } catch (error: any) {
      console.error('Error guardando link de prueba:', error);
      showError(error.message || 'Error al actualizar el link de prueba');
      throw error;
    }
  };

  const handleDeleteLinkPrueba = async (investigacionId: string) => {
    try {
      const response = await eliminarLinkPrueba(investigacionId);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Actualizar la investigación en la lista local
      setInvestigaciones(prev => prev.map(inv => 
        inv.id === investigacionId 
          ? { ...inv, link_prueba: null }
          : inv
      ));
      
      showSuccess('Link de prueba eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando link de prueba:', error);
      showError(error.message || 'Error al eliminar el link de prueba');
      throw error;
    }
  };

  const handleSaveLinkResultados = async (investigacionId: string, link: string) => {
    try {
      const response = await actualizarLinkResultados(investigacionId, link);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Actualizar la investigación en la lista local
      setInvestigaciones(prev => prev.map(inv => 
        inv.id === investigacionId 
          ? { ...inv, link_resultados: link }
          : inv
      ));
      
      showSuccess('Link de resultados actualizado correctamente');
    } catch (error: any) {
      console.error('Error guardando link de resultados:', error);
      showError(error.message || 'Error al actualizar el link de resultados');
      throw error;
    }
  };

  const handleDeleteLinkResultados = async (investigacionId: string) => {
    try {
      const response = await eliminarLinkResultados(investigacionId);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Actualizar la investigación en la lista local
      setInvestigaciones(prev => prev.map(inv => 
        inv.id === investigacionId 
          ? { ...inv, link_resultados: null }
          : inv
      ));
      
      showSuccess('Link de resultados eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando link de resultados:', error);
      showError(error.message || 'Error al eliminar el link de resultados');
      throw error;
    }
  };

  // ====================================
  // FUNCIONES PARA GESTIONAR LIBRETOS
  // ====================================

  // === CÁLCULO DE MÉTRICAS DE RIESGO EN VIVO ===
  const metricasRiesgo = useMemo(() => {
    const conteo = { alto: 0, medio: 0, bajo: 0, sin_fecha: 0 };
    investigaciones.forEach(inv => {
      const nivel = calcularNivelRiesgo(inv).nivel;
      if (conteo[nivel] !== undefined) conteo[nivel]++;
    });
    return conteo;
  }, [investigaciones]);

  // Opciones de filtro de nivel de riesgo sincronizadas con calcularNivelRiesgo
  const opcionesNivelRiesgo = [
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Medio' },
    { value: 'bajo', label: 'Bajo' },
    { value: 'sin_fecha', label: 'Sin fecha' },
    { value: 'completado', label: 'Completado' },
  ];

  // Definición de las columnas
  const investigacionesFiltradas = useMemo(() => {
    return filtrarInvestigaciones(investigaciones, searchTerm, filters);
  }, [investigaciones, searchTerm, filters, filtrarInvestigaciones]);

  const columns = [
    {
      key: 'nombre',
      label: 'Investigación',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div 
              className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary transition-colors"
              onClick={() => router.push(`/investigaciones/ver/${row.id}`)}
            >
              {row.nombre || 'Sin nombre'}
            </div>
            <div className="text-sm text-gray-500">
              {row.tipo_investigacion_nombre || 'Sin tipo'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        
        // Encontrar el usuario responsable en la lista de usuarios
        const usuarioResponsable = usuarios.find(u => u.id === row.responsable_id);
        
        return (
          <InlineUserSelect
            id={`responsable-${row.id}`}
            value={row.responsable_id}
            options={usuarios.map(u => ({ value: u.id, label: u.name || u.email || 'Sin nombre', email: u.email, avatar_url: u.avatar_url }))}
            currentUser={usuarioResponsable ? {
              name: usuarioResponsable.name,
              email: usuarioResponsable.email,
              avatar_url: usuarioResponsable.avatar_url
            } : undefined}
            onSave={(newValue) => handleInlineUpdate(row.id, 'responsable_id', newValue)}
          />
        );
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.estado}
            options={estadosInvestigacion}
            onSave={(newValue) => handleInlineUpdate(row.id, 'estado', newValue)}
            useChip={true}
            getChipVariant={getEstadoInvestigacionVariant}
            getChipText={getEstadoInvestigacionText}
          />
        );
      }
    },
    {
      key: 'periodo',
      label: 'Período',
      sortable: false,
      width: 'min-w-[140px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.periodo_id}
            options={periodos.map(p => ({ value: p.id, label: p.nombre || 'Sin nombre' }))}
            onSave={(newValue) => handleInlineUpdate(row.id, 'periodo_id', newValue)}
          />
        );
      }
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha Inicio',
      sortable: true,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineDate
            value={row.fecha_inicio}
            onSave={(newValue) => handleInlineUpdate(row.id, 'fecha_inicio', newValue)}
          />
        );
      }
    },
    {
      key: 'fecha_fin',
      label: 'Fecha Fin',
      sortable: true,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineDate
            value={row.fecha_fin}
            onSave={(newValue) => handleInlineUpdate(row.id, 'fecha_fin', newValue)}
          />
        );
      }
    },
    {
      key: 'riesgo',
      label: 'Nivel de Riesgo',
      sortable: true,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        const riesgoInfo = calcularNivelRiesgo(row);
        if (riesgoInfo.nivel === 'completado') {
          return null;
        }
        const badgeVariant = getRiesgoBadgeVariant(riesgoInfo.nivel);
        const iconName = getRiesgoIconName(riesgoInfo.nivel);

        // Mapeo de iconos por nombre
        const iconMap: { [key: string]: any } = {
          AlertTriangleIcon: <AlertTriangleIcon className="w-4 h-4" />,
          ExclamationTriangleIcon: <InfoIcon className="w-4 h-4" />,
          CheckCircleIcon: <CheckCircleIcon className="w-4 h-4" />,
          QuestionMarkCircleIcon: <InfoIcon className="w-4 h-4" />
        };

        const icon = iconMap[iconName] || <InfoIcon className="w-4 h-4" />;

        return (
          <div 
            className="flex items-center cursor-help group relative"
            title={riesgoInfo.descripcion}
          >
            <Chip 
              variant={badgeVariant} 
              size="sm"
              icon={icon}
              className="whitespace-nowrap group-hover:opacity-80 transition-opacity"
            >
              {getRiesgoText(riesgoInfo.nivel)}
            </Chip>
            {/* Tooltip personalizado */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {riesgoInfo.descripcion}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        );
      },
      // Función de ordenamiento personalizada para riesgo
      sortFn: (a: any, b: any) => {
        const riesgoA = calcularNivelRiesgo(a);
        const riesgoB = calcularNivelRiesgo(b);
        
        const prioridadA = getRiesgoPrioridad(riesgoA.nivel);
        const prioridadB = getRiesgoPrioridad(riesgoB.nivel);
        
        // Ordenar por prioridad (mayor a menor) y luego por días restantes
        if (prioridadA !== prioridadB) {
          return prioridadB - prioridadA; // Mayor prioridad primero
        }
        
        // Si tienen la misma prioridad, ordenar por días restantes
        return riesgoA.diasRestantes - riesgoB.diasRestantes;
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sortable: false,
      width: 'w-16',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        
        // Acciones del menú desplegable
        const actions = [
          {
            label: 'Ver',
            icon: <EyeIcon className="w-4 h-4" />,
            onClick: () => router.push(`/investigaciones/ver/${row.id}`),
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          },
          {
            label: tieneLibreto(row.id) ? 'Ver Libreto' : 'Crear Libreto',
            icon: <FileTextIcon className="w-4 h-4" />,
            onClick: () => {
              if (tieneLibreto(row.id)) {
                router.push(`/investigaciones/libreto/${row.id}`);
              } else {
                router.push(`/investigaciones/libreto/crear?investigacion=${row.id}`);
              }
            },
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          }
        ];

        // Agregar acción de editar solo si tiene permisos
        if (tienePermisoSobreElemento(row, 'investigaciones', 'editar')) {
          actions.push({
            label: 'Editar',
            icon: <EditIcon className="w-4 h-4" />,
            onClick: () => router.push(`/investigaciones/editar/${row.id}`),
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          });
        }

        // Agregar acción de duplicar solo si tiene permisos de ver
        if (tienePermisoSobreElemento(row, 'investigaciones', 'ver')) {
          actions.push({
            label: 'Duplicar',
            icon: <CopyIcon className="w-4 h-4" />,
            onClick: () => router.push(`/investigaciones/crear?duplicate=${row.id}`),
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          });
        }

        // Agregar acción de eliminar solo si tiene permisos
        if (tienePermisoSobreElemento(row, 'investigaciones', 'eliminar')) {
          actions.push({
            label: 'Eliminar',
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: () => handleDelete(row),
            className: 'text-destructive hover:text-destructive/80'
          });
        }

        // Agregar acción de crear seguimiento si está en progreso
        if (row.estado === 'en_progreso') {
          actions.splice(2, 0, {
            label: 'Crear seguimiento',
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: () => {
              setInvestigacionParaSeguimiento(row);
              setShowSeguimientoModal(true);
            },
            className: 'text-success hover:text-success/80'
          });
        }

        return (
          <ActionsMenu
            actions={actions}
          />
        );
      }
    }
  ];

  return (
    <>
      <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header modernizado */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                  <Typography variant="h2" color="title" weight="bold">
                    Investigaciones
                  </Typography>
                  <Typography variant="subtitle1" color="secondary">
                  Gestiona y organiza todas las investigaciones
                  </Typography>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleCrearInvestigacion}
              >
                Nueva Investigación
              </Button>
            </div>
          </div>

          {/* Estadísticas del Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Investigaciones */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {investigaciones.length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Investigaciones
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900 bg-opacity-20' : 'bg-primary/10'}`}>
                  <InvestigacionesIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Estados de Investigaciones */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {investigaciones.filter(inv => inv.estado === 'en_progreso').length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    En Progreso
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-warning/10'}`}>
                  <BarChartIcon className="w-6 h-6 text-warning" />
                </div>
              </div>
            </Card>

            {/* Seguimientos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {metricasSeguimientos?.seguimientos?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Seguimientos
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-secondary/10'}`}>
                  <ClipboardListIcon className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            {/* Tasa de Finalización */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {investigaciones.length > 0 
                      ? Math.round((investigaciones.filter(inv => inv.estado === 'finalizado').length / investigaciones.length) * 100)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Tasa Finalización
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-success/10'}`}>
                  <CheckCircleIcon className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>
          </div>

          {/* Barra de búsqueda y filtro al estilo gestión de usuarios */}
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar investigaciones..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2"
                  icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                />
              </div>
              <div className="flex items-center gap-2">
              <Button
                  variant={getActiveFiltersCount() > 0 ? "primary" : "secondary"}
                  onClick={handleOpenFilters}
                  className="relative flex items-center gap-2"
                >
                  <FilterIcon className="w-4 h-4" />
                  Filtros Avanzados
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </Button>
                </div>
              </div>
            </Card>

          {/* Tabla de investigaciones */}
          <DataTable
            data={investigacionesFiltradas}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            selectable={false}
            onRowClick={handleRowClick}
            emptyMessage="No se encontraron investigaciones"
            loadingMessage="Cargando investigaciones..."
            rowKey="id"
          />
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!investigacionToDelete}
        onClose={() => setInvestigacionToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Investigación"
        message={`¿Estás seguro de que deseas eliminar la investigación "${investigacionToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="error"
        loading={loading}
      />

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="investigacion"
        options={{
          estados: estadosInvestigacion,
          tipos: tiposInvestigacion,
          periodos: periodos.map(p => ({ value: p.id, label: p.nombre })),
          responsables: usuarios.map(u => ({ 
            value: u.id, 
            label: u.name || u.email || 'Usuario sin nombre',
            avatar_url: u.avatar_url 
          })),
          implementadores: usuarios.map(u => ({ 
            value: u.id, 
            label: u.name || u.email || 'Usuario sin nombre',
            avatar_url: u.avatar_url 
          })),
          creadores: usuarios.map(u => ({ 
            value: u.id, 
            label: u.name || u.email || 'Usuario sin nombre',
            avatar_url: u.avatar_url 
          })),
          nivelRiesgo: opcionesNivelRiesgo,
          seguimiento: [
            { value: 'todos', label: 'Todos' },
            { value: 'con_seguimiento', label: 'Con seguimiento' },
            { value: 'sin_seguimiento', label: 'Sin seguimiento' },
          ],
          estadoSeguimiento: [
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_progreso', label: 'En progreso' },
            { value: 'completado', label: 'Completado' },
            { value: 'convertido', label: 'Convertido' },
            { value: 'bloqueado', label: 'Bloqueado' },
            { value: 'cancelado', label: 'Cancelado' },
          ],
        }}
      />

      {/* Modal de seguimiento */}
      <SeguimientoSideModal
        isOpen={showSeguimientoModal}
        onClose={() => {
          setShowSeguimientoModal(false);
          setInvestigacionParaSeguimiento(null);
        }}
        onSave={handleCrearSeguimiento}
        investigacionId={investigacionParaSeguimiento?.id || ''}
        usuarios={usuarios.map(u => ({
          id: u.id,
          full_name: u.name || '',
          email: u.email || '',
          avatar_url: u.avatar_url || ''
        }))}
      />
    </Layout>
    </>
  );
}