import React, { useEffect, useRef } from 'react';
import { applySidePanelFix, removeSidePanelFix } from '../../utils/sidepanelFix';

interface TestLayoutSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TestLayoutSidePanel: React.FC<TestLayoutSidePanelProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('🧪 TestLayoutSidePanel - Abriendo panel de prueba del Layout');
      console.log('🧪 Viewport height:', window.innerHeight);
      console.log('🧪 Document height:', document.documentElement.scrollHeight);
      console.log('🧪 Body height:', document.body.scrollHeight);
      
      // Verificar elementos del Layout antes del fix
      console.log('🧪 Verificando elementos del Layout antes del fix...');
      const layoutElements = document.querySelectorAll('.min-h-screen, .flex-1, main, .mx-auto.max-w-7xl, .overflow-y-visible');
      layoutElements.forEach((element, index) => {
        const el = element as HTMLElement;
        console.log(`🧪 Elemento del Layout ${index + 1}:`, {
          tagName: el.tagName,
          className: el.className,
          offsetHeight: el.offsetHeight,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          style: {
            height: el.style.height,
            overflow: el.style.overflow,
            width: el.style.width,
            maxWidth: el.style.maxWidth
          }
        });
      });
      
      // Aplicar fix de sidepanel y Layout
      setTimeout(() => {
        applySidePanelFix();
        
        // Verificar elementos después del fix
        console.log('🧪 Verificando elementos después del fix...');
        const layoutElementsAfter = document.querySelectorAll('.min-h-screen, .flex-1, main, .mx-auto.max-w-7xl, .overflow-y-visible');
        layoutElementsAfter.forEach((element, index) => {
          const el = element as HTMLElement;
          console.log(`🧪 Elemento del Layout después del fix ${index + 1}:`, {
            tagName: el.tagName,
            className: el.className,
            offsetHeight: el.offsetHeight,
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            style: {
              height: el.style.height,
              overflow: el.style.overflow,
              width: el.style.width,
              maxWidth: el.style.maxWidth
            }
          });
        });
        
        // Verificar elementos del sidepanel
        if (overlayRef.current) {
          const overlay = overlayRef.current;
          console.log('🧪 Overlay del Layout encontrado:', overlay);
          console.log('🧪 Overlay offsetHeight:', overlay.offsetHeight);
          console.log('🧪 Overlay clientHeight:', overlay.clientHeight);
          console.log('🧪 Overlay scrollHeight:', overlay.scrollHeight);
          console.log('🧪 Overlay style height:', overlay.style.height);
          console.log('🧪 Overlay getBoundingClientRect:', overlay.getBoundingClientRect());
        }
        
        if (drawerRef.current) {
          const drawer = drawerRef.current;
          console.log('🧪 Drawer del Layout encontrado:', drawer);
          console.log('🧪 Drawer offsetHeight:', drawer.offsetHeight);
          console.log('🧪 Drawer clientHeight:', drawer.clientHeight);
          console.log('🧪 Drawer scrollHeight:', drawer.scrollHeight);
          console.log('🧪 Drawer style height:', drawer.style.height);
          console.log('🧪 Drawer getBoundingClientRect:', drawer.getBoundingClientRect());
        }
      }, 100);
    } else {
      // Remover fix cuando se cierra
      removeSidePanelFix();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
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
        onClick={onClose}
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
        className="absolute right-0 top-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700"
        style={{ 
          height: '100vh',
          top: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div className="flex flex-col" style={{ height: '100vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🧪 Panel de Prueba del Layout
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded">
                <h3 className="font-medium text-purple-900 dark:text-purple-100">
                  🔧 Fix del Layout Aplicado
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Este panel debería ocupar toda la altura sin interferencia del Layout.
                </p>
              </div>
              
              <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded">
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  🎯 Verificación del Layout
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                  Si ves espacios, el Layout sigue interfiriendo.
                </p>
              </div>
              
              <div className="bg-pink-100 dark:bg-pink-900 p-4 rounded">
                <h3 className="font-medium text-pink-900 dark:text-pink-100">
                  🔍 Debug del Layout
                </h3>
                <p className="text-sm text-pink-700 dark:text-pink-300 mt-2">
                  Revisa la consola para ver las medidas del Layout.
                </p>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  📊 Información del Layout
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Elementos del Layout que pueden estar causando problemas:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                  <li>• .min-h-screen</li>
                  <li>• .flex-1</li>
                  <li>• main</li>
                  <li>• .mx-auto.max-w-7xl</li>
                  <li>• .overflow-y-visible</li>
                </ul>
              </div>
              
              {/* Contenido adicional para probar scroll */}
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Elemento de prueba del Layout #{i + 1} - Esto debería permitir scroll si es necesario
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Cerrar Panel de Prueba del Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLayoutSidePanel;
