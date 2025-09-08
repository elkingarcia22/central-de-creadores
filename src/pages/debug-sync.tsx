import { useState } from 'react';

const DebugSyncPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-calendar/debug-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6' }) // Usuario que tiene reclutamientos
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error en la petición', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Diagnóstico de Sincronización</h1>
        <button
          onClick={handleTest}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </button>
      </div>

      <div style={{ 
        padding: '16px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        marginBottom: '24px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Información del Diagnóstico</h2>
        <p><strong>API:</strong> /api/google-calendar/debug-sync</p>
        <p><strong>Usuario de prueba:</strong> 9b1ef1eb-fdb4-410f-ab22-bfedc68294d6 (a@gmail.com - tiene reclutamientos)</p>
        <p><strong>Descripción:</strong> Diagnostica todos los pasos de la sincronización con Google Calendar</p>
      </div>

      {result && (
        <div style={{ 
          padding: '16px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: result.success ? '#f0f8f0' : '#fff5f5'
        }}>
          <h2>Resultado del Diagnóstico</h2>
          
          {result.success ? (
            <div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#d4edda', 
                color: '#155724',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                ✅ Diagnóstico completado exitosamente
              </div>
              
              <div>
                <h3>Resumen:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Tokens Encontrados:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.tokens_encontrados ? '✅ Sí' : '❌ No'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Variables de Entorno:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.variables_entorno ? '✅ Sí' : '❌ No'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Acceso Google Calendar:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.acceso_google_calendar ? '✅ Sí' : '❌ No'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Reclutamientos Encontrados:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.reclutamientos_encontrados || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Investigaciones Encontradas:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.investigaciones_encontradas || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Participantes Encontrados:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.participantes_encontrados || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Evento de Prueba Creado:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.evento_prueba_creado ? '✅ Sí' : '❌ No'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f8d7da', 
                color: '#721c24',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                ❌ Error en el diagnóstico
              </div>
              
              <div>
                <h3>Error:</h3>
                <p style={{ color: '#dc3545' }}>{result.error}</p>
              </div>
              
              <div>
                <h3>Detalles:</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  border: '1px solid #ddd'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugSyncPage;
