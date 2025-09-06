// Tipos para seguimientos de investigación
export interface SeguimientoInvestigacion {
  id: string;
  investigacion_id: string;
  fecha_seguimiento: string;
  notas: string;
  creado_por: string;
  creado_el: string;
  responsable_id: string;
  estado: string; // 'pendiente', 'en_progreso', 'completado', etc.
  participante_externo_id?: string; // ID del participante externo asociado (opcional)
  participante_externo?: { // Información del participante externo (opcional)
    id: string;
    nombre: string;
    empresa_nombre?: string;
    email?: string;
  };
}

export interface SeguimientoFormData {
  investigacion_id: string;
  fecha_seguimiento: string;
  notas: string;
  responsable_id: string;
  estado: string;
  participante_externo_id?: string; // ID del participante externo asociado (opcional)
}

export interface CrearSeguimientoRequest {
  investigacion_id: string;
  fecha_seguimiento: string;
  notas: string;
  responsable_id: string;
  estado: string;
  participante_externo_id?: string; // ID del participante externo asociado (opcional)
}

export interface ActualizarSeguimientoRequest {
  fecha_seguimiento?: string;
  notas?: string;
  responsable_id?: string;
  estado?: string;
  participante_externo_id?: string; // ID del participante externo asociado (opcional)
}

// Estados disponibles para seguimientos
export const ESTADOS_SEGUIMIENTO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'bloqueado', label: 'Bloqueado' },
  { value: 'cancelado', label: 'Cancelado' }
] as const;

export type EstadoSeguimiento = typeof ESTADOS_SEGUIMIENTO[number]['value']; 