import React from 'react';
import Typography from './Typography';
import { cn } from '../../utils/cn';

export interface ContainerTitleProps {
  /** Título del contenedor */
  title: string;
  /** Icono opcional */
  icon?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del título */
  size?: 'sm' | 'md' | 'lg';
  /** Alineación del contenido */
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Componente ContainerTitle - Título para contenedores de información
 * 
 * Este componente proporciona un título consistente para contenedores de información
 * con el mismo estilo sutil y gris que PageHeader.
 * 
 * @example
 * ```tsx
 * <ContainerTitle
 *   title="Información Básica"
 *   icon={<UserIcon className="w-5 h-5" />}
 *   size="md"
 * />
 * ```
 */
export const ContainerTitle: React.FC<ContainerTitleProps> = ({
  title,
  icon,
  className,
  size = 'md',
  alignment = 'left'
}) => {
  const sizeMap = {
    sm: 'h5',
    md: 'h4',
    lg: 'h3'
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn(
      'flex items-center gap-2 mb-2',
      alignment === 'center' && 'justify-center',
      alignment === 'right' && 'justify-end',
      className
    )}>
      {icon && (
        <div className="flex items-center justify-center">
          {React.cloneElement(icon as React.ReactElement, {
            className: cn(
              'text-gray-600 dark:text-gray-400',
              iconSizeMap[size],
              (icon as React.ReactElement).props.className
            )
          })}
        </div>
      )}
      <Typography
        variant={sizeMap[size]}
        color="default"
        weight="semibold"
        className="!text-gray-600 dark:!text-gray-300"
      >
        {title}
      </Typography>
    </div>
  );
};
