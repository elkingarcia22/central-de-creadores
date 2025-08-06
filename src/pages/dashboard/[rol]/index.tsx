import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRol } from '../../../contexts/RolContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../api/supabase';
import { Layout } from '../../../components/ui';
import RolInfo from '../../../components/RolInfo';
import EjemploUsoModal from '../../../components/EjemploUsoModal';
import { Typography, Card, Button } from '../../../components/ui';
import { 
  DashboardIcon, 
  MetricasIcon, 
  ConfiguracionesIcon, 
  LoadingIcon,
  InvestigacionesIcon,
  AlertTriangleIcon,
  SesionesIcon,
  EmpresasIcon
} from '../../../components/icons';

const Dashboard = () => {
  const router = useRouter();
  const { rolSeleccionado, setRolSeleccionado } = useRol();
  const [currentRol, setCurrentRol] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    investigaciones: 0,
    riesgo: 0,
    sesiones: 0,
    empresas: 0
  });

  console.log('Dashboard [rol] - Componente montado');
  console.log('Dashboard [rol] - router.isReady:', router.isReady);
  console.log('Dashboard [rol] - router.query:', router.query);
  console.log('Dashboard [rol] - rolSeleccionado (contexto):', rolSeleccionado);
  console.log('Dashboard [rol] - currentRol (estado):', currentRol);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error verificando autenticación:', error);
          router.replace('/login');
          return;
        }
        
        if (!session) {
          console.log('No hay sesión, redirigiendo al login');
          router.replace('/login');
          return;
        }
        
        console.log('Usuario autenticado:', session.user.email);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error en checkAuth:', error);
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    try {
      console.log('Dashboard [rol] - useEffect ejecutándose');
      // Obtener el rol de los parámetros de la ruta
      if (router.isReady) {
        const { rol: rolParam } = router.query;
        const rolFromUrl = rolParam as string || '';
        console.log('Dashboard [rol] - rolFromUrl:', rolFromUrl);
        setCurrentRol(rolFromUrl);
        
        // Si no hay rol seleccionado en el contexto, usar el de la URL
        if (!rolSeleccionado && rolFromUrl) {
          console.log('Dashboard [rol] - Estableciendo rol desde URL:', rolFromUrl);
          setRolSeleccionado(rolFromUrl);
        }
      }
    } catch (error) {
      console.error('Dashboard [rol] - Error en useEffect:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, router.query, rolSeleccionado, setRolSeleccionado]);

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      setStats({
        investigaciones: 12,
        riesgo: 999,  // Cambiado para ser muy visible
        sesiones: 8,
        empresas: 6
      });
    };
    loadStats();
  }, []);

  // Mostrar loading mientras se verifica autenticación y cargan los parámetros
  if (isLoading || !isAuthenticated || !router.isReady || !currentRol) {
    console.log('Dashboard [rol] - Mostrando loading');
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background`}>
        <div className="text-center">
          <LoadingIcon className="w-12 h-12 mx-auto text-primary" />
          <Typography variant="body1" color="secondary" className="mt-4">
            Cargando dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  console.log('Dashboard [rol] - Renderizando dashboard para rol:', currentRol);
  console.log('🚨 DEBUG - Stats actuales:', stats);
  console.log('🚨 DEBUG - Theme:', theme);
  console.log('🚨 DEBUG - Componente se está ejecutando');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard principal */}
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <Typography variant="h1" color="title" weight="bold" className="mb-4">
              Bienvenido al dashboard de{' '}
              <span className="text-primary capitalize">{currentRol}</span>
            </Typography>
            <Typography variant="subtitle1" color="secondary" className="mb-8">
              Gestiona tus tareas y accede a todas las funcionalidades disponibles para tu rol.
            </Typography>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {stats.investigaciones}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Investigaciones
                    </Typography>
                  </div>
                  <div className="p-3 rounded-lg bg-background">
                    <InvestigacionesIcon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {stats.riesgo}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      ⚠️ RIESGO CRÍTICO ⚠️
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
                    <AlertTriangleIcon className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {stats.sesiones}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Sesiones
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'}`}>
                    <SesionesIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {stats.empresas}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Empresas
                    </Typography>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-teal-900 bg-opacity-20' : 'bg-teal-50'}`}>
                    <EmpresasIcon className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Información del contexto global */}
            {rolSeleccionado && (
              <Card variant="outlined" padding="md" className="mb-8 bg-green-50 border-green-200">
                <Typography variant="h4" color="success" weight="semibold" className="mb-2">
                  Estado Global del Rol
                </Typography>
                <Typography variant="body1" color="success">
                  Rol seleccionado en el contexto: <strong>{rolSeleccionado}</strong>
                </Typography>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card variant="elevated" padding="lg">
                <div className="text-center">
                  <div className="mb-3">
                    <DashboardIcon className="w-12 h-12 text-primary mx-auto" />
                  </div>
                  <Typography variant="h5" color="title" weight="semibold" className="mb-2">
                    Vista General
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Accede a estadísticas y métricas importantes
                  </Typography>
                </div>
              </Card>
              
              <Card variant="elevated" padding="lg" className="bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="mb-3">
                    <MetricasIcon className="w-12 h-12 text-green-600 mx-auto" />
                  </div>
                  <Typography variant="h5" color="success" weight="semibold" className="mb-2">
                    Acciones Rápidas
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Realiza las tareas más frecuentes
                  </Typography>
                </div>
              </Card>
              
              <Card variant="elevated" padding="lg" className="bg-purple-50 border-purple-200">
                <div className="text-center">
                  <div className="mb-3">
                    <ConfiguracionesIcon className="w-12 h-12 text-purple-600 mx-auto" />
                  </div>
                  <Typography variant="h5" color="secondary" weight="semibold" className="mb-2">
                    Configuración
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Personaliza tu experiencia
                  </Typography>
                </div>
              </Card>
            </div>
          </div>
        </Card>
        
        {/* Componente de ejemplo del contexto */}
        <RolInfo />
        {/* Componente de ejemplo del modal */}
        <EjemploUsoModal />
      </div>
    </Layout>
  );
};

export default Dashboard; 