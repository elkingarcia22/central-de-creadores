import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button, Typography, Badge, Tooltip } from './';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  MoreVerticalIcon,
  SearchIcon
} from '../icons';
import DraggableEvent from './DraggableEvent';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'teal' | 'pink' | 'gray';
  attendees?: string[];
  location?: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  status?: 'confirmed' | 'pending' | 'cancelled';
  // Propiedades específicas para sesiones
  titulo?: string;
  estado?: string;
  estado_agendamiento?: string;
  tipo_sesion?: string;
  duracion_minutos?: number;
  ubicacion?: string;
  moderador_nombre?: string;
  participantes?: any[];
}

export interface GoogleCalendarProps {
  events?: CalendarEvent[];
  initialDate?: Date;
  view?: 'month' | 'week' | 'day' | 'agenda';
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddEvent?: (date?: Date) => void;
  onViewChange?: (view: GoogleCalendarProps['view']) => void;
  onDateChange?: (date: Date) => void;
  onEventMove?: (eventId: string, newDate: Date, newTimeSlot?: number) => Promise<void>;
  onEventResize?: (eventId: string, newDuration: number) => Promise<void>;
  showAddButton?: boolean;
  showNavigation?: boolean;
  enableDragDrop?: boolean;
  className?: string;
}

const GoogleCalendar: React.FC<GoogleCalendarProps> = ({
  events = [],
  initialDate = new Date(),
  view = 'month',
  onEventClick,
  onDateClick,
  onAddEvent,
  onViewChange,
  onDateChange,
  onEventMove,
  onEventResize,
  showAddButton = true,
  showNavigation = true,
  enableDragDrop = false,
  className = ''
}) => {
  console.log('🔧 GoogleCalendar props:', { enableDragDrop, eventsCount: events.length });
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Estados para drag and drop - ahora manejados por DraggableEvent
  const calendarRef = useRef<HTMLDivElement>(null);

  // Colores de eventos sutiles basados en tipo de participante
  const eventColors = {
    primary: 'bg-blue-50 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-200', // Interno
    secondary: 'bg-purple-50 border-l-4 border-purple-500 text-purple-800 dark:bg-purple-900/20 dark:border-purple-400 dark:text-purple-200', // Friend & Family
    info: 'bg-cyan-50 border-l-4 border-cyan-500 text-cyan-800 dark:bg-cyan-900/20 dark:border-cyan-400 dark:text-cyan-200', // Externo
    success: 'bg-green-50 border-l-4 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200',
    warning: 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-200',
    error: 'bg-red-50 border-l-4 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200',
    // Colores legacy para compatibilidad
    blue: 'bg-blue-50 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-200',
    green: 'bg-green-50 border-l-4 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200',
    yellow: 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-200',
    red: 'bg-red-50 border-l-4 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200',
    purple: 'bg-purple-50 border-l-4 border-purple-500 text-purple-800 dark:bg-purple-900/20 dark:border-purple-400 dark:text-purple-200',
    orange: 'bg-orange-50 border-l-4 border-orange-500 text-orange-800 dark:bg-orange-900/20 dark:border-orange-400 dark:text-orange-200',
    teal: 'bg-teal-50 border-l-4 border-teal-500 text-teal-800 dark:bg-teal-900/20 dark:border-teal-400 dark:text-teal-200',
    pink: 'bg-pink-50 border-l-4 border-pink-500 text-pink-800 dark:bg-pink-900/20 dark:border-pink-400 dark:text-pink-200',
    gray: 'bg-gray-50 border-l-4 border-gray-500 text-gray-800 dark:bg-gray-900/20 dark:border-gray-400 dark:text-gray-200'
  };

  // Formatear fecha
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'month' | 'day' = 'short') => {
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      month: { month: 'long', year: 'numeric' },
      day: { day: 'numeric' }
    };
    
    return date.toLocaleDateString('es-ES', options[format]);
  }, []);

  // Formatear hora
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
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
    onDateChange?.(newDate);
  }, [currentDate, view, onDateChange]);

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
    onDateChange?.(newDate);
  }, [currentDate, view, onDateChange]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback((date: Date) => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
        // if (dayEvents.length > 0) {
        //   console.log('📅 Events for', date.toDateString(), ':', dayEvents.length);
        // }
    return dayEvents;
  }, [events]);

  // Obtener eventos para un rango de fechas
  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }, [events]);

  // Verificar si es hoy
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Verificar si es el mes actual
  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  }, [currentDate]);

  // Obtener semanas del mes
  const getWeeksInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weeks = [];
    const currentWeek = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      currentWeek.push(new Date(currentDate));
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek.length = 0;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weeks;
  }, []);

  // Obtener días de la semana
  const getWeekDays = useCallback((date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  }, []);

  // Drag and Drop handlers - ahora manejados por DraggableEvent

  // Funciones de drag and drop - ahora manejadas por DraggableEvent

  // Resize handlers - ahora manejados por DraggableEvent

  // Funciones de resize - ahora manejadas por DraggableEvent

  // Event listeners - ahora manejados por DraggableEvent

  // Renderizar vista de mes
  const renderMonthView = () => {
    const weeks = getWeeksInMonth(currentDate);
    // console.log('📅 Rendering month view with', events.length, 'events');
    
    return (
      <div className="space-y-1">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
            <div key={day} className="p-2 text-center">
              <Typography variant="caption" weight="medium" color="secondary">
                {day}
              </Typography>
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <div
                  key={dayIndex}
                  data-date={date.toISOString()}
                  className={`
                    min-h-[140px] p-2 border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200
                    hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600
                    ${isCurrentMonthDay ? 'bg-card text-card-foreground' : 'bg-gray-50 dark:bg-gray-800/50'}
                    ${isTodayDate ? 'ring-2 ring-gray-500 ring-opacity-50' : ''}
                    ${isSelected ? 'bg-gray-100 dark:bg-gray-700 border-gray-500' : ''}
                  `}
                  onClick={() => {
                    setSelectedDate(date);
                    onDateClick?.(date);
                  }}
                >
                  {/* Número del día */}
                  <div className="flex justify-between items-start mb-1">
                    <Typography 
                      variant="body2" 
                      weight={isTodayDate ? 'bold' : 'normal'}
                      color={isCurrentMonthDay ? 'primary' : 'secondary'}
                      className={isTodayDate ? 'text-gray-700 dark:text-gray-200' : ''}
                    >
                      {date.getDate()}
                    </Typography>
                    
                    {showAddButton && isCurrentMonthDay && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEvent?.(date);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        <PlusIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                  </div>
                  
                  {/* Eventos del día */}
                  <div className="space-y-1.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <DraggableEvent
                        key={event.id}
                        event={event}
                        enableDragDrop={enableDragDrop}
                        onEventClick={onEventClick}
                        onEventMove={onEventMove}
                        onEventResize={onEventResize}
                      />
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <Typography variant="caption" color="secondary" className="block text-center py-1">
                        +{dayEvents.length - 3} más
                      </Typography>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar vista de semana
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const startOfWeek = weekDays[0];
    const endOfWeek = weekDays[6];
    const weekEvents = getEventsForDateRange(startOfWeek, endOfWeek);
    
    return (
      <div className="space-y-1">
        {/* Días de la semana */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="p-2"></div>
          {weekDays.map((date, index) => {
            const isTodayDate = isToday(date);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            
            return (
              <div
                key={index}
                data-date={date.toISOString()}
                className={`
                  p-2 text-center border border-gray-200 dark:border-gray-700 cursor-pointer transition-all
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  ${isTodayDate ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'bg-card text-card-foreground'}
                  ${isSelected ? 'ring-2 ring-gray-500' : ''}
                `}
                onClick={() => {
                  setSelectedDate(date);
                  onDateClick?.(date);
                }}
              >
                <Typography variant="caption" weight="medium" color="secondary">
                  {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][index]}
                </Typography>
                <Typography 
                  variant="body1" 
                  weight={isTodayDate ? 'bold' : 'normal'}
                  className={isTodayDate ? 'text-gray-700 dark:text-gray-200' : ''}
                >
                  {date.getDate()}
                </Typography>
              </div>
            );
          })}
        </div>
        
        {/* Grid de la semana */}
        <div className="grid grid-cols-8 gap-1">
          {/* Columna de horas */}
          <div className="space-y-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-12 p-1 text-right">
                <Typography variant="caption" color="secondary">
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </Typography>
              </div>
            ))}
          </div>
          
          {/* Días de la semana */}
          {weekDays.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date);
            
            return (
              <div
                key={dayIndex}
                data-date={date.toISOString()}
                className="border border-gray-200 dark:border-gray-700 bg-card text-card-foreground"
              >
                {Array.from({ length: 24 }, (_, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="h-12 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setHours(hourIndex, 0, 0, 0);
                      onDateClick?.(newDate);
                    }}
                  >
                    {/* Eventos en esta hora */}
                    {dayEvents
                      .filter(event => {
                        const eventHour = new Date(event.start).getHours();
                        return eventHour === hourIndex;
                      })
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`
                            p-1 rounded text-xs cursor-pointer transition-all
                            ${eventColors[event.color || 'blue']}
                            hover:opacity-80 hover:shadow-sm
                            ${enableDragDrop ? 'cursor-grab active:cursor-grabbing' : ''}
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          title={event.title}
                        >
                          <div className="truncate">{event.title}</div>
                          <div className="text-xs opacity-90">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar vista de día
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-1">
        {/* Header del día */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 bg-card text-card-foreground rounded-lg">
          <Typography variant="body2" color="secondary">
            {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
          </Typography>
        </div>
        
        {/* Grid del día */}
        <div className="grid grid-cols-2 gap-1">
          {/* Columna de horas */}
          <div className="space-y-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-16 p-2 text-right border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <Typography variant="caption" color="secondary">
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </Typography>
              </div>
            ))}
          </div>
          
          {/* Columna de eventos */}
          <div className="space-y-1">
            {Array.from({ length: 24 }, (_, hourIndex) => (
              <div
                key={hourIndex}
                className="h-16 border border-gray-200 dark:border-gray-700 bg-card text-card-foreground hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setHours(hourIndex, 0, 0, 0);
                  onDateClick?.(newDate);
                }}
              >
                {/* Eventos en esta hora */}
                {dayEvents
                  .filter(event => {
                    const eventHour = new Date(event.start).getHours();
                    return eventHour === hourIndex;
                  })
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`
                        p-2 rounded text-sm cursor-pointer transition-all
                        ${eventColors[event.color || 'blue']}
                        hover:opacity-80 hover:shadow-sm
                        ${enableDragDrop ? 'cursor-grab active:cursor-grabbing' : ''}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                      {event.location && (
                        <div className="text-xs opacity-90 flex items-center gap-1">
                          <LocationIcon className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar vista de agenda
  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    return (
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-card text-card-foreground transition-shadow cursor-pointer"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-4 h-4 rounded-full mt-1 ${eventColors[event.color || 'blue']}`}></div>
              <div className="flex-1">
                <Typography variant="body1" weight="semibold">
                  {event.title}
                </Typography>
                <Typography variant="body2" color="secondary" className="mt-1">
                  {formatDate(new Date(event.start), 'long')} • {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                </Typography>
                {event.description && (
                  <Typography variant="body2" color="secondary" className="mt-2">
                    {event.description}
                  </Typography>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 mt-2">
                    <LocationIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <Typography variant="body2" color="secondary">
                      {event.location}
                    </Typography>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {event.estado_agendamiento && (
                  <Badge variant={
                    // Mapear estados de agendamiento a colores
                    event.estado_agendamiento === 'Finalizado' ? 'success' :
                    event.estado_agendamiento === 'Cancelado' ? 'danger' :
                    event.estado_agendamiento === 'Pendiente de agendamiento' ? 'warning' :
                    event.estado_agendamiento === 'En progreso' ? 'info' :
                    'secondary'
                  }>
                    {event.estado_agendamiento}
                  </Badge>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Aquí se puede agregar menú de acciones
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <MoreVerticalIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={calendarRef} className={`bg-card text-card-foreground border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm ${className}`}>
      {/* Header del calendario */}
      {showNavigation && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Navegación izquierda */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Hoy
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="p-2"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="p-2"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <Typography variant="h3" weight="medium" color="secondary">
              {formatDate(currentDate, view === 'month' ? 'month' : 'long')}
            </Typography>
          </div>

          {/* Navegación derecha */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <SearchIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Selector de vista */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
              {(['month', 'week', 'day', 'agenda'] as const).map((viewOption) => (
                <button
                  key={viewOption}
                  className={`
                    px-3 py-1 text-sm font-medium transition-colors
                    ${view === viewOption 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${viewOption === 'month' ? 'rounded-l-lg' : ''}
                    ${viewOption === 'agenda' ? 'rounded-r-lg' : ''}
                  `}
                  onClick={() => onViewChange?.(viewOption)}
                >
                  {viewOption === 'month' && 'Mes'}
                  {viewOption === 'week' && 'Semana'}
                  {viewOption === 'day' && 'Día'}
                  {viewOption === 'agenda' && 'Agenda'}
                </button>
              ))}
            </div>
            
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido del calendario */}
      <div className="p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'agenda' && renderAgendaView()}
      </div>

    </div>
  );
};

export default GoogleCalendar;
