// ====================================
// TIPOS PARA TABLA INVESTIGACIONES - SUPABASE
// ====================================

// Estados de investigación (enum_estado_investigacion)
export type EstadoInvestigacion = 'en_borrador' | 'por_agendar' | 'por_iniciar' | 'en_progreso' | 'finalizado' | 'pausado' | 'cancelado';

// Tipos de prueba (enum_tipo_prueba)
export type TipoPrueba = 'usabilidad' | 'entrevista' | 'encuesta' | 'focus_group' | 'card_sorting' | 'tree_testing' | 'a_b_testing';

// Plataformas (enum_plataforma) - VALORES REALES DE SUPABASE
export type Plataforma = 'slack' | 'meet' | 'google_form' | 'appcues' | 'mail' | 'zoom' | 'teams' | 'cualquiera';

// Tipos de sesión (enum_tipo_sesion) - VALORES REALES DE SUPABASE
export type TipoSesion = 'sesion_con_usuarios' | 'prueba_rapida' | 'workshop' | 'co_creacion';

// ====================================
// INTERFACE PRINCIPAL - TABLA INVESTIGACIONES (SUPABASE REAL)
// ====================================

export interface Investigacion {
  // Campos principales (NOT NULL)
  id: string; // uuid PRIMARY KEY
  nombre: string; // text NOT NULL
  fecha_inicio: string; // timestamp NOT NULL
  fecha_fin: string; // timestamp NOT NULL
  
  // Foreign Keys (uuid)
  producto_id: string; // uuid NOT NULL → public.productos.id
  tipo_investigacion_id: string; // uuid NOT NULL → public.tipos_investigacion.id
  
  // Foreign Keys opcionales (uuid, NULL permitido)
  periodo_id?: string | null; // uuid → public.periodo.id
  responsable_id?: string | null; // uuid → public.usuarios.id
  implementador_id?: string | null; // uuid → public.usuarios.id
  estado_reclutamiento?: string | null; // uuid → public.estado_reclutamiento_cat.id
  riesgo?: string | null; // uuid → public.riesgo_cat.id
  creado_por?: string | null; // uuid → public.usuarios.id
  
  // Enums opcionales
  estado?: EstadoInvestigacion | null; // enum_estado_investigacion DEFAULT 'en_borrador'
  tipo_prueba?: TipoPrueba | null; // enum_tipo_prueba
  plataforma?: Plataforma | null; // enum_plataforma
  tipo_sesion?: TipoSesion | null; // enum_tipo_sesion
  
  // Campos de texto opcionales
  libreto?: string | null; // text
  link_prueba?: string | null; // text
  link_resultados?: string | null; // text
  notas_seguimiento?: string | null; // text
  riesgo_automatico?: string | null; // text
  
  // Fechas de seguimiento
  fecha_seguimiento?: string | null; // date
  
  // Timestamps automáticos
  creado_el?: string | null; // timestamp with time zone DEFAULT now()
  actualizado_el?: string | null; // timestamp with time zone DEFAULT now()
  
  // Datos relacionados (joins) - solo para consultas con JOIN
  periodo_nombre?: string;
  producto_nombre?: string;
  responsable_nombre?: string;
  responsable_email?: string;
  implementador_nombre?: string;
  implementador_email?: string;
  tipo_investigacion_nombre?: string;
  creado_por_nombre?: string;
  estado_reclutamiento_nombre?: string;
  riesgo_nombre?: string;
}

// ====================================
// INTERFACES PARA FORMULARIOS
// ====================================

export interface InvestigacionFormData {
  // Campos requeridos
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  producto_id: string;
  tipo_investigacion_id: string;
  
  // Campos opcionales
  periodo_id?: string;
  responsable_id?: string;
  implementador_id?: string;
  estado?: EstadoInvestigacion;
  tipo_prueba?: TipoPrueba;
  plataforma?: Plataforma;
  tipo_sesion?: TipoSesion;
  libreto?: string;
  link_prueba?: string;
  link_resultados?: string;
  notas_seguimiento?: string;
}

// ====================================
// INTERFACES PARA CATÁLOGOS
// ====================================

export interface Periodo {
  id: string;
  nombre: string;
  etiqueta: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface TipoInvestigacion {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  roles?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EstadoReclutamiento {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
}

export interface RiesgoCategoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  nivel?: number;
}

// ====================================
// OPCIONES PARA SELECTS
// ====================================

export const OPCIONES_ESTADO_INVESTIGACION = [
  { value: 'en_borrador', label: 'En Borrador' },
  { value: 'por_iniciar', label: 'Por Iniciar' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'despreciado', label: 'Despreciado' }
];

export const OPCIONES_TIPO_PRUEBA = [
  { value: 'usabilidad', label: 'Usabilidad' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'encuesta', label: 'Encuesta' },
  { value: 'focus_group', label: 'Focus Group' },
  { value: 'card_sorting', label: 'Card Sorting' },
  { value: 'tree_testing', label: 'Tree Testing' },
  { value: 'a_b_testing', label: 'A/B Testing' }
];

export const OPCIONES_PLATAFORMA = [
  { value: 'slack', label: 'Slack' },
  { value: 'meet', label: 'Meet' },
  { value: 'google_form', label: 'Google Form' },
  { value: 'appcues', label: 'Appcues' },
  { value: 'mail', label: 'Mail' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Teams' },
  { value: 'cualquiera', label: 'Cualquiera' }
];

export const OPCIONES_TIPO_SESION = [
  { value: 'sesion_con_usuarios', label: 'Sesión con Usuarios' },
  { value: 'prueba_rapida', label: 'Prueba Rápida' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'co_creacion', label: 'Co-creación' }
];

// ====================================
// RESPUESTAS DE API
// ====================================

export interface RespuestaAPI<T> {
  data: T;
  error?: string;
  mensaje?: string;
}

export interface RespuestaPaginada<T> {
  data: T[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
  error?: string;
}

// ====================================
// UTILIDADES
// ====================================

export const getColorEstadoInvestigacion = (estado?: EstadoInvestigacion | null): string => {
  switch (estado) {
    case 'en_borrador': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'por_agendar': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'por_iniciar': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'en_progreso': return 'bg-green-100 text-green-800 border-green-200';
    case 'finalizado': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'pausado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getColorTipoPrueba = (tipo?: TipoPrueba | null): string => {
  switch (tipo) {
    case 'usabilidad': return 'bg-blue-100 text-blue-800';
    case 'entrevista': return 'bg-green-100 text-green-800';
    case 'encuesta': return 'bg-purple-100 text-purple-800';
    case 'focus_group': return 'bg-orange-100 text-orange-800';
    case 'card_sorting': return 'bg-pink-100 text-pink-800';
    case 'tree_testing': return 'bg-indigo-100 text-indigo-800';
    case 'a_b_testing': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const validarInvestigacion = (data: InvestigacionFormData): string[] => {
  const errores: string[] = [];
  
  if (!data.nombre?.trim()) {
    errores.push('El nombre es requerido');
  }
  
  if (!data.fecha_inicio) {
    errores.push('La fecha de inicio es requerida');
  }
  
  if (!data.fecha_fin) {
    errores.push('La fecha de fin es requerida');
  }
  
  if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) >= new Date(data.fecha_fin)) {
    errores.push('La fecha de fin debe ser posterior a la fecha de inicio');
  }
  
  if (!data.producto_id) {
    errores.push('El producto es requerido');
  }
  
  if (!data.tipo_investigacion_id) {
    errores.push('El tipo de investigación es requerido');
  }
  
  return errores;
}; 