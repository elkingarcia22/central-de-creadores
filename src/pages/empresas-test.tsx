import React, { useState, useEffect } from 'react';

interface Empresa {
  id: string;
  nombre: string;
  kam_nombre?: string;
}

export default function EmpresasTestPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose');
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      console.log('🚀 Cargando empresas...');
      setLoading(true);
      
      console.log('📡 Iniciando fetch...');
      const response = await fetch('http://localhost:3000/api/empresas');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        console.log('📡 Parseando JSON...');
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        console.log('📊 Número de empresas:', data?.length || 0);
        setEmpresas(data || []);
        console.log('✅ Empresas establecidas en estado');
      } else {
        console.log('📡 Error en response, parseando error...');
        const errorData = await response.json();
        console.error('❌ Error cargando empresas:', response.status, errorData);
        setError('Error al cargar empresas');
      }
    } catch (error) {
      console.error('❌ Error cargando empresas:', error);
      setError('Error al cargar empresas');
    } finally {
      setLoading(false);
      console.log('🏁 Carga completada');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Empresas Test</h1>
      
      <div className="mb-4">
        <strong>Loading:</strong> {loading ? 'true' : 'false'}
      </div>
      
      <div className="mb-4">
        <strong>Error:</strong> {error || 'null'}
      </div>
      
      <div className="mb-4">
        <strong>Empresas cargadas:</strong> {empresas.length}
      </div>
      
      {loading && (
        <div className="text-blue-600">Cargando empresas...</div>
      )}
      
      {error && (
        <div className="text-red-600">Error: {error}</div>
      )}
      
      {!loading && !error && empresas.length === 0 && (
        <div className="text-gray-600">No se encontraron empresas</div>
      )}
      
      {!loading && !error && empresas.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Empresas:</h2>
          <ul className="space-y-1">
            {empresas.map((empresa) => (
              <li key={empresa.id} className="p-2 bg-gray-100 rounded">
                {empresa.nombre} - KAM: {empresa.kam_nombre || 'Sin asignar'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
