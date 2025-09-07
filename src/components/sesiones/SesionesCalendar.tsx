import React, { useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Typography, Badge, Tooltip, EditarReclutamientoModal } from '../ui';
import GoogleCalendar from '../ui/GoogleCalendar';
import { Sesion, SesionEvent } from '../../types/sesiones';
import { useSesionesCalendar } from '../../hooks/useSesionesCalendar';
import SesionEventComponent from './SesionEvent';
import SesionEventDraggable from './SesionEventDraggable';
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

  // Manejar mover sesión
  const handleMoveSesion = useCallback(async (eventId: string, newDate: Date, newTimeSlot?: number) => {
    console.log('🔄 [MOVE] handleMoveSesion called:', { eventId, newDate, newTimeSlot });
    try {
      const sesion = sesionesEventos.find(s => s.id === eventId);
      console.log('🔍 [MOVE] Sesión encontrada:', sesion ? 'SÍ' : 'NO');
      if (sesion) {
        const updatedData = {
          fecha_programada: newDate,
          ...(newTimeSlot && { duracion_minutos: newTimeSlot * 30 })
        };
        console.log('📝 [MOVE] Datos a actualizar:', updatedData);
        const sesionActualizada = await updateSesion(eventId, updatedData);
        console.log('✅ [MOVE] Sesión movida exitosamente:', sesionActualizada);
        console.log('🔄 [MOVE] Estado actualizado, sesionesEventos debería reflejar el cambio');
        
        // Forzar recarga de sesiones para asegurar que el calendario se actualice
        console.log('🔄 [MOVE] Forzando recarga de sesiones...');
        await loadSesiones();
        console.log('✅ [MOVE] Recarga de sesiones completada');
      }
    } catch (error) {
      console.error('❌ [MOVE] Error moviendo sesión:', error);
    }
  }, [sesionesEventos, updateSesion, loadSesiones]);

  // Manejar redimensionar sesión
  const handleResizeSesion = useCallback(async (eventId: string, newDuration: number) => {
    try {
      await updateSesion(eventId, { duracion_minutos: newDuration });
    } catch (error) {
      console.error('Error redimensionando sesión:', error);
    }
  }, [updateSesion]);


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
    const participanteId = sesion.participante?.id;
    
    if (!participanteId) {
      console.error('❌ No se encontró ID del participante en la sesión:', sesion);
      return;
    }
    
    // Construir la URL con el ID del participante, reclutamiento_id y returnUrl
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    const participacionUrl = `/participacion/${participanteId}?reclutamiento_id=${sesion.id}&returnUrl=${returnUrl}`;
    
    console.log('🚀 Navegando a vista de sesión desde modal lateral:', participacionUrl);
    console.log('🚀 ID del participante:', participanteId);
    console.log('🚀 ID de reclutamiento:', sesion.id);
    console.log('🚀 URL de retorno:', returnUrl);
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

  const handleSideModalIniciar = useCallback((sesion: SesionEvent) => {
    console.log('Iniciar sesión:', sesion.id);
    // Aquí puedes implementar la lógica de iniciar sesión
    // Por ejemplo, cambiar el estado a "en_curso" o abrir la sesión
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
        onEventMove={handleMoveSesion}
        onEventResize={handleResizeSesion}
        // Props para acciones específicas
        onEventEdit={handleCalendarEventEdit}
        onEventDelete={handleCalendarEventDelete}
        onEventViewMore={handleCalendarEventViewMore}
        onEventIniciar={handleCalendarEventIniciar}
        showAddButton={false}
        showNavigation={true}
        enableDragDrop={true}
        className="min-h-[600px]"
        // Props de búsqueda
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        showSearch={true}
      />

      {/* Loading overlay */}
      {loading && (
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
        
        const reclutamientoData = {
          id: sesionToEdit.id,
          investigacion_id: sesionToEdit.investigacion_id,
          participantes_id: sesionToEdit.participante?.id,
          fecha_sesion: sesionToEdit.start,
          hora_sesion: sesionToEdit.hora_sesion,
          duracion_sesion: sesionToEdit.duracion_minutos,
          estado_agendamiento: sesionToEdit.estado_agendamiento,
          reclutador_id: sesionToEdit.reclutador?.id,
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
