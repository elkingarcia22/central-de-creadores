import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui';

export default function TestSimplePage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('🔍 TestSimplePage - Componente montado');
    setCount(prev => prev + 1);
  }, []);

  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Página de Prueba Simple</h1>
          <p className="mb-4">Contador de renderizados: {count}</p>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Sección de Prueba</h2>
            <p>Esta es una sección de prueba para verificar si se duplica.</p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p>Contenido interno de prueba</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
