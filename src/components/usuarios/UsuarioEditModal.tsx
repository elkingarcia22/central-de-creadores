import React from 'react';
import { SideModal } from '../ui';
import UsuarioForm from './UsuarioForm';

interface Usuario {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
}

interface UsuarioEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
  usuario: Usuario | null;
  loading?: boolean;
}

export default function UsuarioEditModal({ isOpen, onClose, onSave, usuario, loading = false }: UsuarioEditModalProps) {
  const handleFormSubmit = (data: Usuario) => {
    onSave(data);
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
      width="lg"
    >
      <UsuarioForm
        usuario={usuario}
        onSubmit={handleFormSubmit}
        onClose={onClose}
        loading={loading}
        isEditing={true}
      />
    </SideModal>
  );
} 