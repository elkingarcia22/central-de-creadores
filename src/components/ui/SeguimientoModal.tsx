import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { Typography } from './Typography';
import { UserSelectorWithAvatar } from './UserSelectorWithAvatar';
import { SaveIcon, CloseIcon } from '../icons';
import type { SeguimientoInvestigacion, SeguimientoFormData } from '../../types/seguimientos';
import { ESTADOS_SEGUIMIENTO } from '../../types/seguimientos';

interface SeguimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SeguimientoFormData) => Promise<void>;
  seguimiento?: SeguimientoInvestigacion | null;
  investigacionId: string;
  usuarios: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  }>;
  loading?: boolean;
}

export const SeguimientoModal: React.FC<SeguimientoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  seguimiento,
  investigacionId,
  usuarios,
  loading = false
}) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<SeguimientoFormData>({
    investigacion_id: investigacionId,
    fecha_seguimiento: '',
    notas: '',
    responsable_id: '',
    estado: 'pendiente'
  });
  
  const [saving, setSaving] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (seguimiento) {
        // Modo edición
        setFormData({
          investigacion_id: seguimiento.investigacion_id,
          fecha_seguimiento: seguimiento.fecha_seguimiento.split('T')[0], // Solo fecha
          notas: seguimiento.notas,
          responsable_id: seguimiento.responsable_id,
          estado: seguimiento.estado
        });
      } else {
        // Modo creación
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          investigacion_id: investigacionId,
          fecha_seguimiento: today,
          notas: '',
          responsable_id: '',
          estado: 'pendiente'
        });
      }
    }
  }, [isOpen, seguimiento, investigacionId]);

  const handleInputChange = (field: keyof SeguimientoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.fecha_seguimiento) {
      showError('La fecha de seguimiento es requerida');
      return;
    }
    
    if (!formData.notas.trim()) {
      showError('Las notas son requeridas');
      return;
    }
    
    if (!formData.responsable_id) {
      showError('El responsable es requerido');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error guardando seguimiento:', error);
      showError(error.message || 'Error al guardar el seguimiento');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={seguimiento ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha de Seguimiento */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Fecha de Seguimiento *
          </Typography>
          <input
            type="date"
            value={formData.fecha_seguimiento}
            onChange={(e) => handleInputChange('fecha_seguimiento', e.target.value)}
            required
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Responsable */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Responsable *
          </Typography>
          <UserSelectorWithAvatar
            value={formData.responsable_id}
            onChange={(value) => handleInputChange('responsable_id', value)}
            users={usuarios}
            placeholder="Seleccionar responsable"
            disabled={saving}
            required
          />
        </div>

        {/* Estado */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Estado *
          </Typography>
          <Select
            options={ESTADOS_SEGUIMIENTO.map(estado => ({
              value: estado.value,
              label: estado.label
            }))}
            value={formData.estado}
            onChange={(value) => handleInputChange('estado', value.toString())}
            placeholder="Seleccionar estado"
            disabled={saving}
            fullWidth
          />
        </div>

        {/* Notas */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Notas *
          </Typography>
          <Textarea
            value={formData.notas}
            onChange={(e) => handleInputChange('notas', e.target.value)}
            placeholder="Describe los detalles del seguimiento, avances, bloqueos, próximos pasos, etc."
            rows={6}
            required
            disabled={saving}
            fullWidth
          />
          <Typography variant="caption" color="secondary" className="mt-1">
            Describe el estado actual, avances realizados, bloqueos encontrados y próximos pasos.
          </Typography>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            className="flex items-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            {seguimiento ? 'Actualizar' : 'Crear'} Seguimiento
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 