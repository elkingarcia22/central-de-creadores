import { useState, useEffect } from 'react';

export default function TestInvestigaciones() {
  const [investigaciones, setInvestigaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarInvestigaciones = async () => {
      try {
        console.log('🔍 Iniciando carga de investigaciones para participante: 30803140-e7ee-46ab-a511-4dba02c61566');
        const response = await fetch('/api/participantes/30803140-e7ee-46ab-a511-4dba02c61566/investigaciones');
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Respuesta completa de la API:', JSON.stringify(data, null, 2));
          setInvestigaciones(data.investigaciones || []);
          console.log('🔍 Investigaciones cargadas:', data.investigaciones?.length || 0);
        } else {
          console.error('Error cargando investigaciones:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error cargando investigaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarInvestigaciones();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Investigaciones Frontend</h1>
      
      <div className="mb-4">
        <p>Estado de carga: {loading ? 'Cargando...' : 'Completado'}</p>
        <p>Número de investigaciones: {investigaciones.length}</p>
      </div>

      {investigaciones.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Investigaciones:</h2>
          <ul>
            {investigaciones.map((inv: any, index: number) => (
              <li key={index} className="mb-2 p-2 border rounded">
                <strong>ID:</strong> {inv.id}<br/>
                <strong>Nombre:</strong> {inv.nombre}<br/>
                <strong>Estado:</strong> {inv.estado}<br/>
                <strong>Fecha participación:</strong> {inv.fecha_participacion}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No hay investigaciones</p>
      )}
    </div>
  );
}
