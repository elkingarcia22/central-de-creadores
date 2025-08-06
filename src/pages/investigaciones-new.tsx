import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout, Button, Typography, Card } from '../components/ui';
import { InvestigacionesIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { 
  obtenerInvestigaciones, 
  eliminarInvestigacion 
} from '../api/supabase-investigaciones';
import { 
  Investigacion,
  getColorEstadoInvestigacion,
  getColorTipoPrueba
} from '../types/supabase-investigaciones';

const InvestigacionesPage: NextPage = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [investigaciones, setInvestigaciones] = useState<Investigacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarInvestigaciones = async () => {
    try {
      setLoading(true);
      const response = await obtenerInvestigaciones();
      
      if (response.error) {
        showError('Error cargando datos', response.error);
        return;
      }
      
      setInvestigaciones(response.data);
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
      showError('Error cargando datos', 'No se pudieron cargar las investigaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInvestigaciones();
  }, []);

  const handleDelete = async (investigacion: Investigacion) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la investigación "${investigacion.nombre}"?`)) {
      return;
    }
    
    try {
      const response = await eliminarInvestigacion(investigacion.id);
      
      if (response.error) {
        showError('Error al eliminar', response.error);
        return;
      }
      
      showSuccess(
        'Investigación eliminada',
        `La investigación "${investigacion.nombre}" ha sido eliminada correctamente`
      );
      
      await cargarInvestigaciones();
    } catch (error) {
      console.error('Error eliminando investigación:', error);
      showError(
        'Error al eliminar',
        'No se pudo eliminar la investigación'
      );
    }
  };

  // Calcular estadísticas
  const stats = {
    total: investigaciones.length,
    enBorrador: investigaciones.filter(inv => inv.estado === 'en_borrador').length,
    enProgreso: investigaciones.filter(inv => inv.estado === 'en_progreso').length,
    finalizadas: investigaciones.filter(inv => inv.estado === 'finalizado').length,
  };

  return (
    <Layout>
      <div className="py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} mt-1`}>
                  <InvestigacionesIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <Typography variant="h1" color="title" weight="bold">
                    Investigaciones
                  </Typography>
                  <Typography variant="subtitle1" color="secondary">
                    Gestionar estudios y proyectos de investigación
                  </Typography>
                </div>
              </div>
              <Button
                onClick={() => router.push('/investigaciones/crear-new')}
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
              >
                <span>+</span>
                Crear Investigación
              </Button>
            </div>
          </div>

          {/* Estadísticas Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Investigaciones
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
                    {stats.enProgreso}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    En Progreso
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                  <InvestigacionesIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {stats.finalizadas}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Finalizadas
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'}`}>
                  <InvestigacionesIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {stats.enBorrador}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    En Borrador
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900 bg-opacity-20' : 'bg-gray-50'}`}>
                  <InvestigacionesIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabla de investigaciones */}
          <Card variant="elevated" padding="none">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <Typography variant="h3" weight="semibold">
                Lista de Investigaciones
              </Typography>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <Typography variant="body2" color="secondary">
                    Cargando investigaciones...
                  </Typography>
                </div>
              </div>
            ) : investigaciones.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <InvestigacionesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <Typography variant="h3" color="secondary" className="mb-2">
                    No hay investigaciones
                  </Typography>
                  <Typography variant="body2" color="secondary" className="mb-4">
                    Crea tu primera investigación para comenzar
                  </Typography>
                  <Button
                    onClick={() => router.push('/investigaciones/crear-new')}
                    variant="primary"
                  >
                    Crear Investigación
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-horizontal">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Responsable
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {investigaciones.map((investigacion) => (
                      <tr key={investigacion.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <Typography variant="body1" weight="medium">
                              {investigacion.nombre}
                            </Typography>
                            {investigacion.tipo_investigacion_nombre && (
                              <Typography variant="body2" color="secondary">
                                {investigacion.tipo_investigacion_nombre}
                              </Typography>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Typography variant="body2">
                            {investigacion.producto_nombre || 'Sin producto'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {investigacion.tipo_prueba && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorTipoPrueba(investigacion.tipo_prueba)}`}>
                              {investigacion.tipo_prueba}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorEstadoInvestigacion(investigacion.estado)}`}>
                            {investigacion.estado?.replace('_', ' ') || 'Sin estado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Typography variant="body2">
                            {investigacion.responsable_nombre || 'Sin asignar'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-gray-100">
                              {new Date(investigacion.fecha_inicio).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {new Date(investigacion.fecha_fin).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/investigaciones/${investigacion.id}`)}
                            >
                              Ver
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(investigacion)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InvestigacionesPage; 