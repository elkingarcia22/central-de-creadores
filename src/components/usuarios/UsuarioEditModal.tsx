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

  // Resetear submitting cuando el modal se cierre
  React.useEffect(() => {
    if (!isOpen) {
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleFormSubmit = async (data: Usuario) => {
    setSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
    } finally {
      setSubmitting(false);
    }
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
              // Trigger submit del formulario directamente
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
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