import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button } from '../components/ui';
import { 
  InvestigacionesIcon, 
  ReclutamientoIcon, 
  SesionesIcon, 
  MetricasIcon, 
  ConfiguracionesIcon, 
  ConocimientoIcon,
  EmpresasIcon,
  AlertTriangleIcon,
  UserIcon
} from '../components/icons';

export default function DashboardPage() {
  const { rolSeleccionado, loading } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState({
    investigaciones: 0,
    riesgo: 0,
    sesiones: 0,
    empresas: 0
  });

  // Configuración de menús por rol
  const menuConfig = {
    administrador: [
      {
        label: 'Investigaciones',
        href: '/investigaciones',
        icon: <InvestigacionesIcon className="w-8 h-8" />,
        description: 'Gestionar investigaciones y estudios',
        color: 'blue'
      },
      {
        label: 'Reclutamiento',
        href: '/reclutamiento',
        icon: <ReclutamientoIcon className="w-8 h-8" />,
        description: 'Gestionar proceso de reclutamiento y asignación',
        color: 'green'
      },
      {
        label: 'Sesiones',
        href: '/sesiones',
        icon: <SesionesIcon className="w-8 h-8" />,
        description: 'Programar y gestionar sesiones',
        color: 'purple'
      },
      {
        label: 'Métricas',
        href: '/metricas',
        icon: <MetricasIcon className="w-8 h-8" />,
        description: 'Ver estadísticas y reportes',
        color: 'orange'
      },
      {
        label: 'Participantes',
        href: '/participantes',
        icon: <UserIcon className="w-8 h-8" />,
        description: 'Gestionar base de datos de participantes',
        color: 'teal'
      },
      {
        label: 'Empresas',
        href: '/empresas',
        icon: <EmpresasIcon className="w-8 h-8" />,
        description: 'Gestionar información de empresas',
        color: 'indigo'
      },
      {
        label: 'Configuraciones',
        href: '/configuraciones',
        icon: <ConfiguracionesIcon className="w-8 h-8" />,
        description: 'Configurar sistema y usuarios',
        color: 'gray'
      },
      {
        label: 'Conocimiento',
        href: '/conocimiento',
        icon: <ConocimientoIcon className="w-8 h-8" />,
        description: 'Acceder a recursos y documentación',
        color: 'yellow'
      }
    ],
    investigador: [
      { 
        label: 'Investigaciones', 
        href: '/investigaciones', 
        icon: <InvestigacionesIcon className="w-8 h-8" />,
        description: 'Gestionar investigaciones y estudios',
        color: 'blue'
      },
      { 
        label: 'Sesiones', 
        href: '/sesiones', 
        icon: <SesionesIcon className="w-8 h-8" />,
        description: 'Gestionar sesiones de investigación',
        color: 'purple'
      },
      { 
        label: 'Métricas', 
        href: '/metricas', 
        icon: <MetricasIcon className="w-8 h-8" />,
        description: 'Ver métricas y reportes',
        color: 'orange'
      },
      { 
        label: 'Conocimiento', 
        href: '/conocimiento', 
        icon: <ConocimientoIcon className="w-8 h-8" />,
        description: 'Base de conocimiento',
        color: 'indigo'
      }
    ],
    reclutador: [
      { 
        label: 'Reclutamiento', 
        href: '/reclutamiento', 
        icon: <ReclutamientoIcon className="w-8 h-8" />,
        description: 'Gestionar proceso de reclutamiento y asignación',
        color: 'green'
      },
      { 
        label: 'Participantes', 
        href: '/participantes', 
        icon: <UserIcon className="w-8 h-8" />,
        description: 'Gestionar participantes',
        color: 'pink'
      },
      { 
        label: 'Empresas', 
        href: '/empresas', 
        icon: <EmpresasIcon className="w-8 h-8" />,
        description: 'Gestionar empresas',
        color: 'teal'
      }
    ]
  };

  useEffect(() => {
    // Simular carga de estadísticas
    const loadStats = async () => {
      // Aquí se cargarían las estadísticas reales desde la API
      setStats({
        investigaciones: 12,
        riesgo: 999,  // Cambiado para ser muy visible
        sesiones: 8,
        empresas: 6
      });
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body1" color="secondary">
            Cargando dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  const currentMenu = menuConfig[rolSeleccionado?.toLowerCase() as keyof typeof menuConfig] || [];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: theme === 'dark' ? 'text-gray-400 bg-gray-800 bg-opacity-50' : 'text-gray-600 bg-gray-50',
      green: theme === 'dark' ? 'text-green-400 bg-green-900 bg-opacity-20' : 'text-green-600 bg-green-50',
      purple: theme === 'dark' ? 'text-purple-400 bg-purple-900 bg-opacity-20' : 'text-secondary bg-secondary/10',
      orange: theme === 'dark' ? 'text-orange-400 bg-orange-900 bg-opacity-20' : 'text-orange-600 bg-orange-50',
      gray: theme === 'dark' ? 'text-gray-400 bg-gray-900 bg-opacity-20' : 'text-gray-600 bg-gray-50',
      indigo: theme === 'dark' ? 'text-indigo-400 bg-indigo-900 bg-opacity-20' : 'text-indigo-600 bg-indigo-50',
      teal: theme === 'dark' ? 'text-teal-400 bg-teal-900 bg-opacity-20' : 'text-info bg-info/10',
      pink: theme === 'dark' ? 'text-pink-400 bg-pink-900 bg-opacity-20' : 'text-pink-600 bg-pink-50'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
                            <Typography variant="h2" color="title" weight="semibold" className="mb-2">
                  Dashboard
                </Typography>
            <Typography variant="subtitle1" color="secondary" className="capitalize">
              Bienvenido, {rolSeleccionado}
            </Typography>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-gray-900 dark:text-gray-100">
                    {stats.investigaciones}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Investigaciones
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <InvestigacionesIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-gray-900 dark:text-gray-100">
                    {stats.riesgo}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    ⚠️ RIESGO CRÍTICO ⚠️
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <AlertTriangleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-gray-900 dark:text-gray-100">
                    {stats.sesiones}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Sesiones
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <SesionesIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-gray-900 dark:text-gray-100">
                    {stats.empresas}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Empresas
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <EmpresasIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Módulos Disponibles */}
          <div>
            <Typography variant="h2" color="title" weight="semibold" className="mb-6">
              Módulos Disponibles
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMenu.map((item, index) => (
                <Card 
                  key={index}
                  variant="elevated" 
                  padding="lg" 
                  className="hover: transition-colors duration-200 cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <div className="text-center space-y-4">
                    <div className={`inline-flex p-4 rounded-lg ${getColorClasses(item.color)}`}>
                      {item.icon}
                    </div>
                    <div>
                      <Typography variant="h5" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" color="secondary" className="mt-2">
                        {item.description}
                      </Typography>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(item.href)}
                    >
                      Acceder
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 