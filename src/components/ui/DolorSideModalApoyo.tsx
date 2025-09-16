import React, { useState, useEffect, useRef } from 'react';
import { SideModal, Typography, Button, Input, Textarea, Select, Chip, PageHeader, FilterLabel } from './index';
import { CategoriaDolor, DolorParticipanteCompleto, CrearDolorRequest, ActualizarDolorRequest, SeveridadDolor, EstadoDolor } from '../../types/dolores';
import { SaveIcon, XIcon } from '../icons';

interface DolorSideModalApoyoProps {
  isOpen: boolean;
  onClose: () => void;
  participanteId: string;
  participanteNombre?: string;
  dolor?: DolorParticipanteCompleto | null;
  onSave: (dolor: CrearDolorRequest | ActualizarDolorRequest) => Promise<void>;
  loading?: boolean;
  readOnly?: boolean; // Nueva prop para modo solo lectura
  onEdit?: () => void; // Nueva prop para cambiar a modo edición
}

export const DolorSideModalApoyo: React.FC<DolorSideModalApoyoProps> = ({
  isOpen,
  onClose,
  participanteId,
  participanteNombre = '',
  dolor,
  onSave,
  loading = false,
  readOnly = false,
  onEdit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaDolor[]>([]);
  const [formData, setFormData] = useState<CrearDolorRequest>({
    categoria_id: '',
    titulo: '',
    descripcion: '',
    severidad: SeveridadDolor.MEDIA,
    investigacion_relacionada_id: '' // Vacío para sesiones de apoyo
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isEditing = !!dolor;

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
      setIsSubmitting(false);
    }
  }, [isOpen, participanteId]);

  // Cargar datos del dolor si estamos editando
  useEffect(() => {
    if (dolor && isOpen) {
      const newFormData = {
        categoria_id: dolor.categoria_id || '',
        titulo: dolor.titulo || '',
        descripcion: dolor.descripcion || '',
        severidad: dolor.severidad || SeveridadDolor.MEDIA,
        investigacion_relacionada_id: '', // No hay investigación en sesiones de apoyo
        sesion_relacionada_id: dolor.sesion_relacionada_id || ''
      };
      setFormData(newFormData);
    } else if (!dolor && isOpen) {
      // Resetear formulario para nuevo dolor
      setFormData({
        categoria_id: '',
        titulo: '',
        descripcion: '',
        severidad: SeveridadDolor.MEDIA,
        investigacion_relacionada_id: '' // No hay investigación en sesiones de apoyo
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
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && dolor) {
        await onSave({
          id: dolor.id || '',
          ...formData
        } as ActualizarDolorRequest);
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
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

  // Footer para el modal
  const footer = (
    <div className="flex gap-4 px-2">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex-1"
      >
        Cancelar
      </Button>
      {readOnly ? (
        <Button
          variant="primary"
          onClick={onEdit}
          disabled={isSubmitting}
          className="flex-1"
        >
          Editar
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          icon={<SaveIcon className="w-4 h-4" />}
          className="flex-1"
        >
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Dolor' : 'Crear Dolor')}
        </Button>
      )}
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={readOnly ? 'Ver Dolor' : (isEditing ? 'Editar Dolor de Apoyo' : 'Nuevo Dolor de Apoyo')}
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
          icon={<XIcon className="w-5 h-5" />}
        />

        {/* Información del participante */}
        {participanteNombre && (
          <div className="bg-muted/50 rounded-lg p-4">
            <Typography variant="body2" color="secondary" className="mb-1">
              Participante
            </Typography>
            <Typography variant="body1" className="font-medium">
              {participanteNombre}
            </Typography>
          </div>
        )}

        <form className="space-y-6">
          {/* Categoría */}
          <div>
            <FilterLabel>Categoría *</FilterLabel>
            <Select
              value={formData.categoria_id}
              onChange={(value) => handleInputChange('categoria_id', value)}
              options={categoriaOptions}
              placeholder="Seleccionar categoría"
              disabled={isSubmitting || readOnly}
              required
              fullWidth
            />
            {errors.categoria_id && (
              <Typography variant="caption" color="destructive" className="mt-1">
                {errors.categoria_id}
              </Typography>
            )}
          </div>

          {/* Título */}
          <div>
            <FilterLabel>Título *</FilterLabel>
            <Input
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Título del dolor o problema identificado"
              disabled={isSubmitting || readOnly}
              required
              fullWidth
            />
            {errors.titulo && (
              <Typography variant="caption" color="destructive" className="mt-1">
                {errors.titulo}
              </Typography>
            )}
          </div>

          {/* Descripción */}
          <div>
            <FilterLabel>Descripción *</FilterLabel>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe detalladamente el dolor, problema o necesidad identificada durante la sesión de apoyo"
              rows={6}
              disabled={isSubmitting || readOnly}
              required
              fullWidth
            />
            {errors.descripcion && (
              <Typography variant="caption" color="destructive" className="mt-1">
                {errors.descripcion}
              </Typography>
            )}
          </div>

          {/* Severidad */}
          <div>
            <FilterLabel>Severidad *</FilterLabel>
            <Select
              value={formData.severidad}
              onChange={(value) => handleInputChange('severidad', value)}
              options={severidadOptions}
              placeholder="Seleccionar severidad"
              disabled={isSubmitting || readOnly}
              required
              fullWidth
            />
            {formData.severidad && (
              <div className="mt-2">
                <Chip
                  variant={getSeveridadColor(formData.severidad)}
                  size="sm"
                >
                  {severidadOptions.find(opt => opt.value === formData.severidad)?.label}
                </Chip>
              </div>
            )}
          </div>

          {/* Información adicional para sesiones de apoyo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <Typography variant="body2" className="text-blue-800 dark:text-blue-200">
              💡 <strong>Nota:</strong> Este dolor se registra en el contexto de una sesión de apoyo. 
              No está asociado a una investigación específica, sino que forma parte del seguimiento general del participante.
            </Typography>
          </div>
        </form>
      </div>
    </SideModal>
  );
};

export default DolorSideModalApoyo;
