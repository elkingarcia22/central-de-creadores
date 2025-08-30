import React, { useState, useEffect } from 'react';
import { Modal, Button, TextField, Select, Option, Typography, Chip } from './index';
import { CategoriaDolor, DolorParticipanteCompleto, CrearDolorRequest, ActualizarDolorRequest, SeveridadDolor, EstadoDolor } from '../../types/dolores';

interface DolorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participanteId: string;
  dolor?: DolorParticipanteCompleto | null;
  onSave: (dolor: CrearDolorRequest | ActualizarDolorRequest) => void;
  loading?: boolean;
}

export const DolorModal: React.FC<DolorModalProps> = ({
  isOpen,
  onClose,
  participanteId,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria_id || !formData.titulo.trim()) {
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
  };

  const getCategoriaSeleccionada = () => {
    return categorias.find(cat => cat.id === formData.categoria_id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Dolor' : 'Crear Nuevo Dolor'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Categoría */}
        <div>
          <Typography variant="label" className="mb-2 block">
            Categoría *
          </Typography>
          <Select
            value={formData.categoria_id}
            onChange={(value) => handleInputChange('categoria_id', value)}
            placeholder="Seleccionar categoría"
            required
          >
            {categorias.map((categoria) => (
              <Option key={categoria.id} value={categoria.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: categoria.color }}
                  />
                  <span>{categoria.nombre}</span>
                </div>
              </Option>
            ))}
          </Select>
          {getCategoriaSeleccionada() && (
            <Typography variant="caption" color="secondary" className="mt-1">
              {getCategoriaSeleccionada()?.descripcion}
            </Typography>
          )}
        </div>

        {/* Título */}
        <div>
          <Typography variant="label" className="mb-2 block">
            Título *
          </Typography>
          <TextField
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Describe brevemente el dolor o necesidad"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <Typography variant="label" className="mb-2 block">
            Descripción
          </Typography>
          <TextField
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Describe en detalle el dolor, contexto y posibles soluciones"
            multiline
            rows={4}
          />
        </div>

        {/* Severidad */}
        <div>
          <Typography variant="label" className="mb-2 block">
            Severidad
          </Typography>
          <Select
            value={formData.severidad}
            onChange={(value) => handleInputChange('severidad', value)}
          >
            <Option value={SeveridadDolor.BAJA}>
              <div className="flex items-center gap-2">
                <Chip variant="success" size="sm">Baja</Chip>
                <span>Baja - Poca urgencia</span>
              </div>
            </Option>
            <Option value={SeveridadDolor.MEDIA}>
              <div className="flex items-center gap-2">
                <Chip variant="warning" size="sm">Media</Chip>
                <span>Media - Moderada urgencia</span>
              </div>
            </Option>
            <Option value={SeveridadDolor.ALTA}>
              <div className="flex items-center gap-2">
                <Chip variant="error" size="sm">Alta</Chip>
                <span>Alta - Alta urgencia</span>
              </div>
            </Option>
            <Option value={SeveridadDolor.CRITICA}>
              <div className="flex items-center gap-2">
                <Chip variant="error" size="sm">Crítica</Chip>
                <span>Crítica - Máxima urgencia</span>
              </div>
            </Option>
          </Select>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.categoria_id || !formData.titulo.trim()}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
