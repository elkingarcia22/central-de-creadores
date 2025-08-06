import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { Layout, Typography, Card, Button, Chip } from '../components/ui';
import { 
  ConocimientoIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
  DocumentIcon,
  MetricasIcon
} from '../components/icons';

export default function ConocimientoPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todos');

  // Datos simulados de artículos de conocimiento
  const articulos = [
    {
      id: 1,
      titulo: 'Guía Completa de Usabilidad Testing',
      descripcion: 'Metodologías y mejores prácticas para realizar tests de usabilidad efectivos',
      categoria: 'metodología',
      autor: 'Ana García',
      fechaCreacion: '2024-01-15',
      fechaActualizacion: '2024-02-10',
      estado: 'publicado',
      vistas: 156,
      descargas: 23,
      tags: ['usabilidad', 'testing', 'metodología'],
      contenido: 'Artículo completo sobre metodologías de testing de usabilidad...'
    },
    {
      id: 2,
      titulo: 'Protocolos de Entrevista en Investigación UX',
      descripcion: 'Estructura y técnicas para conducir entrevistas efectivas con usuarios',
      categoria: 'protocolos',
      autor: 'Carlos López',
      fechaCreacion: '2024-01-20',
      fechaActualizacion: '2024-02-05',
      estado: 'publicado',
      vistas: 89,
      descargas: 12,
      tags: ['entrevistas', 'UX', 'protocolos'],
      contenido: 'Guía detallada sobre cómo estructurar y conducir entrevistas...'
    },
    {
      id: 3,
      titulo: 'Análisis de Datos Cualitativos',
      descripcion: 'Técnicas y herramientas para analizar datos cualitativos de investigación',
      categoria: 'análisis',
      autor: 'María Rodríguez',
      fechaCreacion: '2024-02-01',
      fechaActualizacion: '2024-02-15',
      estado: 'borrador',
      vistas: 0,
      descargas: 0,
      tags: ['análisis', 'datos', 'cualitativo'],
      contenido: 'Metodologías para el análisis de datos cualitativos...'
    },
    {
      id: 4,
      titulo: 'Plantillas de Consentimiento Informado',
      descripcion: 'Modelos y ejemplos de formularios de consentimiento para investigaciones',
      categoria: 'plantillas',
      autor: 'Luis Martínez',
      fechaCreacion: '2023-12-10',
      fechaActualizacion: '2024-01-25',
      estado: 'publicado',
      vistas: 234,
      descargas: 45,
      tags: ['consentimiento', 'plantillas', 'legal'],
      contenido: 'Colección de plantillas de consentimiento informado...'
    }
  ];

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'metodología': return 'primary';
      case 'protocolos': return 'success';
      case 'análisis': return 'secondary';
      case 'plantillas': return 'warning';
      case 'herramientas': return 'info';
      default: return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'publicado': return 'success';
      case 'borrador': return 'warning';
      case 'revisión': return 'info';
      case 'archivado': return 'default';
      default: return 'default';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'publicado': return 'Publicado';
      case 'borrador': return 'Borrador';
      case 'revisión': return 'En Revisión';
      case 'archivado': return 'Archivado';
      default: return estado;
    }
  };

  const filteredArticulos = articulos.filter(articulo => {
    const matchesSearch = articulo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         articulo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         articulo.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         articulo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterCategoria === 'todos' || articulo.categoria === filterCategoria;
    return matchesSearch && matchesFilter;
  });

  const articulosPublicados = articulos.filter(a => a.estado === 'publicado').length;
  const totalVistas = articulos.reduce((sum, a) => sum + a.vistas, 0);
  const totalDescargas = articulos.reduce((sum, a) => sum + a.descargas, 0);

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-indigo-900 bg-opacity-20' : 'bg-indigo-50'} mt-1`}>
                <ConocimientoIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <Typography variant="h1" color="title" weight="bold">
                  Conocimiento
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Base de conocimiento y recursos
                </Typography>
              </div>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <FilterIcon className={`w-5 h-5 text-muted-foreground`} />
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="todos">Todas las categorías</option>
                  <option value="metodología">Metodología</option>
                  <option value="protocolos">Protocolos</option>
                  <option value="análisis">Análisis</option>
                  <option value="plantillas">Plantillas</option>
                  <option value="herramientas">Herramientas</option>
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
                  {articulos.length}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Artículos
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-indigo-900 bg-opacity-20' : 'bg-indigo-50'}`}>
                <ConocimientoIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {articulosPublicados}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Publicados
                </Typography>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                <DocumentIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {totalVistas}
                </Typography>
                <Typography variant="body2" color="secondary">
                  Total Vistas
                </Typography>
              </div>
              <div className="p-3 rounded-lg bg-card">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {totalDescargas}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Descargas
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-50'}`}>
                  <MetricasIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Lista de Artículos */}
          <div className="space-y-6">
            {filteredArticulos.map((articulo) => (
                          <Card 
              key={articulo.id}
              variant="elevated" 
              padding="lg" 
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/conocimiento/${articulo.id}`)}
            >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Typography variant="h4" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {articulo.titulo}
                        </Typography>
                        <Chip 
                          variant={getCategoriaColor(articulo.categoria)}
                          size="sm"
                        >
                          {articulo.categoria}
                        </Chip>
                        <Chip 
                          variant={getEstadoColor(articulo.estado)}
                          size="sm"
                        >
                          {getEstadoText(articulo.estado)}
                        </Chip>
                      </div>
                      <Typography variant="body1" color="secondary" className="mb-3">
                        {articulo.descripcion}
                      </Typography>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      {articulo.tags.map((tag, index) => (
                        <Chip 
                          key={index}
                          variant="default"
                          size="sm"
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className={`w-4 h-4 text-muted-foreground`} />
                      <div>
                        <Typography variant="body2" color="secondary">
                          Autor
                        </Typography>
                        <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {articulo.autor}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentIcon className={`w-4 h-4 text-muted-foreground`} />
                      <div>
                        <Typography variant="body2" color="secondary">
                          Vistas
                        </Typography>
                        <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {articulo.vistas}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MetricasIcon className={`w-4 h-4 text-muted-foreground`} />
                      <div>
                        <Typography variant="body2" color="secondary">
                          Descargas
                        </Typography>
                        <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {articulo.descargas}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ConocimientoIcon className={`w-4 h-4 text-muted-foreground`} />
                      <div>
                        <Typography variant="body2" color="secondary">
                          Actualizado
                        </Typography>
                        <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {new Date(articulo.fechaActualizacion).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="body2" color="secondary">
                        Creado: {new Date(articulo.fechaCreacion).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="secondary">
                        Categoría: {articulo.categoria}
                      </Typography>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/conocimiento/${articulo.id}`)}
                    >
                      Leer Artículo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/conocimiento/${articulo.id}/editar`)}
                    >
                      Editar
                    </Button>
                    {articulo.estado === 'publicado' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/conocimiento/${articulo.id}/descargar`)}
                      >
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredArticulos.length === 0 && (
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="space-y-4">
                <ConocimientoIcon className="w-16 h-16 mx-auto text-gray-400" />
                <Typography variant="h4" color="secondary" weight="medium">
                  No se encontraron artículos
                </Typography>
                <Typography variant="body1" color="secondary">
                  {searchTerm || filterCategoria !== 'todos' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Comienza creando tu primer artículo'
                  }
                </Typography>
                {!searchTerm && filterCategoria === 'todos' && (
                  <Button
                    variant="primary"
                    onClick={() => router.push('/conocimiento/nuevo')}
                  >
                    Crear Artículo
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Categorías Populares */}
          <div className="mt-12">
            <Typography variant="h2" color="title" weight="semibold" className="mb-6">
              Categorías Populares
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { nombre: 'Metodología', descripcion: 'Guías y metodologías de investigación', articulos: 8, color: 'primary' },
                { nombre: 'Protocolos', descripcion: 'Protocolos de testing y entrevistas', articulos: 12, color: 'success' },
                { nombre: 'Análisis', descripcion: 'Técnicas de análisis de datos', articulos: 6, color: 'secondary' },
                { nombre: 'Plantillas', descripcion: 'Plantillas y formularios', articulos: 15, color: 'warning' },
                { nombre: 'Herramientas', descripcion: 'Herramientas y software', articulos: 10, color: 'info' },
                { nombre: 'Casos de Estudio', descripcion: 'Ejemplos y casos prácticos', articulos: 5, color: 'default' }
              ].map((categoria, index) => (
                              <Card 
                key={index}
                variant="elevated" 
                padding="md" 
                className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setFilterCategoria(categoria.nombre.toLowerCase())}
              >
                  <div className="text-center space-y-3">
                    <div className="inline-flex p-3 rounded-lg bg-card">
                      <ConocimientoIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <Typography variant="h5" weight="semibold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {categoria.nombre}
                      </Typography>
                      <Typography variant="body2" color="secondary" className="mt-1">
                        {categoria.descripcion}
                      </Typography>
                      <Typography variant="body2" weight="medium" className={`text-foreground mt-2`}>
                        {categoria.articulos} artículos
                      </Typography>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 