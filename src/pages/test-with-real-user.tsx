import { useState } from 'react';

const TestWithRealUserPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-calendar/test-with-real-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
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
        <h1>Test con Usuario Real</h1>
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
          {loading ? 'Ejecutando...' : 'Ejecutar Test'}
        </button>
      </div>

      <div style={{ 
        padding: '16px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        marginBottom: '24px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Información del Test</h2>
        <p><strong>API:</strong> /api/google-calendar/test-with-real-user</p>
        <p><strong>Descripción:</strong> Obtiene automáticamente un usuario real de la base de datos y prueba los reclutamientos</p>
      </div>

      {result && (
        <div style={{ 
          padding: '16px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: result.success ? '#f0f8f0' : '#fff5f5'
        }}>
          <h2>Resultado del Test</h2>
          
          {result.success ? (
            <div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#d4edda', 
                color: '#155724',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                ✅ Test completado exitosamente
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3>Usuario Utilizado:</h3>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  border: '1px solid #1976d2'
                }}>
                  <pre style={{ margin: 0, fontSize: '12px' }}>
                    {JSON.stringify(result.usuario, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3>Resumen:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Conexión Supabase:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.conexion_supabase || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Reclutamientos Básicos:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.reclutamientos_basicos || 'N/A'}</span>
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
                    <strong>Query con Joins:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.query_con_joins || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3>Datos de Reclutamientos:</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  border: '1px solid #ddd'
                }}>
                  {JSON.stringify(result.resultados?.datos_reclutamientos, null, 2)}
                </pre>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3>Datos de Investigaciones:</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  border: '1px solid #ddd'
                }}>
                  {JSON.stringify(result.resultados?.datos_investigaciones, null, 2)}
                </pre>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3>Datos de Participantes:</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  border: '1px solid #ddd'
                }}>
                  {JSON.stringify(result.resultados?.datos_participantes, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3>Datos Completos con Joins:</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  border: '1px solid #ddd'
                }}>
                  {JSON.stringify(result.resultados?.datos_completos, null, 2)}
                </pre>
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
                ❌ Error en el test
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

export default TestWithRealUserPage;
