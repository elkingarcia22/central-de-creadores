import React, { useState } from 'react';
import { SideModal, Button } from '../ui';
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
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = (data: Usuario) => {
    setSubmitting(true);
    onSave(data);
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
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
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <UsuarioForm
        usuario={usuario}
        onSubmit={handleFormSubmit}
        onClose={onClose}
        loading={loading}
        isEditing={true}
        hideButtons={true}
      />
    </SideModal>
  );
} 