import { useState } from 'react';
import { useFastUser } from '../contexts/FastUserContext';

const DebugUsuarioActualPage = () => {
  const { userId, isAuthenticated } = useFastUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!userId) {
      setResult({ error: 'No hay usuario logueado', details: 'userId es null o undefined' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug-usuario-actual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
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
        <h1>Diagnóstico del Usuario Actual</h1>
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
        <h2>Información del Usuario Actual</h2>
        <p><strong>Usuario Logueado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
        <p><strong>User ID:</strong> {userId || 'No disponible'}</p>
        <p><strong>API:</strong> /api/debug-usuario-actual</p>
        <p><strong>Descripción:</strong> Verifica si el usuario actual existe en la base de datos</p>
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
                ✅ Usuario encontrado en la base de datos
              </div>
              
              <div>
                <h3>Datos del Usuario:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>ID:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.detalles_usuario?.id || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Nombre:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.detalles_usuario?.nombre || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Correo:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.detalles_usuario?.correo || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Activo:</strong><br />
                    <span style={{ color: '#1976d2' }}>{result.resultados?.detalles_usuario?.activo ? 'Sí' : 'No'}</span>
                  </div>
                </div>
                
                <div>
                  <h3>Reclutamientos Existentes:</h3>
                  <p><strong>Cantidad:</strong> {result.resultados?.reclutamientos_existentes || 0}</p>
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

export default DebugUsuarioActualPage;
