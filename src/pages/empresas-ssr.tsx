import React from 'react';
import { GetServerSideProps } from 'next';

interface Empresa {
  id: string;
  nombre: string;
  kam_nombre?: string;
}

interface EmpresasSSRProps {
  empresas: Empresa[];
  error?: string;
}

export const getServerSideProps: GetServerSideProps<EmpresasSSRProps> = async () => {
  try {
    console.log('🔄 getServerSideProps ejecutándose');
    
    const response = await fetch('http://localhost:3000/api/empresas');
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Datos recibidos en SSR:', data?.length || 0);
      
      return {
        props: {
          empresas: data || []
        }
      };
    } else {
      console.error('❌ Error en SSR:', response.status);
      return {
        props: {
          empresas: [],
          error: 'Error al cargar empresas'
        }
      };
    }
  } catch (error) {
    console.error('❌ Error en SSR:', error);
    return {
      props: {
        empresas: [],
        error: 'Error interno del servidor'
      }
    };
  }
};

export default function EmpresasSSRPage({ empresas, error }: EmpresasSSRProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Empresas SSR</h1>
      
      <div className="mb-4">
        <strong>Empresas cargadas:</strong> {empresas.length}
      </div>
      
      {error && (
        <div className="text-red-600 mb-4">Error: {error}</div>
      )}
      
      {!error && empresas.length === 0 && (
        <div className="text-gray-600 mb-4">No se encontraron empresas</div>
      )}
      
      {!error && empresas.length > 0 && (
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
