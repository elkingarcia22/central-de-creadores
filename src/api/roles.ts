import React from 'react';
import { supabase } from './supabase';

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

// Cache de roles para evitar consultas repetidas
let rolesCache: { value: string; label: string }[] | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en millisegundos

/**
 * Obtener todos los roles disponibles desde la base de datos
 */
export async function obtenerRoles(): Promise<{ data: Rol[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('roles_plataforma')
      .select('id, nombre')
      .order('nombre');

    if (error) {
      console.error('Error obteniendo roles:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error inesperado obteniendo roles:', err);
    return { data: [], error: 'Error inesperado al obtener roles' };
  }
}

/**
 * Roles por defecto como fallback
 */
export const ROLES_DEFAULT = [
  { value: 'bcc17f6a-d751-4c39-a479-412abddde0fa', label: 'Administrador' },
  { value: 'e1fb53e3-3d1c-4ff5-bdac-9a1285dd99d7', label: 'Investigador' },
  { value: 'fcf6ffc7-e8d3-407b-8c72-b4a7e8db6c9c', label: 'Reclutador' }
];

/**
 * Obtener los roles formateados para componentes Select/MultiSelect con cache
 */
export async function obtenerRolesParaSelect(): Promise<{ value: string; label: string }[]> {
  // Verificar cache válido
  const ahora = Date.now();
  if (rolesCache && ahora < cacheExpiry) {
    console.log('Usando roles desde cache');
    return rolesCache;
  }

  try {
    console.log('Cargando roles desde base de datos...');
    const { data, error } = await obtenerRoles();
    
    if (error || !data.length) {
      console.warn('Fallback a roles por defecto:', error);
      rolesCache = ROLES_DEFAULT;
      cacheExpiry = ahora + CACHE_DURATION;
      return ROLES_DEFAULT;
    }

    // Actualizar cache
    rolesCache = data.map(rol => ({
      value: rol.id, // Usar el ID como value para la base de datos
      label: rol.nombre, // Mostrar el nombre en la UI
    }));
    cacheExpiry = ahora + CACHE_DURATION;
    
    console.log('Roles cargados y cacheados:', rolesCache);
    return rolesCache;
  } catch (err) {
    console.error('Error obteniendo roles, usando fallback:', err);
    rolesCache = ROLES_DEFAULT;
    cacheExpiry = ahora + CACHE_DURATION;
    return ROLES_DEFAULT;
  }
}

/**
 * Obtener roles de forma síncrona desde cache (si está disponible)
 */
export function obtenerRolesDesdeCache(): { value: string; label: string }[] | null {
  const ahora = Date.now();
  if (rolesCache && ahora < cacheExpiry) {
    return rolesCache;
  }
  return null;
}

/**
 * Forzar recarga de roles (limpiar cache)
 */
export function recargarRoles(): void {
  rolesCache = null;
  cacheExpiry = 0;
}

/**
 * Hook personalizado para usar roles en componentes React
 */
export function useRoles() {
  const [roles, setRoles] = React.useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cargarRoles = async () => {
      try {
        // Primero intentar usar cache
        const rolesEnCache = obtenerRolesDesdeCache();
        if (rolesEnCache) {
          console.log('Usando roles desde cache en hook');
          setRoles(rolesEnCache);
          setLoading(false);
          setError(null);
          return;
        }

        // Si no hay cache, cargar desde BD
        setLoading(true);
        const rolesData = await obtenerRolesParaSelect();
        setRoles(rolesData);
        setError(null);
      } catch (err) {
        console.error('Error cargando roles:', err);
        setError('Error cargando roles');
        // Fallback
        setRoles(ROLES_DEFAULT);
      } finally {
        setLoading(false);
      }
    };

    cargarRoles();
  }, []);

  return { roles, loading, error, recargar: recargarRoles };
} 