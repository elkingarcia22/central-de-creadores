import { ReactNode } from 'react';
import { usePermisos } from '../../hooks/usePermisos';

interface PermisoRenderProps {
  children: ReactNode;
  funcionalidad?: string;
  modulo?: string;
  fallback?: ReactNode;
  showWhenLoading?: boolean;
}

export default function PermisoRender({ 
  children, 
  funcionalidad, 
  modulo, 
  fallback,
  showWhenLoading = false
}: PermisoRenderProps) {
  const { tienePermiso, tienePermisoModulo, loading } = usePermisos();

  // Si está cargando, mostrar según la configuración
  if (loading) {
    return showWhenLoading ? <>{children}</> : null;
  }

  // Verificar permisos
  let tieneAcceso = false;

  if (funcionalidad) {
    tieneAcceso = tienePermiso(funcionalidad);
  } else if (modulo) {
    tieneAcceso = tienePermisoModulo(modulo);
  } else {
    // Si no se especifica funcionalidad ni módulo, permitir acceso
    tieneAcceso = true;
  }

  // Si tiene acceso, mostrar el contenido
  if (tieneAcceso) {
    return <>{children}</>;
  }

  // Si no tiene acceso, mostrar fallback o nada
  return fallback ? <>{fallback}</> : null;
}
