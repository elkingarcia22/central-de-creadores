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
import { PageHeader } from './PageHeader';
import FilterLabel from './FilterLabel';
import { getUserTimezone, getCurrentDateTime, debugTimezone, getMinDate, createUTCDateFromLocal } from '../../utils/timezone';
import { getEstadoParticipanteVariant, getEstadoParticipanteText } from '../../utils/estadoUtils';
import { getTipoParticipanteVariant, getTipoParticipanteText } from '../../utils/tipoParticipanteUtils';
import CrearParticipanteExternoModal from './CrearParticipanteExternoModal';
import CrearParticipanteInternoModal from './CrearParticipanteInternoModal';
import CrearParticipanteFriendFamilyModal from './CrearParticipanteFriendFamilyModal';
import { UsersIcon } from '../icons';

interface AgregarParticipanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  reclutamiento?: any; // Datos del reclutamiento con responsable pre-cargado
  esDesdeAgendamientoPendiente?: boolean; // Nueva prop para identificar el origen
  showInvestigacionSelector?: boolean; // Nueva prop para mostrar selector de investigación
  fechaPredefinida?: Date; // Nueva prop para fecha predefinida desde el calendario
}

interface Participante {
  id: string;
  nombre: string;
  email?: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa_nombre?: string;
  productos_relacionados?: string[];
  estado?: string;
  // Propiedades adicionales para participantes externos
  rol_empresa_id?: string;
  empresa_id?: string;
  estado_participante?: string;
  doleres_necesidades?: string;
  descripción?: string;
  kam_id?: string;
  total_participaciones?: number;
  fecha_ultima_participacion?: string;
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

export default function AgregarParticipanteModal({
  isOpen,
  onClose,
  onSuccess,
  reclutamiento,
  fechaPredefinida,
  esDesdeAgendamientoPendiente = false,
  showInvestigacionSelector = false
}: AgregarParticipanteModalProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [participantesExternos, setParticipantesExternos] = useState<Participante[]>([]);
  const [participantesInternos, setParticipantesInternos] = useState<Participante[]>([]);
  const [participantesFriendFamily, setParticipantesFriendFamily] = useState<Participante[]>([]);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);

  // Estados controlados del formulario
  const [responsableId, setResponsableId] = useState('');
  const [fechaSesion, setFechaSesion] = useState(() => {
    if (fechaPredefinida) {
      return fechaPredefinida.toISOString().split('T')[0];
    }
    return '';
  });
  const [horaSesion, setHoraSesion] = useState(() => {
    if (fechaPredefinida) {
      return fechaPredefinida.toTimeString().slice(0, 5);
    }
    return '';
  });
  const [duracionSesion, setDuracionSesion] = useState('60');
  const [tipoParticipante, setTipoParticipante] = useState<'externo' | 'interno' | 'friend_family'>('externo');
  const [participanteId, setParticipanteId] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [investigacionId, setInvestigacionId] = useState('');

  // Estados para modales de crear participantes
  const [mostrarModalExterno, setMostrarModalExterno] = useState(false);
  const [mostrarModalInterno, setMostrarModalInterno] = useState(false);
  const [mostrarModalFriendFamily, setMostrarModalFriendFamily] = useState(false);

  // Función para calcular el estado de enfriamiento
  const calcularEstadoEnfriamiento = (fechaUltimaParticipacion: string | null): { estado: string, mensaje?: string } => {
    if (!fechaUltimaParticipacion) {
      return { estado: 'Disponible' };
    }

    const fechaUltima = new Date(fechaUltimaParticipacion);
    const fechaActual = new Date();
    const diferenciaDias = (fechaActual.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60 * 24);

    if (diferenciaDias < 30) {
      return {
        estado: 'Enfriamiento',
        mensaje: `Participó hace ${Math.ceil(diferenciaDias)} días. No es recomendable volver a elegirlo hasta que pasen 30 días.`
      };
    } else {
      return { estado: 'Disponible' };
    }
  };

  // Log al recibir el reclutamiento
  useEffect(() => {
    if (isOpen && reclutamiento) {
      console.log('🔍 AgregarParticipanteModal - reclutamiento recibido:', reclutamiento);
      console.log('🔍 Responsable pre-cargado:', reclutamiento.responsable_pre_cargado);
    }
  }, [isOpen, reclutamiento]);

  // Carga inicial de catálogos y valores
  useEffect(() => {
    if (!isOpen) return;
    
    console.log('🔍 Modal abierto, iniciando carga de catálogos...');
    
    // Debug de zona horaria
    debugTimezone();
    
    // Cargar catálogos con manejo de errores
    cargarCatalogos().catch(error => {
      console.error('❌ Error en cargarCatalogos:', error);
      showError('Error al cargar los datos necesarios. Por favor, intenta de nuevo.');
    });
  }, [isOpen]);

  // Establecer responsable pre-cargado después de cargar los responsables
  useEffect(() => {
    if (isOpen && reclutamiento && responsables.length > 0) {
      console.log('🔍 Debug AgregarParticipanteModal - reclutamiento:', reclutamiento);
      console.log('🔍 Responsables cargados:', responsables);
      console.log('🔍 Es desde agendamiento pendiente:', esDesdeAgendamientoPendiente);
      
      // Solo pre-cargar responsable si viene de "Agendamiento Pendiente"
      if (esDesdeAgendamientoPendiente && reclutamiento.responsable_pre_cargado) {
        console.log('🔍 Usando responsable pre-cargado desde agendamiento pendiente:', reclutamiento.responsable_pre_cargado);
        setResponsableId(reclutamiento.responsable_pre_cargado.id || '');
      } else {
        console.log('🔍 No pre-cargando responsable (no es desde agendamiento pendiente o no hay responsable pre-cargado)');
        setResponsableId(''); // Dejar vacío para que el usuario seleccione
      }
      
      // Usar fecha y hora actual
      const { date, time } = getCurrentDateTime();
      setFechaSesion(date);
      setHoraSesion(time);
      setDuracionSesion('60');
    }
  }, [isOpen, reclutamiento, responsables, esDesdeAgendamientoPendiente]);

  // Calcular estado de enfriamiento cuando se selecciona un participante externo
  useEffect(() => {
    const calcularEstadoEnfriamientoParaParticipante = async () => {
      console.log('🔍 useEffect enfriamiento ejecutándose:', { tipoParticipante, participanteId, participantesExternosLength: participantesExternos.length });
      if (tipoParticipante === 'externo' && participanteId) {
        console.log('🔍 Buscando participante externo:', participanteId);
        const selected = participantesExternos.find(p => p.id === participanteId);
        console.log('🔍 Participante encontrado en participantesExternos:', selected);
        if (selected) {
          console.log('🔍 Participante encontrado, calculando estado de enfriamiento...');
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
                
                // Actualizar el participante en el estado con el estado calculado
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
        } else {
          console.log('⚠️ Participante no encontrado en participantesExternos');
        }
      } else {
        console.log('🔍 No se ejecuta enfriamiento:', { tipoParticipante, participanteId });
      }
    };

    calcularEstadoEnfriamientoParaParticipante();
  }, [participanteId, tipoParticipante, participantesExternos]); // Agregué participantesExternos de vuelta

  // Carga catálogos
  async function cargarCatalogos() {
    try {
      console.log('🔍 Cargando catálogos...');
      setError(null); // Limpiar errores anteriores
      
      // Responsables
      console.log('👥 Cargando responsables...');
      try {
        const resp = await fetch('/api/usuarios');
        console.log('📡 Respuesta API usuarios:', resp.status, resp.statusText);
        
        if (resp.ok) {
          const data = await resp.json();
          console.log('✅ Responsables cargados:', data);
          console.log('📊 Total responsables:', data.usuarios?.length || 0);
          setResponsables(data.usuarios || []);
        } else {
          console.error('❌ Error cargando responsables:', resp.status);
          const errorText = await resp.text();
          console.error('❌ Error detallado:', errorText);
          setError(`Error cargando responsables: ${resp.status}`);
        }
      } catch (error) {
        console.error('❌ Error en fetch responsables:', error);
        setError('Error de conexión al cargar responsables');
      }

      // Investigaciones (solo si se requiere el selector)
      if (showInvestigacionSelector) {
        console.log('🔬 Cargando investigaciones...');
        try {
          const resp = await fetch('/api/investigaciones');
          console.log('📡 Respuesta API investigaciones:', resp.status, resp.statusText);
          
          if (resp.ok) {
            const data = await resp.json();
            console.log('✅ Investigaciones cargadas:', data);
            console.log('📊 Total investigaciones:', data?.length || 0);
            console.log('🔍 Primera investigación:', data?.[0]);
            // La API devuelve un array directamente, no un objeto con propiedad investigaciones
            setInvestigaciones(Array.isArray(data) ? data : []);
          } else {
            console.error('❌ Error cargando investigaciones:', resp.status);
            const errorText = await resp.text();
            console.error('❌ Error detallado:', errorText);
            setError(`Error cargando investigaciones: ${resp.status}`);
          }
        } catch (error) {
          console.error('❌ Error en fetch investigaciones:', error);
          setError('Error de conexión al cargar investigaciones');
        }
      }
      
      // Participantes externos
      console.log('👤 Cargando participantes externos...');
      try {
        const ext = await fetch('/api/participantes');
        console.log('📡 Respuesta participantes externos:', ext.status, ext.statusText);
        if (ext.ok) {
          const data = await ext.json();
          console.log('✅ Participantes externos cargados:', data);
          setParticipantesExternos((data || []).map((p: any) => ({ ...p, tipo: 'externo' })));
        } else {
          console.error('❌ Error cargando participantes externos:', ext.status);
          const errorText = await ext.text();
          console.error('❌ Error detallado:', errorText);
        }
      } catch (error) {
        console.error('❌ Error en fetch participantes externos:', error);
      }
      
      // Participantes internos
      console.log('👤 Cargando participantes internos...');
      try {
        const int = await fetch('/api/participantes-internos');
        console.log('📡 Respuesta participantes internos:', int.status, int.statusText);
        if (int.ok) {
          const data = await int.json();
          console.log('✅ Participantes internos cargados:', data);
          setParticipantesInternos((data || []).map((p: any) => ({ ...p, tipo: 'interno' })));
        } else {
          console.error('❌ Error cargando participantes internos:', int.status);
          const errorText = await int.text();
          console.error('❌ Error detallado:', errorText);
        }
      } catch (error) {
        console.error('❌ Error en fetch participantes internos:', error);
      }
      
      // Participantes Friend and Family
      console.log('👤 Cargando participantes Friend and Family...');
      try {
        const friendFamily = await fetch('/api/participantes-friend-family');
        console.log('📡 Respuesta participantes Friend and Family:', friendFamily.status, friendFamily.statusText);
        if (friendFamily.ok) {
          const data = await friendFamily.json();
          console.log('✅ Participantes Friend and Family cargados:', data);
          setParticipantesFriendFamily((data || []).map((p: any) => ({ ...p, tipo: 'friend_family' })));
        } else {
          console.error('❌ Error cargando participantes Friend and Family:', friendFamily.status);
          const errorText = await friendFamily.text();
          console.error('❌ Error detallado:', errorText);
        }
      } catch (error) {
        console.error('❌ Error en fetch participantes Friend and Family:', error);
      }
      
      console.log('✅ Catálogos cargados exitosamente');
    } catch (e) {
      console.error('❌ Error general cargando catálogos:', e);
      setError(`Error cargando catálogos: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
  }

  // Opciones del select de participante
  const participantesDisponibles = tipoParticipante === 'externo' ? participantesExternos : tipoParticipante === 'interno' ? participantesInternos : participantesFriendFamily;
  
  const responsablesArray = Array.isArray(responsables)
    ? responsables
    : (responsables as any)?.data || (responsables as any)?.usuarios || [];

  // Handler para guardar
  const handleButtonSubmit = () => {
    // Crear un evento sintético para el formulario
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  const handleGenerateMeetLink = async () => {
    try {
      console.log('🔍 Generando enlace de Meet con datos:', {
        fechaSesion,
        duracionSesion,
        titulo: 'Sesión de Reclutamiento'
      });

      const response = await fetch('/api/generate-meet-link-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaSesion,
          duracionSesion,
          titulo: 'Sesión de Reclutamiento'
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

      if (data.success && data.meetLink) {
        setMeetLink(data.meetLink);
        showSuccess('Enlace de Meet generado automáticamente');
      } else {
        console.error('❌ Respuesta sin éxito:', data);
        showError(data.error || 'Error generando enlace de Meet');
      }
    } catch (error) {
      console.error('❌ Error en la petición:', error);
      showError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 INICIANDO handleSubmit...');
    
    // Validación básica
    const camposRequeridos = { fechaSesion, horaSesion, participanteId, responsableId };
    
    // Si se requiere selector de investigación, validar que esté seleccionada
    if (showInvestigacionSelector && !investigacionId) {
      console.log('❌ Validación fallida: investigación no seleccionada');
      showError('Por favor selecciona una investigación.');
      return;
    }
    
    // Si no se requiere selector de investigación, validar que haya reclutamiento
    if (!showInvestigacionSelector && !reclutamiento) {
      console.log('❌ Validación fallida: reclutamiento requerido');
      showError('Por favor completa todos los campos requeridos, incluyendo el responsable del agendamiento.');
      return;
    }
    
    if (!fechaSesion || !horaSesion || !participanteId || !responsableId) {
      console.log('❌ Validación fallida:', camposRequeridos);
      showError('Por favor completa todos los campos requeridos, incluyendo el responsable del agendamiento.');
      return;
    }

    setLoading(true);
    try {
      // Usar la función correcta para crear fecha UTC
      const fechaHoraCompleta = createUTCDateFromLocal(fechaSesion, horaSesion);
      
      console.log('🔍 === DEBUG ENVÍO AGREGAR PARTICIPANTE ===');
      console.log('📅 Fecha seleccionada:', fechaSesion);
      console.log('🕐 Hora seleccionada:', horaSesion);
      console.log('📤 Fecha UTC enviada:', fechaHoraCompleta);
      console.log('👤 Participante seleccionado:', participanteId);
      console.log('👨‍💼 Responsable seleccionado:', responsableId);
      console.log('🔍 Reclutamiento recibido:', reclutamiento);
      console.log('🔍 Reclutamiento ID:', reclutamiento?.id);
      console.log('🔍 Tipo participante seleccionado:', tipoParticipante);
      
      // Usar el ID del reclutamiento o el investigacion_id como fallback
      // Si es desde agendamiento pendiente, usar el ID específico del reclutamiento
      let reclutamientoId = reclutamiento?.id || reclutamiento?.reclutamiento_id;
      
      // Si es desde agendamiento pendiente y tenemos un ID específico, usarlo
      if (esDesdeAgendamientoPendiente && reclutamiento?.id_original) {
        reclutamientoId = reclutamiento.id_original;
      }
      
      // Verificar si el reclutamientoId es un ID válido de reclutamiento
      // Si es el mismo que investigacion_id, probablemente no es un ID válido de reclutamiento
      const esIdValidoReclutamiento = reclutamientoId && reclutamientoId !== reclutamiento?.investigacion_id;
      
      // Si no hay reclutamiento_id válido, crear un nuevo reclutamiento
      if (!esIdValidoReclutamiento || reclutamiento?.reclutamiento_id === null) {
        // NOTA: NO eliminamos reclutamientos existentes para permitir duplicados
        console.log('🔍 Creando nuevo reclutamiento sin eliminar existentes (soporte para duplicados)');
        
        // SOLO eliminar si es desde "Agendamiento Pendiente" y hay un id_original específico
        if (esDesdeAgendamientoPendiente && reclutamiento?.id_original) {
          console.log('🔍 Eliminando SOLO el reclutamiento de "Agendamiento Pendiente" específico:', reclutamiento.id_original);
          try {
            const deleteOriginalResponse = await fetch(`/api/reclutamientos/${reclutamiento.id_original}`, {
              method: 'DELETE',
            });
            
            if (deleteOriginalResponse.ok) {
              console.log('✅ Reclutamiento de "Agendamiento Pendiente" eliminado:', reclutamiento.id_original);
            } else {
              const errorData = await deleteOriginalResponse.json();
              console.log('⚠️ No se pudo eliminar el reclutamiento de "Agendamiento Pendiente":', reclutamiento.id_original, errorData);
            }
          } catch (error) {
            console.error('❌ Error eliminando reclutamiento de "Agendamiento Pendiente":', error);
          }
        }
        
        // SEGUNDO: Actualizar el participante con información completa si es externo
        if (tipoParticipante === 'externo') {
          try {
            console.log('🔍 Actualizando participante externo con información completa...');
            
            // Obtener datos del participante seleccionado
            const participanteSeleccionado = participantesExternos.find(p => p.id === participanteId);
            console.log('🔍 Participante seleccionado:', participanteSeleccionado);
            
            if (participanteSeleccionado) {
              // Actualizar el participante con información completa
              const updateResponse = await fetch(`/api/participantes/${participanteId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  // Mantener datos existentes y agregar información faltante
                  nombre: participanteSeleccionado.nombre,
                  email: participanteSeleccionado.email || '',
                  rol_empresa_id: participanteSeleccionado.rol_empresa_id || null,
                  empresa_id: participanteSeleccionado.empresa_id || null,
                  estado_participante: participanteSeleccionado.estado_participante || null,
                  // Agregar información por defecto si no existe
                  doleres_necesidades: participanteSeleccionado.doleres_necesidades || '',
                  descripción: participanteSeleccionado.descripción || '',
                  kam_id: participanteSeleccionado.kam_id || null,
                  productos_relacionados: participanteSeleccionado.productos_relacionados || null,
                  total_participaciones: participanteSeleccionado.total_participaciones || 0,
                  fecha_ultima_participacion: participanteSeleccionado.fecha_ultima_participacion || null
                }),
              });
              
              if (updateResponse.ok) {
                console.log('✅ Participante externo actualizado exitosamente');
              } else {
                const errorData = await updateResponse.json();
                console.log('⚠️ Error actualizando participante externo:', errorData);
              }
            }
          } catch (error) {
            console.error('❌ Error actualizando participante externo:', error);
          }
        }
        
        // TERCERO: Crear el nuevo reclutamiento
        // Obtener investigacion_id del selector o del reclutamiento existente
        const investigacionIdParaEnviar = showInvestigacionSelector 
          ? investigacionId 
          : (reclutamiento?.investigacion_id || window.location.pathname.split('/').pop());
        
        const datosParaEnviar = {
          investigacion_id: investigacionIdParaEnviar,
          reclutador_id: responsableId,
          fecha_sesion: fechaHoraCompleta,
          hora_sesion: horaSesion, // Agregar hora_sesion explícitamente
          duracion_sesion: parseInt(duracionSesion),
          participantes_id: tipoParticipante === 'externo' ? participanteId : undefined,
          participantes_internos_id: tipoParticipante === 'interno' ? participanteId : undefined,
          participantes_friend_family_id: tipoParticipante === 'friend_family' ? participanteId : undefined,
          tipo_participante: tipoParticipante,
          estado_agendamiento: '0b8723e0-4f43-455d-bd95-a9576b7beb9d', // UUID de "Pendiente"
          meet_link: meetLink || null, // Agregar enlace de Meet
        };
        console.log('📤 Datos a enviar:', datosParaEnviar);
        
        const response = await fetch('/api/reclutamientos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosParaEnviar),
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Reclutamiento creado exitosamente:', responseData);
          
          showSuccess('Participante agregado exitosamente');
          onClose();
          if (onSuccess) {
            // Pasar información sobre el participante que se debe eliminar
            onSuccess(responseData.data);
          }
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Error al agregar el participante');
        }
        return;
      }
      
      // Si hay reclutamiento_id, actualizar el existente
      console.log('🔄 Actualizando reclutamiento existente...');
      const response = await fetch(`/api/reclutamientos/${reclutamientoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reclutador_id: responsableId,
          fecha_sesion: fechaHoraCompleta,
          hora_sesion: horaSesion, // Agregar hora_sesion explícitamente
          duracion_sesion: parseInt(duracionSesion),
          participantes_id: tipoParticipante === 'externo' ? participanteId : undefined,
          participantes_internos_id: tipoParticipante === 'interno' ? participanteId : undefined,
          participantes_friend_family_id: tipoParticipante === 'friend_family' ? participanteId : undefined,
          tipo_participante: tipoParticipante,
          estado_agendamiento: '0b8723e0-4f43-455d-bd95-a9576b7beb9d', // UUID de "Pendiente"
          meet_link: meetLink || null, // Agregar enlace de Meet
        }),
      });

      if (response.ok) {
        showSuccess('Participante agregado exitosamente');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al agregar el participante');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al agregar el participante');
    } finally {
      setLoading(false);
    }
  };

  console.log('🔍 DEBUG AgregarParticipanteModal - Renderizando modal');
  console.log('🔍 DEBUG - isOpen:', isOpen);
  console.log('🔍 DEBUG - SideModal props:', { isOpen, width: 'lg', showCloseButton: false });
  console.log('🔍 DEBUG - Header className:', 'mb-0 -mx-6 -mt-6');
  console.log('🔍 DEBUG - Header estructura:', 'div con -mx-6 -mt-6');
  
  const footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        onClick={handleButtonSubmit}
      >
        {loading ? 'Guardando...' : 'Agregar Participante'}
      </Button>
    </div>
  );
  
  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header usando PageHeader como en EmpresaSideModal */}
        <PageHeader
          title="Agregar Participante"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Mostrar error si existe */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Typography variant="body2" className="text-destructive">
              {error}
            </Typography>
          </div>
        )}
        
        {/* Información del agendamiento */}
        <div className="space-y-4">
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

          {/* Selector de Investigación (solo si se requiere) */}
          {showInvestigacionSelector && (
            <div className="space-y-2">
              <FilterLabel>Investigación *</FilterLabel>
              <Select
                value={investigacionId}
                onChange={setInvestigacionId}
                placeholder="Seleccionar investigación"
                disabled={loading}
                required
                className="w-full"
                options={(() => {
                  const options = investigaciones.map((investigacion) => ({
                    value: investigacion.id,
                    label: investigacion.nombre
                  }));
                  console.log('🔍 Opciones del selector de investigación:', options);
                  return options;
                })()}
              />
            </div>
          )}
        </div>

        {/* Información de la sesión */}
        <div className="space-y-4">
          <div className="space-y-4">
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
          </div>

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

          <div>
            <FilterLabel>Enlace de Google Meet</FilterLabel>
            <div className="flex space-x-2">
              <Input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateMeetLink}
                disabled={loading}
                className="whitespace-nowrap"
              >
                Generar
              </Button>
            </div>
            <Typography variant="caption" color="secondary" className="mt-1 block">
              Enlace opcional para sesiones virtuales
            </Typography>
          </div>
        </div>

        {/* Información del participante */}
        <div className="space-y-4">
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

          <div>
            <FilterLabel>Participante *</FilterLabel>
            <div className="space-y-3">
              <Select
                value={participanteId}
                onChange={v => setParticipanteId(String(v))}
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
        </div>

        {/* Información del participante seleccionado */}
        {(() => {
          const participante = participantesDisponibles.find(p => p.id === participanteId);
          console.log('🔍 Debug participante seleccionado:', {
            participanteId,
            tipoParticipante,
            participante,
            estado_calculado: participante?.estado_calculado,
            tiene_mensaje: participante?.estado_calculado?.mensaje
          });
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
                  <span className="text-sm font-medium">{getTipoParticipanteText(participante.tipo)}</span>
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
                {participante.estado_calculado ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Chip 
                      variant={getEstadoParticipanteVariant(participante.estado_calculado.estado)}
                      size="sm"
                    >
                      {getEstadoParticipanteText(participante.estado_calculado.estado)}
                    </Chip>
                  </div>
                ) : participante.estado && (
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
                    <span className="text-sm font-medium">{participante.productos_relacionados.join(', ')}</span>
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

      {/* Modales para crear participantes */}
      <CrearParticipanteExternoModal
        isOpen={mostrarModalExterno}
        onClose={() => setMostrarModalExterno(false)}
        onSuccess={(nuevoParticipante) => {
          setParticipantesExternos(prev => [...prev, nuevoParticipante]);
          setParticipanteId(nuevoParticipante.id);
          setMostrarModalExterno(false);
        }}
      />

      <CrearParticipanteInternoModal
        isOpen={mostrarModalInterno}
        onClose={() => setMostrarModalInterno(false)}
        onSuccess={(nuevoParticipante) => {
          setParticipantesInternos(prev => [...prev, nuevoParticipante]);
          setParticipanteId(nuevoParticipante.id);
          setMostrarModalInterno(false);
        }}
      />

      <CrearParticipanteFriendFamilyModal
        isOpen={mostrarModalFriendFamily}
        onClose={() => setMostrarModalFriendFamily(false)}
        onSuccess={(nuevoParticipante) => {
          setParticipantesFriendFamily(prev => [...prev, nuevoParticipante]);
          setParticipanteId(nuevoParticipante.id);
          setMostrarModalFriendFamily(false);
        }}
      />
    </SideModal>
  );
} 