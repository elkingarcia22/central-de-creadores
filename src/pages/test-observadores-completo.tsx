import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

interface Libreto {
  id: string;
  investigacion_id: string;
  problema_situacion: string | null;
  hipotesis: string | null;
  objetivos: string | null;
  resultado_esperado: string | null;
  productos_requeridos: string[] | null;
  plataforma_id: string | null;
  tipo_prueba: string | null;
  rol_empresa_id: string | null;
  industria_id: string | null;
  pais: string | null;
  numero_participantes_esperados: number | null;
  nombre_sesion: string | null;
  usuarios_participantes: string[] | null;
  duracion_estimada_minutos: number | null;
  descripcion_general: string | null;
  link_prototipo: string | null;
  creado_por: string | null;
  creado_el: string;
  actualizado_el: string;
  duracion_estimada: number | null;
  tipo_prueba_id: string | null;
  pais_id: string | null;
  productos_recomendaciones: string | null;
  numero_participantes: number | null;
  modalidad_id: string[] | null;
  tamano_empresa_id: string[] | null;
}

interface Sesion {
  id: string;
  nombre: string;
  fecha_sesion: string;
  investigacion_id: string | null;
  empresa_id: string;
  industria_id: string;
  pais_id: string;
  usuarios_presentes_json: any;
  dolores_necesidades: string | null;
  descripcion_cliente: string | null;
  seguimiento_programado: boolean;
  fecha_seguimiento_tentativa: string | null;
  created_at: string;
  responsable_id: string | null;
  creado_por: string | null;
  estado: string | null;
  tamaño: string | null;
  relacion: string | null;
}

interface Usuario {
  id: string;
  full_name: string;
  email: string;
}

export default function TestObservadoresCompleto() {
  const [libretos, setLibretos] = useState<Libreto[]>([]);
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
      // 1. Cargar libretos con usuarios_participantes (observadores)
      addLog('📋 Cargando libretos de investigación...');
      const { data: libretosData, error: errorLibretos } = await supabase
        .from('libretos_investigacion')
        .select(`
          id,
          investigacion_id,
          usuarios_participantes,
          nombre_sesion,
          creado_por
        `);

      if (errorLibretos) {
        addLog(`❌ Error cargando libretos: ${errorLibretos.message}`);
        return;
      }

      setLibretos(libretosData || []);
      addLog(`✅ Libretos cargados: ${libretosData?.length || 0}`);

      // 2. Cargar sesiones
      addLog('📅 Cargando sesiones...');
      const { data: sesionesData, error: errorSesiones } = await supabase
        .from('sesiones')
        .select(`
          id,
          nombre,
          fecha_sesion,
          investigacion_id,
          usuarios_presentes_json
        `);

      if (errorSesiones) {
        addLog(`❌ Error cargando sesiones: ${errorSesiones.message}`);
        return;
      }

      setSesiones(sesionesData || []);
      addLog(`✅ Sesiones cargadas: ${sesionesData?.length || 0}`);

      // 3. Cargar usuarios (temporalmente deshabilitado hasta conocer estructura)
      addLog('👥 Cargando usuarios...');
      addLog('⚠️ Carga de usuarios temporalmente deshabilitada - necesitamos estructura de tabla');
      
      // const { data: usuariosData, error: errorUsuarios } = await supabase
      //   .from('usuarios')
      //   .select('id, full_name, email');

      // if (errorUsuarios) {
      //   addLog(`❌ Error cargando usuarios: ${errorUsuarios.message}`);
      //   return;
      // }

      setUsuarios([]);
      addLog(`✅ Usuarios cargados: 0 (temporalmente deshabilitado)`);

      // 4. Análisis de datos
      analizarDatos(libretosData || [], sesionesData || []);

    } catch (error) {
      addLog(`❌ Error general: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const analizarDatos = (libretosData: Libreto[], sesionesData: any[]) => {
    addLog('🔍 Analizando datos...');

    // Analizar libretos con usuarios_participantes (observadores)
    const libretosConObservadores = libretosData.filter(l => 
      l.usuarios_participantes && l.usuarios_participantes.length > 0
    );
    addLog(`📊 Libretos con observadores: ${libretosConObservadores.length}`);

    if (libretosConObservadores.length > 0) {
      addLog('📋 Detalles de libretos con observadores:');
      libretosConObservadores.forEach(l => {
        addLog(`  - Libreto ${l.id} (Investigación: ${l.investigacion_id}): ${l.usuarios_participantes.length} observadores`);
        addLog(`    Observadores IDs: ${JSON.stringify(l.usuarios_participantes)}`);
      });
    } else {
      addLog('⚠️ No se encontraron libretos con observadores');
    }

    // Analizar sesiones
    addLog(`📅 Sesiones: ${sesionesData.length}`);

    if (sesionesData.length > 0) {
      addLog('📋 Detalles de sesiones:');
      sesionesData.forEach(s => {
        addLog(`  - ${s.nombre} (ID: ${s.id})`);
        addLog(`    Fecha: ${s.fecha_sesion}`);
        addLog(`    Investigación ID: ${s.investigacion_id}`);
        addLog(`    Usuarios presentes: ${JSON.stringify(s.usuarios_presentes_json)}`);
      });
    }

    // Simular el mapeo que hace la API
    addLog('🔄 Simulando mapeo de la API...');
    const sesionesMapeadas = sesionesData.map(sesion => {
      // Buscar el libreto correspondiente a esta sesión por investigacion_id
      const libretoCorrespondiente = libretosData.find(l => 
        l.investigacion_id === sesion.investigacion_id
      );
      
      const observadores = libretoCorrespondiente?.usuarios_participantes || [];
      addLog(`  - Sesión ${sesion.id}: observadores = ${JSON.stringify(observadores)}`);
      addLog(`    Libreto encontrado: ${libretoCorrespondiente ? 'Sí' : 'No'}`);
      
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
          <h3 className="font-semibold text-blue-800">Libretos</h3>
          <p className="text-2xl font-bold text-blue-600">{libretos.length}</p>
          <p className="text-sm text-blue-600">
            Con observadores: {libretos.filter(l => l.usuarios_participantes && l.usuarios_participantes.length > 0).length}
          </p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Sesiones</h3>
          <p className="text-2xl font-bold text-green-600">{sesiones.length}</p>
          <p className="text-sm text-green-600">
            Total de sesiones
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

      {/* Libretos con observadores */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">📋 Libretos con Observadores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libretos
            .filter(l => l.usuarios_participantes && l.usuarios_participantes.length > 0)
            .map(libreto => (
              <div key={libreto.id} className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Libreto {libreto.id}</h4>
                <p className="text-sm text-gray-600 mb-2">ID: {libreto.id}</p>
                <p className="text-sm text-gray-600 mb-2">Investigación: {libreto.investigacion_id}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Observadores ({libreto.usuarios_participantes.length}):
                </p>
                <ul className="text-sm">
                  {libreto.usuarios_participantes.map(userId => (
                    <li key={userId} className="ml-4">
                      • {obtenerNombreUsuario(userId)} ({userId})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {/* Sesiones */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">📅 Sesiones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sesiones.map(sesion => (
            <div key={sesion.id} className="border p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{sesion.nombre}</h4>
              <p className="text-sm text-gray-600 mb-2">ID: {sesion.id}</p>
              <p className="text-sm text-gray-600 mb-2">
                Fecha: {new Date(sesion.fecha_sesion).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Investigación ID: {sesion.investigacion_id}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Usuarios presentes: {JSON.stringify(sesion.usuarios_presentes_json)}
              </p>
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
