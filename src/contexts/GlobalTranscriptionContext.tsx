import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useToast } from './ToastContext';

interface TranscriptionSegment {
  timestamp: number;
  text: string;
  speaker?: string;
}

interface TranscriptionState {
  isActive: boolean;
  isRecording: boolean;
  isPaused: boolean;
  currentTranscription: string;
  segments: TranscriptionSegment[];
  sessionStartTime: Date | null;
  currentReclutamientoId: string | null;
  currentMeetLink: string | null;
}

interface GlobalTranscriptionContextType {
  transcriptionState: TranscriptionState;
  startTranscription: (reclutamientoId: string, meetLink: string) => Promise<void>;
  stopTranscription: () => Promise<void>;
  pauseTranscription: () => void;
  resumeTranscription: () => void;
  clearTranscription: () => void;
}

const GlobalTranscriptionContext = createContext<GlobalTranscriptionContextType | undefined>(undefined);

export const useGlobalTranscription = () => {
  const context = useContext(GlobalTranscriptionContext);
  if (!context) {
    throw new Error('useGlobalTranscription must be used within a GlobalTranscriptionProvider');
  }
  return context;
};

interface GlobalTranscriptionProviderProps {
  children: ReactNode;
}

export const GlobalTranscriptionProvider: React.FC<GlobalTranscriptionProviderProps> = ({ children }) => {
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    isActive: false,
    isRecording: false,
    isPaused: false,
    currentTranscription: '',
    segments: [],
    sessionStartTime: null,
    currentReclutamientoId: null,
    currentMeetLink: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const { showSuccess, showError } = useToast();

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            
            const newSegment: TranscriptionSegment = {
              timestamp: Date.now() - startTimeRef.current,
              text: transcript.trim(),
              speaker: 'Participante'
            };
            
            setTranscriptionState(prev => ({
              ...prev,
              segments: [...prev.segments, newSegment]
            }));
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscriptionState(prev => ({
          ...prev,
          currentTranscription: prev.currentTranscription + finalTranscript + interimTranscript
        }));
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        showError(`Error en transcripción: ${event.error}`);
      };
      
      recognitionRef.current.onend = () => {
        if (transcriptionState.isRecording && !transcriptionState.isPaused) {
          setTimeout(() => {
            if (recognitionRef.current && transcriptionState.isRecording) {
              recognitionRef.current.start();
            }
          }, 100);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcriptionState.isRecording, transcriptionState.isPaused, showError]);

  const startTranscription = async (reclutamientoId: string, meetLink: string) => {
    try {
      if (transcriptionState.isRecording) {
        console.log('Ya hay una transcripción en progreso');
        return;
      }

      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start(1000);
      
      // Iniciar reconocimiento
      if (recognitionRef.current) {
        startTimeRef.current = Date.now();
        recognitionRef.current.start();
        
        setTranscriptionState({
          isActive: true,
          isRecording: true,
          isPaused: false,
          currentTranscription: '',
          segments: [],
          sessionStartTime: new Date(),
          currentReclutamientoId: reclutamientoId,
          currentMeetLink: meetLink
        });
        
        showSuccess('🎤 Transcripción automática iniciada');
        console.log('🎤 Transcripción global iniciada para:', reclutamientoId);
      }
      
    } catch (error) {
      console.error('Error iniciando transcripción global:', error);
      showError('Error al acceder al micrófono');
    }
  };

  const stopTranscription = async () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // Guardar transcripción si hay contenido
      if (transcriptionState.currentTranscription.trim() && transcriptionState.currentReclutamientoId) {
        await saveTranscription();
      }
      
      setTranscriptionState({
        isActive: false,
        isRecording: false,
        isPaused: false,
        currentTranscription: '',
        segments: [],
        sessionStartTime: null,
        currentReclutamientoId: null,
        currentMeetLink: null
      });
      
      showSuccess('✅ Transcripción guardada exitosamente');
      console.log('🏁 Transcripción global detenida');
      
    } catch (error) {
      console.error('Error deteniendo transcripción global:', error);
      showError('Error al detener la transcripción');
    }
  };

  const pauseTranscription = () => {
    if (recognitionRef.current && transcriptionState.isRecording) {
      recognitionRef.current.stop();
      setTranscriptionState(prev => ({ ...prev, isPaused: true }));
      showSuccess('⏸️ Transcripción pausada');
    }
  };

  const resumeTranscription = () => {
    if (recognitionRef.current && transcriptionState.isPaused) {
      recognitionRef.current.start();
      setTranscriptionState(prev => ({ ...prev, isPaused: false }));
      showSuccess('▶️ Transcripción reanudada');
    }
  };

  const clearTranscription = () => {
    setTranscriptionState({
      isActive: false,
      isRecording: false,
      isPaused: false,
      currentTranscription: '',
      segments: [],
      sessionStartTime: null,
      currentReclutamientoId: null,
      currentMeetLink: null
    });
  };

  const saveTranscription = async () => {
    try {
      const duracionTotal = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const response = await fetch(`/api/transcripciones/${transcriptionState.currentReclutamientoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meet_link: transcriptionState.currentMeetLink,
          transcripcion_completa: transcriptionState.currentTranscription,
          transcripcion_por_segmentos: transcriptionState.segments,
          duracion_total: duracionTotal,
          idioma_detectado: 'es'
        }),
      });

      if (!response.ok) {
        throw new Error('Error guardando transcripción');
      }

      const data = await response.json();
      console.log('✅ Transcripción global guardada:', data);
      
    } catch (error) {
      console.error('Error guardando transcripción global:', error);
      showError('Error al guardar la transcripción');
    }
  };

  const value: GlobalTranscriptionContextType = {
    transcriptionState,
    startTranscription,
    stopTranscription,
    pauseTranscription,
    resumeTranscription,
    clearTranscription
  };

  return (
    <GlobalTranscriptionContext.Provider value={value}>
      {children}
    </GlobalTranscriptionContext.Provider>
  );
};
