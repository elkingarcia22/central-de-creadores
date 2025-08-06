// ====================================
// TIPOS TYPESCRIPT - MÓDULO INVESTIGACIONES (SUPABASE)
// ====================================

// Estados de investigación (enum_estado_investigacion)
export type EstadoInvestigacion = 'en_borrador' | 'por_iniciar' | 'en_progreso' | 'finalizado' | 'pausado' | 'cancelado';

// Tipos de prueba (enum_tipo_prueba)
export type TipoPrueba = 'usabilidad' | 'entrevista' | 'encuesta' | 'focus_group' | 'card_sorting' | 'tree_testing' | 'a_b_testing';

// Plataformas (enum_plataforma)
export type Plataforma = 'web' | 'mobile' | 'desktop' | 'tablet' | 'smart_tv' | 'wearable';

// Tipos de sesión (enum_tipo_sesion)
export type TipoSesion = 'presencial' | 'virtual' | 'hibrida';

// Tamaños de empresa
export type TamanoEmpresa = 'startup' | 'pequena' | 'mediana' | 'grande' | 'enterprise';

// Estados de agendamiento
export type EstadoAgendamiento = 'sin_agendar' | 'agendado' | 'confirmado' | 'reprogramado' | 'cancelado';

// Tipos adicionales que faltaban
export type TipoInvestigacion = 'usabilidad' | 'entrevista' | 'focus_group' | 'a_b_testing' | 'card_sorting' | 'tree_testing' | 'encuesta' | 'mercado' | 'concepto' | 'accesibilidad';
export type PrioridadInvestigacion = 'alta' | 'media' | 'baja' | 'critica';
export type EstadoSesion = 'programada' | 'en_progreso' | 'completada' | 'cancelada' | 'reprogramada';

// ====================================
// INTERFACES PRINCIPALES
// ====================================

export interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  industria?: string;
  tamano?: TamanoEmpresa;
  sitio_web?: string;
  email_contacto?: string;
  telefono?: string;
  direccion?: string;
  logo_url?: string;
  color_marca?: string;
  configuracion?: Record<string, any>;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investigacion {
  // Campos principales de la tabla
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  
  // Relaciones con otras tablas
  periodo_id?: string;
  producto_id: string;
  responsable_id?: string;
  tipo_investigacion_id: string;
  implementador_id?: string;
  creado_por?: string;
  
  // Estados y categorías
  estado?: EstadoInvestigacion;
  estado_reclutamiento?: string;
  riesgo?: string;
  riesgo_automatico?: string;
  
  // Configuración de la investigación
  tipo_prueba?: TipoPrueba;
  plataforma?: Plataforma;
  tipo_sesion?: TipoSesion;
  
  // Contenido y enlaces
  libreto?: string;
  link_prueba?: string;
  link_resultados?: string;
  
  // Seguimiento
  fecha_seguimiento?: string;
  notas_seguimiento?: string;
  
  // Metadatos
  creado_el?: string;
  actualizado_el?: string;
  
  // Datos relacionados (joins) - opcionales para cuando se traen con joins
  periodo_nombre?: string;
  producto_nombre?: string;
  responsable_nombre?: string;
  responsable_email?: string;
  implementador_nombre?: string;
  implementador_email?: string;
  tipo_investigacion_nombre?: string;
  creado_por_nombre?: string;
}

export interface Sesion {
  id: string;
  investigacion_id: string;
  titulo: string;
  descripcion?: string;
  
  // Programación
  fecha_programada?: string;
  duracion_minutos: number;
  estado: EstadoSesion;
  
  // Ubicación
  tipo_sesion: TipoSesion;
  ubicacion?: string;
  sala?: string;
  
  // Personal
  moderador_id?: string;
  observadores: string[];
  
  // Configuración
  grabacion_permitida: boolean;
  notas_publicas?: string;
  notas_privadas?: string;
  configuracion?: Record<string, any>;
  
  // Resultados
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  resultados?: Record<string, any>;
  archivos_adjuntos: string[];
  
  created_at: string;
  updated_at: string;
  
  // Datos relacionados
  investigacion_titulo?: string;
  investigacion_estado?: EstadoInvestigacion;
  moderador_nombre?: string;
  moderador_email?: string;
}

// ====================================
// INTERFACES PARA FORMULARIOS
// ====================================

export interface InvestigacionFormData {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  periodo_id?: string;
  producto_id: string;
  responsable_id?: string;
  tipo_investigacion_id: string;
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

export interface SesionFormData {
  titulo: string;
  descripcion: string;
  fecha_programada: string;
  duracion_minutos: number;
  tipo_sesion: TipoSesion;
  ubicacion: string;
  sala: string;
  moderador_id?: string;
  grabacion_permitida: boolean;
  notas_publicas: string;
}

export interface EmpresaFormData {
  nombre: string;
  descripcion: string;
  industria: string;
  tamano: TamanoEmpresa;
  sitio_web: string;
  email_contacto: string;
  telefono: string;
  direccion: string;
}

// ====================================
// INTERFACES PARA FILTROS Y BÚSQUEDA
// ====================================

export interface FiltrosInvestigacion {
  busqueda?: string;
  estado?: EstadoInvestigacion | 'todos';
  tipo?: TipoInvestigacion | 'todos';
  prioridad?: PrioridadInvestigacion | 'todos';
  empresa_id?: string | 'todos';
  creador_id?: string | 'todos';
  fecha_inicio_desde?: string;
  fecha_inicio_hasta?: string;
  fecha_fin_desde?: string;
  fecha_fin_hasta?: string;
}

export interface FiltrosSesion {
  busqueda?: string;
  estado?: EstadoSesion | 'todos';
  tipo_sesion?: TipoSesion | 'todos';
  investigacion_id?: string | 'todos';
  moderador_id?: string | 'todos';
  fecha_desde?: string;
  fecha_hasta?: string;
}

// ====================================
// INTERFACES PARA ESTADÍSTICAS
// ====================================

export interface EstadisticasInvestigaciones {
  total: number;
  por_estado: Record<EstadoInvestigacion, number>;
  por_tipo: Record<TipoInvestigacion, number>;
  por_prioridad: Record<PrioridadInvestigacion, number>;
  total_participantes: number;
  total_sesiones: number;
  sesiones_completadas: number;
  presupuesto_total: number;
  presupuesto_utilizado: number;
  promedio_progreso: number;
}

export interface EstadisticasSesiones {
  total: number;
  por_estado: Record<EstadoSesion, number>;
  por_tipo: Record<TipoSesion, number>;
  duracion_promedio: number;
  asistencia_promedio: number;
  proximas_24h: number;
  proximas_7d: number;
}

// ====================================
// INTERFACES PARA RESPUESTAS API
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
// INTERFACES PARA COMPONENTES
// ====================================

export interface PropsTablaInvestigaciones {
  investigaciones: Investigacion[];
  loading?: boolean;
  onEdit?: (investigacion: Investigacion) => void;
  onDelete?: (investigacion: Investigacion) => void;
  onView?: (investigacion: Investigacion) => void;
  onDuplicate?: (investigacion: Investigacion) => void;
}

export interface PropsFormularioInvestigacion {
  investigacion?: Investigacion;
  empresas: Empresa[];
  onSubmit: (data: InvestigacionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface PropsCardInvestigacion {
  investigacion: Investigacion;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// ====================================
// TIPOS PARA OPCIONES DE SELECT
// ====================================

export interface OpcionSelect {
  value: string;
  label: string;
  disabled?: boolean;
}

export const OPCIONES_ESTADO_INVESTIGACION: OpcionSelect[] = [
  { value: 'en_borrador', label: 'Borrador' },
  { value: 'por_iniciar', label: 'Por iniciar' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'cancelado', label: 'Cancelado' }
];

export const OPCIONES_TIPO_INVESTIGACION: OpcionSelect[] = [
  { value: 'usabilidad', label: 'Usabilidad' },
  { value: 'mercado', label: 'Investigación de Mercado' },
  { value: 'concepto', label: 'Test de Concepto' },
  { value: 'accesibilidad', label: 'Accesibilidad' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'encuesta', label: 'Encuesta' },
  { value: 'focus_group', label: 'Focus Group' }
];

export const OPCIONES_PRIORIDAD: OpcionSelect[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' }
];

export const OPCIONES_TIPO_SESION: OpcionSelect[] = [
  { value: 'virtual', label: 'Virtual' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrida', label: 'Híbrida' }
];

export const OPCIONES_TAMANO_EMPRESA: OpcionSelect[] = [
  { value: 'startup', label: 'Startup' },
  { value: 'pequena', label: 'Pequeña' },
  { value: 'mediana', label: 'Mediana' },
  { value: 'grande', label: 'Grande' },
  { value: 'enterprise', label: 'Enterprise' }
];

export const OPCIONES_ESTADO_AGENDAMIENTO: OpcionSelect[] = [
  { value: 'sin_agendar', label: 'Sin agendar' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'reprogramado', label: 'Reprogramado' },
  { value: 'cancelado', label: 'Cancelado' }
];

// ====================================
// UTILIDADES PARA COLORES Y ESTADOS
// ====================================

export const getColorEstadoInvestigacion = (estado: EstadoInvestigacion | undefined): string => {
  if (!estado) return 'default';
  const colores: Record<EstadoInvestigacion, string> = {
    'en_borrador': 'default',
    'por_iniciar': 'warning',
    'en_progreso': 'primary',
    'finalizado': 'success',
    'pausado': 'secondary',
    'cancelado': 'danger'
  };
  return colores[estado] || 'default';
};

export const getColorTipoInvestigacion = (tipo: TipoInvestigacion | undefined): string => {
  if (!tipo) return 'default';
  const colores: Record<TipoInvestigacion, string> = {
    'usabilidad': 'primary',
    'mercado': 'success',
    'concepto': 'secondary',
    'accesibilidad': 'warning',
    'entrevista': 'info',
    'encuesta': 'primary',
    'focus_group': 'secondary',
    'a_b_testing': 'primary',
    'card_sorting': 'secondary',
    'tree_testing': 'info'
  };
  return colores[tipo] || 'default';
};

export const getColorPrioridad = (prioridad: PrioridadInvestigacion | undefined): string => {
  if (!prioridad) return 'default';
  const colores: Record<PrioridadInvestigacion, string> = {
    'baja': 'default',
    'media': 'warning',
    'alta': 'danger',
    'critica': 'destructive'
  };
  return colores[prioridad] || 'default';
};

export const getColorEstadoSesion = (estado: EstadoSesion): string => {
  const colores: Record<EstadoSesion, string> = {
    'programada': 'warning',
    'en_progreso': 'success',
    'completada': 'info',
    'cancelada': 'danger',
    'reprogramada': 'secondary'
  };
  return colores[estado] || 'default';
};

export const getColorEstadoAgendamiento = (estado: EstadoAgendamiento | undefined): string => {
  if (!estado) return 'default';
  const colores: Record<EstadoAgendamiento, string> = {
    'sin_agendar': 'default',
    'agendado': 'warning',
    'confirmado': 'success',
    'reprogramado': 'secondary',
    'cancelado': 'danger'
  };
  return colores[estado] || 'default';
};

// ====================================
// VALIDACIONES
// ====================================

export const validarInvestigacion = (data: InvestigacionFormData): string[] => {
  const errores: string[] = [];
  
  if (!data.nombre.trim()) {
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
  
  if (!data.tipo_investigacion_id) {
    errores.push('El tipo de investigación es requerido');
  }
  
  return errores;
};

export const validarSesion = (data: SesionFormData): string[] => {
  const errores: string[] = [];
  
  if (!data.titulo.trim()) {
    errores.push('El título es requerido');
  }
  
  if (!data.fecha_programada) {
    errores.push('La fecha programada es requerida');
  }
  
  if (data.duracion_minutos < 15) {
    errores.push('La duración mínima es 15 minutos');
  }
  
  if (data.duracion_minutos > 480) {
    errores.push('La duración máxima es 8 horas');
  }
  
  if (!data.ubicacion.trim()) {
    errores.push('La ubicación es requerida');
  }
  
  return errores;
}; 