import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { Typography, Card, Button, PageHeader } from '../../components/ui';
import { Layout } from '../../components/ui/Layout';
import { ShieldIcon, PlusIcon, SettingsIcon, EyeIcon, EditIcon, TrashIcon } from '../../components/icons';
import RolModal from '../../components/roles/RolModal';
import PermisosModal from '../../components/roles/PermisosModal';
import RolesUnifiedContainer from '../../components/roles/RolesUnifiedContainer';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import ActionsMenu from '../../components/ui/ActionsMenu';

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
}

export default function RolesPermisosPage() {
  const { rolSeleccionado } = useRol();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assigningPermissions, setAssigningPermissions] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Definición de columnas para la tabla
  const columns = [
    {
      key: 'nombre',
      label: 'Rol',
      sortable: true,
      render: (rol: Rol) => (
        <Typography variant="body1" weight="medium">
          {rol?.nombre || 'Sin nombre'}
        </Typography>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
      render: (rol: Rol) => (
        <Typography variant="body2" color="secondary">
          {rol?.descripcion || 'Sin descripción'}
        </Typography>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (rol: Rol) => (
        rol?.es_sistema ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Sistema
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Personalizado
          </span>
        )
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (rol: Rol) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${rol?.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <Typography variant="body2" color="secondary">
            {rol?.activo ? 'Activo' : 'Inactivo'}
          </Typography>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sortable: false,
      render: (rol: Rol) => {
        const actions = [
          {
            label: 'Ver Permisos',
            icon: <EyeIcon className="w-4 h-4" />,
            onClick: () => handleVerPermisos(rol)
          }
        ];

        // Solo agregar acciones de edición y eliminación si no es un rol del sistema
        if (!rol?.es_sistema) {
          actions.push(
            {
              label: 'Editar',
              icon: <EditIcon className="w-4 h-4" />,
              onClick: () => handleEditarRol(rol)
            },
            {
              label: 'Eliminar',
              icon: <TrashIcon className="w-4 h-4" />,
              onClick: () => handleEliminarRol(rol),
              variant: 'destructive'
            }
          );
        }

        return <ActionsMenu actions={actions} />;
      }
    }
  ];
  
  // Estados para el modal de roles
  const [showRolModal, setShowRolModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  
  // Estados para el modal de permisos
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [selectedRolForPermisos, setSelectedRolForPermisos] = useState<Rol | null>(null);

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
    setSelectedRol(null);
    setShowRolModal(true);
  };

  const handleEditarRol = (rol: Rol) => {
    setSelectedRol(rol);
    setShowRolModal(true);
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

      await cargarRoles();
      alert(`✅ Rol ${selectedRol ? 'actualizado' : 'creado'} exitosamente`);
    } catch (error) {
      console.error('Error guardando rol:', error);
      throw error;
    }
  };

  const handleVerPermisos = (rol: Rol) => {
    setSelectedRolForPermisos(rol);
    setShowPermisosModal(true);
  };

  const handleSavePermisos = async (permisos: PermisoRol[]) => {
    try {
      // Eliminar permisos existentes del rol
      const deleteResponse = await fetch(`/api/permisos-roles?rol_id=${selectedRolForPermisos?.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Error eliminando permisos existentes');
      }

      // Crear nuevos permisos
      const permisosParaCrear = permisos.filter(p => p.permitido);
      
      if (permisosParaCrear.length > 0) {
        const createResponse = await fetch('/api/permisos-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permisos: permisosParaCrear }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.error || 'Error creando permisos');
        }
      }

      alert(`✅ Permisos del rol "${selectedRolForPermisos?.nombre}" actualizados exitosamente`);
    } catch (error) {
      console.error('Error guardando permisos:', error);
      throw error;
    }
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
          <PageHeader
            title="Sistema de Roles y Permisos"
            subtitle="Gestiona roles, permisos y funcionalidades del sistema"
            color="orange"
            primaryAction={{
              label: "Crear Nuevo Rol",
              onClick: handleCrearRol,
              variant: "primary",
              icon: <PlusIcon className="w-4 h-4" />
            }}
            secondaryActions={[
              {
                label: "Asignar Permisos por Defecto",
                onClick: handleAsignarPermisosPorDefecto,
                variant: "outline",
                icon: <SettingsIcon className="w-4 h-4" />
              }
            ]}
          />

          {/* Estadísticas del Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Roles */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                    <AnimatedCounter 
                      value={roles.length} 
                      duration={2000}
                      className="text-gray-700 dark:text-gray-200"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Roles
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <ShieldIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </Card>

            {/* Roles del Sistema */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                    <AnimatedCounter 
                      value={roles.filter(rol => rol.es_sistema).length} 
                      duration={2000}
                      className="text-gray-700 dark:text-gray-200"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Roles del Sistema
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <ShieldIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </Card>

            {/* Roles Personalizados */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                    <AnimatedCounter 
                      value={roles.filter(rol => !rol.es_sistema).length} 
                      duration={2000}
                      className="text-gray-700 dark:text-gray-200"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Roles Personalizados
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <ShieldIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </Card>

            {/* Roles Activos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-700 dark:text-gray-200">
                    <AnimatedCounter 
                      value={roles.filter(rol => rol.activo).length} 
                      duration={2000}
                      className="text-gray-700 dark:text-gray-200"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Roles Activos
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ml-4">
                  <ShieldIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Contenedor unificado de tabla, buscador y filtros */}
          <RolesUnifiedContainer
            roles={roles}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            columns={columns}
            onEditarRol={handleEditarRol}
            onEliminarRol={handleEliminarRol}
            onVerPermisos={handleVerPermisos}
            assigningPermissions={assigningPermissions}
          />
        </div>
      </div>

      {/* Modal para crear/editar roles */}
      <RolModal
        isOpen={showRolModal}
        onClose={() => setShowRolModal(false)}
        rol={selectedRol}
        onSave={handleSaveRol}
      />

      {/* Modal para gestionar permisos */}
      <PermisosModal
        isOpen={showPermisosModal}
        onClose={() => setShowPermisosModal(false)}
        rol={selectedRolForPermisos}
        onSave={handleSavePermisos}
      />
    </Layout>
  );
}
