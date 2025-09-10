import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import SideModal from './SideModal';
import Typography from './Typography';
import Button from './Button';
import Select from './Select';
import UserSelectorWithAvatar from './UserSelectorWithAvatar';
import DatePicker from './DatePicker';
import { TimePicker } from './TimePicker';
import Input from './Input';
import Chip from './Chip';
import { PageHeader } from './';
import FilterLabel from './FilterLabel';
import { getUserTimezone, getCurrentDateTime, debugTimezone, getMinDate, createUTCDateFromLocal } from '../../utils/timezone';
import { getEstadoParticipanteVariant, getEstadoParticipanteText } from '../../utils/estadoUtils';
import { getTipoParticipanteVariant, getTipoParticipanteText } from '../../utils/tipoParticipanteUtils';
import { UserIcon } from '../icons';

interface EditarReclutamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reclutamiento: any; // Datos del reclutamiento a editar
  onSave?: (reclutamientoData: any) => Promise<void>; // Función para guardar
}

interface Participante {
  id: string;
  nombre: string;
  email?: string;
  tipo: 'externo' | 'interno';
  empresa_nombre?: string;
  rol_empresa_nombre?: string;
  productos_relacionados?: string[];
  estado?: string;
  estado_calculado?: {
    estado: string;
    mensaje?: string;
    color?: string;
  };
}

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export default function EditarReclutamientoModal({
  isOpen,
  onClose,
  onSuccess,
  reclutamiento,
  onSave
}: EditarReclutamientoModalProps) {
  console.log('🔍 Modal: onSave recibido:', !!onSave);
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [participantesExternos, setParticipantesExternos] = useState<Participante[]>([]);
  const [participantesInternos, setParticipantesInternos] = useState<Participante[]>([]);
  const [participantesFriendFamily, setParticipantesFriendFamily] = useState<Participante[]>([]);

  // Estados controlados del formulario
  const [responsableId, setResponsableId] = useState('');
  const [fechaSesion, setFechaSesion] = useState('');
  const [horaSesion, setHoraSesion] = useState('');
  const [duracionSesion, setDuracionSesion] = useState('60');
  const [tipoParticipante, setTipoParticipante] = useState<'externo' | 'interno' | 'friend_family'>('externo');
  const [participanteId, setParticipanteId] = useState('');

  // Carga inicial de catálogos y valores
  useEffect(() => {
    if (!isOpen) return;
    
    // Debug de zona horaria
    debugTimezone();
    
    cargarCatalogos();
    if (reclutamiento) {
      console.log('🔍 Debug EditarReclutamientoModal - reclutamiento:', reclutamiento);
      console.log('🔍 responsable_pre_cargado:', reclutamiento.responsable_pre_cargado);
      console.log('🔍 reclutador_id:', reclutamiento.reclutador_id);
      console.log('🔍 reclutador:', reclutamiento.reclutador);
      
      // Si hay responsable pre-cargado, usarlo
      if (reclutamiento.responsable_pre_cargado) {
        console.log('🔍 Usando responsable pre-cargado:', reclutamiento.responsable_pre_cargado);
        setResponsableId(reclutamiento.responsable_pre_cargado.id || '');
      } else if (reclutamiento.reclutador_id) {
        console.log('🔍 Usando reclutador_id:', reclutamiento.reclutador_id);
        setResponsableId(reclutamiento.reclutador_id);
      } else {
        console.log('🔍 No se encontró responsable ni reclutador_id');
        setResponsableId('');
      }
      
      if (reclutamiento.fecha_sesion) {
        const fecha = new Date(reclutamiento.fecha_sesion);
        console.log('🔍 === DEBUG FECHA Y HORA ===');
        console.log('🔍 Fecha sesión recibida:', reclutamiento.fecha_sesion);
        console.log('🔍 Fecha parseada:', fecha);
        console.log('🔍 Hora UTC original:', fecha.toTimeString());
        console.log('🔍 Hora local:', fecha.toLocaleTimeString());
        
        setFechaSesion(fecha.toISOString().slice(0, 10));
        // Mantener la hora original de la sesión, no convertir a local
        const horaOriginal = fecha.toTimeString().slice(0, 5);
        setHoraSesion(horaOriginal);
        console.log('🔍 Hora establecida en modal:', horaOriginal);
      } else {
        // Si no hay fecha de sesión, usar fecha y hora actual en zona horaria local
        const { date, time } = getCurrentDateTime();
        setFechaSesion(date);
        setHoraSesion(time);
      }
      
      console.log('🔍 === DEBUG DURACIÓN ===');
      console.log('🔍 Duración recibida:', reclutamiento.duracion_sesion);
      console.log('🔍 Tipo de duración:', typeof reclutamiento.duracion_sesion);
      
      setDuracionSesion(reclutamiento.duracion_sesion?.toString() || '60');
      console.log('🔍 Duración establecida en modal:', reclutamiento.duracion_sesion?.toString() || '60');
      
      // Determinar tipo de participante y ID basándose en los campos disponibles
      console.log('🔍 === DEBUG PARTICIPANTE INICIAL ===');
      console.log('🔍 participantes_friend_family_id:', reclutamiento.participantes_friend_family_id);
      console.log('🔍 participantes_internos_id:', reclutamiento.participantes_internos_id);
      console.log('🔍 participantes_id:', reclutamiento.participantes_id);
      
      if (reclutamiento.participantes_friend_family_id) {
        setTipoParticipante('friend_family');
        setParticipanteId(reclutamiento.participantes_friend_family_id);
        console.log('🔍 Debug - Participante Friend & Family establecido:', reclutamiento.participantes_friend_family_id);
      } else if (reclutamiento.participantes_internos_id) {
        setTipoParticipante('interno');
        setParticipanteId(reclutamiento.participantes_internos_id);
        console.log('🔍 Debug - Participante Interno establecido:', reclutamiento.participantes_internos_id);
      } else if (reclutamiento.participantes_id) {
        setTipoParticipante('externo');
        setParticipanteId(reclutamiento.participantes_id);
        console.log('🔍 Debug - Participante Externo establecido:', reclutamiento.participantes_id);
      } else {
        setTipoParticipante('externo');
        setParticipanteId('');
        console.log('🔍 Debug - No se encontró participante, usando externo por defecto');
      }
    } else {
      // Si es un nuevo reclutamiento, usar fecha y hora actual
      const { date, time } = getCurrentDateTime();
      setFechaSesion(date);
      setHoraSesion(time);
    }
  }, [isOpen, reclutamiento]);

  // Sincroniza responsableId cuando responsables y reclutamiento estén listos
  useEffect(() => {
    if (isOpen && responsables.length > 0 && reclutamiento?.reclutador_id) {
      console.log('🔍 Sincronizando responsableId:', {
        reclutamiento_reclutador_id: reclutamiento.reclutador_id,
        responsables_disponibles: responsables.map(u => ({ id: u.id, nombre: u.full_name, email: u.email })),
        responsable_encontrado: responsables.find(u => u.id === reclutamiento.reclutador_id),
        total_responsables: responsables.length
      });
      
      if (responsables.some(u => u.id === reclutamiento.reclutador_id)) {
        setResponsableId(reclutamiento.reclutador_id);
        console.log('✅ ResponsableId establecido:', reclutamiento.reclutador_id);
      } else {
        console.log('❌ Responsable no encontrado en la lista de responsables');
        console.log('🔍 IDs disponibles:', responsables.map(u => u.id));
        console.log('🔍 ID buscado:', reclutamiento.reclutador_id);
        console.log('🔍 Tipo de ID buscado:', typeof reclutamiento.reclutador_id);
      }
    } else {
      console.log('🔍 No se puede sincronizar responsableId:', {
        isOpen,
        responsables_length: responsables.length,
        reclutamiento_reclutador_id: reclutamiento?.reclutador_id
      });
    }
  }, [isOpen, responsables, reclutamiento]);

  // Sincronizar participante después de cargar catálogos
  useEffect(() => {
    if (!isOpen || !reclutamiento) return;
    
    // Solo sincronizar si ya se cargaron los catálogos correspondientes
    const catálogosCargados = tipoParticipante === 'externo' 
      ? participantesExternos.length > 0
      : tipoParticipante === 'interno'
      ? participantesInternos.length > 0
      : participantesFriendFamily.length > 0;
    
    if (catálogosCargados && participanteId) {
      console.log('🔍 Sincronizando participante después de cargar catálogos:', {
        tipoParticipante,
        participanteId,
        catálogosCargados
      });
      
      // Verificar que el participante existe en la lista cargada
      const participantesDisponibles = tipoParticipante === 'externo' 
        ? participantesExternos 
        : tipoParticipante === 'interno'
        ? participantesInternos
        : participantesFriendFamily;
      
      const participanteExiste = participantesDisponibles.some(p => p.id === participanteId);
      console.log('🔍 Participante existe en catálogo:', participanteExiste);
      
      if (!participanteExiste) {
        console.log('⚠️ Participante no encontrado en catálogo, reseteando...');
        setParticipanteId('');
      }
    }
  }, [isOpen, reclutamiento, tipoParticipante, participanteId, participantesExternos, participantesInternos, participantesFriendFamily]);

  // Calcular estado de enfriamiento cuando se selecciona un participante externo
  useEffect(() => {
    const calcularEstadoEnfriamientoParaParticipante = async () => {
      console.log('🔍 useEffect enfriamiento ejecutándose:', { tipoParticipante, participanteId });
      if (tipoParticipante === 'externo' && participanteId) {
        console.log('🔍 Buscando participante externo:', participanteId);
        try {
          // Obtener la información actualizada del participante desde la API
          const response = await fetch(`/api/participantes-reclutamiento?participante_id_only=${participanteId}`);
          console.log('🔍 Respuesta API enfriamiento:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('🔍 Datos recibidos de API enfriamiento:', data);
            if (data.participantes && data.participantes.length > 0) {
              const participanteActualizado = data.participantes[0];
              console.log('🔍 Participante actualizado con estado de enfriamiento:', participanteActualizado);
              
              // Actualizar el participante en el estado correspondiente con el estado calculado
              setParticipantesExternos(prev => {
                const updated = prev.map(p =>
                  p.id === participanteId
                    ? { ...p, estado_calculado: participanteActualizado.estado_calculado }
                    : p
                );
                console.log('🔍 Participantes externos actualizados:', updated);
                return updated;
              });
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
  }, [participanteId, tipoParticipante]);

  // Normaliza fecha a YYYY-MM-DD
  function normalizarFechaSoloDia(fecha: string | undefined | null): string {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  // Carga catálogos
  async function cargarCatalogos() {
    try {
      // Responsables
      const resp = await fetch('/api/usuarios');
      if (resp.ok) {
        const data = await resp.json();
        console.log('🔍 Usuarios responsables cargados:', data.usuarios?.length || 0);
        console.log('🔍 Muestra de usuarios:', data.usuarios?.slice(0, 3));
        console.log('🔍 Estructura completa del primer usuario:', data.usuarios?.[0]);
        console.log('🔍 Campos disponibles:', data.usuarios?.[0] ? Object.keys(data.usuarios[0]) : 'No hay usuarios');
        setResponsables(data.usuarios || []);
      } else {
        console.log('❌ Error cargando usuarios:', resp.status, resp.statusText);
      }
      // Participantes externos
      const ext = await fetch('/api/participantes?tipo=externo');
      if (ext.ok) {
        const data = await ext.json();
        setParticipantesExternos((data || []).map((p: any) => ({ ...p, tipo: 'externo' })));
      }
      // Participantes internos
      const int = await fetch('/api/participantes-internos');
      if (int.ok) {
        const data = await int.json();
        setParticipantesInternos((data || []).map((p: any) => ({ ...p, tipo: 'interno' })));
      }
      // Participantes Friend and Family
      console.log('👥 Cargando participantes Friend and Family...');
      const friendFamily = await fetch('/api/participantes-friend-family');
      console.log('📡 Respuesta API Friend and Family:', friendFamily.status, friendFamily.statusText);
      if (friendFamily.ok) {
        const data = await friendFamily.json();
        console.log('✅ Participantes Friend and Family cargados:', data);
        const participantesFormateados = (data || []).map((p: any) => ({ ...p, tipo: 'friend_family' }));
        console.log('📊 Total participantes Friend and Family:', participantesFormateados.length);
        setParticipantesFriendFamily(participantesFormateados);
      } else {
        console.error('❌ Error cargando participantes Friend and Family:', friendFamily.status);
        const errorText = await friendFamily.text();
        console.error('❌ Error detallado:', errorText);
      }
    } catch (e) {
      showError('Error cargando catálogos');
    }
  }

  // Opciones del select de participante
  const participantesDisponibles = tipoParticipante === 'externo' ? participantesExternos : tipoParticipante === 'interno' ? participantesInternos : participantesFriendFamily;
  
  // Debug para verificar que el participante se encuentra
  useEffect(() => {
    if (isOpen && participanteId && participantesDisponibles.length > 0) {
      const participanteEncontrado = participantesDisponibles.find(p => p.id === participanteId);
      console.log('🔍 Debug - participanteId:', participanteId);
      console.log('🔍 Debug - participantesDisponibles:', participantesDisponibles);
      console.log('🔍 Debug - participanteEncontrado:', participanteEncontrado);
    }
  }, [isOpen, participanteId, participantesDisponibles]);

  const responsablesArray = Array.isArray(responsables)
    ? responsables
    : (responsables as any)?.data || (responsables as any)?.usuarios || [];

  // Handler para guardar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reclutamiento || !fechaSesion || !horaSesion) {
      showError('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      // Usar la función correcta para crear fecha UTC
      const fechaHoraCompleta = createUTCDateFromLocal(fechaSesion, horaSesion);
      
      // Determinar qué campo de participante usar según el tipo
      let campoParticipante = {};
      if (tipoParticipante === 'interno') {
        campoParticipante = { participantes_internos_id: participanteId };
      } else if (tipoParticipante === 'friend_family') {
        campoParticipante = { participantes_friend_family_id: participanteId };
      } else {
        // externo
        campoParticipante = { participantes_id: participanteId };
      }

      console.log('🔍 === DEBUG ENVÍO ===');
      console.log('📅 Fecha seleccionada:', fechaSesion);
      console.log('🕐 Hora seleccionada:', horaSesion);
      console.log('📤 Fecha UTC enviada:', fechaHoraCompleta);
      console.log('🔍 Tipo participante:', tipoParticipante);
      console.log('🔍 Campo participante a enviar:', campoParticipante);

      const reclutamientoData = {
        id: reclutamiento.id,
        ...campoParticipante,  // Usar el campo correcto según el tipo
        reclutador_id: responsableId,
        fecha_sesion: fechaHoraCompleta,
        hora_sesion: horaSesion,
        duracion_sesion: parseInt(duracionSesion)
        // Removido: investigacion_id (no se puede cambiar)
        // Removido: tipo_participante (campo no existe en la tabla)
      };

      if (onSave) {
        console.log('🔍 Modal: Usando función onSave de la página principal');
        console.log('🔍 Modal: Datos a enviar:', reclutamientoData);
        // Usar la función de guardado de la página principal
        await onSave(reclutamientoData);
        console.log('🔍 Modal: onSave completado exitosamente');
        showSuccess('Reclutamiento actualizado exitosamente');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.log('🔍 Modal: No hay función onSave, usando fallback');
        // Fallback: hacer la llamada directamente al endpoint
        const response = await fetch(`/api/sesiones-reclutamiento/${reclutamiento.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...campoParticipante,  // Usar el campo correcto según el tipo
            reclutador_id: responsableId,
            fecha_sesion: fechaHoraCompleta,
            hora_sesion: horaSesion,
            duracion_sesion: parseInt(duracionSesion)
            // Removido: tipo_participante (campo no existe en la tabla)
          }),
        });

        if (response.ok) {
          showSuccess('Reclutamiento actualizado exitosamente');
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Error al actualizar el reclutamiento');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al actualizar el reclutamiento');
    } finally {
      setLoading(false);
    }
  };

  // Función para el botón del footer
  const handleFooterSubmit = () => {
    const e = new Event('submit') as any;
    handleSubmit(e);
  };

  // Footer para el modal
  const footer = (
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
        onClick={handleFooterSubmit}
        loading={loading} 
        disabled={loading}
      >
        Guardar Cambios
      </Button>
    </div>
  );

  return (
    <SideModal isOpen={isOpen} onClose={onClose} width="lg" footer={footer} showCloseButton={false}>
      <div className="flex flex-col h-full -m-6">
        {/* Header con PageHeader */}
        <PageHeader
          title="Editar Reclutamiento"
          variant="title-only"
          onClose={onClose}
          icon={<UserIcon className="w-5 h-5" />}
        />

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            
            {/* Responsable */}
            <div>
              <FilterLabel>Responsable del Agendamiento *</FilterLabel>
              <UserSelectorWithAvatar
                value={responsableId}
                onChange={setResponsableId}
                users={responsablesArray.map(u => ({
                  id: u.id,
                  full_name: u.full_name || '',
                  email: u.email || '',
                  avatar_url: u.avatar_url || ''
                }))}
                placeholder="Seleccionar responsable"
                disabled={loading}
                required
              />
            </div>

            {/* Fecha de sesión */}
            <div>
              <FilterLabel>Fecha de la Sesión *</FilterLabel>
              <DatePicker
                value={fechaSesion}
                onChange={e => setFechaSesion(e.target.value)}
                placeholder="Seleccionar fecha"
                min={getMinDate()}
                disabled={loading}
                required
                fullWidth
              />
            </div>

            {/* Hora de sesión */}
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
              <Typography variant="caption" color="secondary" className="mt-1 block">
                Duración en minutos (mínimo 15, máximo 8 horas)
              </Typography>
            </div>

            {/* Tipo de participante */}
            <div>
              <FilterLabel>Tipo de Participante *</FilterLabel>
              <Select
                value={tipoParticipante}
                onChange={(value) => {
                  const newTipo = value as 'externo' | 'interno' | 'friend_family';
                  setTipoParticipante(newTipo);
                  // Solo resetear si el participante actual no es del tipo seleccionado
                  const participanteActual = newTipo === 'externo' 
                    ? participantesExternos.find(p => p.id === participanteId)
                    : newTipo === 'interno'
                    ? participantesInternos.find(p => p.id === participanteId)
                    : participantesFriendFamily.find(p => p.id === participanteId);
                  if (!participanteActual) {
                    setParticipanteId('');
                  }
                }}
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
              <Select
                value={participanteId}
                onChange={v => setParticipanteId(String(v))}
                placeholder={`Seleccionar participante ${tipoParticipante}`}
                options={participantesDisponibles.map(p => ({ value: p.id, label: p.nombre }))}
                disabled={loading}
                fullWidth
              />
            </div>

            {/* Información del participante seleccionado */}
            {(() => {
              const participante = participantesDisponibles.find(p => p.id === participanteId);
              if (!participante) return null;
              return (
                <div className="p-4 bg-muted rounded-lg mt-2">
                  <Typography variant="subtitle2" weight="medium" className="mb-2">
                    Participante Seleccionado
                  </Typography>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Nombre:</span>
                      <span className="text-sm font-medium">{participante.nombre}</span>
                    </div>
                    {participante.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm font-medium">{participante.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <Chip 
                        variant={getTipoParticipanteVariant(participante.tipo)}
                        size="sm"
                      >
                        {getTipoParticipanteText(participante.tipo)}
                      </Chip>
                    </div>
                    {participante.empresa_nombre && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Empresa:</span>
                        <span className="text-sm font-medium">{participante.empresa_nombre}</span>
                      </div>
                    )}
                    {participante.rol_empresa_nombre && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rol en la Empresa:</span>
                        <span className="text-sm font-medium">{participante.rol_empresa_nombre}</span>
                      </div>
                    )}
                    {participante.estado && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estado:</span>
                        <Chip 
                          variant={getEstadoParticipanteVariant(participante.estado)}
                          size="sm"
                        >
                          {getEstadoParticipanteText(participante.estado)}
                        </Chip>
                      </div>
                    )}
                    {participante.productos_relacionados && participante.productos_relacionados.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Productos:</span>
                        <span className="text-sm font-medium">
                          {participante.productos_relacionados.map((producto: any) => 
                            typeof producto === 'string' ? producto : producto.nombre
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {/* Mostrar mensaje de enfriamiento solo para participantes externos */}
                    {tipoParticipante === 'externo' && participante.estado_calculado && participante.estado_calculado.estado === 'En enfriamiento' && participante.estado_calculado.mensaje && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-700/50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <Typography variant="caption" weight="medium" className="text-blue-600 dark:text-blue-400">
                              {participante.estado_calculado.mensaje}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </form>
        </div>
      </div>
    </SideModal>
  );
} 