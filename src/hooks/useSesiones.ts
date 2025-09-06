import { useState, useEffect, useCallback } from 'react';
import { Sesion, SesionFormData, SesionesStats } from '../types/sesiones';

interface UseSesionesOptions {
  investigacionId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  autoLoad?: boolean;
}

interface UseSesionesReturn {
  sesiones: Sesion[];
  sesionesEventos: SesionEvent[];
  loading: boolean;
  error: string | null;
  stats: SesionesStats | null;
  loadSesiones: () => Promise<void>;
  createSesion: (data: SesionFormData) => Promise<Sesion>;
  updateSesion: (id: string, data: Partial<SesionFormData>) => Promise<Sesion>;
  deleteSesion: (id: string) => Promise<void>;
  getSesionById: (id: string) => Sesion | undefined;
  getSesionesByDate: (date: Date) => Sesion[];
  getSesionesByDateRange: (startDate: Date, endDate: Date) => Sesion[];
  refreshStats: () => Promise<void>;
}

export const useSesiones = (options: UseSesionesOptions = {}): UseSesionesReturn => {
  const { investigacionId, fechaInicio, fechaFin, autoLoad = true } = options;
  
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SesionesStats | null>(null);

  // Convertir sesiones a eventos del calendario
  const sesionesEventos: SesionEvent[] = sesiones.map(sesion => {
    const start = new Date(sesion.fecha_programada);
    const end = new Date(start.getTime() + sesion.duracion_minutos * 60000);
    
    return {
      ...sesion,
      start,
      end,
      allDay: false,
      color: getEstadoColor(sesion.estado),
      attendees: sesion.observadores || [],
      location: sesion.ubicacion,
      status: getEstadoStatus(sesion.estado),
      participantes: [] // Se cargará por separado si es necesario
    };
  });

  // Función para obtener color según estado
  const getEstadoColor = (estado: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (estado) {
      case 'programada': return 'primary';
      case 'en_curso': return 'warning';
      case 'completada': return 'success';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'info';
      default: return 'secondary';
    }
  };

  // Función para obtener status según estado
  const getEstadoStatus = (estado: string): 'confirmed' | 'pending' | 'cancelled' => {
    switch (estado) {
      case 'programada': return 'confirmed';
      case 'en_curso': return 'confirmed';
      case 'completada': return 'confirmed';
      case 'cancelada': return 'cancelled';
      case 'reprogramada': return 'pending';
      default: return 'pending';
    }
  };

  // Cargar sesiones
  const loadSesiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (investigacionId) params.append('investigacion_id', investigacionId);
      if (fechaInicio) params.append('fecha_inicio', fechaInicio.toISOString());
      if (fechaFin) params.append('fecha_fin', fechaFin.toISOString());
      
      const response = await fetch(`/api/sesiones?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSesiones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando sesiones:', err);
    } finally {
      setLoading(false);
    }
  }, [investigacionId, fechaInicio, fechaFin]);

  // Crear sesión
  const createSesion = useCallback(async (data: SesionFormData): Promise<Sesion> => {
    try {
      const response = await fetch('/api/sesiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const nuevaSesion = await response.json();
      setSesiones(prev => [...prev, nuevaSesion]);
      await refreshStats();
      
      return nuevaSesion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando sesión');
      throw err;
    }
  }, []);

  // Actualizar sesión
  const updateSesion = useCallback(async (id: string, data: Partial<SesionFormData>): Promise<Sesion> => {
    try {
      const response = await fetch(`/api/sesiones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const sesionActualizada = await response.json();
      setSesiones(prev => prev.map(s => s.id === id ? sesionActualizada : s));
      await refreshStats();
      
      return sesionActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando sesión');
      throw err;
    }
  }, []);

  // Eliminar sesión
  const deleteSesion = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/sesiones/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      setSesiones(prev => prev.filter(s => s.id !== id));
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando sesión');
      throw err;
    }
  }, []);

  // Obtener sesión por ID
  const getSesionById = useCallback((id: string): Sesion | undefined => {
    return sesiones.find(s => s.id === id);
  }, [sesiones]);

  // Obtener sesiones por fecha
  const getSesionesByDate = useCallback((date: Date): Sesion[] => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return sesiones.filter(sesion => {
      const sesionDate = new Date(sesion.fecha_programada);
      return sesionDate >= targetDate && sesionDate < nextDay;
    });
  }, [sesiones]);

  // Obtener sesiones por rango de fechas
  const getSesionesByDateRange = useCallback((startDate: Date, endDate: Date): Sesion[] => {
    return sesiones.filter(sesion => {
      const sesionDate = new Date(sesion.fecha_programada);
      return sesionDate >= startDate && sesionDate <= endDate;
    });
  }, [sesiones]);

  // Refrescar estadísticas
  const refreshStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (investigacionId) params.append('investigacion_id', investigacionId);
      
      const response = await fetch(`/api/sesiones/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, [investigacionId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (autoLoad) {
      loadSesiones();
      refreshStats();
    }
  }, [autoLoad, loadSesiones, refreshStats]);

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
    getSesionById,
    getSesionesByDate,
    getSesionesByDateRange,
    refreshStats
  };
};
