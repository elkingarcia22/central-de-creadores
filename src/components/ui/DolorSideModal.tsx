import React, { useState, useEffect } from 'react';
import { SideModal, Typography, Button, TextField, Select, Option, Chip } from './index';
import { CategoriaDolor, DolorParticipanteCompleto, CrearDolorRequest, ActualizarDolorRequest, SeveridadDolor, EstadoDolor } from '../../types/dolores';
import { SaveIcon, XIcon } from '../icons';

interface DolorSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  participanteId: string;
  participanteNombre?: string;
  dolor?: DolorParticipanteCompleto | null;
  onSave: (dolor: CrearDolorRequest | ActualizarDolorRequest) => void;
  loading?: boolean;
}

export const DolorSideModal: React.FC<DolorSideModalProps> = ({
  isOpen,
  onClose,
  participanteId,
  participanteNombre = '',
  dolor,
  onSave,
  loading = false
}) => {
  const [categorias, setCategorias] = useState<CategoriaDolor[]>([]);
  const [formData, setFormData] = useState<CrearDolorRequest>({
    categoria_id: '',
    titulo: '',
    descripcion: '',
    severidad: SeveridadDolor.MEDIA
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isEditing = !!dolor;

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
    }
  }, [isOpen]);

  // Cargar datos del dolor si estamos editando
  useEffect(() => {
    if (dolor && isOpen) {
      setFormData({
        categoria_id: dolor.categoria_id,
        titulo: dolor.titulo,
        descripcion: dolor.descripcion || '',
        severidad: dolor.severidad,
        investigacion_relacionada_id: dolor.investigacion_relacionada_id,
        sesion_relacionada_id: dolor.sesion_relacionada_id
      });
    } else if (!dolor && isOpen) {
      // Resetear formulario para nuevo dolor
      setFormData({
        categoria_id: '',
        titulo: '',
        descripcion: '',
        severidad: SeveridadDolor.MEDIA
      });
    }
    setErrors({});
  }, [dolor, isOpen]);

  const cargarCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-dolores');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
    }
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isEditing && dolor) {
      onSave({
        id: dolor.id,
        ...formData
      } as ActualizarDolorRequest);
    } else {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof CrearDolorRequest, value: any) => {
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

  const getCategoriaSeleccionada = () => {
    return categorias.find(cat => cat.id === formData.categoria_id);
  };

  const getSeveridadColor = (severidad: SeveridadDolor) => {
    switch (severidad) {
      case SeveridadDolor.BAJA: return 'success';
      case SeveridadDolor.MEDIA: return 'warning';
      case SeveridadDolor.ALTA: return 'destructive';
      default: return 'default';
    }
  };

  const severidadOptions = [
    { value: SeveridadDolor.BAJA, label: 'Baja' },
    { value: SeveridadDolor.MEDIA, label: 'Media' },
    { value: SeveridadDolor.ALTA, label: 'Alta' }
  ];

  const categoriaOptions = categorias.map(cat => ({
    value: cat.id,
    label: cat.nombre
  }));

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Dolor' : 'Crear Dolor'}
      width="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<SaveIcon className="w-4 h-4" />}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Información del participante */}
        {participanteNombre && (
          <div className="bg-muted/50 rounded-lg p-4">
            <Typography variant="subtitle" className="text-muted-foreground mb-1">
              Participante
            </Typography>
            <Typography variant="body" className="font-medium">
              {participanteNombre}
            </Typography>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categoría */}
          <div>
            <Select
              label="Categoría *"
              options={categoriaOptions}
              value={formData.categoria_id}
              onChange={(value) => handleInputChange('categoria_id', value)}
              placeholder="Seleccionar categoría"
              error={!!errors.categoria_id}
              required
            />
            {errors.categoria_id && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.categoria_id}
              </Typography>
            )}
            {getCategoriaSeleccionada() && (
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {getCategoriaSeleccionada()?.descripcion}
              </Typography>
            )}
          </div>

          {/* Título */}
          <div>
            <TextField
              label="Título *"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Describe brevemente el dolor o necesidad"
              error={!!errors.titulo}
              required
            />
            {errors.titulo && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.titulo}
              </Typography>
            )}
          </div>

          {/* Descripción */}
          <div>
            <TextField
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe en detalle el dolor o necesidad"
              multiline
              rows={4}
            />
          </div>

          {/* Severidad */}
          <div>
            <Select
              label="Severidad"
              options={severidadOptions}
              value={formData.severidad}
              onChange={(value) => handleInputChange('severidad', value)}
              placeholder="Seleccionar severidad"
            />
            <div className="mt-2">
              <Chip variant={getSeveridadColor(formData.severidad) as any}>
                {severidadOptions.find(opt => opt.value === formData.severidad)?.label}
              </Chip>
            </div>
          </div>
        </form>
      </div>
    </SideModal>
  );
};
