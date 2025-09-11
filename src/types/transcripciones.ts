export interface TranscripcionSesion {
  id: string;
  reclutamiento_id: string;
  meet_link: string;
  transcripcion_completa?: string;
  transcripcion_por_segmentos?: TranscripcionSegmento[];
  duracion_total?: number;
  idioma_detectado?: string;
  estado: 'procesando' | 'completada' | 'error' | 'pausada';
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TranscripcionSegmento {
  id: string;
  timestamp_inicio: number;
  timestamp_fin: number;
  texto: string;
  confianza: number;
  hablante: 'participante' | 'reclutador' | 'desconocido';
  duracion: number;
}

export interface EstadoTranscripcion {
  isRecording: boolean;
  isProcessing: boolean;
  transcripcionId?: string;
  duracion: number;
  segmentos: TranscripcionSegmento[];
  error?: string;
}

export interface ConfiguracionTranscripcion {
  idioma: string;
  confianzaMinima: number;
  segmentacionAutomatica: boolean;
  deteccionHablante: boolean;
}
