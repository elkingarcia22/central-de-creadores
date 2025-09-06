import { useState, useCallback, useRef } from 'react';
import { SesionEvent } from '../types/sesiones';

interface DragState {
  isDragging: boolean;
  draggedEvent: SesionEvent | null;
  dragStartPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  dropTarget: { date: Date; timeSlot?: number } | null;
}

interface UseCalendarDragDropOptions {
  onEventMove?: (eventId: string, newDate: Date, newTimeSlot?: number) => Promise<void>;
  onEventResize?: (eventId: string, newDuration: number) => Promise<void>;
  timeSlotDuration?: number; // en minutos
  minEventDuration?: number; // en minutos
  maxEventDuration?: number; // en minutos
}

export const useCalendarDragDrop = (options: UseCalendarDragDropOptions = {}) => {
  const {
    onEventMove,
    onEventResize,
    timeSlotDuration = 30,
    minEventDuration = 15,
    maxEventDuration = 480
  } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEvent: null,
    dragStartPosition: null,
    currentPosition: null,
    dropTarget: null
  });

  const dragRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Iniciar drag
  const startDrag = useCallback((event: React.MouseEvent, sesion: SesionEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setDragState({
      isDragging: true,
      draggedEvent: sesion,
      dragStartPosition: { x: event.clientX, y: event.clientY },
      currentPosition: { x: event.clientX, y: event.clientY },
      dropTarget: null
    });

    // Agregar event listeners globales
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  // Mover durante drag
  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      currentPosition: { x: event.clientX, y: event.clientY }
    }));

    // Detectar drop target
    const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
    const dropTarget = getDropTarget(elementBelow, event.clientX, event.clientY);
    
    setDragState(prev => ({
      ...prev,
      dropTarget
    }));
  }, [dragState.isDragging]);

  // Finalizar drag
  const handleDragEnd = useCallback(async () => {
    if (!dragState.isDragging || !dragState.draggedEvent) return;

    const { draggedEvent, dropTarget } = dragState;

    // Si hay un drop target válido, mover el evento
    if (dropTarget && onEventMove) {
      try {
        await onEventMove(draggedEvent.id, dropTarget.date, dropTarget.timeSlot);
      } catch (error) {
        console.error('Error moviendo evento:', error);
      }
    }

    // Limpiar estado
    setDragState({
      isDragging: false,
      draggedEvent: null,
      dragStartPosition: null,
      currentPosition: null,
      dropTarget: null
    });

    // Remover event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [dragState, onEventMove]);

  // Detectar drop target
  const getDropTarget = (element: Element | null, x: number, y: number) => {
    if (!element) return null;

    // Buscar elemento con data-date
    const dateElement = element.closest('[data-date]');
    if (dateElement) {
      const dateStr = dateElement.getAttribute('data-date');
      if (dateStr) {
        const date = new Date(dateStr);
        
        // Buscar elemento con data-time-slot
        const timeSlotElement = element.closest('[data-time-slot]');
        if (timeSlotElement) {
          const timeSlot = parseInt(timeSlotElement.getAttribute('data-time-slot') || '0');
          return { date, timeSlot };
        }
        
        return { date };
      }
    }

    return null;
  };

  // Iniciar resize
  const startResize = useCallback((event: React.MouseEvent, sesion: SesionEvent, direction: 'start' | 'end') => {
    event.preventDefault();
    event.stopPropagation();

    const startY = event.clientY;
    const startDuration = sesion.duracion_minutos;

    const handleResizeMove = async (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = Math.round(deltaY / 2); // 2px = 1 minuto
      
      let newDuration = startDuration;
      if (direction === 'end') {
        newDuration = startDuration + deltaMinutes;
      } else {
        newDuration = Math.max(minEventDuration, startDuration - deltaMinutes);
      }

      // Limitar duración
      newDuration = Math.max(minEventDuration, Math.min(maxEventDuration, newDuration));

      // Actualizar visualmente (opcional)
      if (resizeRef.current) {
        resizeRef.current.style.height = `${newDuration * 2}px`;
      }
    };

    const handleResizeEnd = async () => {
      const deltaY = event.clientY - startY;
      const deltaMinutes = Math.round(deltaY / 2);
      
      let newDuration = startDuration;
      if (direction === 'end') {
        newDuration = startDuration + deltaMinutes;
      } else {
        newDuration = Math.max(minEventDuration, startDuration - deltaMinutes);
      }

      newDuration = Math.max(minEventDuration, Math.min(maxEventDuration, newDuration));

      if (newDuration !== startDuration && onEventResize) {
        try {
          await onEventResize(sesion.id, newDuration);
        } catch (error) {
          console.error('Error redimensionando evento:', error);
        }
      }

      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ns-resize';
  }, [minEventDuration, maxEventDuration, onEventResize]);

  // Obtener estilos de drag
  const getDragStyles = useCallback(() => {
    if (!dragState.isDragging || !dragState.currentPosition || !dragState.dragStartPosition) {
      return {};
    }

    const deltaX = dragState.currentPosition.x - dragState.dragStartPosition.x;
    const deltaY = dragState.currentPosition.y - dragState.dragStartPosition.y;

    return {
      transform: `translate(${deltaX}px, ${deltaY}px)`,
      opacity: 0.7,
      zIndex: 1000,
      pointerEvents: 'none'
    };
  }, [dragState]);

  // Verificar si un elemento es drop target válido
  const isValidDropTarget = useCallback((element: Element | null) => {
    if (!element) return false;
    
    const dateElement = element.closest('[data-date]');
    return dateElement !== null;
  }, []);

  // Obtener feedback visual para drop target
  const getDropTargetStyles = useCallback((element: Element | null) => {
    if (!dragState.isDragging || !isValidDropTarget(element)) {
      return {};
    }

    return {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '2px dashed #3b82f6',
      borderRadius: '4px'
    };
  }, [dragState.isDragging, isValidDropTarget]);

  return {
    dragState,
    dragRef,
    resizeRef,
    startDrag,
    startResize,
    getDragStyles,
    getDropTargetStyles,
    isValidDropTarget
  };
};
