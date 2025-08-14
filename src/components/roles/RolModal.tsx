import { useState, useEffect } from 'react';
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
  onSave: (rol: Partial<Rol>) => Promise<void>;
  rol?: Rol | null;
}

export default function RolModal({ isOpen, onClose, onSave, rol }: RolModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
    es_sistema: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rol) {
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        activo: rol.activo,
        es_sistema: rol.es_sistema
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true,
        es_sistema: false
      });
    }
    setErrors({});
  }, [rol, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del rol es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error guardando rol:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={rol ? 'Editar Rol' : 'Crear Nuevo Rol'}
      width="lg"
      position="right"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          >
            {rol ? 'Actualizar' : 'Crear'} Rol
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Rol *
          </label>
          <Input
            id="nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Ej: Analista de Datos"
            error={errors.nombre}
            disabled={rol?.es_sistema}
          />
          {rol?.es_sistema && (
            <p className="mt-1 text-sm text-blue-600">
              Los roles del sistema no pueden cambiar su nombre
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Describe las responsabilidades y permisos de este rol..."
            rows={3}
            error={errors.descripcion}
          />
        </div>

        {/* Estado Activo */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="activo" className="block text-sm font-medium text-gray-700">
              Rol Activo
            </label>
            <p className="text-sm text-gray-500">
              Los roles inactivos no pueden ser asignados a usuarios
            </p>
          </div>
          <Switch
            id="activo"
            checked={formData.activo}
            onChange={(checked) => handleInputChange('activo', checked)}
            disabled={rol?.es_sistema}
          />
        </div>

        {/* Es Sistema */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="es_sistema" className="block text-sm font-medium text-gray-700">
              Rol del Sistema
            </label>
            <p className="text-sm text-gray-500">
              Los roles del sistema no pueden ser eliminados
            </p>
          </div>
          <Switch
            id="es_sistema"
            checked={formData.es_sistema}
            onChange={(checked) => handleInputChange('es_sistema', checked)}
            disabled={rol?.es_sistema}
          />
        </div>
      </form>
    </SideModal>
  );
}
