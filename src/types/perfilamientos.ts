// =====================================================
// TIPOS PARA SISTEMA DE PERFILAMIENTO DE PARTICIPANTES
// =====================================================

export interface PerfilamientoParticipante {
  id: string;
  participante_id: string;
  usuario_perfilador_id: string;
  
  // Categoría del perfilamiento
  categoria_perfilamiento: CategoriaPerfilamiento;
  
  // Datos específicos de la categoría
  valor_principal: string;
  observaciones?: string;
  contexto_interaccion?: string;
  
  // Metadatos
  fecha_perfilamiento: string;
  etiquetas: string[];
  confianza_observacion: number;
  
  // Control
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Información relacionada (desde la vista)
  participante_nombre?: string;
  participante_email?: string;
  empresa_nombre?: string;
  usuario_perfilador_nombre?: string;
  usuario_perfilador_email?: string;
  usuario_perfilador_rol?: string;
}

export interface PerfilamientoParticipanteForm {
  participante_id: string;
  categoria_perfilamiento: CategoriaPerfilamiento;
  valor_principal: string;
  observaciones?: string;
  contexto_interaccion?: string;
  etiquetas: string[];
  confianza_observacion: number;
}

export interface EstadisticasPerfilamiento {
  categoria: string;
  total_perfilamientos: number;
  ultimo_perfilamiento?: string;
  valores_principales: string[];
  confianza_promedio: number;
}

// Enums para las categorías de perfilamiento
export type CategoriaPerfilamiento = 
  | 'comunicacion' 
  | 'decisiones' 
  | 'proveedores' 
  | 'cultura' 
  | 'comportamiento' 
  | 'motivaciones';

// Opciones para cada categoría
export const OPCIONES_COMUNICACION = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'directo', label: 'Directo' },
  { value: 'diplomatico', label: 'Diplomático' },
  { value: 'formal', label: 'Formal' },
  { value: 'informal', label: 'Informal' }
];

export const OPCIONES_DECISIONES = [
  { value: 'rapida', label: 'Rápida' },
  { value: 'lenta', label: 'Lenta' },
  { value: 'datos', label: 'Basada en datos' },
  { value: 'intuicion', label: 'Basada en intuición' },
  { value: 'centralizada', label: 'Centralizada' },
  { value: 'distribuida', label: 'Distribuida' }
];

export const OPCIONES_PROVEEDORES = [
  { value: 'colaborativo', label: 'Colaborativo' },
  { value: 'transaccional', label: 'Transaccional' },
  { value: 'confianza', label: 'Basado en confianza' },
  { value: 'control', label: 'Basado en control' },
  { value: 'leal', label: 'Leal' },
  { value: 'oportunista', label: 'Oportunista' }
];

export const OPCIONES_CULTURA = [
  { value: 'innovadora', label: 'Innovadora' },
  { value: 'conservadora', label: 'Conservadora' },
  { value: 'riesgo', label: 'Orientada al riesgo' },
  { value: 'aversion_riesgo', label: 'Aversión al riesgo' },
  { value: 'jerarquica', label: 'Jerárquica' },
  { value: 'horizontal', label: 'Horizontal' }
];

export const OPCIONES_COMPORTAMIENTO = [
  { value: 'alta_apertura', label: 'Alta apertura' },
  { value: 'media_apertura', label: 'Media apertura' },
  { value: 'baja_apertura', label: 'Baja apertura' },
  { value: 'inmediata', label: 'Respuesta inmediata' },
  { value: 'tolerante', label: 'Tolerante a demoras' },
  { value: 'feedback_constante', label: 'Feedback constante' },
  { value: 'feedback_esporadico', label: 'Feedback esporádico' }
];

export const OPCIONES_MOTIVACIONES = [
  { value: 'eficiencia', label: 'Eficiencia' },
  { value: 'crecimiento', label: 'Crecimiento' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'prestigio', label: 'Prestigio' },
  { value: 'innovacion', label: 'Innovación' },
  { value: 'estabilidad', label: 'Estabilidad' }
];

// Mapeo de categorías a opciones
export const OPCIONES_POR_CATEGORIA = {
  comunicacion: OPCIONES_COMUNICACION,
  decisiones: OPCIONES_DECISIONES,
  proveedores: OPCIONES_PROVEEDORES,
  cultura: OPCIONES_CULTURA,
  comportamiento: OPCIONES_COMPORTAMIENTO,
  motivaciones: OPCIONES_MOTIVACIONES
};

// Etiquetas de contexto comunes
export const ETIQUETAS_CONTEXTO = [
  'primera_reunion',
  'presentacion',
  'negociacion',
  'seguimiento',
  'problema',
  'exito',
  'feedback',
  'evaluacion',
  'planificacion',
  'implementacion'
];

// Función para obtener el color de la categoría
export function obtenerColorCategoria(categoria: CategoriaPerfilamiento): string {
  const colores = {
    comunicacion: 'blue',
    decisiones: 'green',
    proveedores: 'purple',
    cultura: 'orange',
    comportamiento: 'teal',
    motivaciones: 'indigo'
  };
  return colores[categoria] || 'gray';
}

// Función para obtener el nombre legible de la categoría
export function obtenerNombreCategoria(categoria: CategoriaPerfilamiento): string {
  const nombres = {
    comunicacion: 'Estilo de Comunicación',
    decisiones: 'Toma de Decisiones',
    proveedores: 'Relación con Proveedores',
    cultura: 'Cultura Organizacional',
    comportamiento: 'Comportamiento en la Relación',
    motivaciones: 'Motivaciones y Drivers'
  };
  return nombres[categoria] || categoria;
}

// Función para obtener el icono de la categoría
export function obtenerIconoCategoria(categoria: CategoriaPerfilamiento): string {
  const iconos = {
    comunicacion: 'MessageIcon',
    decisiones: 'CheckCircleIcon',
    proveedores: 'HandshakeIcon',
    cultura: 'BuildingIcon',
    comportamiento: 'UserIcon',
    motivaciones: 'TargetIcon'
  };
  return iconos[categoria] || 'InfoIcon';
}
