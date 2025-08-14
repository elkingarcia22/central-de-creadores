import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

interface Permiso {
  id: string;
  rol_id: string;
  funcionalidad_id: string;
  permitido: boolean;
  funcionalidad_nombre?: string;
  modulo_nombre?: string;
}

interface UsePermisosReturn {
  permisos: Permiso[];
  loading: boolean;
  error: string | null;
  tienePermiso: (funcionalidad: string) => boolean;
  tienePermisoModulo: (modulo: string) => boolean;
  recargarPermisos: () => Promise<void>;
}

export function usePermisos(): UsePermisosReturn {
  const { user } = useUser();
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPermisos = async () => {
    if (!user?.id) {
      setPermisos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener roles del usuario
      const rolesResponse = await fetch(`/api/usuarios?userId=${user.id}`);
      const rolesData = await rolesResponse.json();
      
      if (!rolesResponse.ok) {
        throw new Error('Error obteniendo roles del usuario');
      }

      const rolesUsuario = rolesData.usuarios?.find((u: any) => u.id === user.id)?.roles || [];
      
      if (rolesUsuario.length === 0) {
        setPermisos([]);
        setLoading(false);
        return;
      }

      // Obtener permisos para todos los roles del usuario
      const permisosPromises = rolesUsuario.map(async (rolId: string) => {
        const permisosResponse = await fetch(`/api/permisos-roles?rol_id=${rolId}`);
        const permisosData = await permisosResponse.json();
        return permisosData.permisos || [];
      });

      const permisosArrays = await Promise.all(permisosPromises);
      const todosLosPermisos = permisosArrays.flat();

      // Filtrar solo permisos habilitados y eliminar duplicados
      const permisosUnicos = todosLosPermisos
        .filter((permiso: Permiso) => permiso.permitido)
        .filter((permiso: Permiso, index: number, self: Permiso[]) => 
          index === self.findIndex(p => p.funcionalidad_id === permiso.funcionalidad_id)
        );

      setPermisos(permisosUnicos);
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  };

  const tienePermiso = (funcionalidad: string): boolean => {
    if (!user?.id || loading) return false;
    
    // Si el usuario es administrador, tiene todos los permisos
    const esAdmin = permisos.some(p => 
      p.funcionalidad_nombre?.includes('gestionar_roles') || 
      p.funcionalidad_nombre?.includes('gestionar_permisos')
    );
    
    if (esAdmin) return true;
    
    return permisos.some(p => p.funcionalidad_nombre === funcionalidad);
  };

  const tienePermisoModulo = (modulo: string): boolean => {
    if (!user?.id || loading) return false;
    
    // Si el usuario es administrador, tiene acceso a todos los módulos
    const esAdmin = permisos.some(p => 
      p.funcionalidad_nombre?.includes('gestionar_roles') || 
      p.funcionalidad_nombre?.includes('gestionar_permisos')
    );
    
    if (esAdmin) return true;
    
    return permisos.some(p => p.modulo_nombre === modulo);
  };

  const recargarPermisos = async () => {
    await cargarPermisos();
  };

  useEffect(() => {
    cargarPermisos();
  }, [user?.id]);

  return {
    permisos,
    loading,
    error,
    tienePermiso,
    tienePermisoModulo,
    recargarPermisos
  };
}
