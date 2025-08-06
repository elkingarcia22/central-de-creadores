import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button, Chip } from '../components/ui';
import { 
  EmpresasIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  DocumentIcon,
  MetricasIcon
} from '../components/icons';

export default function EmpresasPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('todos');

  // Datos simulados de empresas
  const empresas = [
    {
      id: 1,
      nombre: 'TechCorp Solutions',
      descripcion: 'Empresa líder en desarrollo de software y soluciones tecnológicas',
      sector: 'tecnología',
      tamaño: 'mediana',
      contacto: 'Juan Pérez',
      email: 'juan.perez@techcorp.com',
      telefono: '+1 (555) 123-4567',
      proyectos: 8,
      estado: 'activa',
      fechaRegistro: '2023-01-15'
    },
    {
      id: 2,
      nombre: 'FinanceHub International',
      descripcion: 'Plataforma financiera innovadora para servicios bancarios digitales',
      sector: 'fintech',
      tamaño: 'grande',
      contacto: 'María González',
      email: 'maria.gonzalez@financehub.com',
      telefono: '+1 (555) 987-6543',
      proyectos: 12,
      estado: 'activa',
      fechaRegistro: '2022-11-20'
    },
    {
      id: 3,
      nombre: 'HealthTech Innovations',
      descripcion: 'Desarrollo de aplicaciones móviles para el sector de la salud',
      sector: 'salud',
      tamaño: 'pequeña',
      contacto: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@healthtech.com',
      telefono: '+1 (555) 456-7890',
      proyectos: 5,
      estado: 'activa',
      fechaRegistro: '2023-03-10'
    },
    {
      id: 4,
      nombre: 'GovDigital Systems',
      descripcion: 'Soluciones digitales para entidades gubernamentales',
      sector: 'gobierno',
      tamaño: 'mediana',
      contacto: 'Ana Martínez',
      email: 'ana.martinez@govdigital.com',
      telefono: '+1 (555) 321-0987',
      proyectos: 6,
      estado: 'inactiva',
      fechaRegistro: '2022-08-05'
    }
  ];

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'tecnología': return 'primary';
      case 'fintech': return 'success';
      case 'salud': return 'secondary';
      case 'gobierno': return 'warning';
      default: return 'default';
    }
  };

  const getTamañoColor = (tamaño: string) => {
    switch (tamaño) {
      case 'pequeña': return 'info';
      case 'mediana': return 'warning';
      case 'grande': return 'success';
      default: return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'inactiva': return 'danger';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.contacto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSector === 'todos' || empresa.sector === filterSector;
    return matchesSearch && matchesFilter;
  });

  const totalProyectos = empresas.reduce((sum, empresa) => sum + empresa.proyectos, 0);
  const empresasActivas = empresas.filter(empresa => empresa.estado === 'activa').length;

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'} mt-1`}>
                  <EmpresasIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <Typography variant="h1" color="title" weight="bold">
                    Empresas
                  </Typography>
                  <Typography variant="subtitle1" color="secondary">
                    Gestionar empresas y organizaciones
                  </Typography>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/empresas/nueva')}
              >
                Nueva Empresa
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
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className={`w-5 h-5 text-muted-foreground`} />
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              >
                <option value="todos">Todos los sectores</option>
                <option value="tecnología">Tecnología</option>
                <option value="fintech">Fintech</option>
                <option value="salud">Salud</option>
                <option value="gobierno">Gobierno</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {empresas.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Empresas
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-teal-900 bg-opacity-20' : 'bg-teal-50'}`}>
                <EmpresasIcon className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {empresasActivas}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Empresas Activas
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
                <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {totalProyectos}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Proyectos
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
                <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {empresas.length > 0 ? Math.round(totalProyectos / empresas.length) : 0}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Promedio Proyectos
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-50'}`}>
                <MetricasIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Empresas */}
        <div className="space-y-6">
          {filteredEmpresas.map((empresa) => (
            <Card 
              key={empresa.id}
              variant="elevated" 
              padding="lg"
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/empresas/${empresa.id}`)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h4" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {empresa.nombre}
                      </Typography>
                      <Chip 
                        variant={getSectorColor(empresa.sector)}
                        size="sm"
                      >
                        {empresa.sector}
                      </Chip>
                      <Chip 
                        variant={getTamañoColor(empresa.tamaño)}
                        size="sm"
                      >
                        {empresa.tamaño}
                      </Chip>
                      <Chip 
                        variant={getEstadoColor(empresa.estado)}
                        size="sm"
                      >
                        {empresa.estado}
                      </Chip>
                    </div>
                    <Typography variant="body1" color="secondary" className="mb-3">
                      {empresa.descripcion}
                    </Typography>
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Contacto
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {empresa.contacto}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {empresa.email}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MetricasIcon className={`w-4 h-4 text-muted-foreground`} />
                    <div>
                      <Typography variant="body2" color="secondary">
                        Proyectos
                      </Typography>
                      <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {empresa.proyectos}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" color="secondary">
                      Teléfono: {empresa.telefono}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="secondary">
                      Registro: {new Date(empresa.fechaRegistro).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/empresas/${empresa.id}`)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/empresas/${empresa.id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/empresas/${empresa.id}/proyectos`)}
                  >
                    Proyectos
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredEmpresas.length === 0 && (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="space-y-4">
              <EmpresasIcon className="w-16 h-16 mx-auto text-gray-400" />
              <Typography variant="h4" color="secondary" weight="medium">
                No se encontraron empresas
              </Typography>
              <Typography variant="body1" color="secondary">
                {searchTerm || filterSector !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza registrando tu primera empresa'
                }
              </Typography>
              {!searchTerm && filterSector === 'todos' && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/empresas/nueva')}
                >
                  Registrar Empresa
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