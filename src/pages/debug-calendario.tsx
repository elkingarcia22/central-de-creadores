import { useState } from 'react';

const DebugCalendarioPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-calendario', {
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
        <h1>Diagnóstico del Calendario</h1>
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
        <p><strong>API:</strong> /api/debug-calendario</p>
        <p><strong>Descripción:</strong> Diagnostica problemas del calendario y creación de sesiones</p>
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
                    <strong>Conexión Supabase:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.conexion_supabase || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Reclutamientos Obtenidos:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.reclutamientos_obtenidos || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Investigaciones Obtenidas:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.investigaciones_obtenidas || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Participantes Obtenidos:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.participantes_obtenidos || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Usuarios Obtenidos:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.usuarios_obtenidos || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Permisos RLS:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.permisos_rls || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Inserción Prueba:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.insercion_prueba || 'N/A'}</span>
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

export default DebugCalendarioPage;
