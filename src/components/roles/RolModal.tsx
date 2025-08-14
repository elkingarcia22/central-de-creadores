import React, { useState, useEffect } from 'react';
import { Typography, Button, Input, Textarea, Switch } from '../ui';
import SideModal from '../ui/SideModal';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  es_sistema: boolean;
}

interface RolModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol?: Rol | null;
  onSave: (rolData: Partial<Rol>) => Promise<void>;
}

const RolModal: React.FC<RolModalProps> = ({ isOpen, onClose, rol, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario cuando cambie el rol
  useEffect(() => {
    if (rol) {
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        activo: rol.activo,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true,
      });
    }
    setErrors({});
  }, [rol]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del rol es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error guardando rol:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={rol ? 'Editar Rol' : 'Crear Nuevo Rol'}
      width="lg"
      position="right"
      footer={
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : (rol ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Nombre del Rol */}
        <div>
          <Typography variant="body2" weight="semibold" className="mb-2">
            Nombre del Rol *
          </Typography>
          <Input
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Ej: Analista Senior"
            error={errors.nombre}
            disabled={rol?.es_sistema}
          />
          {rol?.es_sistema && (
            <Typography variant="caption" color="secondary" className="mt-1">
              Los roles del sistema no pueden ser editados
            </Typography>
          )}
        </div>

        {/* Descripción */}
        <div>
          <Typography variant="body2" weight="semibold" className="mb-2">
            Descripción *
          </Typography>
          <Textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Describe las responsabilidades y permisos de este rol..."
            rows={4}
            error={errors.descripcion}
            disabled={rol?.es_sistema}
          />
        </div>

        {/* Estado Activo */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" weight="semibold">
                Rol Activo
              </Typography>
              <Typography variant="caption" color="secondary">
                Los roles inactivos no pueden ser asignados a usuarios
              </Typography>
            </div>
            <Switch
              checked={formData.activo}
              onChange={(checked) => handleInputChange('activo', checked)}
              disabled={rol?.es_sistema}
            />
          </div>
        </div>

        {/* Información adicional para roles del sistema */}
        {rol?.es_sistema && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Typography variant="body2" weight="semibold" className="text-blue-800 mb-2">
              Rol del Sistema
            </Typography>
            <Typography variant="caption" color="secondary" className="text-blue-700">
              Este es un rol del sistema que no puede ser modificado ni eliminado. 
              Solo puedes gestionar sus permisos específicos.
            </Typography>
          </div>
        )}

        {/* Información para nuevos roles */}
        {!rol && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <Typography variant="body2" weight="semibold" className="text-green-800 mb-2">
              Nuevo Rol Personalizado
            </Typography>
            <Typography variant="caption" color="secondary" className="text-green-700">
              Después de crear el rol, podrás configurar sus permisos específicos 
              para cada módulo y funcionalidad del sistema.
            </Typography>
          </div>
        )}
      </div>
    </SideModal>
  );
};

export default RolModal;
