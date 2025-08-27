import React from 'react';
import Card from './Card';
import { ContainerTitle } from './ContainerTitle';
import { InfoItem } from './InfoItem';
import { cn } from '../../utils/cn';

export interface InfoContainerProps {
  /** Título del contenedor */
  title?: string;
  /** Icono del título */
  icon?: React.ReactNode;
  /** Tamaño del título */
  titleSize?: 'sm' | 'md' | 'lg';
  /** Contenido del contenedor */
  children?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante del contenedor */
  variant?: 'default' | 'compact' | 'bordered' | 'elevated';
  /** Padding del contenedor */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Si mostrar el contenedor Card */
  showCard?: boolean;
  /** Alineación del título */
  titleAlignment?: 'left' | 'center' | 'right';
}

/**
 * Componente InfoContainer - Contenedor principal para información
 * 
 * Este componente proporciona un contenedor flexible para mostrar información
 * de manera consistente en toda la plataforma.
 * 
 * @example
 * ```tsx
 * <InfoContainer
 *   title="Información Básica"
 *   icon={<UserIcon className="w-5 h-5" />}
 *   variant="default"
 *   padding="lg"
 * >
 *   <InfoItem label="Nombre" value="Juan Pérez" />
 *   <InfoItem label="Email" value="juan@ejemplo.com" />
 * </InfoContainer>
 * ```
 */
export const InfoContainer: React.FC<InfoContainerProps> = ({
  title,
  icon,
  titleSize = 'md',
  children,
  className,
  variant = 'default',
  padding = 'lg',
  showCard = true,
  titleAlignment = 'left'
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const content = (
    <div className={cn(
      'space-y-4',
      padding !== 'none' && paddingMap[padding],
      className
    )}>
      {title && (
        <ContainerTitle
          title={title}
          icon={icon}
          size={titleSize}
          alignment={titleAlignment}
        />
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card variant={variant} className={cn(
      padding === 'none' && 'p-0'
    )}>
      {content}
    </Card>
  );
};

// Exportar componentes relacionados para facilitar el uso
export { ContainerTitle, InfoItem };
