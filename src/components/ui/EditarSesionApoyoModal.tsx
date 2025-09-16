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

interface EditarSesionApoyoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  sesion: any; // Sesión de apoyo a editar
}

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  foto_url?: string;
}

interface Participante {
  id: string;
  nombre: string;
  email: string;
  tipo: 'externo';
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

export default function EditarSesionApoyoModal({
  isOpen,
  onClose,
  onSuccess,
  sesion
}: EditarSesionApoyoModalProps) {
  
  const { userId, userName, userEmail } = useFastUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moderadores, setModeradores] = useState<Usuario[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [generatingMeetLink, setGeneratingMeetLink] = useState(false);

  // Estados para participantes
  const [tipoParticipante, setTipoParticipante] = useState<'externo' | 'interno' | 'friend_family'>('externo');
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState<Participante | ParticipanteInterno | ParticipanteFriendFamily | null>(null);
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
    fecha_programada: null,
    hora_sesion: '',
    duracion_minutos: 60,
    moderador_id: userId || '',
    observadores: [],
    objetivo_sesion: '',
    participantes_ids: [],
    meet_link: ''
  });

  // Inicializar formulario con datos de la sesión
  useEffect(() => {
    if (isOpen && sesion) {
      console.log('🔍 [EditarSesionApoyoModal] Inicializando con sesión:', sesion);
      
      // Determinar tipo de participante basándose en la sesión
      let tipoPart = 'externo';
      let participanteId = '';
      
      if (sesion.participantes_friend_family_id) {
        tipoPart = 'friend_family';
        participanteId = sesion.participantes_friend_family_id;
      } else if (sesion.participantes_internos_id) {
        tipoPart = 'interno';
        participanteId = sesion.participantes_internos_id;
      } else if (sesion.participantes_id) {
        tipoPart = 'externo';
        participanteId = sesion.participantes_id;
      }
      
      setTipoParticipante(tipoPart as any);
      
      // Establecer datos del formulario
      setFormData({
        titulo: sesion.titulo || '',
        descripcion: sesion.descripcion || '',
        fecha_programada: sesion.fecha_programada ? new Date(sesion.fecha_programada) : null,
        hora_sesion: sesion.hora_sesion || '',
        duracion_minutos: sesion.duracion_minutos || 60,
        moderador_id: sesion.moderador_id || userId || '',
        observadores: sesion.observadores || [],
        objetivo_sesion: sesion.objetivo_sesion || '',
        participantes_ids: participanteId ? [participanteId] : [],
        meet_link: sesion.meet_link || ''
      });
      
      cargarUsuarios();
      cargarParticipantes();
    }
  }, [isOpen, sesion]);

  // Establecer participante seleccionado después de cargar participantes
  useEffect(() => {
    if (isOpen && sesion && (participantesExternos.length > 0 || participantesInternos.length > 0 || participantesFriendFamily.length > 0)) {
      console.log('🔍 [EditarSesionApoyoModal] Estableciendo participante seleccionado');
      console.log('🔍 [EditarSesionApoyoModal] Participantes cargados:', {
        externos: participantesExternos.length,
        internos: participantesInternos.length,
        friendFamily: participantesFriendFamily.length
      });
      
      // Determinar tipo de participante y ID
      let tipoPart = 'externo';
      let participanteId = '';
      
      if (sesion.participantes_friend_family_id) {
        tipoPart = 'friend_family';
        participanteId = sesion.participantes_friend_family_id;
      } else if (sesion.participantes_internos_id) {
        tipoPart = 'interno';
        participanteId = sesion.participantes_internos_id;
      } else if (sesion.participantes_id) {
        tipoPart = 'externo';
        participanteId = sesion.participantes_id;
      }
      
      if (participanteId) {
        // Buscar el participante en la lista correspondiente
        let participanteEncontrado = null;
        
        if (tipoPart === 'externo') {
          participanteEncontrado = participantesExternos.find(p => p.id === participanteId);
        } else if (tipoPart === 'interno') {
          participanteEncontrado = participantesInternos.find(p => p.id === participanteId);
        } else if (tipoPart === 'friend_family') {
          participanteEncontrado = participantesFriendFamily.find(p => p.id === participanteId);
        }
        
        if (participanteEncontrado) {
          console.log('🔍 [EditarSesionApoyoModal] Participante encontrado:', participanteEncontrado);
          setParticipanteSeleccionado(participanteEncontrado);
          // Asegurar que el formData también tenga el participante seleccionado
          setFormData(prev => ({
            ...prev,
            participantes_ids: [participanteId]
          }));
        } else {
          console.log('⚠️ [EditarSesionApoyoModal] Participante no encontrado en la lista:', participanteId);
        }
      }
    }
  }, [isOpen, sesion, participantesExternos, participantesInternos, participantesFriendFamily]);

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
      // Cargar participantes externos
      const responseExternos = await fetch('/api/participantes');
      if (responseExternos.ok) {
        const dataExternos = await responseExternos.json();
        setParticipantesExternos(dataExternos.participantes || []);
      }

      // Cargar participantes internos
      const responseInternos = await fetch('/api/participantes-internos');
      if (responseInternos.ok) {
        const dataInternos = await responseInternos.json();
        setParticipantesInternos(dataInternos.participantes || []);
      }

      // Cargar participantes friend & family
      const responseFriendFamily = await fetch('/api/participantes-friend-family');
      if (responseFriendFamily.ok) {
        const dataFriendFamily = await responseFriendFamily.json();
        setParticipantesFriendFamily(dataFriendFamily.participantes || []);
      }
    } catch (error) {
      console.error('Error cargando participantes:', error);
    }
  };

  // Función para cargar usuarios (moderadores y observadores)
  const cargarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuariosDisponibles(data.usuarios || []);
        setModeradores(data.usuarios || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleFieldChange = (field: keyof SesionApoyoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambio de tipo de participante
  const handleTipoParticipanteChange = (tipo: 'externo' | 'interno' | 'friend_family') => {
    setTipoParticipante(tipo);
    setParticipanteSeleccionado(null);
    setFormData(prev => ({
      ...prev,
      participantes_ids: []
    }));
  };

  // Obtener participantes según el tipo seleccionado
  const getParticipantesDisponibles = () => {
    switch (tipoParticipante) {
      case 'externo':
        return participantesExternos;
      case 'interno':
        return participantesInternos;
      case 'friend_family':
        return participantesFriendFamily;
      default:
        return [];
    }
  };

  // Manejar selección de participante
  const handleParticipanteChange = (participanteId: string) => {
    const participantes = getParticipantesDisponibles();
    const participante = participantes.find(p => p.id === participanteId);
    setParticipanteSeleccionado(participante || null);
    setFormData(prev => ({
      ...prev,
      participantes_ids: participanteId ? [participanteId] : []
    }));
  };

  // Generar meet link
  const generateMeetLink = async () => {
    setGeneratingMeetLink(true);
    try {
      // Simular generación de meet link
      await new Promise(resolve => setTimeout(resolve, 1000));
      const meetLink = `https://meet.google.com/new?meetingId=${Date.now()}`;
      setFormData(prev => ({
        ...prev,
        meet_link: meetLink
      }));
    } catch (error) {
      console.error('Error generando meet link:', error);
    } finally {
      setGeneratingMeetLink(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.titulo.trim()) {
        throw new Error('El título es requerido');
      }
      if (!formData.fecha_programada) {
        throw new Error('La fecha es requerida');
      }
      if (!formData.hora_sesion) {
        throw new Error('La hora es requerida');
      }
      if (formData.participantes_ids.length === 0) {
        throw new Error('Debe seleccionar al menos un participante');
      }

      // Preparar datos para enviar
      const datosParaEnviar: any = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_programada: formData.fecha_programada?.toISOString(),
        hora_sesion: formData.hora_sesion,
        duracion_minutos: formData.duracion_minutos,
        moderador_id: formData.moderador_id,
        observadores: formData.observadores,
        objetivo_sesion: formData.objetivo_sesion,
        meet_link: formData.meet_link
      };

      // Agregar el participante según su tipo
      const participanteId = formData.participantes_ids[0];
      if (tipoParticipante === 'externo') {
        datosParaEnviar.participantes_id = participanteId;
      } else if (tipoParticipante === 'interno') {
        datosParaEnviar.participantes_internos_id = participanteId;
      } else if (tipoParticipante === 'friend_family') {
        datosParaEnviar.participantes_friend_family_id = participanteId;
      }

      console.log('🔍 [EditarSesionApoyoModal] Enviando datos:', datosParaEnviar);

      // Llamar a la API para actualizar la sesión
      const response = await fetch(`/api/sesiones-apoyo/${sesion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error actualizando sesión de apoyo');
      }

      const result = await response.json();
      console.log('✅ [EditarSesionApoyoModal] Sesión actualizada:', result);

      onSuccess(result);
      onClose();

    } catch (error) {
      console.error('❌ [EditarSesionApoyoModal] Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setError(null);
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_programada: null,
      hora_sesion: '',
      duracion_minutos: 60,
      moderador_id: userId || '',
      observadores: [],
      objetivo_sesion: '',
      participantes_ids: [],
      meet_link: ''
    });
    setParticipanteSeleccionado(null);
    setTipoParticipante('externo');
    onClose();
  };

  // Footer del modal
  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={loading}
        disabled={loading}
      >
        <CheckCircleIcon className="w-4 h-4 mr-2" />
        Actualizar Sesión
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
        {/* Header usando PageHeader como en AgregarSesionApoyoModal */}
        <PageHeader
          title="Editar Sesión de Apoyo"
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

            <div className="space-y-2">
              <FilterLabel>Objetivo de la sesión</FilterLabel>
              <Input
                value={formData.objetivo_sesion || ''}
                onChange={(e) => handleFieldChange('objetivo_sesion', e.target.value)}
                placeholder="Ej: Revisar avances del proyecto y definir próximos pasos"
              />
            </div>
          </div>

          {/* Programación */}
          <div className="space-y-4">
            <Typography variant="h4" className="text-lg font-semibold">
              Programación
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FilterLabel>Fecha de la sesión *</FilterLabel>
                <DatePicker
                  value={formData.fecha_programada}
                  onChange={(date) => handleFieldChange('fecha_programada', date)}
                  minDate={new Date(getMinDate())}
                  placeholder="Seleccionar fecha"
                />
              </div>

              <div className="space-y-2">
                <FilterLabel>Hora de la sesión *</FilterLabel>
                <TimePicker
                  value={formData.hora_sesion}
                  onChange={(time) => handleFieldChange('hora_sesion', time)}
                  placeholder="Seleccionar hora"
                />
              </div>
            </div>

            <div className="space-y-2">
              <FilterLabel>Duración (minutos) *</FilterLabel>
              <Select
                value={formData.duracion_minutos.toString()}
                onChange={(value) => handleFieldChange('duracion_minutos', parseInt(value))}
                options={[
                  { value: '15', label: '15 minutos' },
                  { value: '30', label: '30 minutos' },
                  { value: '45', label: '45 minutos' },
                  { value: '60', label: '1 hora' },
                  { value: '90', label: '1.5 horas' },
                  { value: '120', label: '2 horas' },
                  { value: '180', label: '3 horas' },
                  { value: '240', label: '4 horas' }
                ]}
                placeholder="Seleccionar duración"
              />
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-4">
            <Typography variant="h4" className="text-lg font-semibold">
              Participantes
            </Typography>

            <div className="space-y-4">
              <div className="space-y-2">
                <FilterLabel>Tipo de participante *</FilterLabel>
                <Select
                  value={tipoParticipante}
                  onChange={handleTipoParticipanteChange}
                  options={[
                    { value: 'externo', label: 'Cliente Externo' },
                    { value: 'interno', label: 'Cliente Interno' },
                    { value: 'friend_family', label: 'Friend & Family' }
                  ]}
                  placeholder="Seleccionar tipo"
                />
              </div>

              <div className="space-y-2">
                <FilterLabel>Participante *</FilterLabel>
                <div className="flex gap-2">
                  <Select
                    value={formData.participantes_ids[0] || ''}
                    onChange={handleParticipanteChange}
                    options={getParticipantesDisponibles().map(p => ({
                      value: p.id,
                      label: p.nombre
                    }))}
                    placeholder={`Seleccionar ${tipoParticipante === 'externo' ? 'cliente externo' : tipoParticipante === 'interno' ? 'cliente interno' : 'friend & family'}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (tipoParticipante === 'externo') {
                        setMostrarModalExterno(true);
                      } else if (tipoParticipante === 'interno') {
                        setMostrarModalInterno(true);
                      } else {
                        setMostrarModalFriendFamily(true);
                      }
                    }}
                  >
                    <UsersIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mostrar información del participante seleccionado */}
              {participanteSeleccionado && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Typography variant="h5" className="font-semibold mb-2">
                    Participante Seleccionado
                  </Typography>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {participanteSeleccionado.nombre}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {participanteSeleccionado.email}
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <Chip 
                        variant={getTipoParticipanteVariant(participanteSeleccionado.tipo) as any}
                        size="sm"
                        className="ml-2"
                      >
                        {getTipoParticipanteText(participanteSeleccionado.tipo)}
                      </Chip>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Moderador y Observadores */}
          <div className="space-y-4">
            <Typography variant="h4" className="text-lg font-semibold">
              Equipo
            </Typography>

            <div className="space-y-2">
              <FilterLabel>Moderador *</FilterLabel>
              <UserSelectorWithAvatar
                value={formData.moderador_id}
                onChange={(id) => handleFieldChange('moderador_id', id)}
                users={moderadores}
                placeholder="Seleccionar moderador"
              />
            </div>

            <div className="space-y-2">
              <FilterLabel>Observadores</FilterLabel>
              <MultiUserSelector
                label="Observadores"
                placeholder="Seleccionar observadores"
                value={formData.observadores}
                onChange={(observadores) => handleFieldChange('observadores', observadores)}
                users={usuariosDisponibles}
                showAvatar={true}
                maxSelections={10}
              />
              <Typography variant="caption" color="secondary" className="mt-2 block">
                Usuarios del equipo que observarán la sesión de apoyo.
              </Typography>
            </div>
          </div>

          {/* Enlace de reunión */}
          <div className="space-y-4">
            <Typography variant="h4" className="text-lg font-semibold">
              Enlace de Reunión
            </Typography>

            <div className="space-y-2">
              <FilterLabel>Meet Link</FilterLabel>
              <div className="flex gap-2">
                <Input
                  value={formData.meet_link}
                  onChange={(e) => handleFieldChange('meet_link', e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateMeetLink}
                  loading={generatingMeetLink}
                  disabled={generatingMeetLink}
                >
                  <RefreshIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modales de creación de participantes */}
      {mostrarModalExterno && (
        <CrearParticipanteExternoModal
          isOpen={mostrarModalExterno}
          onClose={() => setMostrarModalExterno(false)}
          onSuccess={(participante) => {
            setParticipantesExternos(prev => [...prev, participante]);
            setParticipanteSeleccionado(participante);
            setFormData(prev => ({
              ...prev,
              participantes_ids: [participante.id]
            }));
            setMostrarModalExterno(false);
          }}
        />
      )}

      {mostrarModalInterno && (
        <CrearParticipanteInternoModal
          isOpen={mostrarModalInterno}
          onClose={() => setMostrarModalInterno(false)}
          onSuccess={(participante) => {
            setParticipantesInternos(prev => [...prev, participante]);
            setParticipanteSeleccionado(participante);
            setFormData(prev => ({
              ...prev,
              participantes_ids: [participante.id]
            }));
            setMostrarModalInterno(false);
          }}
        />
      )}

      {mostrarModalFriendFamily && (
        <CrearParticipanteFriendFamilyModal
          isOpen={mostrarModalFriendFamily}
          onClose={() => setMostrarModalFriendFamily(false)}
          onSuccess={(participante) => {
            setParticipantesFriendFamily(prev => [...prev, participante]);
            setParticipanteSeleccionado(participante);
            setFormData(prev => ({
              ...prev,
              participantes_ids: [participante.id]
            }));
            setMostrarModalFriendFamily(false);
          }}
        />
      )}
    </SideModal>
  );
}
