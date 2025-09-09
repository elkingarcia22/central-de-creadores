import { useRol } from '../contexts/RolContext';
import { Layout, Typography } from '../components/ui';

export default function HomePage() {
  const { rolSeleccionado, loading } = useRol();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <Typography variant="body1" className="text-muted-foreground">
              Cargando...
            </Typography>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <Typography variant="h1" className="text-3xl font-bold text-foreground">
            Bienvenido a Central de Creadores
          </Typography>
          <Typography variant="body1" className="text-muted-foreground mt-2">
            Panel principal del sistema
          </Typography>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <Typography variant="h3" className="text-lg font-semibold text-foreground mb-2">
              Investigaciones
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Gestiona tus investigaciones y estudios de manera eficiente.
            </Typography>
          </div>

          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <Typography variant="h3" className="text-lg font-semibold text-foreground mb-2">
              Reclutamiento
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Administra el proceso de reclutamiento de participantes.
            </Typography>
          </div>

          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <Typography variant="h3" className="text-lg font-semibold text-foreground mb-2">
              Sesiones
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Programa y gestiona sesiones de investigación.
            </Typography>
          </div>

          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <Typography variant="h3" className="text-lg font-semibold text-foreground mb-2">
              Participantes
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Administra la base de datos de participantes.
            </Typography>
          </div>

          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <Typography variant="h3" className="text-lg font-semibold text-foreground mb-2">
              Empresas
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Gestiona información de empresas y organizaciones.
            </Typography>
          </div>

          {rolSeleccionado?.toLowerCase() === 'administrador' && (
            <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <Typography variant="h3" className="text-lg font-semibold text-foreground mb-2">
                Configuraciones
              </Typography>
              <Typography variant="body2" className="text-muted-foreground">
                Configura el sistema y gestiona usuarios.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}