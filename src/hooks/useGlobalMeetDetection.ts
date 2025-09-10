import { useEffect, useRef } from 'react';
import { useGlobalTranscription } from '../contexts/GlobalTranscriptionContext';

interface MeetSessionInfo {
  reclutamientoId: string;
  meetLink: string;
}

export const useGlobalMeetDetection = () => {
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMeetUrlRef = useRef<string>('');
  const activeMeetSessionsRef = useRef<Map<string, MeetSessionInfo>>(new Map());
  
  // Usar try-catch para manejar el caso cuando el contexto no esté disponible
  let globalTranscription = null;
  try {
    globalTranscription = useGlobalTranscription();
  } catch (error) {
    console.warn('GlobalTranscriptionContext no está disponible:', error);
    return {
      registerMeetSession: () => {},
      unregisterMeetSession: () => {},
      activeSessions: []
    };
  }
  
  const { startTranscription, stopTranscription, transcriptionState } = globalTranscription;

  useEffect(() => {
    if (!globalTranscription) {
      return;
    }
    
    // Función para detectar sesiones de Meet activas
    const detectMeetSessions = () => {
      try {
        // Detectar si hay pestañas de Meet abiertas
        const meetUrls = findMeetUrls();
        
        // Verificar si hay nuevas sesiones
        const newSessions = meetUrls.filter(url => !activeMeetSessionsRef.current.has(url));
        
        // Verificar si hay sesiones que se cerraron
        const closedSessions = Array.from(activeMeetSessionsRef.current.keys())
          .filter(url => !meetUrls.includes(url));
        
        // Iniciar transcripción para nuevas sesiones
        newSessions.forEach(url => {
          const sessionInfo = extractSessionInfo(url);
          if (sessionInfo) {
            console.log('🎯 Nueva sesión de Meet detectada:', sessionInfo);
            activeMeetSessionsRef.current.set(url, sessionInfo);
            
            // Solo iniciar si no hay transcripción activa
            if (!transcriptionState.isRecording) {
              startTranscription(sessionInfo.reclutamientoId, sessionInfo.meetLink);
            }
          }
        });
        
        // Detener transcripción para sesiones cerradas
        closedSessions.forEach(url => {
          console.log('🏁 Sesión de Meet cerrada:', url);
          activeMeetSessionsRef.current.delete(url);
          
          // Detener transcripción si no hay más sesiones activas
          if (activeMeetSessionsRef.current.size === 0 && transcriptionState.isRecording) {
            stopTranscription();
          }
        });
        
        lastMeetUrlRef.current = meetUrls.join(',');
        
      } catch (error) {
        console.error('Error detectando sesiones de Meet:', error);
      }
    };

    // Función para encontrar URLs de Meet en las pestañas
    const findMeetUrls = (): string[] => {
      const meetUrls: string[] = [];
      
      try {
        // Verificar si estamos en una pestaña de Meet
        if (window.location.href.includes('meet.google.com')) {
          meetUrls.push(window.location.href);
        }
        
        // Verificar si hay enlaces de Meet en la página actual
        const meetLinks = document.querySelectorAll('a[href*="meet.google.com"]');
        meetLinks.forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          if (href && !meetUrls.includes(href)) {
            meetUrls.push(href);
          }
        });
        
        // Verificar si hay iframes de Meet
        const meetIframes = document.querySelectorAll('iframe[src*="meet.google.com"]');
        meetIframes.forEach(iframe => {
          const src = (iframe as HTMLIFrameElement).src;
          if (src && !meetUrls.includes(src)) {
            meetUrls.push(src);
          }
        });
        
      } catch (error) {
        console.error('Error buscando URLs de Meet:', error);
      }
      
      return meetUrls;
    };

    // Función para extraer información de la sesión desde la URL
    const extractSessionInfo = (url: string): MeetSessionInfo | null => {
      try {
        // Buscar en el localStorage o sessionStorage si hay información de reclutamiento
        const reclutamientoData = localStorage.getItem('currentReclutamiento');
        if (reclutamientoData) {
          const data = JSON.parse(reclutamientoData);
          return {
            reclutamientoId: data.id,
            meetLink: url
          };
        }
        
        // Buscar en el DOM si hay información de reclutamiento
        const reclutamientoElement = document.querySelector('[data-reclutamiento-id]');
        if (reclutamientoElement) {
          const reclutamientoId = reclutamientoElement.getAttribute('data-reclutamiento-id');
          if (reclutamientoId) {
            return {
              reclutamientoId,
              meetLink: url
            };
          }
        }
        
        // Buscar en la URL actual si estamos en una página de reclutamiento
        const currentPath = window.location.pathname;
        const reclutamientoMatch = currentPath.match(/\/reclutamiento\/ver\/([^\/]+)/);
        if (reclutamientoMatch) {
          return {
            reclutamientoId: reclutamientoMatch[1],
            meetLink: url
          };
        }
        
        // Buscar en la URL actual si estamos en una página de participación
        const participacionMatch = currentPath.match(/\/participacion\/([^\/]+)/);
        if (participacionMatch) {
          return {
            reclutamientoId: participacionMatch[1],
            meetLink: url
          };
        }
        
      } catch (error) {
        console.error('Error extrayendo información de sesión:', error);
      }
      
      return null;
    };

    // Iniciar detección
    console.log('🔍 Iniciando detección global de sesiones de Meet...');
    
    // Verificar inmediatamente
    detectMeetSessions();
    
    // Configurar intervalo de detección cada 3 segundos
    detectionIntervalRef.current = setInterval(detectMeetSessions, 3000);

    // Cleanup
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [startTranscription, stopTranscription, transcriptionState?.isRecording, globalTranscription]);

  // Función para registrar manualmente una sesión de Meet
  const registerMeetSession = (reclutamientoId: string, meetLink: string) => {
    if (!globalTranscription) return;
    
    console.log('📝 Registrando sesión de Meet manualmente:', { reclutamientoId, meetLink });
    activeMeetSessionsRef.current.set(meetLink, { reclutamientoId, meetLink });
    
    if (!transcriptionState?.isRecording) {
      startTranscription(reclutamientoId, meetLink);
    }
  };

  // Función para desregistrar una sesión de Meet
  const unregisterMeetSession = (meetLink: string) => {
    if (!globalTranscription) return;
    
    console.log('🗑️ Desregistrando sesión de Meet:', meetLink);
    activeMeetSessionsRef.current.delete(meetLink);
    
    if (activeMeetSessionsRef.current.size === 0 && transcriptionState?.isRecording) {
      stopTranscription();
    }
  };

  return {
    registerMeetSession,
    unregisterMeetSession,
    activeSessions: Array.from(activeMeetSessionsRef.current.values())
  };
};
