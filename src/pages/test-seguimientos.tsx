import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button } from '../components/ui';
import { obtenerSeguimientosPorInvestigacion, crearSeguimiento } from '../api/supabase-seguimientos';
import { obtenerInvestigaciones, obtenerUsuarios } from '../api/supabase-investigaciones';

const TestSeguimientosPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [investigacionSeleccionada, setInvestigacionSeleccionada] = useState<string>('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Cargar investigaciones y usuarios
  useEffect(() => {
    const cargarDatos = async () => {
      addLog('🔍 Cargando datos iniciales...');
      try {
        const [investigacionesRes, usuariosRes] = await Promise.all([
          obtenerInvestigaciones(),
          obtenerUsuarios()
        ]);

        if (investigacionesRes.data) {
          setInvestigaciones(investigacionesRes.data);
          addLog(`✅ Investigaciones cargadas: ${investigacionesRes.data.length}`);
        }

        if (usuariosRes.data) {
          setUsuarios(usuariosRes.data);
          addLog(`✅ Usuarios cargados: ${usuariosRes.data.length}`);
          
          // Seleccionar el primer usuario como responsable por defecto
          if (usuariosRes.data.length > 0) {
            setUsuarioSeleccionado(usuariosRes.data[0].id);
            addLog(`👤 Usuario seleccionado: ${usuariosRes.data[0].full_name || usuariosRes.data[0].email}`);
          }
        }
        
        // Seleccionar la primera investigación en progreso
        const enProgreso = investigacionesRes.data?.find((inv: any) => inv.estado === 'en_progreso');
        if (enProgreso) {
          setInvestigacionSeleccionada(enProgreso.id);
          addLog(`🎯 Investigación seleccionada: ${enProgreso.nombre} (${enProgreso.id})`);
          await cargarSeguimientos(enProgreso.id);
        }
      } catch (error: any) {
        addLog(`❌ Error cargando datos: ${error.message}`);
      }
    };
    cargarDatos();
  }, []);

  // Función para cargar seguimientos
  const cargarSeguimientos = async (investigacionId: string) => {
    addLog(`🔍 Cargando seguimientos para investigación: ${investigacionId}`);
    
    try {
      const response = await obtenerSeguimientosPorInvestigacion(investigacionId);
      
      if (response.error) {
        addLog(`❌ Error cargando seguimientos: ${response.error}`);
      } else {
        setSeguimientos(response.data || []);
        addLog(`✅ Seguimientos cargados: ${response.data?.length || 0}`);
        
        if (response.data && response.data.length > 0) {
          response.data.forEach((seg: any, index: number) => {
            addLog(`   ${index + 1}. ${seg.id} - ${seg.fecha_seguimiento} - ${seg.estado}`);
          });
        }
      }
    } catch (error: any) {
      addLog(`❌ Error inesperado cargando seguimientos: ${error.message}`);
    }
  };

  // Función para crear seguimiento de prueba
  const crearSeguimientoPrueba = async () => {
    if (!investigacionSeleccionada) {
      addLog('❌ No hay investigación seleccionada');
      return;
    }

    if (!usuarioSeleccionado) {
      addLog('❌ No hay usuario seleccionado');
      return;
    }

    setLoading(true);
    addLog('🔄 === INICIO CREAR SEGUIMIENTO ===');
    
    try {
      const datosSeguimiento = {
        investigacion_id: investigacionSeleccionada,
        fecha_seguimiento: new Date().toISOString().split('T')[0],
        notas: `Seguimiento de prueba creado el ${new Date().toLocaleString()}`,
        responsable_id: usuarioSeleccionado,
        estado: 'pendiente'
      };

      addLog(`📝 Datos del seguimiento: ${JSON.stringify(datosSeguimiento, null, 2)}`);
      
      const response = await crearSeguimiento(datosSeguimiento);
      
      if (response.error) {
        addLog(`❌ Error creando seguimiento: ${response.error}`);
      } else {
        addLog(`✅ Seguimiento creado exitosamente: ${response.data?.id}`);
        
        // Recargar seguimientos inmediatamente
        addLog('🔄 Recargando seguimientos...');
        await cargarSeguimientos(investigacionSeleccionada);
        addLog('✅ Seguimientos recargados');
      }
    } catch (error: any) {
      addLog(`❌ Error inesperado: ${error.message}`);
    } finally {
      setLoading(false);
      addLog('🔄 === FIN CREAR SEGUIMIENTO ===');
    }
  };

  // Función para limpiar logs
  const limpiarLogs = () => {
    setLogs([]);
  };

  // Función para cambiar investigación
  const cambiarInvestigacion = async (investigacionId: string) => {
    setInvestigacionSeleccionada(investigacionId);
    addLog(`🔄 Cambiando a investigación: ${investigacionId}`);
    await cargarSeguimientos(investigacionId);
  };

  return (
    <Layout rol="Usuario">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Typography variant="h1" className="mb-6">
            Test de Seguimientos - Diagnóstico Completo
          </Typography>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Control */}
            <Card className="p-6">
              <Typography variant="h3" className="mb-4">
                Panel de Control
              </Typography>
              
              <div className="space-y-4">
                <div>
                  <Typography variant="subtitle2" className="mb-2">Estado actual:</Typography>
                  <div className="text-sm space-y-1">
                    <div>Investigaciones: {investigaciones.length}</div>
                    <div>Usuarios: {usuarios.length}</div>
                    <div>Seguimientos: {seguimientos.length}</div>
                    <div>Investigación seleccionada: {investigacionSeleccionada || 'Ninguna'}</div>
                    <div>Usuario seleccionado: {usuarioSeleccionado || 'Ninguno'}</div>
                  </div>
                </div>

                <div>
                  <Typography variant="subtitle2" className="mb-2">Seleccionar investigación:</Typography>
                  <select 
                    value={investigacionSeleccionada}
                    onChange={(e) => cambiarInvestigacion(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccionar...</option>
                    {investigaciones.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.nombre} ({inv.estado})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Typography variant="subtitle2" className="mb-2">Seleccionar responsable:</Typography>
                  <select 
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccionar...</option>
                    {usuarios.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email} ({user.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="primary"
                    onClick={crearSeguimientoPrueba}
                    disabled={loading || !investigacionSeleccionada || !usuarioSeleccionado}
                    className="w-full"
                  >
                    {loading ? 'Creando...' : 'Crear Seguimiento de Prueba'}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={limpiarLogs}
                    className="w-full"
                  >
                    Limpiar Logs
                  </Button>
                </div>
              </div>
            </Card>

            {/* Logs de Debug */}
            <Card className="p-6">
              <Typography variant="h3" className="mb-4">
                Logs de Debug
              </Typography>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <Typography variant="body2" color="secondary">
                    No hay logs aún. Ejecuta una acción para ver los logs.
                  </Typography>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Lista de Seguimientos */}
          <Card className="mt-6 p-6">
            <Typography variant="h3" className="mb-4">
              Seguimientos Actuales ({seguimientos.length})
            </Typography>
            
            {seguimientos.length === 0 ? (
              <Typography variant="body2" color="secondary">
                No hay seguimientos para mostrar.
              </Typography>
            ) : (
              <div className="space-y-2">
                {seguimientos.map((seg, index) => (
                  <div key={seg.id} className="p-3 border rounded">
                    <div className="font-medium">Seguimiento {index + 1}</div>
                    <div className="text-sm text-gray-600">
                      ID: {seg.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Fecha: {seg.fecha_seguimiento}
                    </div>
                    <div className="text-sm text-gray-600">
                      Estado: {seg.estado}
                    </div>
                    <div className="text-sm text-gray-600">
                      Notas: {seg.notas}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TestSeguimientosPage; 