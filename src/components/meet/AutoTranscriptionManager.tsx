import React, { useState, useEffect, useRef } from 'react';
import { Button, Card } from '../ui';
import { Typography } from '../ui';
import { MicIcon, MicOffIcon, PlayIcon, PauseIcon, StopIcon, ClockIcon } from '../icons';
import { useToast } from '../../contexts/ToastContext';

interface AutoTranscriptionManagerProps {
  meetLink: string;
  reclutamientoId: string;
  onTranscriptionComplete?: (transcription: string) => void;
  onError?: (error: string) => void;
}

interface TranscriptionSegment {
  timestamp: number;
  text: string;
  speaker?: string;
}

const AutoTranscriptionManager: React.FC<AutoTranscriptionManagerProps> = ({
  meetLink,
  reclutamientoId,
  onTranscriptionComplete,
  onError
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Verificar si el navegador soporta Web Speech API
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configurar reconocimiento de voz
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';
      
      // Eventos del reconocimiento
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            
            // Agregar segmento final
            const newSegment: TranscriptionSegment = {
              timestamp: Date.now() - startTimeRef.current,
              text: transcript.trim(),
              speaker: 'Participante'
            };
            
            setSegments(prev => [...prev, newSegment]);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Actualizar transcripción en tiempo real
        setTranscription(prev => {
          const finalText = prev + finalTranscript;
          return finalText + interimTranscript;
        });
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setError(`Error en reconocimiento: ${event.error}`);
        if (onError) onError(`Error en reconocimiento: ${event.error}`);
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording && !isPaused) {
          // Reiniciar reconocimiento si se detuvo inesperadamente
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              recognitionRef.current.start();
            }
          }, 100);
        }
      };
    } else {
      setIsSupported(false);
      setError('Tu navegador no soporta reconocimiento de voz');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, isPaused, onError]);

  // Efecto para iniciar automáticamente cuando se carga el componente
  useEffect(() => {
    if (isSupported && !autoStartAttempted && !isRecording && !error) {
      console.log('🎤 Intentando iniciar transcripción automáticamente...');
      setAutoStartAttempted(true);
      
      // Esperar un poco para que el componente se monte completamente
      setTimeout(() => {
        startTranscription();
      }, 1000);
    }
  }, [isSupported, autoStartAttempted, isRecording, error]);

  const startTranscription = async () => {
    try {
      setError(null);
      setTranscription('');
      setSegments([]);
      setSessionStartTime(new Date());
      startTimeRef.current = Date.now();
      
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar MediaRecorder para grabar audio (opcional)
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start(1000); // Grabar en chunks de 1 segundo
      
      // Iniciar reconocimiento de voz
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        setIsPaused(false);
        showSuccess('🎤 Transcripción automática iniciada');
      }
      
    } catch (error) {
      console.error('Error iniciando transcripción:', error);
      setError('No se pudo acceder al micrófono. Por favor, permite el acceso al micrófono.');
      showError('Error al acceder al micrófono');
      if (onError) onError('No se pudo acceder al micrófono');
    }
  };

  const pauseTranscription = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsPaused(true);
      showSuccess('⏸️ Transcripción pausada');
    }
  };

  const resumeTranscription = () => {
    if (recognitionRef.current && isPaused) {
      recognitionRef.current.start();
      setIsPaused(false);
      showSuccess('▶️ Transcripción reanudada');
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
      
      setIsRecording(false);
      setIsPaused(false);
      
      // Guardar transcripción en la base de datos
      if (transcription.trim()) {
        await saveTranscription();
        showSuccess('✅ Transcripción guardada exitosamente');
      }
      
    } catch (error) {
      console.error('Error deteniendo transcripción:', error);
      setError('Error al detener la transcripción');
      showError('Error al detener la transcripción');
    }
  };

  const saveTranscription = async () => {
    try {
      const duracionTotal = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const response = await fetch(`/api/transcripciones/${reclutamientoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meet_link: meetLink,
          transcripcion_completa: transcription,
          transcripcion_por_segmentos: segments,
          duracion_total: duracionTotal,
          idioma_detectado: 'es'
        }),
      });

      if (!response.ok) {
        throw new Error('Error guardando transcripción');
      }

      const data = await response.json();
      console.log('✅ Transcripción guardada:', data);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(transcription);
      }
      
    } catch (error) {
      console.error('Error guardando transcripción:', error);
      setError('Error al guardar la transcripción');
      showError('Error al guardar la transcripción');
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Tu navegador no soporta reconocimiento de voz automático. 
          Puedes usar Google Meet con Live Captions activado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estado de la transcripción */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MicIcon className="w-5 h-5 text-blue-600" />
            <Typography variant="h3" className="text-gray-900">
              Transcripción Automática
            </Typography>
          </div>
          
          {sessionStartTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>Duración: {formatDuration(sessionStartTime)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startTranscription}
              variant="primary"
              className="flex items-center gap-2"
            >
              <MicIcon className="w-4 h-4" />
              Iniciar Transcripción
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {!isPaused ? (
                <Button
                  onClick={pauseTranscription}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PauseIcon className="w-4 h-4" />
                  Pausar
                </Button>
              ) : (
                <Button
                  onClick={resumeTranscription}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  Reanudar
                </Button>
              )}
              
              <Button
                onClick={stopTranscription}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <StopIcon className="w-4 h-4" />
                Detener y Guardar
              </Button>
            </div>
          )}
          
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {isPaused ? 'Pausado' : 'Grabando...'}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </Card>

      {/* Transcripción en tiempo real */}
      {transcription && (
        <Card className="p-4">
          <Typography variant="h4" className="text-gray-900 mb-3">
            Transcripción en Tiempo Real:
          </Typography>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
        </Card>
      )}

      {/* Segmentos */}
      {segments.length > 0 && (
        <Card className="p-4">
          <Typography variant="h4" className="text-gray-900 mb-3">
            Segmentos ({segments.length}):
          </Typography>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {segments.map((segment, index) => (
              <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {Math.floor(segment.timestamp / 1000)}s
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {segment.speaker}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AutoTranscriptionManager;
