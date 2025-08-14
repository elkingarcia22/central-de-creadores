import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { Layout, Typography, Card, Button } from '../../components/ui';
import { 
  UsuariosIcon, 
  ConfiguracionesIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  ShieldIcon
} from '../../components/icons';
import RolModal from '../../components/roles/RolModal';
import PermisosModal from '../../components/roles/PermisosModal';

interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Funcionalidad {
  id: string;
  modulo_id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  es_sistema: boolean;
}

interface PermisoRol {
  id: string;
  rol_id: string;
  funcionalidad_id: string;
  permitido: boolean;
  rol_nombre?: string;
  funcionalidad_nombre?: string;
  modulo_nombre?: string;
}

export default function RolesPermisosPage() {
  const { rolSeleccionado } = useRol();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'permisos' | 'modulos'>('roles');
  
  // Estados para datos
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidad[]>([]);
  const [permisosRoles, setPermisosRoles] = useState<PermisoRol[]>([]);
  
  // Estados para modales
  const [showRolModal, setShowRolModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);

  // Verificar acceso - solo administradores
  if (rolSeleccionado?.toLowerCase() !== 'administrador') {
    return (
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
    );
  }

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar roles
      const rolesResponse = await fetch('/api/roles');
      const rolesData = await rolesResponse.json();
      setRoles(rolesData.roles || []);

      // Cargar módulos
      const modulosResponse = await fetch('/api/modulos');
      const modulosData = await modulosResponse.json();
      setModulos(modulosData.modulos || []);

      // Cargar funcionalidades
      const funcionalidadesResponse = await fetch('/api/funcionalidades');
      const funcionalidadesData = await funcionalidadesResponse.json();
      setFuncionalidades(funcionalidadesData.funcionalidades || []);

      // Cargar permisos de roles
      const permisosResponse = await fetch('/api/permisos-roles');
      const permisosData = await permisosResponse.json();
      setPermisosRoles(permisosData.permisos || []);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearRol = () => {
    setSelectedRol(null);
    setShowRolModal(true);
  };

  const handleEditarRol = (rol: Rol) => {
    setSelectedRol(rol);
    setShowRolModal(true);
  };

  const handleGestionarPermisos = (rol: Rol) => {
    setSelectedRol(rol);
    setShowPermisosModal(true);
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
        await cargarDatos();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error eliminando rol:', error);
      alert('Error eliminando el rol');
    }
  };

  const handleSaveRol = async (rolData: Partial<Rol>) => {
    try {
      const method = selectedRol ? 'PUT' : 'POST';
      const body = selectedRol ? { ...rolData, id: selectedRol.id } : rolData;

      const response = await fetch('/api/roles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error guardando rol');
      }

      await cargarDatos();
    } catch (error) {
      console.error('Error guardando rol:', error);
      throw error;
    }
  };

  const handleSavePermisos = async (permisos: any[]) => {
    if (!selectedRol) return;

    try {
      // Eliminar permisos existentes del rol
      await fetch(`/api/permisos-roles?rol_id=${selectedRol.id}`, {
        method: 'DELETE',
      });

      // Crear nuevos permisos
      const permisosToCreate = permisos
        .filter(p => p.permitido)
        .map(p => ({
          rol_id: selectedRol.id,
          funcionalidad_id: p.funcionalidad_id,
          permitido: true
        }));

      if (permisosToCreate.length > 0) {
        const response = await fetch('/api/permisos-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permisos: permisosToCreate }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error guardando permisos');
        }
      }

      await cargarDatos();
    } catch (error) {
      console.error('Error guardando permisos:', error);
      throw error;
    }
  };

  const getFuncionalidadesPorModulo = (moduloId: string) => {
    return funcionalidades.filter(f => f.modulo_id === moduloId);
  };

  const getPermisosPorRol = (rolId: string) => {
    return permisosRoles.filter(p => p.rol_id === rolId);
  };

  const getPermisoRol = (rolId: string, funcionalidadId: string) => {
    return permisosRoles.find(p => p.rol_id === rolId && p.funcionalidad_id === funcionalidadId);
  };

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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ShieldIcon className="w-8 h-8 text-purple-600" />
            <div>
              <Typography variant="h1" weight="bold" className="text-gray-900">
                Roles y Permisos
              </Typography>
              <Typography variant="body1" color="secondary">
                Sistema de permisos granular por módulos y funcionalidades
              </Typography>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/configuraciones')}
            className="flex items-center space-x-2"
          >
            <ConfiguracionesIcon className="w-4 h-4" />
            <span>Volver a Configuraciones</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Roles ({roles.length})
              </button>
              <button
                onClick={() => setActiveTab('permisos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permisos'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permisos ({permisosRoles.length})
              </button>
              <button
                onClick={() => setActiveTab('modulos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'modulos'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Módulos y Funcionalidades ({modulos.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h2" weight="semibold">
                Gestión de Roles
              </Typography>
              <Button
                variant="primary"
                onClick={handleCrearRol}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Crear Nuevo Rol</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((rol) => (
                <Card key={rol.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <ShieldIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <Typography variant="h3" weight="semibold" className="text-gray-900">
                          {rol.nombre}
                        </Typography>
                        {rol.es_sistema && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Sistema
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGestionarPermisos(rol)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Gestionar permisos"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditarRol(rol)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar rol"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      {!rol.es_sistema && (
                        <button
                          onClick={() => handleEliminarRol(rol)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar rol"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <Typography variant="body2" color="secondary" className="mb-4">
                    {rol.descripcion || 'Sin descripción'}
                  </Typography>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${rol.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <Typography variant="body2" color="secondary">
                        {rol.activo ? 'Activo' : 'Inactivo'}
                      </Typography>
                    </div>
                    <Typography variant="body2" color="secondary">
                      {getPermisosPorRol(rol.id).length} permisos
                    </Typography>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'permisos' && (
          <div>
            <Typography variant="h2" weight="semibold" className="mb-6">
              Permisos por Rol
            </Typography>
            
            <div className="space-y-6">
              {roles.map((rol) => (
                <Card key={rol.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h3" weight="semibold" className="text-gray-900">
                      {rol.nombre}
                    </Typography>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGestionarPermisos(rol)}
                    >
                      Gestionar Permisos
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulos.map((modulo) => {
                      const funcionalidadesModulo = getFuncionalidadesPorModulo(modulo.id);
                      const permisosModulo = funcionalidadesModulo.filter(f => 
                        getPermisoRol(rol.id, f.id)?.permitido
                      );

                      return (
                        <div key={modulo.id} className="border border-gray-200 rounded-lg p-4">
                          <Typography variant="h4" weight="medium" className="text-gray-900 mb-2">
                            {modulo.nombre}
                          </Typography>
                          <Typography variant="body2" color="secondary" className="mb-3">
                            {permisosModulo.length} de {funcionalidadesModulo.length} funcionalidades
                          </Typography>
                          <div className="space-y-1">
                            {funcionalidadesModulo.slice(0, 3).map((func) => {
                              const permiso = getPermisoRol(rol.id, func.id);
                              return (
                                <div key={func.id} className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${permiso?.permitido ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  <Typography variant="body2" className="text-gray-700">
                                    {func.nombre}
                                  </Typography>
                                </div>
                              );
                            })}
                            {funcionalidadesModulo.length > 3 && (
                              <Typography variant="body2" color="secondary">
                                +{funcionalidadesModulo.length - 3} más...
                              </Typography>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'modulos' && (
          <div>
            <Typography variant="h2" weight="semibold" className="mb-6">
              Módulos y Funcionalidades
            </Typography>
            
            <div className="space-y-6">
              {modulos.map((modulo) => (
                <Card key={modulo.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Typography variant="h3" weight="semibold" className="text-gray-900">
                        {modulo.nombre}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {modulo.descripcion}
                      </Typography>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${modulo.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <Typography variant="body2" color="secondary">
                        {modulo.activo ? 'Activo' : 'Inactivo'}
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getFuncionalidadesPorModulo(modulo.id).map((func) => (
                      <div key={func.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Typography variant="body1" weight="medium" className="text-gray-900">
                            {func.nombre}
                          </Typography>
                          <div className={`w-2 h-2 rounded-full ${func.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <Typography variant="body2" color="secondary">
                          {func.descripcion}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <RolModal
        isOpen={showRolModal}
        onClose={() => setShowRolModal(false)}
        onSave={handleSaveRol}
        rol={selectedRol}
      />

      <PermisosModal
        isOpen={showPermisosModal}
        onClose={() => setShowPermisosModal(false)}
        rol={selectedRol}
        modulos={modulos}
        funcionalidades={funcionalidades}
        permisosActuales={selectedRol ? getPermisosPorRol(selectedRol.id) : []}
        onSavePermisos={handleSavePermisos}
      />
    </Layout>
  );
}
