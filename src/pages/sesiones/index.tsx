import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout, PageHeader, Tabs, Subtitle, Typography, Badge } from '../../components/ui';
import { CalendarIcon, PlusIcon, ListIcon, BarChartIcon } from '../../components/icons';
import { Sesion } from '../../types/sesiones';

const SesionesPage: NextPage = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'stats'>('list');
  const [activeTab, setActiveTab] = useState<'todas' | 'programada' | 'en_curso' | 'completada' | 'cancelada'>('todas');
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar sesiones reales de la API
  useEffect(() => {
    const cargarSesiones = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando sesiones de reclutamiento...');
        
        const response = await fetch('/api/sesiones-reclutamiento');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Respuesta completa:', data);
        console.log('📊 Número de sesiones:', data.sesiones?.length || 0);
        
        if (data.sesiones && Array.isArray(data.sesiones)) {
          console.log('✅ Estableciendo sesiones:', data.sesiones.length);
          setSesiones(data.sesiones);
        } else {
          console.log('⚠️ No hay sesiones en la respuesta');
          setSesiones([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error cargando sesiones:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las sesiones');
        setLoading(false);
      }
    };

    cargarSesiones();
  }, []);

  // Filtrar sesiones por estado
  const getSesionesPorEstado = (estado: string) => {
    if (estado === 'todas') return sesiones;
    return sesiones.filter(sesion => sesion.estado === estado);
  };

  // Contar sesiones por estado
  const contarSesiones = (estado: string) => {
    return getSesionesPorEstado(estado).length;
  };

  // Formatear fecha
  const formatFecha = (fecha: Date | string | null) => {
    if (!fecha) return 'Sin fecha';
    
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fechaObj);
    } catch (error) {
      return 'Error en fecha';
    }
  };

  // Componente de card simple
  const SesionCardSimple = ({ sesion }: { sesion: Sesion }) => (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {sesion.investigacion_nombre || 'Sin investigación'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {sesion.titulo}
          </p>
        </div>
        <Badge 
          variant={
            sesion.estado === 'completada' ? 'green' :
            sesion.estado === 'en_curso' ? 'orange' :
            sesion.estado === 'programada' ? 'blue' :
            sesion.estado === 'cancelada' ? 'red' : 'default'
          }
        >
          {sesion.estado}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Fecha y Hora</p>
          <p className="text-sm font-medium">{formatFecha(sesion.fecha_programada)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Participante</p>
          <p className="text-sm font-medium">
            {sesion.titulo?.split(' - ')[0] || 'Sin participante'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Empresa</p>
          <p className="text-sm font-medium">
            {sesion.ubicacion || 'Sin empresa'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Duración</p>
          <p className="text-sm font-medium">
            {sesion.duracion_minutos ? `${Math.floor(sesion.duracion_minutos / 60)}h ${sesion.duracion_minutos % 60}m` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          onClick={() => router.push(`/participacion/${sesion.id}`)}
        >
          Ver Participación
        </button>
        <button
          className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          onClick={() => console.log('Editar sesión:', sesion.id)}
        >
          Editar
        </button>
        <button
          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
          onClick={() => console.log('Ingresar a sesión:', sesion.id)}
        >
          Ingresar
        </button>
        <button
          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          onClick={() => console.log('Eliminar sesión:', sesion.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <PageHeader
          title="Sesiones"
          subtitle="Gestiona y programa sesiones de investigación y testing"
          color="blue"
          primaryAction={{
            label: "Nueva Sesión",
            onClick: () => router.push('/sesiones/nueva'),
            variant: "primary",
            icon: <PlusIcon className="w-4 h-4" />
          }}
        />

        {/* Navegación de vistas */}
        <Tabs
          items={[
            { value: 'calendar', label: 'Calendario' },
            { value: 'list', label: 'Lista' },
            { value: 'stats', label: 'Estadísticas' }
          ]}
          value={activeView}
          onValueChange={(value) => setActiveView(value as 'calendar' | 'list' | 'stats')}
          variant="underline"
          className="mb-6"
        />

        {/* Contenido según vista activa */}
        <div className="min-h-[600px]">
          {activeView === 'calendar' && (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vista de Calendario</h3>
              <p className="text-muted-foreground mb-4">Aquí se mostrará el calendario de sesiones.</p>
            </div>
          )}

          {activeView === 'list' && (
            <div className="space-y-6">
              {/* Header con estadísticas */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Subtitle>
                    Sesiones Programadas
                  </Subtitle>
                  <Typography variant="body2" color="secondary">
                    {loading ? 'Cargando...' : `${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''} programada${sesiones.length !== 1 ? 's' : ''}`}
                  </Typography>
                </div>
              </div>

              {/* Estado de carga */}
              {loading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse bg-gray-50 dark:bg-gray-800">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Estado de error */}
              {error && (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Error al cargar sesiones</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* Estado vacío */}
              {!loading && !error && sesiones.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay sesiones</h3>
                  <p className="text-muted-foreground mb-4">Aún no se han programado sesiones de investigación</p>
                  <button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                    onClick={() => router.push('/sesiones/nueva')}
                  >
                    Crear primera sesión
                  </button>
                </div>
              )}

              {/* Tabs por estado */}
              {!loading && !error && sesiones.length > 0 && (
                <div>
                  <Tabs
                    items={[
                      { value: 'todas', label: 'Todas', count: contarSesiones('todas') },
                      { value: 'programada', label: 'Programadas', count: contarSesiones('programada') },
                      { value: 'en_curso', label: 'En Curso', count: contarSesiones('en_curso') },
                      { value: 'completada', label: 'Completadas', count: contarSesiones('completada') },
                      { value: 'cancelada', label: 'Canceladas', count: contarSesiones('cancelada') }
                    ]}
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as any)}
                    variant="underline"
                    className="mb-6"
                  />

                  {/* Cards de sesiones filtradas */}
                  <div className="space-y-4">
                    {getSesionesPorEstado(activeTab).map((sesion) => (
                      <SesionCardSimple key={sesion.id} sesion={sesion} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'stats' && (
            <div className="text-center py-12">
              <BarChartIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vista de Estadísticas</h3>
              <p className="text-muted-foreground mb-4">Aquí se mostrarán las estadísticas de sesiones.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SesionesPage;