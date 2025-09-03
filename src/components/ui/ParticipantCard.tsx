import React from 'react';
import { Card, Typography, Button, Chip } from './index';
import { UserIcon, BuildingIcon, UsersIcon, CalendarIcon, ClockIcon, EditIcon, TrashIcon } from '../icons';
import { getTipoParticipante, getTipoParticipanteBadge } from '../../utils/tipoParticipanteUtils';
import { getChipVariant, getChipText } from '../../utils/chipUtils';
import { formatearFecha } from '../../utils/fechas';

interface ParticipantCardProps {
  participante: any;
  onEdit?: (participante: any) => void;
  onDelete?: (participante: any) => void;
  onConvertAgendamiento?: (participante: any) => void;
  onViewMore?: (participante: any) => void;
  className?: string;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participante,
  onEdit,
  onDelete,
  onConvertAgendamiento,
  onViewMore,
  className = ''
}) => {
  const tipoParticipante = getTipoParticipante(participante);
  const tipoBadge = getTipoParticipanteBadge(participante);
  const estadoAgendamiento = participante.estado_agendamiento?.nombre || participante.estado_agendamiento || 'Sin estado';
  
  // Solo mostrar card de agendamiento pendiente si realmente es un agendamiento pendiente
  // y no un participante normal con estado pendiente
  const esPendienteDeAgendamiento = participante.es_agendamiento_pendiente === true || 
                                   (participante.tipo === 'agendamiento_pendiente') ||
                                   (estadoAgendamiento === 'Pendiente de agendamiento' && participante.es_agendamiento_pendiente !== false);
  
  // Obtener el nombre final del participante
  const getNombreFinal = () => {
    if (participante.nombre) return participante.nombre;
    
    switch (tipoParticipante) {
      case 'interno':
        return 'Participante Interno';
      case 'friend_family':
        return 'Friend and Family';
      default:
        return 'Participante Externo';
    }
  };

  // Obtener el icono según el tipo de participante
  const getTipoIcon = () => {
    switch (tipoParticipante) {
      case 'interno':
        return <BuildingIcon className="w-4 h-4" />;
      case 'friend_family':
        return <UsersIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  // Card especial para "Pendiente de agendamiento"
  if (esPendienteDeAgendamiento) {
    return (
      <Card className={`transition-all duration-200 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Agendamiento Pendiente
              </h3>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewMore ? onViewMore(participante) : console.log('Ver más participante:', participante)}
              className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Ver más
            </Button>
            
            {onConvertAgendamiento && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConvertAgendamiento(participante)}
                className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Agregar Participante
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(participante)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <EditIcon className="w-4 h-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(participante)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <Typography variant="caption" color="secondary">Estado</Typography>
            <div className="mt-0.5">
              <Chip 
                variant={getChipVariant(estadoAgendamiento) as any}
                size="sm"
                className="whitespace-nowrap"
              >
                {getChipText(estadoAgendamiento)}
              </Chip>
            </div>
          </div>

          <div>
            <Typography variant="caption" color="secondary">Responsable</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {participante.responsable_agendamiento?.nombre || 
               participante.responsable_agendamiento?.full_name || 
               participante.reclutador_nombre || 
               'Sin responsable'}
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  // Card normal para otros estados
  return (
    <Card className={`transition-all duration-200 ${className}`}>
              {/* Header */}
        <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              {getTipoIcon()}
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {getNombreFinal()}
              </h3>
            </div>
            <Chip 
              variant={tipoBadge.variant as any}
              size="sm"
            >
              {tipoBadge.text}
            </Chip>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewMore ? onViewMore(participante) : console.log('Ver más participante:', participante)}
            className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Ver más
          </Button>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(participante)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <EditIcon className="w-4 h-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(participante)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Información básica */}
        <div>
          <Typography variant="caption" color="secondary">Email</Typography>
          <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
            {participante.email || 'Sin email'}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" color="secondary">Estado</Typography>
          <div className="mt-0.5">
            <Chip 
              variant={getChipVariant(estadoAgendamiento) as any}
              size="sm"
              className="whitespace-nowrap"
            >
              {getChipText(estadoAgendamiento)}
            </Chip>
          </div>
        </div>

        {/* Información de empresa para participantes internos */}
        {tipoParticipante === 'interno' && participante.empresa_nombre && (
          <div>
            <Typography variant="caption" color="secondary">Empresa</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {participante.empresa_nombre}
            </Typography>
          </div>
        )}

        {/* Rol en empresa */}
        {participante.rol_empresa && (
          <div>
            <Typography variant="caption" color="secondary">Rol</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {participante.rol_empresa}
            </Typography>
          </div>
        )}

        {/* Fecha de sesión */}
        {participante.fecha_sesion && (
          <div>
            <Typography variant="caption" color="secondary">Fecha Sesión</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {formatearFecha(participante.fecha_sesion)}
            </Typography>
          </div>
        )}

        {/* Hora de sesión */}
        {participante.hora_sesion && (
          <div>
            <Typography variant="caption" color="secondary">Hora</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {participante.hora_sesion}
            </Typography>
          </div>
        )}

        {/* Responsable del agendamiento */}
        {participante.responsable_agendamiento && (
          <div>
            <Typography variant="caption" color="secondary">Responsable</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {participante.responsable_agendamiento.nombre || 
               participante.responsable_agendamiento.full_name || 
               'Sin responsable'}
            </Typography>
          </div>
        )}

        {/* Duración de sesión */}
        {participante.duracion_sesion && (
          <div>
            <Typography variant="caption" color="secondary">Duración</Typography>
            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {participante.duracion_sesion} min
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ParticipantCard;
