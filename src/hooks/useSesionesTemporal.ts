import { useState, useEffect } from 'react';
import { Sesion } from '../types/sesiones';

export const useSesionesTemporal = () => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carga de datos
    const cargarSesiones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando sesiones temporales...');
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo basados en los datos reales de la API
        const sesionesEjemplo: Sesion[] = [
          {
            id: 'b40e0783-96a2-4e1d-ac72-60c7b3018196',
            titulo: 'prueba 12344 - peueba 1',
            descripcion: 'Sesión de investigación con prueba 12344 para peueba 1',
            fecha_programada: new Date('2025-09-06T04:53:00.000Z'),
            duracion_minutos: 60,
            ubicacion: 'Oficina Principal',
            investigacion_id: '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
            investigacion_nombre: 'peueba 1',
            estado: 'en_curso',
            tipo_sesion: 'presencial',
            grabacion_permitida: true,
            notas_publicas: 'Estado: En progreso',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '056ba3b4-59e5-4ac5-a251-33d7a0c5bd4b',
            titulo: 'prueba 12344 - peueba 1',
            descripcion: 'Sesión de investigación con prueba 12344 para peueba 1',
            fecha_programada: new Date('2025-09-06T04:25:00.000Z'),
            duracion_minutos: 60,
            ubicacion: 'Oficina Principal',
            investigacion_id: '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
            investigacion_nombre: 'peueba 1',
            estado: 'completada',
            tipo_sesion: 'presencial',
            grabacion_permitida: true,
            notas_publicas: 'Estado: Finalizado',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'de8f32a2-eb05-4ca9-92b9-64bebadbbb81',
            titulo: 'prueba 12344 - prueba ivestigacion nueva',
            descripcion: 'Sesión de investigación con prueba 12344 para prueba ivestigacion nueva',
            fecha_programada: new Date('2025-09-04T19:17:00.000Z'),
            duracion_minutos: 60,
            ubicacion: 'Oficina Principal',
            investigacion_id: 'df0a0338-fc66-4d15-bf63-1c6e82827386',
            investigacion_nombre: 'prueba ivestigacion nueva',
            estado: 'completada',
            tipo_sesion: 'presencial',
            grabacion_permitida: true,
            notas_publicas: 'Estado: Finalizado',
            created_at: new Date(),
            updated_at: new Date(),
          }
        ];
        
        console.log('📊 Sesiones temporales cargadas:', sesionesEjemplo.length);
        setSesiones(sesionesEjemplo);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error cargando sesiones temporales:', err);
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
