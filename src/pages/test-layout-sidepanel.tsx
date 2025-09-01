import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/ui';

const TestLayoutSidePanelPage: React.FC = () => {
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (showSidePanel || showFilterDrawer) {
      console.log('🧪 TestLayoutSidePanelPage - Abriendo panel de prueba con Layout');
      console.log('🧪 Viewport height:', window.innerHeight);
      console.log('🧪 Document height:', document.documentElement.scrollHeight);
      console.log('🧪 Body height:', document.body.scrollHeight);
      console.log('🧪 Window height:', window.outerHeight);
      
      // Verificar elementos del Layout
      console.log('🧪 Verificando elementos del Layout...');
      const layoutElements = document.querySelectorAll('.min-h-screen, .flex-1, main, .mx-auto.max-w-7xl, .overflow-y-visible');
      layoutElements.forEach((element, index) => {
        const el = element as HTMLElement;
        console.log(`🧪 Elemento del Layout ${index + 1}:`, {
          tagName: el.tagName,
          className: el.className,
          offsetHeight: el.offsetHeight,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          style: el.style.cssText,
          getBoundingClientRect: el.getBoundingClientRect(),
          computedStyle: {
            height: window.getComputedStyle(el).height,
            overflow: window.getComputedStyle(el).overflow,
            width: window.getComputedStyle(el).width,
            maxWidth: window.getComputedStyle(el).maxWidth,
            position: window.getComputedStyle(el).position,
            top: window.getComputedStyle(el).top,
            bottom: window.getComputedStyle(el).bottom
          }
        });
      });
      
      // Verificar elementos después de renderizar
      setTimeout(() => {
        if (overlayRef.current) {
          const overlay = overlayRef.current;
          console.log('🧪 Overlay encontrado (con Layout):', overlay);
          console.log('🧪 Overlay offsetHeight:', overlay.offsetHeight);
          console.log('🧪 Overlay clientHeight:', overlay.clientHeight);
          console.log('🧪 Overlay scrollHeight:', overlay.scrollHeight);
          console.log('🧪 Overlay style height:', overlay.style.height);
          console.log('🧪 Overlay getBoundingClientRect:', overlay.getBoundingClientRect());
          console.log('🧪 Overlay computed style height:', window.getComputedStyle(overlay).height);
        }
        
        if (drawerRef.current) {
          const drawer = drawerRef.current;
          console.log('🧪 Drawer encontrado (con Layout):', drawer);
          console.log('🧪 Drawer offsetHeight:', drawer.offsetHeight);
          console.log('🧪 Drawer clientHeight:', drawer.clientHeight);
          console.log('🧪 Drawer scrollHeight:', drawer.scrollHeight);
          console.log('🧪 Drawer style height:', drawer.style.height);
          console.log('🧪 Drawer getBoundingClientRect:', drawer.getBoundingClientRect());
          console.log('🧪 Drawer computed style height:', window.getComputedStyle(drawer).height);
        }

        // Verificar todos los elementos con position: fixed
        const fixedElements = document.querySelectorAll('[style*="position: fixed"], [class*="fixed"]');
        console.log('🧪 Elementos con position fixed encontrados (con Layout):', fixedElements.length);
        fixedElements.forEach((element, index) => {
          const el = element as HTMLElement;
          console.log(`🧪 Elemento fixed ${index + 1} (con Layout):`, {
            tagName: el.tagName,
            className: el.className,
            style: el.style.cssText,
            offsetHeight: el.offsetHeight,
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            getBoundingClientRect: el.getBoundingClientRect(),
            computedStyle: {
              height: window.getComputedStyle(el).height,
              top: window.getComputedStyle(el).top,
              bottom: window.getComputedStyle(el).bottom,
              position: window.getComputedStyle(el).position
            }
          });
        });

        // Verificar elementos con position: absolute
        const absoluteElements = document.querySelectorAll('[style*="position: absolute"], [class*="absolute"]');
        console.log('🧪 Elementos con position absolute encontrados (con Layout):', absoluteElements.length);
        absoluteElements.forEach((element, index) => {
          const el = element as HTMLElement;
          console.log(`🧪 Elemento absolute ${index + 1} (con Layout):`, {
            tagName: el.tagName,
            className: el.className,
            style: el.style.cssText,
            offsetHeight: el.offsetHeight,
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            getBoundingClientRect: el.getBoundingClientRect(),
            computedStyle: {
              height: window.getComputedStyle(el).height,
              top: window.getComputedStyle(el).top,
              bottom: window.getComputedStyle(el).bottom,
              position: window.getComputedStyle(el).position
            }
          });
        });
      }, 100);
    }
  }, [showSidePanel, showFilterDrawer]);

  return (
    <Layout rol="administrador">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Página de Prueba - Sidepanels con Layout
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Información del Viewport (con Layout)</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Viewport Height:</strong> {isClient ? window.innerHeight : 'Cargando...'}px
              </div>
              <div>
                <strong>Document Height:</strong> {isClient ? document.documentElement.scrollHeight : 'Cargando...'}px
              </div>
              <div>
                <strong>Body Height:</strong> {isClient ? document.body.scrollHeight : 'Cargando...'}px
              </div>
              <div>
                <strong>Window Height:</strong> {isClient ? window.outerHeight : 'Cargando...'}px
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">SidePanel Simple (con Layout)</h2>
              <p className="text-gray-600 mb-4">
                Panel lateral simple con Layout completo
              </p>
              <button
                onClick={() => setShowSidePanel(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Abrir SidePanel Simple
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">FilterDrawer (con Layout)</h2>
              <p className="text-gray-600 mb-4">
                Panel de filtros con Layout completo
              </p>
              <button
                onClick={() => setShowFilterDrawer(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Abrir FilterDrawer
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Instrucciones de Debug (con Layout)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Abre las herramientas de desarrollador (F12)</li>
              <li>Ve a la pestaña Console</li>
              <li>Haz clic en "Abrir SidePanel Simple" o "Abrir FilterDrawer"</li>
              <li>Revisa los logs detallados en la consola</li>
              <li>Compara con la página sin Layout (/test-sidepanel)</li>
              <li>Inspecciona los elementos del Layout que pueden estar interfiriendo</li>
            </ol>
          </div>
        </div>

        {/* SidePanel Simple */}
        {showSidePanel && (
          <div 
            ref={overlayRef}
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
              onClick={() => setShowSidePanel(false)}
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
              ref={drawerRef}
              className="absolute right-0 top-0 w-full max-w-md bg-white shadow-xl border-l border-gray-200"
              style={{ 
                height: '100vh',
                top: 0,
                right: 0,
                bottom: 0
              }}
            >
              <div className="flex flex-col" style={{ height: '100vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    🧪 SidePanel Simple (con Layout)
                  </h2>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-100 p-4 rounded">
                      <h3 className="font-medium text-blue-900">
                        Información de Altura (con Layout)
                      </h3>
                      <p className="text-sm text-blue-700 mt-2">
                        Este panel debe ocupar toda la altura de la pantalla.
                      </p>
                    </div>
                    
                    <div className="bg-green-100 p-4 rounded">
                      <h3 className="font-medium text-green-900">
                        Verificación (con Layout)
                      </h3>
                      <p className="text-sm text-green-700 mt-2">
                        Si ves espacios arriba o abajo, el Layout está interfiriendo.
                      </p>
                    </div>
                    
                    {/* Contenido adicional para probar scroll */}
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="bg-gray-100 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          Elemento de prueba #{i + 1} - Esto debería permitir scroll si es necesario
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Cerrar SidePanel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FilterDrawer */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowFilterDrawer(false)}
            />
            
            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    🧪 FilterDrawer (con Layout)
                  </h2>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="bg-green-100 p-4 rounded">
                      <h3 className="font-medium text-green-900">
                        Filtros de Prueba (con Layout)
                      </h3>
                      <p className="text-sm text-green-700 mt-2">
                        Este es un FilterDrawer con Layout completo.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-100 p-4 rounded">
                      <h3 className="font-medium text-yellow-900">
                        Verificación de Altura (con Layout)
                      </h3>
                      <p className="text-sm text-yellow-700 mt-2">
                        Compara este panel con el SidePanel simple.
                      </p>
                    </div>
                    
                    {/* Contenido adicional para probar scroll */}
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i} className="bg-gray-100 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          Filtro de prueba #{i + 1} - Esto debería permitir scroll si es necesario
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFilterDrawer(false)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setShowFilterDrawer(false)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
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

export default TestLayoutSidePanelPage;
