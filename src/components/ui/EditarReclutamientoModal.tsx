import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { SideModal } from './SideModal';
import { Typography } from './Typography';
import { Button } from './Button';
import { Select } from './Select';
import { UserSelectorWithAvatar } from './UserSelectorWithAvatar';
import { DatePicker } from './DatePicker';
import { Input } from './Input';
import { getUserTimezone, getCurrentDateTime, debugTimezone, getMinDate, createUTCDateFromLocal } from '../../utils/timezone';

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
      
      // Si hay responsable pre-cargado, usarlo
      if (reclutamiento.responsable_pre_cargado) {
        console.log('🔍 Usando responsable pre-cargado:', reclutamiento.responsable_pre_cargado);
        setResponsableId(reclutamiento.responsable_pre_cargado.id || '');
      } else {
        setResponsableId(reclutamiento.reclutador_id || '');
      }
      
      if (reclutamiento.fecha_sesion) {
        const fecha = new Date(reclutamiento.fecha_sesion);
        setFechaSesion(fecha.toISOString().slice(0, 10));
        setHoraSesion(fecha.toTimeString().slice(0, 5));
      } else {
        // Si no hay fecha de sesión, usar fecha y hora actual en zona horaria local
        const { date, time } = getCurrentDateTime();
        setFechaSesion(date);
        setHoraSesion(time);
      }
      setDuracionSesion(reclutamiento.duracion_sesion?.toString() || '60');
      setTipoParticipante(reclutamiento.tipo_participante || 'externo');
      setParticipanteId(reclutamiento.participantes_id || '');
      console.log('🔍 Debug - participanteId establecido:', reclutamiento.participantes_id);
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
      if (responsables.some(u => u.id === reclutamiento.reclutador_id)) {
        setResponsableId(reclutamiento.reclutador_id);
      }
    }
  }, [isOpen, responsables, reclutamiento]);

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
        setResponsables(data.usuarios || []);
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
      const friendFamily = await fetch('/api/participantes-friend-family');
      if (friendFamily.ok) {
        const data = await friendFamily.json();
        setParticipantesFriendFamily((data || []).map((p: any) => ({ ...p, tipo: 'friend_family' })));
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
      
      console.log('🔍 === DEBUG ENVÍO ===');
      console.log('📅 Fecha seleccionada:', fechaSesion);
      console.log('🕐 Hora seleccionada:', horaSesion);
      console.log('📤 Fecha UTC enviada:', fechaHoraCompleta);
      
      const reclutamientoData = {
        id: reclutamiento.id,
        participantes_id: participanteId,  // Usar el participante seleccionado en el modal
        reclutador_id: responsableId,
        fecha_sesion: fechaHoraCompleta,
        hora_sesion: horaSesion,
        duracion_sesion: parseInt(duracionSesion),
        investigacion_id: reclutamiento.investigacion_id,
        tipo_participante: tipoParticipante  // También usar el tipo seleccionado
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
        const response = await fetch(`/api/reclutamientos/${reclutamiento.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantes_id: participanteId,
            reclutador_id: responsableId,
            fecha_sesion: fechaHoraCompleta,
            hora_sesion: horaSesion,
            duracion_sesion: parseInt(duracionSesion),
            tipo_participante: tipoParticipante
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

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title="Editar Reclutamiento" width="lg" footer={null}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Responsable */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">Responsable del Agendamiento *</Typography>
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
          <Typography variant="subtitle2" weight="medium" className="mb-2">Fecha de la Sesión *</Typography>
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
          <Typography variant="subtitle2" weight="medium" className="mb-2">Hora de la Sesión *</Typography>
          <Input
            type="time"
            value={horaSesion}
            onChange={e => setHoraSesion(e.target.value)}
            disabled={loading}
            required
            fullWidth
          />
        </div>

        {/* Duración de la sesión */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Duración de la Sesión (minutos) *
          </Typography>
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
          <Typography variant="subtitle2" weight="medium" className="mb-2">Tipo de Participante *</Typography>
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
          <Typography variant="subtitle2" weight="medium" className="mb-2">Participante *</Typography>
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <span className="text-sm font-medium capitalize">
                    {participante.tipo === 'externo' ? 'Cliente Externo' : participante.tipo === 'interno' ? 'Cliente Interno' : 'Friend and Family'}
                  </span>
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
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className="text-sm font-medium capitalize">{participante.estado}</span>
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
                  <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <Typography variant="caption" weight="medium" className="text-warning">
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
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" type="submit" loading={loading} disabled={loading}>Guardar Cambios</Button>
        </div>
      </form>
    </SideModal>
  );
} 