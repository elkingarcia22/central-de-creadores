import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui';

export default function DiagnosticoEstable() {
  const [renderCount, setRenderCount] = useState(0);
  const [useEffectCount, setUseEffectCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Solo se ejecuta una vez al montar
  useEffect(() => {
    console.log('🔍 DiagnosticoEstable - useEffect inicialización');
    setIsClient(true);
    setUseEffectCount(prev => prev + 1);
  }, []);

  // Solo se ejecuta cuando cambia isClient
  useEffect(() => {
    if (isClient) {
      console.log('🔍 DiagnosticoEstable - Componente renderizado #', renderCount + 1);
      setRenderCount(prev => prev + 1);
    }
  }, [isClient]);

  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Diagnóstico Estable</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
              <p><strong>Renderizados:</strong> {renderCount}</p>
              <p><strong>useEffect ejecutados:</strong> {useEffectCount}</p>
              <p><strong>Es cliente:</strong> {isClient ? 'SÍ' : 'NO'}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Análisis</h2>
              <p><strong>¿Hay duplicados?</strong> {renderCount > 1 ? 'SÍ' : 'NO'}</p>
              <p><strong>Estado:</strong> {renderCount > 5 ? 'PROBLEMÁTICO' : 'NORMAL'}</p>
              <p><strong>Render ID:</strong> {renderCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Sección de Prueba</h2>
            <p>Esta sección debería aparecer solo UNA vez si no hay duplicados.</p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p>Contenido interno de prueba</p>
              <p className="text-sm text-gray-600">Render actual: {renderCount}</p>
              <p className="text-sm text-gray-600">useEffect ejecutados: {useEffectCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
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
    </Layout>
  );
}
