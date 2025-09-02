import React, { useState, useEffect, useRef } from 'react';
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
  readOnly?: boolean; // Nueva prop para modo solo lectura
  onEdit?: () => void; // Nueva prop para cambiar a modo edición
}

export const DolorSideModal: React.FC<DolorSideModalProps> = ({
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
  const isSubmittingRef = useRef(false);
  const submissionIdRef = useRef<string | null>(null);
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
      setIsSubmitting(false); // Resetear estado de envío al abrir
      isSubmittingRef.current = false; // Resetear ref al abrir
      submissionIdRef.current = null; // Resetear submission ID al abrir
    } else {
      // Resetear estado cuando se cierre el modal
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      submissionIdRef.current = null;
    }
  }, [isOpen, participanteId]);

  // Cargar datos del dolor si estamos editando
  useEffect(() => {
    console.log('🔍 DolorSideModal useEffect - dolor:', dolor);
    console.log('🔍 DolorSideModal useEffect - isOpen:', isOpen);
    console.log('🔍 DolorSideModal useEffect - readOnly:', readOnly);
    
    if (dolor && isOpen) {
      console.log('🔍 Configurando formulario para edición con dolor:', dolor);
      const newFormData = {
        categoria_id: dolor.categoria_id,
        titulo: dolor.titulo,
        descripcion: dolor.descripcion || '',
        severidad: dolor.severidad,
        investigacion_relacionada_id: dolor.investigacion_relacionada_id || '',
        sesion_relacionada_id: dolor.sesion_relacionada_id
      };
      console.log('🔍 Nuevo formData configurado:', newFormData);
      setFormData(newFormData);
    } else if (!dolor && isOpen) {
      console.log('🔍 Configurando formulario para nuevo dolor');
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
      
      // Por ahora, usar una lista vacía para evitar errores
      // TODO: Implementar carga de investigaciones cuando la API esté estable
      setInvestigaciones([]);
      
      // Intentar cargar investigaciones si la API está disponible
      try {
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
          console.log('⚠️ API de investigaciones no disponible, usando lista vacía');
          setInvestigaciones([]);
        }
      } catch (error) {
        console.log('⚠️ Error cargando investigaciones, usando lista vacía:', error);
        setInvestigaciones([]);
      }
    } catch (error) {
      console.error('❌ Error en cargarInvestigaciones:', error);
      setInvestigaciones([]);
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
    const currentSubmissionId = new Date().toISOString() + Math.random().toString(36).substr(2, 9);
    
    console.log('🔍 handleSubmit llamado');
    console.log('🔍 Timestamp:', new Date().toISOString());
    console.log('🔍 Submission ID:', currentSubmissionId);
    console.log('🔍 formData:', formData);
    console.log('🔍 isEditing:', isEditing);
    console.log('🔍 isSubmitting:', isSubmitting);
    console.log('🔍 isSubmittingRef.current:', isSubmittingRef.current);
    console.log('🔍 submissionIdRef.current:', submissionIdRef.current);
    
    // PROTECCIÓN SIMPLE: Si ya se está enviando, NO HACER NADA
    if (isSubmitting || isSubmittingRef.current) {
      console.log('❌ PROTECCIÓN: Ya se está enviando, IGNORANDO');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }

    console.log('✅ Validación exitosa, llamando onSave');
    
    // BLOQUEAR INMEDIATAMENTE
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    submissionIdRef.current = currentSubmissionId;
    
    try {
      if (isEditing && dolor) {
        onSave({
          id: dolor.id,
          ...formData
        } as ActualizarDolorRequest);
      } else {
        onSave(formData);
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      submissionIdRef.current = null;
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
  console.log('🔍 DolorSideModal render - readOnly:', readOnly);
  console.log('🔍 DolorSideModal render - isEditing:', isEditing);
  console.log('🔍 DolorSideModal render - dolor:', dolor);
  console.log('🔍 DolorSideModal render - formData:', formData);



  // Footer para el modal
  const footer = (
    <div className="flex gap-4 px-2">
      {readOnly ? (
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              if (onEdit) {
                onEdit();
              }
            }}
            className="flex-1"
          >
            Editar
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading || isSubmitting}
            disabled={loading || isSubmitting}
            className="flex-1"
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={readOnly ? 'Ver Dolor' : (isEditing ? 'Editar Dolor' : 'Crear Dolor')}
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

        {/* Contenido del modal */}
        {readOnly ? (
          // Modo solo lectura - mostrar información como texto
          <div className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              {/* Categoría */}
              <div>
                <FilterLabel>Categoría</FilterLabel>
                <Typography variant="body2" className="mt-1">
                  {getCategoriaSeleccionada()?.nombre || 'No especificada'}
                </Typography>
                {getCategoriaSeleccionada()?.descripcion && (
                  <Typography variant="caption" className="text-muted-foreground mt-1 block">
                    {getCategoriaSeleccionada()?.descripcion}
                  </Typography>
                )}
              </div>

              {/* Título */}
              <div>
                <FilterLabel>Título</FilterLabel>
                <Typography variant="body2" className="mt-1">
                  {formData.titulo || 'No especificado'}
                </Typography>
              </div>

              {/* Descripción */}
              <div>
                <FilterLabel>Descripción</FilterLabel>
                <Typography variant="body2" className="mt-1">
                  {formData.descripcion || 'No especificada'}
                </Typography>
              </div>

              {/* Severidad */}
              <div>
                <FilterLabel>Severidad</FilterLabel>
                <div className="mt-1">
                  <Chip variant={getSeveridadColor(formData.severidad as SeveridadDolor) as any}>
                    {severidadOptions.find(opt => opt.value === formData.severidad)?.label}
                  </Chip>
                </div>
              </div>

              {/* Investigación relacionada */}
              <div>
                <FilterLabel>Investigación Relacionada</FilterLabel>
                <Typography variant="body2" className="mt-1">
                  {formData.investigacion_relacionada_id ? 
                    investigacionOptions.find(opt => opt.value === formData.investigacion_relacionada_id)?.label || 'No encontrada' :
                    'No especificada'
                  }
                </Typography>
              </div>
            </div>
          </div>
        ) : (
          // Modo edición - mostrar formulario
          <form className="space-y-6">
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
        )}
      </div>
    </SideModal>
  );
};
