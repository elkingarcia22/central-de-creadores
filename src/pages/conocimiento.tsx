import { useRol } from '../contexts/RolContext';
import { Layout, Typography, PageHeader } from '../components/ui';
import { ConocimientoIcon } from '../components/icons';

export default function ConocimientoPage() {
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
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <PageHeader
            title="Conocimiento"
            subtitle="Base de conocimiento y documentación"
            color="yellow"
          />

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
              <ConocimientoIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
            
            <Typography variant="h2" className="text-2xl font-semibold text-foreground mb-4">
              Próximamente
            </Typography>
            
            <Typography variant="body1" className="text-muted-foreground text-center max-w-md">
              Estamos trabajando en esta sección. Pronto podrás acceder a recursos, 
              documentación y base de conocimiento del sistema.
            </Typography>
          </div>
        </div>
      </div>
    </Layout>
  );
}