// ====================================
// TIPOS PARA EL MÓDULO DE RECLUTAMIENTOS
// ====================================

export interface Reclutamiento {
  id: string;
  investigacion_id: string;
  participantes_id: string;
  fecha_asignado: string;
  fecha_sesion?: string;
  reclutador_id: string;
  creado_por: string;
  estado_agendamiento: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReclutamientoCompleto {
  id: string;
  investigacion_id: string;
  participantes_id: string;
  fecha_asignado: string;
  fecha_sesion?: string;
  reclutador_id: string;
  creado_por: string;
  estado_agendamiento: string;
  
  // Datos de la investigación
  investigacion_nombre: string;
  investigacion_descripcion: string;
  investigacion_estado: string;
  investigacion_fecha_inicio: string;
  investigacion_fecha_fin: string;
  
  // Datos del participante
  participante_nombre: string;
  participante_apellido: string;
  participante_email: string;
  participante_telefono?: string;
  participante_edad?: number;
  participante_genero?: string;
  
  // Datos del reclutador
  reclutador_nombre: string;
  reclutador_apellido: string;
  reclutador_email: string;
  
  // Datos del creador
  creador_nombre: string;
  creador_apellido: string;
  creador_email: string;
  
  // Datos del estado de agendamiento
  estado_agendamiento_nombre: string;
  estado_agendamiento_descripcion: string;
  estado_agendamiento_color: string;
  
  // Verificar si la investigación tiene libreto
  tiene_libreto: boolean;
  
  // Fechas formateadas
  fecha_asignado_date: string;
  fecha_sesion_date?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface ReclutamientoFormData {
  investigacion_id: string;
  participantes_id: string;
  fecha_sesion?: string;
  estado_agendamiento: string;
}

export interface Participante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  edad?: number;
  genero?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface EstadoAgendamiento {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvestigacionConLibreto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  libretos_investigacion: { id: string }[];
}

// ====================================
// ENUMS Y CONSTANTES
// ====================================

export enum EstadoAgendamientoEnum {
  PENDIENTE = 'pendiente',
  PENDIENTE_DE_AGENDAMIENTO = 'pendiente de agendamiento',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  COMPLETADO = 'completado',
  NO_SHOW = 'no_show',
  REPROGRAMADO = 'reprogramado'
}

export const ESTADOS_AGENDAMIENTO_VALIDOS = [
  EstadoAgendamientoEnum.PENDIENTE,
  EstadoAgendamientoEnum.PENDIENTE_DE_AGENDAMIENTO,
  EstadoAgendamientoEnum.CONFIRMADO,
  EstadoAgendamientoEnum.CANCELADO,
  EstadoAgendamientoEnum.COMPLETADO,
  EstadoAgendamientoEnum.NO_SHOW,
  EstadoAgendamientoEnum.REPROGRAMADO
];

// ====================================
// FUNCIONES UTILITARIAS
// ====================================

export const getEstadoAgendamientoColor = (estado: string): string => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case EstadoAgendamientoEnum.PENDIENTE:
    case EstadoAgendamientoEnum.PENDIENTE_DE_AGENDAMIENTO:
      return 'warning';
    case EstadoAgendamientoEnum.CONFIRMADO:
      return 'success';
    case EstadoAgendamientoEnum.CANCELADO:
      return 'danger';
    case EstadoAgendamientoEnum.COMPLETADO:
      return 'info';
    case EstadoAgendamientoEnum.NO_SHOW:
      return 'secondary';
    case EstadoAgendamientoEnum.REPROGRAMADO:
      return 'primary';
    default:
      return 'default';
  }
};

export const getEstadoAgendamientoText = (estado: string): string => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case EstadoAgendamientoEnum.PENDIENTE:
    case EstadoAgendamientoEnum.PENDIENTE_DE_AGENDAMIENTO:
      return 'Pendiente de Agendamiento';
    case EstadoAgendamientoEnum.CONFIRMADO:
      return 'Confirmado';
    case EstadoAgendamientoEnum.CANCELADO:
      return 'Cancelado';
    case EstadoAgendamientoEnum.COMPLETADO:
      return 'Completado';
    case EstadoAgendamientoEnum.NO_SHOW:
      return 'No Show';
    case EstadoAgendamientoEnum.REPROGRAMADO:
      return 'Reprogramado';
    default:
      return estado;
  }
};

export const canDeleteReclutamiento = (estado: string): boolean => {
  return estado === EstadoAgendamientoEnum.PENDIENTE || 
         estado === EstadoAgendamientoEnum.CANCELADO;
};

export const canUpdateReclutamiento = (estado: string): boolean => {
  return estado !== EstadoAgendamientoEnum.COMPLETADO;
};

export const shouldShowProgramarSesion = (estado: string): boolean => {
  return estado === EstadoAgendamientoEnum.CONFIRMADO;
};

export const shouldClearFechaSesion = (estado: string): boolean => {
  return estado === EstadoAgendamientoEnum.CANCELADO;
};

// ====================================
// INTERFACES PARA FILTROS Y BÚSQUEDA
// ====================================

export interface FiltrosReclutamiento {
  busqueda?: string;
  investigacion_id?: string | 'todos';
  participante_id?: string | 'todos';
  estado_agendamiento?: string | 'todos';
  reclutador_id?: string | 'todos';
  fecha_asignado_desde?: string;
  fecha_asignado_hasta?: string;
  fecha_sesion_desde?: string;
  fecha_sesion_hasta?: string;
}

export interface MetricasReclutamiento {
  total: number;
  pendientes: number;
  confirmados: number;
  completados: number;
  cancelados: number;
  tasaConfirmacion: number;
  tasaCompletado: number;
} 