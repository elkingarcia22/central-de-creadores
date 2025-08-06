import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Card } from '../components/ui';
import { supabase } from '../api/supabase';

const TestAuthPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        addLog('🔐 Verificando autenticación...');
        
        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          addLog(`❌ Error obteniendo sesión: ${sessionError.message}`);
        } else {
          setSession(session);
          addLog(`✅ Sesión obtenida: ${session ? 'Activa' : 'No hay sesión'}`);
        }

        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          addLog(`❌ Error obteniendo usuario: ${userError.message}`);
        } else {
          setUser(user);
          addLog(`✅ Usuario obtenido: ${user ? user.email : 'No autenticado'}`);
        }

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            addLog(`🔄 Cambio de autenticación: ${event}`);
            setSession(session);
            setUser(session?.user || null);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error: any) {
        addLog(`❌ Error inesperado: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para hacer login de prueba
  const hacerLoginPrueba = async () => {
    try {
      addLog('🔐 Intentando login de prueba...');
      
      // Intentar login con credenciales de prueba
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      if (error) {
        addLog(`❌ Error en login: ${error.message}`);
      } else {
        addLog(`✅ Login exitoso: ${data.user?.email}`);
      }
    } catch (error: any) {
      addLog(`❌ Error inesperado en login: ${error.message}`);
    }
  };

  // Función para hacer logout
  const hacerLogout = async () => {
    try {
      addLog('🚪 Haciendo logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addLog(`❌ Error en logout: ${error.message}`);
      } else {
        addLog(`✅ Logout exitoso`);
      }
    } catch (error: any) {
      addLog(`❌ Error inesperado en logout: ${error.message}`);
    }
  };

  // Función para probar consulta con autenticación
  const probarConsulta = async () => {
    try {
      addLog('🔍 Probando consulta con autenticación...');
      
      const { data, error } = await supabase
        .from('seguimientos_investigacion')
        .select('*')
        .limit(5);

      if (error) {
        addLog(`❌ Error en consulta: ${error.message}`);
      } else {
        addLog(`✅ Consulta exitosa: ${data?.length || 0} registros`);
        if (data && data.length > 0) {
          data.forEach((item, index) => {
            addLog(`   ${index + 1}. ${item.id} - ${item.estado}`);
          });
        }
      }
    } catch (error: any) {
      addLog(`❌ Error inesperado en consulta: ${error.message}`);
    }
  };

  // Función para limpiar logs
  const limpiarLogs = () => {
    setLogs([]);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Typography variant="h1" className="mb-6">
            Test de Autenticación
          </Typography>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de control */}
            <Card className="p-6">
              <Typography variant="h3" className="mb-4">
                Estado de Autenticación
              </Typography>

              <div className="space-y-4">
                <div>
                  <Typography variant="subtitle2" className="mb-2">
                    Estado actual:
                  </Typography>
                  <div className="text-sm space-y-1">
                    <div>Usuario: {user ? user.email : 'No autenticado'}</div>
                    <div>Sesión: {session ? 'Activa' : 'No hay sesión'}</div>
                    <div>Loading: {loading ? 'Sí' : 'No'}</div>
                  </div>
                </div>

                {user && (
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <Typography variant="subtitle2" className="text-green-800 dark:text-green-200">
                      Usuario Autenticado
                    </Typography>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                      <div>ID: {user.id}</div>
                      <div>Email: {user.email}</div>
                      <div>Creado: {new Date(user.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                    <Typography variant="subtitle2" className="text-yellow-800 dark:text-yellow-200">
                      No Autenticado
                    </Typography>
                    <Typography variant="body2" className="text-yellow-700 dark:text-yellow-300 mt-2">
                      Necesitas hacer login para probar las funcionalidades
                    </Typography>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={hacerLoginPrueba}
                    disabled={loading}
                    fullWidth
                  >
                    Login de Prueba
                  </Button>

                  <Button
                    onClick={hacerLogout}
                    disabled={loading || !user}
                    variant="secondary"
                    fullWidth
                  >
                    Logout
                  </Button>

                  <Button
                    onClick={probarConsulta}
                    disabled={loading || !user}
                    variant="outline"
                    fullWidth
                  >
                    Probar Consulta
                  </Button>

                  <Button
                    onClick={limpiarLogs}
                    variant="outline"
                    fullWidth
                  >
                    Limpiar Logs
                  </Button>
                </div>
              </div>
            </Card>

            {/* Logs */}
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
                      <div key={index} className="text-sm font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestAuthPage; 