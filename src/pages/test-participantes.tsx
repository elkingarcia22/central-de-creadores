import { useState, useEffect } from 'react';

interface TestParticipante {
  id: string;
  nombre: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  reclutamientos: any[];
  responsableEsperado: string;
  responsableActual: string;
  fechaEsperada: string;
  fechaActual: string;
}

export default function TestParticipantes() {
  const [participantes, setParticipantes] = useState<TestParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [probando, setProbando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarParticipantesTest();
  }, []);

  const cargarParticipantesTest = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando participantes de prueba...');
      
      // Cargar participantes de cada tipo
      const [externosRes, internosRes, friendFamilyRes] = await Promise.all([
        fetch('/api/participantes/todos-tipos?tipo=externo'),
        fetch('/api/participantes/todos-tipos?tipo=interno'),
        fetch('/api/participantes/todos-tipos?tipo=friend_family')
      ]);

      // Verificar que las respuestas sean exitosas
      if (!externosRes.ok || !internosRes.ok || !friendFamilyRes.ok) {
        throw new Error('Error en las respuestas de la API');
      }

      // Parsear las respuestas
      const externos = await externosRes.json();
      const internos = await internosRes.json();
      const friendFamily = await friendFamilyRes.json();

      console.log('📊 Respuestas de la API:', {
        externos: externos,
        internos: internos,
        friendFamily: friendFamily
      });

      // Inspeccionar la estructura completa de cada respuesta
      console.log('🔍 Estructura de externos:', {
        tipo: typeof externos,
        keys: Object.keys(externos),
        contenido: externos
      });
      console.log('🔍 Estructura de internos:', {
        tipo: typeof internos,
        keys: Object.keys(internos),
        contenido: internos
      });
      console.log('🔍 Estructura de friendFamily:', {
        tipo: typeof friendFamily,
        keys: Object.keys(friendFamily),
        contenido: friendFamily
      });

      // Extraer los arrays de dentro de los objetos (si la API devuelve { data: [...], error: null })
      const externosArray = externos.participantes || externos.data || externos;
      const internosArray = internos.participantes || internos.data || internos;
      const friendFamilyArray = friendFamily.participantes || friendFamily.data || friendFamily;

      console.log('📊 Arrays extraídos:', {
        externos: externosArray,
        internos: internosArray,
        friendFamily: friendFamilyArray
      });

      // Validar que sean arrays
      if (!Array.isArray(externosArray) || !Array.isArray(internosArray) || !Array.isArray(friendFamilyArray)) {
        console.error('❌ Las respuestas no son arrays válidos:', {
          externos: typeof externosArray,
          internos: typeof internosArray,
          friendFamily: typeof friendFamilyArray
        });
        
        // Mostrar más detalles del error
        console.error('❌ Detalles de las respuestas:', {
          externos: externosArray,
          internos: internosArray,
          friendFamily: friendFamilyArray
        });
        
        throw new Error('Las respuestas de la API no son arrays válidos');
      }

      console.log('📊 Participantes cargados:', { 
        externos: externosArray.length, 
        internos: internosArray.length, 
        friendFamily: friendFamilyArray.length 
      });

      const participantesTest: TestParticipante[] = [];

      // Procesar participantes externos
      externosArray.slice(0, 3).forEach((p: any) => {
        participantesTest.push({
          id: p.id,
          nombre: p.nombre,
          tipo: 'externo',
          reclutamientos: [],
          responsableEsperado: '¿Responsable de investigación?',
          responsableActual: '',
          fechaEsperada: '¿Fecha más reciente?',
          fechaActual: ''
        });
      });

      // Procesar participantes internos
      internosArray.slice(0, 3).forEach((p: any) => {
        participantesTest.push({
          id: p.id,
          nombre: p.nombre,
          tipo: 'interno',
          reclutamientos: [],
          responsableEsperado: '¿Reclutador del reclutamiento?',
          responsableActual: '',
          fechaEsperada: '¿Fecha más reciente?',
          fechaActual: ''
        });
      });

      // Procesar participantes friend & family
      friendFamilyArray.slice(0, 3).forEach((p: any) => {
        participantesTest.push({
          id: p.id,
          nombre: p.nombre,
          tipo: 'friend_family',
          reclutamientos: [],
          responsableEsperado: '¿Reclutador del reclutamiento?',
          responsableActual: '',
          fechaEsperada: '¿Fecha más reciente?',
          fechaActual: ''
        });
      });

      console.log('✅ Participantes de prueba preparados:', participantesTest.length);
      setParticipantes(participantesTest);
    } catch (error) {
      console.error('❌ Error cargando participantes de prueba:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      // Mostrar error en la interfaz
      setParticipantes([]);
    } finally {
      setLoading(false);
    }
  };

  const probarTodos = async () => {
    console.log('🚀 Iniciando prueba de todos los participantes...');
    console.log('📊 Participantes a probar:', participantes.length);
    
    if (participantes.length === 0) {
      console.log('❌ No hay participantes para probar');
      return;
    }
    
    setProbando(true);
    
    try {
      for (const participante of participantes) {
        console.log(`🔍 Probando participante: ${participante.nombre} (${participante.tipo})`);
        await probarParticipante(participante);
        // Esperar un poco entre cada prueba para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('✅ Prueba de todos los participantes completada');
    } catch (error) {
      console.error('❌ Error en prueba general:', error);
    } finally {
      setProbando(false);
    }
  };

  const probarParticipante = async (participante: TestParticipante) => {
    try {
      console.log(`🔍 Probando participante ${participante.id}: ${participante.nombre}`);
      
      const response = await fetch(`/api/participantes/${participante.id}/reclutamiento-actual`);
      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 Datos recibidos:`, data);
      
      if (data.reclutamiento) {
        const reclutamiento = data.reclutamiento;
        console.log(`✅ Reclutamiento encontrado:`, reclutamiento);
        
        // Actualizar datos del participante
        setParticipantes(prev => prev.map(p => 
          p.id === participante.id 
            ? {
                ...p,
                responsableActual: reclutamiento.responsable || 'Sin responsable',
                fechaActual: reclutamiento.fecha_sesion || 'Sin fecha',
                reclutamientos: [reclutamiento]
              }
            : p
        ));
        
        console.log(`✅ Participante ${participante.nombre} actualizado`);
      } else {
        console.log(`❌ No se encontró reclutamiento para ${participante.nombre}`);
      }
    } catch (error) {
      console.error(`❌ Error probando participante ${participante.id}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center">Cargando participantes de prueba...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🧪 Página de Prueba - Participantes</h1>
          <p className="mt-2 text-gray-600">
            Analiza todos los tipos de participantes para implementar solución transversal
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={probarTodos}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={probando}
          >
            {probando ? '🔄 Probando...' : '🚀 Probar Todos los Participantes'}
          </button>
          
          <button
            onClick={async () => {
              console.log('🔍 Probando API externos manualmente...');
              try {
                const response = await fetch('/api/participantes/todos-tipos?tipo=externo');
                const data = await response.json();
                console.log('📊 Respuesta completa de externos:', data);
                console.log('🔍 Tipo:', typeof data);
                console.log('🔍 Keys:', Object.keys(data));
                console.log('🔍 Es array?', Array.isArray(data));
              } catch (error) {
                console.error('❌ Error probando API:', error);
              }
            }}
            className="ml-3 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            🔍 Debug API Externos
          </button>
          
          <div className="mt-2 text-sm text-gray-600">
            📊 Participantes cargados: {participantes.length} | 
            🔄 Estado: {loading ? 'Cargando...' : probando ? 'Probando...' : 'Listo'}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>❌ Error:</strong> {error}
              </div>
              <button
                onClick={cargarParticipantesTest}
                className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
              >
                🔄 Reintentar
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {participantes.map((participante) => (
            <div key={participante.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {participante.nombre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      participante.tipo === 'externo' ? 'bg-blue-100 text-blue-800' :
                      participante.tipo === 'interno' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {participante.tipo.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">ID: {participante.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => probarParticipante(participante)}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded"
                >
                  🔍 Probar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Responsable</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Esperado:</span>
                      <span className="ml-2 text-sm font-medium">{participante.responsableEsperado}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Actual:</span>
                      <span className={`ml-2 text-sm font-medium ${
                        participante.responsableActual ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {participante.responsableActual || 'No probado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Fecha de Sesión</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Esperado:</span>
                      <span className="ml-2 text-sm font-medium">{participante.fechaEsperada}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Actual:</span>
                      <span className={`ml-2 text-sm font-medium ${
                        participante.fechaActual ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {participante.fechaActual || 'No probado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {participante.reclutamientos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Datos del Reclutamiento</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(participante.reclutamientos[0], null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Análisis Requerido</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• <strong>Externos:</strong> ¿Responsable de investigación o reclutador del reclutamiento?</p>
            <p>• <strong>Internos:</strong> ¿Reclutador del reclutamiento o responsable de investigación?</p>
            <p>• <strong>Friend & Family:</strong> ¿Reclutador del reclutamiento o responsable de investigación?</p>
            <p>• <strong>Ordenamiento:</strong> ¿Por fecha, por tipo, o por otro criterio?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
