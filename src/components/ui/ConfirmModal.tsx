import React from 'react';
import { Modal } from './Modal';
import Button from './Button';
import Typography from './Typography';
import { PageHeader } from './PageHeader';
import { AlertTriangleIcon, InfoIcon, CheckCircleIcon, XCircleIcon } from '../icons';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  size = 'md'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-success" />;
      case 'warning':
        return <AlertTriangleIcon className="w-6 h-6 text-warning" />;
      case 'error':
        return <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />;
      default:
        return <InfoIcon className="w-6 h-6 text-primary" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={type === 'error' ? 'destructive' : 'primary'}
        onClick={onConfirm}
        loading={loading}
        disabled={loading}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      footer={footer}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      showCloseButton={false}
    >
      <div className="flex flex-col w-full">
        {/* Header personalizado */}
        {title && (
          <div className="flex items-center justify-between w-full py-4 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              {getIcon()}
              <Typography
                variant="h4"
                color="default"
                weight="semibold"
                className="!text-gray-500 dark:!text-gray-400"
              >
                {title}
              </Typography>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Contenido del modal */}
        <div className="flex flex-col items-start w-full px-6 py-6">
          <Typography variant="body1" color="secondary" className="text-muted-foreground text-left w-full">
            {message}
          </Typography>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal; 