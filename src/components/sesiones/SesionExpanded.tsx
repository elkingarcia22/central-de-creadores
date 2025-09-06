import React, { useState } from 'react';
import { SesionEvent } from '../../types/sesiones';
import { Card, Typography, Button, Chip, Badge, Avatar } from '../ui';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  LocationIcon, 
  VideoIcon, 
  BuildingIcon,
  UsersIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  ShareIcon,
  DownloadIcon,
  MoreVerticalIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon
} from '../icons';

interface SesionExpandedProps {
  sesion: SesionEvent;
  onClose: () => void;
  onEdit?: (sesion: SesionEvent) => void;
  onDelete?: (sesion: SesionEvent) => void;
  onDuplicate?: (sesion: SesionEvent) => void;
  onShare?: (sesion: SesionEvent) => void;
  onExport?: (sesion: SesionEvent) => void;
  className?: string;
}

const SesionExpanded: React.FC<SesionExpandedProps> = ({
  sesion,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);

  // Formatear fecha y hora
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours} horas`;
  };

  // Obtener icono según tipo de sesión
  const getTipoIcon = () => {
    switch (sesion.tipo_sesion) {
      case 'virtual':
        return <VideoIcon className="w-5 h-5" />;
      case 'presencial':
        return <BuildingIcon className="w-5 h-5" />;
      case 'hibrida':
        return <UsersIcon className="w-5 h-5" />;
      default:
        return <CalendarIcon className="w-5 h-5" />;
    }
  };

  // Obtener color del estado
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

  // Obtener color del tipo de sesión
  const getTipoColor = () => {
    switch (sesion.tipo_sesion) {
      case 'virtual': return 'blue';
      case 'presencial': return 'green';
      case 'hibrida': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${getTipoColor()}-100`}>
              {getTipoIcon()}
            </div>
            <div>
              <Typography variant="h3" weight="semibold">
                {sesion.titulo}
              </Typography>
              <div className="flex items-center gap-2 mt-1">
                <Chip variant={getEstadoColor()} size="sm">
                  {getEstadoText()}
                </Chip>
                <Badge variant="secondary" size="sm">
                  {sesion.tipo_sesion}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            <div className="py-2">
              {onEdit && (
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    onEdit(sesion);
                    setShowActions(false);
                  }}
                >
                  <EditIcon className="w-4 h-4" />
                  Editar
                </button>
              )}
              {onDuplicate && (
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    onDuplicate(sesion);
                    setShowActions(false);
                  }}
                >
                  <CopyIcon className="w-4 h-4" />
                  Duplicar
                </button>
              )}
              {onShare && (
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    onShare(sesion);
                    setShowActions(false);
                  }}
                >
                  <ShareIcon className="w-4 h-4" />
                  Compartir
                </button>
              )}
              {onExport && (
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    onExport(sesion);
                    setShowActions(false);
                  }}
                >
                  <DownloadIcon className="w-4 h-4" />
                  Exportar
                </button>
              )}
              {onDelete && (
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    onDelete(sesion);
                    setShowActions(false);
                  }}
                >
                  <TrashIcon className="w-4 h-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Información de tiempo */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-5 h-5 text-primary" />
                <Typography variant="h4" weight="semibold">
                  Información de Tiempo
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Fecha y hora
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(sesion.start)}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Duración
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(sesion.duracion_minutos)}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Hora de inicio
                  </Typography>
                  <Typography variant="body1">
                    {sesion.start.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" color="secondary" className="mb-1">
                    Hora de fin
                  </Typography>
                  <Typography variant="body1">
                    {sesion.end.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </div>
              </div>
            </Card>

            {/* Descripción */}
            {sesion.descripcion && (
              <Card variant="elevated" padding="md">
                <Typography variant="h4" weight="semibold" className="mb-3">
                  Descripción
                </Typography>
                <Typography variant="body1" className="whitespace-pre-wrap">
                  {sesion.descripcion}
                </Typography>
              </Card>
            )}

            {/* Ubicación */}
            {sesion.ubicacion && (
              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3 mb-3">
                  <LocationIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4" weight="semibold">
                    Ubicación
                  </Typography>
                </div>
                <Typography variant="body1">
                  {sesion.ubicacion}
                </Typography>
                {sesion.sala && (
                  <Typography variant="body2" color="secondary" className="mt-2">
                    Sala: {sesion.sala}
                  </Typography>
                )}
              </Card>
            )}

            {/* Moderador */}
            {sesion.moderador_nombre && (
              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3 mb-3">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4" weight="semibold">
                    Moderador
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar
                    size="md"
                    fallbackText={sesion.moderador_nombre}
                  />
                  <div>
                    <Typography variant="body1" weight="medium">
                      {sesion.moderador_nombre}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Moderador de la sesión
                    </Typography>
                  </div>
                </div>
              </Card>
            )}

            {/* Participantes */}
            {sesion.participantes && sesion.participantes.length > 0 && (
              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3 mb-4">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <Typography variant="h4" weight="semibold">
                    Participantes ({sesion.participantes.length})
                  </Typography>
                </div>
                
                <div className="space-y-3">
                  {sesion.participantes.map((participante) => (
                    <div key={participante.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          fallbackText={participante.participante_nombre || 'P'}
                        />
                        <div>
                          <Typography variant="body1" weight="medium">
                            {participante.participante_nombre || 'Participante'}
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            {participante.participante_email || 'Sin email'}
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Chip
                          variant={
                            participante.estado === 'confirmado' ? 'success' :
                            participante.estado === 'presente' ? 'success' :
                            participante.estado === 'ausente' ? 'error' :
                            participante.estado === 'cancelado' ? 'error' :
                            'secondary'
                          }
                          size="sm"
                        >
                          {participante.estado}
                        </Chip>
                        
                        {participante.estado === 'confirmado' && (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        )}
                        {participante.estado === 'ausente' && (
                          <XIcon className="w-4 h-4 text-red-600" />
                        )}
                        {participante.estado === 'invitado' && (
                          <AlertCircleIcon className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Configuración */}
            <Card variant="elevated" padding="md">
              <Typography variant="h4" weight="semibold" className="mb-4">
                Configuración
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${sesion.grabacion_permitida ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Typography variant="body2">
                    Grabación {sesion.grabacion_permitida ? 'permitida' : 'no permitida'}
                  </Typography>
                </div>
                
                {sesion.investigacion_nombre && (
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-1">
                      Investigación
                    </Typography>
                    <Typography variant="body1">
                      {sesion.investigacion_nombre}
                    </Typography>
                  </div>
                )}
              </div>
            </Card>

            {/* Notas */}
            {(sesion.notas_publicas || sesion.notas_privadas) && (
              <Card variant="elevated" padding="md">
                <Typography variant="h4" weight="semibold" className="mb-4">
                  Notas
                </Typography>
                
                {sesion.notas_publicas && (
                  <div className="mb-4">
                    <Typography variant="body2" color="secondary" className="mb-2">
                      Notas públicas
                    </Typography>
                    <Typography variant="body1" className="whitespace-pre-wrap">
                      {sesion.notas_publicas}
                    </Typography>
                  </div>
                )}
                
                {sesion.notas_privadas && (
                  <div>
                    <Typography variant="body2" color="secondary" className="mb-2">
                      Notas privadas
                    </Typography>
                    <Typography variant="body1" className="whitespace-pre-wrap">
                      {sesion.notas_privadas}
                    </Typography>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center gap-2">
            <Typography variant="body2" color="secondary">
              Creado: {new Date(sesion.created_at).toLocaleDateString('es-ES')}
            </Typography>
            {sesion.updated_at !== sesion.created_at && (
              <>
                <span>•</span>
                <Typography variant="body2" color="secondary">
                  Actualizado: {new Date(sesion.updated_at).toLocaleDateString('es-ES')}
                </Typography>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            {onEdit && (
              <Button size="sm" onClick={() => onEdit(sesion)}>
                <EditIcon className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SesionExpanded;
