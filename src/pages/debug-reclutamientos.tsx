import { useState } from 'react';
import { useFastUser } from '../contexts/FastUserContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Typography } from '../components/ui/Typography';

const DebugReclutamientosPage = () => {
  const { userId, isAuthenticated } = useFastUser();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDiagnostico = async () => {
    if (!userId) {
      showError('Error', 'Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/google-calendar/debug-reclutamientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        showSuccess('Diagnóstico', 'Diagnóstico completado exitosamente');
      } else {
        showError('Error', data.error || 'Error en el diagnóstico');
        setResult(data);
      }
    } catch (error) {
      showError('Error', 'No se pudo ejecutar el diagnóstico');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Typography variant="h1">Diagnóstico de Reclutamientos</Typography>
        <Typography variant="body1" className="text-red-500">
          Usuario no autenticado
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h1">Diagnóstico de Reclutamientos</Typography>
        <Button
          onClick={handleDiagnostico}
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </Button>
      </div>

      <Card className="p-4">
        <Typography variant="h2" className="mb-4">Información del Usuario</Typography>
        <div className="space-y-2">
          <Typography variant="body1">
            <strong>ID de Usuario:</strong> {userId}
          </Typography>
          <Typography variant="body1">
            <strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}
          </Typography>
        </div>
      </Card>

      {result && (
        <Card className="p-4">
          <Typography variant="h2" className="mb-4">Resultado del Diagnóstico</Typography>
          
          {result.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <Typography variant="body1" className="text-green-800">
                  ✅ Diagnóstico completado exitosamente
                </Typography>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-2">Usuario:</Typography>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.usuario, null, 2)}
                </pre>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-2">Reclutamientos Básicos:</Typography>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.reclutamientos_basicos, null, 2)}
                </pre>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-2">Reclutamientos Completos:</Typography>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.reclutamientos_completos, null, 2)}
                </pre>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-2">Total de Reclutamientos:</Typography>
                <Typography variant="body1" className="text-blue-600 font-semibold">
                  {result.total_reclutamientos}
                </Typography>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <Typography variant="body1" className="text-red-800">
                  ❌ Error en el diagnóstico
                </Typography>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-2">Error:</Typography>
                <Typography variant="body1" className="text-red-600">
                  {result.error}
                </Typography>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-2">Detalles:</Typography>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DebugReclutamientosPage;
