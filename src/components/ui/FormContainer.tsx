import React from 'react';
import Card from './Card';
import { ContainerTitle } from './ContainerTitle';
import { cn } from '../../utils/cn';

export interface FormContainerProps {
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
  /** Espaciado entre elementos del formulario */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * Componente FormContainer - Contenedor para formularios
 * 
 * Este componente proporciona un contenedor flexible para formularios
 * con elementos de entrada como Input, Select, DatePicker, etc.
 * 
 * @example
 * ```tsx
 * <FormContainer
 *   title="Información Básica"
 *   icon={<InfoIcon className="w-5 h-5" />}
 *   variant="default"
 *   padding="lg"
 *   spacing="md"
 * >
 *   <Input label="Nombre" placeholder="Ingrese nombre" />
 *   <Select label="Tipo" options={options} />
 * </FormContainer>
 * ```
 */
export const FormContainer: React.FC<FormContainerProps> = ({
  title,
  icon,
  titleSize = 'md',
  children,
  className,
  variant = 'default',
  padding = 'lg',
  showCard = true,
  titleAlignment = 'left',
  spacing = 'md'
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const spacingMap = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  const content = (
    <div className={cn(
      spacingMap[spacing],
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
      <div className={cn(spacingMap[spacing])}>
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
export { ContainerTitle };
