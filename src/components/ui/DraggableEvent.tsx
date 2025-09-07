import React, { useRef, useCallback, useState } from 'react';

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
  className?: string;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({
  event,
  enableDragDrop,
  onEventClick,
  onEventMove,
  onEventResize,
  className = ''
}) => {
  const eventRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ y: 0, duration: 0 });

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
    setDragStart({ x: e.clientX, y: e.clientY });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      console.log('🔄 [DRAG] handleMouseMove', { isDragging, hasEventRef: !!eventRef.current });
      if (!isDragging || !eventRef.current) return;
      
      const deltaX = moveEvent.clientX - dragStart.x;
      const deltaY = moveEvent.clientY - dragStart.y;
      
      console.log('📐 [DRAG] Delta calculado', { deltaX, deltaY });
      
      // Mover el elemento visualmente
      eventRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      eventRef.current.style.opacity = '0.8';
      eventRef.current.style.zIndex = '1000';
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      console.log('🖱️ [DRAG] handleMouseUp', { isDragging, hasEventRef: !!eventRef.current });
      if (!isDragging || !eventRef.current) return;
      
      // Restaurar estilos
      eventRef.current.style.transform = '';
      eventRef.current.style.opacity = '';
      eventRef.current.style.zIndex = '';
      
      // Calcular nueva fecha
      const deltaY = upEvent.clientY - dragStart.y;
      const daysMoved = Math.round(deltaY / 100);
      
      console.log('📅 [DRAG] Calculando nueva fecha', { deltaY, daysMoved, originalDate: event.start });
      
      if (daysMoved !== 0 && onEventMove) {
        const newDate = new Date(event.start);
        newDate.setDate(newDate.getDate() + daysMoved);
        console.log('🚀 [DRAG] Llamando onEventMove', { eventId: event.id, newDate });
        onEventMove(event.id, newDate);
      } else {
        console.log('⚠️ [DRAG] No se movió o no hay onEventMove', { daysMoved, hasOnEventMove: !!onEventMove });
      }
      
      setIsDragging(false);
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
        ${enableDragDrop ? 'cursor-grab active:cursor-grabbing' : ''}
        ${className}
      `}
      onClick={(e) => {
        e.stopPropagation();
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
