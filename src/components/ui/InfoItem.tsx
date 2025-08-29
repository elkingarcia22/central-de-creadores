import React from 'react';
import Typography from './Typography';
import { cn } from '../../utils/cn';

export interface InfoItemProps {
  /** Título de la información */
  label: string;
  /** Valor o descripción */
  value?: string | React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante del componente */
  variant?: 'default' | 'compact' | 'stacked' | 'inline';
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Si el valor es requerido */
  required?: boolean;
  /** Si el valor está vacío */
  empty?: boolean;
  /** Mensaje cuando está vacío */
  emptyMessage?: string;
}

/**
 * Componente InfoItem - Elemento de información con título y valor
 * 
 * Este componente proporciona una estructura consistente para mostrar
 * información con título sutil y valor más prominente.
 * 
 * @example
 * ```tsx
 * <InfoItem
 *   label="Nombre"
 *   value="Juan Pérez"
 *   variant="default"
 *   size="md"
 * />
 * ```
 */
export const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  className,
  variant = 'default',
  size = 'md',
  required = false,
  empty = false,
  emptyMessage = 'Sin información'
}) => {
  const sizeMap = {
    sm: {
      label: 'caption',
      value: 'body2'
    },
    md: {
      label: 'caption',
      value: 'body2'
    },
    lg: {
      label: 'subtitle2',
      value: 'body1'
    }
  };

  const renderValue = () => {
    if (empty || !value) {
      return (
        <Typography 
          variant={sizeMap[size].value} 
          color="secondary"
          className="italic"
        >
          {emptyMessage}
        </Typography>
      );
    }

    if (typeof value === 'string') {
      return (
        <Typography 
          variant={sizeMap[size].value} 
          color="default"
          weight="medium"
          className="!text-gray-900 dark:!text-gray-100"
        >
          {value}
        </Typography>
      );
    }

    return value;
  };

  const renderLabel = () => (
    <Typography 
      variant={sizeMap[size].label} 
      color="secondary"
      className="!text-gray-500 dark:!text-gray-400"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Typography>
  );

  switch (variant) {
    case 'compact':
      return (
        <div className={cn('flex items-center gap-2', className)}>
          {renderLabel()}
          <span className="text-gray-400">:</span>
          {renderValue()}
        </div>
      );

    case 'stacked':
      return (
        <div className={cn('space-y-1', className)}>
          {renderLabel()}
          {renderValue()}
        </div>
      );

    case 'inline':
      return (
        <div className={cn('inline-flex items-center gap-2', className)}>
          {renderLabel()}
          <span className="text-gray-400">:</span>
          {renderValue()}
        </div>
      );

    default:
      return (
        <div className={cn('space-y-1', className)}>
          {renderLabel()}
          {renderValue()}
        </div>
      );
  }
};
