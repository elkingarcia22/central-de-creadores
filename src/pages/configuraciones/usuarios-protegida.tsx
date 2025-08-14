import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, Typography, Card, Button } from '../../components/ui';
import { UserIcon, PlusIcon, EditIcon, DeleteIcon } from '../../components/icons';
import PermisoGuard from '../../components/auth/PermisoGuard';
import PermisoRender from '../../components/auth/PermisoRender';

export default function UsuariosProtegidaPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de usuarios
    setTimeout(() => {
      setUsuarios([
        { id: '1', nombre: 'Usuario 1', email: 'usuario1@example.com' },
        { id: '2', nombre: 'Usuario 2', email: 'usuario2@example.com' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <PermisoGuard 
      funcionalidad="leer_usuarios"
      redirectTo="/dashboard"
    >
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8 text-blue-600" />
              <div>
                <Typography variant="h1" weight="bold" className="text-gray-900">
                  Gestión de Usuarios (Protegida)
                </Typography>
                <Typography variant="body1" color="secondary">
                  Esta página está completamente protegida por permisos
                </Typography>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/configuraciones')}
            >
              Volver a Configuraciones
            </Button>
          </div>

          {/* Información de permisos */}
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <Typography variant="h3" weight="semibold" className="text-blue-900 mb-2">
              🔒 Página Protegida por Permisos
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-4">
              Esta página solo es accesible si tienes el permiso <strong>leer_usuarios</strong>.
              Los botones de acción también están protegidos individualmente.
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-100 p-3 rounded-lg">
                <strong>Crear Usuario:</strong> Requiere permiso <code>crear_usuario</code>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <strong>Editar Usuario:</strong> Requiere permiso <code>editar_usuario</code>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <strong>Eliminar Usuario:</strong> Requiere permiso <code>eliminar_usuario</code>
              </div>
            </div>
          </Card>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de usuarios */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h3" weight="semibold">
                  Usuarios ({usuarios.length})
                </Typography>
                <PermisoRender funcionalidad="crear_usuario">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Crear Usuario</span>
                  </Button>
                </PermisoRender>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <Typography variant="body2" color="secondary">
                    Cargando usuarios...
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Typography variant="body1" weight="medium">
                          {usuario.nombre}
                        </Typography>
                        <Typography variant="body2" color="secondary">
                          {usuario.email}
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PermisoRender funcionalidad="editar_usuario">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <EditIcon className="w-3 h-3" />
                            <span>Editar</span>
                          </Button>
                        </PermisoRender>
                        
                        <PermisoRender funcionalidad="eliminar_usuario">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <DeleteIcon className="w-3 h-3" />
                            <span>Eliminar</span>
                          </Button>
                        </PermisoRender>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Panel de información */}
            <Card className="p-6">
              <Typography variant="h3" weight="semibold" className="mb-4">
                Información de Permisos
              </Typography>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Typography variant="body1" weight="medium" className="text-green-800 mb-2">
                    ✅ Acceso Permitido
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Tienes acceso a esta página porque posees el permiso <strong>leer_usuarios</strong>.
                  </Typography>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Typography variant="body1" weight="medium" className="text-yellow-800 mb-2">
                    ⚠️ Permisos Limitados
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Algunos botones pueden estar ocultos si no tienes los permisos específicos.
                  </Typography>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Typography variant="body1" weight="medium" className="text-blue-800 mb-2">
                    ℹ️ Cómo Funciona
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    <strong>PermisoGuard:</strong> Protege toda la página<br/>
                    <strong>PermisoRender:</strong> Muestra/oculta elementos específicos
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </PermisoGuard>
  );
}
