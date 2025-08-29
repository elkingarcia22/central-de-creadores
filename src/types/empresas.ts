export interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  kam_id?: string;
  kam_nombre?: string;
  kam_email?: string;
  kam_foto_url?: string;
  pais_id?: string;
  pais_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  tamano_id?: string;
  tamano_nombre?: string;
  relacion_id?: string;
  relacion_nombre?: string;
  producto_id?: string;
  producto_nombre?: string;
  industria_id?: string;
  industria_nombre?: string;
  modalidad_id?: string;
  modalidad_nombre?: string;
  productos_ids?: string[];
  participaciones?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Usuario {
  id: string;
  full_name?: string | null;
  nombre?: string | null;
  email?: string | null;
  correo?: string | null;
  avatar_url?: string | null;
  roles?: string[];
  activo?: boolean;
}

export interface FilterValuesEmpresa {
  busqueda?: string;
  estado?: string;
  tamano?: string;
  pais?: string;
  kam_id?: string;
  relacion?: string;
  producto?: string;
  industria?: string;
  modalidad?: string;
}

export interface FilterOptions {
  estados: { value: string; label: string }[];
  tamanos: { value: string; label: string }[];
  paises: { value: string; label: string }[];
  kams: { value: string; label: string }[];
  relaciones: { value: string; label: string }[];
  productos: { value: string; label: string }[];
  industrias: { value: string; label: string }[];
  modalidades: { value: string; label: string }[];
}
