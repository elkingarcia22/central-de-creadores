import React, { useState, useEffect } from 'react';
import LayoutSimple from '../components/ui/LayoutSimple';

export default function TestLayoutSimple() {
  const [renderCount, setRenderCount] = useState(0);
  const [useEffectCount, setUseEffectCount] = useState(0);

  useEffect(() => {
    console.log('🔍 TestLayoutSimple - useEffect ejecutándose #', useEffectCount + 1);
    setUseEffectCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    console.log('🔍 TestLayoutSimple - Componente renderizado #', renderCount + 1);
    setRenderCount(prev => prev + 1);
  });

  return (
    <LayoutSimple rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Test Layout Simple</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Contadores de la Página</h2>
              <p><strong>Renderizados:</strong> {renderCount}</p>
              <p><strong>useEffect ejecutados:</strong> {useEffectCount}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Sección de Prueba</h2>
              <p>Esta sección debería aparecer solo UNA vez.</p>
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                <p>Contenido interno de prueba</p>
                <p className="text-sm text-gray-600">Render: {renderCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Sección Principal</h2>
            <p>Esta es la sección principal que debería aparecer solo UNA vez.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
                <h3 className="font-semibold">Card 1</h3>
                <p>Contenido de la card 1</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
                <h3 className="font-semibold">Card 2</h3>
                <p>Contenido de la card 2</p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded">
                <h3 className="font-semibold">Card 3</h3>
                <p>Contenido de la card 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
