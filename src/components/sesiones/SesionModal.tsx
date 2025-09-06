import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Textarea, DatePicker, Typography, Card, Switch } from '../ui';
import { Sesion, SesionFormData } from '../../types/sesiones';
import GoogleCalendarSync from './GoogleCalendarSync';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  LocationIcon, 
  VideoIcon, 
  BuildingIcon,
  UsersIcon,
  XIcon,
  SaveIcon
} from '../icons';

interface SesionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SesionFormData) => Promise<void>;
  sesion?: Sesion | null;
  investigacionId?: string;
  fechaPredefinida?: Date;
  investigaciones?: Array<{ id: string; nombre: string; color?: string }>;
  moderadores?: Array<{ id: string; full_name: string; email: string }>;
  participantes?: Array<{ id: string; nombre: string; email: string }>;
  loading?: boolean;
}

const SesionModal: React.FC<SesionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sesion,
  investigacionId,
  fechaPredefinida,
  investigaciones = [],
  moderadores = [],
  participantes = [],
  loading = false
}) => {
  const [formData, setFormData] = useState<SesionFormData>({
    titulo: '',
    descripcion: '',
    fecha_programada: new Date(),
    duracion_minutos: 60,
    tipo_sesion: 'virtual',
    ubicacion: '',
    sala: '',
    moderador_id: '',
    observadores: [],
    grabacion_permitida: false,
    notas_publicas: '',
    notas_privadas: '',
    participantes_ids: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleSync, setShowGoogleSync] = useState(false);

  // Inicializar formulario
  useEffect(() => {
    if (isOpen) {
      if (sesion) {
        // Modo edición
        setFormData({
          titulo: sesion.titulo,
          descripcion: sesion.descripcion || '',
          fecha_programada: new Date(sesion.fecha_programada),
          duracion_minutos: sesion.duracion_minutos,
          tipo_sesion: sesion.tipo_sesion,
          ubicacion: sesion.ubicacion || '',
          sala: sesion.sala || '',
          moderador_id: sesion.moderador_id || '',
          observadores: sesion.observadores || [],
          grabacion_permitida: sesion.grabacion_permitida,
          notas_publicas: sesion.notas_publicas || '',
          notas_privadas: sesion.notas_privadas || '',
          participantes_ids: sesion.participantes?.map(p => p.participante_id) || []
        });
      } else {
        // Modo creación
        setFormData({
          titulo: '',
          descripcion: '',
          fecha_programada: fechaPredefinida || new Date(),
          duracion_minutos: 60,
          tipo_sesion: 'virtual',
          ubicacion: '',
          sala: '',
          moderador_id: '',
          observadores: [],
          grabacion_permitida: false,
          notas_publicas: '',
          notas_privadas: '',
          participantes_ids: []
        });
      }
      setErrors({});
    }
  }, [isOpen, sesion, fechaPredefinida]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.fecha_programada) {
      newErrors.fecha_programada = 'La fecha es requerida';
    } else if (formData.fecha_programada < new Date()) {
      newErrors.fecha_programada = 'La fecha no puede ser en el pasado';
    }

    if (!formData.duracion_minutos || formData.duracion_minutos < 15) {
      newErrors.duracion_minutos = 'La duración debe ser al menos 15 minutos';
    }

    if (formData.tipo_sesion === 'presencial' && !formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida para sesiones presenciales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error guardando sesión:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambio de campo
  const handleFieldChange = (field: keyof SesionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Opciones para selects
  const tipoSesionOptions = [
    { value: 'virtual', label: 'Virtual', icon: <VideoIcon className="w-4 h-4" /> },
    { value: 'presencial', label: 'Presencial', icon: <BuildingIcon className="w-4 h-4" /> },
    { value: 'hibrida', label: 'Híbrida', icon: <UsersIcon className="w-4 h-4" /> }
  ];

  const duracionOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' },
    { value: 180, label: '3 horas' },
    { value: 240, label: '4 horas' }
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={sesion ? 'Editar Sesión' : 'Nueva Sesión'}
      icon={<CalendarIcon className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card variant="elevated" padding="md">
          <Typography variant="h4" className="mb-4">
            Información Básica
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Título de la sesión"
                value={formData.titulo}
                onChange={(e) => handleFieldChange('titulo', e.target.value)}
                error={errors.titulo}
                placeholder="Ej: Sesión de investigación UX"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Textarea
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                placeholder="Describe el objetivo y contenido de la sesión"
                rows={3}
              />
            </div>
            
            <div>
              <DatePicker
                label="Fecha y hora"
                value={formData.fecha_programada}
                onChange={(date) => handleFieldChange('fecha_programada', date)}
                error={errors.fecha_programada}
                showTime
                required
              />
            </div>
            
            <div>
              <Select
                label="Duración"
                value={formData.duracion_minutos}
                onChange={(value) => handleFieldChange('duracion_minutos', value)}
                error={errors.duracion_minutos}
                options={duracionOptions}
                required
              />
            </div>
          </div>
        </Card>

        {/* Configuración de sesión */}
        <Card variant="elevated" padding="md">
          <Typography variant="h4" className="mb-4">
            Configuración
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Tipo de sesión"
                value={formData.tipo_sesion}
                onChange={(value) => handleFieldChange('tipo_sesion', value)}
                options={tipoSesionOptions}
                required
              />
            </div>
            
            <div>
              <Select
                label="Moderador"
                value={formData.moderador_id}
                onChange={(value) => handleFieldChange('moderador_id', value)}
                options={moderadores.map(m => ({ value: m.id, label: m.full_name }))}
                placeholder="Seleccionar moderador"
              />
            </div>
            
            {formData.tipo_sesion === 'presencial' && (
              <div className="md:col-span-2">
                <Input
                  label="Ubicación"
                  value={formData.ubicacion}
                  onChange={(e) => handleFieldChange('ubicacion', e.target.value)}
                  error={errors.ubicacion}
                  placeholder="Dirección o lugar de la sesión"
                  required
                />
              </div>
            )}
            
            {formData.tipo_sesion === 'virtual' && (
              <div className="md:col-span-2">
                <Input
                  label="Enlace de videollamada"
                  value={formData.ubicacion}
                  onChange={(e) => handleFieldChange('ubicacion', e.target.value)}
                  placeholder="URL de Zoom, Teams, etc."
                />
              </div>
            )}
            
            <div>
              <Input
                label="Sala"
                value={formData.sala}
                onChange={(e) => handleFieldChange('sala', e.target.value)}
                placeholder="Nombre de la sala"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="grabacion_permitida"
                checked={formData.grabacion_permitida}
                onChange={(e) => handleFieldChange('grabacion_permitida', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="grabacion_permitida" className="text-sm">
                Permitir grabación
              </label>
            </div>
          </div>
        </Card>

        {/* Participantes */}
        <Card variant="elevated" padding="md">
          <Typography variant="h4" className="mb-4">
            Participantes
          </Typography>
          
          <div className="space-y-4">
            <div>
              <Select
                label="Agregar participantes"
                value=""
                onChange={(value) => {
                  if (value && !formData.participantes_ids.includes(value)) {
                    handleFieldChange('participantes_ids', [...formData.participantes_ids, value]);
                  }
                }}
                options={participantes.map(p => ({ value: p.id, label: p.nombre }))}
                placeholder="Seleccionar participante"
              />
            </div>
            
            {formData.participantes_ids.length > 0 && (
              <div>
                <Typography variant="body2" color="secondary" className="mb-2">
                  Participantes seleccionados:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {formData.participantes_ids.map(participanteId => {
                    const participante = participantes.find(p => p.id === participanteId);
                    return (
                      <div
                        key={participanteId}
                        className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                      >
                        <span>{participante?.nombre}</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleFieldChange('participantes_ids', 
                              formData.participantes_ids.filter(id => id !== participanteId)
                            );
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Notas */}
        <Card variant="elevated" padding="md">
          <Typography variant="h4" className="mb-4">
            Notas
          </Typography>
          
          <div className="space-y-4">
            <Textarea
              label="Notas públicas"
              value={formData.notas_publicas}
              onChange={(e) => handleFieldChange('notas_publicas', e.target.value)}
              placeholder="Notas visibles para todos los participantes"
              rows={3}
            />
            
            <Textarea
              label="Notas privadas"
              value={formData.notas_privadas}
              onChange={(e) => handleFieldChange('notas_privadas', e.target.value)}
              placeholder="Notas solo para el equipo interno"
              rows={3}
            />
          </div>
        </Card>

        {/* Google Calendar Sync */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h4">
              Google Calendar
            </Typography>
            <Switch
              checked={showGoogleSync}
              onCheckedChange={setShowGoogleSync}
            />
          </div>
          
          {showGoogleSync && sesion && (
            <GoogleCalendarSync
              sesion={sesion}
              onSync={(sesion, googleEvent) => {
                console.log('Sesión sincronizada:', sesion.id, googleEvent.id);
              }}
              onUnsync={(sesion) => {
                console.log('Sesión desincronizada:', sesion.id);
              }}
            />
          )}
          
          {showGoogleSync && !sesion && (
            <div className="text-center py-4">
              <Typography variant="body2" color="secondary">
                Guarda la sesión primero para habilitar la sincronización con Google Calendar
              </Typography>
            </div>
          )}
        </Card>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SaveIcon className="w-4 h-4" />
                {sesion ? 'Actualizar' : 'Crear'} Sesión
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SesionModal;
