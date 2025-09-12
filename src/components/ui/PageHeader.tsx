import React from 'react';
import Typography from './Typography';
import Button from './Button';
import Chip from './Chip';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  /** Título principal de la página */
  title: string;
  /** Subtítulo descriptivo */
  subtitle?: string;
  /** Acción principal (botón) */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  };
  /** Acciones secundarias */
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }>;
  /** Icono opcional para el header */
  icon?: React.ReactNode;
  /** Color del icono y fondo */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red' | 'indigo' | 'gray';
  /** Clases CSS adicionales */
  className?: string;
  /** Alineación del contenido */
  alignment?: 'left' | 'center' | 'right';
  /** Variante del header - 'default' incluye subtítulo, 'compact' solo título, 'small' versión compacta para modales, 'title-only' solo título */
  variant?: 'default' | 'compact' | 'small' | 'title-only';
  /** Chip opcional para mostrar al lado del título */
  chip?: {
    label: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'accent-blue' | 'accent-purple' | 'accent-orange' | 'accent-teal' | 'accent-indigo' | 'accent-pink' | 'accent-cyan' | 'accent-emerald' | 'accent-violet';
    size?: 'sm' | 'md' | 'lg';
  };
  /** Función para cerrar el modal/side panel */
  onClose?: () => void;
}

/**
 * Componente PageHeader - Título de página con estilos sutiles y configurables
 * 
 * Este componente proporciona una estructura consistente para los títulos de página
 * con soporte para iconos, acciones y diferentes variantes de color.
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Investigaciones"
 *   subtitle="Gestiona y organiza todas las investigaciones"
 *   primaryAction={{
 *     label: "Nueva Investigación",
 *     onClick: () => console.log('Crear'),
 *     variant: "primary"
 *   }}
 *   color="blue"
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  icon,
  color = 'gray',
  className,
  alignment = 'left',
  variant = 'default',
  chip,
  onClose
}) => {
  // Mapeo de colores
  const colorMap = {
    blue: {
      icon: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    green: {
      icon: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    purple: {
      icon: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    orange: {
      icon: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    teal: {
      icon: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-900/20'
    },
    red: {
      icon: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20'
    },
    indigo: {
      icon: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    gray: {
      icon: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-900/20'
    }
  };

  const selectedColor = colorMap[color];

  // Para la variante title-only, usar una estructura diferente
  
  if (variant === 'title-only') {
    return (
      <div className={cn(className)}>
        <div className="flex items-center justify-between w-full py-4 px-6">
          {/* Título e icono a la izquierda */}
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn("flex items-center justify-center", selectedColor?.icon)}>
                {icon}
              </div>
            )}
            <Typography
              variant="h4"
              color="default"
              weight="semibold"
              className="!text-gray-500 dark:!text-gray-400"
            >
              {title}
            </Typography>
            {chip && (
              <Chip 
                variant={chip.variant || 'default'}
                size="sm"
                className="ml-2"
              >
                {chip.label}
              </Chip>
            )}
          </div>

          {/* Botón de cerrar a la derecha */}
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Línea separadora */}
        <div className="w-full border-b border-border"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      variant === 'small' ? 'mb-4' : 'mb-8',
      className
    )}>
      <div className={cn(
        'flex items-center w-full',
        variant === 'small' && 'gap-2',
        (primaryAction || secondaryActions) ? 'justify-between' : 'justify-start'
      )}>
        {/* Título e icono a la izquierda */}
        <div className={cn(
          'flex items-center gap-3',
          variant === 'small' && 'gap-2'
        )}>
          {icon && (
            <div className={cn(
              "flex items-center justify-center",
              selectedColor?.icon
            )}>
              {icon}
            </div>
          )}
          <div>
            {title && (
              <Typography
                variant={variant === 'small' ? 'h4' : 'h2'}
                color="default"
                weight="semibold"
                className="!text-gray-600 dark:!text-gray-300"
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant={title ? 'body2' : (variant === 'small' ? 'h4' : 'h2')}
                color={title ? 'secondary' : 'default'}
                weight={title ? 'normal' : 'semibold'}
                className={title ? '!mt-0' : '!text-gray-600 dark:!text-gray-300'}
              >
                {subtitle}
              </Typography>
            )}
          </div>
          {chip && (
            <Chip 
              variant={chip.variant || 'default'}
              size={variant === 'small' ? 'sm' : (chip.size || 'sm')}
            >
              {chip.label}
            </Chip>
          )}
        </div>

        {/* Acciones a la derecha */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2">
            {secondaryActions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                size={variant === 'small' ? 'sm' : (action.size || 'md')}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn("flex items-center gap-2", action.className)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            
            {primaryAction && (
              <Button
                variant={primaryAction.variant || 'primary'}
                size={variant === 'small' ? 'sm' : (primaryAction.size || 'md')}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className={cn("flex items-center gap-2", primaryAction.className)}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
