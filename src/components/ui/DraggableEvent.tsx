import React, { useRef, useCallback, useState, useEffect } from 'react';

interface DraggableEventProps {
  event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    color?: string;
    duracion_minutos?: number;
  };
  enableDragDrop: boolean;
  onEventClick?: (event: any) => void;
  onEventMove?: (eventId: string, newDate: Date) => void;
  onEventResize?: (eventId: string, newDuration: number) => void;
  onDragStart?: (eventTitle?: string) => void;
  onDragEnd?: () => void;
  dropTargetDate?: Date | null;
  className?: string;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({
  event,
  enableDragDrop,
  onEventClick,
  onEventMove,
  onEventResize,
  onDragStart,
  onDragEnd,
  dropTargetDate,
  className = ''
}) => {
  const eventRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ y: 0, duration: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Reset hasDragged después de un tiempo para permitir clicks futuros
  useEffect(() => {
    if (hasDragged) {
      const timer = setTimeout(() => {
        setHasDragged(false);
        // console.log('🔄 [DRAG] Reseteando hasDragged'); // Comentado para reducir logs
      }, 300); // Aumentar tiempo para evitar clicks accidentales
      return () => clearTimeout(timer);
    }
  }, [hasDragged]);

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
    gray: 'bg-gray-50 border-l-4 border-gray-500 text-gray-800 dark:bg-gray-900/20 dark:border-gray-400 dark:text-gray-200'
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('🖱️ [DRAG] handleMouseDown ejecutándose', { enableDragDrop, eventId: event.id });
    if (!enableDragDrop) {
      console.log('❌ [DRAG] Drag and drop deshabilitado');
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 [DRAG] Iniciando drag', { x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setHasDragged(false); // Reset hasDragged al inicio
    setDragStart({ x: e.clientX, y: e.clientY });
    onDragStart?.(event.title); // Notificar al calendario con el título
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging || !eventRef.current) return;
      
      const deltaX = moveEvent.clientX - dragStart.x;
      const deltaY = moveEvent.clientY - dragStart.y;
      
      // Si hay movimiento significativo, marcar como dragged (solo una vez)
      if ((Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) && !hasDragged) {
        setHasDragged(true);
        // console.log('🎯 [DRAG] Marcando como dragged'); // Comentado para reducir logs
      }
      
      // Mover el elemento visualmente
      eventRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      eventRef.current.style.opacity = '0.9';
      eventRef.current.style.zIndex = '1000';
      eventRef.current.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      eventRef.current.style.border = '2px solid #10b981';
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      console.log('🖱️ [DRAG] handleMouseUp', { isDragging, hasEventRef: !!eventRef.current, dropTargetDate: dropTargetDate?.toDateString() });
      if (!isDragging || !eventRef.current) return;
      
      // Prevenir múltiples ejecuciones
      if (hasDragged === false) {
        console.log('⏭️ [DRAG] No se movió lo suficiente, ignorando');
        setIsDragging(false);
        onDragEnd?.();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        return;
      }
      
      // Restaurar estilos inmediatamente
      eventRef.current.style.transform = '';
      eventRef.current.style.opacity = '';
      eventRef.current.style.zIndex = '';
      eventRef.current.style.boxShadow = '';
      eventRef.current.style.border = '';
      
      // Asegurar que los estilos se restauren después de un breve delay
      setTimeout(() => {
        if (eventRef.current) {
          eventRef.current.style.transform = '';
          eventRef.current.style.opacity = '';
          eventRef.current.style.zIndex = '';
          eventRef.current.style.boxShadow = '';
          eventRef.current.style.border = '';
          console.log('🔄 [DRAG] Estilos restaurados después del delay');
        }
      }, 100);
      
      // Determinar la nueva fecha
      let newDate: Date;
      
      if (dropTargetDate) {
        // Usar la fecha exacta donde se muestra el indicador verde
        newDate = new Date(dropTargetDate);
        // Mantener la hora original del evento
        newDate.setHours(event.start.getHours(), event.start.getMinutes(), event.start.getSeconds());
        console.log('🎯 [DRAG] Usando fecha de destino:', { 
          dropTargetDate: dropTargetDate.toDateString(),
          newDate: newDate.toDateString(),
          originalTime: event.start.toTimeString()
        });
      } else {
        // Si no hay dropTargetDate, calcular basado en la posición del mouse
        const deltaY = upEvent.clientY - dragStart.y;
        const daysMoved = Math.round(deltaY / 60); // Más grande para ser menos sensible
        newDate = new Date(event.start);
        newDate.setDate(newDate.getDate() + daysMoved);
        console.log('📅 [DRAG] Calculando fecha con deltaY (sin dropTargetDate):', { 
          deltaY, 
          daysMoved, 
          originalDate: event.start.toDateString(),
          newDate: newDate.toDateString()
        });
      }
      
      // Solo mover si la fecha es diferente a la original
      const isDateChanged = newDate.toDateString() !== event.start.toDateString();
      console.log('🔍 [DRAG] Verificando si la fecha cambió:', { 
        isDateChanged, 
        originalDate: event.start.toDateString(), 
        newDate: newDate.toDateString() 
      });
      
      if (isDateChanged && onEventMove) {
        console.log('🚀 [DRAG] Llamando onEventMove', { eventId: event.id, newDate });
        onEventMove(event.id, newDate);
      } else if (!isDateChanged) {
        console.log('⏭️ [DRAG] No se mueve porque la fecha no cambió');
      } else {
        console.log('⚠️ [DRAG] No hay onEventMove disponible');
      }
      
      // Forzar re-render del componente
      setTimeout(() => {
        if (eventRef.current) {
          eventRef.current.style.display = 'none';
          eventRef.current.offsetHeight; // Trigger reflow
          eventRef.current.style.display = '';
          console.log('🔄 [DRAG] Forzando re-render del evento');
        }
      }, 50);
      
      setIsDragging(false);
      onDragEnd?.(); // Notificar al calendario
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [enableDragDrop, isDragging, dragStart, event.id, event.start, onEventMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: 'start' | 'end') => {
    if (!enableDragDrop) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({ y: e.clientY, duration: event.duracion_minutos || 60 });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing || !eventRef.current) return;
      
      const deltaY = moveEvent.clientY - resizeStart.y;
      const deltaMinutes = Math.round(deltaY / 2);
      
      let newDuration = resizeStart.duration;
      if (direction === 'end') {
        newDuration = resizeStart.duration + deltaMinutes;
      } else {
        newDuration = Math.max(15, resizeStart.duration - deltaMinutes);
      }
      
      newDuration = Math.max(15, Math.min(480, newDuration));
      
      // Actualizar altura visualmente
      const newHeight = Math.max(20, newDuration / 2);
      eventRef.current.style.height = `${newHeight}px`;
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      if (!isResizing || !eventRef.current) return;
      
      const deltaY = upEvent.clientY - resizeStart.y;
      const deltaMinutes = Math.round(deltaY / 2);
      
      let newDuration = resizeStart.duration;
      if (direction === 'end') {
        newDuration = resizeStart.duration + deltaMinutes;
      } else {
        newDuration = Math.max(15, resizeStart.duration - deltaMinutes);
      }
      
      newDuration = Math.max(15, Math.min(480, newDuration));
      
      if (newDuration !== resizeStart.duration && onEventResize) {
        onEventResize(event.id, newDuration);
      }
      
      // Restaurar altura
      eventRef.current.style.height = '';
      
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [enableDragDrop, isResizing, resizeStart, event.id, event.duracion_minutos, onEventResize]);

  return (
    <div
      ref={eventRef}
      className={`
        relative p-2 rounded text-xs cursor-pointer transition-all
        ${eventColors[event.color as keyof typeof eventColors] || eventColors.blue}
        hover:opacity-80 hover:shadow-sm
        ${enableDragDrop ? 'cursor-grab active:cursor-grabbing hover:scale-105' : ''}
        ${className}
      `}
      onClick={(e) => {
        e.stopPropagation();
        console.log('🖱️ [CLICK] onClick ejecutándose', { hasDragged });
        if (hasDragged) {
          console.log('❌ [CLICK] Ignorando click porque se hizo drag and drop');
          return;
        }
        console.log('✅ [CLICK] Ejecutando onEventClick');
        onEventClick?.(event);
      }}
      onMouseDown={handleMouseDown}
      title={event.title}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-current opacity-60 flex-shrink-0"></div>
        <span className="truncate font-medium">{event.title}</span>
      </div>
      <div className="text-xs opacity-75 mt-1">
        {formatTime(event.start)}
      </div>
      
      {/* Resize handles */}
      {enableDragDrop && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white hover:bg-opacity-70 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'start')}
            title="Redimensionar desde el inicio"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white hover:bg-opacity-70 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'end')}
            title="Redimensionar desde el final"
          />
        </>
      )}
    </div>
  );
};

export default DraggableEvent;
