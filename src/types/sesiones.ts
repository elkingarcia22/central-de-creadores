export interface Sesion {
  id: string;
  investigacion_id: string;
  titulo: string;
  descripcion?: string;
  fecha_programada: Date | null;
  duracion_minutos: number;
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada' | 'reprogramada';
  tipo_sesion: 'virtual' | 'presencial' | 'hibrida';
  ubicacion?: string;
  sala?: string;
  moderador_id?: string;
  moderador_nombre?: string;
  observadores?: string[];
  grabacion_permitida: boolean;
  notas_publicas?: string;
  notas_privadas?: string;
  configuracion?: Record<string, any>;
  fecha_inicio_real?: Date;
  fecha_fin_real?: Date;
  resultados?: Record<string, any>;
  archivos_adjuntos?: string[];
  google_calendar_id?: string;
  google_event_id?: string;
  created_at: Date;
  updated_at: Date;
  
  // Campos adicionales de la API de reclutamientos
  investigacion_nombre?: string;
  participante?: {
    id: string;
    nombre: string;
    email: string;
    tipo: 'externo' | 'interno' | 'friend_family';
  };
  tipo_participante?: 'externo' | 'interno' | 'friend_family';
  reclutador?: {
    id: string;
    full_name: string;
    email: string;
  };
  estado_agendamiento?: string;
  estado_agendamiento_color?: string;
  hora_sesion?: string;
  fecha_asignado?: string;
}

export interface SesionParticipante {
  id: string;
  sesion_id: string;
  participante_id: string;
  participante_nombre?: string;
  participante_email?: string;
  estado: 'invitado' | 'confirmado' | 'presente' | 'ausente' | 'cancelado';
  fecha_confirmacion?: Date;
  hora_llegada?: Date;
  hora_salida?: Date;
  asistencia_completa: boolean;
  puntuacion?: number;
  comentarios?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SesionFormData {
  titulo: string;
  descripcion?: string;
  fecha_programada: Date;
  duracion_minutos: number;
  tipo_sesion: 'virtual' | 'presencial' | 'hibrida';
  ubicacion?: string;
  sala?: string;
  moderador_id?: string;
  observadores?: string[];
  grabacion_permitida: boolean;
  notas_publicas?: string;
  notas_privadas?: string;
  participantes_ids?: string[];
}

export interface SesionEvent extends Sesion {
  // Campos adicionales para el calendario
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  attendees?: string[];
  location?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  title?: string; // Para compatibilidad con CalendarEvent
  // Campos específicos de sesiones
  participantes: SesionParticipante[];
  investigacion_nombre?: string;
  investigacion_color?: string;
  // Información real del reclutamiento
  estado_real?: string;
  responsable_real?: string;
  implementador_real?: string;
  // Enlace de Google Meet
  meet_link?: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  location?: string;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
}

export interface CalendarFilters {
  investigaciones?: string[];
  estados?: string[];
  tipos_sesion?: string[];
  moderadores?: string[];
  participantes?: string[];
}

export interface SesionesStats {
  total: number;
  programadas: number;
  en_curso: number;
  completadas: number;
  canceladas: number;
  esta_semana: number;
  este_mes: number;
}
