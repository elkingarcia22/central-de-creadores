import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { PageHeader } from '../../components/ui';
import SesionesCalendar from '../../components/sesiones/SesionesCalendar';
import { SesionEvent } from '../../types/sesiones';
import { 
  CalendarIcon, 
  PlusIcon, 
  ListIcon,
  BarChartIcon,
  SettingsIcon
} from '../../components/icons';

const SesionesPage: NextPage = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'stats'>('calendar');

  // Manejar click en sesión
  const handleSesionClick = (sesion: SesionEvent) => {
    router.push(`/sesiones/${sesion.id}`);
  };

  // Manejar crear nueva sesión
  const handleSesionCreate = (date?: Date) => {
    const params = new URLSearchParams();
    if (date) {
      params.append('fecha', date.toISOString());
    }
    router.push(`/sesiones/nueva?${params.toString()}`);
  };

  // Manejar editar sesión
  const handleSesionEdit = (sesion: SesionEvent) => {
    router.push(`/sesiones/${sesion.id}/editar`);
  };

  // Manejar eliminar sesión
  const handleSesionDelete = (sesion: SesionEvent) => {
    // Aquí se puede implementar un modal de confirmación
    console.log('Eliminar sesión:', sesion.id);
  };

  // Navegación entre vistas
  const viewTabs = [
    {
      id: 'calendar',
      label: 'Calendario',
      icon: <CalendarIcon className="w-4 h-4" />,
      description: 'Vista de calendario con todas las sesiones'
    },
    {
      id: 'list',
      label: 'Lista',
      icon: <ListIcon className="w-4 h-4" />,
      description: 'Lista detallada de sesiones'
    },
    {
      id: 'stats',
      label: 'Estadísticas',
      icon: <BarChartIcon className="w-4 h-4" />,
      description: 'Estadísticas y métricas de sesiones'
    }
  ];

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title="Sesiones"
          description="Gestiona y programa sesiones de investigación"
          icon={<CalendarIcon className="w-6 h-6" />}
          actions={[
            {
              label: 'Nueva Sesión',
              icon: <PlusIcon className="w-4 h-4" />,
              onClick: () => handleSesionCreate(),
              variant: 'primary' as const
            },
            {
              label: 'Configuración',
              icon: <SettingsIcon className="w-4 h-4" />,
              onClick: () => router.push('/sesiones/configuracion'),
              variant: 'outline' as const
            }
          ]}
        />

        {/* Navegación de vistas */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  ${activeView === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido según vista activa */}
        <div className="min-h-[600px]">
          {activeView === 'calendar' && (
            <SesionesCalendar
              onSesionClick={handleSesionClick}
              onSesionCreate={handleSesionCreate}
              onSesionEdit={handleSesionEdit}
              onSesionDelete={handleSesionDelete}
            />
          )}
          
          {activeView === 'list' && (
            <div className="text-center py-12">
              <ListIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vista de Lista</h3>
              <p className="text-muted-foreground mb-4">
                La vista de lista estará disponible próximamente
              </p>
              <button
                onClick={() => setActiveView('calendar')}
                className="text-primary hover:underline"
              >
                Ver en calendario
              </button>
            </div>
          )}
          
          {activeView === 'stats' && (
            <div className="text-center py-12">
              <BarChartIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Estadísticas</h3>
              <p className="text-muted-foreground mb-4">
                Las estadísticas detalladas estarán disponibles próximamente
              </p>
              <button
                onClick={() => setActiveView('calendar')}
                className="text-primary hover:underline"
              >
                Ver en calendario
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SesionesPage;
