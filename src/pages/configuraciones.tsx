import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button } from '../components/ui';
import { 
  ConfiguracionesIcon, 
  UsuariosIcon, 
  EmpresasIcon, 
  ParticipantesIcon,
  InvestigacionesIcon,
  ReclutamientoIcon,
  SesionesIcon,
  MetricasIcon,
  ConocimientoIcon
} from '../components/icons';

export default function ConfiguracionesPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();

  // Verificar acceso - solo administradores
  if (rolSeleccionado?.toLowerCase() !== 'administrador') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background`}>
        <div className="text-center">
          <Typography variant="h2" color="danger" weight="bold" className="mb-4">
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Solo los administradores pueden acceder a esta sección.
          </Typography>
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const configuraciones = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios, roles y permisos del sistema',
      icon: <UsuariosIcon className="w-8 h-8" />,
      href: '/configuraciones/gestion-usuarios',
      color: 'blue',
      features: ['Crear usuarios', 'Asignar roles', 'Gestionar permisos', 'Activar/desactivar cuentas']
    },
    {
      title: 'Configuración de Empresas',
      description: 'Gestionar información de empresas y organizaciones',
      icon: <EmpresasIcon className="w-8 h-8" />,
      href: '/empresas',
      color: 'teal',
      features: ['Registrar empresas', 'Gestionar contactos', 'Configurar parámetros']
    },
    {
      title: 'Gestión de Participantes',
      description: 'Administrar base de datos de participantes',
      icon: <ParticipantesIcon className="w-8 h-8" />,
      href: '/participantes',
      color: 'pink',
      features: ['Registrar participantes', 'Categorizar perfiles', 'Gestionar consentimientos']
    },
    {
      title: 'Configuración de Investigaciones',
      description: 'Configurar parámetros y plantillas de investigaciones',
      icon: <InvestigacionesIcon className="w-8 h-8" />,
      href: '/investigaciones',
      color: 'indigo',
      features: ['Crear plantillas', 'Configurar flujos', 'Definir criterios']
    },
    {
      title: 'Configuración de Reclutamiento',
      description: 'Ajustar parámetros del proceso de reclutamiento',
      icon: <ReclutamientoIcon className="w-8 h-8" />,
      href: '/reclutamiento',
      color: 'green',
      features: ['Definir criterios', 'Configurar filtros', 'Gestionar campañas']
    },
    {
      title: 'Configuración de Sesiones',
      description: 'Configurar parámetros de sesiones de investigación',
      icon: <SesionesIcon className="w-8 h-8" />,
      href: '/sesiones',
      color: 'purple',
      features: ['Configurar salas', 'Definir protocolos', 'Gestionar recursos']
    },
    {
      title: 'Configuración de Métricas',
      description: 'Personalizar reportes y métricas del sistema',
      icon: <MetricasIcon className="w-8 h-8" />,
      href: '/metricas',
      color: 'orange',
      features: ['Definir KPIs', 'Configurar dashboards', 'Personalizar reportes']
    },
    {
      title: 'Gestión de Conocimiento',
      description: 'Administrar base de conocimiento y documentación',
      icon: <ConocimientoIcon className="w-8 h-8" />,
      href: '/conocimiento',
      color: 'gray',
      features: ['Crear artículos', 'Organizar categorías', 'Gestionar versiones']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: theme === 'dark' ? 'text-gray-400 bg-gray-800 bg-opacity-50' : 'text-gray-600 bg-gray-50',
      teal: theme === 'dark' ? 'text-teal-400 bg-teal-900 bg-opacity-20' : 'text-teal-600 bg-teal-50',
      pink: theme === 'dark' ? 'text-pink-400 bg-pink-900 bg-opacity-20' : 'text-pink-600 bg-pink-50',
      indigo: theme === 'dark' ? 'text-indigo-400 bg-indigo-900 bg-opacity-20' : 'text-indigo-600 bg-indigo-50',
      green: theme === 'dark' ? 'text-green-400 bg-green-900 bg-opacity-20' : 'text-green-600 bg-green-50',
      purple: theme === 'dark' ? 'text-purple-400 bg-purple-900 bg-opacity-20' : 'text-purple-600 bg-purple-50',
      orange: theme === 'dark' ? 'text-orange-400 bg-orange-900 bg-opacity-20' : 'text-orange-600 bg-orange-50',
      gray: theme === 'dark' ? 'text-gray-400 bg-gray-900 bg-opacity-20' : 'text-gray-600 bg-gray-50'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900 bg-opacity-20' : 'bg-gray-50'} mt-1`}>
                <ConfiguracionesIcon className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <Typography variant="h1" color="title" weight="bold">
                  Configuraciones
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Administra la configuración del sistema
                </Typography>
              </div>
            </div>
          </div>

          {/* Configuraciones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configuraciones.map((config, index) => (
              <Card 
                key={index}
                variant="elevated" 
                padding="lg"
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getColorClasses(config.color)}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <Typography variant="h4" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {config.title}
                      </Typography>
                      <Typography variant="body2" color="secondary" className="mt-1">
                        {config.description}
                      </Typography>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <Typography variant="body2" weight="medium" color="title">
                      Funcionalidades:
                    </Typography>
                    <ul className="space-y-1">
                      {config.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                          <Typography variant="body2" color="secondary">
                            {feature}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(config.href)}
                      className="w-full"
                    >
                      Configurar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <Typography variant="h2" color="title" weight="semibold" className="mb-6">
              Acciones Rápidas
            </Typography>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/configuraciones/gestion-usuarios')}
              >
                Gestionar Usuarios
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={() => router.push('/empresas')}
              >
                Configurar Empresas
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 