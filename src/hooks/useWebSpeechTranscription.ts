import { useState, useCallback, useRef, useEffect } from 'react';

interface WebSpeechTranscriptionState {
  isRecording: boolean;
  isProcessing: boolean;
  transcription: string;
  segments: Array<{
    id: string;
    timestamp_inicio: number;
    timestamp_fin: number;
    texto: string;
    confianza: number;
    hablante: string;
    duracion: number;
  }>;
  error: string | null;
  duration: number;
}

export function useWebSpeechTranscription() {
  const [state, setState] = useState<WebSpeechTranscriptionState>({
    isRecording: false,
    isProcessing: false,
    transcription: '',
    segments: [],
    error: null,
    duration: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);
  const segmentsRef = useRef<Array<any>>([]);
  const currentSegmentRef = useRef<any>(null);

  // Verificar si el navegador soporta Web Speech API
  const isSupported = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported()) {
      setState(prev => ({ ...prev, error: 'Web Speech API no soportada en este navegador' }));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configurar reconocimiento
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    segmentsRef.current = [];
    currentSegmentRef.current = null;

    // Eventos del reconocimiento
    recognition.onstart = () => {
      console.log('🎤 [Web Speech] Reconocimiento iniciado');
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        error: null,
        transcription: '',
        segments: []
      }));
    };

    recognition.onresult = (event) => {
      console.log('🎯 [Web Speech] Resultado recibido:', event.results);
      
      let finalTranscript = '';
      let interimTranscript = '';
      const newSegments: any[] = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript;
          
          // Crear segmento final
          const segment = {
            id: `segment_${Date.now()}_${i}`,
            timestamp_inicio: currentSegmentRef.current?.timestamp_inicio || 0,
            timestamp_fin: (Date.now() - startTimeRef.current) / 1000,
            texto: transcript.trim(),
            confianza: confidence,
            hablante: 'participante', // Por ahora solo participante
            duracion: (Date.now() - startTimeRef.current) / 1000 - (currentSegmentRef.current?.timestamp_inicio || 0)
          };
          
          newSegments.push(segment);
          currentSegmentRef.current = null;
        } else {
          interimTranscript += transcript;
          
          // Crear segmento temporal
          if (!currentSegmentRef.current) {
            currentSegmentRef.current = {
              timestamp_inicio: (Date.now() - startTimeRef.current) / 1000,
              texto: transcript.trim(),
              confianza: confidence
            };
          } else {
            currentSegmentRef.current.texto = transcript.trim();
            currentSegmentRef.current.confianza = confidence;
          }
        }
      }

      // Actualizar estado
      setState(prev => {
        const updatedSegments = [...prev.segments, ...newSegments];
        const fullTranscript = updatedSegments.map(s => s.texto).join(' ');
        
        return {
          ...prev,
          transcription: fullTranscript + (interimTranscript ? ` ${interimTranscript}` : ''),
          segments: updatedSegments
        };
      });
    };

    recognition.onerror = (event) => {
      console.error('❌ [Web Speech] Error:', event.error);
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        error: `Error de reconocimiento: ${event.error}` 
      }));
    };

    recognition.onend = () => {
      console.log('🛑 [Web Speech] Reconocimiento terminado');
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        duration: (Date.now() - startTimeRef.current) / 1000
      }));

      // Disparar evento de transcripción completada
      const finalTranscription = state.transcription;
      const finalSegments = state.segments;
      
      if (finalTranscription) {
        console.log('📡 [Web Speech] Disparando evento transcriptionCompleted');
        window.dispatchEvent(new CustomEvent('transcriptionCompleted', {
          detail: {
            transcription: finalTranscription,
            segments: finalSegments,
            language: 'es-ES',
            confidence: 0.9,
            duration: (Date.now() - startTimeRef.current) / 1000,
            wordCount: finalTranscription.split(' ').length,
            speakerCount: 1
          }
        }));
      }
    };

    // Iniciar reconocimiento
    try {
      recognition.start();
      console.log('✅ [Web Speech] Reconocimiento iniciado correctamente');
    } catch (error) {
      console.error('❌ [Web Speech] Error al iniciar:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Error al iniciar reconocimiento: ${error.message}` 
      }));
    }
  }, [isSupported, state.transcription, state.segments]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      console.log('🛑 [Web Speech] Deteniendo reconocimiento...');
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setState({
      isRecording: false,
      isProcessing: false,
      transcription: '',
      segments: [],
      error: null,
      duration: 0
    });
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    clearRecording,
    isSupported: isSupported()
  };
}

// Extender la interfaz Window para TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
