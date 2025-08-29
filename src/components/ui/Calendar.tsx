import React, { useState, useCallback, useMemo } from 'react';
import { Typography, Button, Card, Badge, Tooltip } from './index';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  LocationIcon,
  MoreVerticalIcon
} from '../icons';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  attendees?: string[];
  location?: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

export interface CalendarProps {
  /** Eventos del calendario */
  events?: CalendarEvent[];
  /** Fecha inicial */
  initialDate?: Date;
  /** Vista del calendario */
  view?: 'month' | 'week' | 'day' | 'agenda';
  /** Callback cuando se hace click en un evento */
  onEventClick?: (event: CalendarEvent) => void;
  /** Callback cuando se hace click en una fecha */
  onDateClick?: (date: Date) => void;
  /** Callback cuando se hace click en agregar evento */
  onAddEvent?: (date?: Date) => void;
  /** Callback cuando se cambia la vista */
  onViewChange?: (view: CalendarProps['view']) => void;
  /** Callback cuando se cambia la fecha */
  onDateChange?: (date: Date) => void;
  /** Mostrar botón de agregar evento */
  showAddButton?: boolean;
  /** Mostrar navegación */
  showNavigation?: boolean;
  /** Mostrar mini calendario */
  showMiniCalendar?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  initialDate = new Date(),
  view = 'month',
  onEventClick,
  onDateClick,
  onAddEvent,
  onViewChange,
  onDateChange,
  showAddButton = true,
  showNavigation = true,
  showMiniCalendar = true,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generar días del mes
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, []);

  // Generar semanas del mes
  const getWeeksInMonth = useCallback((date: Date) => {
    const days = getDaysInMonth(date);
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  }, [getDaysInMonth]);

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const checkDate = new Date(date);
      
      checkDate.setHours(0, 0, 0, 0);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  }, [events]);

  // Obtener eventos para un rango de fechas
  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      
      return eventStart <= rangeEnd && eventEnd >= rangeStart;
    });
  }, [events]);

  // Navegación
  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, onDateChange]);

  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, onDateChange]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  // Formatear fecha
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'month' | 'day' = 'short') => {
    const options: Intl.DateTimeFormatOptions = {
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
      minute: '2-digit' 
    });
  }, []);

  // Verificar si es hoy
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Verificar si es el mes actual
  const isCurrentMonth = useCallback((date: Date) => {
    const current = new Date();
    return date.getMonth() === current.getMonth() && date.getFullYear() === current.getFullYear();
  }, []);

  // Obtener color del evento
  const getEventColor = useCallback((color?: CalendarEvent['color']) => {
    const colors = {
      primary: 'bg-primary text-white',
      secondary: 'bg-gray-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-primary text-primary-foreground'
    };
    
    return colors[color || 'primary'];
  }, []);

  // Renderizar vista de mes
  const renderMonthView = () => {
    const weeks = getWeeksInMonth(currentDate);
    
    return (
      <div className="space-y-1">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
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
                  className={`
                    min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-all duration-200
                    hover:bg-gray-50 hover:border-primary/30
                    ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                    ${isTodayDate ? 'ring-2 ring-primary ring-opacity-50' : ''}
                    ${isSelected ? 'bg-primary/10 border-primary' : ''}
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
                      className={isTodayDate ? 'text-primary' : ''}
                    >
                      {date.getDate()}
                    </Typography>
                    
                    {showAddButton && isCurrentMonthDay && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEvent?.(date);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-primary/10 transition-all"
                      >
                        <PlusIcon className="w-3 h-3 text-primary" />
                      </button>
                    )}
                  </div>
                  
                  {/* Eventos del día */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          p-1 rounded text-xs cursor-pointer truncate
                          ${getEventColor(event.color)}
                          hover:opacity-80 transition-opacity
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <Typography variant="caption" color="secondary" className="block">
                        +{dayEvents.length - 2} más
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
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    const weekEvents = getEventsForDateRange(days[0], days[6]);
    
    return (
      <div className="space-y-4">
        {/* Header de días */}
        <div className="grid grid-cols-8 gap-1">
          <div className="p-2"></div> {/* Espacio para horas */}
          {days.map((date, index) => (
            <div key={index} className="p-2 text-center border-b">
              <Typography variant="caption" weight="medium" color="secondary">
                {formatDate(date, 'short')}
              </Typography>
              <Typography 
                variant="h6" 
                weight={isToday(date) ? 'bold' : 'normal'}
                className={isToday(date) ? 'text-primary' : ''}
              >
                {date.getDate()}
              </Typography>
            </div>
          ))}
        </div>
        
        {/* Horarios */}
        <div className="grid grid-cols-8 gap-1">
          <div className="space-y-1">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-12 flex items-center justify-end pr-2 border-r">
                <Typography variant="caption" color="secondary">
                  {hour}:00
                </Typography>
              </div>
            ))}
          </div>
          
          {days.map((date, dayIndex) => (
            <div key={dayIndex} className="relative">
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="h-12 border-b border-gray-100"></div>
              ))}
              
              {/* Eventos del día */}
              {weekEvents
                .filter(event => {
                  const eventDate = new Date(event.start);
                  return eventDate.toDateString() === date.toDateString();
                })
                .map((event) => {
                  const startHour = new Date(event.start).getHours();
                  const startMinute = new Date(event.start).getMinutes();
                  const endHour = new Date(event.end).getHours();
                  const endMinute = new Date(event.end).getMinutes();
                  
                  const top = (startHour + startMinute / 60) * 48; // 48px por hora
                  const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 48;
                  
                  return (
                    <div
                      key={event.id}
                      className={`
                        absolute left-1 right-1 rounded p-1 cursor-pointer
                        ${getEventColor(event.color)}
                        hover:opacity-80 transition-opacity z-10
                      `}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 24)}px`
                      }}
                      onClick={() => onEventClick?.(event)}
                      title={event.title}
                    >
                      <Typography variant="caption" className="block truncate">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" className="opacity-80">
                        {formatTime(new Date(event.start))}
                      </Typography>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar vista de agenda
  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    return (
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <Card
            key={event.id}
            variant="outlined"
            className="p-3 cursor-pointer hover: transition-all duration-200"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${getEventColor(event.color).replace('bg-', 'bg-').replace(' text-white', '')}`} />
                  <Typography variant="body1" weight="medium">
                    {event.title}
                  </Typography>
                  {event.status && (
                    <Badge variant={event.status === 'confirmed' ? 'success' : event.status === 'pending' ? 'warning' : 'error'}>
                      {event.status}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      {formatDate(new Date(event.start), 'short')} {formatTime(new Date(event.start))}
                      {!event.allDay && ` - ${formatTime(new Date(event.end))}`}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center space-x-1">
                      <LocationIcon className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{event.attendees.length} participantes</span>
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <Typography variant="body2" color="secondary" className="mt-2">
                    {event.description}
                  </Typography>
                )}
              </div>
              
              <button className="p-1 rounded-full hover:bg-gray-100">
                <MoreVerticalIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </Card>
        ))}
        
        {sortedEvents.length === 0 && (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <Typography variant="body1" color="secondary">
              No hay eventos programados
            </Typography>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showNavigation && (
            <>
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Typography variant="h5" weight="bold">
            {formatDate(currentDate, 'month')}
          </Typography>
          
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Selector de vista */}
          <div className="flex rounded-lg border border-gray-200">
            {(['month', 'week', 'day', 'agenda'] as const).map((viewOption) => (
              <button
                key={viewOption}
                className={`
                  px-3 py-1 text-sm font-medium transition-colors
                  ${view === viewOption 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
          
          {showAddButton && (
            <Button onClick={() => onAddEvent?.()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo evento
            </Button>
          )}
        </div>
      </div>
      
      {/* Contenido del calendario */}
      <Card className="p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'agenda' && renderAgendaView()}
      </Card>
    </div>
  );
};

export default Calendar;
