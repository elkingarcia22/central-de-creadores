import { useState, useEffect, useMemo } from 'react';
import { Sesion, SesionEvent } from '../types/sesiones';
import { getTipoParticipanteVariant } from '../utils/tipoParticipanteUtils';
import { supabase } from '../api/supabase';

interface SesionesStats {
  total: number;
  programadas: number;
  enCurso: number;
  completadas: number;
  canceladas: number;
}

// Función para obtener el color de la sesión basado en el tipo de participante
const getSesionColorByParticipant = (sesion: Sesion): SesionEvent['color'] => {
  // Obtener el tipo de participante de la sesión
  const tipoParticipante = sesion.participante?.tipo || 'externo';
  
  // Mapear el tipo de participante a colores sutiles para el calendario
  switch (tipoParticipante) {
    case 'externo':
      return 'info'; // Cian sutil
    case 'interno':
      return 'primary'; // Azul sutil
    case 'friend_family':
      return 'secondary'; // Violeta sutil
    default:
      return 'primary'; // Azul por defecto
  }
};

interface UseSesionesCalendarOptions {
  investigacionId?: string;
  autoLoad?: boolean;
}

export const useSesionesCalendar = (options: UseSesionesCalendarOptions = {}) => {
  const { investigacionId, autoLoad = true } = options;
  
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SesionesStats>({
    total: 0,
    programadas: 0,
    enCurso: 0,
    completadas: 0,
    canceladas: 0
  });

  // Convertir sesiones a eventos de calendario (memoizado para mejor rendimiento)
  const sesionesEventos: SesionEvent[] = useMemo(() => {
    console.log('🔄 [EVENTS] Recalculando eventos del calendario con', sesiones.length, 'sesiones');
    return sesiones
    .filter(sesion => sesion.fecha_programada) // Filtrar sesiones sin fecha
    .map(sesion => {
      const start = new Date(sesion.fecha_programada);
      
      // Verificar que la fecha sea válida
      if (isNaN(start.getTime())) {
        console.warn('⚠️ Fecha inválida para sesión:', sesion.id, sesion.fecha_programada);
        return null;
      }
      
      const end = new Date(start.getTime() + (sesion.duracion_minutos || 60) * 60000);
    
    // Obtener color basado en el tipo de participante
        let color: SesionEvent['color'] = getSesionColorByParticipant(sesion);
    
    const event: SesionEvent = {
      // Propiedades de Sesion
      id: sesion.id,
      investigacion_id: sesion.investigacion_id,
      titulo: sesion.titulo || 'Sesión sin título',
      fecha_programada: sesion.fecha_programada,
      duracion_minutos: sesion.duracion_minutos,
      estado: sesion.estado,
      estado_agendamiento: (sesion as any).estado_agendamiento,
      moderador_id: sesion.moderador_id,
      moderador_nombre: sesion.moderador_nombre,
      participante: sesion.participante,
      tipo_participante: (sesion as any).tipo_participante || (sesion.participante as any)?.tipo || 'externo',
      created_at: sesion.created_at,
      updated_at: sesion.updated_at,
      tipo_sesion: sesion.tipo_sesion,
      grabacion_permitida: sesion.grabacion_permitida,
      // Propiedades enriquecidas del reclutamiento
      estado_real: (sesion as any).estado_real,
      responsable_real: (sesion as any).responsable_real,
      implementador_real: (sesion as any).implementador_real,
      meet_link: (sesion as any).meet_link,
      hora_sesion: (sesion as any).hora_sesion, // Agregar hora_sesion al mapeo
      // Mapear reclutador para el modal de edición
      reclutador: (() => {
        const reclutadorData = (sesion as any).reclutador;
        const responsableReal = (sesion as any).responsable_real;
        const reclutadorId = (sesion as any).reclutador_id;
        
        console.log('🔍 [HOOK] Mapeando reclutador para sesión:', sesion.id);
        console.log('🔍 [HOOK] reclutadorData:', reclutadorData);
        console.log('🔍 [HOOK] responsable_real:', responsableReal);
        console.log('🔍 [HOOK] reclutador_id:', reclutadorId);
        
        if (reclutadorData) {
          console.log('🔍 [HOOK] Usando reclutadorData existente');
          return reclutadorData;
        } else if (responsableReal || reclutadorId) {
          console.log('🔍 [HOOK] Creando reclutador desde responsable_real o reclutador_id');
          return {
            id: reclutadorId || 'unknown',
            full_name: responsableReal || (sesion as any).moderador_nombre || 'Sin responsable',
            email: '',
            avatar_url: ''
          };
        } else {
          console.log('🔍 [HOOK] No hay datos de reclutador disponibles');
          return null;
        }
      })(),
      // Propiedades adicionales de SesionEvent
      start,
      end,
      color: color,
      location: sesion.ubicacion,
      status: sesion.estado === 'completada' ? 'confirmed' : 
              sesion.estado === 'cancelada' ? 'cancelled' : 'pending',
      participantes: sesion.participantes || [],
      investigacion_nombre: sesion.investigacion_nombre,
      // Propiedades para compatibilidad con CalendarEvent
      title: sesion.titulo || 'Sesión sin título'
    };
    
    console.log('🔄 Converted sesion to event:', {
      id: event.id,
      title: event.title,
      estado: event.estado,
      estado_agendamiento: event.estado_agendamiento,
      estado_real: event.estado_real,
      meet_link: event.meet_link,
      responsable_real: event.responsable_real,
      implementador_real: event.implementador_real,
      sesionOriginal: sesion
    });
    return event;
  })
  .filter((event): event is SesionEvent => event !== null); // Filtrar eventos null
  }, [sesiones]); // Dependencia del useMemo

  const loadSesiones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando sesiones para calendario...');
      
      // Obtener información del usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Construir URL con parámetros
      const url = new URL('/api/sesiones-reclutamiento', window.location.origin);
      if (userId) {
        url.searchParams.append('userId', userId);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...(userId && { 'x-user-id': userId })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Sesiones cargadas para calendario:', data.sesiones?.length || 0);
      
      if (data.sesiones && Array.isArray(data.sesiones)) {
        // Usar las sesiones directamente sin enriquecimiento adicional para mejorar rendimiento
        console.log('📊 Usando sesiones directamente para mejorar rendimiento');
        
        const sesionesEnriquecidas = data.sesiones.map((sesion: any) => ({
          ...sesion,
          // Usar información básica disponible
          moderador_nombre: sesion.moderador_nombre || 'Sin asignar',
          estado_real: sesion.estado,
          responsable_real: sesion.moderador_nombre,
          implementador_real: sesion.moderador_nombre
        }));
        
        setSesiones(sesionesEnriquecidas);
        
        // Calcular estadísticas con datos enriquecidos
        const newStats: SesionesStats = {
          total: sesionesEnriquecidas.length,
          programadas: sesionesEnriquecidas.filter((s: Sesion) => s.estado === 'programada').length,
          enCurso: sesionesEnriquecidas.filter((s: Sesion) => s.estado === 'en_curso').length,
          completadas: sesionesEnriquecidas.filter((s: Sesion) => s.estado === 'completada').length,
          canceladas: sesionesEnriquecidas.filter((s: Sesion) => s.estado === 'cancelada').length
        };
        setStats(newStats);
      } else {
        setSesiones([]);
        setStats({
          total: 0,
          programadas: 0,
          enCurso: 0,
          completadas: 0,
          canceladas: 0
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error cargando sesiones para calendario:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las sesiones');
      setLoading(false);
    }
  };

  const createSesion = async (sesionData: any) => {
    try {
      const response = await fetch('/api/sesiones-reclutamiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sesionData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const nuevaSesion = await response.json();
      setSesiones(prev => [nuevaSesion, ...prev]);
      return nuevaSesion;
    } catch (err) {
      setError('Error al crear la sesión');
      throw err;
    }
  };

  const updateSesion = async (id: string, sesionData: any) => {
    try {
      const response = await fetch(`/api/sesiones-reclutamiento/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sesionData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const sesionActualizada = await response.json();
      console.log('🔄 [UPDATE] Actualizando estado local con sesión:', sesionActualizada);
      setSesiones(prev => {
        const nuevoEstado = prev.map(s => s.id === id ? sesionActualizada : s);
        console.log('🔄 [UPDATE] Nuevo estado de sesiones:', nuevoEstado.length, 'sesiones');
        return nuevoEstado;
      });
      return sesionActualizada;
    } catch (err) {
      setError('Error al actualizar la sesión');
      throw err;
    }
  };

  const deleteSesion = async (id: string) => {
    try {
      const response = await fetch(`/api/sesiones-reclutamiento/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setSesiones(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Error al eliminar la sesión');
      throw err;
    }
  };

  const refreshStats = () => {
    loadSesiones();
  };

  useEffect(() => {
    if (autoLoad) {
      loadSesiones();
    }
  }, [investigacionId, autoLoad]);

  return {
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
  };
};
