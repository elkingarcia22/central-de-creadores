import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { Typography, Card, Button, Tabs, Badge } from '../../components/ui';
import { Layout } from '../../components/ui/Layout';
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

  // Cargar datos
  useEffect(() => {
    cargarDatos();
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
          {/* Header modernizado */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <Typography variant="h2" color="title" weight="bold">
                  Sistema de Roles y Permisos
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Gestiona roles, permisos y funcionalidades del sistema
                </Typography>
              </div>
            </div>
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

            {/* Total Permisos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-900">
                    {permisosRoles.length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Permisos
                  </Typography>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <ShieldIcon className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            {/* Módulos Activos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-gray-900">
                    {modulos.filter(modulo => modulo.activo).length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Módulos Activos
                  </Typography>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <ShieldIcon className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <Typography variant="h3" weight="semibold" className="mb-4">
                Contenido de la página
              </Typography>
              <Typography variant="body1" color="secondary">
                Esta es una versión simplificada de la página de Roles y Permisos.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
