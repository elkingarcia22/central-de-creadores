import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

interface UseReclutamientoDataProps {
  id: string | string[] | undefined;
}

export const useReclutamientoData = ({ id }: UseReclutamientoDataProps) => {
  const { showError } = useToast();
  const [reclutamiento, setReclutamiento] = useState<any>(null);
  const [investigacion, setInvestigacion] = useState<any>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Control de carga para evitar duplicaciones
  const loadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  const reclutamientoId = Array.isArray(id) ? id[0] : id;

  const cargarParticipantes = useCallback(async () => {
    if (!reclutamientoId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      
      const response = await fetch(`/api/participantes?reclutamiento_id=${reclutamientoId}`);
      if (response.ok) {
        const data = await response.json();
        setParticipantes(data.participantes || []);
      } else {
        throw new Error('Error al cargar participantes');
      }
    } catch (error) {
      console.error('❌ Error cargando participantes:', error);
      showError('Error cargando participantes');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [reclutamientoId, showError]);

  const cargarInvestigacion = useCallback(async () => {
    if (!reclutamientoId) return;
    
    try {
      const response = await fetch(`/api/investigaciones/${reclutamientoId}`);
      if (response.ok) {
        const data = await response.json();
        setInvestigacion(data);
      }
    } catch (error) {
      console.error('❌ Error cargando investigación:', error);
    }
  }, [reclutamientoId]);

  const cargarReclutamiento = useCallback(async () => {
    if (!reclutamientoId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      
      const response = await fetch('/api/metricas-reclutamientos-simple');
      if (response.ok) {
        const data = await response.json();
        const reclutamientoEncontrado = data.investigaciones?.find(
          (r: any) => r.reclutamiento_id === reclutamientoId || r.investigacion_id === reclutamientoId
        );
        
        if (reclutamientoEncontrado) {
          setReclutamiento(reclutamientoEncontrado);
        } else {
          showError('No se pudo encontrar el reclutamiento');
        }
      } else {
        throw new Error('Error al obtener datos del reclutamiento');
      }
    } catch (error) {
      console.error('Error cargando reclutamiento:', error);
      showError('Error inesperado al cargar el reclutamiento');
    } finally {
      setLoading(false);
      loadingRef.current = false;
      setIsInitializing(false);
    }
  }, [reclutamientoId, showError]);

  // Función unificada para cargar todos los datos
  const cargarDatosCompletos = useCallback(async () => {
    const now = Date.now();
    // Evitar múltiples llamadas en menos de 1 segundo
    if (now - lastLoadTimeRef.current < 1000) {
      console.log('⚠️ Evitando carga duplicada');
      return;
    }
    
    lastLoadTimeRef.current = now;
    
    try {
      setLoading(true);
      await Promise.all([
        cargarReclutamiento(),
        cargarParticipantes(),
        cargarInvestigacion()
      ]);
    } catch (error) {
      console.error('❌ Error cargando datos completos:', error);
      showError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [cargarReclutamiento, cargarParticipantes, cargarInvestigacion, showError]);

  // Cargar datos iniciales
  useEffect(() => {
    if (reclutamientoId) {
      cargarDatosCompletos();
    }
  }, [reclutamientoId, cargarDatosCompletos]);

  return {
    reclutamiento,
    investigacion,
    participantes,
    loading,
    isInitializing,
    cargarDatosCompletos,
    cargarParticipantes,
    cargarInvestigacion,
    cargarReclutamiento
  };
};
