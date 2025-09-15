import React, { useState, useEffect } from 'react';
import { Card, Typography, Button } from '../components/ui';

interface TestSesion {
  id: string;
  titulo: string;
  fecha_programada: string;
  participante: any;
  estado_real: string;
  responsable_real: string;
  implementador_real: string;
  investigacion_nombre: string;
}

const TestSesionesPage: React.FC = () => {
  const [sesiones, setSesiones] = useState<TestSesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TEST] ${message}`);
  };

  const loadSesiones = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    addLog('🔄 Iniciando carga de sesiones...');
    
    try {
      addLog('📡 Llamando API /api/sesiones-reclutamiento...');
      const response = await fetch('/api/sesiones-reclutamiento', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      addLog(`📡 Response status: ${response.status}`);
      addLog(`📡 Response ok: ${response.ok}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addLog(`📊 Datos recibidos: ${JSON.stringify(data, null, 2)}`);
      
      addLog(`📊 Total sesiones: ${data.sesiones?.length || 0}`);
      
      // Contar sesiones con datos completos
      const sesionesConParticipante = data.sesiones?.filter(s => s.participante != null).length || 0;
      const sesionesConResponsable = data.sesiones?.filter(s => s.responsable_real && s.responsable_real !== 'Sin asignar').length || 0;
      const sesionesConImplementador = data.sesiones?.filter(s => s.implementador_real && s.implementador_real !== 'Sin asignar').length || 0;
      
      addLog(`📊 Sesiones con participante: ${sesionesConParticipante}/${data.sesiones?.length || 0}`);
      addLog(`📊 Sesiones con responsable: ${sesionesConResponsable}/${data.sesiones?.length || 0}`);
      addLog(`📊 Sesiones con implementador: ${sesionesConImplementador}/${data.sesiones?.length || 0}`);
      
      if (data.sesiones && data.sesiones.length > 0) {
        // Mostrar las primeras 3 sesiones con detalles
        data.sesiones.slice(0, 3).forEach((sesion, index) => {
          addLog(`📋 Sesión ${index + 1} (${sesion.id}):`);
          addLog(`   - Participante: ${sesion.participante ? `${sesion.participante.nombre} (${sesion.participante.tipo})` : 'Sin participante'}`);
          addLog(`   - Estado: ${sesion.estado_real}`);
          addLog(`   - Responsable: ${sesion.responsable_real}`);
          addLog(`   - Implementador: ${sesion.implementador_real}`);
          addLog(`   - Investigación: ${sesion.investigacion_nombre}`);
        });
        
        // Verificar campos específicos de la primera sesión
        const primeraSesion = data.sesiones[0];
        addLog(`🔍 Primera sesión completa: ${JSON.stringify(primeraSesion, null, 2)}`);
      }
      
      setSesiones(data.sesiones || []);
      addLog('✅ Sesiones cargadas exitosamente');
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSesiones();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Typography variant="h1" className="text-2xl font-bold">
            Test de Sesiones - Debug Controlado
          </Typography>
          <Button onClick={loadSesiones} disabled={loading}>
            {loading ? 'Cargando...' : 'Recargar'}
          </Button>
        </div>

        {/* Logs */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <Typography variant="h2" className="text-lg font-semibold">
              Logs de Debug
            </Typography>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="sm"
            >
              Recargar
            </Button>
          </div>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No hay logs aún...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            💡 <strong>Tip:</strong> Revisa la consola del servidor para ver los logs detallados de la API
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <Typography variant="h2" className="text-lg font-semibold mb-2 text-red-800">
              Error
            </Typography>
            <Typography className="text-red-700">{error}</Typography>
          </Card>
        )}

        {/* Resumen */}
        <Card className="p-4">
          <Typography variant="h2" className="text-lg font-semibold mb-3">
            Resumen
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sesiones.length}</div>
              <div className="text-sm text-gray-600">Total Sesiones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sesiones.filter(s => s.participante).length}
              </div>
              <div className="text-sm text-gray-600">Con Participante</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sesiones.filter(s => s.estado_real && s.estado_real !== 'Sin estado').length}
              </div>
              <div className="text-sm text-gray-600">Con Estado Real</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sesiones.filter(s => s.responsable_real && s.responsable_real !== 'Sin asignar').length}
              </div>
              <div className="text-sm text-gray-600">Con Responsable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {sesiones.filter(s => s.implementador_real && s.implementador_real !== 'Sin asignar').length}
              </div>
              <div className="text-sm text-gray-600">Con Implementador</div>
            </div>
          </div>
        </Card>

        {/* Lista de Sesiones */}
        <Card className="p-4">
          <Typography variant="h2" className="text-lg font-semibold mb-3">
            Sesiones ({sesiones.length})
          </Typography>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <Typography>Cargando sesiones...</Typography>
            </div>
          ) : sesiones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron sesiones
            </div>
          ) : (
            <div className="space-y-4">
              {sesiones.slice(0, 5).map((sesion, index) => (
                <div key={sesion.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <Typography variant="h3" className="font-semibold">
                      {index + 1}. {sesion.titulo}
                    </Typography>
                    <span className="text-sm text-gray-500">{sesion.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Fecha:</strong> {sesion.fecha_programada}
                    </div>
                    <div>
                      <strong>Participante:</strong> {sesion.participante ? 
                        `${sesion.participante.nombre} (${sesion.participante.tipo})` : 
                        'Sin participante'
                      }
                    </div>
                    <div>
                      <strong>Estado Real:</strong> {sesion.estado_real || 'Sin estado'}
                    </div>
                    <div>
                      <strong>Responsable:</strong> {sesion.responsable_real || 'Sin asignar'}
                    </div>
                    <div>
                      <strong>Implementador:</strong> {sesion.implementador_real || 'Sin asignar'}
                    </div>
                    <div>
                      <strong>Investigación:</strong> {sesion.investigacion_nombre || 'Sin investigación'}
                    </div>
                  </div>
                </div>
              ))}
              
              {sesiones.length > 5 && (
                <div className="text-center text-gray-500">
                  ... y {sesiones.length - 5} sesiones más
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TestSesionesPage;
