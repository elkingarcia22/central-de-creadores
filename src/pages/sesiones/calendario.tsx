import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '../../components/ui';
import { PageHeader } from '../../components/ui';
import SesionesCalendar from '../../components/sesiones/SesionesCalendar';
import { Sesion } from '../../types/sesiones';
import { 
  CalendarIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  SettingsIcon
} from '../../components/icons';

const CalendarioSesionesPage: NextPage = () => {
  const router = useRouter();
  const { investigacion_id } = router.query;

  // Manejar click en sesión
  const handleSesionClick = (sesion: Sesion) => {
    router.push(`/sesiones/${sesion.id}`);
  };

  // Manejar crear nueva sesión
  const handleSesionCreate = (date?: Date) => {
    const params = new URLSearchParams();
    if (date) {
      params.append('fecha', date.toISOString());
    }
    if (investigacion_id) {
      params.append('investigacion_id', investigacion_id as string);
    }
    router.push(`/sesiones/nueva?${params.toString()}`);
  };

  // Manejar editar sesión
  const handleSesionEdit = (sesion: Sesion) => {
    router.push(`/sesiones/${sesion.id}/editar`);
  };

  // Manejar eliminar sesión
  const handleSesionDelete = (sesion: Sesion) => {
    // Aquí se puede implementar un modal de confirmación
    console.log('Eliminar sesión:', sesion.id);
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title="Calendario de Sesiones"
          description="Vista completa del calendario con todas las sesiones programadas"
          icon={<CalendarIcon className="w-6 h-6" />}
          actions={[
            {
              label: 'Volver a Sesiones',
              icon: <ArrowLeftIcon className="w-4 h-4" />,
              onClick: () => router.push('/sesiones'),
              variant: 'outline' as const
            },
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

        {/* Calendario */}
        <SesionesCalendar
          investigacionId={investigacion_id as string}
          onSesionClick={handleSesionClick}
          onSesionCreate={handleSesionCreate}
          onSesionEdit={handleSesionEdit}
          onSesionDelete={handleSesionDelete}
        />
      </div>
    </Layout>
  );
};

export default CalendarioSesionesPage;
