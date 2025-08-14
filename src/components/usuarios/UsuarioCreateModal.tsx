import React, { useState } from 'react';
import { SideModal, Button } from '../ui';
import UsuarioForm from './UsuarioForm';

interface Usuario {
  id?: string;
  full_name: string;
  email: string;
  roles: string[];
  avatar_url?: string;
}

interface UsuarioCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
  loading?: boolean;
}

export default function UsuarioCreateModal({ isOpen, onClose, onSave, loading = false }: UsuarioCreateModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = (data: Usuario) => {
    setSubmitting(true);
    onSave(data);
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Usuario"
      width="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              // Trigger submit del formulario usando el botón del UsuarioForm
              const submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
              if (submitButton && !submitButton.disabled) {
                submitButton.click();
              }
            }}
            disabled={submitting}
            loading={submitting}
          >
            Crear Usuario
          </Button>
        </div>
      }
    >
      <UsuarioForm
        onSubmit={handleFormSubmit}
        onClose={onClose}
        loading={loading}
        isEditing={false}
        hideButtons={true}
      />
    </SideModal>
  );
}
