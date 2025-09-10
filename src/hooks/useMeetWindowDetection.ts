import { useEffect, useRef, useState } from 'react';
import { useGlobalTranscription } from '../contexts/GlobalTranscriptionContext';

interface MeetWindowDetectionOptions {
  reclutamientoId?: string;
  meetLink?: string;
  autoStart?: boolean;
}

export const useMeetWindowDetection = (options: MeetWindowDetectionOptions = {}) => {
  const { reclutamientoId, meetLink, autoStart = true } = options;
  const [isMeetWindowOpen, setIsMeetWindowOpen] = useState(false);
  const [hasStartedTranscription, setHasStartedTranscription] = useState(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUrlRef = useRef<string>('');
  
  // Usar try-catch para manejar el caso cuando el contexto no esté disponible
  let globalTranscription = null;
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
    return {
      isMeetWindowOpen: false,
      hasStartedTranscription: false,
      startTranscription: () => {},
      stopTranscription: () => {}
    };
  }
  
  const { startTranscription, stopTranscription, transcriptionState } = globalTranscription;

  useEffect(() => {
    if (!autoStart || !reclutamientoId || !meetLink || !globalTranscription) {
      return;
    }

    // Función para detectar si hay una ventana de Meet abierta
    const detectMeetWindow = () => {
      try {
        // Verificar si la URL actual es de Meet
        const currentUrl = window.location.href;
        const isCurrentMeet = currentUrl.includes('meet.google.com');
        
        // Verificar si hay cambios en la URL (navegación a Meet)
        if (isCurrentMeet && currentUrl !== lastUrlRef.current) {
          console.log('🎯 Ventana de Meet detectada:', currentUrl);
          lastUrlRef.current = currentUrl;
          setIsMeetWindowOpen(true);
          
          // Iniciar transcripción si no ha empezado
          if (!hasStartedTranscription && !transcriptionState?.isRecording) {
            console.log('🎤 Iniciando transcripción automática...');
            setHasStartedTranscription(true);
            startTranscription(reclutamientoId, meetLink);
          }
        } else if (!isCurrentMeet && isMeetWindowOpen) {
          console.log('🏁 Ventana de Meet cerrada');
          setIsMeetWindowOpen(false);
          
          // Detener transcripción si está grabando
          if (transcriptionState?.isRecording) {
            console.log('🛑 Deteniendo transcripción...');
            stopTranscription();
            setHasStartedTranscription(false);
          }
        }
        
        // Verificar si hay pestañas de Meet abiertas usando el API de tabs (si está disponible)
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          chrome.tabs.query({}, (tabs) => {
            const meetTabs = tabs.filter(tab => 
              tab.url && tab.url.includes('meet.google.com')
            );
            
            if (meetTabs.length > 0 && !hasStartedTranscription && !transcriptionState?.isRecording) {
              console.log('🎯 Pestaña de Meet detectada via Chrome API');
              setHasStartedTranscription(true);
              startTranscription(reclutamientoId, meetLink);
            } else if (meetTabs.length === 0 && hasStartedTranscription && transcriptionState?.isRecording) {
              console.log('🏁 Todas las pestañas de Meet cerradas');
              stopTranscription();
              setHasStartedTranscription(false);
            }
          });
        }
        
      } catch (error) {
        console.error('Error detectando ventana de Meet:', error);
      }
    };

    // Función para detectar cuando se hace clic en un enlace de Meet
    const handleMeetLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="meet.google.com"]') as HTMLAnchorElement;
      
      if (link) {
        const href = link.href;
        console.log('🔗 Enlace de Meet detectado:', href);
        
        // Esperar un poco para que se abra la ventana
        setTimeout(() => {
          if (!hasStartedTranscription && !transcriptionState?.isRecording) {
            console.log('🎤 Iniciando transcripción por clic en enlace...');
            setHasStartedTranscription(true);
            startTranscription(reclutamientoId, meetLink);
          }
        }, 2000);
      }
    };

    // Función para detectar cuando se abre una nueva ventana
    const handleWindowOpen = () => {
      console.log('🪟 Nueva ventana abierta, verificando si es Meet...');
      
      // Esperar un poco para que la ventana se cargue
      setTimeout(() => {
        detectMeetWindow();
      }, 3000);
    };

    // Función para detectar cambios en el título de la página
    const handleTitleChange = () => {
      const title = document.title;
      if (title.includes('Meet') || title.includes('Google Meet')) {
        console.log('📋 Título de Meet detectado:', title);
        
        if (!hasStartedTranscription && !transcriptionState?.isRecording) {
          console.log('🎤 Iniciando transcripción por título de Meet...');
          setHasStartedTranscription(true);
          startTranscription(reclutamientoId, meetLink);
        }
      }
    };

    // Función para detectar cuando se cierra la ventana
    const handleBeforeUnload = () => {
      if (transcriptionState?.isRecording) {
        console.log('🚪 Ventana cerrándose, deteniendo transcripción...');
        stopTranscription();
        setHasStartedTranscription(false);
      }
    };

    // Función para detectar cambios en la visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Página oculta');
      } else {
        console.log('👁️ Página visible, verificando estado de Meet...');
        detectMeetWindow();
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

    // Verificar inmediatamente si ya estamos en Meet
    detectMeetWindow();
    
    // Configurar intervalo de detección cada 2 segundos
    detectionIntervalRef.current = setInterval(detectMeetWindow, 2000);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleMeetLinkClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      titleObserver.disconnect();
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [reclutamientoId, meetLink, autoStart, hasStartedTranscription, transcriptionState?.isRecording, globalTranscription]);

  // Función para iniciar manualmente
  const startTranscriptionManual = () => {
    if (reclutamientoId && meetLink && globalTranscription) {
      setHasStartedTranscription(true);
      startTranscription(reclutamientoId, meetLink);
    }
  };

  // Función para detener manualmente
  const stopTranscriptionManual = () => {
    if (globalTranscription) {
      setHasStartedTranscription(false);
      stopTranscription();
    }
  };

  return {
    isMeetWindowOpen,
    hasStartedTranscription,
    startTranscription: startTranscriptionManual,
    stopTranscription: stopTranscriptionManual
  };
};
