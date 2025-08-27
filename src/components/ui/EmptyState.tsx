import React from 'react';
import Typography from './Typography';
import Button from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  /** Icono del empty state */
  icon?: React.ReactNode;
  /** Título del empty state */
  title: string;
  /** Descripción del empty state */
  description: string;
  /** Texto del botón de acción */
  actionText?: string;
  /** Función que se ejecuta al hacer clic en el botón */
  onAction?: () => void;
  /** Variante del empty state */
  variant?: 'default' | 'compact' | 'large';
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente EmptyState - Estado vacío
 * 
 * Este componente proporciona un estado vacío con icono, título, descripción
 * y opcionalmente un botón de acción, siguiendo el lineamiento del sistema de diseño.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<FileTextIcon className="w-8 h-8" />}
 *   title="Sin Libreto"
 *   description="Esta investigación aún no tiene un libreto configurado."
 *   actionText="Crear Libreto"
 *   onAction={() => router.push('/crear-libreto')}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction,
  variant = 'default',
  className
}) => {
  const variantStyles = {
    default: {
      container: 'py-12 px-4',
      iconContainer: 'w-16 h-16',
      titleSize: 'h4',
      descriptionSize: 'body2',
      maxWidth: 'max-w-md'
    },
    compact: {
      container: 'py-8 px-4',
      iconContainer: 'w-12 h-12',
      titleSize: 'h5',
      descriptionSize: 'body2',
      maxWidth: 'max-w-sm'
    },
    large: {
      container: 'py-16 px-6',
      iconContainer: 'w-20 h-20',
      titleSize: 'h3',
      descriptionSize: 'body1',
      maxWidth: 'max-w-lg'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      styles.container,
      className
    )}>
      {icon && (
        <div className={cn(
          'rounded-full bg-muted flex items-center justify-center mb-4',
          styles.iconContainer
        )}>
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        </div>
      )}
      <Typography 
        variant={styles.titleSize as any} 
        className={cn(
          'mb-2 text-center !text-gray-700 dark:!text-gray-200'
        )}
      >
        {title}
      </Typography>
      <Typography 
        variant={styles.descriptionSize as any} 
        className={cn(
          'mb-6 text-center !text-gray-500 dark:!text-gray-400',
          styles.maxWidth
        )}
      >
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}; 