import React from 'react';
import { Typography } from './index';
import { AlertTriangleIcon, InfoIcon, CheckCircleIcon, XCircleIcon, XIcon } from '../icons';

export interface AlertProps {
  /** Tipo de alerta */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Título de la alerta */
  title?: string;
  /** Contenido de la alerta */
  children: React.ReactNode;
  /** Mostrar botón de cerrar */
  closable?: boolean;
  /** Callback cuando se cierra la alerta */
  onClose?: () => void;
  /** Mostrar icono */
  showIcon?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Acciones adicionales */
  actions?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  closable = false,
  onClose,
  showIcon = true,
  className = '',
  actions
}) => {
  const getVariantStyles = () => {
    const baseStyles = 'p-4 rounded-lg border';
    const variantStyles = {
      info: 'bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  const getIcon = () => {
    const iconClasses = 'w-5 h-5 flex-shrink-0';
    switch (variant) {
      case 'success':
        return <CheckCircleIcon className={iconClasses} />;
      case 'warning':
        return <AlertTriangleIcon className={iconClasses} />;
      case 'error':
        return <XCircleIcon className={iconClasses} />;
      default:
        return <InfoIcon className={iconClasses} />;
    }
  };

  const getIconColor = () => {
    const colorClasses = {
      info: 'text-primary',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500'
    };
    return colorClasses[variant];
  };

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className={`mr-3 ${getIconColor()}`}>
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <Typography variant="body1" weight="semibold" className="mb-1">
              {title}
            </Typography>
          )}
          
          <div className="text-sm">
            {children}
          </div>
          
          {actions && (
            <div className="mt-3 flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
        
        {closable && onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="Cerrar alerta"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
