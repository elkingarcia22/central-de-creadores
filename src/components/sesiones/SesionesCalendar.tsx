import React, { useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Typography, Badge, Tooltip } from '../ui';
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
    // console.log('🔄 handleMoveSesion called:', { eventId, newDate, newTimeSlot });
    try {
      const sesion = sesionesEventos.find(s => s.id === eventId);
      if (sesion) {
        const updatedData = {
          fecha_programada: newDate,
          ...(newTimeSlot && { duracion_minutos: newTimeSlot * 30 })
        };
        await updateSesion(eventId, updatedData);
        // console.log('✅ Sesion moved successfully');
      }
    } catch (error) {
      console.error('Error moviendo sesión:', error);
    }
  }, [sesionesEventos, updateSesion]);

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
    setShowSideModal(false);
    
    console.log('🔍 [DEBUG] SesionEvent original completo:', JSON.stringify(sesion, null, 2));
    console.log('🔍 [DEBUG] Campos específicos:', {
      id: sesion.id,
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
      implementador_real: sesion.implementador_real
    });
    
    // Convertir SesionEvent a Sesion para la función de edición
    const sesionData: Sesion = {
      id: sesion.id,
      investigacion_id: sesion.investigacion_id,
      titulo: sesion.titulo,
      fecha_programada: sesion.start,
      duracion_minutos: sesion.duracion_minutos,
      estado: sesion.estado,
      moderador_id: sesion.moderador_id,
      moderador_nombre: sesion.moderador_nombre,
      // Mapear participante correctamente
      participante: sesion.participante || (sesion.participantes?.[0] ? {
        id: sesion.participantes[0].participante_id,
        nombre: sesion.participantes[0].participante_nombre || 'Sin nombre',
        email: sesion.participantes[0].participante_email || '',
        tipo: sesion.tipo_participante || 'externo'
      } : null),
      // Mapear reclutador correctamente
      reclutador: sesion.reclutador,
      reclutador_id: sesion.reclutador?.id,
      // Mapear información adicional
      investigacion_nombre: sesion.investigacion_nombre,
      tipo_participante: sesion.tipo_participante,
      estado_agendamiento: sesion.estado_agendamiento,
      hora_sesion: sesion.hora_sesion,
      fecha_asignado: sesion.fecha_asignado,
      created_at: sesion.created_at,
      updated_at: sesion.updated_at,
      tipo_sesion: sesion.tipo_sesion || 'virtual',
      grabacion_permitida: sesion.grabacion_permitida || false,
      // Agregar campos enriquecidos del reclutamiento
      ...(sesion.estado_real && { estado_real: sesion.estado_real }),
      ...(sesion.responsable_real && { responsable_real: sesion.responsable_real }),
      ...(sesion.implementador_real && { implementador_real: sesion.implementador_real })
    } as any; // Usar any para permitir campos adicionales
    
    console.log('🔍 [DEBUG] SesionData convertida completa:', JSON.stringify(sesionData, null, 2));
    onSesionEdit?.(sesionData);
  }, [onSesionEdit]);

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
    
    // Construir la URL con el ID del participante y parámetro de retorno
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    const participacionUrl = `/participacion/${participanteId}?returnUrl=${returnUrl}`;
    
    console.log('🚀 Navegando a participación desde modal lateral:', participacionUrl);
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

    </div>
  );
});

SesionesCalendar.displayName = 'SesionesCalendar';

export default SesionesCalendar;
