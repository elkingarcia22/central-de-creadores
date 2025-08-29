import React, { useState, useEffect, useMemo } from 'react';
import SideModal from '../ui/SideModal';
import Typography from '../ui/Typography';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import MultiSelect from '../ui/MultiSelect';
import Textarea from '../ui/Textarea';
import UserSelectorWithAvatar from '../ui/UserSelectorWithAvatar';
import { PageHeader, FilterLabel } from '../ui/';
import { SaveIcon, XIcon } from '../icons';
import { Empresa, Usuario } from '../../types/empresas';



interface EmpresaSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Empresa>) => void;
  empresa?: Empresa | null;
  usuarios: Usuario[];
  filterOptions?: {
    estados: { value: string; label: string }[];
    paises: { value: string; label: string }[];
    tamanos: { value: string; label: string }[];
    relaciones: { value: string; label: string }[];
    productos: { value: string; label: string }[];
    industrias: { value: string; label: string }[];
    modalidades: { value: string; label: string }[];
  };
  loading?: boolean;
}

export default function EmpresaSideModal({
  isOpen,
  onClose,
  onSave,
  empresa,
  usuarios,
  filterOptions = {},
  loading = false
}: EmpresaSideModalProps) {
  const [formData, setFormData] = useState<Partial<Empresa>>({
    nombre: '',
    descripcion: '',
    kam_id: '',
    pais_id: '',
    estado_id: '',
    tamano_id: '',
    relacion_id: '',
    industria_id: '',
    modalidad_id: '',
    producto_id: '',
    productos_ids: [],
    activo: true
  });

  // Verificar que filterOptions tenga todas las propiedades necesarias
  const safeFilterOptions = useMemo(() => ({
    estados: filterOptions?.estados || [],
    tamanos: filterOptions?.tamanos || [],
    paises: filterOptions?.paises || [],
    kams: filterOptions?.kams || [],
    relaciones: filterOptions?.relaciones || [],
    productos: filterOptions?.productos || [],
    industrias: filterOptions?.industrias || [],
    modalidades: filterOptions?.modalidades || []
  }), [
    filterOptions?.estados,
    filterOptions?.tamanos,
    filterOptions?.paises,
    filterOptions?.kams,
    filterOptions?.relaciones,
    filterOptions?.productos,
    filterOptions?.industrias,
    filterOptions?.modalidades
  ]);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Actualizar formData cuando cambie la empresa
  useEffect(() => {
    console.log('🔍 EmpresaSideModal - empresa recibida:', empresa);
    console.log('🔍 EmpresaSideModal - usuarios recibidos:', usuarios.length);
    console.log('🔍 EmpresaSideModal - filterOptions recibidas:', filterOptions);
    
    if (empresa) {
      console.log('🔍 EmpresaSideModal - empresa.producto_id:', empresa.producto_id);
      console.log('🔍 EmpresaSideModal - empresa.productos_ids:', empresa.productos_ids);
      console.log('🔍 EmpresaSideModal - empresa.kam_id:', empresa.kam_id);
      
      // Convertir producto_id a productos_ids si es necesario
      let productos_ids = empresa.productos_ids || [];
      if (empresa.producto_id && !empresa.productos_ids) {
        productos_ids = [empresa.producto_id];
        console.log('🔄 Convirtiendo producto_id a productos_ids:', productos_ids);
      }
      
      const newFormData = {
        id: empresa.id,
        nombre: empresa.nombre || '',
        descripcion: empresa.descripcion || '',
        kam_id: empresa.kam_id || '',
        pais_id: empresa.pais_id || '',
        estado_id: empresa.estado_id || '',
        tamano_id: empresa.tamano_id || '',
        relacion_id: empresa.relacion_id || '',
        industria_id: empresa.industria_id || '',
        modalidad_id: empresa.modalidad_id || '',
        producto_id: empresa.producto_id || '',
        productos_ids: productos_ids,
        activo: empresa.activo
      };
      console.log('🔍 EmpresaSideModal - formData configurado:', newFormData);
      setFormData(newFormData);
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        kam_id: '',
        pais_id: '',
        estado_id: '',
        tamano_id: '',
        relacion_id: '',
        industria_id: '',
        modalidad_id: '',
        producto_id: '',
        productos_ids: [],
        activo: true
      });
    }
    setErrors({});
  }, [empresa?.id, empresa?.nombre, empresa?.descripcion, empresa?.kam_id, empresa?.pais_id, empresa?.estado_id, empresa?.tamano_id, empresa?.relacion_id, empresa?.industria_id, empresa?.modalidad_id, empresa?.producto_id, empresa?.productos_ids, empresa?.activo]);

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
      size="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={isEditing ? 'Editar Empresa' : 'Crear Empresa'}
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <FilterLabel>Nombre de la Empresa</FilterLabel>
              <Input
                value={formData.nombre || ''}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Ingresa el nombre de la empresa"
                error={errors.nombre}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Descripción</FilterLabel>
              <Textarea
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
          <div>
            <FilterLabel>KAM Asignado</FilterLabel>
            <UserSelectorWithAvatar
              value={formData.kam_id || ''}
              onChange={(value) => handleInputChange('kam_id', value)}
              placeholder="Selecciona un KAM"
              users={Array.isArray(usuarios) ? usuarios.filter(u => u.activo !== false).map(u => ({
                id: u.id,
                full_name: u.full_name || u.nombre || 'Sin nombre',
                email: u.email || u.correo || 'sin-email@ejemplo.com',
                avatar_url: u.avatar_url
              })) : []}
              loading={loading}
            />
          </div>
        </div>

        {/* Información de ubicación */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FilterLabel>País</FilterLabel>
              <Select
                value={formData.pais_id || ''}
                onChange={(value) => handleInputChange('pais_id', value)}
                options={[
                  { value: '', label: 'Seleccionar país' },
                  ...safeFilterOptions.paises
                ]}
                placeholder="Selecciona un país"
                error={errors.pais_id}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Tamaño</FilterLabel>
              <Select
                value={formData.tamano_id || ''}
                onChange={(value) => handleInputChange('tamano_id', value)}
                options={[
                  { value: '', label: 'Seleccionar tamaño' },
                  ...safeFilterOptions.tamanos
                ]}
                placeholder="Selecciona un tamaño"
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Relación</FilterLabel>
              <Select
                value={formData.relacion_id || ''}
                onChange={(value) => handleInputChange('relacion_id', value)}
                options={[
                  { value: '', label: 'Seleccionar relación' },
                  ...safeFilterOptions.relaciones
                ]}
                placeholder="Selecciona una relación"
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Catálogo de Productos</FilterLabel>
              <MultiSelect
                value={formData.productos_ids || []}
                onChange={(value) => handleInputChange('productos_ids', value)}
                options={safeFilterOptions.productos}
                placeholder="Selecciona productos del catálogo"
                fullWidth
                maxDisplayed={3}
              />
            </div>

            <div>
              <FilterLabel>Industria</FilterLabel>
              <Select
                value={formData.industria_id || ''}
                onChange={(value) => handleInputChange('industria_id', value)}
                options={[
                  { value: '', label: 'Seleccionar industria' },
                  ...safeFilterOptions.industrias
                ]}
                placeholder="Selecciona una industria"
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Modalidad</FilterLabel>
              <Select
                value={formData.modalidad_id || ''}
                onChange={(value) => handleInputChange('modalidad_id', value)}
                options={[
                  { value: '', label: 'Seleccionar modalidad' },
                  ...safeFilterOptions.modalidades
                ]}
                placeholder="Selecciona una modalidad"
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-4">
          <div>
            <FilterLabel>Estado de la Empresa</FilterLabel>
            <Select
              value={formData.estado_id || ''}
              onChange={(value) => handleInputChange('estado_id', value)}
              options={[
                { value: '', label: 'Seleccionar estado' },
                ...safeFilterOptions.estados
              ]}
              placeholder="Selecciona un estado"
              fullWidth
            />
          </div>
        </div>

        </form>
      </div>
    </SideModal>
  );
}
