import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Tabs, Subtitle, Typography, Badge, Card, Chip, Button, ActionsMenu, ConfirmModal, EditarReclutamientoModal, AgregarParticipanteModal, FilterDrawer, FilterValuesSesiones } from '../../components/ui';
import { getChipVariant } from '../../utils/chipUtils';
import { CalendarIcon, PlusIcon, ClipboardListIcon, ClockIcon, UserIcon, MapPinIcon, TrashIcon, MoreVerticalIcon, FilterIcon, SearchIcon, BarChartIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon as ClockIconSolid } from '../../components/icons';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { Sesion } from '../../types/sesiones';
import { useToast } from '../../contexts/ToastContext';
import SesionesCalendar, { SesionesCalendarRef } from '../../components/sesiones/SesionesCalendar';

const SesionesPage: NextPage = () => {
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  const [activeTab, setActiveTab] = useState<'todas' | 'pendiente_agendamiento' | 'pendiente' | 'en_progreso' | 'finalizado' | 'cancelado'>('todas');
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales y acciones
  const [showModal, setShowModal] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState('reclutamiento');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState<Sesion | null>(null);
  const [deletingSesion, setDeletingSesion] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sesionToEdit, setSesionToEdit] = useState<Sesion | null>(null);
  const [showAgregarParticipanteModal, setShowAgregarParticipanteModal] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  
  // Ref para el calendario
  const calendarRef = useRef<SesionesCalendarRef>(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterValuesSesiones>({
    busqueda: '',
    tipo_participante: 'todos',
    investigacion: 'todos',
    responsable: 'todos',
    fecha_sesion_desde: '',
    fecha_sesion_hasta: '',
    duracion_sesion_min: '',
    duracion_sesion_max: ''
  });

  // Función para cargar usuarios
  const cargarUsuarios = async () => {
    try {
      console.log('🔄 Cargando usuarios...');
      
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Usuarios obtenidos:', data.usuarios?.length || 0);
      
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      } else {
        setUsuarios([]);
      }
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err);
      setUsuarios([]);
    }
  };

  // Función para cargar sesiones
    const cargarSesiones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando sesiones de reclutamiento...');
        
        const response = await fetch('/api/sesiones-reclutamiento');
        
        if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Respuesta completa:', data);
        console.log('📊 Número de sesiones:', data.sesiones?.length || 0);
        
        if (data.sesiones && Array.isArray(data.sesiones)) {
          console.log('✅ Estableciendo sesiones:', data.sesiones.length);
          setSesiones(data.sesiones);
        } else {
          console.log('⚠️ No hay sesiones en la respuesta');
          setSesiones([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error cargando sesiones:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las sesiones');
        setLoading(false);
      }
    };

  // Cargar sesiones y usuarios de la API
  useEffect(() => {
    cargarSesiones();
    cargarUsuarios();
  }, []);

  // Efecto para cerrar la búsqueda con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchExpanded]);


  // Filtrar sesiones por estado
  const getSesionesPorEstado = (estado: string) => {
    if (estado === 'todas') return sesiones;
    
    // Mapear estados de la UI a estados de la base de datos
    const estadoMap: { [key: string]: string[] } = {
      'pendiente_agendamiento': ['Pendiente de agendamiento'],
      'pendiente': ['Pendiente'],
      'en_progreso': ['En progreso'],
      'finalizado': ['Finalizado'],
      'cancelado': ['Cancelado']
    };
    
    const estadosReales = estadoMap[estado] || [estado];
    return sesiones.filter(sesion => 
      estadosReales.includes(sesion.estado_agendamiento || sesion.estado)
    );
  };

  // Función para filtrar sesiones con búsqueda y filtros
  const getSesionesFiltradas = () => {
    let sesionesFiltradas = sesiones;

    // Aplicar filtro de estado (tab activo)
    sesionesFiltradas = getSesionesPorEstado(activeTab);

    // Aplicar búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      sesionesFiltradas = sesionesFiltradas.filter(sesion => 
        sesion.participante?.nombre?.toLowerCase().includes(termino) ||
        sesion.investigacion_nombre?.toLowerCase().includes(termino) ||
        sesion.reclutador?.full_name?.toLowerCase().includes(termino) ||
        sesion.estado_agendamiento?.toLowerCase().includes(termino)
      );
    }

    // Aplicar filtros adicionales
    if (filters.tipo_participante && filters.tipo_participante !== 'todos') {
      sesionesFiltradas = sesionesFiltradas.filter(sesion => 
        sesion.tipo_participante === filters.tipo_participante
      );
    }

    if (filters.investigacion && filters.investigacion !== 'todos') {
      sesionesFiltradas = sesionesFiltradas.filter(sesion => 
        sesion.investigacion_id === filters.investigacion
      );
    }

    if (filters.responsable && filters.responsable !== 'todos') {
      sesionesFiltradas = sesionesFiltradas.filter(sesion => 
        sesion.reclutador_id === filters.responsable
      );
    }

    // Filtros de fecha
    if (filters.fecha_sesion_desde) {
      const fechaDesde = new Date(filters.fecha_sesion_desde);
      sesionesFiltradas = sesionesFiltradas.filter(sesion => {
        if (!sesion.fecha_programada) return false;
        const fechaSesion = new Date(sesion.fecha_programada);
        return fechaSesion >= fechaDesde;
      });
    }

    if (filters.fecha_sesion_hasta) {
      const fechaHasta = new Date(filters.fecha_sesion_hasta);
      sesionesFiltradas = sesionesFiltradas.filter(sesion => {
        if (!sesion.fecha_programada) return false;
        const fechaSesion = new Date(sesion.fecha_programada);
        return fechaSesion <= fechaHasta;
      });
    }

    // Filtros de duración
    if (filters.duracion_sesion_min) {
      const duracionMin = parseInt(filters.duracion_sesion_min);
      sesionesFiltradas = sesionesFiltradas.filter(sesion => 
        sesion.duracion_minutos >= duracionMin
      );
    }

    if (filters.duracion_sesion_max) {
      const duracionMax = parseInt(filters.duracion_sesion_max);
      sesionesFiltradas = sesionesFiltradas.filter(sesion => 
        sesion.duracion_minutos <= duracionMax
      );
    }

    return sesionesFiltradas;
  };

  // Contar sesiones por estado
  const contarSesiones = (estado: string) => {
    return getSesionesPorEstado(estado).length;
  };

  // Función para manejar "Ver más" - ir a vista de participante
  const handleVerMas = (sesion: Sesion) => {
    console.log('🚀 [CORRECCIÓN APLICADA] handleVerMas ejecutándose');
    console.log('🚀 [CORRECCIÓN APLICADA] Sesión recibida:', sesion);
    
    // Obtener el ID del participante desde los datos de la sesión
    const participanteId = sesion.participante?.id;
    
    console.log('🚀 [CORRECCIÓN APLICADA] ID del participante extraído:', participanteId);
    console.log('🚀 [CORRECCIÓN APLICADA] ID de reclutamiento (NO usar):', sesion.id);
    
    if (!participanteId) {
      console.error('❌ No se encontró ID del participante en la sesión:', sesion);
      toast.error('Error: No se pudo obtener la información del participante');
      return;
    }
    
    // Construir la URL con el ID del participante y parámetro de retorno
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    const participacionUrl = `/participacion/${participanteId}?returnUrl=${returnUrl}`;
    
    console.log('🚀 [CORRECCIÓN APLICADA] Navegando a participación:', participacionUrl);
    console.log('🚀 [CORRECCIÓN APLICADA] ID del participante:', participanteId);
    console.log('🚀 [CORRECCIÓN APLICADA] Datos de la sesión:', sesion);
    router.push(participacionUrl);
  };

  // Función para manejar edición de sesión
  const handleEditarSesion = async (sesion: Sesion) => {
    console.log('🔍 [DEBUG LISTA] Editando sesión desde lista:', JSON.stringify(sesion, null, 2));
    console.log('🔍 [DEBUG LISTA] Reclutador de la sesión:', sesion.reclutador);
    console.log('🔍 [DEBUG LISTA] Participante de la sesión:', sesion.participante);
    console.log('🔍 [DEBUG LISTA] Estado agendamiento:', sesion.estado_agendamiento);
    setSesionToEdit(sesion);
    setShowEditModal(true);
  };

  // Función para manejar eliminación de sesión
  const handleEliminarSesion = (sesion: Sesion) => {
    setSesionToDelete(sesion);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteSesion = async () => {
    if (!sesionToDelete) return;

    setDeletingSesion(true);
    try {
      console.log('🗑️ Eliminando sesión:', sesionToDelete.id);
      
      // Llamada real a la API para eliminar la sesión
      const response = await fetch(`/api/reclutamientos/${sesionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la sesión');
      }
      
      showSuccess('Sesión eliminada correctamente');
      setShowDeleteModal(false);
      setSesionToDelete(null);
      
      // Cerrar el modal lateral del calendario si está abierto
      if (calendarRef.current) {
        console.log('🔄 Cerrando modal lateral y refrescando calendario...');
        calendarRef.current.closeSideModal();
        // Refrescar el calendario para que se actualice inmediatamente
        calendarRef.current.refresh();
      }
      
      // Recargar las sesiones para reflejar los cambios
      cargarSesiones();
    } catch (error) {
      console.error('❌ Error eliminando sesión:', error);
      showError(error instanceof Error ? error.message : 'Error al eliminar la sesión');
    } finally {
      setDeletingSesion(false);
    }
  };

  // Función para manejar el cierre del modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSesionToEdit(null);
  };

  // Función para manejar el éxito de la edición
  const handleEditSuccess = () => {
    showSuccess('Reclutamiento actualizado exitosamente');
    setShowEditModal(false);
    setSesionToEdit(null);
    // Recargar las sesiones para reflejar los cambios
    cargarSesiones();
  };

  // Funciones para el modal de agregar participante
  const handleCloseAgregarParticipanteModal = () => {
    setShowAgregarParticipanteModal(false);
    setFechaSeleccionada(null);
  };

  const handleAgregarParticipanteSuccess = () => {
    showSuccess('Participante agregado exitosamente');
    setShowAgregarParticipanteModal(false);
    setFechaSeleccionada(null);
    // Recargar las sesiones en lugar de recargar toda la página
    cargarSesiones();
    // Actualizar el calendario también
    if (calendarRef.current) {
      calendarRef.current.refresh();
    }
  };

  // Funciones para manejar el buscador expandible
  const handleExpandSearch = () => {
    setIsSearchExpanded(true);
  };

  const handleCollapseSearch = () => {
    setIsSearchExpanded(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Funciones para manejar filtros
  const handleFiltersChange = (newFilters: FilterValuesSesiones) => {
    setFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.tipo_participante && filters.tipo_participante !== 'todos') count++;
    if (filters.investigacion && filters.investigacion !== 'todos') count++;
    if (filters.responsable && filters.responsable !== 'todos') count++;
    if (filters.fecha_sesion_desde) count++;
    if (filters.fecha_sesion_hasta) count++;
    if (filters.duracion_sesion_min) count++;
    if (filters.duracion_sesion_max) count++;
    return count;
  };

  // Formatear fecha
  const formatFecha = (fecha: Date | string | null) => {
    if (!fecha) return 'Sin fecha';
    
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fechaObj);
    } catch (error) {
      return 'Error en fecha';
    }
  };


  // Función para obtener el texto del estado
  const getEstadoText = (estado: string) => {
    return estado || 'Sin estado';
  };

  // Calcular estadísticas de sesiones
  const getSesionesStats = () => {
    const total = sesiones.length;
    const programadas = sesiones.filter(s => s.estado === 'programada' || s.estado_agendamiento === 'programada').length;
    const completadas = sesiones.filter(s => s.estado === 'completada' || s.estado_agendamiento === 'completada').length;
    const enCurso = sesiones.filter(s => s.estado === 'en_curso' || s.estado_agendamiento === 'en_curso').length;
    const canceladas = sesiones.filter(s => s.estado === 'cancelada' || s.estado_agendamiento === 'cancelada').length;
    
    // Calcular sesiones de esta semana
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);
    
    const estaSemana = sesiones.filter(s => {
      const fechaSesion = new Date(s.fecha_programada);
      return fechaSesion >= inicioSemana && fechaSesion <= finSemana;
    }).length;

    return {
      total,
      programadas,
      completadas,
      enCurso,
      canceladas,
      estaSemana
    };
  };

  // Componente de card simple con sistema de diseño
  const SesionCardSimple = ({ sesion }: { sesion: Sesion }) => {

    return (
      <Card className="" padding="lg">
        {/* Header con acciones en la parte superior derecha */}
        <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">
            {sesion.investigacion_nombre || 'Sin investigación'}
          </h3>
              <Chip 
                variant={getChipVariant(sesion.estado_agendamiento || 'Sin estado')}
                size="sm"
              >
                {sesion.estado_agendamiento || 'Sin estado'}
              </Chip>
            </div>
            
            <p className="text-muted-foreground text-sm">
            {sesion.titulo}
          </p>
        </div>

          {/* Acciones en la parte superior derecha */}
          <div className="flex gap-2 ml-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => console.log('Ingresar a sesión:', sesion.id)}
            >
              Ingresar
            </Button>
            
            <ActionsMenu
              actions={[
                {
                  label: 'Ver más',
                  onClick: () => handleVerMas(sesion),
                  icon: <UserIcon className="w-4 h-4" />
                },
                {
                  label: 'Editar',
                  onClick: () => handleEditarSesion(sesion),
                  icon: <CalendarIcon className="w-4 h-4" />
                },
                {
                  label: 'Eliminar',
                  onClick: () => handleEliminarSesion(sesion),
                  icon: <TrashIcon className="w-4 h-4" />,
                  className: 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-100'
                }
              ]}
            />
      </div>
      </div>

        {/* Contenido optimizado en grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
            <p className="text-xs text-muted-foreground mb-1">Fecha y Hora</p>
            <p className="text-sm font-medium text-foreground">{formatFecha(sesion.fecha_programada)}</p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground mb-1">Participante</p>
            <p className="text-sm font-medium text-foreground">
            {sesion.titulo?.split(' - ')[0] || 'Sin participante'}
          </p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground mb-1">Empresa</p>
            <p className="text-sm font-medium text-foreground">
            {sesion.ubicacion || 'Sin empresa'}
          </p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground mb-1">Duración</p>
            <p className="text-sm font-medium text-foreground">
            {sesion.duracion_minutos ? `${Math.floor(sesion.duracion_minutos / 60)}h ${sesion.duracion_minutos % 60}m` : 'N/A'}
          </p>
        </div>
      </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title="Sesiones"
          subtitle="Gestiona y programa sesiones de investigación y testing"
          color="blue"
          primaryAction={{
            label: "Nueva Sesión",
            onClick: () => {
              setFechaSeleccionada(null);
              setShowAgregarParticipanteModal(true);
            },
            variant: "primary",
            icon: <PlusIcon className="w-4 h-4" />,
            className: "bg-blue-600 hover:bg-blue-700 text-white"
          }}
        />

        {/* Estadísticas del Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Sesiones */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter 
                    value={getSesionesStats().total} 
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Sesiones
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <BarChartIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Sesiones Programadas */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter 
                    value={getSesionesStats().programadas} 
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Programadas
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <ClockIconSolid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Sesiones Completadas */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter 
                    value={getSesionesStats().completadas} 
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Completadas
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <CheckCircleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Esta Semana */}
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                  <AnimatedCounter 
                    value={getSesionesStats().estaSemana} 
                    duration={2000}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </Typography>
                <Typography variant="body2" color="secondary">
                  Esta Semana
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Navegación de vistas */}
        <Tabs
          tabs={[
            { 
              id: 'calendar', 
              label: 'Calendario', 
              icon: <CalendarIcon className="w-4 h-4" />,
              content: null
            },
            { 
              id: 'list', 
              label: 'Lista', 
              icon: <ClipboardListIcon className="w-4 h-4" />,
              content: null
            }
          ]}
          value={activeView}
          onValueChange={(value) => setActiveView(value as 'calendar' | 'list')}
          variant="underline"
          className="mb-6"
        />

        {/* Contenido según vista activa */}
        <div className="min-h-[600px]">
          {activeView === 'calendar' && (
            <SesionesCalendar
              ref={calendarRef}
              onSesionClick={(sesion) => {
                console.log('Sesión clickeada:', sesion);
                // Aquí puedes implementar la lógica para mostrar detalles de la sesión
              }}
              onSesionCreate={(date) => {
                console.log('Crear sesión en fecha:', date);
                setFechaSeleccionada(date);
                setShowAgregarParticipanteModal(true);
              }}
              onSesionEdit={(sesion) => {
                console.log('Editar sesión:', sesion);
                setSesionToEdit(sesion);
                setShowEditModal(true);
              }}
              onSesionDelete={(sesion) => {
                console.log('Eliminar sesión:', sesion);
                handleEliminarSesion(sesion);
              }}
              className="w-full"
            />
          )}

          {activeView === 'list' && (
            <div className="space-y-6">
              {/* Header con título, contador, buscador y filtros */}
              <div className="flex items-center justify-between mb-6">
                {/* Título y contador */}
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Lista de Sesiones
                  </h2>
                  <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    {getSesionesFiltradas().length} de {sesiones.length}
                  </span>
                </div>

                {/* Buscador y filtros */}
                <div className="flex items-center gap-2">
                  {/* Icono de búsqueda que se expande */}
                  <div className="relative">
                    {isSearchExpanded ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Buscar sesiones..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block w-[700px] pl-9 pr-9 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            autoFocus
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCollapseSearch}
                          className="text-gray-500 hover:text-gray-700 border-0"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={handleExpandSearch}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border-0"
                        iconOnly
                        icon={<SearchIcon className="w-5 h-5" />}
                      />
                    )}
                  </div>

                  {/* Botón de filtros con icono */}
                  <Button
                    variant={getActiveFiltersCount() > 0 ? "primary" : "ghost"}
                    onClick={() => setShowFilterDrawer(true)}
                    className="relative p-2 border-0"
                    iconOnly
                    icon={<FilterIcon />}
                  >
                    {getActiveFiltersCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Estado de carga */}
              {loading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse bg-gray-50 dark:bg-gray-800">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Estado de error */}
              {error && (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Error al cargar sesiones</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <div className="space-x-2">
                  <button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Reintentar
                  </button>
                    <button
                      className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-md font-medium transition-colors"
                      onClick={() => {
                        console.log('🔍 Debug - Estado actual:', { loading, error, sesiones: sesiones.length });
                        console.log('🔍 Debug - URL actual:', window.location.href);
                        console.log('🔍 Debug - Sesiones:', sesiones);
                      }}
                    >
                      Debug Info
                    </button>
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {!loading && !error && sesiones.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay sesiones</h3>
                  <p className="text-muted-foreground mb-4">Aún no se han programado sesiones de investigación</p>
                  <button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                    onClick={() => router.push('/sesiones/nueva')}
                  >
                    Crear primera sesión
                  </button>
                </div>
              )}

              {/* Tabs por estado */}
              {!loading && !error && sesiones.length > 0 && (
                <div>
                  <Tabs
                    items={[
                      { value: 'todas', label: 'Todas', count: contarSesiones('todas') },
                      { value: 'pendiente_agendamiento', label: 'Pendiente de Agendamiento', count: contarSesiones('pendiente_agendamiento') },
                      { value: 'pendiente', label: 'Pendiente', count: contarSesiones('pendiente') },
                      { value: 'en_progreso', label: 'En Progreso', count: contarSesiones('en_progreso') },
                      { value: 'finalizado', label: 'Finalizado', count: contarSesiones('finalizado') },
                      { value: 'cancelado', label: 'Cancelado', count: contarSesiones('cancelado') }
                    ]}
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as any)}
                    variant="underline"
                    className="mb-6"
                  />

                  {/* Cards de sesiones filtradas */}
                  <div className="space-y-4">
                    {getSesionesFiltradas().map((sesion) => (
                      <SesionCardSimple key={sesion.id} sesion={sesion} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal de confirmación para eliminar sesión */}
      {showDeleteModal && sesionToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSesionToDelete(null);
            // Cerrar el modal lateral del calendario si está abierto
            if (calendarRef.current) {
              calendarRef.current.closeSideModal();
            }
          }}
          onConfirm={confirmDeleteSesion}
          title="Eliminar Sesión"
          message={`¿Estás seguro de que quieres eliminar la sesión "${sesionToDelete.investigacion_nombre}"? Esta acción no se puede deshacer y eliminará permanentemente la sesión.`}
          type="error"
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deletingSesion}
        />
      )}

      {/* Modal de detalles de sesión */}
      {showModal && selectedSesion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Detalles de la Sesión
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSesion(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {selectedSesion.investigacion_nombre}
                </h3>
                <p className="text-muted-foreground">
                  {selectedSesion.titulo}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Fecha y Hora</p>
                  <p className="text-sm text-muted-foreground">{formatFecha(selectedSesion.fecha_programada)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Participante</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSesion.titulo?.split(' - ')[0] || 'Sin participante'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Estado</p>
                  <Chip 
                    variant={getChipVariant(selectedSesion.estado_agendamiento || selectedSesion.estado || 'Sin estado')}
                    size="sm"
                  >
                    {selectedSesion.estado_agendamiento || selectedSesion.estado || 'Sin estado'}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Duración</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSesion.duracion_minutos ? `${Math.floor(selectedSesion.duracion_minutos / 60)}h ${selectedSesion.duracion_minutos % 60}m` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de reclutamiento */}
      {sesionToEdit && (() => {
        const reclutamientoData = {
          id: sesionToEdit.id,
          investigacion_id: sesionToEdit.investigacion_id,
          participantes_id: sesionToEdit.participante?.id,
          fecha_sesion: sesionToEdit.fecha_programada,
          hora_sesion: sesionToEdit.hora_sesion,
          duracion_sesion: sesionToEdit.duracion_minutos,
          estado_agendamiento: sesionToEdit.estado_agendamiento,
          reclutador_id: sesionToEdit.reclutador?.id,
          // El modal busca responsable_pre_cargado, así que lo mapeamos correctamente
          responsable_pre_cargado: sesionToEdit.reclutador ? {
            id: sesionToEdit.reclutador.id,
            full_name: sesionToEdit.reclutador.full_name || sesionToEdit.reclutador.email || '',
            email: sesionToEdit.reclutador.email || '',
            avatar_url: sesionToEdit.reclutador.avatar_url || ''
          } : (sesionToEdit.reclutador_id ? {
            id: sesionToEdit.reclutador_id,
            full_name: 'Usuario',
            email: '',
            avatar_url: ''
          } : null),
          // Agregar información adicional para el modal
          participante: sesionToEdit.participante,
          tipo_participante: sesionToEdit.tipo_participante,
          investigacion_nombre: sesionToEdit.investigacion_nombre
        };
        
        console.log('🔍 [DEBUG MODAL] Datos que se envían al modal:', JSON.stringify(reclutamientoData, null, 2));
        console.log('🔍 [DEBUG MODAL] sesionToEdit original:', JSON.stringify(sesionToEdit, null, 2));
        
        return (
          <EditarReclutamientoModal
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            reclutamiento={reclutamientoData}
          />
        );
      })()}

      {/* Modal de Agregar Participante */}
      {showAgregarParticipanteModal && (
        <AgregarParticipanteModal
          isOpen={showAgregarParticipanteModal}
          onClose={handleCloseAgregarParticipanteModal}
          onSuccess={handleAgregarParticipanteSuccess}
          showInvestigacionSelector={true}
          reclutamiento={null}
          fechaPredefinida={fechaSeleccionada || undefined}
        />
      )}

      {/* FilterDrawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="sesiones"
        options={{
          investigaciones: sesiones.reduce((acc: any[], sesion) => {
            if (sesion.investigacion_id && sesion.investigacion_nombre && 
                !acc.find(i => i.value === sesion.investigacion_id)) {
              acc.push({
                value: sesion.investigacion_id,
                label: sesion.investigacion_nombre
              });
            }
            return acc;
          }, []),
          usuarios: usuarios
        }}
      />
    </Layout>
  );
};

export default SesionesPage;