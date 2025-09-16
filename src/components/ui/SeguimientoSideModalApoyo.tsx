import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import SideModal from './SideModal';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Typography from './Typography';
import UserSelectorWithAvatar from './UserSelectorWithAvatar';
import DatePicker from './DatePicker';
import { PageHeader } from './';
import FilterLabel from './FilterLabel';
import { SaveIcon, ClipboardListIcon } from '../icons';
import type { SeguimientoFormData } from '../../types/seguimientos';

interface SeguimientoSideModalApoyoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SeguimientoFormData) => Promise<void>;
  usuarios: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  }>;
  responsablePorDefecto?: string | null;
  loading?: boolean;
  participanteExternoPrecargado?: {
    id: string;
    nombre: string;
    email: string;
    empresa_nombre?: string;
  };
}

const SeguimientoSideModalApoyo: React.FC<SeguimientoSideModalApoyoProps> = ({
  isOpen,
  onClose,
  onSave,
  usuarios,
  responsablePorDefecto,
  loading = false,
  participanteExternoPrecargado
}) => {
  console.log('🔍 [SeguimientoSideModalApoyo] Props recibidas:', {
    isOpen,
    usuarios: usuarios?.length || 0,
    responsablePorDefecto,
    participanteExternoPrecargado
  });
  
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<SeguimientoFormData>({
    investigacion_id: '', // Vacío para sesiones de apoyo
    fecha_seguimiento: '',
    notas: '',
    responsable_id: '',
    estado: 'pendiente',
    participante_externo_id: participanteExternoPrecargado?.id || ''
  });
  
  const [saving, setSaving] = useState(false);
  const [participantesExternos, setParticipantesExternos] = useState<any[]>([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(false);

  // Cargar participantes externos
  const cargarParticipantesExternos = async () => {
    setCargandoParticipantes(true);
    try {
      const response = await fetch('/api/participantes?tipo=externo');
      if (response.ok) {
        const data = await response.json();
        setParticipantesExternos(data);
      }
    } catch (error) {
      console.error('Error cargando participantes externos:', error);
    } finally {
      setCargandoParticipantes(false);
    }
  };

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Cargar participantes externos
      cargarParticipantesExternos();
      
      // Modo creación para sesiones de apoyo
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        investigacion_id: '', // No hay investigación en sesiones de apoyo
        fecha_seguimiento: today,
        notas: '',
        responsable_id: responsablePorDefecto || '',
        estado: 'pendiente',
        participante_externo_id: participanteExternoPrecargado?.id || ''
      });
    }
  }, [isOpen, responsablePorDefecto, participanteExternoPrecargado]);

  const handleInputChange = (field: keyof SeguimientoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones para sesiones de apoyo (sin investigación obligatoria)
    if (!formData.fecha_seguimiento) {
      showError('La fecha de seguimiento es requerida');
      return;
    }
    
    if (!formData.notas.trim()) {
      showError('Las notas son requeridas');
      return;
    }
    
    if (!formData.responsable_id) {
      showError('El responsable es requerido');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error guardando seguimiento:', error);
      showError(error.message || 'Error al guardar el seguimiento');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const isEditing = false; // Siempre es creación en sesiones de apoyo

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={saving}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={saving}
        loading={saving}
        icon={<SaveIcon className="w-4 h-4" />}
      >
        {saving ? 'Guardando...' : 'Guardar Seguimiento'}
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Nuevo Seguimiento de Apoyo"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={handleClose}
          icon={<ClipboardListIcon className="w-5 h-5" />}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del seguimiento */}
          <div className="space-y-4">
            <div>
              <FilterLabel>Fecha de Seguimiento *</FilterLabel>
              <DatePicker
                value={formData.fecha_seguimiento}
                onChange={(date) => handleInputChange('fecha_seguimiento', date ? date.toISOString().split('T')[0] : '')}
                disabled={saving}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Responsable *</FilterLabel>
              <UserSelectorWithAvatar
                users={usuarios}
                value={formData.responsable_id}
                onChange={(userId) => handleInputChange('responsable_id', userId)}
                placeholder="Seleccionar responsable"
                disabled={saving}
                required
              />
            </div>

            <div>
              <FilterLabel>Participante Externo</FilterLabel>
              <Select
                value={formData.participante_externo_id}
                onChange={(value) => handleInputChange('participante_externo_id', value)}
                options={[
                  { value: '', label: 'Sin participante externo' },
                  ...participantesExternos.map(participante => ({
                    value: participante.id,
                    label: `${participante.nombre} ${participante.empresa_nombre ? `(${participante.empresa_nombre})` : ''}`
                  }))
                ]}
                placeholder="Seleccionar participante externo (opcional)"
                disabled={saving || cargandoParticipantes}
                fullWidth
              />
            </div>
          </div>

          {/* Notas y descripción */}
          <div className="space-y-4">
            <div>
              <FilterLabel>Notas *</FilterLabel>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                placeholder="Describe los detalles del seguimiento de apoyo, avances, bloqueos, próximos pasos, etc."
                rows={8}
                required
                disabled={saving}
                fullWidth
              />
              <Typography variant="caption" color="secondary" className="mt-2">
                Describe el estado actual del apoyo, avances realizados, bloqueos encontrados y próximos pasos.
              </Typography>
            </div>
          </div>
        </form>
      </div>
    </SideModal>
  );
};

export default SeguimientoSideModalApoyo;
