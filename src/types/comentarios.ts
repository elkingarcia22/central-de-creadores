// =====================================================
// TIPOS PARA SISTEMA DE COMENTARIOS DE PARTICIPANTES
// =====================================================

export interface ComentarioParticipante {
  id: string;
  participante_id: string;
  usuario_id: string;
  
  // Información básica
  titulo: string;
  descripcion?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Categorías de perfil del cliente
  estilo_comunicacion?: EstiloComunicacion;
  toma_decisiones?: TomaDecisiones;
  relacion_proveedores?: RelacionProveedores;
  cultura_organizacional?: CulturaOrganizacional;
  nivel_apertura?: NivelApertura;
  expectativas_respuesta?: ExpectativasRespuesta;
  tipo_feedback?: TipoFeedback;
  motivacion_principal?: MotivacionPrincipal;
  
  // Campos adicionales
  observaciones_adicionales?: string;
  recomendaciones?: string;
  
  // Metadatos
  activo: boolean;
  etiquetas?: string[];
  
  // Información relacionada (desde la vista)
  participante_nombre?: string;
  participante_email?: string;
  empresa_id?: string;
  empresa_nombre?: string;
  usuario_nombre?: string;
  usuario_email?: string;
  usuario_rol?: string;
}

export interface ComentarioParticipanteForm {
  participante_id: string;
  titulo: string;
  descripcion?: string;
  
  // Categorías de perfil
  estilo_comunicacion?: EstiloComunicacion;
  toma_decisiones?: TomaDecisiones;
  relacion_proveedores?: RelacionProveedores;
  cultura_organizacional?: CulturaOrganizacional;
  nivel_apertura?: NivelApertura;
  expectativas_respuesta?: ExpectativasRespuesta;
  tipo_feedback?: TipoFeedback;
  motivacion_principal?: MotivacionPrincipal;
  
  // Campos adicionales
  observaciones_adicionales?: string;
  recomendaciones?: string;
  etiquetas?: string[];
}

export interface EstadisticasComentarios {
  total_comentarios: number;
  ultimo_comentario?: string;
  perfil_estilo_comunicacion?: string;
  perfil_toma_decisiones?: string;
  perfil_relacion_proveedores?: string;
  perfil_cultura_organizacional?: string;
  perfil_motivacion_principal?: string;
}

// Enums para las categorías
export type EstiloComunicacion = 
  | 'abierto' 
  | 'cerrado' 
  | 'directo' 
  | 'diplomatico' 
  | 'formal' 
  | 'informal';

export type TomaDecisiones = 
  | 'rapida' 
  | 'lenta' 
  | 'datos' 
  | 'intuicion' 
  | 'centralizada' 
  | 'distribuida';

export type RelacionProveedores = 
  | 'colaborativo' 
  | 'transaccional' 
  | 'confianza' 
  | 'control' 
  | 'leal' 
  | 'oportunista';

export type CulturaOrganizacional = 
  | 'innovadora' 
  | 'conservadora' 
  | 'riesgo' 
  | 'aversion_riesgo' 
  | 'jerarquica' 
  | 'horizontal';

export type NivelApertura = 
  | 'alto' 
  | 'medio' 
  | 'bajo';

export type ExpectativasRespuesta = 
  | 'inmediata' 
  | 'normal' 
  | 'tolerante';

export type TipoFeedback = 
  | 'constante' 
  | 'esporadico' 
  | 'solo_problemas';

export type MotivacionPrincipal = 
  | 'eficiencia' 
  | 'crecimiento' 
  | 'seguridad' 
  | 'prestigio';

// Opciones para los selects
export const OPCIONES_ESTILO_COMUNICACION = [
  { value: 'abierto', label: 'Abierto - Se expresa con confianza' },
  { value: 'cerrado', label: 'Cerrado - Reservado y limitado' },
  { value: 'directo', label: 'Directo - Va al grano' },
  { value: 'diplomatico', label: 'Diplomático - Rodea las conversaciones' },
  { value: 'formal', label: 'Formal - Prefiere interacciones estructuradas' },
  { value: 'informal', label: 'Informal - Interacciones más casuales' }
];

export const OPCIONES_TOMA_DECISIONES = [
  { value: 'rapida', label: 'Rápida - Decide pronto' },
  { value: 'lenta', label: 'Lenta - Requiere procesos largos' },
  { value: 'datos', label: 'Basada en datos - Se enfoca en métricas' },
  { value: 'intuicion', label: 'Basada en intuición - Se guía por percepciones' },
  { value: 'centralizada', label: 'Centralizada - Decide una sola persona' },
  { value: 'distribuida', label: 'Distribuida - Decide un comité amplio' }
];

export const OPCIONES_RELACION_PROVEEDORES = [
  { value: 'colaborativo', label: 'Colaborativo - Busca relación de socio estratégico' },
  { value: 'transaccional', label: 'Transaccional - Solo relación de proveedor' },
  { value: 'confianza', label: 'Confianza - Delega y confía' },
  { value: 'control', label: 'Control - Busca controlar cada detalle' },
  { value: 'leal', label: 'Leal - Mantiene relaciones largas' },
  { value: 'oportunista', label: 'Oportunista - Cambia fácilmente si aparece algo nuevo' }
];

export const OPCIONES_CULTURA_ORGANIZACIONAL = [
  { value: 'innovadora', label: 'Innovadora - Busca probar cosas nuevas' },
  { value: 'conservadora', label: 'Conservadora - Prefiere lo seguro' },
  { value: 'riesgo', label: 'Orientada al riesgo - Acepta experimentar' },
  { value: 'aversion_riesgo', label: 'Aversión al riesgo - Evita cambios' },
  { value: 'jerarquica', label: 'Jerárquica - Todo pasa por un jefe' },
  { value: 'horizontal', label: 'Horizontal - Hay autonomía distribuida' }
];

export const OPCIONES_NIVEL_APERTURA = [
  { value: 'alto', label: 'Alto - Comparte mucha información sensible' },
  { value: 'medio', label: 'Medio - Comparte información moderada' },
  { value: 'bajo', label: 'Bajo - Comparte poca información' }
];

export const OPCIONES_EXPECTATIVAS_RESPUESTA = [
  { value: 'inmediata', label: 'Inmediata - Espera respuestas rápidas' },
  { value: 'normal', label: 'Normal - Respuestas en tiempo estándar' },
  { value: 'tolerante', label: 'Tolerante - Acepta tiempos largos' }
];

export const OPCIONES_TIPO_FEEDBACK = [
  { value: 'constante', label: 'Constante - Da retroalimentación frecuente' },
  { value: 'esporadico', label: 'Esporádico - Retroalimentación ocasional' },
  { value: 'solo_problemas', label: 'Solo problemas - Se calla hasta que algo falla' }
];

export const OPCIONES_MOTIVACION_PRINCIPAL = [
  { value: 'eficiencia', label: 'Eficiencia - Busca ahorrar tiempo/dinero' },
  { value: 'crecimiento', label: 'Crecimiento - Enfocado en expansión e innovación' },
  { value: 'seguridad', label: 'Seguridad - Necesita estabilidad y bajo riesgo' },
  { value: 'prestigio', label: 'Prestigio - Valora status y diferenciación' }
];

// Función para obtener el label de una opción
export function obtenerLabelOpcion(
  opciones: Array<{ value: string; label: string }>,
  valor?: string
): string {
  if (!valor) return '';
  const opcion = opciones.find(opt => opt.value === valor);
  return opcion ? opcion.label : valor;
}

// Función para formatear fecha
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función para obtener el color del chip según la categoría
export function obtenerColorCategoria(categoria: string): string {
  const colores: Record<string, string> = {
    // Estilo de comunicación
    'abierto': 'green',
    'cerrado': 'gray',
    'directo': 'blue',
    'diplomatico': 'purple',
    'formal': 'indigo',
    'informal': 'orange',
    
    // Toma de decisiones
    'rapida': 'green',
    'lenta': 'yellow',
    'datos': 'blue',
    'intuicion': 'purple',
    'centralizada': 'red',
    'distribuida': 'green',
    
    // Relación con proveedores
    'colaborativo': 'green',
    'transaccional': 'gray',
    'confianza': 'blue',
    'control': 'red',
    'leal': 'green',
    'oportunista': 'orange',
    
    // Cultura organizacional
    'innovadora': 'green',
    'conservadora': 'gray',
    'riesgo': 'orange',
    'aversion_riesgo': 'yellow',
    'jerarquica': 'red',
    'horizontal': 'green',
    
    // Nivel de apertura
    'alto': 'green',
    'medio': 'blue',
    'bajo': 'gray',
    
    // Expectativas de respuesta
    'inmediata': 'red',
    'normal': 'blue',
    'tolerante': 'green',
    
    // Tipo de feedback
    'constante': 'green',
    'esporadico': 'blue',
    'solo_problemas': 'red',
    
    // Motivación principal
    'eficiencia': 'blue',
    'crecimiento': 'green',
    'seguridad': 'yellow',
    'prestigio': 'purple'
  };
  
  return colores[categoria] || 'gray';
}
