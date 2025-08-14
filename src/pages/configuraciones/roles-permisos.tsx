import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { Layout } from '../../components/ui/Layout';

export default function RolesPermisosPage() {
  const { rolSeleccionado } = useRol();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Verificar acceso - solo administradores
  if (rolSeleccionado?.toLowerCase() !== 'administrador') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6">
              Solo los administradores pueden acceder a esta sección.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => router.push('/dashboard')}
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Cargando sistema de permisos...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header simple */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sistema de Roles y Permisos
            </h1>
            <p className="text-gray-600">
              Gestiona roles, permisos y funcionalidades del sistema
            </p>
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Contenido de la página
              </h3>
              <p className="text-gray-600">
                Esta es una versión simplificada de la página de Roles y Permisos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
