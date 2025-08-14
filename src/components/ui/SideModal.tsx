import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Typography } from './index';
import { CloseIcon } from '../icons';

export interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

const SideModal: React.FC<SideModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  width = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  footer
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Solo aplicar animación cuando el modal se abre por primera vez
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Manejar escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  // Manejar animación
  useEffect(() => {
    if (isOpen && !hasAnimated) {
      setHasAnimated(true);
    } else if (!isOpen) {
      setHasAnimated(false);
    }
  }, [isOpen, hasAnimated]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  const slideClasses = {
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right'
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Side Modal */}
      <div 
        ref={modalRef}
        className={`fixed top-0 bottom-0 ${positionClasses[position]} ${widthClasses[width]} w-full bg-card shadow-xl ${hasAnimated ? slideClasses[position] : ''} ${className}`}
        style={{ height: '100vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="flex flex-col" style={{ height: '100vh' }}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-border">
              {title && (
                <Typography variant="h4" weight="semibold" className="text-card-foreground">
                  {title}
                </Typography>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar modal"
                >
                  <CloseIcon className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Animaciones CSS */}
      <style jsx>{`
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );

  // Usar Portal para renderizar fuera del DOM normal
  return createPortal(modalContent, document.body);
}; 

export default SideModal; 