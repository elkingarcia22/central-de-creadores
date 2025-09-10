import { useEffect, useRef } from 'react';
import { useGlobalTranscription } from '../contexts/GlobalTranscriptionContext';

interface AutoMeetTranscriptionOptions {
  reclutamientoId?: string;
  meetLink?: string;
  autoStart?: boolean;
}

export const useAutoMeetTranscription = (options: AutoMeetTranscriptionOptions = {}) => {
  const { startTranscription, stopTranscription, transcriptionState } = useGlobalTranscription();
  const { reclutamientoId, meetLink, autoStart = true } = options;
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!autoStart || !reclutamientoId || !meetLink || hasStartedRef.current) {
      return;
    }

    // Función para detectar cuando se hace clic en el enlace de Meet
    const handleMeetLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="meet.google.com"]') as HTMLAnchorElement;
      
      if (link && link.href === meetLink) {
        console.log('🎯 Enlace de Meet detectado, iniciando transcripción automática...');
        hasStartedRef.current = true;
        startTranscription(reclutamientoId, meetLink);
      }
    };

    // Función para detectar cuando se abre una nueva ventana/pestaña
    const handleWindowOpen = () => {
      // Verificar si se abrió una ventana de Meet
      setTimeout(() => {
        if (window.location.href.includes('meet.google.com')) {
          console.log('🎯 Ventana de Meet detectada, iniciando transcripción automática...');
          hasStartedRef.current = true;
          startTranscription(reclutamientoId, meetLink);
        }
      }, 2000);
    };

    // Función para detectar cambios en el título (indica Meet activo)
    const handleTitleChange = () => {
      const title = document.title;
      if (title.includes('Meet') || title.includes('Google Meet')) {
        console.log('🎯 Título de Meet detectado, iniciando transcripción automática...');
        hasStartedRef.current = true;
        startTranscription(reclutamientoId, meetLink);
      }
    };

    // Función para detectar cuando se cierra la ventana/pestaña
    const handleBeforeUnload = () => {
      if (transcriptionState.isRecording) {
        console.log('🏁 Ventana cerrándose, deteniendo transcripción...');
        stopTranscription();
      }
    };

    // Función para detectar cambios en la visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden && transcriptionState.isRecording) {
        console.log('👁️ Página oculta, pausando transcripción...');
        // Opcional: pausar transcripción cuando la página se oculta
      } else if (!document.hidden && transcriptionState.isRecording) {
        console.log('👁️ Página visible, reanudando transcripción...');
        // Opcional: reanudar transcripción cuando la página se hace visible
      }
    };

    // Agregar event listeners
    document.addEventListener('click', handleMeetLinkClick);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Observer para cambios en el título
    const titleObserver = new MutationObserver(handleTitleChange);
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserver.observe(titleElement, {
        childList: true,
        subtree: true
      });
    }

    // Verificar inmediatamente si ya estamos en una sesión de Meet
    if (window.location.href.includes('meet.google.com')) {
      console.log('🎯 Ya estamos en Meet, iniciando transcripción automática...');
      hasStartedRef.current = true;
      startTranscription(reclutamientoId, meetLink);
    }

    // Cleanup
    return () => {
      document.removeEventListener('click', handleMeetLinkClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      titleObserver.disconnect();
    };
  }, [reclutamientoId, meetLink, autoStart, startTranscription, stopTranscription, transcriptionState.isRecording]);

  // Función para iniciar manualmente
  const startManual = () => {
    if (reclutamientoId && meetLink) {
      hasStartedRef.current = true;
      startTranscription(reclutamientoId, meetLink);
    }
  };

  // Función para detener manualmente
  const stopManual = () => {
    hasStartedRef.current = false;
    stopTranscription();
  };

  return {
    isActive: transcriptionState.isActive,
    isRecording: transcriptionState.isRecording,
    startManual,
    stopManual,
    transcriptionState
  };
};
