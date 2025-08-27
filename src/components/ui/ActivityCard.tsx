import React from 'react';
import { Card, Typography, Chip, UserAvatar } from './index';
import { cn } from '../../utils/cn';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export interface ActivityCardProps {
  /** ID único de la actividad */
  id: string;
  /** Tipo de actividad */
  tipo: string;
  /** Etiqueta de la actividad */
  label: string;
  /** Color del chip */
  color: 'success' | 'info' | 'warning' | 'danger' | 'default';
  /** Icono de la actividad */
  icon: React.ReactNode;
  /** Nombre del usuario */
  userName: string;
  /** Avatar del usuario */
  userAvatar?: string;
  /** Fecha de creación */
  fechaCreacion: string;
  /** Resumen de la actividad */
  resumen: string;
  /** Si es el último elemento del timeline */
  isLast?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente ActivityCard - Tarjeta de actividad
 * 
 * Este componente proporciona una tarjeta de actividad con timeline,
 * siguiendo el lineamiento de textos claros e iconos del sistema de diseño.
 * 
 * @example
 * ```tsx
 * <ActivityCard
 *   id="1"
 *   tipo="creacion"
 *   label="Creación"
 *   color="success"
 *   icon={<PlusIcon className="w-4 h-4" />}
 *   userName="Juan Pérez"
 *   userAvatar="https://example.com/avatar.jpg"
 *   fechaCreacion="2024-01-01T10:00:00Z"
 *   resumen="Investigación creada exitosamente"
 * />
 * ```
 */
export const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  tipo,
  label,
  color,
  icon,
  userName,
  userAvatar,
  fechaCreacion,
  resumen,
  isLast = false,
  className
}) => {
  return (
    <div className={cn("flex items-start gap-3 relative group", className)}>
      {/* Línea vertical del timeline */}
      <div 
        className={cn(
          "absolute left-4 top-0 bottom-0 w-0.5 bg-muted/60",
          isLast && "hidden"
        )} 
        style={{zIndex:0}} 
      />
      
      {/* Punto del timeline */}
      <div className="z-10 w-8 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border-2 border-white shadow">
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Contenido de la tarjeta */}
      <Card className="flex-1 p-4 mb-2">
        {/* Header con metadata */}
        <div className="flex items-center gap-2 mb-2">
          <Chip variant={color} size="sm">
            {label}
          </Chip>
          <Typography 
            variant="body2" 
            className="!text-gray-600 dark:!text-gray-300 font-medium"
          >
            {userName}
          </Typography>
          <UserAvatar 
            src={userAvatar} 
            fallbackText={userName} 
            size="sm" 
          />
          <Typography 
            variant="body2" 
            className="!text-gray-500 dark:!text-gray-400 ml-2"
          >
            {formatDistanceToNow(new Date(fechaCreacion), { 
              addSuffix: true, 
              locale: enUS 
            })}
            <span className="ml-2 text-xs !text-gray-400 dark:!text-gray-500">
              ({format(new Date(fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: enUS })})
            </span>
          </Typography>
        </div>
        
        {/* Resumen de la actividad */}
        <Typography 
          variant="body1" 
          className="!text-gray-700 dark:!text-gray-200"
        >
          {resumen}
        </Typography>
      </Card>
    </div>
  );
};
