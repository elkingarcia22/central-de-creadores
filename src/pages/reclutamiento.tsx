import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { usePermisos } from '../utils/permisosUtils';
import DiagnosticoPermisos from '../components/DiagnosticoPermisos';
import { Layout, Typography, Card, Button, DataTable, Input, Chip, ProgressBar, FilterDrawer, ActionsMenu } from '../components/ui';
import type { FilterValuesReclutamiento, FilterOptions } from '../components/ui';
import CrearReclutamientoModal from '../components/ui/CrearReclutamientoModal';
import AsignarAgendamientoModal from '../components/ui/AsignarAgendamientoModal';
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
  FilterIcon,
  BarChartIcon,
  ClipboardListIcon,
  FileTextIcon,
  CopyIcon,
  BellIcon,
  LoadingIcon
} from '../components/icons';
import { obtenerEstadosReclutamiento } from '../api/supabase-investigaciones';
import { getRiesgoBadgeVariant, getRiesgoText } from '../utils/riesgoUtils';
import { getEstadoInvestigacionVariant, getEstadoInvestigacionText, getEstadoReclutamientoVariant, getEstadoReclutamientoText } from '../utils/estadoUtils';

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
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showCrearReclutamientoModal, setShowCrearReclutamientoModal] = useState(false);
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
    { value: 'sin_fecha', label: 'Sin fecha' },
    { value: 'completado', label: 'Completado' },
  ];
  
  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 useEffect ejecutándose - cargando datos iniciales');
    cargarDatos();
  }, []);

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
      if (!tienePermiso('reclutamientos', 'ver')) {
        console.log('❌ Usuario no tiene permisos para ver reclutamientos');
        setInvestigaciones([]);
        return;
      }
      
      const rolActivoEsAdmin = rolSeleccionado?.toLowerCase() === 'administrador';
      console.log('🎭 Rol Activo en Reclutamiento:', rolSeleccionado, 'Es Admin:', rolActivoEsAdmin);
      const url = `/api/metricas-reclutamientos?usuarioId=${usuarioId}&esAdmin=${rolActivoEsAdmin}&rol=${rolSeleccionado}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Datos recibidos de la API:', data);
        console.log('📊 Investigaciones recibidas:', data.investigaciones?.length || 0);
        if (data.investigaciones && data.investigaciones.length > 0) {
          console.log('📊 Primera investigación:', data.investigaciones[0]);
        }
        setMetricas(data);
        setInvestigaciones(data.investigaciones);
      } else {
        throw new Error('Error al obtener métricas');
      }
    } catch (error) {
      console.error('Error obteniendo métricas de reclutamientos:', error);
      throw error;
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
      filtradas = filtradas.filter(inv => 
        inv.riesgo_reclutamiento && 
        filters.nivelRiesgo.includes(inv.riesgo_reclutamiento.toLowerCase())
      );
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
    return filtrarInvestigaciones(investigaciones, searchTerm, filters);
  }, [investigaciones, searchTerm, filters, filtrarInvestigaciones]);

  // Generar opciones de filtro dinámicamente - AHORA POR NOMBRE
  const filterOptionsDynamic = useMemo(() => {
    // Obtener valores únicos de los datos reales
    const responsables = [...new Set(investigaciones.map(inv => inv.responsable_nombre).filter(Boolean))];
    const implementadores = [...new Set(investigaciones.map(inv => inv.implementador_nombre).filter(Boolean))];
    const riesgos = [...new Set(investigaciones.map(inv => inv.riesgo_reclutamiento).filter(Boolean))];
    
    // Opciones de estado: usar nombres del catálogo para mostrar todas las opciones
    const estados = estadosReclutamiento.map(e => ({
      value: e.label, // Usar el nombre como value para que coincida con el filtrado
      label: e.label
    }));
    
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
      nivelRiesgo: riesgos.map(riesgo => ({ value: riesgo.toLowerCase(), label: riesgo })),
    };
    return options;
  }, [investigaciones, estadosReclutamiento]);

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
    setShowCrearReclutamientoModal(true);
  };

  const handleCloseCrearReclutamientoModal = () => {
    setShowCrearReclutamientoModal(false);
    setInvestigacionSeleccionada(null);
  };

  const handleSuccessCrearReclutamiento = () => {
    setShowCrearReclutamientoModal(false);
    setInvestigacionSeleccionada(null);
    cargarDatos();
    showSuccess('Reclutamiento creado exitosamente');
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

  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  const handleFiltersChange = (newFilters: FilterValuesReclutamiento) => {
    setFilters(newFilters);
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
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {row.investigacion_nombre || 'Sin nombre'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.libreto_titulo || 'Sin libreto'}
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
        const variant = getEstadoReclutamientoVariant(estado);
        const text = getEstadoReclutamientoText(estado);
        console.log('🎯 Tabla - Estado:', estado, 'Variant:', variant, 'Text:', text);
        return (
          <Chip 
            variant={variant}
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
      render: (value: any, row: InvestigacionReclutamiento) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {row.libreto_numero_participantes || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            participantes
          </div>
        </div>
      )
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
      render: (value: any, row: InvestigacionReclutamiento) => (
        <Chip 
          variant={getRiesgoBadgeVariant(row.riesgo_reclutamiento || 'bajo')}
          size="sm"
        >
          {getRiesgoText((row.riesgo_reclutamiento || 'bajo') as any)}
        </Chip>
      )
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
            label: 'Ver',
            icon: <EyeIcon className="w-4 h-4" />,
            onClick: () => router.push(`/reclutamiento/ver/${row.reclutamiento_id}`),
            className: 'text-popover-foreground hover:text-popover-foreground/80'
          },
          {
            label: 'Agregar Participante',
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: () => {
              setInvestigacionSeleccionada(row);
              setShowCrearReclutamientoModal(true);
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
    <>
      <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header modernizado */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <Typography variant="h2" color="title" weight="bold">
                  Reclutamiento
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Gestionar el reclutamiento de participantes para investigaciones por agendar
                </Typography>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleAsignarAgendamiento}
                >
                  Asignar Agendamiento
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCrearReclutamiento}
                >
                  Agregar Participante
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas del Dashboard */}
          {metricas && metricasRiesgo && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Reclutamientos */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {metricas.total}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Total Reclutamientos
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`}>
                    <ReclutamientoIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              {/* Pendientes */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {metricas.estados.pendientes}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Pendientes
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'}`}>
                    <BellIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              {/* Riesgo */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {metricasRiesgo.alto + metricasRiesgo.medio}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Riesgo Alto/Medio
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
                    <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>

              {/* Completados */}
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {metricas.estados.completados}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Completados
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'}`}>
                    <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Barra de búsqueda y filtro al estilo gestión de usuarios */}
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar reclutamientos, investigaciones, libretos, responsables..."
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

          {/* Tabla de reclutamientos */}
          <DataTable
            data={investigacionesFiltradas}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            selectable={false}
            onRowClick={handleRowClick}
            emptyMessage="No se encontraron reclutamientos"
            loadingMessage="Cargando reclutamientos..."
            rowKey="reclutamiento_id"
          />
        </div>
      </div>

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="reclutamiento"
        options={{
          estados: filterOptionsDynamic.estados,
          responsables: filterOptionsDynamic.responsables,
          implementadores: filterOptionsDynamic.implementadores,
          periodos: filterOptionsDynamic.periodos,
          tiposInvestigacion: filterOptionsDynamic.tiposInvestigacion,
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
          nivelRiesgo: filterOptionsDynamic.nivelRiesgo,
        }}
      />

      {/* Modal de creación de reclutamiento */}
      <CrearReclutamientoModal
        isOpen={showCrearReclutamientoModal}
        onClose={handleCloseCrearReclutamientoModal}
        onSuccess={handleSuccessCrearReclutamiento}
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
    <DiagnosticoPermisos />
    </>
  );
} 