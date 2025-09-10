import { useState, useEffect, useRef } from 'react';

interface MeetSessionState {
  isActive: boolean;
  sessionStartTime: Date | null;
  lastActivity: Date | null;
  isDetecting: boolean;
}

export const useMeetSessionDetection = (meetLink: string) => {
  const [sessionState, setSessionState] = useState<MeetSessionState>({
    isActive: false,
    sessionStartTime: null,
    lastActivity: null,
    isDetecting: false
  });

  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!meetLink) return;

    // Función para detectar si hay actividad en la sesión
    const detectSessionActivity = () => {
      const now = new Date();
      
      // Detectar actividad basada en varios indicadores:
      // 1. Cambios en el título de la página
      // 2. Actividad del micrófono
      // 3. Cambios en el DOM que indiquen una sesión activa
      
      const hasPageActivity = document.title.includes('Meet') || 
                             document.title.includes('Google Meet') ||
                             window.location.href.includes('meet.google.com');
      
      const hasAudioActivity = checkAudioActivity();
      const hasRecentActivity = (now.getTime() - lastCheckRef.current.getTime()) < 5000; // 5 segundos
      
      const isCurrentlyActive = hasPageActivity || hasAudioActivity || hasRecentActivity;
      
      setSessionState(prev => {
        const wasActive = prev.isActive;
        
        if (isCurrentlyActive && !wasActive) {
          // Sesión iniciada
          console.log('🎯 Sesión de Meet detectada - iniciando transcripción automática');
          return {
            isActive: true,
            sessionStartTime: now,
            lastActivity: now,
            isDetecting: true
          };
        } else if (isCurrentlyActive && wasActive) {
          // Sesión continúa
          return {
            ...prev,
            lastActivity: now
          };
        } else if (!isCurrentlyActive && wasActive) {
          // Sesión terminada
          console.log('🏁 Sesión de Meet terminada');
          return {
            isActive: false,
            sessionStartTime: null,
            lastActivity: null,
            isDetecting: false
          };
        }
        
        return prev;
      });
      
      lastCheckRef.current = now;
    };

    // Función para detectar actividad de audio
    const checkAudioActivity = (): boolean => {
      try {
        // Verificar si hay un stream de audio activo
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(navigator.mediaDevices.getUserMedia({ audio: true }));
        
        // Esta es una implementación simplificada
        // En una implementación real, necesitarías más lógica para detectar audio
        return false; // Por ahora retornamos false
      } catch (error) {
        return false;
      }
    };

    // Iniciar detección
    setSessionState(prev => ({ ...prev, isDetecting: true }));
    
    // Verificar inmediatamente
    detectSessionActivity();
    
    // Configurar intervalo de detección cada 2 segundos
    detectionIntervalRef.current = setInterval(detectSessionActivity, 2000);

    // Cleanup
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [meetLink]);

  // Función para forzar inicio de sesión (útil para testing)
  const forceStartSession = () => {
    setSessionState({
      isActive: true,
      sessionStartTime: new Date(),
      lastActivity: new Date(),
      isDetecting: true
    });
  };

  // Función para forzar fin de sesión
  const forceEndSession = () => {
    setSessionState({
      isActive: false,
      sessionStartTime: null,
      lastActivity: null,
      isDetecting: false
    });
  };

  return {
    ...sessionState,
    forceStartSession,
    forceEndSession
  };
};
