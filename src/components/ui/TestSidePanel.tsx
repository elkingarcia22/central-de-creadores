import React, { useEffect, useRef } from 'react';
import { applySidePanelFix, removeSidePanelFix } from '../../utils/sidepanelFix';

interface TestSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TestSidePanel: React.FC<TestSidePanelProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('🧪 TestSidePanel - Abriendo panel de prueba');
      console.log('🧪 Viewport height:', window.innerHeight);
      console.log('🧪 Document height:', document.documentElement.scrollHeight);
      console.log('🧪 Body height:', document.body.scrollHeight);
      
      // Aplicar fix de sidepanel
      setTimeout(() => {
        applySidePanelFix();
        
        // Verificar elementos después de renderizar
        if (overlayRef.current) {
          const overlay = overlayRef.current;
          console.log('🧪 Overlay encontrado:', overlay);
          console.log('🧪 Overlay offsetHeight:', overlay.offsetHeight);
          console.log('🧪 Overlay clientHeight:', overlay.clientHeight);
          console.log('🧪 Overlay scrollHeight:', overlay.scrollHeight);
          console.log('🧪 Overlay style height:', overlay.style.height);
          console.log('🧪 Overlay getBoundingClientRect:', overlay.getBoundingClientRect());
        }
        
        if (drawerRef.current) {
          const drawer = drawerRef.current;
          console.log('🧪 Drawer encontrado:', drawer);
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
              🧪 Panel de Prueba
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
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Información de Altura
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Este panel debe ocupar toda la altura de la pantalla sin espacios.
                </p>
              </div>
              
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Verificación
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Si ves espacios arriba o abajo, hay un problema con la altura.
                </p>
              </div>
              
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Debug Info
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  Revisa la consola para ver las medidas exactas.
                </p>
              </div>
              
              {/* Contenido adicional para probar scroll */}
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Elemento de prueba #{i + 1} - Esto debería permitir scroll si es necesario
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Cerrar Panel de Prueba
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSidePanel;
