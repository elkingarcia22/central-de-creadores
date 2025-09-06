import React, { useState } from 'react';
import { SesionEvent as SesionEventType } from '../../types/sesiones';
import { Typography, Chip, Tooltip } from '../ui';
import { useCalendarDragDrop } from '../../hooks/useCalendarDragDrop';
import { 
  ClockIcon, 
  UserIcon, 
  LocationIcon, 
  VideoIcon, 
  BuildingIcon,
  UsersIcon,
  MoreVerticalIcon,
  GripVerticalIcon
} from '../icons';

interface SesionEventDraggableProps {
  sesion: SesionEventType;
  onClick?: (sesion: SesionEventType) => void;
  onEdit?: (sesion: SesionEventType) => void;
  onDelete?: (sesion: SesionEventType) => void;
  onMove?: (eventId: string, newDate: Date, newTimeSlot?: number) => Promise<void>;
  onResize?: (eventId: string, newDuration: number) => Promise<void>;
  compact?: boolean;
  showActions?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  className?: string;
}

const SesionEventDraggable: React.FC<SesionEventDraggableProps> = ({
  sesion,
  onClick,
  onEdit,
  onDelete,
  onMove,
  onResize,
  compact = false,
  showActions = true,
  draggable = true,
  resizable = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Hook de drag & drop
  const {
    dragState,
    dragRef,
    resizeRef,
    startDrag,
    startResize,
    getDragStyles,
    getDropTargetStyles
  } = useCalendarDragDrop({
    onEventMove: onMove,
    onEventResize: onResize,
    timeSlotDuration: 30,
    minEventDuration: 15,
    maxEventDuration: 480
  });

  // Formatear hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Obtener icono según tipo de sesión
  const getTipoIcon = () => {
    switch (sesion.tipo_sesion) {
      case 'virtual':
        return <VideoIcon className="w-3 h-3" />;
      case 'presencial':
        return <BuildingIcon className="w-3 h-3" />;
      case 'hibrida':
        return <UsersIcon className="w-3 h-3" />;
      default:
        return <ClockIcon className="w-3 h-3" />;
    }
  };

  // Obtener color del chip según estado
  const getEstadoColor = () => {
    switch (sesion.estado) {
      case 'programada': return 'primary';
      case 'en_curso': return 'warning';
      case 'completada': return 'success';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'info';
      default: return 'secondary';
    }
  };

  // Obtener texto del estado
  const getEstadoText = () => {
    switch (sesion.estado) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En Curso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'reprogramada': return 'Reprogramada';
      default: return sesion.estado;
    }
  };

  // Manejar click en el evento
  const handleClick = (e: React.MouseEvent) => {
    if (dragState.isDragging) return;
    onClick?.(sesion);
  };

  // Manejar inicio de drag
  const handleDragStart = (e: React.MouseEvent) => {
    if (!draggable) return;
    startDrag(e, sesion);
  };

  // Manejar inicio de resize
  const handleResizeStart = (e: React.MouseEvent, direction: 'start' | 'end') => {
    if (!resizable) return;
    e.stopPropagation();
    startResize(e, sesion, direction);
  };

  // Contenido del tooltip
  const tooltipContent = (
    <div className="p-3 max-w-xs">
      <div className="space-y-2">
        <div>
          <Typography variant="body2" weight="semibold" className="text-white">
            {sesion.titulo}
          </Typography>
          {sesion.descripcion && (
            <Typography variant="caption" className="text-gray-200 mt-1 block">
              {sesion.descripcion}
            </Typography>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <ClockIcon className="w-3 h-3" />
            <span>{formatTime(sesion.start)} - {formatTime(sesion.end)}</span>
          </div>
          
          {sesion.ubicacion && (
            <div className="flex items-center gap-2 text-xs text-gray-200">
              <LocationIcon className="w-3 h-3" />
              <span>{sesion.ubicacion}</span>
            </div>
          )}
          
          {sesion.moderador_nombre && (
            <div className="flex items-center gap-2 text-xs text-gray-200">
              <UserIcon className="w-3 h-3" />
              <span>Moderador: {sesion.moderador_nombre}</span>
            </div>
          )}
          
          {sesion.participantes && sesion.participantes.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-200">
              <UsersIcon className="w-3 h-3" />
              <span>{sesion.participantes.length} participante{sesion.participantes.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <Tooltip content={tooltipContent} position="top" delay={200}>
        <div
          ref={dragRef}
          className={`
            relative p-2 rounded-md cursor-pointer transition-all duration-200 group
            bg-${sesion.color}-100 border border-${sesion.color}-200
            hover:bg-${sesion.color}-200 hover:shadow-sm
            ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
            ${dragState.isDragging ? 'opacity-50' : ''}
            ${className}
          `}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={dragState.draggedEvent?.id === sesion.id ? getDragStyles() : {}}
        >
          {/* Handle de drag */}
          {draggable && isHovered && (
            <div
              className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={handleDragStart}
            >
              <GripVerticalIcon className="w-3 h-3 text-gray-400" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 ml-2">
              <Typography 
                variant="caption" 
                weight="medium" 
                className={`text-${sesion.color}-800 truncate`}
              >
                {sesion.titulo}
              </Typography>
              <div className="flex items-center gap-1 mt-0.5">
                {getTipoIcon()}
                <Typography 
                  variant="caption" 
                  className={`text-${sesion.color}-600`}
                >
                  {formatTime(sesion.start)}
                </Typography>
              </div>
            </div>
            
            {showActions && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVerticalIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Handles de resize */}
          {resizable && isHovered && (
            <>
              <div
                className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleResizeStart(e, 'start')}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleResizeStart(e, 'end')}
              />
            </>
          )}

          {/* Menu de acciones */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(sesion);
                  setShowMenu(false);
                }}
              >
                Editar
              </button>
              <button
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(sesion);
                  setShowMenu(false);
                }}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      ref={dragRef}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200 group
        bg-${sesion.color}-50 border-${sesion.color}-200
        hover:bg-${sesion.color}-100 hover:shadow-md
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${dragState.isDragging ? 'opacity-50' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={dragState.draggedEvent?.id === sesion.id ? getDragStyles() : {}}
    >
      {/* Handle de drag */}
      {draggable && isHovered && (
        <div
          className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={handleDragStart}
        >
          <GripVerticalIcon className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 ml-6">
          <Typography variant="body1" weight="semibold" className="mb-1">
            {sesion.titulo}
          </Typography>
          {sesion.descripcion && (
            <Typography variant="body2" color="secondary" className="line-clamp-2">
              {sesion.descripcion}
            </Typography>
          )}
        </div>
        
        <Chip variant={getEstadoColor()} size="sm">
          {getEstadoText()}
        </Chip>
      </div>

      {/* Información de tiempo y tipo */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4 text-muted-foreground" />
          <Typography variant="caption">
            {formatTime(sesion.start)} - {formatTime(sesion.end)}
          </Typography>
        </div>
        
        <div className="flex items-center gap-1">
          {getTipoIcon()}
          <Typography variant="caption" className="capitalize">
            {sesion.tipo_sesion}
          </Typography>
        </div>
        
        <Typography variant="caption" color="secondary">
          {formatDuration(sesion.duracion_minutos)}
        </Typography>
      </div>

      {/* Información adicional */}
      <div className="space-y-2">
        {sesion.ubicacion && (
          <div className="flex items-center gap-2">
            <LocationIcon className="w-4 h-4 text-muted-foreground" />
            <Typography variant="caption" className="truncate">
              {sesion.ubicacion}
            </Typography>
          </div>
        )}
        
        {sesion.moderador_nombre && (
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
            <Typography variant="caption">
              Moderador: {sesion.moderador_nombre}
            </Typography>
          </div>
        )}
        
        {sesion.participantes && sesion.participantes.length > 0 && (
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
            <Typography variant="caption">
              {sesion.participantes.length} participante{sesion.participantes.length !== 1 ? 's' : ''}
            </Typography>
          </div>
        )}
      </div>

      {/* Handles de resize */}
      {resizable && isHovered && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'start')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'end')}
          />
        </>
      )}

      {/* Acciones */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(sesion);
            }}
          >
            Editar
          </button>
          <button
            className="text-xs text-red-600 hover:text-red-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(sesion);
            }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default SesionEventDraggable;
