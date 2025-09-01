import React from 'react';
import Chip from '../components/ui/Chip';
import Layout from '../components/ui/Layout';

export default function TestChips() {
  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Prueba de Chips - Estados de Dolor</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Estados de Dolor</h2>
              <div className="flex flex-wrap gap-2">
                <Chip variant="sin_resolver">Sin Resolver</Chip>
                <Chip variant="resuelto">Resuelto</Chip>
                <Chip variant="archivado">Archivado</Chip>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Niveles de Severidad</h2>
              <div className="flex flex-wrap gap-2">
                <Chip variant="baja">Baja</Chip>
                <Chip variant="media">Media</Chip>
                <Chip variant="alta">Alta</Chip>
                <Chip variant="critica">Crítica</Chip>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Estados Básicos (Para Comparar)</h2>
              <div className="flex flex-wrap gap-2">
                <Chip variant="success">Success</Chip>
                <Chip variant="warning">Warning</Chip>
                <Chip variant="danger">Danger</Chip>
                <Chip variant="primary">Primary</Chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
