import { useEffect, useRef } from 'react';
import { useGlobalTranscription } from '../contexts/GlobalTranscriptionContext';

interface SimpleMeetDetectionOptions {
  reclutamientoId?: string;
  meetLink?: string;
}

export const useSimpleMeetDetection = (options: SimpleMeetDetectionOptions = {}) => {
  const { reclutamientoId, meetLink } = options;
  const hasStartedRef = useRef(false);
  
  // Usar try-catch para manejar el caso cuando el contexto no esté disponible
  let globalTranscription = null;
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
    return;
  }
  
  const { startTranscription, stopTranscription, transcriptionState } = globalTranscription;

  useEffect(() => {
    if (!reclutamientoId || !meetLink || !globalTranscription) {
      return;
    }

    console.log('🎯 Iniciando detección simple de Meet...');

    // Función simple para detectar clics en enlaces de Meet
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="meet.google.com"]') as HTMLAnchorElement;
      
      if (link) {
        console.log('🔗 Enlace de Meet detectado:', link.href);
        
        // Iniciar transcripción inmediatamente
        if (!hasStartedRef.current && !transcriptionState?.isRecording) {
          console.log('🎤 Iniciando transcripción automática...');
          hasStartedRef.current = true;
          startTranscription(reclutamientoId, meetLink);
          
          // Mostrar notificación
          if (typeof window !== 'undefined' && window.alert) {
            alert('🎤 Transcripción automática iniciada!');
          }
        }
      }
    };

    // Función para detectar cuando se cierra la ventana
    const handleBeforeUnload = () => {
      if (transcriptionState?.isRecording) {
        console.log('🚪 Ventana cerrándose, deteniendo transcripción...');
        stopTranscription();
        hasStartedRef.current = false;
      }
    };

    // Agregar event listeners
    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [reclutamientoId, meetLink, globalTranscription, startTranscription, stopTranscription, transcriptionState?.isRecording]);
};
