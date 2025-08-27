import React from 'react';
import { Layout, Typography, Card, Chip } from '../components/ui';
import { getChipVariant, getChipText } from '../utils/chipUtils';

export default function TestChipsPage() {
  return (
    <Layout rol="admin">
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Typography variant="h1" weight="bold">
            Test de Chips - Verificación de Cambios
          </Typography>
          
          <Card className="p-6">
            <Typography variant="h3" weight="semibold" className="mb-4">
              Prueba de Chips de Estado
            </Typography>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Typography variant="h4" weight="semibold">
                  Artículo de Prueba
                </Typography>
                <Chip 
                  variant={getChipVariant('en borrador')}
                  size="sm"
                >
                  {getChipText('en borrador')}
                </Chip>
              </div>
              
              <div className="flex items-center gap-3">
                <Typography variant="h4" weight="semibold">
                  Artículo Publicado
                </Typography>
                <Chip 
                  variant={getChipVariant('finalizado')}
                  size="sm"
                >
                  {getChipText('finalizado')}
                </Chip>
              </div>
              
              <div className="flex items-center gap-3">
                <Typography variant="h4" weight="semibold">
                  Artículo en Revisión
                </Typography>
                <Chip 
                  variant={getChipVariant('en progreso')}
                  size="sm"
                >
                  {getChipText('en progreso')}
                </Chip>
              </div>
              
              <div className="flex items-center gap-3">
                <Typography variant="h4" weight="semibold">
                  Reclutamiento Pendiente de Agendamiento
                </Typography>
                <Chip 
                  variant={getChipVariant('pendiente de agendamiento')}
                  size="sm"
                >
                  {getChipText('pendiente de agendamiento')}
                </Chip>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <Typography variant="h3" weight="semibold" className="mb-4">
              Verificación de Cambios Aplicados
            </Typography>
            
            <div className="space-y-2">
              <Typography variant="body1">
                ✅ Página de conocimiento: Solo chip de estado
              </Typography>
              <Typography variant="body1">
                ✅ Página de sesiones: Solo chip de estado
              </Typography>
              <Typography variant="body1">
                ✅ Página de métricas: Solo chip de estado
              </Typography>
              <Typography variant="body1">
                ✅ InvestigacionCard: Solo chip de estado
              </Typography>
              <Typography variant="body1">
                ✅ Participantes: Solo título sin chips adicionales
              </Typography>
              <Typography variant="body1">
                ✅ Modal de participantes: Solo chip de estado
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
