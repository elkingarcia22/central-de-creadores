import React, { useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Typography, Badge, Tooltip, EditarReclutamientoModal } from '../ui';
import GoogleCalendar from '../ui/GoogleCalendar';
import { Sesion, SesionEvent } from '../../types/sesiones';
import { useSesionesCalendar } from '../../hooks/useSesionesCalendar';
import SesionEventComponent from './SesionEvent';
import SesionExpanded from './SesionExpanded';
import SesionSideModal from './SesionSideModal';
import { 
  RefreshIcon
} from '../icons';

interface SesionesCalendarProps {
  investigacionId?: string;
  onSesionClick?: (sesion: Sesion) => void;
  onSesionCreate?: (date?: Date) => void;
  onSesionEdit?: (sesion: Sesion) => void;
  onSesionDelete?: (sesion: Sesion) => void;
  onRefresh?: () => void;
  className?: string;
}

export interface SesionesCalendarRef {
  refresh: () => void;
  closeSideModal: () => void;
}

const SesionesCalendar = forwardRef<SesionesCalendarRef, SesionesCalendarProps>(({
  investigacionId,
  onSesionClick,
  onSesionCreate,
  onSesionEdit,
  onSesionDelete,
  onRefresh,
  className = ''
}, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [expandedSesion, setExpandedSesion] = useState<SesionEvent | null>(null);
  const [showSideModal, setShowSideModal] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState<SesionEvent | null>(null);
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [sesionToEdit, setSesionToEdit] = useState<SesionEvent | null>(null);
  
  // Función para manejar cambio de búsqueda
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };
  
  const router = useRouter();

  // Hook para manejar sesiones
  const {
    sesiones,
    sesionesEventos,
    loading,
    error,
    stats,
    loadSesiones,
    createSesion,
    updateSesion,
    deleteSesion,
    refreshStats
  } = useSesionesCalendar({
    investigacionId,
    autoLoad: true
  });

  // Formatear fecha para mostrar
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'month' = 'short') => {
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      month: { month: 'long', year: 'numeric' }
    };
    
    return date.toLocaleDateString('es-ES', options[format]);
  }, []);

  // Manejar click en evento
  const handleEventClick = useCallback((event: any) => {
    const sesion = sesionesEventos.find(s => s.id === event.id);
    if (sesion) {
      console.log('🔍 [CALENDAR DEBUG] Sesión encontrada para modal:', {
        id: sesion.id,
        titulo: sesion.titulo,
        participante: sesion.participante,
        estado_real: sesion.estado_real,
        responsable_real: sesion.responsable_real,
        implementador_real: sesion.implementador_real,
        investigacion_nombre: sesion.investigacion_nombre
      });
      setSelectedSesion(sesion);
      setShowSideModal(true);
      // Convertir SesionEvent a Sesion para onSesionClick
      const sesionData: Sesion = {
        id: sesion.id,
        investigacion_id: sesion.investigacion_id,
        titulo: sesion.titulo,
        fecha_programada: sesion.start,
        duracion_minutos: sesion.duracion_minutos,
        estado: sesion.estado,
        moderador_id: sesion.moderador_id,
        moderador_nombre: sesion.moderador_nombre,
        participante: sesion.participantes?.[0] ? {
        id: sesion.participantes[0].participante_id,
        nombre: sesion.participantes[0].participante_nombre || 'Sin nombre',
        email: sesion.participantes[0].participante_email || '',
        tipo: 'externo' as const
      } : null,
        investigacion_nombre: sesion.investigacion_nombre,
        created_at: sesion.created_at,
        updated_at: sesion.updated_at,
        tipo_sesion: sesion.tipo_sesion || 'virtual',
        grabacion_permitida: sesion.grabacion_permitida || false
      };
      onSesionClick?.(sesionData);
    }
  }, [sesionesEventos, onSesionClick]);

  // Manejar click en fecha
  const handleDateClick = useCallback((date: Date) => {
    onSesionCreate?.(date);
  }, [onSesionCreate]);

  // Manejar agregar evento
  const handleAddEvent = useCallback(() => {
    onSesionCreate?.();
  }, [onSesionCreate]);

  // Manejar editar sesión
  const handleEditSesion = useCallback((sesion: Sesion) => {
    onSesionEdit?.(sesion);
  }, [onSesionEdit]);

  // Manejar eliminar sesión
  const handleDeleteSesion = useCallback((sesion: Sesion) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la sesión "${sesion.titulo}"?`)) {
      deleteSesion(sesion.id);
      onSesionDelete?.(sesion);
    }
  }, [deleteSesion, onSesionDelete]);



  // Manejar cambio de vista
  const handleViewChange = useCallback((newView: 'month' | 'week' | 'day' | 'agenda') => {
    setView(newView);
  }, []);

  // Manejar cambio de fecha
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Exponer la función de actualización al componente padre
  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('🔄 Refrescando calendario desde componente padre...');
      loadSesiones();
    },
    closeSideModal: () => setShowSideModal(false)
  }), [loadSesiones]);

  // Manejar acciones del side modal
  const handleSideModalEdit = useCallback((sesion: SesionEvent) => {
    console.log('🚀 [SIDE MODAL EDIT] handleSideModalEdit ejecutándose');
    console.log('🚀 [SIDE MODAL EDIT] SesionEvent recibido:', JSON.stringify(sesion, null, 2));
    
    setShowSideModal(false);
    
    console.log('🔍 [SIDE MODAL EDIT] SesionEvent original completo:', JSON.stringify(sesion, null, 2));
    console.log('🔍 [SIDE MODAL EDIT] Campos específicos:', {
      id: sesion.id,
      title: sesion.title,
      start: sesion.start,
      end: sesion.end,
      participante: sesion.participante,
      reclutador: sesion.reclutador,
      reclutador_id: (sesion as any).reclutador_id,
      investigacion_nombre: sesion.investigacion_nombre,
      tipo_participante: sesion.tipo_participante,
      estado_agendamiento: sesion.estado_agendamiento,
      hora_sesion: sesion.hora_sesion,
      fecha_asignado: sesion.fecha_asignado,
      estado_real: sesion.estado_real,
      responsable_real: sesion.responsable_real,
      implementador_real: sesion.implementador_real,
      duracion_minutos: sesion.duracion_minutos,
      fecha_programada: sesion.fecha_programada,
      investigacion_id: sesion.investigacion_id
    });
    
    // Establecer la sesión a editar y abrir el modal directamente
    console.log('🚀 [SIDE MODAL EDIT] Estableciendo sesionToEdit:', JSON.stringify(sesion, null, 2));
    setSesionToEdit(sesion);
    console.log('🚀 [SIDE MODAL EDIT] Abriendo modal de edición');
    setShowEditModal(true);
  }, []);

  const handleSideModalDelete = useCallback((sesion: SesionEvent) => {
    // No cerrar el modal lateral inmediatamente, dejar que el modal de confirmación se maneje
    // Convertir SesionEvent a Sesion para la función de eliminación
    const sesionData: Sesion = {
      id: sesion.id,
      investigacion_id: sesion.investigacion_id,
      titulo: sesion.titulo,
      fecha_programada: sesion.start,
      duracion_minutos: sesion.duracion_minutos,
      estado: sesion.estado,
      moderador_id: sesion.moderador_id,
      moderador_nombre: sesion.moderador_nombre,
      participante: sesion.participantes?.[0] ? {
        id: sesion.participantes[0].participante_id,
        nombre: sesion.participantes[0].participante_nombre || 'Sin nombre',
        email: sesion.participantes[0].participante_email || '',
        tipo: 'externo' as const
      } : null,
      investigacion_nombre: sesion.investigacion_nombre,
      created_at: sesion.created_at,
      updated_at: sesion.updated_at,
      tipo_sesion: sesion.tipo_sesion || 'virtual',
      grabacion_permitida: sesion.grabacion_permitida || false
    };
    onSesionDelete?.(sesionData);
  }, [onSesionDelete]);

  const handleSideModalViewMore = useCallback((sesion: SesionEvent) => {
    setShowSideModal(false);
    
    // Obtener el ID del participante desde los datos de la sesión
    // Intentar obtener el ID del participante de diferentes formas
    let participanteId = null;
    
    // 1. Del objeto participante
    if (sesion.participante?.id) {
      participanteId = sesion.participante.id;
    }
    // 2. De los campos directos de participantes
    else if (sesion.participantes_id) {
      participanteId = sesion.participantes_id;
    }
    else if (sesion.participantes_internos_id) {
      participanteId = sesion.participantes_internos_id;
    }
    else if (sesion.participantes_friend_family_id) {
      participanteId = sesion.participantes_friend_family_id;
    }
    // 3. Del array de participantes (tomar el primero)
    else if (sesion.participantes && sesion.participantes.length > 0) {
      participanteId = sesion.participantes[0].participante_id;
    }
    
    console.log('🔍 [VIEW MORE] Debug - Intentando obtener participanteId:', {
      'sesion.participante?.id': sesion.participante?.id,
      'sesion.participantes_id': sesion.participantes_id,
      'sesion.participantes_internos_id': sesion.participantes_internos_id,
      'sesion.participantes_friend_family_id': sesion.participantes_friend_family_id,
      'sesion.participantes[0]?.participante_id': sesion.participantes?.[0]?.participante_id,
      'participanteId final': participanteId
    });
    
    if (!participanteId) {
      console.error('❌ [VIEW MORE] No se encontró ID del participante en la sesión:', sesion);
      console.log('🔍 [VIEW MORE] Debug - Estructura completa de sesion:', JSON.stringify(sesion, null, 2));
      return;
    }
    
    // Construir la URL con el ID del participante, reclutamiento_id y returnUrl
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    const participacionUrl = `/participacion/${participanteId}?reclutamiento_id=${sesion.id}&returnUrl=${returnUrl}`;
    
    console.log('🚀 [VIEW MORE] Navegando a vista de sesión desde modal lateral:', participacionUrl);
    console.log('🚀 [VIEW MORE] ID del participante:', participanteId);
    console.log('🚀 [VIEW MORE] ID de reclutamiento:', sesion.id);
    console.log('🚀 [VIEW MORE] URL de retorno:', returnUrl);
    router.push(participacionUrl);
  }, [router]);

  const handleSideModalDuplicate = useCallback((sesion: SesionEvent) => {
    console.log('Duplicar sesión:', sesion.id);
    // Aquí puedes implementar la lógica de duplicación
  }, []);

  const handleSideModalShare = useCallback((sesion: SesionEvent) => {
    console.log('Compartir sesión:', sesion.id);
    // Aquí puedes implementar la lógica de compartir
  }, []);

  const handleSideModalExport = useCallback((sesion: SesionEvent) => {
    console.log('Exportar sesión:', sesion.id);
    // Aquí puedes implementar la lógica de exportación
  }, []);

  const handleSideModalIniciar = useCallback(async (sesion: SesionEvent) => {
    try {
      console.log('🎯 [CALENDARIO] Iniciando sesión desde SideModal:', sesion.id);
      console.log('🔍 [CALENDARIO] Debug - sesion completa:', JSON.stringify(sesion, null, 2));
      console.log('🔍 [CALENDARIO] sesion.meet_link:', sesion.meet_link);
      
      // Verificar si es una sesión de apoyo
      const sesionData = sesion as any;
      const esSesionApoyo = sesionData.tipo === 'apoyo' || sesionData.moderador_id;
      
      console.log('🔍 [CALENDARIO] esSesionApoyo:', esSesionApoyo);
      console.log('🔍 [CALENDARIO] sesionData.tipo:', sesionData.tipo);
      console.log('🔍 [CALENDARIO] sesionData.moderador_id:', sesionData.moderador_id);
      
      // Si la sesión tiene enlace de Meet, abrirlo
      if (sesion.meet_link) {
        console.log('🔗 [CALENDARIO] Abriendo enlace de Meet:', sesion.meet_link);
        
        // Abrir Meet en nueva pestaña
        window.open(sesion.meet_link, '_blank');
        
        if (esSesionApoyo) {
          // Lógica para sesiones de apoyo
          console.log('🎯 [CALENDARIO] Procesando sesión de apoyo');
          
          // Guardar información de la sesión de apoyo en localStorage
          const sesionApoyoData = {
            id: sesion.id,
            meet_link: sesion.meet_link,
            titulo: sesion.titulo,
            fecha: sesion.start,
            moderador_id: sesionData.moderador_id,
            moderador_nombre: sesionData.moderador_nombre,
            objetivo_sesion: sesionData.objetivo_sesion,
            observadores: sesionData.observadores,
            tipo: 'apoyo'
          };
          localStorage.setItem('currentSesionApoyo', JSON.stringify(sesionApoyoData));
          console.log('💾 [CALENDARIO] Información de sesión de apoyo guardada en localStorage:', sesionApoyoData);
          
          // Redirigir a la página de sesión activa de apoyo
          if (sesionData.moderador_id) {
            console.log('🚀 [CALENDARIO] Redirigiendo a sesión activa de apoyo para moderador:', sesionData.moderador_id);
            const url = `/sesion-activa-apoyo/${sesionData.moderador_id}`;
            console.log('🔗 [CALENDARIO] URL de redirección:', url);
            if (typeof window !== 'undefined') {
              window.location.href = url;
            }
          } else {
            console.log('❌ [CALENDARIO] No se puede redirigir: No hay ID del moderador');
            if (typeof window !== 'undefined' && window.alert) {
              alert('No se pudo encontrar el ID del moderador');
            }
          }
          
        } else {
          // Lógica para sesiones de investigación (original)
          console.log('🎯 [CALENDARIO] Procesando sesión de investigación');
          
          // Guardar información del reclutamiento en localStorage para el detector global
          const reclutamientoData = {
            id: sesion.id,
            meet_link: sesion.meet_link,
            titulo: sesion.titulo,
            fecha: sesion.start
          };
          localStorage.setItem('currentReclutamiento', JSON.stringify(reclutamientoData));
          console.log('💾 [CALENDARIO] Información del reclutamiento guardada en localStorage:', reclutamientoData);
          
          // Redirigir a la página de sesión activa
          // Intentar obtener el ID del participante de diferentes formas
          let participanteId = null;
          
          // 1. Del objeto participante
          if (sesion.participante?.id) {
            participanteId = sesion.participante.id;
          }
          // 2. De los campos directos de participantes
          else if (sesion.participantes_id) {
            participanteId = sesion.participantes_id;
          }
          else if (sesion.participantes_internos_id) {
            participanteId = sesion.participantes_internos_id;
          }
          else if (sesion.participantes_friend_family_id) {
            participanteId = sesion.participantes_friend_family_id;
          }
          // 3. Del array de participantes (tomar el primero)
          else if (sesion.participantes && sesion.participantes.length > 0) {
            participanteId = sesion.participantes[0].participante_id;
          }
          
          console.log('🔍 [CALENDARIO] Debug - Intentando obtener participanteId:', {
            'sesion.participante?.id': sesion.participante?.id,
            'sesion.participantes_id': sesion.participantes_id,
            'sesion.participantes_internos_id': sesion.participantes_internos_id,
            'sesion.participantes_friend_family_id': sesion.participantes_friend_family_id,
            'sesion.participantes[0]?.participante_id': sesion.participantes?.[0]?.participante_id,
            'participanteId final': participanteId
          });
          
          if (participanteId) {
            console.log('🚀 [CALENDARIO] Redirigiendo a sesión activa para participante:', participanteId);
            if (typeof window !== 'undefined') {
              window.location.href = `/sesion-activa/${participanteId}`;
            }
          } else {
            console.log('❌ [CALENDARIO] No se puede redirigir: No hay ID de participante');
            console.log('🔍 [CALENDARIO] Debug - Estructura completa de sesion:', JSON.stringify(sesion, null, 2));
            if (typeof window !== 'undefined' && window.alert) {
              alert('No se pudo encontrar el ID del participante');
            }
          }
        }
        
      } else {
        // Si no hay enlace de Meet, solo mostrar mensaje
        console.log('⚠️ [CALENDARIO] No hay enlace de Meet en la sesión');
        if (typeof window !== 'undefined' && window.alert) {
          alert('Esta sesión no tiene enlace de Meet configurado');
        }
      }
      
    } catch (error) {
      console.error('❌ [CALENDARIO] Error iniciando sesión:', error);
      if (typeof window !== 'undefined' && window.alert) {
        alert('Error al iniciar la sesión');
      }
    }
  }, []);

  // Funciones wrapper para convertir CalendarEvent a SesionEvent
  const handleCalendarEventEdit = useCallback((event: any) => {
    console.log('🚀 [AGENDA EDIT] handleCalendarEventEdit ejecutándose');
    console.log('🚀 [AGENDA EDIT] CalendarEvent recibido:', JSON.stringify(event, null, 2));
    console.log('🚀 [AGENDA EDIT] sesionesEventos disponibles:', sesionesEventos.length);
    
    const sesion = sesionesEventos.find(s => s.id === event.id);
    console.log('🚀 [AGENDA EDIT] SesionEvent encontrado:', sesion ? 'SÍ' : 'NO');
    
    if (sesion) {
      console.log('🚀 [AGENDA EDIT] SesionEvent encontrado:', JSON.stringify(sesion, null, 2));
      handleSideModalEdit(sesion);
    } else {
      console.error('❌ [AGENDA EDIT] No se encontró SesionEvent con ID:', event.id);
      console.log('❌ [AGENDA EDIT] IDs disponibles en sesionesEventos:', sesionesEventos.map(s => s.id));
    }
  }, [sesionesEventos, handleSideModalEdit]);

  const handleCalendarEventDelete = useCallback((event: any) => {
    const sesion = sesionesEventos.find(s => s.id === event.id);
    if (sesion) {
      handleSideModalDelete(sesion);
    }
  }, [sesionesEventos, handleSideModalDelete]);

  const handleCalendarEventViewMore = useCallback((event: any) => {
    const sesion = sesionesEventos.find(s => s.id === event.id);
    if (sesion) {
      handleSideModalViewMore(sesion);
    }
  }, [sesionesEventos, handleSideModalViewMore]);

  const handleCalendarEventIniciar = useCallback((event: any) => {
    const sesion = sesionesEventos.find(s => s.id === event.id);
    if (sesion) {
      handleSideModalIniciar(sesion);
    }
  }, [sesionesEventos, handleSideModalIniciar]);

  // Funciones para manejar el modal de edición
  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSesionToEdit(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setShowEditModal(false);
    setSesionToEdit(null);
    // Recargar las sesiones
    loadSesiones();
    // Llamar al callback del componente padre si existe
    onRefresh?.();
  }, [loadSesiones, onRefresh]);



  if (error) {
    return (
      <div className="text-center py-8">
        <Typography variant="h3" color="danger" className="mb-2">
          Error al cargar sesiones
        </Typography>
        <Typography variant="body2" color="secondary" className="mb-4">
          {error}
        </Typography>
        <Button onClick={loadSesiones} variant="outline">
          <RefreshIcon className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Calendario */}
      <GoogleCalendar
        events={sesionesEventos as any}
        initialDate={currentDate}
        view={view}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onAddEvent={handleAddEvent}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        // Props para acciones específicas
        onEventEdit={handleCalendarEventEdit}
        onEventDelete={handleCalendarEventDelete}
        onEventViewMore={handleCalendarEventViewMore}
        onEventIniciar={handleCalendarEventIniciar}
        showAddButton={false}
        showNavigation={true}
        className="min-h-[600px]"
        // Props de búsqueda
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        showSearch={true}
      />

      {/* Loading overlay mejorado */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography variant="h3" className="text-gray-600 dark:text-gray-300">
              Cargando sesiones...
            </Typography>
            <Typography variant="body2" color="secondary" className="mt-2">
              Esto puede tomar unos segundos
            </Typography>
          </div>
        </div>
      )}
      
      {/* Loading overlay original (oculto) */}
      {false && loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <Typography variant="body2" color="secondary">
              Cargando sesiones...
            </Typography>
          </div>
        </div>
      )}

      {/* Side Modal de sesión */}
      <SesionSideModal
        isOpen={showSideModal}
        onClose={() => setShowSideModal(false)}
        sesion={selectedSesion}
        onIniciar={handleSideModalIniciar}
        onEdit={handleSideModalEdit}
        onDelete={handleSideModalDelete}
        onViewMore={handleSideModalViewMore}
        onDuplicate={handleSideModalDuplicate}
        onShare={handleSideModalShare}
        onExport={handleSideModalExport}
      />

      {/* Modal de sesión expandida */}
      {expandedSesion && (
        <SesionExpanded
          sesion={expandedSesion}
          onClose={() => setExpandedSesion(null)}
          onEdit={handleEditSesion}
          onDelete={handleDeleteSesion}
          onDuplicate={(sesion) => {
            // Implementar duplicación
            console.log('Duplicar sesión:', sesion.id);
          }}
          onShare={(sesion) => {
            // Implementar compartir
            console.log('Compartir sesión:', sesion.id);
          }}
          onExport={(sesion) => {
            // Implementar exportar
            console.log('Exportar sesión:', sesion.id);
          }}
        />
      )}

      {/* Modal de edición de reclutamiento */}
      {sesionToEdit && (() => {
        console.log('🚀 [AGENDA EDIT] Renderizando modal de edición');
        console.log('🚀 [AGENDA EDIT] sesionToEdit en render:', JSON.stringify(sesionToEdit, null, 2));
        
        // Mapear el participante según su tipo
        const participanteMapping = (() => {
          // Intentar obtener el ID del participante de diferentes formas
          let participanteId = null;
          
          // 1. Del objeto participante
          if (sesionToEdit.participante?.id) {
            participanteId = sesionToEdit.participante.id;
          }
          // 2. De los campos directos de participantes
          else if (sesionToEdit.participantes_id) {
            participanteId = sesionToEdit.participantes_id;
          }
          else if (sesionToEdit.participantes_internos_id) {
            participanteId = sesionToEdit.participantes_internos_id;
          }
          else if (sesionToEdit.participantes_friend_family_id) {
            participanteId = sesionToEdit.participantes_friend_family_id;
          }
          // 3. Del array de participantes (tomar el primero)
          else if (sesionToEdit.participantes && sesionToEdit.participantes.length > 0) {
            participanteId = sesionToEdit.participantes[0].participante_id;
          }
          
          const tipoParticipante = sesionToEdit.tipo_participante;
          
          console.log('🔍 [AGENDA EDIT] Mapeando participante:', { 
            participanteId, 
            tipoParticipante,
            'sesionToEdit.participante?.id': sesionToEdit.participante?.id,
            'sesionToEdit.participantes_id': sesionToEdit.participantes_id,
            'sesionToEdit.participantes_internos_id': sesionToEdit.participantes_internos_id,
            'sesionToEdit.participantes_friend_family_id': sesionToEdit.participantes_friend_family_id
          });
          
          if (!participanteId) return {};
          
          switch (tipoParticipante) {
            case 'friend_family':
              console.log('🔍 [AGENDA EDIT] Mapeando como friend_family:', { participantes_friend_family_id: participanteId });
              return { participantes_friend_family_id: participanteId };
            case 'interno':
              console.log('🔍 [AGENDA EDIT] Mapeando como interno:', { participantes_internos_id: participanteId });
              return { participantes_internos_id: participanteId };
            case 'externo':
            default:
              console.log('🔍 [AGENDA EDIT] Mapeando como externo:', { participantes_id: participanteId });
              return { participantes_id: participanteId };
          }
        })();

        const reclutamientoData = {
          id: sesionToEdit.id,
          investigacion_id: sesionToEdit.investigacion_id,
          ...participanteMapping, // Usar el mapeo correcto según el tipo
          fecha_sesion: sesionToEdit.start,
          hora_sesion: sesionToEdit.hora_sesion,
          duracion_sesion: sesionToEdit.duracion_minutos,
          estado_agendamiento: sesionToEdit.estado_agendamiento,
          // El modal busca responsable_pre_cargado, así que lo mapeamos correctamente
          responsable_pre_cargado: sesionToEdit.reclutador ? {
            id: sesionToEdit.reclutador.id,
            full_name: sesionToEdit.reclutador.full_name || sesionToEdit.reclutador.email || '',
            email: sesionToEdit.reclutador.email || '',
            avatar_url: (sesionToEdit.reclutador as any).avatar_url || ''
          } : ((sesionToEdit as any).reclutador_id ? {
            id: (sesionToEdit as any).reclutador_id,
            full_name: 'Usuario',
            email: '',
            avatar_url: ''
          } : null),
          // Asegurar que reclutador_id esté presente
          reclutador_id: sesionToEdit.reclutador?.id || (sesionToEdit as any).reclutador_id || '',
          // Agregar información adicional para el modal
          participante: sesionToEdit.participante,
          tipo_participante: sesionToEdit.tipo_participante,
          investigacion_nombre: sesionToEdit.investigacion_nombre
        };
        
        console.log('🔍 [AGENDA EDIT] Datos que se envían al modal:', JSON.stringify(reclutamientoData, null, 2));
        console.log('🔍 [AGENDA EDIT] sesionToEdit original:', JSON.stringify(sesionToEdit, null, 2));
        console.log('🔍 [AGENDA EDIT] showEditModal:', showEditModal);
        console.log('🔍 [AGENDA EDIT] Tipo de participante:', sesionToEdit.tipo_participante);
        console.log('🔍 [AGENDA EDIT] Participante completo:', JSON.stringify(sesionToEdit.participante, null, 2));
        
        return (
          <EditarReclutamientoModal
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            reclutamiento={reclutamientoData}
          />
        );
      })()}

    </div>
  );
});

SesionesCalendar.displayName = 'SesionesCalendar';

export default SesionesCalendar;
