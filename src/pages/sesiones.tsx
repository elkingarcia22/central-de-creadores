import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button, Chip } from '../components/ui';
import { 
  SesionesIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  DocumentIcon,
  MetricasIcon
} from '../components/icons';
import { getEstadoSesionVariant, getEstadoSesionText } from '../utils/estadoUtils';

export default function SesionesPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Datos simulados de sesiones
  const sesiones = [
    {
      id: 1,
      titulo: 'Sesión 1 - Test de Usabilidad E-commerce',
      descripcion: 'Evaluación de la experiencia de usuario en proceso de compra',
      estado: 'programada',
      fecha: '2024-02-15',
      hora: '14:00',
      duracion: 60,
      participantes: 3,
      investigacion: 'Estudio de Usabilidad de E-commerce',
      tipo: 'usabilidad',
      moderador: 'Ana García',
      sala: 'Sala Virtual A'
    },
    {
      id: 2,
      titulo: 'Sesión 2 - Entrevista App Bancaria',
      descripcion: 'Entrevista en profundidad sobre uso de aplicaciones bancarias',
      estado: 'en_curso',
      fecha: '2024-02-14',
      hora: '10:30',
      duracion: 45,
      participantes: 1,
      investigacion: 'Investigación de Mercado - Productos Fintech',
      tipo: 'entrevista',
      moderador: 'Carlos López',
      sala: 'Sala Virtual B'
    },
    {
      id: 3,
      titulo: 'Sesión 3 - Test de Concepto Salud',
      descripcion: 'Validación de concepto para app de seguimiento de salud mental',
      estado: 'completada',
      fecha: '2024-02-10',
      hora: '16:00',
      duracion: 90,
      participantes: 2,
      investigacion: 'Test de Concepto - App de Salud',
      tipo: 'concepto',
      moderador: 'María Rodríguez',
      sala: 'Sala Virtual C'
    },
    {
      id: 4,
      titulo: 'Sesión 4 - Evaluación Accesibilidad',
      descripcion: 'Test de accesibilidad en portal web gubernamental',
      estado: 'programada',
      fecha: '2024-02-18',
      hora: '11:00',
      duracion: 75,
      participantes: 1,
      investigacion: 'Estudio de Accesibilidad Web',
      tipo: 'accesibilidad',
      moderador: 'Luis Martínez',
      sala: 'Sala Virtual D'
    }
  ];



  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'usabilidad': return 'primary';
      case 'entrevista': return 'success';
      case 'concepto': return 'secondary';
      case 'accesibilidad': return 'warning';
      default: return 'default';
    }
  };

  const filteredSesiones = sesiones.filter(sesion => {
    const matchesSearch = sesion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sesion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sesion.investigacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sesion.moderador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || sesion.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sesionesHoy = sesiones.filter(sesion => {
    const hoy = new Date().toISOString().split('T')[0];
    return sesion.fecha === hoy;
  });

  const sesionesEstaSemana = sesiones.filter(sesion => {
    const hoy = new Date();
    const fechaSesion = new Date(sesion.fecha);
    const diffTime = fechaSesion.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-warning/10'} mt-1`}>
                  <SesionesIcon className="w-8 h-8 text-warning" />
                </div>
                <div>
                              <Typography variant="h2" color="title" weight="semibold">
              Sesiones
            </Typography>
                  <Typography variant="subtitle1" color="secondary">
                    Gestionar sesiones de investigación y testing
                  </Typography>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/sesiones/nueva')}
              >
                Nueva Sesión
              </Button>
            </div>
          </div>

        {/* Filtros y Búsqueda */}
        <Card variant="elevated" padding="md" className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
              <input
                type="text"
                placeholder="Buscar sesiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className={`w-5 h-5 text-muted-foreground`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              >
                <option value="todos">Todos los estados</option>
                <option value="programada">Programadas</option>
                <option value="en_curso">En Curso</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {sesiones.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Sesiones
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-secondary/10'}`}>
                <SesionesIcon className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {sesionesHoy.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Hoy
                </Typography>
              </div>
              <div className="p-3 rounded-lg bg-card">
                <DocumentIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {sesionesEstaSemana.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Esta Semana
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-success/10'}`}>
                <MetricasIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {sesiones.filter(sesion => sesion.estado === 'en_curso').length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  En Curso
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-warning/10'}`}>
                <UserIcon className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Sesiones */}
        <div className="space-y-6">
          {filteredSesiones.map((sesion) => (
            <Card 
              key={sesion.id}
              variant="elevated" 
              padding="lg"
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/sesiones/${sesion.id}`)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h4" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {sesion.titulo}
                      </Typography>
                      <Chip 
                        variant={getEstadoSesionVariant(sesion.estado)}
                        size="sm"
                      >
                        {getEstadoSesionText(sesion.estado)}
                      </Chip>
                      <Chip 
                        variant={getTipoColor(sesion.tipo)}
                        size="sm"
                      >
                        {sesion.tipo}
                      </Chip>
                    </div>
                    <Typography variant="body1" color="secondary" className="mb-3">
                      {sesion.descripcion}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Investigación: {sesion.investigacion}
                    </Typography>
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Fecha
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {new Date(sesion.fecha).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Hora
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {sesion.hora}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Participantes
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {sesion.participantes}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MetricasIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Duración
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {sesion.duracion} min
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" color="secondary">
                      Moderador: {sesion.moderador}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Sala: {sesion.sala}
                    </Typography>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/sesiones/${sesion.id}`)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/sesiones/${sesion.id}/editar`)}
                  >
                    Editar
                  </Button>
                  {sesion.estado === 'programada' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => router.push(`/sesiones/${sesion.id}/iniciar`)}
                    >
                      Iniciar
                    </Button>
                  )}
                  {sesion.estado === 'en_curso' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/sesiones/${sesion.id}/grabacion`)}
                    >
                      Ver Grabación
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredSesiones.length === 0 && (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="space-y-4">
              <SesionesIcon className="w-16 h-16 mx-auto text-gray-400" />
              <Typography variant="h4" color="secondary" weight="medium">
                No se encontraron sesiones
              </Typography>
              <Typography variant="body1" color="secondary">
                {searchTerm || filterStatus !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primera sesión de investigación'
                }
              </Typography>
              {!searchTerm && filterStatus === 'todos' && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/sesiones/nueva')}
                >
                  Crear Sesión
                </Button>
              )}
            </div>
          </Card>
        )}
        </div>
      </div>
    </Layout>
  );
} 