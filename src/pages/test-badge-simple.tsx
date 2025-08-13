import React from 'react';
import Badge from '../components/ui/Badge';
import { Layout } from '../components/ui';
import Typography from '../components/ui/Typography';

export default function TestBadgeSimplePage() {
  return (
    <Layout rol="administrador">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Typography variant="h1" color="title" weight="bold" className="mb-6">
            Test: Componente Badge
          </Typography>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span>Badge Default:</span>
              <Badge variant="default">Default</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Badge Success:</span>
              <Badge variant="success">🟢 Bajo</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Badge Warning:</span>
              <Badge variant="warning">🟡 Medio</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Badge Danger:</span>
              <Badge variant="danger">🔴 Alto</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Badge Info:</span>
              <Badge variant="info">✅ Completado</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Badge Secondary:</span>
              <Badge variant="secondary">⚪ Sin fecha</Badge>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <Typography variant="h3" className="mb-2">Estado del Badge:</Typography>
            <p className="text-sm text-muted-foreground">
              Si puedes ver todos los badges arriba, el componente está funcionando correctamente.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 