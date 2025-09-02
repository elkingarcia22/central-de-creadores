// =====================================================
// MODAL PARA CREAR COMENTARIOS DE PARTICIPANTES
// =====================================================

import React, { useState } from 'react';
import SideModal from '../ui/SideModal';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Chip from '../ui/Chip';
import Typography from '../ui/Typography';
import { PageHeader } from '../ui/PageHeader';
import FilterLabel from '../ui/FilterLabel';
import { ContainerTitle } from '../ui/ContainerTitle';
import { 
  MessageIcon, 
  UserIcon,
  SaveIcon,
  XIcon
} from '../icons';
import { 
  ComentarioParticipanteForm,
  OPCIONES_ESTILO_COMUNICACION,
  OPCIONES_TOMA_DECISIONES,
  OPCIONES_RELACION_PROVEEDORES,
  OPCIONES_CULTURA_ORGANIZACIONAL,
  OPCIONES_NIVEL_APERTURA,
  OPCIONES_EXPECTATIVAS_RESPUESTA,
  OPCIONES_TIPO_FEEDBACK,
  OPCIONES_MOTIVACION_PRINCIPAL,
  obtenerColorCategoria
} from '../../types/comentarios';

interface CrearComentarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  participanteId: string;
  participanteNombre: string;
  onSubmit: (comentario: ComentarioParticipanteForm) => Promise<void>;
  loading?: boolean;
}

export const CrearComentarioModal: React.FC<CrearComentarioModalProps> = ({
  isOpen,
  onClose,
  participanteId,
  participanteNombre,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<ComentarioParticipanteForm>({
    participante_id: participanteId,
    titulo: '',
    descripcion: '',
    estilo_comunicacion: undefined,
    toma_decisiones: undefined,
    relacion_proveedores: undefined,
    cultura_organizacional: undefined,
    nivel_apertura: undefined,
    expectativas_respuesta: undefined,
    tipo_feedback: undefined,
    motivacion_principal: undefined,
    observaciones_adicionales: '',
    recomendaciones: '',
    etiquetas: []
  });

  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');

  const handleInputChange = (field: keyof ComentarioParticipanteForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() && !formData.etiquetas?.includes(nuevaEtiqueta.trim())) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...(prev.etiquetas || []), nuevaEtiqueta.trim()]
      }));
      setNuevaEtiqueta('');
    }
  };

  const handleEliminarEtiqueta = (etiqueta: string) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas?.filter(e => e !== etiqueta) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }
    
    try {
      await onSubmit(formData);
      // Limpiar formulario después de enviar
      setFormData({
        participante_id: participanteId,
        titulo: '',
        descripcion: '',
        estilo_comunicacion: undefined,
        toma_decisiones: undefined,
        relacion_proveedores: undefined,
        cultura_organizacional: undefined,
        nivel_apertura: undefined,
        expectativas_respuesta: undefined,
        tipo_feedback: undefined,
        motivacion_principal: undefined,
        observaciones_adicionales: '',
        recomendaciones: '',
        etiquetas: []
      });
      onClose();
    } catch (error) {
      console.error('Error al crear comentario:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgregarEtiqueta();
    }
  };

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
        Guardar Comentario
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
          title="Crear Comentario de Perfil"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        {/* Información del participante */}
        <div className="bg-muted/50 rounded-lg p-4">
          <FilterLabel>Participante</FilterLabel>
          <Typography variant="body1" className="font-medium mt-1">
            {participanteNombre}
          </Typography>
        </div>

        {/* Formulario */}
        <form className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <ContainerTitle title="Información Básica" />
            
            <div>
              <FilterLabel>Título del comentario *</FilterLabel>
              <Input
                placeholder="Ej: Primera reunión de presentación"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Descripción</FilterLabel>
              <Textarea
                placeholder="Describe el contexto o situación del comentario..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                fullWidth
              />
            </div>
          </div>

          {/* Categorías de perfil */}
          <div className="space-y-4">
            <ContainerTitle title="Perfil del Cliente" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FilterLabel>Estilo de Comunicación</FilterLabel>
                <Select
                  placeholder="Seleccionar estilo..."
                  options={OPCIONES_ESTILO_COMUNICACION}
                  value={formData.estilo_comunicacion}
                  onChange={(value) => handleInputChange('estilo_comunicacion', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Toma de Decisiones</FilterLabel>
                <Select
                  placeholder="Seleccionar tipo..."
                  options={OPCIONES_TOMA_DECISIONES}
                  value={formData.toma_decisiones}
                  onChange={(value) => handleInputChange('toma_decisiones', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Relación con Proveedores</FilterLabel>
                <Select
                  placeholder="Seleccionar tipo..."
                  options={OPCIONES_RELACION_PROVEEDORES}
                  value={formData.relacion_proveedores}
                  onChange={(value) => handleInputChange('relacion_proveedores', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Cultura Organizacional</FilterLabel>
                <Select
                  placeholder="Seleccionar cultura..."
                  options={OPCIONES_CULTURA_ORGANIZACIONAL}
                  value={formData.cultura_organizacional}
                  onChange={(value) => handleInputChange('cultura_organizacional', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Nivel de Apertura</FilterLabel>
                <Select
                  placeholder="Seleccionar nivel..."
                  options={OPCIONES_NIVEL_APERTURA}
                  value={formData.nivel_apertura}
                  onChange={(value) => handleInputChange('nivel_apertura', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Expectativas de Respuesta</FilterLabel>
                <Select
                  placeholder="Seleccionar expectativa..."
                  options={OPCIONES_EXPECTATIVAS_RESPUESTA}
                  value={formData.expectativas_respuesta}
                  onChange={(value) => handleInputChange('expectativas_respuesta', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Tipo de Feedback</FilterLabel>
                <Select
                  placeholder="Seleccionar tipo..."
                  options={OPCIONES_TIPO_FEEDBACK}
                  value={formData.tipo_feedback}
                  onChange={(value) => handleInputChange('tipo_feedback', value)}
                  fullWidth
                />
              </div>

              <div>
                <FilterLabel>Motivación Principal</FilterLabel>
                <Select
                  placeholder="Seleccionar motivación..."
                  options={OPCIONES_MOTIVACION_PRINCIPAL}
                  value={formData.motivacion_principal}
                  onChange={(value) => handleInputChange('motivacion_principal', value)}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* Observaciones y recomendaciones */}
          <div className="space-y-4">
            <ContainerTitle title="Observaciones y Recomendaciones" />
            
            <div>
              <FilterLabel>Observaciones Adicionales</FilterLabel>
              <Textarea
                placeholder="Observaciones específicas sobre el comportamiento o interacciones..."
                value={formData.observaciones_adicionales}
                onChange={(e) => handleInputChange('observaciones_adicionales', e.target.value)}
                rows={4}
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Recomendaciones</FilterLabel>
              <Textarea
                placeholder="Recomendaciones para futuras interacciones..."
                value={formData.recomendaciones}
                onChange={(e) => handleInputChange('recomendaciones', e.target.value)}
                rows={4}
                fullWidth
              />
            </div>
          </div>

          {/* Etiquetas */}
          <div className="space-y-4">
            <ContainerTitle title="Etiquetas" />
            
            <div>
              <FilterLabel>Agregar etiquetas</FilterLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Nueva etiqueta..."
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  fullWidth
                />
                <Button
                  variant="secondary"
                  onClick={handleAgregarEtiqueta}
                  disabled={!nuevaEtiqueta.trim()}
                >
                  Agregar
                </Button>
              </div>
            </div>

            {/* Mostrar etiquetas existentes */}
            {formData.etiquetas && formData.etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.etiquetas.map((etiqueta, index) => (
                  <Chip
                    key={index}
                    variant="outline"
                    size="sm"
                    onRemove={() => handleEliminarEtiqueta(etiqueta)}
                  >
                    {etiqueta}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </SideModal>
  );
};
