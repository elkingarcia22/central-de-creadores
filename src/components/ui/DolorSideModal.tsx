import React, { useState, useEffect } from 'react';
import { SideModal, Typography, Button, Input, Textarea, Select, Chip, PageHeader, FilterLabel } from './index';
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
  const [investigaciones, setInvestigaciones] = useState<Array<{id: string, nombre: string}>>([]);
  const [formData, setFormData] = useState<CrearDolorRequest>({
    categoria_id: '',
    titulo: '',
    descripcion: '',
    severidad: SeveridadDolor.MEDIA,
    investigacion_relacionada_id: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isEditing = !!dolor;

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
      cargarInvestigaciones();
    }
  }, [isOpen, participanteId]);

  // Cargar datos del dolor si estamos editando
  useEffect(() => {
    if (dolor && isOpen) {
      setFormData({
        categoria_id: dolor.categoria_id,
        titulo: dolor.titulo,
        descripcion: dolor.descripcion || '',
        severidad: dolor.severidad,
        investigacion_relacionada_id: dolor.investigacion_relacionada_id || '',
        sesion_relacionada_id: dolor.sesion_relacionada_id
      });
    } else if (!dolor && isOpen) {
      // Resetear formulario para nuevo dolor
      setFormData({
        categoria_id: '',
        titulo: '',
        descripcion: '',
        severidad: SeveridadDolor.MEDIA,
        investigacion_relacionada_id: ''
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

  const cargarInvestigaciones = async () => {
    try {
      console.log('🔍 Cargando investigaciones para participante:', participanteId);
      const response = await fetch(`/api/participantes/${participanteId}/investigaciones`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Respuesta completa del API:', data);
        console.log('🔍 Investigaciones encontradas:', data.investigaciones?.length || 0);
        
        // Extraer solo las investigaciones del participante
        const investigacionesParticipante = data.investigaciones?.map((inv: any) => ({
          id: inv.id,
          nombre: inv.nombre
        })) || [];
        
        console.log('🔍 Investigaciones procesadas:', investigacionesParticipante);
        setInvestigaciones(investigacionesParticipante);
      } else {
        console.error('❌ Error en la respuesta del API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error cargando investigaciones:', error);
    }
  };

  const validateForm = () => {
    console.log('🔍 validateForm llamado');
    console.log('🔍 formData en validación:', formData);
    
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
      console.log('❌ Error: categoría requerida');
    }
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
      console.log('❌ Error: título requerido');
    }
    
    console.log('🔍 Errores encontrados:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🔍 handleSubmit llamado');
    console.log('🔍 formData:', formData);
    console.log('🔍 isEditing:', isEditing);
    
    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }

    console.log('✅ Validación exitosa, llamando onSave');
    
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

  const investigacionOptions = [
    { value: '', label: 'Sin investigación específica' },
    ...investigaciones.map(inv => ({
      value: inv.id,
      label: inv.nombre
    }))
  ];

  console.log('🔍 Opciones de investigación generadas:', investigacionOptions);

  // Footer del modal
  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        variant="ghost"
        onClick={onClose}
        disabled={loading}
      >
        <XIcon className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
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
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={isEditing ? 'Editar Dolor' : 'Crear Dolor'}
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        {/* Información del participante */}
        {participanteNombre && (
          <div className="bg-muted/50 rounded-lg p-4">
            <FilterLabel>Participante</FilterLabel>
            <Typography variant="body1" className="font-medium mt-1">
              {participanteNombre}
            </Typography>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            {/* Categoría */}
            <div>
              <FilterLabel>Categoría *</FilterLabel>
              <Select
                options={categoriaOptions}
                value={formData.categoria_id}
                onChange={(value) => handleInputChange('categoria_id', value)}
                placeholder="Seleccionar categoría"
                error={!!errors.categoria_id}
                required
                fullWidth
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
              <FilterLabel>Título *</FilterLabel>
              <Input
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Describe brevemente el dolor o necesidad"
                error={errors.titulo}
                required
                fullWidth
              />
              {errors.titulo && (
                <Typography variant="caption" className="text-destructive mt-1">
                  {errors.titulo}
                </Typography>
              )}
            </div>

            {/* Descripción */}
            <div>
              <FilterLabel>Descripción</FilterLabel>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Describe en detalle el dolor o necesidad"
                rows={4}
                fullWidth
              />
            </div>

            {/* Severidad */}
            <div>
              <FilterLabel>Severidad</FilterLabel>
              <Select
                options={severidadOptions}
                value={formData.severidad}
                onChange={(value) => handleInputChange('severidad', value)}
                placeholder="Seleccionar severidad"
                fullWidth
              />
              <div className="mt-2">
                <Chip variant={getSeveridadColor(formData.severidad as SeveridadDolor) as any}>
                  {severidadOptions.find(opt => opt.value === formData.severidad)?.label}
                </Chip>
              </div>
            </div>

            {/* Investigación relacionada */}
            <div>
              <FilterLabel>Investigación Relacionada</FilterLabel>
              <Select
                options={investigacionOptions}
                value={formData.investigacion_relacionada_id}
                onChange={(value) => handleInputChange('investigacion_relacionada_id', value)}
                placeholder="Seleccionar investigación (opcional)"
                fullWidth
              />
              {formData.investigacion_relacionada_id && (
                <Typography variant="caption" className="text-muted-foreground mt-1 block">
                  Este dolor estará vinculado a la investigación seleccionada
                </Typography>
              )}
            </div>
          </div>
        </form>
      </div>
    </SideModal>
  );
};
