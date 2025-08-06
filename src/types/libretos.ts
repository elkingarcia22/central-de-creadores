// ====================================
// TIPOS PARA TABLA LIBRETOS_INVESTIGACION
// ====================================

export interface LibretoInvestigacion {
  // Campos principales
  id: string; // uuid PRIMARY KEY
  investigacion_id: string; // uuid NOT NULL -> public.investigaciones.id
  
  // Contenido del libreto
  problema_situacion?: string | null; // text
  hipotesis?: string | null; // text
  objetivos?: string | null; // text
  resultado_esperado?: string | null; // text
  productos_recomendaciones?: string | null; // text
  
  // Referencias a catálogos
  plataforma_id?: string | null; // uuid -> public.plataformas_cat.id
  tipo_prueba_id?: string | null; // uuid -> public.tipos_prueba_cat.id
  rol_empresa_id?: string | null; // uuid -> public.roles_empresa.id
  industria_id?: string | null; // uuid -> public.industrias.id
  pais_id?: string | null; // uuid -> public.paises.id
  modalidad_id?: string[] | null; // uuid[] -> public.modalidades.id (cambiado a array)
  tamano_empresa_id?: string[] | null; // uuid[] -> public.tamano_empresa.id (cambiado a array)
  
  // Configuración de la sesión
  numero_participantes?: number | null; // int4
  nombre_sesion?: string | null; // text
  usuarios_participantes?: string[] | null; // uuid[] array
  duracion_estimada?: number | null; // int4 (minutos)
  descripcion_general?: string | null; // text
  link_prototipo?: string | null; // text
  
  // Metadatos
  creado_por?: string | null; // uuid
  creado_el?: string | null; // timestamp with time zone DEFAULT now()
  actualizado_el?: string | null; // timestamp with time zone DEFAULT now()
}

// ====================================
// INTERFACE PARA FORMULARIOS
// ====================================

export interface LibretoFormData {
  // Campos requeridos
  investigacion_id: string;
  
  // Contenido del libreto (opcional)
  problema_situacion?: string;
  hipotesis?: string;
  objetivos?: string;
  resultado_esperado?: string;
  productos_recomendaciones?: string;
  
  // Configuración (opcional)
  plataforma_id?: string;
  tipo_prueba_id?: string;
  rol_empresa_id?: string;
  industria_id?: string;
  pais_id?: string;
  modalidad_id?: string[]; // Cambiado a array
  tamano_empresa_id?: string[]; // Cambiado a array
  
  // Sesión (opcional)
  numero_participantes?: number;
  nombre_sesion?: string;
  usuarios_participantes?: string[];
  duracion_estimada?: number;
  descripcion_general?: string;
  link_prototipo?: string;
}

// ====================================
// INTERFACES PARA CATÁLOGOS RELACIONADOS
// ====================================

export interface Plataforma {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface RolEmpresa {
  id: string;
  nombre: string;
}

export interface Industria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Modalidad {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface TamanoEmpresa {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface TipoPrueba {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Pais {
  id: string;
  nombre: string;
  activo: boolean;
}

// ====================================
// TIPOS PARA RESPUESTAS API
// ====================================

export interface RespuestaAPILibreto<T> {
  data: T;
  error?: string | null;
  mensaje?: string;
}

// ====================================
// ENUMS Y CONSTANTES
// ====================================

// Los tipos de prueba ahora vienen de la base de datos
// La constante TIPOS_PRUEBA ya no se usa, reemplazada por la interfaz TipoPrueba

export const PAISES = [
  'Colombia',
  'México',
  'Argentina',
  'Chile',
  'Perú',
  'Ecuador',
  'Venezuela',
  'Bolivia',
  'Paraguay',
  'Uruguay',
  'España',
  'Estados Unidos',
  'Otro'
] as const;

export type PaisConstante = typeof PAISES[number]; 