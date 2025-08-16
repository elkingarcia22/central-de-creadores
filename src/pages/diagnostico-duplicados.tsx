import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui';

export default function DiagnosticoDuplicados() {
  const [diagnostico, setDiagnostico] = useState<any[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  // Contador de renderizados - solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 DiagnosticoDuplicados - Componente renderizado #', renderCount + 1);
      setRenderCount(prev => prev + 1);
    }
  }, []); // Solo se ejecuta una vez al montar

  // useEffect de inicialización
  useEffect(() => {
    console.log('🔍 DiagnosticoDuplicados - useEffect inicialización');
    
    const nuevoDiagnostico = [
      {
        timestamp: Date.now(),
        tipo: 'inicializacion',
        mensaje: 'Componente montado',
        renderCount: renderCount
      }
    ];
    
    setDiagnostico(prev => [...prev, ...nuevoDiagnostico]);
  }, []);

  // useEffect que se ejecuta solo cuando cambia renderCount
  useEffect(() => {
    if (renderCount > 0) {
      const nuevoDiagnostico = [
        {
          timestamp: Date.now(),
          tipo: 'render',
          mensaje: `Render #${renderCount}`,
          renderCount: renderCount
        }
      ];
      
      setDiagnostico(prev => [...prev, ...nuevoDiagnostico]);
    }
  }, [renderCount]); // Solo se ejecuta cuando cambia renderCount

  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Diagnóstico de Duplicados</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
              <p><strong>Renderizados totales:</strong> {renderCount}</p>
              <p><strong>Eventos registrados:</strong> {diagnostico.length}</p>
              <p><strong>Último evento:</strong> {diagnostico[diagnostico.length - 1]?.timestamp || 'N/A'}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Análisis</h2>
              <p><strong>¿Hay duplicados?</strong> {renderCount > 1 ? 'SÍ' : 'NO'}</p>
              <p><strong>Frecuencia de renders:</strong> {renderCount > 1 ? 'ALTA' : 'NORMAL'}</p>
              <p><strong>Estado:</strong> {renderCount > 5 ? 'PROBLEMÁTICO' : 'NORMAL'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Log de Eventos</h2>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Mensaje</th>
                    <th className="text-left p-2">Render #</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostico.map((evento, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="p-2 text-xs">{evento.timestamp}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          evento.tipo === 'inicializacion' ? 'bg-blue-100 text-blue-800' :
                          evento.tipo === 'render' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {evento.tipo}
                        </span>
                      </td>
                      <td className="p-2">{evento.mensaje}</td>
                      <td className="p-2">{evento.renderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Sección de Prueba</h2>
            <p>Esta sección debería aparecer solo UNA vez si no hay duplicados.</p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p>Contenido interno de prueba</p>
              <p className="text-sm text-gray-600">Render actual: {renderCount}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
