// Tipos para categorías de dolores
export interface CategoriaDolor {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  icono?: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para dolores de participantes
export interface DolorParticipante {
  id: string;
  participante_id: string;
  categoria_id: string;
  titulo: string;
  descripcion?: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activo' | 'resuelto' | 'archivado';
  investigacion_relacionada_id?: string;
  sesion_relacionada_id?: string;
  creado_por?: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  fecha_actualizacion: string;
}

// Tipo para la vista unificada de dolores
export interface DolorParticipanteCompleto {
  id: string;
  participante_id: string;
  participante_nombre: string;
  participante_email: string;
  categoria_id: string;
  categoria_nombre: string;
  categoria_color: string;
  categoria_icono?: string;
  titulo: string;
  descripcion?: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activo' | 'resuelto' | 'archivado';
  investigacion_relacionada_id?: string;
  investigacion_nombre?: string;
  sesion_relacionada_id?: string;
  creado_por?: string;
  creado_por_nombre?: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  fecha_actualizacion: string;
}

// Tipo para crear un nuevo dolor
export interface CrearDolorRequest {
  categoria_id: string;
  titulo: string;
  descripcion?: string;
  severidad?: 'baja' | 'media' | 'alta' | 'critica';
  investigacion_relacionada_id?: string;
  sesion_relacionada_id?: string;
}

// Tipo para actualizar un dolor
export interface ActualizarDolorRequest {
  id: string;
  categoria_id?: string;
  titulo?: string;
  descripcion?: string;
  severidad?: 'baja' | 'media' | 'alta' | 'critica';
  estado?: 'activo' | 'resuelto' | 'archivado';
  fecha_resolucion?: string;
}

// Enums para valores constantes
export enum SeveridadDolor {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export enum EstadoDolor {
  ACTIVO = 'activo',
  RESUELTO = 'resuelto',
  ARCHIVADO = 'archivado'
}

// Utilidades para colores de severidad
export const getSeveridadColor = (severidad: SeveridadDolor): string => {
  switch (severidad) {
    case SeveridadDolor.BAJA:
      return '#10B981'; // Verde
    case SeveridadDolor.MEDIA:
      return '#F59E0B'; // Amarillo
    case SeveridadDolor.ALTA:
      return '#EF4444'; // Rojo
    case SeveridadDolor.CRITICA:
      return '#7C2D12'; // Rojo oscuro
    default:
      return '#6B7280'; // Gris
  }
};

// Utilidades para colores de estado
export const getEstadoColor = (estado: EstadoDolor): string => {
  switch (estado) {
    case EstadoDolor.ACTIVO:
      return '#EF4444'; // Rojo
    case EstadoDolor.RESUELTO:
      return '#10B981'; // Verde
    case EstadoDolor.ARCHIVADO:
      return '#6B7280'; // Gris
    default:
      return '#6B7280'; // Gris
  }
};
