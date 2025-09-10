import { useEffect, useState } from 'react';
import { useGlobalTranscription } from '../contexts/GlobalTranscriptionContext';

interface ChromeMeetDetectionOptions {
  reclutamientoId?: string;
  meetLink?: string;
  autoStart?: boolean;
}

export const useChromeMeetDetection = (options: ChromeMeetDetectionOptions = {}) => {
  const { reclutamientoId, meetLink, autoStart = true } = options;
  const [isChromeAvailable, setIsChromeAvailable] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Usar try-catch para manejar el caso cuando el contexto no esté disponible
  let globalTranscription = null;
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
    return {
      isChromeAvailable: false,
      hasStarted: false,
      startTranscription: () => {},
      stopTranscription: () => {}
    };
  }
  
  const { startTranscription, stopTranscription, transcriptionState } = globalTranscription;

  useEffect(() => {
    if (!autoStart || !reclutamientoId || !meetLink || !globalTranscription) {
      return;
    }

    // Verificar si Chrome API está disponible
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      setIsChromeAvailable(true);
      console.log('🔍 Chrome API disponible, iniciando detección de pestañas de Meet...');
    } else {
      console.log('⚠️ Chrome API no disponible, usando detección alternativa...');
      return;
    }

    // Función para detectar pestañas de Meet
    const detectMeetTabs = () => {
      if (!chrome.tabs) return;

      chrome.tabs.query({}, (tabs) => {
        try {
          const meetTabs = tabs.filter(tab => 
            tab.url && tab.url.includes('meet.google.com')
          );
          
          console.log(`🔍 Encontradas ${meetTabs.length} pestañas de Meet`);
          
          if (meetTabs.length > 0 && !hasStarted && !transcriptionState?.isRecording) {
            console.log('🎤 Pestaña de Meet detectada, iniciando transcripción automática...');
            setHasStarted(true);
            startTranscription(reclutamientoId, meetLink);
          } else if (meetTabs.length === 0 && hasStarted && transcriptionState?.isRecording) {
            console.log('🏁 Todas las pestañas de Meet cerradas, deteniendo transcripción...');
            setHasStarted(false);
            stopTranscription();
          }
        } catch (error) {
          console.error('Error detectando pestañas de Meet:', error);
        }
      });
    };

    // Función para detectar cuando se crea una nueva pestaña
    const handleTabCreated = (tab: chrome.tabs.Tab) => {
      if (tab.url && tab.url.includes('meet.google.com')) {
        console.log('🆕 Nueva pestaña de Meet creada:', tab.url);
        
        if (!hasStarted && !transcriptionState?.isRecording) {
          setHasStarted(true);
          startTranscription(reclutamientoId, meetLink);
        }
      }
    };

    // Función para detectar cuando se actualiza una pestaña
    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo.url && changeInfo.url.includes('meet.google.com')) {
        console.log('🔄 Pestaña actualizada a Meet:', changeInfo.url);
        
        if (!hasStarted && !transcriptionState?.isRecording) {
          setHasStarted(true);
          startTranscription(reclutamientoId, meetLink);
        }
      }
    };

    // Función para detectar cuando se cierra una pestaña
    const handleTabRemoved = (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
      console.log('🗑️ Pestaña cerrada:', tabId);
      
      // Verificar si quedan pestañas de Meet abiertas
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
    
    // Configurar intervalo de verificación cada 5 segundos
    const detectionInterval = setInterval(detectMeetTabs, 5000);

    // Cleanup
    return () => {
      if (chrome.tabs) {
        chrome.tabs.onCreated.removeListener(handleTabCreated);
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
        chrome.tabs.onRemoved.removeListener(handleTabRemoved);
      }
      clearInterval(detectionInterval);
    };
  }, [reclutamientoId, meetLink, autoStart, hasStarted, transcriptionState?.isRecording, globalTranscription]);

  // Función para iniciar manualmente
  const startTranscriptionManual = () => {
    if (reclutamientoId && meetLink && globalTranscription) {
      setHasStarted(true);
      startTranscription(reclutamientoId, meetLink);
    }
  };

  // Función para detener manualmente
  const stopTranscriptionManual = () => {
    if (globalTranscription) {
      setHasStarted(false);
      stopTranscription();
    }
  };

  return {
    isChromeAvailable,
    hasStarted,
    startTranscription: startTranscriptionManual,
    stopTranscription: stopTranscriptionManual
  };
};
