import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button, Chip } from '../components/ui';
import { 
  MetricasIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  DocumentIcon,
  InvestigacionesIcon,
  SesionesIcon
} from '../components/icons';
import { getEstadoMetricaVariant, getEstadoMetricaText } from '../utils/estadoUtils';

export default function MetricasPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  // Datos simulados de métricas
  const metricas = {
    totalInvestigaciones: 12,
    investigacionesActivas: 8,
    totalSesiones: 45,
    sesionesCompletadas: 38,
    totalParticipantes: 156,
    participantesNuevos: 23,
    tasaCompletitud: 84.4,
    satisfaccionPromedio: 4.2,
    tiempoPromedioSesion: 52,
    presupuestoUtilizado: 28500,
    presupuestoTotal: 35000
  };

  const reportes = [
    {
      id: 1,
      titulo: 'Reporte Mensual - Enero 2024',
      descripcion: 'Análisis completo de métricas y KPIs del mes de enero',
      tipo: 'mensual',
      fecha: '2024-01-31',
      estado: 'generado',
      descargas: 15,
      tamaño: '2.3 MB'
    },
    {
      id: 2,
      titulo: 'Reporte Trimestral Q4 2023',
      descripcion: 'Resumen ejecutivo del cuarto trimestre del año',
      tipo: 'trimestral',
      fecha: '2023-12-31',
      estado: 'generado',
      descargas: 8,
      tamaño: '4.1 MB'
    },
    {
      id: 3,
      titulo: 'Análisis de Usabilidad - E-commerce',
      descripcion: 'Resultados detallados del estudio de usabilidad',
      tipo: 'especifico',
      fecha: '2024-02-10',
      estado: 'generado',
      descargas: 12,
      tamaño: '1.8 MB'
    },
    {
      id: 4,
      titulo: 'Reporte de Participantes - Febrero 2024',
      descripcion: 'Estadísticas de reclutamiento y participación',
      tipo: 'participantes',
      fecha: '2024-02-15',
      estado: 'en_proceso',
      descargas: 0,
      tamaño: '0 MB'
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'mensual': return 'primary';
      case 'trimestral': return 'success';
      case 'especifico': return 'secondary';
      case 'participantes': return 'warning';
      default: return 'default';
    }
  };



  const progresoPresupuesto = (metricas.presupuestoUtilizado / metricas.presupuestoTotal) * 100;

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900 bg-opacity-20' : 'bg-destructive/10'} mt-1`}>
                  <MetricasIcon className="w-8 h-8 text-destructive" />
                </div>
                <div>
                              <Typography variant="h2" color="title" weight="semibold">
              Métricas
            </Typography>
                  <Typography variant="subtitle1" color="secondary">
                    Análisis y reportes de rendimiento
                  </Typography>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/metricas/nuevo-reporte')}
              >
                Nuevo Reporte
              </Button>
            </div>
          </div>

        {/* Filtro de período */}
        <Card variant="elevated" padding="md" className="mb-6">
          <div className="flex items-center gap-4">
            <FilterIcon className={`w-5 h-5 text-muted-foreground`} />
            <Typography variant="body1" color="secondary">
              Período:
            </Typography>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="año">Este Año</option>
            </select>
          </div>
        </Card>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-900 dark:text-gray-100">
                  {metricas.totalInvestigaciones}
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

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-900 dark:text-gray-100">
                  {metricas.totalSesiones}
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

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-900 dark:text-gray-100">
                  {metricas.totalParticipantes}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Participantes
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className="text-gray-900 dark:text-gray-100">
                  {metricas.tasaCompletitud}%
                </Typography>
                <Typography variant="body2" color="secondary">
                  Tasa Completitud
                </Typography>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                <MetricasIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Métricas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Métricas de Rendimiento */}
          <Card variant="elevated" padding="lg">
            <Typography variant="h3" color="title" weight="semibold" className="mb-4">
              Rendimiento
            </Typography>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="body1" color="secondary">
                  Sesiones Completadas
                </Typography>
                <Typography variant="body1" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {metricas.sesionesCompletadas}/{metricas.totalSesiones}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body1" color="secondary">
                  Satisfacción Promedio
                </Typography>
                <Typography variant="body1" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {metricas.satisfaccionPromedio}/5.0
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body1" color="secondary">
                  Tiempo Promedio Sesión
                </Typography>
                <Typography variant="body1" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {metricas.tiempoPromedioSesion} min
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body1" color="secondary">
                  Participantes Nuevos
                </Typography>
                <Typography variant="body1" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {metricas.participantesNuevos}
                </Typography>
              </div>
            </div>
          </Card>

          {/* Presupuesto */}
          <Card variant="elevated" padding="lg">
            <Typography variant="h3" color="title" weight="semibold" className="mb-4">
              Presupuesto
            </Typography>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="body1" color="secondary">
                  Utilizado
                </Typography>
                <Typography variant="body1" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  ${metricas.presupuestoUtilizado.toLocaleString()}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body1" color="secondary">
                  Total
                </Typography>
                <Typography variant="body1" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  ${metricas.presupuestoTotal.toLocaleString()}
                </Typography>
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="body2" color="secondary">
                    Progreso
                  </Typography>
                  <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {Math.round(progresoPresupuesto)}%
                  </Typography>
                </div>
                <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-2 rounded-full bg-success transition-all duration-300"
                    style={{ width: `${progresoPresupuesto}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Reportes */}
        <div className="mb-8">
          <Typography variant="h2" color="title" weight="semibold" className="mb-6">
            Reportes Disponibles
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportes.map((reporte) => (
              <Card 
                key={reporte.id}
                variant="elevated" 
                padding="lg"
                className="hover: transition-colors duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Typography variant="h4" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {reporte.titulo}
                        </Typography>
                        <Chip 
                          variant={getEstadoMetricaVariant(reporte.estado)}
                          size="sm"
                        >
                          {getEstadoMetricaText(reporte.estado)}
                        </Chip>
                      </div>
                      <Typography variant="body1" color="secondary" className="mb-3">
                        {reporte.descripcion}
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography variant="body2" color="secondary">
                        Fecha
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {new Date(reporte.fecha).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="secondary">
                        Descargas
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {reporte.descargas}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {reporte.estado === 'generado' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/metricas/descargar/${reporte.id}`)}
                      >
                        Descargar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/metricas/reporte/${reporte.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div>
          <Typography variant="h2" color="title" weight="semibold" className="mb-6">
            Acciones Rápidas
          </Typography>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/metricas/generar-reporte')}
            >
              Generar Reporte Personalizado
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={() => router.push('/metricas/exportar-datos')}
            >
              Exportar Datos
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push('/metricas/configuracion')}
            >
              Configurar Alertas
            </Button>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
} 