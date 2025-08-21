import React, { useState, useCallback } from 'react';
import { Typography, Card, Badge, Button } from './index';
import { UserAvatar } from './UserAvatar';
import { 
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon
} from '../icons';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info' | 'default';
  status?: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  location?: string;
  metadata?: Record<string, any>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  comments?: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: Date;
  }>;
}

export interface TimelineProps {
  /** Eventos del timeline */
  events: TimelineEvent[];
  /** Orden de los eventos */
  order?: 'asc' | 'desc';
  /** Mostrar fechas relativas */
  showRelativeDates?: boolean;
  /** Mostrar avatares de usuarios */
  showAvatars?: boolean;
  /** Mostrar ubicaciones */
  showLocations?: boolean;
  /** Mostrar metadatos */
  showMetadata?: boolean;
  /** Mostrar adjuntos */
  showAttachments?: boolean;
  /** Mostrar comentarios */
  showComments?: boolean;
  /** Expandir todos los eventos por defecto */
  defaultExpanded?: boolean;
  /** Callback cuando se hace click en un evento */
  onEventClick?: (event: TimelineEvent) => void;
  /** Callback cuando se hace click en un usuario */
  onUserClick?: (user: TimelineEvent['user']) => void;
  /** Callback cuando se hace click en un adjunto */
  onAttachmentClick?: (attachment: TimelineEvent['attachments'][0]) => void;
  /** Callback cuando se hace click en un comentario */
  onCommentClick?: (comment: TimelineEvent['comments'][0]) => void;
  /** Clases CSS adicionales */
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({
  events,
  order = 'desc',
  showRelativeDates = true,
  showAvatars = true,
  showLocations = true,
  showMetadata = false,
  showAttachments = false,
  showComments = false,
  defaultExpanded = false,
  onEventClick,
  onUserClick,
  onAttachmentClick,
  onCommentClick,
  className = ''
}) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(
    defaultExpanded ? new Set(events.map(e => e.id)) : new Set()
  );

  // Ordenar eventos
  const sortedEvents = useCallback(() => {
    return [...events].sort((a, b) => {
      const comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return order === 'asc' ? comparison : -comparison;
    });
  }, [events, order]);

  // Obtener icono del tipo de evento
  const getEventIcon = useCallback((type: TimelineEvent['type'], status?: TimelineEvent['status']) => {
    if (status === 'completed') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (status === 'cancelled') return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
    
    const icons = {
      success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      error: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
      warning: <AlertCircleIcon className="w-5 h-5 text-yellow-500" />,
      info: <InfoIcon className="w-5 h-5 text-blue-500" />,
      default: <ClockIcon className="w-5 h-5 text-gray-500" />
    };
    
    return icons[type];
  }, []);

  // Obtener color del tipo de evento
  const getEventColor = useCallback((type: TimelineEvent['type']) => {
    const colors = {
      success: 'border-green-500 bg-green-50',
      error: 'border-red-500 bg-red-50',
      warning: 'border-yellow-500 bg-yellow-50',
      info: 'border-blue-500 bg-blue-50',
      default: 'border-gray-500 bg-gray-50'
    };
    
    return colors[type];
  }, []);

  // Formatear fecha
  const formatDate = useCallback((date: Date, relative = true) => {
    if (relative && showRelativeDates) {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return `Hace ${minutes} min`;
      if (hours < 24) return `Hace ${hours} h`;
      if (days < 7) return `Hace ${days} días`;
      if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
      return `Hace ${Math.floor(days / 30)} meses`;
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [showRelativeDates]);

  // Formatear fecha completa
  const formatFullDate = useCallback((date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Alternar expansión de evento
  const toggleEventExpansion = useCallback((eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  // Verificar si un evento está expandido
  const isEventExpanded = useCallback((eventId: string) => {
    return expandedEvents.has(eventId);
  }, [expandedEvents]);

  // Renderizar metadatos
  const renderMetadata = useCallback((metadata: Record<string, any>) => {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <Typography variant="caption" weight="medium" className="mb-2 block">
          Detalles adicionales
        </Typography>
        <div className="space-y-1">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">{key}:</span>
              <span className="text-gray-900">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);

  // Renderizar adjuntos
  const renderAttachments = useCallback((attachments: TimelineEvent['attachments']) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="mt-3">
        <Typography variant="caption" weight="medium" className="mb-2 block">
          Adjuntos ({attachments.length})
        </Typography>
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onAttachmentClick?.(attachment)}
            >
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Typography variant="caption" className="truncate">
                  {attachment.name}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [onAttachmentClick]);

  // Renderizar comentarios
  const renderComments = useCallback((comments: TimelineEvent['comments']) => {
    if (!comments || comments.length === 0) return null;

    return (
      <div className="mt-3">
        <Typography variant="caption" weight="medium" className="mb-2 block">
          Comentarios ({comments.length})
        </Typography>
        <div className="space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onCommentClick?.(comment)}
            >
              <div className="flex items-start justify-between mb-1">
                <Typography variant="caption" weight="medium">
                  {comment.user}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {formatDate(comment.timestamp)}
                </Typography>
              </div>
              <Typography variant="caption" color="secondary">
                {comment.text}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    );
  }, [onCommentClick, formatDate]);

  // Renderizar evento individual
  const renderEvent = useCallback((event: TimelineEvent, index: number) => {
    const isExpanded = isEventExpanded(event.id);
    const hasExpandableContent = showMetadata || showAttachments || showComments || event.description;

    return (
      <div key={event.id} className="relative">
        {/* Línea de tiempo */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {/* Punto de evento */}
        <div className="absolute left-4 top-4 w-4 h-4 rounded-full border-2 border-white bg-white shadow-sm">
          {getEventIcon(event.type, event.status)}
        </div>
        
        {/* Contenido del evento */}
        <div className="ml-12 mb-6">
          <Card
            variant="outlined"
            className={`
              p-4 cursor-pointer transition-all duration-200
              hover:shadow-md hover:border-primary/30
              ${getEventColor(event.type)}
            `}
            onClick={() => onEventClick?.(event)}
          >
            {/* Header del evento */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Typography variant="body1" weight="medium">
                    {event.title}
                  </Typography>
                                     {event.status && (
                     <Badge 
                       variant={event.status === 'completed' ? 'success' : 
                               event.status === 'in-progress' ? 'warning' : 
                               event.status === 'cancelled' ? 'danger' : 'default'}
                     >
                       {event.status}
                     </Badge>
                   )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span title={formatFullDate(event.timestamp)}>
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  
                  {event.user && showAvatars && (
                    <div 
                      className="flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserClick?.(event.user);
                      }}
                    >
                                             <UserAvatar
                         size="sm"
                         src={event.user.avatar}
                       />
                      <span>{event.user.name}</span>
                    </div>
                  )}
                  
                                     {event.location && showLocations && (
                     <div className="flex items-center space-x-1">
                       <span>📍</span>
                       <span>{event.location}</span>
                     </div>
                   )}
                </div>
              </div>
              
              {hasExpandableContent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEventExpansion(event.id);
                  }}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>
            
            {/* Descripción */}
            {event.description && (
              <Typography variant="body2" color="secondary" className="mt-2">
                {event.description}
              </Typography>
            )}
            
            {/* Contenido expandible */}
            {isExpanded && (
              <div className="mt-3 space-y-3">
                {showMetadata && event.metadata && renderMetadata(event.metadata)}
                {showAttachments && event.attachments && renderAttachments(event.attachments)}
                {showComments && event.comments && renderComments(event.comments)}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }, [
    isEventExpanded,
    getEventIcon,
    getEventColor,
    onEventClick,
    formatDate,
    formatFullDate,
    showAvatars,
    showLocations,
    onUserClick,
    toggleEventExpansion,
    showMetadata,
    showAttachments,
    showComments,
    renderMetadata,
    renderAttachments,
    renderComments
  ]);

  return (
    <div className={`relative ${className}`}>
      {sortedEvents().map((event, index) => renderEvent(event, index))}
      
      {events.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <Typography variant="body1" color="secondary">
            No hay eventos en el timeline
          </Typography>
        </div>
      )}
    </div>
  );
};

export default Timeline;
