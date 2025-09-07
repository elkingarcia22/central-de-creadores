import { useState, useEffect } from 'react';
import { Sesion } from '../types/sesiones';

export const useSesionesSimple = () => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarSesiones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando sesiones...');
        
        const response = await fetch('/api/sesiones-reclutamiento');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
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

  return {
    sesiones,
    loading,
    error
  };
};
