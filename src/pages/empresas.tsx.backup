import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { usePermisos } from '../utils/permisosUtils';

import { Layout } from '../components/ui';
import Typography from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import DataTable from '../components/ui/DataTable';
import Input from '../components/ui/Input';
import ConfirmModal from '../components/ui/ConfirmModal';
import Badge from '../components/ui/Badge';
import FilterDrawer from '../components/ui/FilterDrawer';
import Chip from '../components/ui/Chip';
import SimpleAvatar from '../components/ui/SimpleAvatar';
import ActionsMenu from '../components/ui/ActionsMenu';
import GroupedActions from '../components/ui/GroupedActions';
import SideModal from '../components/ui/SideModal';
import { InlineSelect, InlineDate } from '../components/ui/InlineEdit';
import InlineUserSelect from '../components/ui/InlineUserSelect';
import EmpresaSideModal from '../components/empresas/EmpresaSideModal';
import EmpresaViewModal from '../components/empresas/EmpresaViewModal';
import { 
  SearchIcon, 
  PlusIcon, 
  MoreVerticalIcon, 
  EditIcon, 
  CopyIcon, 
  BuildingIcon, 
  LinkIcon, 
  BarChartIcon, 
  TrashIcon, 
  EyeIcon, 
  FilterIcon, 
  UserIcon, 
  EmpresasIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  ClipboardListIcon, 
  InfoIcon,
  XIcon,
  SaveIcon,
  CalendarIcon,
  PhoneIcon,
  EmailIcon
} from '../components/icons';
import { formatearFecha } from '../utils/fechas';

// Interfaces para empresas
interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  // Información del KAM
  kam_id?: string;
  kam_nombre?: string;
  kam_email?: string;
  // Información del país
  pais_id?: string;
  pais_nombre?: string;
  // Información de la industria
  industria_id?: string;
  industria_nombre?: string;
  // Información del estado
  estado_id?: string;
  estado_nombre?: string;
  // Información del tamaño
  tamano_id?: string;
  tamano_nombre?: string;
  // Información de la modalidad
  modalidad_id?: string;
  modalidad_nombre?: string;
  // Información de la relación
  relacion_id?: string;
  relacion_nombre?: string;
  // Información del producto
  producto_id?: string;
  producto_nombre?: string;
  // Campos adicionales para compatibilidad
  sector?: string;
  tamano?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface Usuario {
  id: string;
  nombre: string | null;
  correo: string | null;
  foto_url: string | null;
}

// Tipos para filtros
interface FilterValuesEmpresa {
  busqueda?: string;
  estado?: string;
  sector?: string;
  tamano?: string;
  pais?: string;
  kam_id?: string;
  activo?: boolean;
  industria?: string;
  modalidad?: string;
  relacion?: string;
  producto?: string;
}

interface FilterOptions {
  estados: { value: string; label: string }[];
  sectores: { value: string; label: string }[];
  tamanos: { value: string; label: string }[];
  paises: { value: string; label: string }[];
  kams: { value: string; label: string }[];
  industrias: { value: string; label: string }[];
  modalidades: { value: string; label: string }[];
  relaciones: { value: string; label: string }[];
  productos: { value: string; label: string }[];
}

interface EmpresasPageProps {
  initialEmpresas: Empresa[];
}

export default function EmpresasPage({ initialEmpresas }: EmpresasPageProps) {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const { userProfile } = useUser();
  const { tienePermiso } = usePermisos();
  const router = useRouter();
  
  // Estados principales
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [loading, setLoading] = useState(initialEmpresas.length === 0);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    estados: [],
    sectores: [],
    tamanos: [],
    paises: [],
    kams: [],
    industrias: [],
    modalidades: [],
    relaciones: [],
    productos: []
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValuesEmpresa>({
    busqueda: '',
    estado: 'todos',
    sector: 'todos',
    tamano: 'todos',
    pais: 'todos',
    kam_id: 'todos',
    activo: undefined,
    industria: 'todos',
    modalidad: 'todos',
    relacion: 'todos',
    producto: 'todos'
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);

  // Estados para formularios
  const [formData, setFormData] = useState<Partial<Empresa>>({});
  const [saving, setSaving] = useState(false);

  // Referencias
  const tableRef = useRef<any>(null);

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🔄 useEffect ejecutándose - cargando datos iniciales');
    if (initialEmpresas.length > 0) {
      console.log('✅ Empresas ya cargadas desde SSR:', initialEmpresas.length);
      setLoading(false);
    } else {
      cargarDatos();
    }
  }, [initialEmpresas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando carga de datos...');
      
      // Cargar empresas, usuarios y opciones de filtros
      await Promise.all([
        cargarEmpresas(),
        cargarUsuarios(),
        cargarOpcionesFiltros()
      ]);
      
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
      console.log('🏁 Carga de datos completada');
    }
  };

  const cargarEmpresas = async () => {
    try {
      console.log('🔄 Cargando empresas...');
      
      const response = await fetch('http://localhost:3000/api/empresas');
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        console.log('📊 Número de empresas:', data?.length || 0);
        setEmpresas(data || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Error cargando empresas:', response.status, errorData);
        showError('Error al cargar empresas');
      }
    } catch (error) {
      console.error('❌ Error cargando empresas:', error);
      showError('Error al cargar empresas');
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const cargarOpcionesFiltros = async () => {
    try {
      console.log('🔧 Cargando opciones de filtros...');
      
      // Cargar cada API por separado para mejor manejo de errores
      const estadosRes = await fetch('/api/estados-empresa');
      const estados = estadosRes.ok ? await estadosRes.json() : [];
      console.log('✅ Estados cargados:', estados.length);
      
      const paisesRes = await fetch('/api/paises');
      const paises = paisesRes.ok ? await paisesRes.json() : [];
      console.log('✅ Países cargados:', paises.length);
      
      const industriasRes = await fetch('/api/industrias');
      const industrias = industriasRes.ok ? await industriasRes.json() : [];
      console.log('✅ Industrias cargadas:', industrias.length);
      
      const tamanosRes = await fetch('/api/tamanos-empresa');
      const tamanos = tamanosRes.ok ? await tamanosRes.json() : [];
      console.log('✅ Tamaños cargados:', tamanos.length);
      
      const modalidadesRes = await fetch('/api/modalidades');
      const modalidades = modalidadesRes.ok ? await modalidadesRes.json() : [];
      console.log('✅ Modalidades cargadas:', modalidades.length);
      
      const relacionesRes = await fetch('/api/relaciones-empresa');
      const relaciones = relacionesRes.ok ? await relacionesRes.json() : [];
      console.log('✅ Relaciones cargadas:', relaciones.length);
      
      const productosRes = await fetch('/api/productos');
      const productos = productosRes.ok ? await productosRes.json() : [];
      console.log('✅ Productos cargados:', productos.length);

      setFilterOptions({
        estados: estados.map((e: any) => ({ value: e.id, label: e.nombre })),
        sectores: industrias.map((i: any) => ({ value: i.id, label: i.nombre })),
        tamanos: tamanos.map((t: any) => ({ value: t.id, label: t.nombre })),
        paises: paises.map((p: any) => ({ value: p.id, label: p.nombre })),
        kams: usuarios.map((u: any) => ({ value: u.id, label: u.nombre || u.correo })),
        industrias: industrias.map((i: any) => ({ value: i.id, label: i.nombre })),
        modalidades: modalidades.map((m: any) => ({ value: m.id, label: m.nombre })),
        relaciones: relaciones.map((r: any) => ({ value: r.id, label: r.nombre })),
        productos: productos.map((p: any) => ({ value: p.id, label: p.nombre }))
      });
      
      console.log('✅ Opciones de filtros configuradas');
    } catch (error) {
      console.error('❌ Error cargando opciones de filtros:', error);
    }


  // Función para filtrar empresas
  const filtrarEmpresas = useCallback((empresas: Empresa[], searchTerm: string, filters: FilterValuesEmpresa) => {
    let filtradas = [...empresas];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(emp => 
        emp?.nombre?.toLowerCase().includes(termino) ||
        emp?.descripcion?.toLowerCase().includes(termino) ||
        emp?.kam_nombre?.toLowerCase().includes(termino) ||
        emp?.pais_nombre?.toLowerCase().includes(termino) ||
        emp?.industria_nombre?.toLowerCase().includes(termino)
      );
    }
    
    // Filtrar por estado
    if (filters.estado && filters.estado !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.estado_nombre === filters.estado);
    }
    
    // Filtrar por sector/industria
    if (filters.sector && filters.sector !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.industria_id === filters.sector);
    }
    
    // Filtrar por tamaño
    if (filters.tamano && filters.tamano !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.tamano_id === filters.tamano);
    }
    
    // Filtrar por país
    if (filters.pais && filters.pais !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.pais_id === filters.pais);
    }
    
    // Filtrar por KAM
    if (filters.kam_id && filters.kam_id !== 'todos') {
      filtradas = filtradas.filter(emp => emp?.kam_id === filters.kam_id);
    }
    
    // Filtrar por estado activo/inactivo
    if (filters.activo !== undefined) {
      filtradas = filtradas.filter(emp => emp?.activo === filters.activo);
    }
    
    return filtradas;
  }, []);

  // Empresas filtradas
  const empresasFiltradas = useMemo(() => {
    return filtrarEmpresas(empresas, searchTerm, filters);
  }, [empresas, searchTerm, filters, filtrarEmpresas]);

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.estado && filters.estado !== 'todos') count++;
    if (filters.sector && filters.sector !== 'todos') count++;
    if (filters.tamano && filters.tamano !== 'todos') count++;
    if (filters.pais && filters.pais !== 'todos') count++;
    if (filters.kam_id && filters.kam_id !== 'todos') count++;
    if (filters.activo !== undefined) count++;
    return count;
  };

  // Handlers para filtros
  const handleOpenFilters = () => setShowFilterDrawer(true);
  const handleCloseFilters = () => setShowFilterDrawer(false);

  const handleFiltersChange = (newFilters: FilterValuesEmpresa) => {
    setFilters(newFilters);
  };

  // Handlers para acciones
  const handleCreateEmpresa = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setFormData(empresa);
    setShowEditModal(true);
  };

  const handleViewEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setShowViewModal(true);
  };

  const handleDeleteEmpresa = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
  };

  const handleDuplicateEmpresa = (empresa: Empresa) => {
    const empresaDuplicada = {
      ...empresa,
      id: '',
      nombre: `${empresa.nombre} (Copia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFormData(empresaDuplicada);
    setShowCreateModal(true);
  };

  const confirmDelete = async () => {
    if (!empresaToDelete) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/empresas?id=${empresaToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showSuccess('Empresa eliminada correctamente');
        setEmpresas(prev => prev.filter(emp => emp.id !== empresaToDelete.id));
        setEmpresaToDelete(null);
      } else {
        showError('Error al eliminar la empresa');
      }
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      showError('Error al eliminar la empresa');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmpresa = async (data: Partial<Empresa>) => {
    try {
      setSaving(true);
      const isEditing = !!selectedEmpresa;
      const url = '/api/empresas';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const savedEmpresa = await response.json();
        showSuccess(`Empresa ${isEditing ? 'actualizada' : 'creada'} correctamente`);
        
        if (isEditing) {
          setEmpresas(prev => prev.map(emp => emp.id === selectedEmpresa.id ? savedEmpresa : emp));
          setShowEditModal(false);
        } else {
          setEmpresas(prev => [...prev, savedEmpresa]);
          setShowCreateModal(false);
        }
        
        setSelectedEmpresa(null);
        setFormData({});
      } else {
        showError('Error al guardar la empresa');
      }
    } catch (error) {
      console.error('Error guardando empresa:', error);
      showError('Error al guardar la empresa');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para actualizaciones en línea
  const handleInlineUpdate = async (empresaId: string, field: string, value: any) => {
    try {
      const response = await fetch('/api/empresas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: empresaId,
          [field]: value
        })
      });
      
      if (response.ok) {
        const updatedEmpresa = await response.json();
        setEmpresas(prev => prev.map(emp => emp.id === empresaId ? updatedEmpresa : emp));
        showSuccess('Empresa actualizada correctamente');
      } else {
        showError('Error al actualizar la empresa');
      }
    } catch (error) {
      console.error('Error actualizando empresa:', error);
      showError('Error al actualizar la empresa');
    }
  };

  // Definición de las columnas
  const columns = [
    {
      key: 'nombre',
      label: 'Empresa',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.nombre || 'Sin nombre'}
          </div>
        );
      }
    },
    {
      key: 'kam',
      label: 'KAM',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <SimpleAvatar
              src={row.kam_foto_url || null}
              fallbackText={row.kam_nombre || 'Sin asignar'}
              size="sm"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {row.kam_nombre || 'Sin asignar'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.estado_id}
            options={filterOptions.estados}
            onSave={(newValue) => handleInlineUpdate(row.id, 'estado_id', newValue)}
            useChip={true}
            getChipVariant={(value) => {
              const estado = filterOptions.estados.find(e => e.value === value);
              return estado?.label === 'activa' ? 'success' : 'warning';
            }}
            getChipText={(value) => {
              const estado = filterOptions.estados.find(e => e.value === value);
              return estado?.label === 'activa' ? 'Activa' : 'Inactiva';
            }}
          />
        );
      }
    },
    {
      key: 'pais',
      label: 'País',
      sortable: false,
      width: 'min-w-[140px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.pais_id}
            options={filterOptions.paises}
            onSave={(newValue) => handleInlineUpdate(row.id, 'pais_id', newValue)}
          />
        );
      }
    },
    {
      key: 'industria',
      label: 'Industria',
      sortable: false,
      width: 'min-w-[140px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.industria_id}
            options={filterOptions.industrias}
            onSave={(newValue) => handleInlineUpdate(row.id, 'industria_id', newValue)}
          />
        );
      }
    },
    {
      key: 'tamano',
      label: 'Tamaño',
      sortable: false,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.tamano_id}
            options={filterOptions.tamanos}
            onSave={(newValue) => handleInlineUpdate(row.id, 'tamano_id', newValue)}
          />
        );
      }
    },
    {
      key: 'modalidad',
      label: 'Modalidad',
      sortable: false,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.modalidad_id}
            options={filterOptions.modalidades}
            onSave={(newValue) => handleInlineUpdate(row.id, 'modalidad_id', newValue)}
          />
        );
      }
    },
    {
      key: 'relacion',
      label: 'Relación',
      sortable: false,
      width: 'min-w-[120px]',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <InlineSelect
            value={row.relacion_id}
            options={filterOptions.relaciones}
            onSave={(newValue) => handleInlineUpdate(row.id, 'relacion_id', newValue)}
          />
        );
      }
    },

    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      width: 'min-w-[120px]',
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
                onClick: () => handleViewEmpresa(row)
              },
              {
                label: 'Editar',
                icon: <EditIcon className="w-4 h-4" />,
                onClick: () => handleEditEmpresa(row)
              },
              {
                label: 'Duplicar',
                icon: <CopyIcon className="w-4 h-4" />,
                onClick: () => handleDuplicateEmpresa(row)
              },
                             {
                 label: 'Eliminar',
                 icon: <TrashIcon className="w-4 h-4" />,
                 onClick: () => handleDeleteEmpresa(row),
                 className: 'text-red-600 hover:text-red-700'
               }
            ]}
          />
        );
      }
    }
  ];

  // Acciones grupales
  const bulkActions = [
    {
      label: 'Eliminar seleccionadas',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (selectedIds: string[]) => {
        // Implementar eliminación masiva
        console.log('Eliminar empresas:', selectedIds);
      }
    }
  ];

  return (
    <>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h2" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Empresas
              </Typography>
              <Typography variant="body1" color="secondary">
                Gestiona las empresas de tu portafolio
              </Typography>
            </div>
            
                         <Button
               variant="primary"
               onClick={handleCreateEmpresa}
               className="flex items-center gap-2"
             >
               <PlusIcon className="w-4 h-4" />
               Crear Empresa
             </Button>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Empresas */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {empresas.length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Empresas
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900 bg-opacity-20' : 'bg-primary/10'}`}>
                  <BuildingIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Empresas Activas */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {empresas.filter(emp => emp.activo).length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Empresas Activas
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-success/10'}`}>
                  <CheckCircleIcon className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>

            {/* Empresas Inactivas */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {empresas.filter(emp => !emp.activo).length}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Empresas Inactivas
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-900 bg-opacity-20' : 'bg-warning/10'}`}>
                  <AlertTriangleIcon className="w-6 h-6 text-warning" />
                </div>
              </div>
            </Card>

            {/* Promedio por KAM */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {usuarios.length > 0 ? Math.round(empresas.length / usuarios.length) : 0}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Promedio por KAM
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900 bg-opacity-20' : 'bg-secondary/10'}`}>
                  <UserIcon className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Barra de búsqueda y filtro */}
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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

          {/* Tabla de empresas */}
          <DataTable
            data={empresasFiltradas}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            selectable={true}
            onSelectionChange={setSelectedEmpresas}
            emptyMessage="No se encontraron empresas"
            loadingMessage="Cargando empresas..."
            rowKey="id"
            bulkActions={bulkActions}
          />
        </div>
      </Layout>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!empresaToDelete}
        onClose={() => setEmpresaToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Empresa"
        message={`¿Estás seguro de que deseas eliminar la empresa "${empresaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="error"
        loading={saving}
      />

      {/* Drawer de filtros avanzados */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        type="empresa"
        options={{
          estados: filterOptions.estados,
          sectores: filterOptions.sectores,
          tamanos: filterOptions.tamanos,
          paises: filterOptions.paises,
          kams: filterOptions.kams,
          industrias: filterOptions.industrias,
          modalidades: filterOptions.modalidades,
          relaciones: filterOptions.relaciones,
          productos: filterOptions.productos
        }}
      />

             {/* Modales de creación/edición/vista */}
       <EmpresaSideModal
         isOpen={showCreateModal || showEditModal}
         onClose={() => {
           setShowCreateModal(false);
           setShowEditModal(false);
           setSelectedEmpresa(null);
           setFormData({});
         }}
         onSave={handleSaveEmpresa}
         empresa={selectedEmpresa}
         usuarios={usuarios}
         filterOptions={filterOptions}
         loading={saving}
       />

       <EmpresaViewModal
         isOpen={showViewModal}
         onClose={() => {
           setShowViewModal(false);
           setSelectedEmpresa(null);
         }}
         empresa={selectedEmpresa}
       />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    console.log('🔄 getServerSideProps ejecutándose para empresas');
    
    const response = await fetch('http://localhost:3000/api/empresas');
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Datos recibidos en SSR:', data?.length || 0);
      
      return {
        props: {
          initialEmpresas: data || []
        }
      };
    } else {
      console.error('❌ Error en SSR:', response.status);
      return {
        props: {
          initialEmpresas: []
        }
      };
    }
  } catch (error) {
    console.error('❌ Error en SSR:', error);
    return {
      props: {
        initialEmpresas: []
      }
    };
  }
};