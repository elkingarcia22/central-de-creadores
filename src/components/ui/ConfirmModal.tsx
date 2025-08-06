import React from 'react';
import { Modal } from './Modal';
import Button from './Button';
import Typography from './Typography';
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
        return <CheckCircleIcon className="w-8 h-8 text-success" />;
      case 'warning':
        return <AlertTriangleIcon className="w-8 h-8 text-warning" />;
      case 'error':
        return <XCircleIcon className="w-8 h-8 text-destructive" />;
      default:
        return <InfoIcon className="w-8 h-8 text-primary" />;
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
        variant="outline"
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
    >
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-row items-center gap-3 mb-2 w-full">
          {getIcon()}
          {title && (
            <Typography variant="h4" weight="semibold" className="mb-0 text-card-foreground text-left">
              {title}
            </Typography>
          )}
        </div>
        <Typography variant="body1" color="secondary" className="text-muted-foreground mt-2 text-left w-full">
          {message}
        </Typography>
      </div>
    </Modal>
  );
};

export default ConfirmModal; 