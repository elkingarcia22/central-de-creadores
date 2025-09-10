import React, { useEffect, useState } from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';
import { useToast } from '../../contexts/ToastContext';

interface AutoMeetTranscriptionProps {
  reclutamientoId: string;
  meetLink: string;
}

const AutoMeetTranscription: React.FC<AutoMeetTranscriptionProps> = ({
  reclutamientoId,
  meetLink
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { showSuccess, showError } = useToast();
  
  // Usar try-catch para manejar el caso cuando el contexto no esté disponible
  let globalTranscription = null;
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
    return null;
  }
  
  const { startTranscription, stopTranscription, transcriptionState } = globalTranscription;

  useEffect(() => {
    if (!reclutamientoId || !meetLink || !globalTranscription) {
      return;
    }

    console.log('🎯 Iniciando monitoreo automático de Meet...');
    setIsMonitoring(true);

    // Función para detectar si estamos en una sesión de Meet
    const detectMeetSession = () => {
      try {
        // Verificar si la URL actual es de Meet
        const currentUrl = window.location.href;
        const isInMeet = currentUrl.includes('meet.google.com');
        
        // Verificar si el título indica Meet activo
        const title = document.title;
        const isMeetTitle = title.includes('Meet') || title.includes('Google Meet');
        
        // Verificar si hay elementos de Meet en la página
        const meetElements = document.querySelectorAll('[data-meet], [class*="meet"], [id*="meet"]');
        const hasMeetElements = meetElements.length > 0;
        
        const isMeetActive = isInMeet || isMeetTitle || hasMeetElements;
        
        if (isMeetActive && !hasStarted && !transcriptionState?.isRecording) {
          console.log('🎤 Sesión de Meet detectada, iniciando transcripción automática...');
          setHasStarted(true);
          startTranscription(reclutamientoId, meetLink);
          showSuccess('🎤 Transcripción automática iniciada');
        } else if (!isMeetActive && hasStarted && transcriptionState?.isRecording) {
          console.log('🏁 Sesión de Meet terminada, deteniendo transcripción...');
          setHasStarted(false);
          stopTranscription();
          showSuccess('✅ Transcripción guardada');
        }
        
      } catch (error) {
        console.error('Error detectando sesión de Meet:', error);
      }
    };

    // Función para detectar clics en enlaces de Meet
    const handleMeetLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="meet.google.com"]') as HTMLAnchorElement;
      
      if (link) {
        console.log('🔗 Enlace de Meet detectado, iniciando transcripción...');
        
        // Esperar un poco para que se abra la ventana
        setTimeout(() => {
          if (!hasStarted && !transcriptionState?.isRecording) {
            setHasStarted(true);
            startTranscription(reclutamientoId, meetLink);
            showSuccess('🎤 Transcripción iniciada por enlace de Meet');
          }
        }, 2000);
      }
    };

    // Función para detectar cuando se abre una nueva ventana/pestaña
    const handleWindowOpen = () => {
      console.log('🪟 Nueva ventana abierta, verificando si es Meet...');
      
      setTimeout(() => {
        detectMeetSession();
      }, 3000);
    };

    // Función para detectar cambios en el título
    const handleTitleChange = () => {
      const title = document.title;
      if (title.includes('Meet') || title.includes('Google Meet')) {
        console.log('📋 Título de Meet detectado:', title);
        
        if (!hasStarted && !transcriptionState?.isRecording) {
          setHasStarted(true);
          startTranscription(reclutamientoId, meetLink);
          showSuccess('🎤 Transcripción iniciada por título de Meet');
        }
      }
    };

    // Función para detectar cuando se cierra la ventana
    const handleBeforeUnload = () => {
      if (transcriptionState?.isRecording) {
        console.log('🚪 Ventana cerrándose, deteniendo transcripción...');
        stopTranscription();
        setHasStarted(false);
      }
    };

    // Función para detectar cambios en la visibilidad
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visible, verificando estado de Meet...');
        detectMeetSession();
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

    // Verificar inmediatamente
    detectMeetSession();
    
    // Configurar intervalo de detección cada 3 segundos
    const detectionInterval = setInterval(detectMeetSession, 3000);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleMeetLinkClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      titleObserver.disconnect();
      clearInterval(detectionInterval);
      setIsMonitoring(false);
    };
  }, [reclutamientoId, meetLink, hasStarted, transcriptionState?.isRecording, globalTranscription, startTranscription, stopTranscription, showSuccess, showError]);

  // Este componente no renderiza nada visible
  return null;
};

export default AutoMeetTranscription;
