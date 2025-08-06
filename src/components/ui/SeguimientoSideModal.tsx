import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import SideModal from './SideModal';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Typography from './Typography';
import UserSelectorWithAvatar from './UserSelectorWithAvatar';
import DatePicker from './DatePicker';
import { SaveIcon } from '../icons';
import type { SeguimientoInvestigacion, SeguimientoFormData } from '../../types/seguimientos';
import { ESTADOS_SEGUIMIENTO } from '../../types/seguimientos';

interface SeguimientoSideModalProps {
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

const SeguimientoSideModal: React.FC<SeguimientoSideModalProps> = ({
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
          estado: 'pendiente' // Siempre pendiente al crear
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
      // Cerrar modal después de guardar exitosamente
      setTimeout(() => {
        onClose();
      }, 100); // Pequeño delay para asegurar que el toast se muestre
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

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={saving}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={saving}
        disabled={saving}
        className="flex items-center gap-2"
      >
        <SaveIcon className="w-4 h-4" />
        {seguimiento ? 'Actualizar' : 'Crear'} Seguimiento
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      title={seguimiento ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
      width="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha de Seguimiento */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Fecha de Seguimiento *
          </Typography>
          <DatePicker
            value={formData.fecha_seguimiento}
            onChange={(e) => handleInputChange('fecha_seguimiento', e.target.value)}
            disabled={saving}
            required
            fullWidth
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
        {/*
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
        */}

        {/* Notas */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Notas *
          </Typography>
          <Textarea
            value={formData.notas}
            onChange={(e) => handleInputChange('notas', e.target.value)}
            placeholder="Describe los detalles del seguimiento, avances, bloqueos, próximos pasos, etc."
            rows={8}
            required
            disabled={saving}
            fullWidth
          />
          <Typography variant="caption" color="secondary" className="mt-1">
            Describe el estado actual, avances realizados, bloqueos encontrados y próximos pasos.
          </Typography>
        </div>
      </form>
    </SideModal>
  );
};

export default SeguimientoSideModal; 