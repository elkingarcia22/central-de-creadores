import { useState, useEffect } from 'react';
import { Sesion } from '../types/sesiones';

export const useSesiones = () => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarSesiones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando sesiones de reclutamiento...');
        
        // Simular delay para mostrar el estado de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch('/api/sesiones-reclutamiento');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Respuesta completa:', data);
        console.log('📊 Número de sesiones:', data.sesiones?.length || 0);
        
        if (data.sesiones && Array.isArray(data.sesiones)) {
          console.log('✅ Estableciendo sesiones:', data.sesiones.length);
          setSesiones(data.sesiones);
        } else {
          console.log('⚠️ No hay sesiones en la respuesta');
          setSesiones([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error cargando sesiones:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las sesiones');
        setLoading(false);
      }
    };

    cargarSesiones();
  }, []);

  const crearSesion = async (sesion: Omit<Sesion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const nuevaSesion: Sesion = {
        ...sesion,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setSesiones(prev => [nuevaSesion, ...prev]);
      return nuevaSesion;
    } catch (err) {
      setError('Error al crear la sesión');
      throw err;
    }
  };

  const actualizarSesion = async (id: string, sesion: Partial<Sesion>) => {
    try {
      setSesiones(prev => 
        prev.map(s => 
          s.id === id 
            ? { ...s, ...sesion, updated_at: new Date() }
            : s
        )
      );
    } catch (err) {
      setError('Error al actualizar la sesión');
      throw err;
    }
  };

  const eliminarSesion = async (id: string) => {
    try {
      setSesiones(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Error al eliminar la sesión');
      throw err;
    }
  };

  return {
    sesiones,
    loading,
    error,
    crearSesion,
    actualizarSesion,
    eliminarSesion
  };
};