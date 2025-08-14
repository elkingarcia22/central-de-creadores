import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Layout, Typography, Card, Button, SideModal, Select, DataTable, Input, ConfirmModal } from '../../components/ui';
import UsuarioCreateModal from '../../components/usuarios/UsuarioCreateModal';
import UsuarioEditModal from '../../components/usuarios/UsuarioEditModal';
import UsuarioDeleteModal from '../../components/usuarios/UsuarioDeleteModal';
import { supabase } from '../../api/supabase';
import { obtenerRolesParaSelect } from '../../api/roles';
import { obtenerUsuarios } from '../../api/supabase-investigaciones';
import { PlusIcon, UserIcon, EditIcon, DeleteIcon } from '../../components/icons';

const rolesPermitidos = ['administrador'];

export default function GestionUsuariosPage() {
  const { rolSeleccionado, loading } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const router = useRouter();
  
  // TODOS LOS ESTADOS JUNTOS AL INICIO
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState<any | null>(null);
  const [usuarioDelete, setUsuarioDelete] = useState<any | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkDeleteUsers, setBulkDeleteUsers] = useState<string[]>([]);
  const [clearTableSelection, setClearTableSelection] = useState(false);
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // REF DESPUÉS DE TODOS LOS ESTADOS
  const selectedUsersRef = useRef(selectedUsers);

  // EFFECTS DESPUÉS DE REF
  // Actualizar ref cuando cambie selectedUsers
  useEffect(() => {
    selectedUsersRef.current = selectedUsers;
  }, [selectedUsers]);

  // Precarga de roles para optimizar rendimiento
  useEffect(() => {
    // Precargar roles en background para tenerlos disponibles cuando se abra el modal
    obtenerRolesParaSelect().then(() => {
      console.log('Roles precargados para formularios');
    }).catch(error => {
      console.warn('Error precargando roles:', error);
    });
  }, []);

  // CALLBACKS DESPUÉS DE TODOS LOS EFFECTS
  // Callback para manejar cambios de selección (memoizado para evitar loops)
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    // Solo loggear cuando hay cambios significativos
    if (selectedIds.length !== selectedUsersRef.current.length) {
      console.log('Usuarios seleccionados:', selectedIds.length);
    }
    setSelectedUsers(selectedIds);
  }, []); // Sin dependencias para evitar recreación

  // Función para convertir UUID de rol a nombre legible
  const convertirRolUUIDaNombre = (rolUUID: string): string => {
    const rolesMap = {
      'bcc17f6a-d751-4c39-a479-412abddde0fa': 'Administrador',
      'e1fb53e3-3d1c-4ff5-bdac-9a1285dd99d7': 'Investigador',
      'fcf6ffc7-e8d3-407b-8c72-b4a7e8db6c9c': 'Reclutador',
      '7e329b4c-3716-4781-919e-54106b51ca99': 'Agendador'
    };
    return rolesMap[rolUUID as keyof typeof rolesMap] || rolUUID;
  };

  // Calcular roles únicos a partir de los usuarios cargados
  const rolesUnicos = Array.from(
    new Set(
      usuarios.flatMap(u => 
        (u.roles || []).map(rol => convertirRolUUIDaNombre(rol))
      )
    )
  ).sort();

  // Configuración de columnas para el nuevo DataTable
  const columns = [
    {
      key: 'full_name', // Cambiar de 'user_info' a 'full_name' para sorting
      label: 'Usuario',
      sortable: true, // Hacer sortable
      width: 'w-80',
      render: (value: any, row: any) => {
        // Validación de datos
        if (!row) return null;
        
        const displayName = row.full_name || 'Sin nombre';
        const displayEmail = row.email || 'Sin email';
        const avatarUrl = row.avatar_url;
        
        // Debug: Log para Elkin Garcia
        if (displayName.includes('Elkin')) {
          console.log('🔍 Renderizando Elkin Garcia:', {
            displayName,
            displayEmail,
            avatarUrl,
            row
          });
        }
        
        // Generar iniciales de forma segura
        const initials = displayName
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .substring(0, 2)
          .toUpperCase();
        
        // Color único basado en el nombre
        const backgroundColor = `hsl(${displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`;
        
        return (
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              {/* Avatar de respaldo con iniciales (siempre presente) */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm"
                style={{ backgroundColor }}
              >
                {initials}
              </div>
              
              {/* Imagen de avatar (se muestra encima si existe) */}
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="absolute top-0 left-0 w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm z-10"
                  onError={e => { 
                    // Si falla la imagen, simplemente ocultarla para mostrar el avatar con iniciales
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    console.log('❌ Error cargando avatar para:', displayName, 'URL:', avatarUrl);
                  }}
                  onLoad={e => {
                    // Cuando la imagen carga exitosamente, asegurar que sea visible
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'block';
                    console.log('✅ Avatar cargado exitosamente para:', displayName, 'URL:', avatarUrl);
                  }}
                  loading="lazy"
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {displayName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {displayEmail}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: false,
      width: 'w-64',
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roles && roles.length > 0
            ? roles.map((rol, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                >
                  {convertirRolUUIDaNombre(rol)}
                </span>
              ))
            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Sin rol
              </span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (value: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
  ];

  // Acciones por fila
  const rowActions = [
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (row: any) => {
        console.log('🖱️ Clic en editar usuario:', row);
        console.log('📊 Datos del usuario a editar:', {
          id: row.id,
          full_name: row.full_name,
          email: row.email,
          roles: row.roles,
          avatar_url: row.avatar_url
        });
        setUsuarioEdit(row);
      },
              className: 'text-primary hover:text-primary/80'
    },
    {
      label: 'Eliminar',
      icon: <DeleteIcon className="w-4 h-4" />,
      onClick: (row: any) => {
        setUsuarioDelete(row);
      },
      className: 'text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200'
    }
  ];

  // Acciones masivas
  const bulkActions = [
    {
      label: 'Eliminar Seleccionados',
      icon: <DeleteIcon className="w-4 h-4" />,
      onClick: (selectedIds: string[]) => {
        if (selectedIds.length === 0) {
          return;
        }
        setBulkDeleteUsers(selectedIds);
      },
      className: 'text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200'
    }
  ];

  // Manejar edición de fila
  const handleRowEdit = (rowId: string, field: string, value: any) => {
    // TODO: Implementar edición inline
    console.log('Editar campo:', field, 'valor:', value, 'fila:', rowId);
  };

  // Usuarios filtrados por búsqueda y rol
  const usuariosFiltrados = useMemo(() => {
    const filtrados = usuarios.filter((u) => {
      const matchSearch = !searchTerm || 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRol = !filtroRol || (u.roles && u.roles.some(rol => 
        convertirRolUUIDaNombre(rol) === filtroRol
      ));
      return matchSearch && matchRol;
    });
    
    // Solo loggear cuando hay cambios en los filtros
    if (searchTerm || filtroRol) {
      console.log(`Filtrado: ${filtrados.length}/${usuarios.length} usuarios (búsqueda: "${searchTerm}", rol: "${filtroRol}")`);
    }
    
    return filtrados;
  }, [usuarios, searchTerm, filtroRol]);

  // Función para cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await obtenerUsuarios();
      console.log('📊 Usuarios cargados:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('👤 Primer usuario:', response.data[0]);
      }
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    if (!loading && rolesPermitidos.includes(rolSeleccionado?.toLowerCase())) {
      // Verificar conexión y estructura de la tabla
      const checkConnection = async () => {
        try {
          console.log('Verificando conexión a Supabase...');
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) {
            console.error('Error de conexión:', error);
            alert('Error de conexión a la base de datos: ' + error.message);
            return;
          }
          console.log('Conexión exitosa, cargando usuarios...');
          fetchUsuarios();
        } catch (err) {
          console.error('Error verificando conexión:', err);
          alert('Error verificando conexión a la base de datos');
        }
      };
      checkConnection();
    }
    // eslint-disable-next-line
  }, [rolSeleccionado, loading]);

  // REMOVIDO: useEffect problemático que causaba loop infinito
  // Las variables sortBy, sortOrder, page, pageSize no existen en este componente

  useEffect(() => {
    if (!loading && !rolesPermitidos.includes(rolSeleccionado?.toLowerCase())) {
      router.replace('/dashboard');
    }
  }, [rolSeleccionado, loading, router]);

  if (loading || !rolesPermitidos.includes(rolSeleccionado?.toLowerCase())) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 mt-4">Cargando...</p>
      </div>
    );
  }

  // Handlers para editar/eliminar (estructura base)
  function handleEdit(usuario: any) {
    setUsuarioEdit(usuario);
  }
  
  function handleDelete(usuario: any) {
    setUsuarioDelete(usuario);
  }

  // Handler para crear usuario (solo recarga la tabla y cierra modal, la creación se hace en UsuarioForm)
  const handleFormSubmit = async (data: any) => {
    try {
      console.log('🔄 Recargando tabla después de crear usuario...');
      
      // Cerrar el modal
      setShowModal(false);
      
      // Recargar la tabla, la creación ya se hizo en UsuarioForm
      fetchUsuarios();
      
    } catch (error) {
      console.error('Error recargando tabla:', error);
    }
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (data: any) => {
    if (!usuarioEdit) return;
    
    try {
      console.log('Guardando cambios de edición:', data);
      
      // Ejecutar actualizaciones en paralelo para mayor velocidad
      const [profileResult, deleteRolesResult] = await Promise.all([
        // Actualizar perfil
        supabase.from('profiles').update({
          full_name: data.full_name,
          email: data.email,
          avatar_url: data.avatar_url
        }).eq('id', usuarioEdit.id),
        
        // Eliminar roles existentes
        supabase.from('user_roles').delete().eq('user_id', usuarioEdit.id)
      ]);
      
      if (profileResult.error) {
        console.error('Error actualizando perfil:', profileResult.error);
        throw new Error('Error actualizando perfil: ' + profileResult.error.message);
      }
      
      if (deleteRolesResult.error) {
        console.error('Error eliminando roles:', deleteRolesResult.error);
        throw new Error('Error eliminando roles: ' + deleteRolesResult.error.message);
      }
      
      // Insertar nuevos roles si existen
      if (data.roles && data.roles.length > 0) {
        const rolesToInsert = data.roles.map((rolId: string) => ({
          user_id: usuarioEdit.id,
          role: rolId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertRolesError } = await supabase.from('user_roles').insert(rolesToInsert);
        if (insertRolesError) {
          console.error('Error insertando roles:', insertRolesError);
          throw new Error('Error insertando roles: ' + insertRolesError.message);
        }
      }
      
      console.log('✅ Cambios guardados exitosamente');
      setUsuarioEdit(null);
      
      // Recargar usuarios
      console.log('🔄 Recargando tabla después de editar usuario...');
      fetchUsuarios();
      
    } catch (error) {
      console.error('Error guardando cambios:', error);
      alert('Error guardando cambios: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!usuarioDelete) return;
    
    try {
      console.log('Eliminando usuario:', usuarioDelete.id);
      
      // Llamar a la API de eliminación
      const response = await fetch(`/api/eliminar-usuario?userId=${usuarioDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error eliminando usuario:', result);
        showError(
          'Error al eliminar usuario',
          result.error || 'Ha ocurrido un error inesperado'
        );
        return;
      }

      console.log('Usuario eliminado exitosamente:', result);
      
      // Mostrar toast de éxito
      showSuccess(
        'Usuario eliminado',
        `El usuario ${usuarioDelete.full_name || usuarioDelete.email} ha sido eliminado correctamente`
      );
      
      setUsuarioDelete(null);
      fetchUsuarios(); // Recargar la lista
      
    } catch (error) {
      console.error('Error inesperado eliminando usuario:', error);
      showError(
        'Error inesperado',
        'Ha ocurrido un error inesperado al eliminar el usuario'
      );
    }
  };

  // Handler para crear usuario
  const handleCrearUsuario = () => setShowModal(true);

  // Función para manejar la eliminación masiva
  const handleBulkDelete = async () => {
    if (bulkDeleteUsers.length === 0) return;

    console.log('Eliminando usuarios:', bulkDeleteUsers);
    
    const resultados = {
      exitosos: [] as string[],
      fallidos: [] as { userId: string; error: string }[]
    };
    
    // Eliminar usuarios uno por uno y manejar errores individualmente
    for (const userId of bulkDeleteUsers) {
      try {
        const response = await fetch(`/api/eliminar-usuario?userId=${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const result = await response.json();
          const errorMessage = result.detail || result.error || 'Error desconocido';
          resultados.fallidos.push({ userId, error: errorMessage });
          console.error(`Error eliminando usuario ${userId}:`, errorMessage);
        } else {
          resultados.exitosos.push(userId);
          console.log(`Usuario ${userId} eliminado exitosamente`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        resultados.fallidos.push({ userId, error: errorMessage });
        console.error(`Error eliminando usuario ${userId}:`, errorMessage);
      }
    }
    
    // Mostrar resultados
    if (resultados.exitosos.length > 0) {
      showSuccess(
        'Usuarios eliminados',
        `Se han eliminado ${resultados.exitosos.length} usuario${resultados.exitosos.length > 1 ? 's' : ''} correctamente`
      );
    }
    
    if (resultados.fallidos.length > 0) {
      const errores = resultados.fallidos.map(f => f.error).join(', ');
      showWarning(
        'Algunos usuarios no se pudieron eliminar',
        `No se pudieron eliminar ${resultados.fallidos.length} usuario${resultados.fallidos.length > 1 ? 's' : ''}: ${errores}`
      );
    }
    
    console.log('=== INICIANDO LIMPIEZA Y RECARGA ===');
    
    // Limpiar estados inmediatamente
    setBulkDeleteUsers([]);
    setSelectedUsers([]);
    setClearTableSelection(true);
    console.log('Estados limpiados');
    
    // Recargar usuarios
    console.log('Llamando fetchUsuarios...');
    fetchUsuarios();
    
    // Limpiar flag de selección después de un momento
    setTimeout(() => {
      console.log('Limpiando clearTableSelection');
      setClearTableSelection(false);
    }, 100);
  };

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header modernizado */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <Typography variant="h1" color="title" weight="bold">
                  Gestión de Usuarios
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Administra los usuarios de la plataforma
                </Typography>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCrearUsuario}
              >
                Crear Usuario
              </Button>
            </div>
          </div>

          {/* Barra de búsqueda y filtro al estilo investigaciones */}
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2"
                  icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  options={[
                    { value: '', label: 'Todos los roles' },
                    ...rolesUnicos.map((rol: string) => ({ value: rol, label: rol }))
                  ]}
                  value={filtroRol}
                  onChange={value => setFiltroRol(value.toString())}
                  size="md"
                  variant="default"
                  fullWidth={false}
                />
              </div>
            </div>
          </Card>

          {/* Tabla de usuarios */}
          <DataTable
            data={usuariosFiltrados}
            columns={columns}
            loading={loadingUsuarios}
            searchable={false}
            filterable={false}
            searchPlaceholder="Buscar por nombre o correo..."
            searchKeys={['full_name', 'email']}
            filterOptions={rolesUnicos.map((rol: string) => ({ value: rol, label: rol }))}
            filterKey="role"
            selectable={true}
            onRowEdit={handleRowEdit}
            actions={rowActions}
            bulkActions={bulkActions}
            emptyMessage="No se encontraron usuarios"
            loadingMessage="Cargando usuarios..."
            rowKey="id"
            onSelectionChange={handleSelectionChange}
            clearSelection={clearTableSelection}
          />
        </div>
      </div>

      {/* Modal para crear usuario */}
      <UsuarioCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleFormSubmit}
        loading={loadingUsuarios}
      />

      {/* Modales de edición y eliminación */}
      <UsuarioEditModal
        usuario={usuarioEdit}
        isOpen={!!usuarioEdit}
        onSave={handleSaveEdit}
        onClose={() => setUsuarioEdit(null)}
      />
      <UsuarioDeleteModal
        usuario={usuarioDelete}
        open={!!usuarioDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => setUsuarioDelete(null)}
      />

      {/* Modal de confirmación para eliminación masiva */}
      <ConfirmModal
        isOpen={bulkDeleteUsers.length > 0}
        onClose={() => setBulkDeleteUsers([])}
        onConfirm={handleBulkDelete}
        title="Eliminar Usuarios"
        message={`¿Estás seguro de que quieres eliminar ${bulkDeleteUsers.length} usuario${bulkDeleteUsers.length !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="error"
        loading={loadingUsuarios}
      />
    </Layout>
  );
} 