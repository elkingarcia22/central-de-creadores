import { useState, useCallback, useRef } from 'react';

interface AudioTranscriptionState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  transcription: string;
  segments: any[];
  error: string | null;
}

interface UseAudioTranscriptionReturn {
  state: AudioTranscriptionState;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  transcribeAudio: (audioBlob: Blob, language: string) => Promise<any>;
  getCurrentAudioBlob: () => Blob | null;
}

export const useAudioTranscriptionDebug = (): UseAudioTranscriptionReturn => {
  const [state, setState] = useState<AudioTranscriptionState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    transcription: '',
    segments: [],
    error: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 [DEBUG] Iniciando grabación...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('🎵 [DEBUG] Audio blob generado:', audioBlob.size, 'bytes');
        audioBlobRef.current = audioBlob;
        
        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false
        }));
        
        console.log('✅ [DEBUG] AudioBlob guardado en ref y estado');
      };

      mediaRecorder.start();
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null
      }));

      // Timer para duración
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);

      console.log('✅ [DEBUG] Grabación iniciada correctamente');

    } catch (error) {
      console.error('❌ [DEBUG] Error al iniciar grabación:', error);
      setState(prev => ({
        ...prev,
        error: `Error al iniciar grabación: ${error.message}`,
        isRecording: false
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log('🛑 [DEBUG] Deteniendo grabación...');
    
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    console.log('✅ [DEBUG] Grabación detenida');
  }, [state.isRecording]);

  const transcribeAudio = useCallback(async (audioBlob: Blob, language: string = 'es') => {
    console.log('🎵 [DEBUG] Iniciando transcripción con blob de', audioBlob.size, 'bytes');
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);

      console.log('📤 [DEBUG] Enviando audio a API de transcripción...');
      
      const response = await fetch('/api/transcripciones/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error en API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📥 [DEBUG] Respuesta de API:', response.status, 'OK');
      console.log('✅ [DEBUG] Resultado de transcripción:', result);
      console.log('🔍 [DEBUG] Resultado completo JSON:', JSON.stringify(result, null, 2));
      
      // Actualizar transcripción en tiempo real
      setState(prev => ({
        ...prev,
        transcription: result.transcription || '',
        segments: result.segments || [],
        isProcessing: false
      }));

      console.log('✅ [DEBUG] Transcripción completada y guardada en estado');
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('transcriptionCompleted', {
        detail: {
          transcription: result.transcription || '',
          segments: result.segments || []
        }
      }));

      return result;

    } catch (error) {
      console.error('❌ [DEBUG] Error en transcripción:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Error al procesar la transcripción: ${error.message}`,
        isProcessing: false 
      }));
      throw error;
    }
  }, []);

  const getCurrentAudioBlob = useCallback(() => {
    const blob = audioBlobRef.current;
    console.log('🔍 [DEBUG] getCurrentAudioBlob llamado, audioBlob:', !!blob, 'tamaño:', blob?.size);
    return blob;
  }, []);

  const clearRecording = useCallback(() => {
    console.log('🧹 [DEBUG] Limpiando grabación...');
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    audioBlobRef.current = null;
    
    setState({
      isRecording: false,
      isProcessing: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      transcription: '',
      segments: [],
      error: null
    });
    
    console.log('✅ [DEBUG] Grabación limpiada');
  }, [state.audioUrl]);

  return {
    state,
    startRecording,
    stopRecording,
    clearRecording,
    transcribeAudio,
    getCurrentAudioBlob
  };
};
