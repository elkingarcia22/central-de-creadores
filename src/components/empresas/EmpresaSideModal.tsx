import React, { useState, useEffect } from 'react';
import SideModal from '../ui/SideModal';
import Typography from '../ui/Typography';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { SaveIcon, XIcon } from '../icons';

interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  kam_id?: string;
  pais_id?: string;
  industria_id?: string;
  estado_id?: string;
  tamano_id?: string;
  modalidad_id?: string;
  relacion_id?: string;
  producto_id?: string;
  activo?: boolean;
}

interface Usuario {
  id: string;
  full_name?: string | null;
  nombre?: string | null;
  email?: string | null;
  correo?: string | null;
  avatar_url?: string | null;
  roles?: string[];
  activo?: boolean;
}

interface EmpresaSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Empresa>) => void;
  empresa?: Empresa | null;
  usuarios: Usuario[];
  filterOptions: {
    estados: { value: string; label: string }[];
    paises: { value: string; label: string }[];
    industrias: { value: string; label: string }[];
    tamanos: { value: string; label: string }[];
    modalidades: { value: string; label: string }[];
    relaciones: { value: string; label: string }[];
    productos: { value: string; label: string }[];
  };
  loading?: boolean;
}

export default function EmpresaSideModal({
  isOpen,
  onClose,
  onSave,
  empresa,
  usuarios,
  filterOptions,
  loading = false
}: EmpresaSideModalProps) {
  const [formData, setFormData] = useState<Partial<Empresa>>({
    nombre: '',
    descripcion: '',
    kam_id: '',
    pais_id: '',
    industria_id: '',
    estado_id: '',
    tamano_id: '',
    modalidad_id: '',
    relacion_id: '',
    producto_id: '',
    activo: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Actualizar formData cuando cambie la empresa
  useEffect(() => {
    if (empresa) {
      setFormData({
        id: empresa.id,
        nombre: empresa.nombre || '',
        descripcion: empresa.descripcion || '',
        kam_id: empresa.kam_id || '',
        pais_id: empresa.pais_id || '',
        industria_id: empresa.industria_id || '',
        estado_id: empresa.estado_id || '',
        tamano_id: empresa.tamano_id || '',
        modalidad_id: empresa.modalidad_id || '',
        relacion_id: empresa.relacion_id || '',
        producto_id: empresa.producto_id || '',
        activo: empresa.activo
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        kam_id: '',
        pais_id: '',
        industria_id: '',
        estado_id: '',
        tamano_id: '',
        modalidad_id: '',
        relacion_id: '',
        producto_id: '',
        activo: true
      });
    }
    setErrors({});
  }, [empresa]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.pais_id) {
      newErrors.pais_id = 'El país es requerido';
    }

    if (!formData.industria_id) {
      newErrors.industria_id = 'La industria es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const isEditing = !!empresa;

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        <XIcon className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        loading={loading}
        disabled={loading}
      >
        <SaveIcon className="w-4 h-4 mr-2" />
        {isEditing ? 'Actualizar' : 'Crear'}
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Empresa' : 'Crear Empresa'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <Typography variant="h4" weight="semibold">
            Información Básica
          </Typography>
          
          <div>
            <Input
              label="Nombre de la Empresa"
              value={formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ingresa el nombre de la empresa"
              error={errors.nombre}
              required
              fullWidth
            />
          </div>

          <div>
            <Textarea
              label="Descripción"
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe la empresa"
              rows={3}
              fullWidth
            />
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-4">
          <Typography variant="h4" weight="semibold">
            Información de Contacto
          </Typography>
          
          <div>
            <Select
              label="KAM Asignado"
              value={formData.kam_id || ''}
              onChange={(value) => handleInputChange('kam_id', value)}
              options={[
                { value: '', label: 'Seleccionar KAM' },
                ...(Array.isArray(usuarios) ? usuarios.filter(u => u.activo !== false).map(u => ({
                  value: u.id,
                  label: u.full_name || u.nombre || u.email || u.correo || 'Sin nombre'
                })) : [])
              ]}
              placeholder="Selecciona un KAM"
              fullWidth
            />
          </div>
        </div>

        {/* Información de ubicación */}
        <div className="space-y-4">
          <Typography variant="h4" weight="semibold">
            Ubicación y Clasificación
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="País"
                value={formData.pais_id || ''}
                onChange={(value) => handleInputChange('pais_id', value)}
                options={[
                  { value: '', label: 'Seleccionar país' },
                  ...filterOptions.paises
                ]}
                placeholder="Selecciona un país"
                error={errors.pais_id}
                required
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Industria"
                value={formData.industria_id || ''}
                onChange={(value) => handleInputChange('industria_id', value)}
                options={[
                  { value: '', label: 'Seleccionar industria' },
                  ...filterOptions.industrias
                ]}
                placeholder="Selecciona una industria"
                error={errors.industria_id}
                required
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Tamaño"
                value={formData.tamano_id || ''}
                onChange={(value) => handleInputChange('tamano_id', value)}
                options={[
                  { value: '', label: 'Seleccionar tamaño' },
                  ...filterOptions.tamanos
                ]}
                placeholder="Selecciona un tamaño"
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Modalidad"
                value={formData.modalidad_id || ''}
                onChange={(value) => handleInputChange('modalidad_id', value)}
                options={[
                  { value: '', label: 'Seleccionar modalidad' },
                  ...filterOptions.modalidades
                ]}
                placeholder="Selecciona una modalidad"
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Relación"
                value={formData.relacion_id || ''}
                onChange={(value) => handleInputChange('relacion_id', value)}
                options={[
                  { value: '', label: 'Seleccionar relación' },
                  ...filterOptions.relaciones
                ]}
                placeholder="Selecciona una relación"
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Producto"
                value={formData.producto_id || ''}
                onChange={(value) => handleInputChange('producto_id', value)}
                options={[
                  { value: '', label: 'Seleccionar producto' },
                  ...filterOptions.productos
                ]}
                placeholder="Selecciona un producto"
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-4">
          <Typography variant="h4" weight="semibold">
            Estado
          </Typography>
          
          <div>
            <Select
              label="Estado de la Empresa"
              value={formData.estado_id || ''}
              onChange={(value) => handleInputChange('estado_id', value)}
              options={[
                { value: '', label: 'Seleccionar estado' },
                ...filterOptions.estados
              ]}
              placeholder="Selecciona un estado"
              fullWidth
            />
          </div>


        </div>

      </form>
    </SideModal>
  );
}
