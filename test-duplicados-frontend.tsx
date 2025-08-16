import React, { useState, useEffect } from 'react';

export default function TestDuplicadosFrontend() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('🔄 Componente renderizado #', renderCount + 1);
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/metricas-reclutamientos');
        const result = await response.json();
        console.log('📊 Datos recibidos:', result.investigaciones?.length || 0);
        console.log('🔍 Datos completos:', result.investigaciones);
        setData(result.investigaciones || []);
      } catch (error) {
        console.error('❌ Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Duplicados Frontend</h1>
      <p className="mb-4">Renderizado #{renderCount} veces</p>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <p className="mb-4">Total de investigaciones: {data.length}</p>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={item.reclutamiento_id || index} className="border p-2 rounded">
                <p><strong>ID:</strong> {item.reclutamiento_id}</p>
                <p><strong>Nombre:</strong> {item.titulo_investigacion}</p>
                <p><strong>Libreto:</strong> {item.titulo_libreto}</p>
                <p><strong>Participantes:</strong> {item.participantes_actuales}/{item.participantes_requeridos}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
