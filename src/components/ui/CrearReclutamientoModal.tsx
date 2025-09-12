import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { obtenerUsuarios } from '../../api/supabase-investigaciones';
import { getMinDate, createUTCDateFromLocal } from '../../utils/timezone';
import { getEstadoParticipanteVariant, getEstadoParticipanteText } from '../../utils/estadoUtils';
import { getTipoParticipanteVariant, getTipoParticipanteText } from '../../utils/tipoParticipanteUtils';
import { 
  SideModal, 
  Typography, 
  Button, 
  Input, 
  Select, 
  UserSelectorWithAvatar,
  DatePicker,
  TimePicker,
  Chip,
  PageHeader
} from './index';
import FilterLabel from './FilterLabel';
import CrearParticipanteExternoModal from './CrearParticipanteExternoModal';
import CrearParticipanteInternoModal from './CrearParticipanteInternoModal';
import CrearParticipanteFriendFamilyModal from './CrearParticipanteFriendFamilyModal';
import { 
  UserIcon, 
  CalendarIcon, 
  BuildingIcon,
  UsersIcon,
  SaveIcon
} from '../icons';
import { obtenerUsuariosDelLibreto, combinarUsuarios, UsuarioLibreto } from '../../utils/libretoUsuarios';

interface CrearReclutamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investigacionId?: string;
  investigacionNombre?: string;
  reclutamientoExistente?: any; // Para convertir el reclutamiento existente
  responsablePreAsignado?: string; // ID del responsable ya asignado
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
  departamento_id?: string;
  departamento?: string;
  departamento_categoria?: string;
}

interface ParticipanteFriendFamily {
  id: string;
  nombre: string;
  email: string;
  departamento_id?: string;
  departamento?: string;
  departamento_categoria?: string;
}

interface RolEmpresa {
  id: string;
  nombre: string;
}

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  roles?: string[];
  created_at?: string;
}

export default function CrearReclutamientoModal({
  isOpen,
  onClose,
  onSuccess,
  investigacionId,
  investigacionNombre,
  reclutamientoExistente,
  responsablePreAsignado
}: CrearReclutamientoModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();

  // Función para actualizar usuarios del libreto
  const actualizarUsuariosDelLibreto = async (investigacionId: string) => {
    if (!investigacionId || usuariosSeleccionadosLibreto.length === 0) {
      return;
    }

    try {
      console.log('🔄 Actualizando usuarios del libreto:', usuariosSeleccionadosLibreto);
      
      const libretoResponse = await fetch('/api/libretos/actualizar-usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investigacion_id: investigacionId,
          usuarios_participantes: usuariosSeleccionadosLibreto
        }),
      });

      if (!libretoResponse.ok) {
        const errorData = await libretoResponse.json();
        console.warn('⚠️ Error actualizando libreto:', errorData.error);
        // No lanzar error aquí, solo mostrar advertencia
        showWarning('Reclutamiento creado, pero hubo un problema actualizando el libreto');
      } else {
        console.log('✅ Usuarios del libreto actualizados exitosamente');
      }
    } catch (libretoError) {
      console.warn('⚠️ Error actualizando libreto:', libretoError);
      // No lanzar error aquí, solo mostrar advertencia
      showWarning('Reclutamiento creado, pero hubo un problema actualizando el libreto');
    }
  };

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [responsableId, setResponsableId] = useState('');
  const [fechaSesion, setFechaSesion] = useState('');
  const [horaSesion, setHoraSesion] = useState('');
  const [duracionSesion, setDuracionSesion] = useState(''); // duración en minutos
  const [tipoParticipante, setTipoParticipante] = useState<'externo' | 'interno' | 'friend_family'>('externo');
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState<Participante | null>(null);
  const [meetLink, setMeetLink] = useState('');

  // Estados para datos de catálogo
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [usuariosDelLibreto, setUsuariosDelLibreto] = useState<UsuarioLibreto[]>([]);
  const [usuariosSeleccionadosLibreto, setUsuariosSeleccionadosLibreto] = useState<string[]>([]);
  const [participantesExternos, setParticipantesExternos] = useState<Participante[]>([]);
  const [participantesInternos, setParticipantesInternos] = useState<ParticipanteInterno[]>([]);
  const [participantesFriendFamily, setParticipantesFriendFamily] = useState<ParticipanteFriendFamily[]>([]);
  const [rolesEmpresa, setRolesEmpresa] = useState<RolEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<{id: string, nombre: string}[]>([]);
  const [estadosParticipante, setEstadosParticipante] = useState<{id: string, nombre: string}[]>([]);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [investigacionSeleccionada, setInvestigacionSeleccionada] = useState<any>(null);

  // Estados para modales de creación
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [mostrarModalInterno, setMostrarModalInterno] = useState(false);
  const [mostrarModalFriendFamily, setMostrarModalFriendFamily] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
      
      // Si hay un responsable pre-asignado, configurarlo
      if (responsablePreAsignado) {
        setResponsableId(responsablePreAsignado);
      }
      
      // Si hay una investigación específica, configurarla
      if (investigacionId && investigacionNombre) {
        setInvestigacionSeleccionada({
          investigacion_id: investigacionId,
          investigacion_nombre: investigacionNombre
        });
      }
    }
  }, [isOpen, investigacionId, investigacionNombre, responsablePreAsignado]);

  // Recargar responsables cuando cambie la investigación seleccionada
  useEffect(() => {
    if (isOpen && investigacionSeleccionada?.id) {
      console.log('🔄 Investigación cambiada, recargando responsables:', investigacionSeleccionada.id);
      cargarResponsables();
    }
  }, [investigacionSeleccionada?.id, isOpen]);

  // Calcular estado de enfriamiento cuando se selecciona un participante externo
  useEffect(() => {
    const calcularEstadoEnfriamientoParaParticipante = async () => {
      console.log('🔍 useEffect enfriamiento ejecutándose:', { tipoParticipante, participanteSeleccionado });
      if (tipoParticipante === 'externo' && participanteSeleccionado?.id) {
        console.log('🔍 Buscando participante externo:', participanteSeleccionado.id);
        try {
          // Obtener la información actualizada del participante desde la API
          const response = await fetch(`/api/participantes-reclutamiento?participante_id_only=${participanteSeleccionado.id}`);
          console.log('🔍 Respuesta API enfriamiento:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('🔍 Datos recibidos de API enfriamiento:', data);
            if (data.participantes && data.participantes.length > 0) {
              const participanteActualizado = data.participantes[0];
              console.log('🔍 Participante actualizado con estado de enfriamiento:', participanteActualizado);
              
              // Actualizar el participante seleccionado con el estado calculado
              setParticipanteSeleccionado(prev => 
                prev ? { ...prev, estado_calculado: participanteActualizado.estado_calculado } : null
              );
            }
          } else {
            console.error('❌ Error en API enfriamiento:', response.status);
          }
        } catch (error) {
          console.error('Error calculando estado de enfriamiento:', error);
        }
      }
    };

    calcularEstadoEnfriamientoParaParticipante();
  }, [participanteSeleccionado?.id, tipoParticipante]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarResponsables(),
        cargarParticipantesExternos(),
        cargarParticipantesInternos(),
        cargarParticipantesFriendFamily(),
        cargarInvestigaciones()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarResponsables = async () => {
    try {
      const response = await obtenerUsuarios();
      if (response.data) {
        const todosLosUsuarios = response.data;
        
        // Cargar usuarios del libreto si hay una investigación seleccionada
        if (investigacionSeleccionada?.id) {
          console.log('🔍 Cargando usuarios del libreto para investigación:', investigacionSeleccionada.id);
          const usuariosLibreto = await obtenerUsuariosDelLibreto(investigacionSeleccionada.id);
          setUsuariosDelLibreto(usuariosLibreto);
          
          // Combinar usuarios del libreto con todos los usuarios
          const usuariosCombinados = combinarUsuarios(usuariosLibreto, todosLosUsuarios);
          setResponsables(usuariosCombinados);
          
          console.log('✅ Usuarios combinados:', {
            delLibreto: usuariosLibreto.length,
            total: todosLosUsuarios.length,
            combinados: usuariosCombinados.length
          });
        } else {
          setResponsables(todosLosUsuarios);
        }
      } else {
        console.error('Error cargando responsables:', response.error);
      }
    } catch (error) {
      console.error('Error cargando responsables:', error);
    }
  };

  const cargarParticipantesExternos = async () => {
    try {
      const response = await fetch('/api/participantes');
      if (response.ok) {
        const data = await response.json();
        
        setParticipantesExternos(data.map((p: any) => {
          const participanteMapeado = {
            id: p.id,
            nombre: p.nombre,
            email: p.email,
            rol_empresa_nombre: p.rol_empresa_nombre,
            empresa_nombre: p.empresa_nombre,
            productos_relacionados: p.productos_relacionados,
            estado: p.estado, // Asegúrate de que el estado se mapee
            tipo: 'externo' as const
          };
          return participanteMapeado;
        }));
      }
    } catch (error) {
      console.error('Error cargando participantes externos:', error);
    }
  };

  const cargarParticipantesInternos = async () => {
    try {
      const response = await fetch('/api/participantes-internos');
      if (response.ok) {
        const data = await response.json();
        setParticipantesInternos(data);
      } else {
        console.error('Error cargando participantes internos:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando participantes internos:', error);
    }
  };

  const cargarParticipantesFriendFamily = async () => {
    try {
      const response = await fetch('/api/participantes-friend-family');
      if (response.ok) {
        const data = await response.json();
        setParticipantesFriendFamily(data);
      } else {
        console.error('Error cargando participantes Friend and Family:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando participantes Friend and Family:', error);
    }
  };

  const cargarRolesEmpresa = async () => {
    try {
      const response = await fetch('/api/roles-empresa');
      if (response.ok) {
        const data = await response.json();
        setRolesEmpresa(data);
      }
    } catch (error) {
      console.error('Error cargando roles de empresa:', error);
    }
  };

  const cargarEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Error cargando empresas:', error);
    }
  };

  const cargarEstadosParticipante = async () => {
    try {
      const response = await fetch('/api/estados-participante');
      if (response.ok) {
        const data = await response.json();
        setEstadosParticipante(data);
      }
    } catch (error) {
      console.error('Error cargando estados de participante:', error);
    }
  };

  const cargarInvestigaciones = async () => {
    try {
      const response = await fetch('/api/metricas-reclutamientos');
      if (response.ok) {
        const data = await response.json();
        setInvestigaciones(data.investigaciones || []);
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
    }
  };

  const handleParticipanteExternoCreado = (nuevoParticipante: any) => {
    const participanteFormateado = {
      id: nuevoParticipante.id,
      nombre: nuevoParticipante.nombre,
      email: nuevoParticipante.email || '',
      rol_empresa_nombre: nuevoParticipante.rol_empresa_nombre || 'Sin rol',
      empresa_nombre: nuevoParticipante.empresa_nombre || 'Sin empresa',
      productos_relacionados: nuevoParticipante.productos_relacionados || [],
      estado: nuevoParticipante.estado, // Asegúrate de que el estado se mapee
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones específicas
    const esInvestigacionEspecifica = investigacionId && investigacionNombre;
    
    if (!esInvestigacionEspecifica && !investigacionSeleccionada) {
      showError('Debes seleccionar una investigación');
      return;
    }

    if (!responsableId) {
      showError('Responsable del agendamiento es requerido');
      return;
    }

    if (!fechaSesion) {
      showError('Fecha de sesión es requerida');
      return;
    }

    if (!participanteSeleccionado) {
      showError('Debes seleccionar un participante');
      return;
    }

    if (!participanteSeleccionado.id) {
      showError('ID del participante es requerido');
      return;
    }

    if (!horaSesion) {
      showError('Hora de sesión es requerida');
      return;
    }

    if (!duracionSesion) {
      showError('Duración de la sesión es requerida');
      return;
    }

    try {
      setLoading(true);

      // Determinar si es actualización o creación
      const isUpdate = reclutamientoExistente && reclutamientoExistente.id;
      
      // Usar investigacionId si estamos en una investigación específica, sino usar la seleccionada
      const investigacionIdFinal = esInvestigacionEspecifica 
        ? investigacionId 
        : investigacionSeleccionada?.investigacion_id;
      
      // Usar la función correcta para crear fecha UTC
      const fechaHoraCompleta = createUTCDateFromLocal(fechaSesion, horaSesion);

      // Preparar datos según el tipo de participante
      const reclutamientoData: any = {
        investigacion_id: investigacionIdFinal,
        fecha_sesion: fechaHoraCompleta,
        hora_sesion: horaSesion, // Agregar hora_sesion explícitamente
        duracion_sesion: parseInt(duracionSesion || '60'),
        reclutador_id: responsableId,
        creado_por: responsableId,
        tipo_participante: tipoParticipante,
        meet_link: meetLink || null // Agregar enlace de Meet
      };

      // Agregar el participante correcto según el tipo
      if (tipoParticipante === 'interno') {
        reclutamientoData.participantes_internos_id = participanteSeleccionado.id;
      } else if (tipoParticipante === 'friend_family') {
        reclutamientoData.participantes_friend_family_id = participanteSeleccionado.id;
      } else {
        reclutamientoData.participantes_id = participanteSeleccionado.id;
      }

      // Si hay fecha de sesión, cambiar estado a "Pendiente", sino mantener "Pendiente de agendamiento"
      if (fechaHoraCompleta) {
        reclutamientoData.estado_agendamiento = '0b8723e0-4f43-455d-bd95-a9576b7beb9d'; // UUID de "Pendiente"
      }

      const url = isUpdate 
        ? `/api/reclutamientos/${reclutamientoExistente.id}`
        : '/api/reclutamientos';
      
      const method = isUpdate ? 'PUT' : 'POST';

      // DEBUG: Enviar datos de duración para debug
      try {
        const debugResponse = await fetch('/api/debug-duracion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duracion_sesion: duracionSesion,
            duracion_sesion_type: typeof duracionSesion
          })
        });
        const debugData = await debugResponse.json();
        console.log('🔍 DEBUG DURACIÓN - Respuesta:', debugData);
      } catch (debugError) {
        console.error('❌ Error en debug de duración:', debugError);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reclutamientoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${isUpdate ? 'actualizar' : 'crear'} participante`);
      }

      // Actualizar usuarios del libreto si han cambiado
      const investigacionIdParaLibreto = esInvestigacionEspecifica 
        ? investigacionId 
        : investigacionSeleccionada?.investigacion_id;
      
      if (investigacionIdParaLibreto) {
        await actualizarUsuariosDelLibreto(investigacionIdParaLibreto);
      }

      showSuccess(`Participante ${isUpdate ? 'actualizado' : 'agregado'} exitosamente`);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error procesando reclutamiento:', error);
      showError(error instanceof Error ? error.message : 'Error al procesar participante');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResponsableId('');
      setFechaSesion('');
      setHoraSesion('');
      setDuracionSesion('60');
      setTipoParticipante('externo');
      setParticipanteSeleccionado(null);
      setInvestigacionSeleccionada(null);
      setMostrarModalInterno(false);
      setMostrarModalExterno(false);
      setMostrarModalFriendFamily(false);
      onClose();
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        loading={loading}
        disabled={loading || !responsableId || !fechaSesion || !horaSesion || !tipoParticipante || (tipoParticipante === 'externo' && !participanteSeleccionado) || (tipoParticipante === 'interno' && !participanteSeleccionado) || (tipoParticipante === 'friend_family' && !participanteSeleccionado)}
        className="flex items-center gap-2"
      >
        <SaveIcon className="w-4 h-4" />
        Agregar Participante
      </Button>
    </div>
  );

  // Determinar si estamos en una investigación específica
  const esInvestigacionEspecifica = investigacionId && investigacionNombre;

  return (
    <>
      <SideModal
        isOpen={isOpen}
        onClose={handleClose}
        width="lg"
        footer={footer}
        showCloseButton={false}
      >
        <div className="flex flex-col h-full -m-6">
          {/* Header con PageHeader */}
          <PageHeader
            title="Agregar Participante"
            variant="title-only"
            onClose={handleClose}
            icon={<UsersIcon className="w-5 h-5" />}
            className="mb-0"
          />

          {/* Contenido del formulario */}
          <div className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Selector de investigación - Solo mostrar si no estamos en una investigación específica */}
          {!esInvestigacionEspecifica && (
            <div>
              <FilterLabel>Investigación *</FilterLabel>
              <Select
                value={investigacionSeleccionada?.investigacion_id || ''}
                onChange={(value) => {
                  const investigacion = investigaciones.find(inv => inv.investigacion_id === value);
                  setInvestigacionSeleccionada(investigacion || null);
                }}
                placeholder="Seleccionar investigación"
                options={investigaciones.map(inv => ({
                  value: inv.investigacion_id,
                  label: inv.investigacion_nombre
                }))}
                disabled={loading}
                fullWidth
              />
            </div>
          )}

          {/* Mostrar información de la investigación si estamos en una específica */}
          {esInvestigacionEspecifica && (
            <div>
              <FilterLabel>Investigación</FilterLabel>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Typography variant="body2" weight="medium">
                  {investigacionNombre}
                </Typography>
              </div>
            </div>
          )}

          {/* Responsable del agendamiento */}
          <div>
            <FilterLabel>Responsable del Agendamiento *</FilterLabel>
            <UserSelectorWithAvatar
              value={responsableId}
              onChange={setResponsableId}
              users={responsables.map(r => ({
                id: r.id,
                full_name: r.full_name || 'Sin nombre',
                email: r.email || 'sin-email@ejemplo.com',
                avatar_url: r.avatar_url
              }))}
              placeholder="Seleccionar responsable"
              disabled={loading}
              required
            />
            
            {/* Indicación de usuarios del libreto */}
            {usuariosDelLibreto.length > 0 && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <Typography variant="body2" className="text-blue-800 dark:text-blue-200">
                    <strong>Usuarios del equipo configurados en el libreto:</strong>
                  </Typography>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {usuariosDelLibreto.map((usuario) => (
                    <div key={usuario.id} className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                        {usuario.avatar_url ? (
                          <img
                            src={usuario.avatar_url}
                            alt={usuario.full_name || usuario.email}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                            {(usuario.full_name || usuario.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{usuario.full_name || usuario.email}</span>
                    </div>
                  ))}
                </div>
                <Typography variant="caption" className="text-blue-600 dark:text-blue-400 mt-1 block">
                  Estos usuarios aparecen primero en la lista y son los recomendados para esta sesión.
                </Typography>
              </div>
            )}
          </div>

          {/* Fecha de la sesión */}
          <div>
            <FilterLabel>Fecha de la Sesión *</FilterLabel>
            <DatePicker
              value={fechaSesion}
              onChange={(e) => setFechaSesion(e.target.value)}
              placeholder="Seleccionar fecha"
              min={getMinDate()}
              disabled={loading}
              required
              fullWidth
            />
          </div>

          {/* Hora de la sesión */}
          <div>
            <FilterLabel>Hora de la Sesión *</FilterLabel>
            <TimePicker
              value={horaSesion}
              onChange={setHoraSesion}
              placeholder="--:-- --"
              disabled={loading}
              format="12h"
            />
          </div>

          {/* Duración de la sesión */}
          <div>
            <FilterLabel>Duración de la Sesión (minutos) *</FilterLabel>
            <Input
              type="number"
              value={duracionSesion}
              onChange={(e) => setDuracionSesion(e.target.value)}
              placeholder="60"
              min="15"
              max="480"
              disabled={loading}
              required
              fullWidth
            />
            <Typography variant="caption" color="secondary" className="mt-1">
              Duración en minutos (mínimo 15, máximo 8 horas)
            </Typography>
          </div>

          {/* Enlace de Google Meet */}
          <div>
            <FilterLabel>Enlace de Google Meet</FilterLabel>
            <Input
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              disabled={loading}
              fullWidth
            />
            <Typography variant="caption" color="secondary" className="mt-1">
              Enlace opcional para sesiones virtuales
            </Typography>
          </div>

          {/* Tipo de participante */}
          <div>
            <FilterLabel>Tipo de Participante *</FilterLabel>
            <Select
              value={tipoParticipante}
              onChange={(value) => setTipoParticipante(value as 'externo' | 'interno' | 'friend_family')}
              options={[
                { value: 'externo', label: 'Cliente Externo' },
                { value: 'interno', label: 'Cliente Interno' },
                { value: 'friend_family', label: 'Friend and Family' }
              ]}
              placeholder="Seleccionar tipo de participante"
              disabled={loading}
              fullWidth
            />
          </div>

          {/* Participante */}
          <div>
            <FilterLabel>Participante *</FilterLabel>
            <div className="space-y-3">
              <Select
                value={participanteSeleccionado?.id || ''}
                onChange={(value) => {
                  const participante = participantesDisponibles.find(p => p.id === value);
                  setParticipanteSeleccionado(participante as any || null);
                }}
                placeholder={`Seleccionar participante ${tipoParticipante}`}
                options={participantesDisponibles.map(p => ({
                  value: p.id,
                  label: p.nombre
                }))}
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
            <div className="p-4 bg-muted rounded-lg">
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
                    <span className="text-sm font-medium">
                      {participanteSeleccionado.productos_relacionados.map((producto: any) => 
                        typeof producto === 'string' ? producto : producto.nombre
                      ).join(', ')}
                    </span>
                  </div>
                )}
                
                {/* Mostrar mensaje de enfriamiento solo para participantes externos */}
                {tipoParticipante === 'externo' && participanteSeleccionado.estado_calculado && participanteSeleccionado.estado_calculado.estado === 'En enfriamiento' && participanteSeleccionado.estado_calculado.mensaje && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-700/50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <Typography variant="caption" weight="medium" className="text-blue-600 dark:text-blue-400">
                          {participanteSeleccionado.estado_calculado.mensaje}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
            </form>
          </div>
        </div>
      </SideModal>

      {/* Modal para crear participante externo */}
      <CrearParticipanteExternoModal
        isOpen={mostrarModalExterno}
        onClose={() => setMostrarModalExterno(false)}
        onSuccess={handleParticipanteExternoCreado}
      />

      {/* Modal para crear participante interno */}
      <CrearParticipanteInternoModal
        isOpen={mostrarModalInterno}
        onClose={() => setMostrarModalInterno(false)}
        onSuccess={handleParticipanteInternoCreado}
      />

      {/* Modal para crear participante Friend and Family */}
      <CrearParticipanteFriendFamilyModal
        isOpen={mostrarModalFriendFamily}
        onClose={() => setMostrarModalFriendFamily(false)}
        onSuccess={handleParticipanteFriendFamilyCreado}
      />
    </>
  );
} 