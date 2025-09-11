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
  getCurrentAudioBlob: () => Blob | null;
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
  const audioBlobRef = useRef<Blob | null>(null);

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
        
        console.log('🎵 Audio blob generado:', audioBlob.size, 'bytes');
        
        // Guardar en la referencia para acceso inmediato
        audioBlobRef.current = audioBlob;
        
        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false
        }));
        
        console.log('✅ AudioBlob guardado en ref y estado');
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
    
    // Limpiar la referencia también
    audioBlobRef.current = null;
    
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
      console.log('🎵 Iniciando transcripción con blob de', audioBlob.size, 'bytes');
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Crear FormData para enviar el audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'es-ES');
      formData.append('format', 'webm');

      console.log('📤 Enviando audio a API de transcripción...');

      // Llamar a la API de transcripción
      const response = await fetch('/api/transcripciones/transcribe', {
        method: 'POST',
        body: formData
      });

      console.log('📥 Respuesta de API:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en API:', errorText);
        throw new Error(`Error en la transcripción: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Resultado de transcripción:', result);
      
      // Actualizar transcripción en tiempo real
      console.log('🔄 HOOK: Actualizando estado con transcripción:', result.transcription);
      console.log('🔄 HOOK: Actualizando estado con segmentos:', result.segments);
      
      setState(prev => {
        const newState = {
          ...prev,
          transcription: result.transcription || '',
          segments: result.segments || [],
          isProcessing: false
        };
        console.log('🔄 HOOK: Estado anterior:', prev);
        console.log('🔄 HOOK: Estado nuevo:', newState);
        return newState;
      });

      console.log('✅ HOOK: Transcripción completada y guardada en estado');
      
      // Disparar evento personalizado para notificar a otros componentes
      const eventDetail = {
        transcription: result.transcription || '',
        segments: result.segments || []
      };
      
      console.log('📡 HOOK: Disparando evento transcriptionCompleted con:', eventDetail);
      window.dispatchEvent(new CustomEvent('transcriptionCompleted', {
        detail: eventDetail
      }));
      console.log('📡 HOOK: Evento disparado exitosamente');

    } catch (error) {
      console.error('❌ Error en transcripción:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Error al procesar la transcripción: ${error.message}`,
        isProcessing: false 
      }));
    }
  }, []);

  const getCurrentAudioBlob = useCallback(() => {
    const blob = audioBlobRef.current;
    console.log('🔍 getCurrentAudioBlob llamado, audioBlob:', !!blob, 'tamaño:', blob?.size);
    return blob;
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    clearRecording,
    transcribeAudio,
    getCurrentAudioBlob
  };
};
