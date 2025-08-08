import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button, Chip } from '../components/ui';
import { 
  ParticipantesIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  DocumentIcon,
  MetricasIcon
} from '../components/icons';

export default function ParticipantesPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Datos simulados de participantes
  const participantes = [
    {
      id: 1,
      nombre: 'Ana García López',
      email: 'ana.garcia@email.com',
      telefono: '+1 (555) 123-4567',
      edad: 28,
      genero: 'femenino',
      ubicacion: 'Madrid, España',
      profesion: 'Diseñadora UX',
      estado: 'activo',
      sesionesCompletadas: 5,
      sesionesPendientes: 2,
      fechaRegistro: '2023-11-15',
      ultimaActividad: '2024-02-10',
      preferencias: ['usabilidad', 'fintech']
    },
    {
      id: 2,
      nombre: 'Carlos Rodríguez Martín',
      email: 'carlos.rodriguez@email.com',
      telefono: '+1 (555) 987-6543',
      edad: 35,
      genero: 'masculino',
      ubicacion: 'Barcelona, España',
      profesion: 'Desarrollador Frontend',
      estado: 'activo',
      sesionesCompletadas: 8,
      sesionesPendientes: 0,
      fechaRegistro: '2023-09-20',
      ultimaActividad: '2024-02-12',
      preferencias: ['tecnología', 'salud']
    },
    {
      id: 3,
      nombre: 'María Fernández Silva',
      email: 'maria.fernandez@email.com',
      telefono: '+1 (555) 456-7890',
      edad: 42,
      genero: 'femenino',
      ubicacion: 'Valencia, España',
      profesion: 'Product Manager',
      estado: 'inactivo',
      sesionesCompletadas: 3,
      sesionesPendientes: 1,
      fechaRegistro: '2023-12-05',
      ultimaActividad: '2024-01-15',
      preferencias: ['fintech', 'gobierno']
    },
    {
      id: 4,
      nombre: 'Luis Martínez Pérez',
      email: 'luis.martinez@email.com',
      telefono: '+1 (555) 321-0987',
      edad: 31,
      genero: 'masculino',
      ubicacion: 'Sevilla, España',
      profesion: 'Analista de Datos',
      estado: 'activo',
      sesionesCompletadas: 12,
      sesionesPendientes: 3,
      fechaRegistro: '2023-08-10',
      ultimaActividad: '2024-02-14',
      preferencias: ['tecnología', 'usabilidad']
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'danger';
      case 'pendiente': return 'warning';
      case 'bloqueado': return 'default';
      default: return 'default';
    }
  };

  const getGeneroColor = (genero: string) => {
    switch (genero) {
      case 'femenino': return 'secondary';
      case 'masculino': return 'primary';
      case 'otro': return 'info';
      default: return 'default';
    }
  };

  const getEdadColor = (edad: number) => {
    if (edad < 25) return 'info';
    if (edad < 35) return 'primary';
    if (edad < 45) return 'warning';
    return 'secondary';
  };

  const filteredParticipantes = participantes.filter(participante => {
    const matchesSearch = participante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participante.profesion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participante.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || participante.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const participantesActivos = participantes.filter(p => p.estado === 'activo').length;
  const totalSesionesCompletadas = participantes.reduce((sum, p) => sum + p.sesionesCompletadas, 0);
  const totalSesionesPendientes = participantes.reduce((sum, p) => sum + p.sesionesPendientes, 0);

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-secondary/10'} mt-1`}>
                  <ParticipantesIcon className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <Typography variant="h2" color="title" weight="bold">
                    Participantes
                  </Typography>
                  <Typography variant="subtitle1" color="secondary">
                    Gestionar participantes de investigaciones
                  </Typography>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/participantes/nuevo')}
              >
                Nuevo Participante
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
                placeholder="Buscar participantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className={`w-5 h-5 text-muted-foreground`} />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
                <option value="pendiente">Pendientes</option>
                <option value="bloqueado">Bloqueados</option>
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
                  {participantes.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Participantes
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-pink-900 bg-opacity-20' : 'bg-pink-50'}`}>
                <ParticipantesIcon className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {participantesActivos}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Activos
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                <UserIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {totalSesionesCompletadas}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Sesiones Completadas
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
                  {totalSesionesPendientes}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Sesiones Pendientes
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-50'}`}>
                <MetricasIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Participantes */}
        <div className="space-y-6">
          {filteredParticipantes.map((participante) => (
            <Card 
              key={participante.id}
              variant="elevated" 
              padding="lg"
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/participantes/${participante.id}`)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h4" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {participante.nombre}
                      </Typography>
                      <Chip 
                        variant={getEstadoColor(participante.estado)}
                        size="sm"
                      >
                        {participante.estado}
                      </Chip>
                      <Chip 
                        variant={getGeneroColor(participante.genero)}
                        size="sm"
                      >
                        {participante.genero}
                      </Chip>
                      <Chip 
                        variant={getEdadColor(participante.edad)}
                        size="sm"
                      >
                        {participante.edad} años
                      </Chip>
                    </div>
                    <Typography variant="body1" color="secondary" className="mb-3">
                      {participante.profesion} • {participante.ubicacion}
                    </Typography>
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {participante.email}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {participante.telefono}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MetricasIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Sesiones Completadas
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {participante.sesionesCompletadas}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ParticipantesIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Sesiones Pendientes
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {participante.sesionesPendientes}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Preferencias */}
                <div>
                  <Typography variant="body2" color="secondary" className="mb-2">
                    Preferencias:
                  </Typography>
                  <div className="flex gap-2 flex-wrap">
                    {participante.preferencias.map((preferencia, index) => (
                      <Chip 
                        key={index}
                        variant="default"
                        size="sm"
                      >
                        {preferencia}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" color="secondary">
                      Registro: {new Date(participante.fechaRegistro).toLocaleDateString()}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Última actividad: {new Date(participante.ultimaActividad).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/participantes/${participante.id}`)}
                  >
                    Ver Perfil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/participantes/${participante.id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/participantes/${participante.id}/sesiones`)}
                  >
                    Sesiones
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredParticipantes.length === 0 && (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="space-y-4">
              <ParticipantesIcon className="w-16 h-16 mx-auto text-gray-400" />
              <Typography variant="h4" color="secondary" weight="medium">
                No se encontraron participantes
              </Typography>
              <Typography variant="body1" color="secondary">
                {searchTerm || filterEstado !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza registrando tu primer participante'
                }
              </Typography>
              {!searchTerm && filterEstado === 'todos' && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/participantes/nuevo')}
                >
                  Registrar Participante
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