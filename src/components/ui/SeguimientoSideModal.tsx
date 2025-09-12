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
import type { SeguimientoInvestigacion, SeguimientoFormData } from '../../types/seguimientos';
import { ESTADOS_SEGUIMIENTO } from '../../types/seguimientos';

interface SeguimientoSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SeguimientoFormData) => Promise<void>;
  seguimiento?: SeguimientoInvestigacion | null;
  investigacionId: string;
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
  investigaciones?: Array<{
    id: string;
    nombre: string;
  }>;
}

const SeguimientoSideModal: React.FC<SeguimientoSideModalProps> = ({
  isOpen,
  onClose,
  onSave,
  seguimiento,
  investigacionId,
  usuarios,
  responsablePorDefecto,
  loading = false,
  participanteExternoPrecargado,
  investigaciones = []
}) => {
  console.log('🔍 [SeguimientoSideModal] Props recibidas:', {
    isOpen,
    seguimiento,
    investigacionId,
    usuarios: usuarios?.length || 0,
    responsablePorDefecto,
    investigaciones: investigaciones?.length || 0,
    investigacionesData: investigaciones
  });
  
  // Log específico para el responsable
  console.log('🔍 [SeguimientoSideModal] DEBUG RESPONSABLE:', {
    responsablePorDefecto,
    tipo: typeof responsablePorDefecto,
    usuariosDisponibles: usuarios?.map(u => ({ id: u.id, nombre: u.full_name })) || []
  });
  
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<SeguimientoFormData>({
    investigacion_id: investigacionId,
    fecha_seguimiento: '',
    notas: '',
    responsable_id: '',
    estado: 'pendiente',
    participante_externo_id: participanteExternoPrecargado?.id || ''
  });
  
  // Log adicional para debuggear el problema
  if (isOpen) {
    console.log('🔍 [SeguimientoSideModal] Modal abierto - Debug completo:', {
      investigacionId,
      investigaciones,
      usuarios: usuarios?.length || 0,
      formData: {
        investigacion_id: formData.investigacion_id,
        fecha_seguimiento: formData.fecha_seguimiento,
        responsable_id: formData.responsable_id,
        estado: formData.estado,
        participante_externo_id: formData.participante_externo_id
      }
    });
  }
  
  const [saving, setSaving] = useState(false);
  const [participantesExternos, setParticipantesExternos] = useState<any[]>([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(false);

  // Cargar participantes externos
  const cargarParticipantesExternos = async () => {
    try {
      setCargandoParticipantes(true);
      console.log('🔍 [SeguimientoSideModal] Cargando participantes externos...');
      const response = await fetch('/api/participantes');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [SeguimientoSideModal] Participantes externos cargados:', data?.length || 0);
        console.log('🔍 [SeguimientoSideModal] Datos de participantes:', data);
        
        // Si hay un participante pre-cargado, asegurarse de que esté en la lista
        let participantes = data || [];
        if (participanteExternoPrecargado) {
          const yaExiste = participantes.find(p => p.id === participanteExternoPrecargado.id);
          if (!yaExiste) {
            participantes = [participanteExternoPrecargado, ...participantes];
          }
        }
        
        setParticipantesExternos(participantes);
      } else {
        console.error('Error cargando participantes externos:', response.status);
      }
    } catch (error) {
      console.error('Error cargando participantes externos:', error);
    } finally {
      setCargandoParticipantes(false);
    }
  };

  // Actualizar formData cuando cambie el participante pre-cargado
  useEffect(() => {
    if (participanteExternoPrecargado) {
      setFormData(prev => ({
        ...prev,
        participante_externo_id: participanteExternoPrecargado.id
      }));
    }
  }, [participanteExternoPrecargado]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Cargar participantes externos
      cargarParticipantesExternos();
      
      if (seguimiento) {
        // Modo edición
        console.log('🔍 [SeguimientoSideModal] Modo edición - seguimiento recibido:', seguimiento);
        console.log('🔍 [SeguimientoSideModal] participante_externo_id:', seguimiento.participante_externo_id);
        console.log('🔍 [SeguimientoSideModal] participante_externo:', seguimiento.participante_externo);
        console.log('🔍 [SeguimientoSideModal] responsable_id:', seguimiento.responsable_id);
        console.log('🔍 [SeguimientoSideModal] usuarios disponibles:', usuarios);
        
        // Asegurar que participante_externo_id sea string
        const participanteId = seguimiento.participante_externo_id ? String(seguimiento.participante_externo_id) : '';
        console.log('🔍 [SeguimientoSideModal] participante_externo_id procesado:', participanteId);
        
        setFormData({
          investigacion_id: seguimiento.investigacion_id,
          fecha_seguimiento: seguimiento.fecha_seguimiento.split('T')[0], // Solo fecha
          notas: seguimiento.notas,
          responsable_id: seguimiento.responsable_id,
          estado: seguimiento.estado,
          participante_externo_id: participanteId
        });
      } else {
        // Modo creación
        const today = new Date().toISOString().split('T')[0];
        console.log('🔍 [SeguimientoSideModal] Modo creación - investigacionId:', investigacionId);
        console.log('🔍 [SeguimientoSideModal] Modo creación - investigaciones disponibles:', investigaciones);
        console.log('🔍 [SeguimientoSideModal] Modo creación - responsablePorDefecto:', responsablePorDefecto);
        console.log('🔍 [SeguimientoSideModal] Modo creación - usuarios disponibles:', usuarios?.length || 0);
        
        const responsableId = responsablePorDefecto || '';
        console.log('🔍 [SeguimientoSideModal] Modo creación - responsable_id final:', responsableId);
        
        setFormData({
          investigacion_id: investigacionId,
          fecha_seguimiento: today,
          notas: '',
          responsable_id: responsableId,
          estado: 'pendiente', // Siempre pendiente al crear
          participante_externo_id: participanteExternoPrecargado?.id || ''
        });
      }
    }
  }, [isOpen, seguimiento, investigacionId, responsablePorDefecto, participanteExternoPrecargado]);

  // Efecto adicional para actualizar responsable_id cuando se carguen los usuarios
  useEffect(() => {
    if (isOpen && seguimiento && usuarios.length > 0) {
      console.log('🔍 [SeguimientoSideModal] Usuarios cargados, actualizando responsable_id');
      console.log('🔍 [SeguimientoSideModal] responsable_id actual:', seguimiento.responsable_id);
      
      // Verificar si el responsable_id existe en los usuarios
      const responsableExiste = usuarios.find(user => user.id === seguimiento.responsable_id);
      console.log('🔍 [SeguimientoSideModal] responsable existe en usuarios:', responsableExiste);
      
      if (responsableExiste) {
        setFormData(prev => ({
          ...prev,
          responsable_id: seguimiento.responsable_id
        }));
      }
    }
  }, [isOpen, seguimiento, usuarios]);

  // Efecto para actualizar responsable cuando se carguen los usuarios en modo creación
  useEffect(() => {
    console.log('🔍 [SeguimientoSideModal] useEffect responsable - condiciones:', {
      isOpen,
      tieneSeguimiento: !!seguimiento,
      usuariosLength: usuarios.length,
      responsablePorDefecto,
      responsableActual: formData.responsable_id
    });
    
    if (isOpen && !seguimiento && usuarios.length > 0 && responsablePorDefecto) {
      console.log('🔍 [SeguimientoSideModal] Modo creación - usuarios cargados, verificando responsable precargado');
      console.log('🔍 [SeguimientoSideModal] responsablePorDefecto:', responsablePorDefecto);
      console.log('🔍 [SeguimientoSideModal] usuarios disponibles:', usuarios);
      
      // Verificar si el responsable precargado existe en los usuarios
      const responsableExiste = usuarios.find(user => user.id === responsablePorDefecto);
      console.log('🔍 [SeguimientoSideModal] responsable precargado existe en usuarios:', responsableExiste);
      
      if (responsableExiste && formData.responsable_id !== responsablePorDefecto) {
        console.log('🔍 [SeguimientoSideModal] Actualizando responsable_id a:', responsablePorDefecto);
        setFormData(prev => ({
          ...prev,
          responsable_id: responsablePorDefecto
        }));
      } else if (!responsableExiste) {
        console.log('⚠️ [SeguimientoSideModal] El responsable precargado no existe en la lista de usuarios');
      } else if (formData.responsable_id === responsablePorDefecto) {
        console.log('✅ [SeguimientoSideModal] El responsable ya está precargado correctamente');
      }
    }
  }, [isOpen, seguimiento, usuarios, responsablePorDefecto, formData.responsable_id]);

  const handleInputChange = (field: keyof SeguimientoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
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
      // Cerrar modal después de guardar exitosamente
      setTimeout(() => {
        onClose();
      }, 100); // Pequeño delay para asegurar que el toast se muestre
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

  const isEditing = !!seguimiento;

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={saving}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          const form = document.querySelector('form');
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
        }}
        loading={saving}
        disabled={saving}
        className="flex items-center gap-2"
      >
        <SaveIcon className="w-4 h-4" />
        {isEditing ? 'Actualizar' : 'Crear'} Seguimiento
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
          title={isEditing ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
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
                onChange={(e) => handleInputChange('fecha_seguimiento', e.target.value)}
                disabled={saving}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Investigación *</FilterLabel>
              <Select
                value={formData.investigacion_id}
                onChange={(value) => handleInputChange('investigacion_id', value)}
                options={(() => {
                  const options = investigaciones.map(inv => ({
                    value: inv.id,
                    label: inv.nombre
                  }));
                  console.log('🔍 [SeguimientoSideModal] Renderizando Select con:', {
                    value: formData.investigacion_id,
                    investigaciones: investigaciones,
                    options: options
                  });
                  return options;
                })()}
                placeholder="Seleccionar investigación"
                disabled={saving}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Responsable *</FilterLabel>
              <UserSelectorWithAvatar
                value={formData.responsable_id}
                onChange={(value) => handleInputChange('responsable_id', value)}
                users={usuarios}
                placeholder="Seleccionar responsable"
                disabled={saving}
                required
              />
            </div>

            <div>
              <FilterLabel>Participante Externo (Opcional)</FilterLabel>
              {(() => {
                console.log('🔍 [SeguimientoSideModal] Select value:', formData.participante_externo_id);
                console.log('🔍 [SeguimientoSideModal] Options disponibles:', participantesExternos.length);
                return null;
              })()}
              <Select
                value={String(formData.participante_externo_id || '')}
                onChange={(value) => handleInputChange('participante_externo_id', String(value))}
                placeholder={cargandoParticipantes ? "Cargando participantes..." : "Seleccionar participante externo"}
                disabled={saving || cargandoParticipantes}
                options={[
                  { value: '', label: 'Sin participante asociado' },
                  ...participantesExternos.map(participante => ({
                    value: String(participante.id),
                    label: `${participante.nombre}${participante.empresa_nombre ? ` - ${participante.empresa_nombre}` : ''}`
                  }))
                ]}
                fullWidth
              />
              <Typography variant="caption" color="secondary" className="mt-1">
                Asocia este seguimiento con un participante externo específico si es relevante.
              </Typography>
            </div>
          </div>

          {/* Estado del seguimiento (comentado por ahora) */}
          {/*
          <div className="space-y-4">
            <div>
              <FilterLabel>Estado *</FilterLabel>
              <Select
                options={ESTADOS_SEGUIMIENTO.map(estado => ({
                  value: estado.value,
                  label: estado.label
                }))}
                value={formData.estado}
                onChange={(value) => handleInputChange('estado', value.toString())}
                placeholder="Seleccionar estado"
                disabled={saving}
                fullWidth
              />
            </div>
          </div>
          */}

          {/* Notas y descripción */}
          <div className="space-y-4">
            <div>
              <FilterLabel>Notas *</FilterLabel>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                placeholder="Describe los detalles del seguimiento, avances, bloqueos, próximos pasos, etc."
                rows={8}
                required
                disabled={saving}
                fullWidth
              />
              <Typography variant="caption" color="secondary" className="mt-2">
                Describe el estado actual, avances realizados, bloqueos encontrados y próximos pasos.
              </Typography>
            </div>
          </div>
        </form>
      </div>
    </SideModal>
  );
};

export default SeguimientoSideModal; 