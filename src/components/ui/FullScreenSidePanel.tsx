import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface FullScreenSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
}

const FullScreenSidePanel: React.FC<FullScreenSidePanelProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  width = 'max-w-md'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Prevenir scroll del body cuando el panel está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Crear portal para renderizar fuera del Layout
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute top-0 ${position === 'right' ? 'right-0' : 'left-0'} w-full ${width} bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700`}
        style={{
          position: 'absolute',
          top: 0,
          [position === 'right' ? 'right' : 'left']: 0,
          width: '100%',
          maxWidth: width === 'max-w-md' ? '448px' : width === 'max-w-lg' ? '512px' : width === 'max-w-xl' ? '576px' : '448px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderLeft: position === 'right' ? '1px solid #e5e7eb' : 'none',
          borderRight: position === 'left' ? '1px solid #e5e7eb' : 'none',
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default FullScreenSidePanel;
