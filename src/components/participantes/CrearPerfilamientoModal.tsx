// =====================================================
// MODAL PARA CREAR PERFILAMIENTO ESPECÍFICO
// =====================================================

import React, { useState, useEffect } from 'react';
import SideModal from '../ui/SideModal';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Chip from '../ui/Chip';
import Typography from '../ui/Typography';
import { PageHeader } from '../ui/PageHeader';
import FilterLabel from '../ui/FilterLabel';
import { 
  SaveIcon, 
  XIcon,
  UserIcon
} from '../icons';
import { 
  CategoriaPerfilamiento,
  PerfilamientoParticipanteForm,
  OPCIONES_POR_CATEGORIA,
  ETIQUETAS_CONTEXTO,
  obtenerNombreCategoria
} from '../../types/perfilamientos';
import { PerfilamientosService } from '../../api/supabase-perfilamientos';
import { useUser } from '../../contexts/UserContext';

interface CrearPerfilamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  participanteId: string;
  participanteNombre: string;
  categoria: CategoriaPerfilamiento;
  onSuccess: () => void;
  onBack?: () => void; // Nueva prop para volver atrás
  perfilamientoExistente?: PerfilamientoParticipanteForm; // Para edición
  descripcionPrecargada?: string; // Nueva prop para precargar observaciones desde nota
}

export const CrearPerfilamientoModal: React.FC<CrearPerfilamientoModalProps> = ({
  isOpen,
  onClose,
  participanteId,
  participanteNombre,
  categoria,
  onSuccess,
  onBack,
  perfilamientoExistente,
  descripcionPrecargada = ''
}) => {
  console.log('🔄 [PERFILAMIENTO] Componente renderizado con descripcionPrecargada:', descripcionPrecargada);
  const { userProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PerfilamientoParticipanteForm>({
    participante_id: participanteId,
    categoria_perfilamiento: categoria,
    valor_principal: '',
    observaciones: '',
    contexto_interaccion: '',
    etiquetas: [],
    confianza_observacion: 3
  });

  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');

  // Resetear formulario cuando cambie la categoría o cargar datos existentes para edición
  useEffect(() => {
    console.log('🔄 [PERFILAMIENTO] useEffect ejecutándose con:', {
      perfilamientoExistente: !!perfilamientoExistente,
      categoria,
      descripcionPrecargada,
      participanteId
    });
    
    if (perfilamientoExistente) {
      // Modo edición: cargar datos existentes
      console.log('🔄 [PERFILAMIENTO] Modo edición - cargando datos existentes');
      setFormData({
        participante_id: participanteId,
        categoria_perfilamiento: perfilamientoExistente.categoria_perfilamiento,
        valor_principal: perfilamientoExistente.valor_principal || '',
        observaciones: perfilamientoExistente.observaciones || '',
        contexto_interaccion: perfilamientoExistente.contexto_interaccion || '',
        etiquetas: perfilamientoExistente.etiquetas || [],
        confianza_observacion: perfilamientoExistente.confianza_observacion || 3
      });
    } else {
      // Modo creación: resetear formulario
      console.log('🔄 [PERFILAMIENTO] Modo creación - usando descripción precargada:', descripcionPrecargada);
      setFormData(prev => ({
        ...prev,
        categoria_perfilamiento: categoria,
        valor_principal: '',
        observaciones: descripcionPrecargada || '', // Usar descripción precargada si existe
        contexto_interaccion: '',
        etiquetas: [],
        confianza_observacion: 3
      }));
    }
  }, [categoria, perfilamientoExistente, participanteId, descripcionPrecargada]);

  const handleInputChange = (field: keyof PerfilamientoParticipanteForm, value: any) => {
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

  const handleEtiquetaPredefinida = (etiqueta: string) => {
    if (!formData.etiquetas?.includes(etiqueta)) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...(prev.etiquetas || []), etiqueta]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor_principal.trim()) {
      alert('El valor principal es obligatorio');
      return;
    }

    if (!userProfile?.id) {
      alert('Debes estar autenticado para crear un perfilamiento');
      return;
    }

    setLoading(true);
    
    try {
      const perfilamientoCompleto = {
        ...formData,
        usuario_perfilador_id: userProfile.id
      };

      let error;
      
      if (perfilamientoExistente) {
        // Modo edición
        const { error: updateError } = await PerfilamientosService.actualizarPerfilamiento(
          perfilamientoExistente.id || '',
          perfilamientoCompleto
        );
        error = updateError;
      } else {
        // Modo creación
        const { error: createError } = await PerfilamientosService.crearPerfilamiento(perfilamientoCompleto);
        error = createError;
      }
      
      if (error) {
        alert(`Error al ${perfilamientoExistente ? 'actualizar' : 'crear'} perfilamiento: ${error}`);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error inesperado:', error);
      alert(`Error inesperado al ${perfilamientoExistente ? 'actualizar' : 'crear'} perfilamiento`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgregarEtiqueta();
    }
  };

  const opcionesCategoria = OPCIONES_POR_CATEGORIA[categoria] || [];
  const nombreCategoria = categoria ? obtenerNombreCategoria(categoria) : 'Categoría';

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
        {perfilamientoExistente ? 'Actualizar' : 'Crear'} Perfilamiento
      </Button>
    </div>
  );

  // Validar que tengamos todos los datos necesarios
  if (!categoria || !participanteId || !participanteNombre) {
    return null;
  }

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
          title={`${perfilamientoExistente ? 'Editar' : 'Crear'} Perfilamiento - ${nombreCategoria}`}
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />
        
        {/* Botón de volver */}
        {onBack && (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver a categorías
            </Button>
          </div>
        )}

        {/* Información del participante */}
        <div className="bg-muted/50 rounded-lg p-4">
          <FilterLabel>Participante</FilterLabel>
          <Typography variant="body1" className="font-medium mt-1">
            {participanteNombre}
          </Typography>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Valor principal */}
          <div>
            <FilterLabel>Valor Principal *</FilterLabel>
            <Select
              placeholder={`Seleccionar ${nombreCategoria.toLowerCase()}...`}
              options={opcionesCategoria}
              value={formData.valor_principal}
              onChange={(value) => handleInputChange('valor_principal', value)}
              required
              fullWidth
            />
          </div>

          {/* Observaciones */}
          <div>
            <FilterLabel>Observaciones</FilterLabel>
            <Textarea
              placeholder="Describe específicamente qué observaste y en qué contexto..."
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={4}
              fullWidth
            />
          </div>

          {/* Contexto de interacción */}
          <div>
            <FilterLabel>Contexto de la Interacción</FilterLabel>
            <Textarea
              placeholder="Describe cuándo, dónde y cómo observaste este comportamiento..."
              value={formData.contexto_interaccion}
              onChange={(e) => handleInputChange('contexto_interaccion', e.target.value)}
              rows={3}
              fullWidth
            />
          </div>

          {/* Confianza en la observación */}
          <div>
            <FilterLabel>Confianza en la Observación</FilterLabel>
            <div className="space-y-2">
              <Select
                placeholder="Seleccionar nivel de confianza..."
                options={[
                  { value: '1', label: '1 - Muy baja confianza' },
                  { value: '2', label: '2 - Baja confianza' },
                  { value: '3', label: '3 - Confianza media' },
                  { value: '4', label: '4 - Alta confianza' },
                  { value: '5', label: '5 - Muy alta confianza' }
                ]}
                value={formData.confianza_observacion.toString()}
                onChange={(value) => handleInputChange('confianza_observacion', parseInt(value))}
                fullWidth
              />
              <Typography variant="caption" className="text-muted-foreground">
                ¿Qué tan seguro estás de esta observación? Esto ayuda a la IA a ponderar la información.
              </Typography>
            </div>
          </div>

          {/* Etiquetas */}
          <div className="space-y-4">
            <FilterLabel>Etiquetas de Contexto</FilterLabel>
            
            {/* Etiquetas predefinidas */}
            <div>
              <Typography variant="caption" className="text-muted-foreground mb-2 block">
                Etiquetas sugeridas:
              </Typography>
              <div className="flex flex-wrap gap-2">
                {ETIQUETAS_CONTEXTO.map((etiqueta) => (
                  <Chip
                    key={etiqueta}
                    outlined={true}
                    size="sm"
                    onClick={() => handleEtiquetaPredefinida(etiqueta)}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {etiqueta.replace('_', ' ')}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Agregar etiqueta personalizada */}
            <div>
              <Typography variant="caption" className="text-muted-foreground mb-2 block">
                Agregar etiqueta personalizada:
              </Typography>
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

            {/* Mostrar etiquetas seleccionadas */}
            {formData.etiquetas && formData.etiquetas.length > 0 && (
              <div>
                <Typography variant="caption" className="text-muted-foreground mb-2 block">
                  Etiquetas seleccionadas:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {formData.etiquetas.map((etiqueta, index) => (
                    <Chip
                      key={index}
                      outlined={true}
                      size="sm"
                      onRemove={() => handleEliminarEtiqueta(etiqueta)}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800"
                    >
                      {etiqueta.replace('_', ' ')}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </SideModal>
  );
};
