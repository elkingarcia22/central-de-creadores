import { useState } from 'react';
import { useRouter } from 'next/router';

export default function EjecutarScriptPermisos() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const ejecutarScript = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ejecutar-script-permisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error ejecutando script');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema de Permisos Granular - Fase 1
            </h1>
            <button
              onClick={() => router.push('/configuraciones')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Volver a Configuraciones
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="text-blue-800 font-medium mb-2">Paso 1: Ejecutar Script SQL en Supabase</h3>
              <ol className="list-decimal list-inside text-blue-700 space-y-2">
                <li>Ve a tu proyecto de Supabase</li>
                <li>Abre el <strong>SQL Editor</strong></li>
                <li>Copia y pega el contenido del archivo <code className="bg-blue-100 px-1 rounded">crear-sistema-permisos-granular.sql</code></li>
                <li>Ejecuta el script completo</li>
                <li>Verifica que las tablas se hayan creado correctamente</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h3 className="text-yellow-800 font-medium mb-2">Paso 2: Ejecutar Script desde la Aplicación</h3>
              <p className="text-yellow-700 mb-2">
                Una vez que hayas ejecutado el script SQL en Supabase, puedes usar el botón de abajo para insertar los datos base:
              </p>
              <ul className="list-disc list-inside text-yellow-700 space-y-1">
                <li>Módulos del sistema (investigaciones, reclutamiento, usuarios, etc.)</li>
                <li>Funcionalidades por módulo (crear, leer, editar, eliminar, etc.)</li>
                <li>Marcar roles existentes como roles del sistema</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">¿Qué se creará?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Tablas Nuevas</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>modulos</strong> - Módulos del sistema</li>
                  <li><strong>funcionalidades</strong> - Funcionalidades específicas</li>
                  <li><strong>permisos_roles</strong> - Permisos granulares</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Módulos Incluidos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Investigaciones (7 funcionalidades)</li>
                  <li>Reclutamiento (9 funcionalidades)</li>
                  <li>Usuarios (7 funcionalidades)</li>
                  <li>Sistema (5 funcionalidades)</li>
                  <li>Libretos (5 funcionalidades)</li>
                  <li>Seguimientos (6 funcionalidades)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={ejecutarScript}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ejecutando Script...' : 'Ejecutar Script de Datos Base'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-medium mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-green-800 font-medium mb-2">Resultado</h3>
                <p className="text-green-700">{result.message}</p>
                <div className="mt-2 text-sm text-green-600">
                  <p>Total: {result.summary.total} comandos</p>
                  <p>Exitosos: {result.summary.success}</p>
                  <p>Errores: {result.summary.errors}</p>
                </div>
              </div>

              {result.results && result.results.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles de Ejecución</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.results.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md text-sm ${
                          item.status === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            Comando {item.command}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status === 'success' ? 'Éxito' : 'Error'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">{item.message || item.error}</p>
                        {item.error && (
                          <p className="text-red-600 text-xs">{item.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.summary.success > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-blue-800 font-medium mb-2">Próximos Pasos</h3>
                  <p className="text-blue-700 mb-2">
                    El sistema de permisos granular ha sido configurado correctamente. Ahora puedes:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Crear la interfaz de gestión de roles y permisos</li>
                    <li>Configurar permisos específicos para cada rol</li>
                    <li>Integrar el sistema de permisos en la aplicación</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
