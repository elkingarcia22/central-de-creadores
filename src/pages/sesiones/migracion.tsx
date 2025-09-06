import React, { useState } from 'react';
import { NextPage } from 'next';
import { Layout } from '../../components/ui';
import { PageHeader, Button, Card, Typography, Badge, Alert } from '../../components/ui';
import { 
  DatabaseIcon, 
  PlayIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  InfoIcon,
  RefreshIcon
} from '../../components/icons';

interface MigrationResult {
  message: string;
  total: number;
  migrated: number;
  errors: string[];
  details: Array<{
    reclutamiento_id: string;
    sesion_id: string;
    participante: string;
    investigacion: string;
    fecha: string;
  }>;
}

const MigracionSesionesPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [dryRun, setDryRun] = useState(true);

  const handleMigration = async (isDryRun: boolean) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/migrate-sesiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dryRun: isDryRun }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error en migración:', error);
      setResult({
        message: 'Error en la migración',
        total: 0,
        migrated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        details: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDryRun = () => handleMigration(true);
  const handleRealMigration = () => handleMigration(false);

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title="Migración de Sesiones"
          description="Migrar sesiones existentes del sistema de reclutamientos al nuevo módulo de sesiones"
          icon={<DatabaseIcon className="w-6 h-6" />}
        />

        {/* Información */}
        <Alert variant="info" className="mb-6">
          <InfoIcon className="w-4 h-4" />
          <div>
            <Typography variant="body1" weight="semibold">
              Información sobre la migración
            </Typography>
            <Typography variant="body2" className="mt-1">
              Esta herramienta migra las sesiones existentes del sistema de reclutamientos al nuevo módulo de sesiones. 
              Se recomienda ejecutar primero una simulación (Dry Run) para revisar los datos antes de la migración real.
            </Typography>
          </div>
        </Alert>

        {/* Controles */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <Typography variant="h3" className="mb-4">
            Ejecutar Migración
          </Typography>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleDryRun}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Simulación (Dry Run)
              </Button>
              
              <Button
                onClick={handleRealMigration}
                disabled={isLoading}
                variant="primary"
                className="flex-1"
              >
                <DatabaseIcon className="w-4 h-4 mr-2" />
                Migración Real
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dryRun"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="dryRun" className="text-sm">
                Ejecutar en modo simulación por defecto
              </label>
            </div>
          </div>
        </Card>

        {/* Resultados */}
        {result && (
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <Typography variant="h3">
                Resultados de la Migración
              </Typography>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Typography variant="h2" weight="bold" className="text-primary">
                  {result.total}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Reclutamientos
                </Typography>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Typography variant="h2" weight="bold" className="text-green-600">
                  {result.migrated}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Migrados Exitosamente
                </Typography>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Typography variant="h2" weight="bold" className="text-red-600">
                  {result.errors.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Errores
                </Typography>
              </div>
            </div>

            {/* Errores */}
            {result.errors.length > 0 && (
              <div className="mb-6">
                <Typography variant="h4" className="mb-3 text-red-600">
                  Errores Encontrados
                </Typography>
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <Alert key={index} variant="error">
                      <AlertTriangleIcon className="w-4 h-4" />
                      <Typography variant="body2">
                        {error}
                      </Typography>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Detalles */}
            {result.details.length > 0 && (
              <div>
                <Typography variant="h4" className="mb-3">
                  Detalles de la Migración
                </Typography>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Reclutamiento</th>
                        <th className="text-left p-2">Sesión</th>
                        <th className="text-left p-2">Participante</th>
                        <th className="text-left p-2">Investigación</th>
                        <th className="text-left p-2">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.details.map((detail, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="p-2">
                            <Badge variant="secondary">
                              {detail.reclutamiento_id}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant={detail.sesion_id === 'DRY_RUN' ? 'warning' : 'success'}>
                              {detail.sesion_id}
                            </Badge>
                          </td>
                          <td className="p-2">{detail.participante}</td>
                          <td className="p-2">{detail.investigacion}</td>
                          <td className="p-2">
                            {new Date(detail.fecha).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card variant="elevated" padding="lg" className="max-w-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <Typography variant="h4" className="mb-2">
                  Ejecutando Migración
                </Typography>
                <Typography variant="body2" color="secondary">
                  Por favor espera mientras se procesan los datos...
                </Typography>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MigracionSesionesPage;
