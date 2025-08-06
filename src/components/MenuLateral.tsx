import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import {
  DashboardIcon,
  InvestigacionesIcon,
  ReclutamientoIcon,
  SesionesIcon,
  MetricasIcon,
  ConfiguracionesIcon,
  ConocimientoIcon
} from './icons';

const opcionesPorRol = {
  administrador: [
    { label: 'Investigaciones', href: '/investigaciones' },
    { label: 'Reclutamiento', href: '/reclutamiento' },
    { label: 'Sesiones', href: '/sesiones' },
    { label: 'Métricas', href: '/metricas' },
    { label: 'Participantes', href: '/participantes' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Configuraciones', href: '/configuraciones' },
    { label: 'Conocimiento', href: '/conocimiento' },
  ],
  investigador: [
    { label: 'Investigaciones', href: '/investigaciones' },
    { label: 'Sesiones', href: '/sesiones' },
    { label: 'Métricas', href: '/metricas' },
    { label: 'Participantes', href: '/participantes' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Conocimiento', href: '/conocimiento' },
  ],
  reclutador: [
    { label: 'Reclutamiento', href: '/reclutamiento' },
    { label: 'Participantes', href: '/participantes' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Configuraciones', href: '/configuraciones' },
    { label: 'Conocimiento', href: '/conocimiento' },
  ],
};

const MenuLateral: React.FC = () => {
  const { rolSeleccionado } = useRol();
  const router = useRouter();
  const opciones = opcionesPorRol[rolSeleccionado?.toLowerCase()] || [];

  // Función para renderizar el icono correcto según el tipo
  const renderIcon = (label: string) => {
    switch (label) {
      case 'Dashboard':
        return <DashboardIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      case 'Investigaciones':
        return <InvestigacionesIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      case 'Reclutamiento':
        return <ReclutamientoIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      case 'Sesiones':
        return <SesionesIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      case 'Métricas':
        return <MetricasIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      case 'Configuraciones':
        return <ConfiguracionesIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      case 'Conocimiento':
        return <ConocimientoIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
      default:
        return <DashboardIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-200" />;
    }
  };

  return (
    <aside className="h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col py-8 px-4">
              <h2 className="text-lg font-bold mb-8 text-center text-primary">Central de creadores</h2>
      <nav className="flex flex-col gap-2">
        {opciones.map((op) => (
          <Link
            key={op.href}
            href={op.href}
            className={`px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center
              ${router.pathname === op.href ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            {renderIcon(op.label)}
            {op.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default MenuLateral; 