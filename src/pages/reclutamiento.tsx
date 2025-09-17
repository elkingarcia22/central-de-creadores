import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { usePermisos } from '../utils/permisosUtils';

import { Layout, Typography, Card, Button, Input, Chip, ProgressBar, FilterDrawer, ActionsMenu, PageHeader } from '../components/ui';
import DataTable from '../components/ui/DataTable';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import type { FilterValuesReclutamiento, FilterOptions } from '../components/ui';
import AgregarParticipanteModal from '../components/ui/AgregarParticipanteModal';
import AsignarAgendamientoModal from '../components/ui/AsignarAgendamientoModal';
import ReclutamientoUnifiedContainer from '../components/reclutamiento/ReclutamientoUnifiedContainer';
import { 
  SearchIcon, 
  PlusIcon, 
  MoreVerticalIcon, 
  EditIcon, 
  EyeIcon, 
  UserIcon,
  ReclutamientoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  FilterIcon,
  BarChartIcon,
  ClipboardListIcon,
  FileTextIcon,
  CopyIcon,
  BellIcon,
  LoadingIcon
} from '../components/icons';
import { obtenerEstadosReclutamiento } from '../api/supabase-investigaciones';
import { getRiesgoIconName } from '../utils/riesgoUtils';
import { getEstadoInvestigacionVariant, getEstadoInvestigacionText, getEstadoReclutamientoVariant, getEstadoReclutamientoText } from '../utils/estadoUtils';
import { getChipVariant, getChipText } from '../utils/chipUtils';

// Tipos para la estructura de datos
interface InvestigacionReclutamiento {
  reclutamiento_id: string;
  investigacion_id: string;
  investigacion_nombre: string;
  estado_investigacion: string;
  investigacion_fecha_inicio: string;
  investigacion_fecha_fin: string;
  investigacion_riesgo: string; // Riesgo de la investigación (original)
  libreto_titulo: string;
  libreto_descripcion: string;
  libreto_numero_participantes: number;
  responsable_nombre: string;
  responsable_correo: string;
  implementador_nombre: string;
  implementador_correo: string;
  estado_reclutamiento_id: string; // ID del estado de reclutamiento
  estado_reclutamiento_nombre: string;
  estado_reclutamiento_color: string;
  participantes_reclutados: number;
  progreso_reclutamiento: string;
  porcentaje_completitud: number;
  // Nuevos campos de riesgo de reclutamiento
  riesgo_reclutamiento: string; // 'bajo', 'medio', 'alto'
  riesgo_reclutamiento_color: string; // Color del riesgo de reclutamiento
  dias_restantes_inicio: number; // Días restantes hasta el inicio
  tipo_reclutamiento: string; // 'automatico' o 'manual'
  tipo?: string; // 'asignacion_agendamiento' para reclutamientos asignados
  participante_nombre?: string; // Nombre del participante para asignaciones
  fecha_sesion?: string | null; // Fecha de sesión para asignaciones
}

interface MetricasReclutamiento {
  total: number;
  estados: {
    pendientes: number;
    enProgreso: number;
    completados: number;
    cancelados: number;
  };
  progreso: {
    totalParticipantesNecesarios: number;
    totalParticipantesReclutados: number;
    promedioCompletitud: number;
    progresoGeneral: string;
  };
  resumen: {
    responsablesUnicos: number;
    implementadoresUnicos: number;
    libretosUnicos: number;
  };
  metricasPorMes: Array<{
    mes: string;
    total: number;
    enProgreso: number;
    completados: number;
  }>;
  investigaciones: InvestigacionReclutamiento[];
}

export default function ReclutamientoPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const { userProfile } = useUser();
  const { tienePermiso, esAdministrador, usuarioId, tienePermisoSobreElemento, usuarioEsCreador } = usePermisos();
  const router = useRouter();

  // Estados
  const [investigaciones, setInvestigaciones] = useState<InvestigacionReclutamiento[]>([]);
  const [reclutamientosAsignados, setReclutamientosAsignados] = useState<any[]>([]);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showAgregarParticipanteModal, setShowAgregarParticipanteModal] = useState(false);
  const [showAsignarAgendamientoModal, setShowAsignarAgendamientoModal] = useState(false);
  const [investigacionSeleccionada, setInvestigacionSeleccionada] = useState<InvestigacionReclutamiento | null>(null);
  
  // Estados para métricas
  const [metricas, setMetricas] = useState<MetricasReclutamiento | null>(null);
  const [estadosReclutamiento, setEstadosReclutamiento] = useState<any[]>([]);
  
  // Estados para filtros
  const [filters, setFilters] = useState<FilterValuesReclutamiento>({
    estados: [],
    responsables: [],
    implementadores: [],
    periodos: [],
    tiposInvestigacion: [],
    fechaInicioDe: '',
    fechaInicioHasta: '',
    fechaFinDe: '',
    fechaFinHasta: '',
    tieneLibreto: '',
    nivelRiesgo: [],
    linkPrueba: '',
    linkResultados: '',
    seguimiento: '',
    estadoSeguimiento: []
  });

  // Estados para opciones de filtros
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    estados: [],
    responsables: [],
    implementadores: [],
    periodos: [],
    tiposInvestigacion: [],
    nivelRiesgo: []
  });

  // Opciones de nivel de riesgo
  const opcionesNivelRiesgo = [
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Medio' },
    { value: 'bajo', label: 'Bajo' },
  ];
  
  // Cargar datos iniciales y cuando cambie el rol o el usuario
  useEffect(() => {
    console.log('🚀 useEffect ejecutándose - cargando datos iniciales');
    console.log('🎭 Rol actual:', rolSeleccionado);
    console.log('👤 User Profile:', userProfile?.id);
    
    // Evitar cargar datos si el rol está vacío o el usuario no está cargado
    if (!rolSeleccionado || !userProfile?.id) {
      console.log('⏸️ Rol vacío o usuario no cargado, esperando...');
      return;
    }
    
    cargarDatos();
  }, [rolSeleccionado, userProfile?.id]); // Se ejecuta cuando cambia el rol o el usuario

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Iniciando carga de datos...');
      await Promise.all([
        fetchMetricasReclutamientos(),
        fetchEstadosReclutamiento()
      ]);
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para cargar datos
  const fetchMetricasReclutamientos = async () => {
    try {
      console.log('📊 Iniciando fetchMetricasReclutamientos...');
      
      // Verificar permisos antes de cargar
      console.log('🔍 Verificando permisos de reclutamiento...');
      console.log('👤 Usuario ID:', usuarioId);
      console.log('👤 User Profile ID:', userProfile?.id);
      console.log('🎭 Rol Seleccionado:', rolSeleccionado);
      console.log('🔐 Tiene permiso ver reclutamientos:', tienePermiso('reclutamientos', 'ver'));
      
      // Verificar que el usuario esté cargado
      if (!userProfile?.id) {
        console.log('⏸️ Usuario no cargado aún, esperando...');
        return;
      }

      // Para agendador, permitir acceso siempre (puede ver sus asignaciones)
      const rolActivoEsAdmin = rolSeleccionado?.toLowerCase() === 'administrador';
      const esAgendador = rolSeleccionado?.toLowerCase() === 'agendador';
      
      if (!tienePermiso('reclutamientos', 'ver') && !rolActivoEsAdmin && !esAgendador) {
        console.log('❌ Usuario no tiene permisos para ver reclutamientos');
        setInvestigaciones([]);
        return;
      }
      console.log('🎭 Rol Activo en Reclutamiento:', rolSeleccionado, 'Es Admin:', rolActivoEsAdmin);
      const url = `/api/metricas-reclutamientos?usuarioId=${userProfile?.id}&esAdmin=${rolActivoEsAdmin}&rol=${rolSeleccionado}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Datos recibidos de la API:', data);
        console.log('📊 Investigaciones recibidas:', data.investigaciones?.length || 0);
        if (data.investigaciones && data.investigaciones.length > 0) {
          console.log('📊 Primera investigación:', data.investigaciones[0]);
          console.log('📊 Campo libreto_numero_participantes:', data.investigaciones[0].libreto_numero_participantes);
          
          // Verificar duplicados en los datos recibidos
          const ids = data.investigaciones.map((inv: any) => inv.reclutamiento_id);
          const idsUnicos = [...new Set(ids)];
          console.log('🔍 IDs únicos:', idsUnicos.length);
          console.log('🔍 IDs totales:', ids.length);
          console.log('🔍 ¿Hay duplicados en la API?', ids.length !== idsUnicos.length);
          
          if (ids.length !== idsUnicos.length) {
            console.log('❌ DUPLICADOS ENCONTRADOS EN LA API:');
            const duplicados = ids.filter((id: string, index: number) => ids.indexOf(id) !== index);
            console.log('🔍 IDs duplicados:', [...new Set(duplicados)]);
          }
        }
        setMetricas(data.metricas);
        setInvestigaciones(data.investigaciones);
        setReclutamientosAsignados(data.reclutamientosAsignados || []);
        console.log('📊 Reclutamientos asignados cargados:', data.reclutamientosAsignados?.length || 0);
        console.log('📊 Datos de reclutamientos asignados:', data.reclutamientosAsignados);
      } else {
        console.error('❌ Error en API métricas-reclutamientos:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error detallado:', errorText);
        // En lugar de lanzar error, usar datos vacíos para permitir testing
        setMetricas({
          total: 0,
          porEstado: {},
          porRiesgo: {},
          asignacionesAgendamiento: 0
        });
        setInvestigaciones([]);
        setReclutamientosAsignados([]);
        console.log('⚠️ Usando datos vacíos debido a error en API');
      }
    } catch (error) {
      console.error('Error obteniendo métricas de reclutamientos:', error);
      // En lugar de lanzar error, usar datos vacíos para permitir testing
      setMetricas({
        total: 0,
        porEstado: {},
        porRiesgo: {},
        asignacionesAgendamiento: 0
      });
      setInvestigaciones([]);
      setReclutamientosAsignados([]);
      console.log('⚠️ Usando datos vacíos debido a error en catch');
    }
  };

  // Función para cargar estados de reclutamiento
  const fetchEstadosReclutamiento = async () => {
    try {
      const response = await obtenerEstadosReclutamiento();
      
      if (response.error) {
        // Usar estados fallback si hay error
        setEstadosReclutamiento([
          { value: 'por_iniciar', label: 'Por iniciar' },
          { value: 'en_progreso', label: 'En progreso' },
          { value: 'agendada', label: 'Agendada' },
          { value: 'cancelado', label: 'Cancelado' },
        ]);
      } else {
        setEstadosReclutamiento(response.data || []);
      }
    } catch (error) {
      console.error('Error obteniendo estados de reclutamiento:', error);
      // Usar estados fallback si hay error
      setEstadosReclutamiento([
        { value: 'por_iniciar', label: 'Por iniciar' },
        { value: 'en_progreso', label: 'En progreso' },
        { value: 'agendada', label: 'Agendada' },
        { value: 'cancelado', label: 'Cancelado' },
      ]);
    }
  };

  // Función para filtrar investigaciones
  const filtrarInvestigaciones = useCallback((data: InvestigacionReclutamiento[], search: string, filters: FilterValuesReclutamiento) => {
    let filtradas = [...data];
    
    // Filtrar por término de búsqueda
    if (search.trim()) {
      const termino = search.toLowerCase();
      filtradas = filtradas.filter(inv => 
        inv.investigacion_nombre?.toLowerCase().includes(termino) ||
        inv.libreto_titulo?.toLowerCase().includes(termino) ||
        inv.responsable_nombre?.toLowerCase().includes(termino) ||
        inv.implementador_nombre?.toLowerCase().includes(termino) ||
        inv.estado_reclutamiento_nombre?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por estado de reclutamiento - AHORA POR NOMBRE
    if (filters.estados && filters.estados.length > 0) {
      filtradas = filtradas.filter(inv => 
        inv.estado_reclutamiento_nombre && filters.estados.includes(inv.estado_reclutamiento_nombre)
      );
    }

    // Filtrar por nivel de riesgo
    if (filters.nivelRiesgo.length > 0) {
      filtradas = filtradas.filter(inv => {
        // Si el riesgo es null, asignar 'bajo' por defecto
        const riesgo = inv.riesgo_reclutamiento || 'bajo';
        return filters.nivelRiesgo.includes(riesgo.toLowerCase());
      });
    }

    // Filtrar por porcentaje de avance usando slider
    if (filters.porcentajeAvance && (filters.porcentajeAvance[0] > 0 || filters.porcentajeAvance[1] < 100)) {
      filtradas = filtradas.filter(inv => {
        const porcentaje = inv.porcentaje_completitud || 0;
        return porcentaje >= filters.porcentajeAvance![0] && porcentaje <= filters.porcentajeAvance![1];
      });
    }

    // Filtrar por número de participantes usando slider
    if (filters.numeroParticipantes && (filters.numeroParticipantes[0] > 1 || filters.numeroParticipantes[1] < 50)) {
      filtradas = filtradas.filter(inv => {
        const participantes = inv.libreto_numero_participantes || 0;
        return participantes >= filters.numeroParticipantes![0] && participantes <= filters.numeroParticipantes![1];
      });
    }

    // Filtrar por responsable - CORREGIDO: usar nombres en lugar de IDs
    if (filters.responsables.length > 0) {
      filtradas = filtradas.filter(inv => 
        inv.responsable_nombre && 
        filters.responsables.includes(inv.responsable_nombre)
      );
    }

    // Filtrar por implementador - CORREGIDO: usar nombres en lugar de IDs
    if (filters.implementadores.length > 0) {
      filtradas = filtradas.filter(inv => 
        inv.implementador_nombre && 
        filters.implementadores.includes(inv.implementador_nombre)
      );
    }

    return filtradas;
  }, []);

  // Investigaciones filtradas
  const investigacionesFiltradas = useMemo(() => {
    console.log('🔍 investigacionesFiltradas ejecutándose');
    console.log('📊 investigaciones.length:', investigaciones.length);
    console.log('🔍 investigaciones:', investigaciones);
    const resultado = filtrarInvestigaciones(investigaciones, searchTerm, filters);
    console.log('📊 investigacionesFiltradas.length:', resultado.length);
    console.log('🔍 investigacionesFiltradas:', resultado);
    return resultado;
  }, [investigaciones, searchTerm, filters, filtrarInvestigaciones]);

  // Solo usar investigaciones filtradas (sin agregar asignaciones como filas separadas)
  const datosCompletos = useMemo(() => {
    console.log('🔍 datosCompletos ejecutándose');
    console.log('📊 investigacionesFiltradas.length:', investigacionesFiltradas.length);
    console.log('📊 reclutamientosAsignados.length:', reclutamientosAsignados.length);
    
    // Solo devolver las investigaciones filtradas, sin agregar asignaciones como filas separadas
    console.log('📊 Datos completos (solo investigaciones):', investigacionesFiltradas.length);
    return investigacionesFiltradas;
  }, [investigacionesFiltradas, reclutamientosAsignados]);

  // Generar opciones de filtro dinámicamente - AHORA POR NOMBRE
  const filterOptionsDynamic = useMemo(() => {
    // Obtener valores únicos de los datos reales
    const responsables = [...new Set(investigaciones.map(inv => inv.responsable_nombre).filter(Boolean))];
    const implementadores = [...new Set(investigaciones.map(inv => inv.implementador_nombre).filter(Boolean))];
    const riesgos = [...new Set(investigaciones.map(inv => inv.riesgo_reclutamiento).filter(Boolean))];
    
    // Opciones de estado: usar nombres del catálogo para el value y label
    const estados = estadosReclutamiento.map(e => ({
      value: e.nombre, // Usar el nombre como value para que coincida con el filtrado
      label: e.nombre // Usar el nombre para mostrar
    }));
    
    // Agregar "Agendada" si no está en la lista pero está en los datos
    const estadosEnDatos = [...new Set(investigaciones.map(inv => inv.estado_reclutamiento_nombre).filter(Boolean))];
    const estadosFaltantes = estadosEnDatos.filter(estado => !estados.some(e => e.value === estado));
    
    if (estadosFaltantes.length > 0) {
      estadosFaltantes.forEach(estado => {
        estados.push({ value: estado, label: estado });
      });
    }
    
    const options = {
      estados: estados, // Todos los estados del catálogo
      responsables: responsables.map(resp => ({ value: resp, label: resp })),
      implementadores: implementadores.map(impl => ({ value: impl, label: impl })),
      periodos: [
        { value: 'todos', label: 'Todos los períodos' },
      ],
      tiposInvestigacion: [
        { value: 'todos', label: 'Todos los tipos' },
      ],
      nivelRiesgo: opcionesNivelRiesgo, // Usar las opciones estáticas definidas
    };
    return options;
  }, [investigaciones, estadosReclutamiento, opcionesNivelRiesgo]);

  // === CÁLCULO DE MÉTRICAS DE RIESGO EN VIVO ===
  const metricasRiesgo = useMemo(() => {
    const conteo = { alto: 0, medio: 0, bajo: 0 };
    investigaciones.forEach(inv => {
      const riesgo = inv.riesgo_reclutamiento?.toLowerCase();
      if (riesgo === 'alto') {
        conteo.alto++;
      } else if (riesgo === 'medio') {
        conteo.medio++;
      } else if (riesgo === 'bajo') {
        conteo.bajo++;
      }
    });
    return conteo;
  }, [investigaciones]);

  // Handlers
  const handleCrearReclutamiento = () => {
    setShowAgregarParticipanteModal(true);
  };

  const handleCloseAgregarParticipanteModal = () => {
    setShowAgregarParticipanteModal(false);
    setInvestigacionSeleccionada(null);
  };

  const handleSuccessAgregarParticipante = () => {
    setShowAgregarParticipanteModal(false);
    setInvestigacionSeleccionada(null);
    cargarDatos();
    showSuccess('Participante agregado exitosamente');
  };

  const handleAsignarAgendamiento = () => {
    setShowAsignarAgendamientoModal(true);
  };

  const handleCloseAsignarAgendamientoModal = () => {
    setShowAsignarAgendamientoModal(false);
    setInvestigacionSeleccionada(null);
  };

  const handleSuccessAsignarAgendamiento = () => {
    setShowAsignarAgendamientoModal(false);
    setInvestigacionSeleccionada(null);
    cargarDatos();
    showSuccess('Agendamiento asignado exitosamente');
  };

  const handleRowClick = (row: InvestigacionReclutamiento) => {
    // Para investigaciones automáticas, usar el investigacion_id como reclutamiento_id
    const reclutamientoId = row.reclutamiento_id || row.investigacion_id;
    router.push(`/reclutamiento/ver/${reclutamientoId}`);
  };


  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.estados.length > 0) count++;
    if (filters.responsables.length > 0) count++;
    if (filters.implementadores.length > 0) count++;
    if (filters.nivelRiesgo.length > 0) count++;
    if (filters.porcentajeAvance && (filters.porcentajeAvance[0] > 0 || filters.porcentajeAvance[1] < 100)) count++;
    if (filters.numeroParticipantes && (filters.numeroParticipantes[0] > 1 || filters.numeroParticipantes[1] < 50)) count++;
    return count;
  };

  // Función para obtener el color del estado de reclutamiento




  // Función para actualizar estado manualmente
  const handleActualizarEstado = async (investigacionId: string, estadoId: string) => {
    try {
      const response = await fetch('/api/actualizar-estado-reclutamiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investigacion_id: investigacionId,
          estado_reclutamiento_id: estadoId
        })
      });

      if (response.ok) {
        showSuccess('Estado actualizado correctamente');
        // Recargar datos
        await cargarDatos();
      } else {
        const error = await response.json();
        showError('Error actualizando estado: ' + error.error);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showError('Error actualizando estado');
    }
  };

  // Definición de las columnas
  const columns = [
    {
      key: 'investigacion',
      label: 'Investigación',
      sortable: true,
      width: 'w-80',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => 
        (a.investigacion_nombre || '').localeCompare(b.investigacion_nombre || ''),
      render: (value: any, row: InvestigacionReclutamiento) => (
        <div className="space-y-2">
          <div 
            className="font-semibold text-gray-900 dark:text-gray-100 text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={() => router.push(`/reclutamiento/ver/${row.reclutamiento_id}`)}
          >
            {row.investigacion_nombre || 'Sin nombre'}
          </div>
          {row.investigacion_fecha_inicio && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Inicio: {new Date(row.investigacion_fecha_inicio).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      width: 'w-48',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => 
        (a.responsable_nombre || '').localeCompare(b.responsable_nombre || ''),
      render: (value: any, row: InvestigacionReclutamiento) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {row.responsable_nombre || 'Sin asignar'}
          </div>
          {row.responsable_correo && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.responsable_correo}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'implementador',
      label: 'Implementador',
      sortable: true,
      width: 'w-48',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => 
        (a.implementador_nombre || '').localeCompare(b.implementador_nombre || ''),
      render: (value: any, row: InvestigacionReclutamiento) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {row.implementador_nombre || 'Sin asignar'}
          </div>
          {row.implementador_correo && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.implementador_correo}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      width: 'min-w-[120px]',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => 
        (a.estado_reclutamiento_nombre || '').localeCompare(b.estado_reclutamiento_nombre || ''),
      render: (value: any, row: InvestigacionReclutamiento) => {
        const estado = row.estado_reclutamiento_nombre;
        const variant = getChipVariant(estado);
        const text = getChipText(estado);
        console.log('🎯 Tabla - Estado:', estado, 'Variant:', variant, 'Text:', text);
        return (
          <Chip 
            variant={variant as any}
            size="sm"
          >
            {text}
          </Chip>
        );
      }
    },
    {
      key: 'progreso',
      label: 'Progreso',
      sortable: true,
      width: 'min-w-[140px]',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => 
        (a.porcentaje_completitud || 0) - (b.porcentaje_completitud || 0),
      render: (value: any, row: InvestigacionReclutamiento) => (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.progreso_reclutamiento || '0/0'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.porcentaje_completitud || 0}%
            </span>
          </div>
          <ProgressBar 
            value={row.porcentaje_completitud || 0} 
            max={100}
            size="sm"
            variant={row.porcentaje_completitud >= 100 ? 'success' : 'primary'}
          />
        </div>
      )
    },
    {
      key: 'participantes',
      label: 'Participantes',
      sortable: true,
      width: 'min-w-[100px]',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => 
        (a.libreto_numero_participantes || 0) - (b.libreto_numero_participantes || 0),
      render: (value: any, row: InvestigacionReclutamiento) => {
        console.log('🔍 Renderizando tab participantes para:', row.investigacion_nombre);
        console.log('🔍 libreto_numero_participantes:', row.libreto_numero_participantes);
        return (
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {row.libreto_numero_participantes || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              participantes
            </div>
          </div>
        );
      }
    },
    {
      key: 'riesgo',
      label: 'Riesgo',
      sortable: true,
      width: 'min-w-[100px]',
      sortFn: (a: InvestigacionReclutamiento, b: InvestigacionReclutamiento) => {
        // Ordenar por prioridad: alto > medio > bajo
        const getPrioridadRiesgo = (riesgo: string | undefined | null): number => {
          if (!riesgo) return 0;
          switch (riesgo.toLowerCase()) {
            case 'alto': return 3;
            case 'medio': return 2;
            case 'bajo': return 1;
            default: return 0;
          }
        };
        return getPrioridadRiesgo(b.riesgo_reclutamiento) - getPrioridadRiesgo(a.riesgo_reclutamiento);
      },
      render: (value: any, row: InvestigacionReclutamiento) => {
        // Función para obtener el texto del tooltip de riesgo de reclutamiento
        const getTooltipText = (row: InvestigacionReclutamiento): string => {
          if (!row.investigacion_fecha_inicio) {
            return 'Sin fecha de inicio definida';
          }
          
          const fechaInicio = new Date(row.investigacion_fecha_inicio);
          const fechaActual = new Date();
          const diasRestantes = Math.ceil((fechaInicio.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes < 0) {
            return `Vencida hace ${Math.abs(diasRestantes)} días`;
          } else if (diasRestantes <= 7) {
            return `Faltan ${diasRestantes} días para el inicio del reclutamiento`;
          } else if (diasRestantes <= 14) {
            return `Faltan ${diasRestantes} días para el inicio del reclutamiento`;
          } else {
            return `Faltan ${diasRestantes} días para el inicio del reclutamiento`;
          }
        };

        const tooltipText = getTooltipText(row);
        const badgeVariant = getChipVariant(row.riesgo_reclutamiento || 'bajo') as any;
        const iconName = getRiesgoIconName(row.riesgo_reclutamiento || 'bajo');

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
            className="flex items-center cursor-help chip-group relative"
            title={tooltipText}
          >
            <Chip 
              variant={badgeVariant} 
              size="sm"
              icon={icon}
              className="whitespace-nowrap chip-group-hover:opacity-80 transition-opacity"
            >
              {getChipText(row.riesgo_reclutamiento || 'bajo')}
            </Chip>
            {/* Tooltip personalizado */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 chip-group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {tooltipText}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sortable: false,
      width: 'w-16',
      render: (value: any, row: InvestigacionReclutamiento) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        
        // Acciones del menú desplegable
        const actions = [
          {
            label: row.tipo === 'asignacion_agendamiento' ? 'Ver Reclutamiento' : 'Ver',
            icon: <EyeIcon className="w-4 h-4" />,
            onClick: () => {
              router.push(`/reclutamiento/ver/${row.reclutamiento_id}`);
            },
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          },
          {
            label: 'Agregar Participante',
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: () => {
              setInvestigacionSeleccionada(row);
              setShowAgregarParticipanteModal(true);
            },
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          },
        ];

        // Agregar acción de crear seguimiento si la investigación está en progreso
        if (row.estado_investigacion === 'en_progreso') {
          actions.splice(2, 0, {
            label: 'Crear Seguimiento',
            icon: <ClipboardListIcon className="w-4 h-4" />,
            onClick: () => router.push(`/seguimientos/crear?investigacion=${row.investigacion_id}`),
            className: 'text-popover-foreground hover:text-popover-foreground/80'
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

  if (error) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <Card variant="elevated" padding="lg">
              <div className="text-center">
                <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <Typography variant="h3" color="danger" className="mb-2">
                  Error al cargar datos
                </Typography>
                <Typography variant="body1" color="secondary" className="mb-4">
                  {error}
                </Typography>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Evitar render hasta que el componente esté montado en el cliente
  if (loading) {
    return (
      <Layout rol={rolSeleccionado}>
        <div className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header modernizado */}
          <PageHeader
            title="Reclutamiento"
            subtitle="Gestionar el reclutamiento de participantes para investigaciones por agendar"
            color="teal"
            primaryAction={{
              label: "Agregar Participante",
              onClick: handleCrearReclutamiento,
              variant: "primary"
            }}
            secondaryActions={[
              {
                label: "Asignar Agendamiento",
                onClick: handleAsignarAgendamiento,
                variant: "outline"
              }
            ]}
          />

          {/* Estadísticas del Dashboard */}
          {metricas && metricasRiesgo && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Reclutamientos */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter 
                        value={metricas.total} 
                        duration={2000}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Total Reclutamientos
                    </Typography>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                    <ReclutamientoIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>

              {/* Pendientes */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter 
                        value={metricas?.estados?.pendientes || 0} 
                        duration={2000}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Pendientes
                    </Typography>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                    <BellIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>

              {/* Riesgo */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter 
                        value={(metricasRiesgo?.alto || 0) + (metricasRiesgo?.medio || 0)} 
                        duration={2000}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Riesgo Alto/Medio
                    </Typography>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                    <AlertTriangleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>

              {/* Completados */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                      <AnimatedCounter 
                        value={metricas?.estados?.completados || 0} 
                        duration={2000}
                        className="text-gray-700 dark:text-gray-200"
                      />
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Completados
                    </Typography>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                    <CheckCircleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contenedor unificado de tabla, buscador y filtros */}
          <ReclutamientoUnifiedContainer
            reclutamientos={datosCompletos}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            showFilterDrawer={showFilterDrawer}
            setShowFilterDrawer={setShowFilterDrawer}
            getActiveFiltersCount={getActiveFiltersCount}
            columns={columns}
            onRowClick={handleRowClick}
            filterOptions={{
              estados: filterOptionsDynamic.estados,
              tipos: filterOptionsDynamic.tiposInvestigacion,
              modalidades: [
                { value: 'automatico', label: 'Automático' },
                { value: 'manual', label: 'Manual' }
              ],
              responsables: filterOptionsDynamic.responsables,
              implementadores: filterOptionsDynamic.implementadores,
              empresas: filterOptionsDynamic.periodos, // Usando periodos como empresas temporalmente
            }}
          />
        </div>
      </div>



      {/* Modal de agregar participante */}
      <AgregarParticipanteModal
        isOpen={showAgregarParticipanteModal}
        onClose={handleCloseAgregarParticipanteModal}
        onSuccess={handleSuccessAgregarParticipante}
        showInvestigacionSelector={true}
        reclutamiento={investigacionSeleccionada ? {
          investigacion_id: investigacionSeleccionada.investigacion_id,
          investigacion_nombre: investigacionSeleccionada.investigacion_nombre
        } : null}
      />

      {/* Modal de asignar agendamiento */}
      <AsignarAgendamientoModal
        isOpen={showAsignarAgendamientoModal}
        onClose={handleCloseAsignarAgendamientoModal}
        onSuccess={handleSuccessAsignarAgendamiento}
      />

      {/* Modal de confirmación de eliminación */}
      {/* <ConfirmModal
        isOpen={!!reclutamientoToDelete}
        onClose={() => setReclutamientoToDelete(null)}
        onConfirm={confirmDeleteReclutamiento}
        title="Eliminar Reclutamiento"
        message={`¿Estás seguro de que deseas eliminar el reclutamiento de "${reclutamientoToDelete?.investigacion_nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="error"
        loading={loadingDelete}
      /> */}
    </Layout>
  );
} 