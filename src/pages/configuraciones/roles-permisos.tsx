import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { Typography, Card, Button } from '../../components/ui';
import { Layout } from '../../components/ui/Layout';
import { ShieldIcon, PlusIcon, SettingsIcon } from '../../components/icons';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  es_sistema: boolean;
}

export default function RolesPermisosPage() {
  const { rolSeleccionado } = useRol();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assigningPermissions, setAssigningPermissions] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarPermisosPorDefecto = async () => {
    setAssigningPermissions(true);
    try {
      const response = await fetch('/api/asignar-permisos-por-defecto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Permisos asignados exitosamente:\n${result.summary}`);
        await cargarRoles(); // Recargar roles para actualizar estadísticas
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error asignando permisos:', error);
      alert('❌ Error asignando permisos por defecto');
    } finally {
      setAssigningPermissions(false);
    }
  };

  const handleCrearRol = () => {
    // TODO: Implementar modal de creación de rol
    alert('Funcionalidad de crear rol en desarrollo...');
  };

  const handleVerPermisos = (rol: Rol) => {
    // TODO: Implementar modal de visualización de permisos
    alert(`Ver permisos del rol: ${rol.nombre}`);
  };

  const handleEditarRol = (rol: Rol) => {
    // TODO: Implementar modal de edición de rol
    alert(`Editar rol: ${rol.nombre}`);
  };

  const handleEliminarRol = async (rol: Rol) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el rol "${rol.nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roles?id=${rol.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(`✅ Rol "${rol.nombre}" eliminado exitosamente`);
        await cargarRoles();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error eliminando rol'}`);
      }
    } catch (error) {
      console.error('Error eliminando rol:', error);
      alert('❌ Error eliminando el rol');
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  // Verificar acceso - solo administradores
  if (rolSeleccionado?.toLowerCase() !== 'administrador') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Typography variant="h2" color="danger" weight="bold" className="mb-4">
              Acceso Denegado
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              Solo los administradores pueden acceder a esta sección.
            </Typography>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard')}
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography variant="body1" color="secondary">
              Cargando sistema de permisos...
            </Typography>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Typography variant="h2" color="title" weight="bold" className="mb-2">
              Sistema de Roles y Permisos
            </Typography>
            <Typography variant="subtitle1" color="secondary">
              Gestiona roles, permisos y funcionalidades del sistema
            </Typography>
          </div>

          {/* Estadísticas del Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Roles */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-900">
                    {roles.length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Roles
                  </Typography>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <ShieldIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Roles del Sistema */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-900">
                    {roles.filter(rol => rol.es_sistema).length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Roles del Sistema
                  </Typography>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <ShieldIcon className="w-6 h-6 text-warning" />
                </div>
              </div>
            </Card>

            {/* Roles Personalizados */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-900">
                    {roles.filter(rol => !rol.es_sistema).length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Roles Personalizados
                  </Typography>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <ShieldIcon className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>

            {/* Roles Activos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-900">
                    {roles.filter(rol => rol.activo).length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Roles Activos
                  </Typography>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <ShieldIcon className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Lista de Roles */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h3" weight="semibold">
                Gestión de Roles
              </Typography>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleAsignarPermisosPorDefecto}
                  disabled={assigningPermissions}
                  className="flex items-center space-x-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>
                    {assigningPermissions ? 'Asignando...' : 'Asignar Permisos por Defecto'}
                  </span>
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCrearRol}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Crear Nuevo Rol</span>
                </Button>
              </div>
            </div>

            {/* Tabla de roles */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <Typography variant="body2" weight="semibold">Rol</Typography>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <Typography variant="body2" weight="semibold">Descripción</Typography>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <Typography variant="body2" weight="semibold">Tipo</Typography>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <Typography variant="body2" weight="semibold">Estado</Typography>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <Typography variant="body2" weight="semibold">Acciones</Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((rol) => (
                    <tr key={rol.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Typography variant="body1" weight="medium">
                          {rol.nombre}
                        </Typography>
                      </td>
                      <td className="py-4 px-4">
                        <Typography variant="body2" color="secondary">
                          {rol.descripcion}
                        </Typography>
                      </td>
                      <td className="py-4 px-4">
                        {rol.es_sistema ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Sistema
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Personalizado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${rol.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <Typography variant="body2" color="secondary">
                            {rol.activo ? 'Activo' : 'Inactivo'}
                          </Typography>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerPermisos(rol)}
                            className="text-primary hover:text-primary/80"
                          >
                            Ver Permisos
                          </Button>
                          {!rol.es_sistema && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditarRol(rol)}
                                className="text-primary hover:text-primary/80"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEliminarRol(rol)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                Eliminar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {roles.length === 0 && (
              <div className="text-center py-8">
                <Typography variant="body1" color="secondary">
                  No hay roles configurados. Crea el primer rol o asigna permisos por defecto.
                </Typography>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
