import { ReactNode } from 'react';
import { usePermisos } from '../../hooks/usePermisos';
import { Typography, Button } from '../ui';

interface PermisoGuardProps {
  children: ReactNode;
  funcionalidad?: string;
  modulo?: string;
  fallback?: ReactNode;
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export default function PermisoGuard({ 
  children, 
  funcionalidad, 
  modulo, 
  fallback,
  redirectTo,
  onUnauthorized 
}: PermisoGuardProps) {
  const { tienePermiso, tienePermisoModulo, loading } = usePermisos();

  // Si está cargando, mostrar un estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Typography variant="body2" color="secondary">
            Verificando permisos...
          </Typography>
        </div>
      </div>
    );
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

  // Si no tiene acceso, mostrar fallback o mensaje por defecto
  if (fallback) {
    return <>{fallback}</>;
  }

  // Mensaje por defecto de acceso denegado
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <Typography variant="h3" weight="semibold" className="text-gray-900 mb-2">
          Acceso Denegado
        </Typography>
        
        <Typography variant="body1" color="secondary" className="mb-6">
          {funcionalidad 
            ? `No tienes permisos para acceder a la funcionalidad "${funcionalidad}"`
            : modulo 
            ? `No tienes permisos para acceder al módulo "${modulo}"`
            : 'No tienes permisos para acceder a esta sección'
          }
        </Typography>

        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
          
          {redirectTo && (
            <Button
              variant="primary"
              onClick={() => window.location.href = redirectTo}
            >
              Ir al Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
