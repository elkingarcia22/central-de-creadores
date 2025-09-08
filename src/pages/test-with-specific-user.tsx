import { useState } from 'react';

const TestWithSpecificUserPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-calendar/test-with-specific-user', {
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
        <h1>Test con Usuario Específico (Con Reclutamientos)</h1>
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
        <p><strong>API:</strong> /api/google-calendar/test-with-specific-user</p>
        <p><strong>Descripción:</strong> Busca automáticamente un usuario que tenga reclutamientos y prueba la obtención de datos</p>
        <p><strong>Usuarios a probar:</strong></p>
        <ul>
          <li>9b1ef1eb-fdb4-410f-ab22-bfedc68294d6 (a@gmail.com) - 3 reclutamientos</li>
          <li>37b272a8-8baa-493c-8877-f14d031e22a1 (agarcia@gmail.com) - 1 reclutamiento</li>
          <li>49a34b62-ece1-44fc-afda-67f3b27094ad (prueba@gmail.com) - 1 reclutamiento</li>
        </ul>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
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
                    <strong>Participantes Internos:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.participantes_internos_encontrados || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Participantes Friend & Family:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.participantes_friend_family_encontrados || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Datos Combinados:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.datos_combinados || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3>Datos Completos Combinados:</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '300px',
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

export default TestWithSpecificUserPage;
