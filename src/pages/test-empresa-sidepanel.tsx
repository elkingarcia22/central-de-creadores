import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui';

const TestEmpresaSidePanelPage: React.FC = () => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
    console.log('🧪 Abriendo sidepanel de empresa');
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
    console.log('🧪 Cerrando sidepanel de empresa');
  };

  if (!isClient) {
    return <div>Cargando...</div>;
  }

  return (
    <Layout rol="administrador">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">🧪 Test SidePanel de Empresa</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">SidePanel de Filtros (Empresa)</h2>
            <p className="text-gray-600 mb-4">
              Este es el mismo sidepanel que se usa en la página de empresa
            </p>
            <button
              onClick={handleOpenFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Abrir SidePanel de Empresa
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Haz clic en "Abrir SidePanel de Empresa"</li>
              <li>Verifica que el sidepanel ocupe toda la altura de la pantalla</li>
              <li>Verifica que no haya espacios vacíos arriba o abajo</li>
              <li>Verifica que el overlay cubra toda la pantalla</li>
            </ol>
          </div>
        </div>

        {/* Drawer de filtros avanzados personalizado para historial */}
        {showFilterDrawer && (
          <div 
            className="fixed inset-0 z-50 overflow-hidden"
            style={{ 
              height: '100vh',
              width: '100vw',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCloseFilters}
              style={{ 
                height: '100vh',
                width: '100vw',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
            
            {/* Drawer */}
            <div 
              className="absolute right-0 top-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700"
              style={{ 
                height: '100vh',
                top: 0,
                right: 0,
                bottom: 0
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded"></div>
                    <h3 className="text-lg font-semibold">Filtros de Empresa</h3>
                  </div>
                  <button
                    onClick={handleCloseFilters}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="bg-blue-100 p-4 rounded">
                      <h4 className="font-medium text-blue-900">
                        Información de Altura
                      </h4>
                      <p className="text-sm text-blue-700 mt-2">
                        Este sidepanel debe ocupar toda la altura de la pantalla.
                      </p>
                      <p className="text-sm text-blue-700">
                        Altura del viewport: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}px
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Estado</label>
                        <select className="w-full p-2 border rounded">
                          <option>Todos</option>
                          <option>Activo</option>
                          <option>Inactivo</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Fecha Desde</label>
                        <input type="date" className="w-full p-2 border rounded" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
                        <input type="date" className="w-full p-2 border rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button
                      onClick={handleCloseFilters}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCloseFilters}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestEmpresaSidePanelPage;
