import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, Button, Card, Typography, Badge, Tooltip } from '../ui';
import { Sesion } from '../../types/sesiones';
import { useSesiones } from '../../hooks/useSesiones';
import SesionEvent from './SesionEvent';
import SesionEventDraggable from './SesionEventDraggable';
import SesionExpanded from './SesionExpanded';
import SesionModal from './SesionModal';
import { 
  PlusIcon, 
  CalendarIcon, 
  FilterIcon,
  RefreshIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '../icons';

interface SesionesCalendarProps {
  investigacionId?: string;
  onSesionClick?: (sesion: Sesion) => void;
  onSesionCreate?: (date?: Date) => void;
  onSesionEdit?: (sesion: Sesion) => void;
  onSesionDelete?: (sesion: Sesion) => void;
  className?: string;
}

const SesionesCalendar: React.FC<SesionesCalendarProps> = ({
  investigacionId,
  onSesionClick,
  onSesionCreate,
  onSesionEdit,
  onSesionDelete,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSesion, setExpandedSesion] = useState<Sesion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSesion, setModalSesion] = useState<Sesion | null>(null);
  const [modalDate, setModalDate] = useState<Date | undefined>(undefined);

  // Hook para manejar sesiones
  const {
    sesionesEventos,
    loading,
    error,
    stats,
    loadSesiones,
    createSesion,
    updateSesion,
    deleteSesion,
    refreshStats
  } = useSesiones({
    investigacionId,
    autoLoad: true
  });

  // Formatear fecha para mostrar
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'month' = 'short') => {
    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      month: { month: 'long', year: 'numeric' }
    };
    
    return date.toLocaleDateString('es-ES', options[format]);
  }, []);

  // Manejar click en evento
  const handleEventClick = useCallback((event: any) => {
    const sesion = sesionesEventos.find(s => s.id === event.id);
    if (sesion) {
      setExpandedSesion(sesion);
      onSesionClick?.(sesion);
    }
  }, [sesionesEventos, onSesionClick]);

  // Manejar click en fecha
  const handleDateClick = useCallback((date: Date) => {
    setModalDate(date);
    setShowModal(true);
    onSesionCreate?.(date);
  }, [onSesionCreate]);

  // Manejar agregar evento
  const handleAddEvent = useCallback(() => {
    setModalDate(undefined);
    setShowModal(true);
    onSesionCreate?.();
  }, [onSesionCreate]);

  // Manejar editar sesión
  const handleEditSesion = useCallback((sesion: Sesion) => {
    setModalSesion(sesion);
    setShowModal(true);
    onSesionEdit?.(sesion);
  }, [onSesionEdit]);

  // Manejar eliminar sesión
  const handleDeleteSesion = useCallback((sesion: Sesion) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la sesión "${sesion.titulo}"?`)) {
      deleteSesion(sesion.id);
      onSesionDelete?.(sesion);
    }
  }, [deleteSesion, onSesionDelete]);

  // Manejar mover sesión
  const handleMoveSesion = useCallback(async (eventId: string, newDate: Date, newTimeSlot?: number) => {
    try {
      const sesion = sesionesEventos.find(s => s.id === eventId);
      if (sesion) {
        const updatedData = {
          fecha_programada: newDate,
          ...(newTimeSlot && { duracion_minutos: newTimeSlot * 30 })
        };
        await updateSesion(eventId, updatedData);
      }
    } catch (error) {
      console.error('Error moviendo sesión:', error);
    }
  }, [sesionesEventos, updateSesion]);

  // Manejar redimensionar sesión
  const handleResizeSesion = useCallback(async (eventId: string, newDuration: number) => {
    try {
      await updateSesion(eventId, { duracion_minutos: newDuration });
    } catch (error) {
      console.error('Error redimensionando sesión:', error);
    }
  }, [updateSesion]);

  // Manejar guardar sesión
  const handleSaveSesion = useCallback(async (data: any) => {
    try {
      if (modalSesion) {
        await updateSesion(modalSesion.id, data);
      } else {
        await createSesion({ ...data, investigacion_id: investigacionId });
      }
      setShowModal(false);
      setModalSesion(null);
      setModalDate(undefined);
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  }, [modalSesion, updateSesion, createSesion, investigacionId]);

  // Manejar cambio de vista
  const handleViewChange = useCallback((newView: 'month' | 'week' | 'day' | 'agenda') => {
    setView(newView);
  }, []);

  // Manejar cambio de fecha
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Navegación
  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
  }, []);

  // Estadísticas para mostrar
  const statsDisplay = useMemo(() => {
    if (!stats) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card variant="elevated" padding="md">
          <div className="text-center">
            <Typography variant="h3" weight="bold" className="text-primary">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="secondary">
              Total Sesiones
            </Typography>
          </div>
        </Card>
        
        <Card variant="elevated" padding="md">
          <div className="text-center">
            <Typography variant="h3" weight="bold" className="text-warning">
              {stats.programadas}
            </Typography>
            <Typography variant="caption" color="secondary">
              Programadas
            </Typography>
          </div>
        </Card>
        
        <Card variant="elevated" padding="md">
          <div className="text-center">
            <Typography variant="h3" weight="bold" className="text-success">
              {stats.completadas}
            </Typography>
            <Typography variant="caption" color="secondary">
              Completadas
            </Typography>
          </div>
        </Card>
        
        <Card variant="elevated" padding="md">
          <div className="text-center">
            <Typography variant="h3" weight="bold" className="text-info">
              {stats.esta_semana}
            </Typography>
            <Typography variant="caption" color="secondary">
              Esta Semana
            </Typography>
          </div>
        </Card>
      </div>
    );
  }, [stats]);

  if (error) {
    return (
      <div className="text-center py-8">
        <Typography variant="h3" color="error" className="mb-2">
          Error al cargar sesiones
        </Typography>
        <Typography variant="body2" color="secondary" className="mb-4">
          {error}
        </Typography>
        <Button onClick={loadSesiones} variant="outline">
          <RefreshIcon className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      {statsDisplay}

      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <Typography variant="h2" weight="semibold">
              Calendario de Sesiones
            </Typography>
          </div>
          
          {/* Navegación */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              disabled={loading}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              disabled={loading}
            >
              Hoy
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={loading}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <Typography variant="h3" weight="medium">
            {formatDate(currentDate, view === 'month' ? 'month' : 'long')}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de vista */}
          <div className="flex rounded-lg border border-border">
            {(['month', 'week', 'day', 'agenda'] as const).map((viewOption) => (
              <button
                key={viewOption}
                className={`
                  px-3 py-1 text-sm font-medium transition-colors
                  ${view === viewOption 
                    ? 'bg-primary text-white' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                  ${viewOption === 'month' ? 'rounded-l-lg' : ''}
                  ${viewOption === 'agenda' ? 'rounded-r-lg' : ''}
                `}
                onClick={() => handleViewChange(viewOption)}
                disabled={loading}
              >
                {viewOption === 'month' && 'Mes'}
                {viewOption === 'week' && 'Semana'}
                {viewOption === 'day' && 'Día'}
                {viewOption === 'agenda' && 'Agenda'}
              </button>
            ))}
          </div>
          
          {/* Botón de filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          
          {/* Botón de refrescar */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadSesiones}
            disabled={loading}
          >
            <RefreshIcon className="w-4 h-4" />
          </Button>
          
          {/* Botón de nueva sesión */}
          <Button onClick={handleAddEvent} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Sesión
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card variant="elevated" padding="md">
          <Typography variant="h4" className="mb-4">
            Filtros
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Aquí se pueden agregar filtros específicos */}
            <div>
              <Typography variant="body2" color="secondary" className="mb-2">
                Estado
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['programada', 'en_curso', 'completada', 'cancelada'].map(estado => (
                  <Badge key={estado} variant="secondary" className="cursor-pointer">
                    {estado}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Typography variant="body2" color="secondary" className="mb-2">
                Tipo de Sesión
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['virtual', 'presencial', 'hibrida'].map(tipo => (
                  <Badge key={tipo} variant="secondary" className="cursor-pointer">
                    {tipo}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Typography variant="body2" color="secondary" className="mb-2">
                Investigación
              </Typography>
              <Typography variant="caption" color="secondary">
                {investigacionId ? 'Filtrado por investigación actual' : 'Todas las investigaciones'}
              </Typography>
            </div>
          </div>
        </Card>
      )}

      {/* Calendario */}
      <Calendar
        events={sesionesEventos}
        initialDate={currentDate}
        view={view}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onAddEvent={handleAddEvent}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        showAddButton={false}
        showNavigation={false}
        className="min-h-[600px]"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <Typography variant="body2" color="secondary">
              Cargando sesiones...
            </Typography>
          </div>
        </div>
      )}

      {/* Modal de sesión expandida */}
      {expandedSesion && (
        <SesionExpanded
          sesion={expandedSesion}
          onClose={() => setExpandedSesion(null)}
          onEdit={handleEditSesion}
          onDelete={handleDeleteSesion}
          onDuplicate={(sesion) => {
            // Implementar duplicación
            console.log('Duplicar sesión:', sesion.id);
          }}
          onShare={(sesion) => {
            // Implementar compartir
            console.log('Compartir sesión:', sesion.id);
          }}
          onExport={(sesion) => {
            // Implementar exportar
            console.log('Exportar sesión:', sesion.id);
          }}
        />
      )}

      {/* Modal de crear/editar sesión */}
      <SesionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setModalSesion(null);
          setModalDate(undefined);
        }}
        onSave={handleSaveSesion}
        sesion={modalSesion}
        investigacionId={investigacionId}
        fechaPredefinida={modalDate}
        loading={loading}
      />
    </div>
  );
};

export default SesionesCalendar;
