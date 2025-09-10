import React, { useEffect, useState } from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';
import { useToast } from '../../contexts/ToastContext';

interface UniversalMeetDetectorProps {
  reclutamientoId: string;
  meetLink: string;
}

const UniversalMeetDetector: React.FC<UniversalMeetDetectorProps> = ({
  reclutamientoId,
  meetLink
}) => {
  const [detectionMethod, setDetectionMethod] = useState<'chrome' | 'dom' | 'none'>('none');
  const [hasStarted, setHasStarted] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
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

    console.log('🎯 Iniciando detector universal de Meet...');
    setIsMonitoring(true);

    // Determinar el método de detección disponible
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      setDetectionMethod('chrome');
      console.log('🔍 Usando detección via Chrome API');
    } else {
      setDetectionMethod('dom');
      console.log('🔍 Usando detección via DOM');
    }

    // Función para iniciar transcripción
    const startTranscriptionIfNeeded = () => {
      if (!hasStarted && !transcriptionState?.isRecording) {
        console.log('🎤 Iniciando transcripción automática...');
        setHasStarted(true);
        startTranscription(reclutamientoId, meetLink);
        showSuccess('🎤 Transcripción automática iniciada');
      }
    };

    // Función para detener transcripción
    const stopTranscriptionIfNeeded = () => {
      if (hasStarted && transcriptionState?.isRecording) {
        console.log('🛑 Deteniendo transcripción...');
        setHasStarted(false);
        stopTranscription();
        showSuccess('✅ Transcripción guardada');
      }
    };

    // Detección via Chrome API
    if (detectionMethod === 'chrome' && chrome.tabs) {
      const detectMeetTabs = () => {
        chrome.tabs.query({}, (tabs) => {
          try {
            const meetTabs = tabs.filter(tab => 
              tab.url && tab.url.includes('meet.google.com')
            );
            
            console.log(`🔍 Encontradas ${meetTabs.length} pestañas de Meet`);
            
            if (meetTabs.length > 0) {
              startTranscriptionIfNeeded();
            } else {
              stopTranscriptionIfNeeded();
            }
          } catch (error) {
            console.error('Error detectando pestañas de Meet:', error);
          }
        });
      };

      const handleTabCreated = (tab: chrome.tabs.Tab) => {
        if (tab.url && tab.url.includes('meet.google.com')) {
          console.log('🆕 Nueva pestaña de Meet creada:', tab.url);
          startTranscriptionIfNeeded();
        }
      };

      const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
        if (changeInfo.url && changeInfo.url.includes('meet.google.com')) {
          console.log('🔄 Pestaña actualizada a Meet:', changeInfo.url);
          startTranscriptionIfNeeded();
        }
      };

      const handleTabRemoved = (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
        console.log('🗑️ Pestaña cerrada:', tabId);
        setTimeout(() => {
          detectMeetTabs();
        }, 1000);
      };

      // Agregar listeners de Chrome
      chrome.tabs.onCreated.addListener(handleTabCreated);
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
      chrome.tabs.onRemoved.addListener(handleTabRemoved);

      // Verificar inmediatamente
      detectMeetTabs();
      
      // Configurar intervalo de verificación
      const detectionInterval = setInterval(detectMeetTabs, 5000);

      // Cleanup
      return () => {
        chrome.tabs.onCreated.removeListener(handleTabCreated);
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
        chrome.tabs.onRemoved.removeListener(handleTabRemoved);
        clearInterval(detectionInterval);
        setIsMonitoring(false);
      };
    }

    // Detección via DOM (fallback)
    if (detectionMethod === 'dom') {
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
          
          if (isMeetActive) {
            startTranscriptionIfNeeded();
          } else {
            stopTranscriptionIfNeeded();
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
            startTranscriptionIfNeeded();
          }, 2000);
        }
      };

      // Función para detectar cambios en el título
      const handleTitleChange = () => {
        const title = document.title;
        if (title.includes('Meet') || title.includes('Google Meet')) {
          console.log('📋 Título de Meet detectado:', title);
          startTranscriptionIfNeeded();
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
    }
  }, [reclutamientoId, meetLink, hasStarted, transcriptionState?.isRecording, detectionMethod, globalTranscription, startTranscription, stopTranscription, showSuccess, showError]);

  // Este componente no renderiza nada visible
  return null;
};

export default UniversalMeetDetector;
