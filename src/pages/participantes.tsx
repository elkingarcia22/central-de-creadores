import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

import { Layout } from '../components/ui';
import Typography from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import ActionsMenu from '../components/ui/ActionsMenu';
import Tabs from '../components/ui/Tabs';
import FilterDrawer from '../components/ui/FilterDrawer';
import CrearParticipanteExternoModal from '../components/ui/CrearParticipanteExternoModal';
import CrearParticipanteInternoModal from '../components/ui/CrearParticipanteInternoModal';
import CrearParticipanteFriendFamilyModal from '../components/ui/CrearParticipanteFriendFamilyModal';
import EditarParticipanteModal from '../components/ui/EditarParticipanteModal';
import ConfirmarEliminacionModal from '../components/ui/ConfirmarEliminacionModal';
import ErrorEliminacionModal from '../components/ui/ErrorEliminacionModal';
import { SearchIcon, PlusIcon, UserIcon, ParticipantesIcon, BuildingIcon, UsersIcon, CheckCircleIcon, EyeIcon, EditIcon, TrashIcon, MoreVerticalIcon, FilterIcon, MessageIcon, AlertTriangleIcon } from '../components/icons';

// Interfaces para participantes
interface Participante {
  id: string;
  nombre: string;
  email?: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  estado_participante?: string;
  productos_relacionados?: string[];
  fecha_ultima_participacion?: string;
  total_participaciones?: number;
  comentarios?: string;
  doleres_necesidades?: string;
  created_at: string;
  updated_at: string;
}

// Interfaces para filtros de participantes
interface FilterValuesParticipantes {
  busqueda?: string;
  tipo?: string | 'todos';
  estado_participante?: string | 'todos';
  rol_empresa?: string | 'todos';
  empresa?: string | 'todos';
  departamento?: string | 'todos';
  fecha_registro_desde?: string;
  fecha_registro_hasta?: string;
  fecha_ultima_participacion_desde?: string;
  fecha_ultima_participacion_hasta?: string;
  total_participaciones_min?: string;
  total_participaciones_max?: string;
  tiene_email?: string | 'todos'; // 'todos' | 'con_email' | 'sin_email'
  tiene_productos?: string | 'todos'; // 'todos' | 'con_productos' | 'sin_productos'
}

export default function ParticipantesPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  // Estados principales
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('externos');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showModalExterno, setShowModalExterno] = useState(false);
  const [showModalInterno, setShowModalInterno] = useState(false);
  const [showModalFriendFamily, setShowModalFriendFamily] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalErrorEliminar, setShowModalErrorEliminar] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [participanteParaEditar, setParticipanteParaEditar] = useState<any>(null);
  const [participanteParaEliminar, setParticipanteParaEliminar] = useState<any>(null);
  const [errorEliminacion, setErrorEliminacion] = useState<any>(null);
  const [eliminandoParticipante, setEliminandoParticipante] = useState(false);
  
  // Estados para catálogos de filtros
  const [estadosParticipante, setEstadosParticipante] = useState<Array<{ value: string; label: string }>>([]);
  const [rolesEmpresa, setRolesEmpresa] = useState<Array<{ value: string; label: string }>>([]);
  const [empresas, setEmpresas] = useState<Array<{ value: string; label: string }>>([]);
  const [departamentos, setDepartamentos] = useState<Array<{ value: string; label: string }>>([]);
  
  // Estados para filtros específicos por tipo
  const [filtersExternos, setFiltersExternos] = useState<FilterValuesParticipantes>({
    busqueda: '',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    empresa: 'todos',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos',
    tiene_productos: 'todos'
  });
  
  const [filtersInternos, setFiltersInternos] = useState<FilterValuesParticipantes>({
    busqueda: '',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    departamento: 'todos',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos'
  });
  
  const [filtersFriendFamily, setFiltersFriendFamily] = useState<FilterValuesParticipantes>({
    busqueda: '',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    departamento: 'todos',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos'
  });
  const [filters, setFilters] = useState<FilterValuesParticipantes>({
    busqueda: '',
    tipo: 'todos',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    empresa: 'todos',
    departamento: 'todos',
    fecha_registro_desde: '',
    fecha_registro_hasta: '',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos',
    tiene_productos: 'todos'
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarParticipantes();
    cargarCatalogos();
  }, []);



  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const cargarParticipantes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/participantes-todos');
      if (response.ok) {
        const data = await response.json();
        setParticipantes(data.participantes || []);
      } else {
        console.error('Error cargando participantes:', response.status);
        showError('Error al cargar participantes');
      }
    } catch (error) {
      console.error('Error cargando participantes:', error);
      showError('Error al cargar participantes');
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      // Cargar estados de participante
      const responseEstados = await fetch('/api/estados-participante');
      if (responseEstados.ok) {
        const dataEstados = await responseEstados.json();
        setEstadosParticipante([
          { value: 'todos', label: 'Todos' },
          ...dataEstados.map((estado: any) => ({ value: estado.nombre, label: estado.nombre }))
        ]);
      }

      // Cargar roles de empresa
      const responseRoles = await fetch('/api/roles-empresa');
      if (responseRoles.ok) {
        const dataRoles = await responseRoles.json();
        setRolesEmpresa([
          { value: 'todos', label: 'Todos' },
          ...dataRoles.map((rol: any) => ({ value: rol.nombre, label: rol.nombre }))
        ]);
      }

      // Cargar empresas
      const responseEmpresas = await fetch('/api/empresas');
      if (responseEmpresas.ok) {
        const dataEmpresas = await responseEmpresas.json();
        setEmpresas([
          { value: 'todos', label: 'Todas' },
          ...dataEmpresas.map((empresa: any) => ({ value: empresa.nombre, label: empresa.nombre }))
        ]);
      }

      // Cargar departamentos
      const responseDepartamentos = await fetch('/api/departamentos');
      if (responseDepartamentos.ok) {
        const dataDepartamentos = await responseDepartamentos.json();
        setDepartamentos([
          { value: 'todos', label: 'Todos' },
          ...dataDepartamentos.map((departamento: any) => ({ value: departamento.nombre, label: departamento.nombre }))
        ]);
      }
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  // Filtrar participantes por tipo
  const participantesExternos = participantes.filter(p => p.tipo === 'externo');
  const participantesInternos = participantes.filter(p => p.tipo === 'interno');
  const participantesFriendFamily = participantes.filter(p => p.tipo === 'friend_family');

  // Función para filtrar participantes según el tab activo y filtros específicos
  const getFilteredParticipantes = (tipo: string) => {
    let participantesFiltrados = participantes.filter(p => p.tipo === tipo);
    
    // Obtener filtros específicos según el tipo
    let currentFilters: FilterValuesParticipantes;
    switch (tipo) {
      case 'externo':
        currentFilters = filtersExternos;
        break;
      case 'interno':
        currentFilters = filtersInternos;
        break;
      case 'friend_family':
        currentFilters = filtersFriendFamily;
        break;
      default:
        currentFilters = filters;
    }
    
    // Aplicar filtros de búsqueda
    if (currentFilters.busqueda) {
      participantesFiltrados = participantesFiltrados.filter(participante => 
        participante.nombre.toLowerCase().includes(currentFilters.busqueda!.toLowerCase()) ||
        participante.email?.toLowerCase().includes(currentFilters.busqueda!.toLowerCase()) ||
        participante.empresa_nombre?.toLowerCase().includes(currentFilters.busqueda!.toLowerCase()) ||
        participante.departamento_nombre?.toLowerCase().includes(currentFilters.busqueda!.toLowerCase())
      );
    }

    // Aplicar filtros específicos
    // Estado solo para participantes externos
    if (tipo === 'externo' && currentFilters.estado_participante && currentFilters.estado_participante !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.estado_participante === currentFilters.estado_participante
      );
    }

    if (currentFilters.rol_empresa && currentFilters.rol_empresa !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.rol_empresa === currentFilters.rol_empresa
      );
    }

    if (currentFilters.empresa && currentFilters.empresa !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.empresa_nombre === currentFilters.empresa
      );
    }

    if (currentFilters.departamento && currentFilters.departamento !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.departamento_nombre === currentFilters.departamento
      );
    }

    if (currentFilters.fecha_ultima_participacion_desde) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.fecha_ultima_participacion && new Date(p.fecha_ultima_participacion) >= new Date(currentFilters.fecha_ultima_participacion_desde!)
      );
    }

    if (currentFilters.fecha_ultima_participacion_hasta) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.fecha_ultima_participacion && new Date(p.fecha_ultima_participacion) <= new Date(currentFilters.fecha_ultima_participacion_hasta!)
      );
    }

    if (currentFilters.total_participaciones_min) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        (p.total_participaciones || 0) >= parseInt(currentFilters.total_participaciones_min!)
      );
    }

    if (currentFilters.total_participaciones_max) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        (p.total_participaciones || 0) <= parseInt(currentFilters.total_participaciones_max!)
      );
    }

    if (currentFilters.tiene_email && currentFilters.tiene_email !== 'todos') {
      if (currentFilters.tiene_email === 'con_email') {
        participantesFiltrados = participantesFiltrados.filter(p => p.email);
      } else {
        participantesFiltrados = participantesFiltrados.filter(p => !p.email);
      }
    }

    if (currentFilters.tiene_productos && currentFilters.tiene_productos !== 'todos') {
      if (currentFilters.tiene_productos === 'con_productos') {
        participantesFiltrados = participantesFiltrados.filter(p => 
          p.productos_relacionados && p.productos_relacionados.length > 0
        );
      } else {
        participantesFiltrados = participantesFiltrados.filter(p => 
          !p.productos_relacionados || p.productos_relacionados.length === 0
        );
      }
    }

    return participantesFiltrados;
  };

  // Obtener participantes filtrados según el tab activo
  const filteredParticipantes = getFilteredParticipantes(activeTab);

  // Calcular métricas
  const metricas = {
    total: participantes.length,
    externos: participantes.filter(p => p.tipo === 'externo').length,
    internos: participantes.filter(p => p.tipo === 'interno').length,
    friendFamily: participantes.filter(p => p.tipo === 'friend_family').length,
    activos: participantes.filter(p => p.estado_participante === 'Activo').length,
    inactivos: participantes.filter(p => p.estado_participante === 'Inactivo').length,
    porcentajeActivos: participantes.length > 0 ? Math.round((participantes.filter(p => p.estado_participante === 'Activo').length / participantes.length) * 100) : 0
  };

  // Acciones
  const handleCrearParticipante = () => {
    // Esta función ya no se usa directamente, se usa el dropdown
  };

  const handleCrearParticipanteExterno = () => {
    setShowModalExterno(true);
  };

  const handleCrearParticipanteInterno = () => {
    setShowModalInterno(true);
  };

  const handleCrearParticipanteFriendFamily = () => {
    setShowModalFriendFamily(true);
  };

  const handleParticipanteCreado = () => {
    cargarParticipantes();
  };

  const handleVerParticipante = (participante: Participante) => {
    router.push(`/participantes/${participante.id}`);
  };

  const handleEditarParticipante = (participante: Participante) => {
    setParticipanteParaEditar(participante);
    setShowModalEditar(true);
  };

  const handleEliminarParticipante = (participante: Participante) => {
    setParticipanteParaEliminar(participante);
    setShowModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!participanteParaEliminar) return;
    
    try {
      setEliminandoParticipante(true);
      
      const response = await fetch(`/api/participantes/eliminar?id=${participanteParaEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Participante eliminado correctamente');
        setShowModalEliminar(false);
        setParticipanteParaEliminar(null);
        // Recargar la lista de participantes
        cargarParticipantes();
      } else {
        const errorData = await response.json();
        
        // Si es un error de participaciones asociadas, mostrar modal específico
        if (errorData.participaciones && errorData.participaciones > 0) {
          setErrorEliminacion({
            message: errorData.error,
            detail: errorData.detail,
            participaciones: errorData.participaciones,
            investigaciones: errorData.investigaciones
          });
          setShowModalEliminar(false);
          setShowModalErrorEliminar(true);
        } else {
          showError(errorData.error || 'Error al eliminar participante');
          if (errorData.detail) {
            showError(errorData.detail);
          }
        }
      }
    } catch (error) {
      console.error('Error eliminando participante:', error);
      showError('Error al eliminar participante');
    } finally {
      setEliminandoParticipante(false);
    }
  };

  const handleCrearDolor = (participante: Participante) => {
    // Redirigir al detalle del participante con el tab de dolores activo
    router.push(`/participantes/${participante.id}?tab=dolores`);
  };

  const handleCrearComentario = (participante: Participante) => {
    // Redirigir al detalle del participante con el tab de comentarios activo
    router.push(`/participantes/${participante.id}?tab=comentarios`);
  };

  // Funciones para manejar filtros
  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  const handleFiltersChange = (newFilters: FilterValuesParticipantes) => {
    // Actualizar filtros según el tab activo
    switch (activeTab) {
      case 'externos':
        setFiltersExternos(newFilters);
        break;
      case 'internos':
        setFiltersInternos(newFilters);
        break;
      case 'friend_family':
        setFiltersFriendFamily(newFilters);
        break;
      default:
        setFilters(newFilters);
    }
  };

  const getActiveFiltersCount = () => {
    // Obtener filtros según el tab activo
    let currentFilters: FilterValuesParticipantes;
    switch (activeTab) {
      case 'externos':
        currentFilters = filtersExternos;
        break;
      case 'internos':
        currentFilters = filtersInternos;
        break;
      case 'friend_family':
        currentFilters = filtersFriendFamily;
        break;
      default:
        currentFilters = filters;
    }
    
    let count = 0;
    if (currentFilters.busqueda) count++;
    // Estado solo para participantes externos
    if (activeTab === 'externos' && currentFilters.estado_participante && currentFilters.estado_participante !== 'todos') count++;
    if (currentFilters.rol_empresa && currentFilters.rol_empresa !== 'todos') count++;
    if (currentFilters.empresa && currentFilters.empresa !== 'todos') count++;
    if (currentFilters.departamento && currentFilters.departamento !== 'todos') count++;
    if (currentFilters.fecha_ultima_participacion_desde) count++;
    if (currentFilters.fecha_ultima_participacion_hasta) count++;
    if (currentFilters.total_participaciones_min) count++;
    if (currentFilters.total_participaciones_max) count++;
    if (currentFilters.tiene_email && currentFilters.tiene_email !== 'todos') count++;
    if (currentFilters.tiene_productos && currentFilters.tiene_productos !== 'todos') count++;
    return count;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'externo': return <BuildingIcon className="w-4 h-4" />;
      case 'interno': return <UsersIcon className="w-4 h-4" />;
      case 'friend_family': return <UserIcon className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'externo': return 'primary';
      case 'interno': return 'secondary';
      case 'friend_family': return 'success';
      default: return 'default';
    }
  };

  const getEstadoColor = (estado?: string) => {
    if (!estado) return 'default';
    switch (estado.toLowerCase()) {
      case 'activo': return 'success';
      case 'inactivo': return 'warning';
      case 'disponible': return 'success';
      case 'enfriamiento': return 'warning';
      default: return 'default';
    }
  };

  // Definición de columnas para participantes externos
  const columnsExternos = [
    {
      key: 'nombre',
      label: 'Participante',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.nombre || 'Sin nombre'}
            </div>
            {row.email && (
              <div className="text-sm text-gray-500">
                {row.email}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'empresa',
      label: 'Empresa',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.empresa_nombre || 'Sin empresa'}
          </div>
        );
      }
    },
    {
      key: 'rol_empresa',
      label: 'Rol',
      sortable: false,
      width: 'w-48',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.rol_empresa || 'Sin rol'}
          </div>
        );
      }
    },
    {
      key: 'estado_participante',
      label: 'Estado',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row || !row.estado_participante) {
          return <div className="text-gray-400">-</div>;
        }
        return (
          <Badge variant={getEstadoColor(row.estado_participante) as any} size="sm">
            {row.estado_participante}
          </Badge>
        );
      }
    },
    {
      key: 'total_participaciones',
      label: 'Participaciones',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.total_participaciones || 0}
            </div>
            <div className="text-xs text-gray-500">sesiones</div>
          </div>
        );
      }
    },
    {
      key: 'fecha_ultima_participacion',
      label: 'Última Participación',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.fecha_ultima_participacion) {
          return <div className="text-gray-400">Sin participaciones</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.fecha_ultima_participacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.created_at) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      width: 'w-20',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <ActionsMenu
            actions={[
              {
                label: 'Ver detalles',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleVerParticipante(row)
              },
              {
                label: 'Editar',
                icon: <EditIcon className="w-4 h-4" />,
                onClick: () => handleEditarParticipante(row)
              },
              {
                label: 'Crear Dolor',
                icon: <AlertTriangleIcon className="w-4 h-4" />,
                onClick: () => handleCrearDolor(row),
                className: 'text-orange-600 hover:text-orange-700'
              },
              {
                label: 'Crear Comentario',
                icon: <MessageIcon className="w-4 h-4" />,
                onClick: () => handleCrearComentario(row),
                className: 'text-blue-600 hover:text-blue-700'
              },
              {
                label: 'Eliminar',
                icon: <TrashIcon className="w-4 h-4" />,
                onClick: () => handleEliminarParticipante(row),
                className: 'text-red-600 hover:text-red-700'
              }
            ]}
          />
        );
      }
    }
  ];

  // Definición de columnas para participantes internos
  const columnsInternos = [
    {
      key: 'nombre',
      label: 'Participante',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.nombre || 'Sin nombre'}
            </div>
            {row.email && (
              <div className="text-sm text-gray-500">
                {row.email}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'departamento',
      label: 'Departamento',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.departamento_nombre || 'Sin departamento'}
          </div>
        );
      }
    },
    {
      key: 'rol_empresa',
      label: 'Rol',
      sortable: false,
      width: 'w-48',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.rol_empresa || 'Sin rol'}
          </div>
        );
      }
    },
    {
      key: 'total_participaciones',
      label: 'Participaciones',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.total_participaciones || 0}
            </div>
            <div className="text-xs text-gray-500">sesiones</div>
          </div>
        );
      }
    },
    {
      key: 'fecha_ultima_participacion',
      label: 'Última Participación',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.fecha_ultima_participacion) {
          return <div className="text-gray-400">Sin participaciones</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.fecha_ultima_participacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.created_at) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      width: 'w-20',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <ActionsMenu
            actions={[
              {
                label: 'Ver detalles',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleVerParticipante(row)
              },
              {
                label: 'Editar',
                icon: <EditIcon className="w-4 h-4" />,
                onClick: () => handleEditarParticipante(row)
              },
              {
                label: 'Crear Dolor',
                icon: <AlertTriangleIcon className="w-4 h-4" />,
                onClick: () => handleCrearDolor(row),
                className: 'text-orange-600 hover:text-orange-700'
              },
              {
                label: 'Crear Comentario',
                icon: <MessageIcon className="w-4 h-4" />,
                onClick: () => handleCrearComentario(row),
                className: 'text-blue-600 hover:text-blue-700'
              },
              {
                label: 'Eliminar',
                icon: <TrashIcon className="w-4 h-4" />,
                onClick: () => handleEliminarParticipante(row),
                className: 'text-red-600 hover:text-red-700'
              }
            ]}
          />
        );
      }
    }
  ];

  // Definición de columnas para friend & family (similar a internos)
  const columnsFriendFamily = [
    {
      key: 'nombre',
      label: 'Participante',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.nombre || 'Sin nombre'}
            </div>
            {row.email && (
              <div className="text-sm text-gray-500">
                {row.email}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'departamento',
      label: 'Departamento',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.departamento_nombre || 'Sin departamento'}
          </div>
        );
      }
    },
    {
      key: 'rol_empresa',
      label: 'Rol',
      sortable: false,
      width: 'w-48',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.rol_empresa || 'Sin rol'}
          </div>
        );
      }
    },
    {
      key: 'total_participaciones',
      label: 'Participaciones',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.total_participaciones || 0}
            </div>
            <div className="text-xs text-gray-500">sesiones</div>
          </div>
        );
      }
    },
    {
      key: 'fecha_ultima_participacion',
      label: 'Última Participación',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.fecha_ultima_participacion) {
          return <div className="text-gray-400">Sin participaciones</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.fecha_ultima_participacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.created_at) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      width: 'w-20',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <ActionsMenu
            actions={[
              {
                label: 'Ver detalles',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleVerParticipante(row)
              },
              {
                label: 'Editar',
                icon: <EditIcon className="w-4 h-4" />,
                onClick: () => handleEditarParticipante(row)
              },
              {
                label: 'Crear Dolor',
                icon: <AlertTriangleIcon className="w-4 h-4" />,
                onClick: () => handleCrearDolor(row),
                className: 'text-orange-600 hover:text-orange-700'
              },
              {
                label: 'Crear Comentario',
                icon: <MessageIcon className="w-4 h-4" />,
                onClick: () => handleCrearComentario(row),
                className: 'text-blue-600 hover:text-blue-700'
              },
              {
                label: 'Eliminar',
                icon: <TrashIcon className="w-4 h-4" />,
                onClick: () => handleEliminarParticipante(row),
                className: 'text-red-600 hover:text-red-700'
              }
            ]}
          />
        );
      }
    }
  ];

  // Función para obtener las columnas según el tab activo
  const getColumns = () => {
    switch (activeTab) {
      case 'externos':
        return columnsExternos;
      case 'internos':
        return columnsInternos;
      case 'friend_family':
        return columnsFriendFamily;
      default:
        return columnsExternos;
    }
  };

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h2" color="title" weight="bold">
                  Participantes
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Gestionar participantes de investigaciones
                </Typography>
              </div>
              <div className="relative dropdown-container">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nuevo Participante
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleCrearParticipanteExterno();
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <BuildingIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Cliente Externo</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Participantes de empresas externas</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleCrearParticipanteInterno();
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <UsersIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Cliente Interno</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Participantes de la empresa</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleCrearParticipanteFriendFamily();
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <UserIcon className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Friend and Family</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Participantes del programa FF</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-primary">
                    {metricas.total}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Participantes
                  </Typography>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-blue-600">
                    {metricas.externos}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Externos
                  </Typography>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BuildingIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-green-600">
                    {metricas.internos}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Internos
                  </Typography>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" weight="bold" className="text-purple-600">
                    {metricas.activos}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Activos ({metricas.porcentajeActivos}%)
                  </Typography>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs de Participantes */}
          <Tabs
            tabs={[
              {
                id: 'externos',
                label: 'Externos',
                icon: <BuildingIcon className="w-4 h-4" />,
                badge: participantesExternos.length,
                content: (
                  <div className="space-y-6">
                    {/* Barra de búsqueda y filtro al estilo gestión de usuarios */}
                    <Card variant="elevated" padding="md" className="mb-6">
                      <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Buscar participantes externos..."
                            value={filtersExternos.busqueda}
                            onChange={(e) => handleFiltersChange({ ...filtersExternos, busqueda: e.target.value })}
                            className="pl-10 pr-4 py-2"
                            icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                            iconPosition="left"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={getActiveFiltersCount() > 0 ? "primary" : "secondary"}
                            onClick={handleOpenFilters}
                            className="relative flex items-center gap-2"
                          >
                            <FilterIcon className="w-4 h-4" />
                            Filtros Avanzados
                            {getActiveFiltersCount() > 0 && (
                              <span className="ml-2 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                                {getActiveFiltersCount()}
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Tabla de Participantes Externos */}
                    <DataTable
                      data={getFilteredParticipantes('externo')}
                      columns={columnsExternos}
                      loading={loading}
                      searchable={false}
                      filterable={false}
                      selectable={false}
                      onRowClick={handleVerParticipante}
                      emptyMessage="No se encontraron participantes externos"
                      loadingMessage="Cargando participantes externos..."
                      rowKey="id"
                    />
                  </div>
                )
              },
              {
                id: 'internos',
                label: 'Internos',
                icon: <UsersIcon className="w-4 h-4" />,
                badge: participantesInternos.length,
                content: (
                  <div className="space-y-6">
                    {/* Barra de búsqueda y filtro al estilo gestión de usuarios */}
                    <Card variant="elevated" padding="md" className="mb-6">
                      <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Buscar participantes internos..."
                            value={filtersInternos.busqueda}
                            onChange={(e) => handleFiltersChange({ ...filtersInternos, busqueda: e.target.value })}
                            className="pl-10 pr-4 py-2"
                            icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                            iconPosition="left"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={getActiveFiltersCount() > 0 ? "primary" : "secondary"}
                            onClick={handleOpenFilters}
                            className="relative flex items-center gap-2"
                          >
                            <FilterIcon className="w-4 h-4" />
                            Filtros Avanzados
                            {getActiveFiltersCount() > 0 && (
                              <span className="ml-2 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                                {getActiveFiltersCount()}
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Tabla de Participantes Internos */}
                    <DataTable
                      data={getFilteredParticipantes('interno')}
                      columns={columnsInternos}
                      loading={loading}
                      searchable={false}
                      filterable={false}
                      selectable={false}
                      onRowClick={handleVerParticipante}
                      emptyMessage="No se encontraron participantes internos"
                      loadingMessage="Cargando participantes internos..."
                      rowKey="id"
                    />
                  </div>
                )
              },
              {
                id: 'friend_family',
                label: 'Friend & Family',
                icon: <UserIcon className="w-4 h-4" />,
                badge: participantesFriendFamily.length,
                content: (
                  <div className="space-y-6">
                    {/* Barra de búsqueda y filtro al estilo gestión de usuarios */}
                    <Card variant="elevated" padding="md" className="mb-6">
                      <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Buscar participantes friend & family..."
                            value={filtersFriendFamily.busqueda}
                            onChange={(e) => handleFiltersChange({ ...filtersFriendFamily, busqueda: e.target.value })}
                            className="pl-10 pr-4 py-2"
                            icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                            iconPosition="left"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={getActiveFiltersCount() > 0 ? "primary" : "secondary"}
                            onClick={handleOpenFilters}
                            className="relative flex items-center gap-2"
                          >
                            <FilterIcon className="w-4 h-4" />
                            Filtros Avanzados
                            {getActiveFiltersCount() > 0 && (
                              <span className="ml-2 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                                {getActiveFiltersCount()}
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Tabla de Participantes Friend & Family */}
                    <DataTable
                      data={getFilteredParticipantes('friend_family')}
                      columns={columnsFriendFamily}
                      loading={loading}
                      searchable={false}
                      filterable={false}
                      selectable={false}
                      onRowClick={handleVerParticipante}
                      emptyMessage="No se encontraron participantes friend & family"
                      loadingMessage="Cargando participantes friend & family..."
                      rowKey="id"
                    />
                  </div>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            fullWidth={true}
          />

          {/* Drawer de filtros avanzados */}
          <FilterDrawer
            isOpen={showFilterDrawer}
            onClose={handleCloseFilters}
            filters={
              activeTab === 'externos' ? filtersExternos :
              activeTab === 'internos' ? filtersInternos :
              activeTab === 'friend_family' ? filtersFriendFamily :
              filters
            }
            onFiltersChange={handleFiltersChange}
            type="participante"
            participanteType={activeTab as 'externos' | 'internos' | 'friend_family'}
            options={{
              estados: estadosParticipante,
              roles: rolesEmpresa,
              empresas: empresas,
              departamentos: departamentos,
              tieneEmail: [
                { value: 'todos', label: 'Todos' },
                { value: 'con_email', label: 'Con email' },
                { value: 'sin_email', label: 'Sin email' }
              ],
              tieneProductos: [
                { value: 'todos', label: 'Todos' },
                { value: 'con_productos', label: 'Con productos' },
                { value: 'sin_productos', label: 'Sin productos' }
              ]
            }}
          />

          {/* Modales para crear participantes */}
          <CrearParticipanteExternoModal
            isOpen={showModalExterno}
            onClose={() => setShowModalExterno(false)}
            onSuccess={handleParticipanteCreado}
          />

          <CrearParticipanteInternoModal
            isOpen={showModalInterno}
            onClose={() => setShowModalInterno(false)}
            onSuccess={handleParticipanteCreado}
          />

          <CrearParticipanteFriendFamilyModal
            isOpen={showModalFriendFamily}
            onClose={() => setShowModalFriendFamily(false)}
            onSuccess={handleParticipanteCreado}
          />

          <EditarParticipanteModal
            isOpen={showModalEditar}
            onClose={() => {
              setShowModalEditar(false);
              setParticipanteParaEditar(null);
            }}
            onSuccess={handleParticipanteCreado}
            participante={participanteParaEditar}
          />

          {/* Modal de confirmación de eliminación */}
          <ConfirmarEliminacionModal
            isOpen={showModalEliminar}
            onClose={() => {
              setShowModalEliminar(false);
              setParticipanteParaEliminar(null);
            }}
            onConfirm={confirmarEliminacion}
            participante={participanteParaEliminar}
            loading={eliminandoParticipante}
          />

          {/* Modal de error de eliminación */}
          <ErrorEliminacionModal
            isOpen={showModalErrorEliminar}
            onClose={() => {
              setShowModalErrorEliminar(false);
              setParticipanteParaEliminar(null);
              setErrorEliminacion(null);
            }}
            participante={participanteParaEliminar}
            error={errorEliminacion}
          />
        </div>
      </div>
    </Layout>
  );
} 