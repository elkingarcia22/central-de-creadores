import React, { useState } from 'react';
import { SesionEvent } from '../../types/sesiones';
import { Card, Typography, Button, Chip, Badge, Avatar, SideModal, PageHeader, Tabs, InfoContainer, InfoItem, ActionsMenu } from '../ui';
import { getChipVariant } from '../../utils/chipUtils';
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
  CheckCircleIcon,
  XIcon,
  AlertCircleIcon,
  EyeIcon,
  MessageIcon,
  FileTextIcon,
  PlayIcon
} from '../icons';

interface SesionSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionEvent | null;
  onIniciar?: (sesion: SesionEvent) => void;
  onEdit?: (sesion: SesionEvent) => void;
  onDelete?: (sesion: SesionEvent) => void;
  onDuplicate?: (sesion: SesionEvent) => void;
  onShare?: (sesion: SesionEvent) => void;
  onExport?: (sesion: SesionEvent) => void;
  onViewMore?: (sesion: SesionEvent) => void;
  className?: string;
}

const SesionSideModal: React.FC<SesionSideModalProps> = ({
  isOpen,
  onClose,
  sesion,
  onIniciar,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
  onViewMore,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');

  if (!sesion) return null;

  // Footer para el modal
  const footer = (
    <div className="flex justify-between items-center gap-3">
      {/* Botón principal Iniciar */}
      {onIniciar && (
        <Button
          variant="primary"
          onClick={() => onIniciar(sesion)}
          className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlayIcon className="w-4 h-4 mr-2" />
          Iniciar
        </Button>
      )}
      
      {/* Menú de acciones (3 puntos) */}
      <ActionsMenu
        actions={[
          ...(onViewMore ? [{
            label: 'Ver más',
            icon: <EyeIcon className="w-4 h-4" />,
            onClick: () => onViewMore(sesion)
          }] : []),
          ...(onEdit ? [{
            label: 'Editar',
            icon: <EditIcon className="w-4 h-4" />,
            onClick: () => onEdit(sesion)
          }] : []),
          ...(onDelete ? [{
            label: 'Eliminar',
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: () => onDelete(sesion),
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
          }] : [])
        ]}
      />
    </div>
  );

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

  // Obtener color del estado usando el sistema de diseño
  const getEstadoColor = () => {
    // Priorizar estado real del reclutamiento
    const estado = sesion.estado_real || sesion.estado || 'default';
    return getChipVariant(estado);
  };

  // Obtener texto del estado
  const getEstadoText = () => {
    console.log('🔍 SesionSideModal - Estado debug:', {
      estado_real: sesion.estado_real,
      estado: sesion.estado,
      responsable_real: sesion.responsable_real,
      implementador_real: sesion.implementador_real,
      meet_link: sesion.meet_link
    });
    
    // Priorizar estado real del reclutamiento
    if (sesion.estado_real) {
      return sesion.estado_real;
    }
    
    // Fallback al estado de sesión
    switch (sesion.estado) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En Curso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'reprogramada': return 'Reprogramada';
      default: return sesion.estado || 'Sin estado';
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

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      footer={footer}
      className={className}
      showCloseButton={false}
    >
      <div className="flex flex-col h-full -m-6">
        {/* Header */}
        <PageHeader
          title="Ver Sesión"
          variant="title-only"
          color="gray"
          className="mb-0"
          onClose={onClose}
          icon={<CalendarIcon className="w-5 h-5" />}
        />

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-6">
          {/* Participante Asociado */}
        <InfoContainer 
          title="Participante Asociado"
          icon={<UserIcon className="w-4 h-4" />}
          padding="none"
        >
          <InfoItem 
            label="Nombre"
            value={sesion.titulo}
          />
        </InfoContainer>

        {/* Información de la Sesión */}
        <InfoContainer 
          title="Información de la Sesión"
          icon={<FileTextIcon className="w-4 h-4" />}
          padding="none"
        >
          <InfoItem 
            label="Investigación"
            value={sesion.investigacion_nombre || "Investigación actual"}
          />
          <InfoItem 
            label="ID Investigación"
            value={sesion.investigacion_id ? `${sesion.investigacion_id.substring(0, 12)}...` : "N/A"}
          />
          <InfoItem 
            label="Estado"
            value={
              <Chip 
                variant={getEstadoColor() as any} 
                size="sm"
              >
                {sesion.estado_real || getEstadoText()}
              </Chip>
            }
          />
          <InfoItem 
            label="Responsable"
            value={sesion.responsable_real || sesion.moderador_nombre || "Sin asignar"}
          />
          {sesion.implementador_real && (
            <InfoItem 
              label="Implementador"
              value={sesion.implementador_real}
            />
          )}
        </InfoContainer>

        {/* Fechas */}
        <InfoContainer 
          title="Fechas"
          icon={<ClockIcon className="w-4 h-4" />}
          padding="none"
        >
          <InfoItem 
            label="Fecha de Sesión"
            value={formatDate(sesion.start)}
          />
          <InfoItem 
            label="Hora de Sesión"
            value={sesion.hora_sesion || 'No especificada'}
          />
          <InfoItem 
            label="Duración"
            value={sesion.duracion_minutos ? `${sesion.duracion_minutos} minutos` : 'No especificada'}
          />
          <InfoItem 
            label="Fecha de Creación"
            value={formatDate(new Date(sesion.created_at))}
          />
        </InfoContainer>

        {/* Enlace de Google Meet */}
        {sesion.meet_link && (
          <InfoContainer 
            title="Enlace de Google Meet"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            }
            padding="none"
          >
            <div className="col-span-full">
              <div className="flex items-center gap-2">
                <a 
                  href={sesion.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
                >
                  {sesion.meet_link}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(sesion.meet_link)}
                  className="p-1 h-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </InfoContainer>
        )}

        {/* Notas de la Sesión */}
        <InfoContainer 
          title="Notas de la Sesión"
          icon={<MessageIcon className="w-4 h-4" />}
          padding="none"
        >
          <div className="col-span-full">
            <Typography variant="body2" weight="medium">
              {sesion.descripcion || sesion.notas_publicas || "Sin notas"}
            </Typography>
          </div>
        </InfoContainer>
        </div>
      </div>
    </SideModal>
  );
};

export default SesionSideModal;
