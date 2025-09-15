import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useFastUser } from '../../contexts/FastUserContext';
import SideModal from './SideModal';
import Typography from './Typography';
import Button from './Button';
import Select from './Select';
import UserSelectorWithAvatar from './UserSelectorWithAvatar';
import MultiUserSelector from './MultiUserSelector';
import DatePicker from './DatePicker';
import { TimePicker } from './TimePicker';
import Input from './Input';
import Chip from './Chip';
import { PageHeader } from './PageHeader';
import FilterLabel from './FilterLabel';
import { getUserTimezone, getCurrentDateTime, debugTimezone, getMinDate, createUTCDateFromLocal } from '../../utils/timezone';
import { getEstadoParticipanteVariant, getEstadoParticipanteText } from '../../utils/estadoUtils';
import { getTipoParticipanteVariant, getTipoParticipanteText } from '../../utils/tipoParticipanteUtils';
import CrearParticipanteExternoModal from './CrearParticipanteExternoModal';
import CrearParticipanteInternoModal from './CrearParticipanteInternoModal';
import CrearParticipanteFriendFamilyModal from './CrearParticipanteFriendFamilyModal';
import { UsersIcon, CheckCircleIcon, RefreshIcon } from '../icons';
import { SesionApoyoFormData } from '../../types/sesiones';

interface AgregarSesionApoyoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  fechaPredefinida?: Date;
}

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

interface Participante {
  id: string;
  nombre: string;
  email?: string;
  rol_empresa_nombre?: string;
  empresa_nombre?: string;
  productos_relacionados?: string[];
  estado?: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  estado_calculado?: {
    estado: string;
    mensaje?: string;
    color?: string;
  };
}

interface ParticipanteInterno {
  id: string;
  nombre: string;
  email: string;
  tipo: 'interno';
}

interface ParticipanteFriendFamily {
  id: string;
  nombre: string;
  email: string;
  tipo: 'friend_family';
}

export default function AgregarSesionApoyoModal({
  isOpen,
  onClose,
  onSuccess,
  fechaPredefinida
}: AgregarSesionApoyoModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const { userId, userName, userEmail } = useFastUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moderadores, setModeradores] = useState<Usuario[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [generatingMeetLink, setGeneratingMeetLink] = useState(false);

  // Estados para participantes
  const [tipoParticipante, setTipoParticipante] = useState<'externo' | 'interno' | 'friend_family'>('externo');
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState<Participante | null>(null);
  const [participantesExternos, setParticipantesExternos] = useState<Participante[]>([]);
  const [participantesInternos, setParticipantesInternos] = useState<ParticipanteInterno[]>([]);
  const [participantesFriendFamily, setParticipantesFriendFamily] = useState<ParticipanteFriendFamily[]>([]);

  // Estados para modales de creación
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [mostrarModalInterno, setMostrarModalInterno] = useState(false);
  const [mostrarModalFriendFamily, setMostrarModalFriendFamily] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<SesionApoyoFormData>({
    titulo: '',
    descripcion: '',
    fecha_programada: fechaPredefinida || null,
    hora_sesion: '',
    duracion_minutos: 60,
    moderador_id: userId || '',
    observadores: [],
    objetivo_sesion: '',
    participantes_ids: [],
    meet_link: ''
  });

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
      cargarParticipantes();
    }
  }, [isOpen]);

  // Función para cargar todos los tipos de participantes
  const cargarParticipantes = async () => {
    try {
      console.log('👤 Cargando participantes para sesión de apoyo...');
      
      // Cargar participantes externos
      const ext = await fetch('/api/participantes');
      if (ext.ok) {
        const data = await ext.json();
        setParticipantesExternos((data || []).map((p: any) => ({ ...p, tipo: 'externo' })));
        console.log('✅ Participantes externos cargados:', data?.length || 0);
      }
      
      // Cargar participantes internos
      const int = await fetch('/api/participantes-internos');
      if (int.ok) {
        const data = await int.json();
        setParticipantesInternos((data || []).map((p: any) => ({ ...p, tipo: 'interno' })));
        console.log('✅ Participantes internos cargados:', data?.length || 0);
      }
      
      // Cargar participantes Friend and Family
      const friendFamily = await fetch('/api/participantes-friend-family');
      if (friendFamily.ok) {
        const data = await friendFamily.json();
        setParticipantesFriendFamily((data || []).map((p: any) => ({ ...p, tipo: 'friend_family' })));
        console.log('✅ Participantes Friend and Family cargados:', data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando participantes:', error);
    }
  };

  // Actualizar moderador cuando el userId cambie
  useEffect(() => {
    if (userId) {
      setFormData(prev => ({
        ...prev,
        moderador_id: userId
      }));
    }
  }, [userId]);

  // Asegurar que el moderador se precargue cuando se abra el modal
  useEffect(() => {
    if (isOpen && userId && !formData.moderador_id) {
      setFormData(prev => ({
        ...prev,
        moderador_id: userId
      }));
    }
  }, [isOpen, userId, formData.moderador_id]);

  const cargarUsuarios = async () => {
    try {
      console.log('🔄 Cargando usuarios para sesión de apoyo...');
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Respuesta completa de usuarios:', responseData);
        
        // Manejar diferentes estructuras de respuesta
        let usuariosArray = [];
        if (Array.isArray(responseData)) {
          // Si es un array directo
          usuariosArray = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          // Si tiene estructura { data: [...], error: null, count: X }
          usuariosArray = responseData.data;
        } else if (responseData && Array.isArray(responseData.usuarios)) {
          // Si tiene estructura { usuarios: [...] }
          usuariosArray = responseData.usuarios;
        }
        
        console.log('✅ Usuarios array extraído:', usuariosArray);
        setModeradores(usuariosArray);
        setUsuariosDisponibles(usuariosArray);
        console.log('✅ Estados actualizados - Moderadores:', usuariosArray.length, 'Usuarios disponibles:', usuariosArray.length);
      } else {
        console.error('❌ Error en respuesta de usuarios:', response.status, response.statusText);
        setModeradores([]);
        setUsuariosDisponibles([]);
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      // En caso de error, asegurar que los arrays estén vacíos
      setModeradores([]);
      setUsuariosDisponibles([]);
    }
  };

  const handleFieldChange = (field: keyof SesionApoyoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para manejar la creación de participantes
  const handleParticipanteExternoCreado = (nuevoParticipante: any) => {
    const participanteFormateado = {
      id: nuevoParticipante.id,
      nombre: nuevoParticipante.nombre,
      email: nuevoParticipante.email || '',
      rol_empresa_nombre: nuevoParticipante.rol_empresa_nombre || 'Sin rol',
      empresa_nombre: nuevoParticipante.empresa_nombre || 'Sin empresa',
      productos_relacionados: nuevoParticipante.productos_relacionados || [],
      estado: nuevoParticipante.estado,
      tipo: 'externo' as const
    };
    
    setParticipantesExternos(prev => [...prev, participanteFormateado]);
    setParticipanteSeleccionado(participanteFormateado);
    setTipoParticipante('externo');
  };

  const handleParticipanteInternoCreado = (nuevoParticipante: any) => {
    const participanteFormateado = {
      id: nuevoParticipante.id,
      nombre: nuevoParticipante.nombre,
      email: nuevoParticipante.email,
      tipo: 'interno' as const
    };
    
    setParticipantesInternos(prev => [...prev, participanteFormateado]);
    setParticipanteSeleccionado(participanteFormateado);
    setTipoParticipante('interno');
  };

  const handleParticipanteFriendFamilyCreado = (nuevoParticipante: any) => {
    const participanteFormateado = {
      id: nuevoParticipante.id,
      nombre: nuevoParticipante.nombre,
      email: nuevoParticipante.email,
      tipo: 'friend_family' as const
    };
    
    setParticipantesFriendFamily(prev => [...prev, participanteFormateado]);
    setParticipanteSeleccionado(participanteFormateado);
    setTipoParticipante('friend_family');
  };

  // Determinar participantes disponibles según el tipo seleccionado
  const participantesDisponibles = tipoParticipante === 'externo' 
    ? participantesExternos 
    : tipoParticipante === 'interno'
    ? participantesInternos
    : participantesFriendFamily;

  const handleGenerateMeetLink = async () => {
    try {
      setGeneratingMeetLink(true);
      console.log('🔍 Generando enlace de Meet con datos:', {
        fechaSesion: formData.fecha_programada,
        duracionSesion: formData.duracion_minutos,
        titulo: formData.titulo || 'Sesión de Apoyo'
      });

      const response = await fetch('/api/generate-meet-link-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaSesion: formData.fecha_programada,
          duracionSesion: formData.duracion_minutos,
          titulo: formData.titulo || 'Sesión de Apoyo'
        })
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        showError(`Error del servidor: ${errorData.error || 'Error desconocido'}`);
        return;
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (data.meetLink) {
        handleFieldChange('meet_link', data.meetLink);
        showSuccess('Enlace de Google Meet generado exitosamente');
      } else {
        showError('No se pudo generar el enlace de Meet');
      }
    } catch (error) {
      console.error('❌ Error generando enlace de Meet:', error);
      showError('Error al generar el enlace de Meet');
    } finally {
      setGeneratingMeetLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.titulo.trim()) {
        showError('El título es requerido');
        setLoading(false);
        return;
      }

      if (!formData.fecha_programada) {
        showError('La fecha es requerida');
        setLoading(false);
        return;
      }

      if (!formData.moderador_id) {
        showError('El moderador es requerido');
        setLoading(false);
        return;
      }

      if (!participanteSeleccionado) {
        showError('Debe seleccionar un participante');
        setLoading(false);
        return;
      }

      // Preparar datos para envío
      console.log('🔍 formData.fecha_programada antes de procesar:', formData.fecha_programada);
      console.log('🔍 Tipo de fecha:', typeof formData.fecha_programada);
      console.log('🔍 Es Date?', formData.fecha_programada instanceof Date);
      
      // Determinar el campo de participante según el tipo seleccionado
      let campoParticipante = {};
      if (participanteSeleccionado) {
        switch (tipoParticipante) {
          case 'externo':
            campoParticipante = { participantes_id: participanteSeleccionado.id };
            break;
          case 'interno':
            campoParticipante = { participantes_internos_id: participanteSeleccionado.id };
            break;
          case 'friend_family':
            campoParticipante = { participantes_friend_family_id: participanteSeleccionado.id };
            break;
        }
      }

      const datosEnvio = {
        ...formData,
        tipo: 'apoyo', // Marcar como sesión de apoyo
        fecha_programada: formData.fecha_programada ? (() => {
          try {
            console.log('🔄 Procesando fecha:', formData.fecha_programada);
            const date = new Date(formData.fecha_programada);
            console.log('🔄 Fecha convertida:', date);
            console.log('🔄 Es válida?', !isNaN(date.getTime()));
            if (isNaN(date.getTime())) {
              console.error('❌ Fecha inválida:', formData.fecha_programada);
              return null;
            }
            const isoString = date.toISOString();
            console.log('🔄 ISO String:', isoString);
            return isoString;
          } catch (error) {
            console.error('❌ Error al procesar fecha:', error);
            return null;
          }
        })() : null,
        observadores: formData.observadores || [],
        participantes_ids: formData.participantes_ids || [],
        ...campoParticipante // Incluir el campo de participante correspondiente
      };

      console.log('🚀 Enviando datos de sesión de apoyo:', datosEnvio);

      // Crear la sesión de apoyo
      const response = await fetch('/api/sesiones-apoyo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosEnvio),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const sesionCreada = await response.json();
        console.log('✅ Sesión creada exitosamente:', sesionCreada);
        // No mostrar notificación aquí, la página principal la maneja
        onClose();
        if (onSuccess) {
          onSuccess(sesionCreada);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        showError(errorData.error || 'Error al crear la sesión de apoyo');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al crear la sesión de apoyo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_programada: fechaPredefinida || null,
      hora_sesion: '',
      duracion_minutos: 60,
      moderador_id: userId || '',
      observadores: [],
      objetivo_sesion: '',
      participantes_ids: []
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Guardando...' : 'Crear Sesión de Apoyo'}
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
        {/* Header usando PageHeader como en AgregarParticipanteModal */}
        <PageHeader
          title="Nueva Sesión de Apoyo"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={handleClose}
        />

        {/* Mostrar error si existe */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Typography variant="body2" className="text-destructive">
              {error}
            </Typography>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <FilterLabel>Título de la sesión *</FilterLabel>
              <Input
                value={formData.titulo}
                onChange={(e) => handleFieldChange('titulo', e.target.value)}
                placeholder="Ej: Reunión de seguimiento del proyecto"
                required
              />
            </div>

            <div className="space-y-2">
              <FilterLabel>Descripción</FilterLabel>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                placeholder="Describe el propósito y objetivos de esta sesión de apoyo..."
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground"
                rows={3}
              />
            </div>
          </div>

          {/* Programación */}
          <div className="space-y-4">
            <div className="space-y-2">
              <FilterLabel>Fecha de la sesión *</FilterLabel>
              <DatePicker
                value={formData.fecha_programada}
                onChange={(date) => {
                  console.log('📅 DatePicker onChange:', date);
                  handleFieldChange('fecha_programada', date);
                }}
                minDate={getMinDate()}
                required
              />
            </div>

            <div className="space-y-2">
              <FilterLabel>Hora de la sesión *</FilterLabel>
              <TimePicker
                value={formData.hora_sesion || ''}
                onChange={(hora) => handleFieldChange('hora_sesion', hora)}
                placeholder="--:-- --"
                required
              />
            </div>

            <div className="space-y-2">
              <FilterLabel>Duración (minutos) *</FilterLabel>
              <Input
                type="number"
                value={formData.duracion_minutos}
                onChange={(e) => handleFieldChange('duracion_minutos', parseInt(e.target.value))}
                placeholder="60"
                min="15"
                max="480"
                required
              />
            </div>

            <div>
              <FilterLabel>Enlace de Google Meet</FilterLabel>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type="url"
                      value={formData.meet_link || ''}
                      onChange={(e) => handleFieldChange('meet_link', e.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      disabled={loading}
                      className={`flex-1 ${formData.meet_link ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGenerateMeetLink}
                    disabled={loading || generatingMeetLink}
                    className="whitespace-nowrap"
                  >
                    {generatingMeetLink ? (
                      <>
                        <RefreshIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Generando...
                      </>
                    ) : formData.meet_link ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Generado
                      </>
                    ) : (
                      'Generar'
                    )}
                  </Button>
                </div>
              </div>
              <Typography variant="caption" color="secondary" className="mt-1 block">
                Enlace opcional para sesiones virtuales
              </Typography>
            </div>
          </div>

          {/* Personal */}
          <div className="space-y-4">
            <div className="space-y-2">
              <FilterLabel>Moderador *</FilterLabel>
              <UserSelectorWithAvatar
                users={moderadores}
                value={formData.moderador_id || ''}
                onChange={(userId) => handleFieldChange('moderador_id', userId)}
                placeholder="Seleccionar moderador"
                required
              />
            </div>

            <div className="space-y-2">
              <FilterLabel>Observadores</FilterLabel>
              <MultiUserSelector
                users={usuariosDisponibles || []}
                value={formData.observadores || []}
                onChange={(userIds) => handleFieldChange('observadores', userIds)}
                placeholder="Seleccionar observadores"
              />
            </div>
          </div>

          {/* Objetivo de la sesión */}
          <div className="space-y-4">
            <div className="space-y-2">
              <FilterLabel>Objetivo de la sesión</FilterLabel>
              <textarea
                value={formData.objetivo_sesion || ''}
                onChange={(e) => handleFieldChange('objetivo_sesion', e.target.value)}
                placeholder="Describe el objetivo específico de esta sesión de apoyo..."
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground"
                rows={3}
              />
            </div>
          </div>

          {/* Selección de Participante */}
          <div className="space-y-4">
            <div className="space-y-2">
              <FilterLabel>Tipo de Participante *</FilterLabel>
              <Select
                value={tipoParticipante}
                onChange={(value) => {
                  setTipoParticipante(value as 'externo' | 'interno' | 'friend_family');
                  setParticipanteSeleccionado(null);
                }}
                options={[
                  { value: 'externo', label: 'Participante Externo' },
                  { value: 'interno', label: 'Participante Interno' },
                  { value: 'friend_family', label: 'Friend and Family' }
                ]}
                disabled={loading}
                fullWidth
              />
            </div>

            <div className="space-y-2">
              <FilterLabel>Participante *</FilterLabel>
              <div className="space-y-3">
                <Select
                  value={participanteSeleccionado?.id || ''}
                  onChange={(value) => {
                    const participante = participantesDisponibles.find(p => p.id === value);
                    setParticipanteSeleccionado(participante || null);
                    if (participante) {
                      handleFieldChange('participantes_ids', [participante.id]);
                    }
                  }}
                  placeholder={`Seleccionar participante ${tipoParticipante}`}
                  options={participantesDisponibles.map(p => ({ value: p.id, label: p.nombre }))}
                  disabled={loading}
                  fullWidth
                />
                
                {tipoParticipante === 'interno' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMostrarModalInterno(true)}
                    disabled={loading}
                    className="w-full"
                  >
                    + Crear Nuevo Participante Interno
                  </Button>
                )}

                {tipoParticipante === 'externo' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMostrarModalExterno(true)}
                    disabled={loading}
                    className="w-full"
                  >
                    + Crear Nuevo Participante Externo
                  </Button>
                )}

                {tipoParticipante === 'friend_family' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMostrarModalFriendFamily(true)}
                    disabled={loading}
                    className="w-full"
                  >
                    + Crear Nuevo Participante Friend and Family
                  </Button>
                )}
              </div>
            </div>

            {/* Información del participante seleccionado */}
            {participanteSeleccionado && (
              <div className="p-4 bg-muted rounded-lg mt-2">
                <Typography variant="subtitle2" weight="medium" className="mb-2">
                  Participante Seleccionado
                </Typography>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nombre:</span>
                    <span className="text-sm font-medium">{participanteSeleccionado.nombre}</span>
                  </div>
                  {participanteSeleccionado.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm font-medium">{participanteSeleccionado.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <Chip 
                      variant={getTipoParticipanteVariant(participanteSeleccionado.tipo)}
                      size="sm"
                    >
                      {getTipoParticipanteText(participanteSeleccionado.tipo)}
                    </Chip>
                  </div>
                  {participanteSeleccionado.empresa_nombre && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Empresa:</span>
                      <span className="text-sm font-medium">{participanteSeleccionado.empresa_nombre}</span>
                    </div>
                  )}
                  {participanteSeleccionado.rol_empresa_nombre && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rol en la Empresa:</span>
                      <span className="text-sm font-medium">{participanteSeleccionado.rol_empresa_nombre}</span>
                    </div>
                  )}
                  {participanteSeleccionado.estado && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <Chip 
                        variant={getEstadoParticipanteVariant(participanteSeleccionado.estado)}
                        size="sm"
                      >
                        {getEstadoParticipanteText(participanteSeleccionado.estado)}
                      </Chip>
                    </div>
                  )}
                  {participanteSeleccionado.productos_relacionados && participanteSeleccionado.productos_relacionados.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Productos:</span>
                      <span className="text-sm font-medium">{participanteSeleccionado.productos_relacionados.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </form>
      </div>

      {/* Modales de creación de participantes */}
      <CrearParticipanteExternoModal
        isOpen={mostrarModalExterno}
        onClose={() => setMostrarModalExterno(false)}
        onSuccess={handleParticipanteExternoCreado}
      />

      <CrearParticipanteInternoModal
        isOpen={mostrarModalInterno}
        onClose={() => setMostrarModalInterno(false)}
        onSuccess={handleParticipanteInternoCreado}
      />

      <CrearParticipanteFriendFamilyModal
        isOpen={mostrarModalFriendFamily}
        onClose={() => setMostrarModalFriendFamily(false)}
        onSuccess={handleParticipanteFriendFamilyCreado}
      />
    </SideModal>
  );
}