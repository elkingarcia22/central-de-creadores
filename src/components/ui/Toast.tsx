import React, { useEffect, useState } from 'react';
import { CheckIcon, CloseIcon, AlertTriangleIcon, InfoIcon } from '../icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Mostrar toast con animación
    setTimeout(() => setIsVisible(true), 50);

    // Auto-cerrar después del duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out transform";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-card border-green-200 dark:border-green-800`;
      case 'error':
        return `${baseStyles} bg-card border-red-200 dark:border-red-800`;
      case 'warning':
        return `${baseStyles} bg-card border-yellow-200 dark:border-yellow-800`;
      case 'info':
        return `${baseStyles} bg-card border-blue-200 dark:border-blue-800`;
      default:
        return `${baseStyles} bg-card border-border`;
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case 'success':
        return "text-green-600 dark:text-green-400";
      case 'error':
        return "text-red-600 dark:text-red-400";
      case 'warning':
        return "text-yellow-600 dark:text-yellow-400";
      case 'info':
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckIcon className={iconClass} />;
      case 'error':
        return <CloseIcon className={iconClass} />;
      case 'warning':
        return <AlertTriangleIcon className={iconClass} />;
      case 'info':
        return <InfoIcon className={iconClass} />;
      default:
        return <InfoIcon className={iconClass} />;
    }
  };

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      } max-w-sm w-full`}
    >
      {/* Icono */}
      <div className={`flex-shrink-0 ${getIconStyles()}`}>
        {getIcon()}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">
          {title}
        </h4>
        {message && (
          <p className="mt-1 text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded"
        aria-label="Cerrar notificación"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast; 