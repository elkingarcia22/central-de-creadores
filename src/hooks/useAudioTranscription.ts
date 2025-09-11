import { useState, useRef, useCallback } from 'react';

interface AudioTranscriptionState {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  transcription: string;
  segments: any[];
  error: string | null;
  duration: number;
}

interface UseAudioTranscriptionReturn {
  state: AudioTranscriptionState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
  transcribeAudio: (audioBlob: Blob) => Promise<void>;
}

export const useAudioTranscription = (): UseAudioTranscriptionReturn => {
  const [state, setState] = useState<AudioTranscriptionState>({
    isRecording: false,
    isProcessing: false,
    audioBlob: null,
    audioUrl: null,
    transcription: '',
    segments: [],
    error: null,
    duration: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Event listeners
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false
        }));
      };

      // Iniciar grabación
      mediaRecorder.start(1000); // Capturar datos cada segundo
      
      setState(prev => ({ ...prev, isRecording: true, duration: 0 }));

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      console.log('🎤 Grabación de audio iniciada');

    } catch (error) {
      console.error('Error iniciando grabación:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'No se pudo acceder al micrófono. Verifica los permisos.',
        isRecording: false 
      }));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (mediaRecorderRef.current && state.isRecording) {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setState(prev => ({ ...prev, isRecording: false }));
      console.log('🛑 Grabación de audio detenida');

    } catch (error) {
      console.error('Error deteniendo grabación:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al detener la grabación',
        isRecording: false 
      }));
    }
  }, [state.isRecording]);

  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState({
      isRecording: false,
      isProcessing: false,
      audioBlob: null,
      audioUrl: null,
      transcription: '',
      segments: [],
      error: null,
      duration: 0
    });
  }, [state.audioUrl]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Crear FormData para enviar el audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'es-ES');
      formData.append('format', 'webm');

      // Llamar a la API de transcripción
      const response = await fetch('/api/transcripciones/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error en la transcripción');
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        transcription: result.transcription || '',
        segments: result.segments || [],
        isProcessing: false
      }));

      console.log('✅ Transcripción completada:', result);

    } catch (error) {
      console.error('Error en transcripción:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al procesar la transcripción',
        isProcessing: false 
      }));
    }
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    clearRecording,
    transcribeAudio
  };
};
