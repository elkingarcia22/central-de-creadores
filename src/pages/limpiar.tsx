import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LimpiarPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar localStorage corrupto
    if (typeof window !== 'undefined') {
      console.log('Limpiando localStorage...');
      
      // Verificar y limpiar rolSeleccionado corrupto
      const storedRol = localStorage.getItem('rolSeleccionado');
      if (storedRol) {
        try {
          JSON.parse(storedRol);
          console.log('rolSeleccionado es JSON válido:', storedRol);
        } catch (e) {
          console.log('rolSeleccionado corrupto, limpiando:', storedRol);
          localStorage.removeItem('rolSeleccionado');
        }
      }
      
      // Verificar y limpiar rolesDisponibles corrupto
      const storedRoles = localStorage.getItem('rolesDisponibles');
      if (storedRoles) {
        try {
          const parsed = JSON.parse(storedRoles);
          if (!Array.isArray(parsed)) {
            console.log('rolesDisponibles no es array, limpiando:', storedRoles);
            localStorage.removeItem('rolesDisponibles');
          } else {
            console.log('rolesDisponibles es válido:', parsed);
          }
        } catch (e) {
          console.log('rolesDisponibles corrupto, limpiando:', storedRoles);
          localStorage.removeItem('rolesDisponibles');
        }
      }
      
      console.log('localStorage limpiado, redirigiendo...');
      
      // Redirigir después de limpiar
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Limpiando datos corruptos...
        </h2>
        <p className="text-gray-600">
          Serás redirigido automáticamente
        </p>
      </div>
    </div>
  );
} 