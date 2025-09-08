import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button, Typography, Badge, Tooltip, Card, Chip, ActionsMenu } from './';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  MoreVerticalIcon,
  SearchIcon,
  UserIcon,
  TrashIcon,
  PlayIcon
} from '../icons';
import DraggableEvent from './DraggableEvent';
import { getChipVariant } from '../../utils/chipUtils';

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
  investigacion_nombre?: string;
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
  // Props para acciones específicas
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onEventViewMore?: (event: CalendarEvent) => void;
  onEventIniciar?: (event: CalendarEvent) => void;
  showAddButton?: boolean;
  showNavigation?: boolean;
  enableDragDrop?: boolean;
  className?: string;
  // Props para búsqueda
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  showSearch?: boolean;
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
  // Props para acciones específicas
  onEventEdit,
  onEventDelete,
  onEventViewMore,
  onEventIniciar,
  showAddButton = true,
  showNavigation = true,
  enableDragDrop = false,
  className = '',
  // Props de búsqueda
  searchTerm = '',
  onSearchChange,
  showSearch = true
}) => {
  // console.log('🔧 GoogleCalendar props:', { enableDragDrop, eventsCount: events.length });
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Estados para drag and drop - ahora manejados por DraggableEvent
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Estados para búsqueda
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // Estados para indicador de drop
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEventTitle, setDraggedEventTitle] = useState<string>('');
  
  // Funciones para manejar drag over
  const handleDragStart = (eventTitle?: string) => {
    setIsDragging(true);
    setDraggedEventTitle(eventTitle || '');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverDate(null);
    setDraggedEventTitle('');
  };

  const handleDragOver = useCallback((date: Date) => {
    if (isDragging) {
      // Solo actualizar si la fecha es diferente a la actual
      if (!dragOverDate || dragOverDate.toDateString() !== date.toDateString()) {
        console.log('🎯 [DRAG] handleDragOver:', { 
          date: date.toDateString(), 
          isDragging,
          currentDragOverDate: dragOverDate?.toDateString() 
        });
        setDragOverDate(date);
      }
    }
  }, [isDragging, dragOverDate]);

  // Funciones para manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange?.(value);
  };
  
  const handleExpandSearch = () => {
    setIsSearchExpanded(true);
  };
  
  const handleCollapseSearch = () => {
    setIsSearchExpanded(false);
    onSearchChange?.('');
  };
  
  // Efecto para cerrar la búsqueda con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
        onSearchChange?.('');
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchExpanded, onSearchChange]);

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
                    ${dragOverDate?.toDateString() === date.toDateString() ? 'bg-green-200 dark:bg-green-800/50 border-green-500 dark:border-green-400 ring-4 ring-green-400 dark:ring-green-500 shadow-lg' : ''}
                  `}
                  onClick={() => {
                    setSelectedDate(date);
                    onDateClick?.(date);
                  }}
                  onMouseEnter={() => {
                    if (isDragging) {
                      console.log('🎯 [DRAG] Mouse enter en celda:', date.toDateString());
                      handleDragOver(date);
                    }
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
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onEventResize={onEventResize}
                        dropTargetDate={dragOverDate}
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

  // Colores sólidos para círculos de participantes
  const participantColors = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500', 
    info: 'bg-cyan-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500'
  };

  // Función para filtrar eventos basado en el término de búsqueda
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) {
      return events;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return events.filter(event => {
      // Buscar en título
      if (event.title?.toLowerCase().includes(term)) return true;
      
      // Buscar en descripción
      if (event.description?.toLowerCase().includes(term)) return true;
      
      // Buscar en ubicación
      if (event.location?.toLowerCase().includes(term)) return true;
      
      // Buscar en nombre de investigación
      if (event.investigacion_nombre?.toLowerCase().includes(term)) return true;
      
      // Buscar en estado
      if (event.estado_agendamiento?.toLowerCase().includes(term)) return true;
      if (event.estado?.toLowerCase().includes(term)) return true;
      
      // Buscar en participantes
      if (event.participantes?.some(p => 
        p.nombre?.toLowerCase().includes(term) || 
        p.email?.toLowerCase().includes(term)
      )) return true;
      
      return false;
    });
  }, [events, searchTerm]);

  // Función para obtener el color del participante
  const getParticipantColor = (event: CalendarEvent) => {
    // Usar el color del evento si está disponible
    if (event.color) {
      return participantColors[event.color] || participantColors.blue;
    }
    // Por defecto usar azul
    return participantColors.blue;
  };

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback((date: Date) => {
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
        // if (dayEvents.length > 0) {
        //   console.log('📅 Events for', date.toDateString(), ':', dayEvents.length);
        // }
    return dayEvents;
  }, [filteredEvents]);

  // Obtener eventos para un rango de fechas
  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }, [filteredEvents]);

  // Renderizar vista de agenda
  const renderAgendaView = () => {
    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    return (
      <div className="space-y-4">
        {sortedEvents.map((event) => {
          // Debug: Log para ver qué datos tiene el evento
          console.log('🔍 Evento en agenda:', {
            id: event.id,
            title: event.title,
            estado_agendamiento: event.estado_agendamiento,
            estado: event.estado,
            color: event.color,
            investigacion_nombre: event.investigacion_nombre,
            // Log completo del evento
            eventoCompleto: event
          });
          
          // Debug: Log del chip que se va a mostrar
          const estadoParaChip = event.estado_agendamiento || event.estado || 'Sin estado';
          const varianteChip = getChipVariant(estadoParaChip);
          console.log('🎨 Chip info:', {
            estadoOriginal: event.estado_agendamiento,
            estadoAlternativo: event.estado,
            estadoFinal: estadoParaChip,
            varianteChip: varianteChip
          });
          
          return (
          <Card key={event.id} className="" padding="lg">
            {/* Header con acciones en la parte superior derecha */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {/* Círculo de color del participante */}
                  <div className={`w-4 h-4 rounded-full ${getParticipantColor(event)}`}></div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {event.investigacion_nombre || event.title || 'Sin investigación'}
                  </h3>
                  <Chip 
                    variant={getChipVariant(event.estado_agendamiento || 'Sin estado') as any}
                    size="sm"
                  >
                    {event.estado_agendamiento || 'Sin estado'}
                  </Chip>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  {event.title}
                </p>
              </div>

              {/* Acciones en la parte superior derecha */}
              <div className="flex gap-2 ml-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onEventIniciar?.(event)}
                  icon={<PlayIcon className="w-4 h-4" />}
                >
                  Iniciar
                </Button>
                
                <ActionsMenu
                  actions={[
                    {
                      label: 'Ver más',
                      onClick: () => onEventViewMore?.(event),
                      icon: <UserIcon className="w-4 h-4" />
                    },
                    {
                      label: 'Editar',
                      onClick: () => onEventEdit?.(event),
                      icon: <CalendarIcon className="w-4 h-4" />
                    },
                    {
                      label: 'Eliminar',
                      onClick: () => onEventDelete?.(event),
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
                <p className="text-sm font-medium text-foreground">
                  {formatDate(new Date(event.start), 'long')} • {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Participante</p>
                <p className="text-sm font-medium text-foreground">
                  {event.title?.split(' - ')[0] || 'Sin participante'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Empresa</p>
                <p className="text-sm font-medium text-foreground">
                  {event.location || 'Sin empresa'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duración</p>
                <p className="text-sm font-medium text-foreground">
                  {event.duracion_minutos ? `${Math.floor(event.duracion_minutos / 60)}h ${event.duracion_minutos % 60}m` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={calendarRef} className={`bg-card text-card-foreground border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm ${className}`}>
      {/* Indicador de drag and drop */}
      {isDragging && (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 border-b border-green-300 dark:border-green-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Typography variant="body2" className="text-green-800 dark:text-green-200">
              Arrastrando: <strong>{draggedEventTitle}</strong>
              {dragOverDate && (
                <span> → {dragOverDate.toLocaleDateString('es-ES', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}</span>
              )}
            </Typography>
          </div>
        </div>
      )}

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
            {/* Buscador expandible */}
            {showSearch && (
              <div className="relative">
                {isSearchExpanded ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-[300px] pl-9 pr-9 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        autoFocus
                      />
                      {searchTerm && (
                        <button
                          onClick={() => onSearchChange?.('')}
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
                    icon={<SearchIcon className="w-4 h-4" />}
                  />
                )}
              </div>
            )}
            
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
