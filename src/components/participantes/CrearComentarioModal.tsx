// =====================================================
// MODAL PARA CREAR COMENTARIOS DE PARTICIPANTES
// =====================================================

import React, { useState } from 'react';
import { SideModal } from '../ui/SideModal';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import Select from '../ui/Select';
import Chip from '../ui/Chip';
import Typography from '../ui/Typography';
import { FormContainer, FormItem } from '../ui/FormContainer';
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

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Comentario de Perfil"
      width="lg"
      closeOnOverlayClick={false}
      footer={
        <div className="flex gap-3">
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
            loading={loading}
            icon={<SaveIcon className="w-4 h-4" />}
          >
            Guardar Comentario
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Información del participante */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-gray-500" />
            <div>
              <Typography variant="body2" weight="medium" className="text-gray-700 dark:text-gray-300">
                Participante
              </Typography>
              <Typography variant="body1" className="text-gray-900 dark:text-gray-100">
                {participanteNombre}
              </Typography>
            </div>
          </div>
        </div>

        <FormContainer onSubmit={handleSubmit}>
          {/* Información básica */}
          <div className="space-y-4">
            <Typography variant="h4" weight="semibold" className="text-gray-900 dark:text-gray-100">
              Información Básica
            </Typography>
            
            <FormItem label="Título del comentario" required>
              <Input
                placeholder="Ej: Primera reunión de presentación"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                required
              />
            </FormItem>

            <FormItem label="Descripción">
              <Textarea
                placeholder="Describe el contexto o situación del comentario..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
              />
            </FormItem>
          </div>

          {/* Categorías de perfil */}
          <div className="space-y-6">
            <Typography variant="h4" weight="semibold" className="text-gray-900 dark:text-gray-100">
              Perfil del Cliente
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem label="Estilo de Comunicación">
                <Select
                  placeholder="Seleccionar estilo..."
                  options={OPCIONES_ESTILO_COMUNICACION}
                  value={formData.estilo_comunicacion}
                  onChange={(value) => handleInputChange('estilo_comunicacion', value)}
                />
              </FormItem>

              <FormItem label="Toma de Decisiones">
                <Select
                  placeholder="Seleccionar tipo..."
                  options={OPCIONES_TOMA_DECISIONES}
                  value={formData.toma_decisiones}
                  onChange={(value) => handleInputChange('toma_decisiones', value)}
                />
              </FormItem>

              <FormItem label="Relación con Proveedores">
                <Select
                  placeholder="Seleccionar tipo..."
                  options={OPCIONES_RELACION_PROVEEDORES}
                  value={formData.relacion_proveedores}
                  onChange={(value) => handleInputChange('relacion_proveedores', value)}
                />
              </FormItem>

              <FormItem label="Cultura Organizacional">
                <Select
                  placeholder="Seleccionar cultura..."
                  options={OPCIONES_CULTURA_ORGANIZACIONAL}
                  value={formData.cultura_organizacional}
                  onChange={(value) => handleInputChange('cultura_organizacional', value)}
                />
              </FormItem>

              <FormItem label="Nivel de Apertura">
                <Select
                  placeholder="Seleccionar nivel..."
                  options={OPCIONES_NIVEL_APERTURA}
                  value={formData.nivel_apertura}
                  onChange={(value) => handleInputChange('nivel_apertura', value)}
                />
              </FormItem>

              <FormItem label="Expectativas de Respuesta">
                <Select
                  placeholder="Seleccionar expectativa..."
                  options={OPCIONES_EXPECTATIVAS_RESPUESTA}
                  value={formData.expectativas_respuesta}
                  onChange={(value) => handleInputChange('expectativas_respuesta', value)}
                />
              </FormItem>

              <FormItem label="Tipo de Feedback">
                <Select
                  placeholder="Seleccionar tipo..."
                  options={OPCIONES_TIPO_FEEDBACK}
                  value={formData.tipo_feedback}
                  onChange={(value) => handleInputChange('tipo_feedback', value)}
                />
              </FormItem>

              <FormItem label="Motivación Principal">
                <Select
                  placeholder="Seleccionar motivación..."
                  options={OPCIONES_MOTIVACION_PRINCIPAL}
                  value={formData.motivacion_principal}
                  onChange={(value) => handleInputChange('motivacion_principal', value)}
                />
              </FormItem>
            </div>
          </div>

          {/* Observaciones y recomendaciones */}
          <div className="space-y-4">
            <Typography variant="h4" weight="semibold" className="text-gray-900 dark:text-gray-100">
              Observaciones y Recomendaciones
            </Typography>
            
            <FormItem label="Observaciones Adicionales">
              <Textarea
                placeholder="Observaciones específicas sobre el comportamiento o interacciones..."
                value={formData.observaciones_adicionales}
                onChange={(e) => handleInputChange('observaciones_adicionales', e.target.value)}
                rows={4}
              />
            </FormItem>

            <FormItem label="Recomendaciones">
              <Textarea
                placeholder="Recomendaciones para futuras interacciones..."
                value={formData.recomendaciones}
                onChange={(e) => handleInputChange('recomendaciones', e.target.value)}
                rows={4}
              />
            </FormItem>
          </div>

          {/* Etiquetas */}
          <div className="space-y-4">
            <Typography variant="h4" weight="semibold" className="text-gray-900 dark:text-gray-100">
              Etiquetas
            </Typography>
            
            <FormItem label="Agregar etiquetas">
              <div className="flex gap-2">
                <Input
                  placeholder="Nueva etiqueta..."
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleAgregarEtiqueta}
                  disabled={!nuevaEtiqueta.trim()}
                  icon={<TagIcon className="w-4 h-4" />}
                >
                  Agregar
                </Button>
              </div>
            </FormItem>

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
        </FormContainer>
      </div>
    </SideModal>
  );
};
