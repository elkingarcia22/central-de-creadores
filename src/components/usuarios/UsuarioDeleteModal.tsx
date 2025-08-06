import React from 'react';
import { ConfirmModal, Typography } from '../ui';

interface UsuarioDeleteModalProps {
  usuario: any;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const UsuarioDeleteModal: React.FC<UsuarioDeleteModalProps> = ({ usuario, open, onConfirm, onClose }) => {
  const userName = usuario?.full_name || usuario?.email || 'este usuario';
  
  const message = `¿Estás seguro de que deseas eliminar al usuario ${userName}? Esta acción no se puede deshacer y se eliminarán todos los datos asociados al usuario, incluyendo su perfil, roles y configuraciones.`;
  
  return (
    <ConfirmModal
      isOpen={open}
      onConfirm={onConfirm}
      onClose={onClose}
      title="Eliminar Usuario"
      message={message}
      type="error"
      confirmText="Eliminar"
      cancelText="Cancelar"
      size="md"
    />
  );
};

export default UsuarioDeleteModal; 