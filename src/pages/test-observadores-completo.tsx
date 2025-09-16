import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

interface Reclutamiento {
  id: string;
  titulo: string;
  usuarios_libreto: string[];
  investigacion_id: string;
}

interface Sesion {
  id: string;
  titulo: string;
  fecha_programada: string;
  reclutamiento_id: string;
  observadores?: string[];
  reclutamiento?: Reclutamiento;
}

interface Usuario {
  id: string;
  full_name: string;
  email: string;
}

export default function TestObservadoresCompleto() {
  const [reclutamientos, setReclutamientos] = useState<Reclutamiento[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🔍 [TEST] ${message}`);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    addLog('🚀 Iniciando carga de datos de prueba...');

    try {
      // 1. Cargar reclutamientos con usuarios_libreto
      addLog('📋 Cargando reclutamientos...');
      const { data: reclutamientosData, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select(`
          id,
          titulo,
          usuarios_libreto,
          investigacion_id
        `);

      if (errorReclutamientos) {
        addLog(`❌ Error cargando reclutamientos: ${errorReclutamientos.message}`);
        return;
      }

      setReclutamientos(reclutamientosData || []);
      addLog(`✅ Reclutamientos cargados: ${reclutamientosData?.length || 0}`);

      // 2. Cargar sesiones de reclutamiento
      addLog('📅 Cargando sesiones de reclutamiento...');
      const { data: sesionesData, error: errorSesiones } = await supabase
        .from('sesiones_reclutamiento')
        .select(`
          id,
          titulo,
          fecha_programada,
          reclutamiento_id,
          reclutamientos!sesiones_reclutamiento_reclutamiento_id_fkey(
            id,
            titulo,
            usuarios_libreto
          )
        `);

      if (errorSesiones) {
        addLog(`❌ Error cargando sesiones: ${errorSesiones.message}`);
        return;
      }

      setSesiones(sesionesData || []);
      addLog(`✅ Sesiones cargadas: ${sesionesData?.length || 0}`);

      // 3. Cargar usuarios
      addLog('👥 Cargando usuarios...');
      const { data: usuariosData, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, full_name, email');

      if (errorUsuarios) {
        addLog(`❌ Error cargando usuarios: ${errorUsuarios.message}`);
        return;
      }

      setUsuarios(usuariosData || []);
      addLog(`✅ Usuarios cargados: ${usuariosData?.length || 0}`);

      // 4. Análisis de datos
      analizarDatos(reclutamientosData || [], sesionesData || []);

    } catch (error) {
      addLog(`❌ Error general: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const analizarDatos = (reclutamientosData: Reclutamiento[], sesionesData: any[]) => {
    addLog('🔍 Analizando datos...');

    // Analizar reclutamientos con usuarios_libreto
    const reclutamientosConObservadores = reclutamientosData.filter(r => 
      r.usuarios_libreto && r.usuarios_libreto.length > 0
    );
    addLog(`📊 Reclutamientos con observadores: ${reclutamientosConObservadores.length}`);

    if (reclutamientosConObservadores.length > 0) {
      addLog('📋 Detalles de reclutamientos con observadores:');
      reclutamientosConObservadores.forEach(r => {
        addLog(`  - ${r.titulo} (ID: ${r.id}): ${r.usuarios_libreto.length} observadores`);
      });
    }

    // Analizar sesiones con observadores
    const sesionesConObservadores = sesionesData.filter(s => 
      s.reclutamientos?.usuarios_libreto && 
      s.reclutamientos.usuarios_libreto.length > 0
    );
    addLog(`📅 Sesiones con observadores: ${sesionesConObservadores.length}`);

    if (sesionesConObservadores.length > 0) {
      addLog('📋 Detalles de sesiones con observadores:');
      sesionesConObservadores.forEach(s => {
        addLog(`  - ${s.titulo} (ID: ${s.id}): ${s.reclutamientos.usuarios_libreto.length} observadores`);
        addLog(`    Fecha: ${s.fecha_programada}`);
        addLog(`    Observadores IDs: ${JSON.stringify(s.reclutamientos.usuarios_libreto)}`);
      });
    }

    // Simular el mapeo que hace la API
    addLog('🔄 Simulando mapeo de la API...');
    const sesionesMapeadas = sesionesData.map(sesion => {
      const observadores = sesion.reclutamientos?.usuarios_libreto || [];
      addLog(`  - Sesión ${sesion.id}: observadores = ${JSON.stringify(observadores)}`);
      
      return {
        ...sesion,
        observadores: observadores
      };
    });

    const sesionesMapeadasConObservadores = sesionesMapeadas.filter(s => 
      s.observadores && s.observadores.length > 0
    );
    addLog(`✅ Sesiones mapeadas con observadores: ${sesionesMapeadasConObservadores.length}`);

    // Simular el hook del calendario
    addLog('🎯 Simulando hook del calendario...');
    sesionesMapeadasConObservadores.forEach(sesion => {
      addLog(`  - Sesión ${sesion.id}: observadores finales = ${JSON.stringify(sesion.observadores)}`);
    });
  };

  const obtenerNombreUsuario = (userId: string) => {
    const usuario = usuarios.find(u => u.id === userId);
    return usuario ? usuario.full_name : `Usuario ${userId}`;
  };

  const limpiarLogs = () => {
    setLogs([]);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔄 Cargando datos de prueba...</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Completo de Observadores</h1>
      
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Reclutamientos</h3>
          <p className="text-2xl font-bold text-blue-600">{reclutamientos.length}</p>
          <p className="text-sm text-blue-600">
            Con observadores: {reclutamientos.filter(r => r.usuarios_libreto && r.usuarios_libreto.length > 0).length}
          </p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Sesiones</h3>
          <p className="text-2xl font-bold text-green-600">{sesiones.length}</p>
          <p className="text-sm text-green-600">
            Con observadores: {sesiones.filter(s => s.reclutamientos?.usuarios_libreto && s.reclutamientos.usuarios_libreto.length > 0).length}
          </p>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Usuarios</h3>
          <p className="text-2xl font-bold text-purple-600">{usuarios.length}</p>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">📝 Logs de Debug</h3>
          <button 
            onClick={limpiarLogs}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Limpiar
          </button>
        </div>
        <div className="bg-black text-green-400 p-3 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      {/* Reclutamientos con observadores */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">📋 Reclutamientos con Observadores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reclutamientos
            .filter(r => r.usuarios_libreto && r.usuarios_libreto.length > 0)
            .map(reclutamiento => (
              <div key={reclutamiento.id} className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{reclutamiento.titulo}</h4>
                <p className="text-sm text-gray-600 mb-2">ID: {reclutamiento.id}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Observadores ({reclutamiento.usuarios_libreto.length}):
                </p>
                <ul className="text-sm">
                  {reclutamiento.usuarios_libreto.map(userId => (
                    <li key={userId} className="ml-4">
                      • {obtenerNombreUsuario(userId)} ({userId})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {/* Sesiones con observadores */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">📅 Sesiones con Observadores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sesiones
            .filter(s => s.reclutamientos?.usuarios_libreto && s.reclutamientos.usuarios_libreto.length > 0)
            .map(sesion => (
              <div key={sesion.id} className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{sesion.titulo}</h4>
                <p className="text-sm text-gray-600 mb-2">ID: {sesion.id}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Fecha: {new Date(sesion.fecha_programada).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Observadores ({sesion.reclutamientos.usuarios_libreto.length}):
                </p>
                <ul className="text-sm">
                  {sesion.reclutamientos.usuarios_libreto.map(userId => (
                    <li key={userId} className="ml-4">
                      • {obtenerNombreUsuario(userId)} ({userId})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {/* Botón para probar API */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">🔧 Pruebas de API</h3>
        <div className="space-x-4">
          <button 
            onClick={() => window.open('/api/sesiones-reclutamiento', '_blank')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Probar API Sesiones Reclutamiento
          </button>
          <button 
            onClick={() => window.open('/api/debug-observadores-api', '_blank')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Probar API Debug Observadores
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Instrucciones de Prueba</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Revisa los logs para ver el flujo completo de datos</li>
          <li>2. Verifica que los reclutamientos tengan observadores</li>
          <li>3. Verifica que las sesiones tengan observadores</li>
          <li>4. Prueba las APIs para ver si devuelven los datos correctamente</li>
          <li>5. Compara con el comportamiento en el calendario real</li>
        </ol>
      </div>
    </div>
  );
}
