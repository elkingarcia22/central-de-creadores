import React, { useState } from 'react';
import { SesionEvent as SesionEventType } from '../../types/sesiones';
import { Typography, Chip, Tooltip } from '../ui';
import { 
  ClockIcon, 
  UserIcon, 
  LocationIcon, 
  VideoIcon, 
  BuildingIcon,
  UsersIcon,
  MoreVerticalIcon
} from '../icons';

interface SesionEventProps {
  sesion: SesionEventType;
  onClick?: (sesion: SesionEventType) => void;
  onEdit?: (sesion: SesionEventType) => void;
  onDelete?: (sesion: SesionEventType) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

const SesionEvent: React.FC<SesionEventProps> = ({
  sesion,
  onClick,
  onEdit,
  onDelete,
  compact = false,
  showActions = true,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

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

  // Obtener texto del tipo de sesión/participante
  const getTipoSesionText = () => {
    // Si es sesión de apoyo
    if (sesion.tipo === 'apoyo') {
      return 'Sesión de Apoyo';
    }
    
    // Si tiene tipo de participante
    if (sesion.tipo_participante) {
      switch (sesion.tipo_participante) {
        case 'externo':
          return 'Externo';
        case 'interno':
          return 'Interno';
        case 'friend_family':
          return 'Friend & Family';
        default:
          return sesion.tipo_participante;
      }
    }
    
    // Si tiene participante con tipo
    if (sesion.participante?.tipo) {
      switch (sesion.participante.tipo) {
        case 'externo':
          return 'Externo';
        case 'interno':
          return 'Interno';
        case 'friend_family':
          return 'Friend & Family';
        default:
          return sesion.participante.tipo;
      }
    }
    
    return 'Reclutamiento';
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
          
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <ClockIcon className="w-3 h-3" />
            <span>Duración: {formatDuration(sesion.duracion_minutos)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <span>Tipo: {getTipoSesionText()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <Tooltip content={tooltipContent} position="top" delay={200}>
        <div
          className={`
            relative p-2 rounded-md cursor-pointer transition-all duration-200
            bg-${sesion.color}-100 border border-${sesion.color}-200
            hover:bg-${sesion.color}-200 hover:shadow-sm
            ${className}
          `}
          onClick={() => onClick?.(sesion)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
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
                <Typography 
                  variant="caption" 
                  className={`text-${sesion.color}-500 ml-1`}
                >
                  • {formatDuration(sesion.duracion_minutos)}
                </Typography>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Typography 
                  variant="caption" 
                  className={`text-${sesion.color}-500`}
                >
                  {getTipoSesionText()}
                </Typography>
              </div>
            </div>
            
            {showActions && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(sesion);
                }}
              >
                <MoreVerticalIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200
        bg-${sesion.color}-50 border-${sesion.color}-200
        hover:bg-${sesion.color}-100 hover:shadow-md
        ${className}
      `}
      onClick={() => onClick?.(sesion)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
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

export default SesionEvent;
