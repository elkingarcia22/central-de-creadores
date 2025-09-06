import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Button, Chip, Subtitle, EmptyState } from '../ui';
import DataTable from '../ui/DataTable';
import ActionsMenu from '../ui/ActionsMenu';
import ConfirmModal from '../ui/ConfirmModal';
import Input from '../ui/Input';
import SeguimientosFilterDrawer, { FilterValuesSeguimientos } from '../ui/SeguimientosFilterDrawer';
import SeguimientoSideModal from '../ui/SeguimientoSideModal';
import VerSeguimientoSideModal from '../ui/VerSeguimientoSideModal';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  CopyIcon, 
  FileTextIcon, 
  UserIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  LinkIcon,
  ClipboardListIcon,
  MoreVerticalIcon
} from '../icons';
import { 
  obtenerSeguimientosPorInvestigacion,
  crearSeguimiento,
  actualizarSeguimiento,
  eliminarSeguimiento
} from '../../api/supabase-seguimientos';
import { formatearFecha } from '../../utils/fechas';
import type { SeguimientoInvestigacion, SeguimientoFormData } from '../../types/seguimientos';

interface SeguimientosSectionProps {
  investigacionId: string;
  investigacionNombre: string;
  investigacionEstado: string;
  usuarios: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  }>;
  tiposInvestigacion: Array<{
    value: string;
    label: string;
  }>;
  periodos: Array<{
    value: string;
    label: string;
  }>;
  onSeguimientoChange?: () => void;
}

import { getChipVariant, getChipText } from '../../utils/chipUtils';

const getEstadoBadgeVariant = (estado: string): any => {
  return getChipVariant(estado);
};

export const SeguimientosSection: React.FC<SeguimientosSectionProps> = ({
  investigacionId,
  investigacionNombre,
  investigacionEstado,
  usuarios,
  tiposInvestigacion,
  periodos,
  onSeguimientoChange
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [seguimientos, setSeguimientos] = useState<SeguimientoInvestigacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [seguimientoEditando, setSeguimientoEditando] = useState<SeguimientoInvestigacion | null>(null);
  const [seguimientoEliminar, setSeguimientoEliminar] = useState<SeguimientoInvestigacion | null>(null);
  const [seguimientoParaVer, setSeguimientoParaVer] = useState<SeguimientoInvestigacion | null>(null);
  const [showVerModal, setShowVerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filtersSeguimientos, setFiltersSeguimientos] = useState<FilterValuesSeguimientos>({
    busqueda: '',
    estado_seguimiento: 'todos',
    responsable_seguimiento: 'todos',
    participante_seguimiento: 'todos',
    investigacion_seguimiento: 'todos',
    fecha_seguimiento_desde: '',
    fecha_seguimiento_hasta: ''
  });

  // Cargar seguimientos
  const cargarSeguimientos = async (isUpdate = false) => {
    try {
      console.log('🔄 === INICIO CARGAR SEGUIMIENTOS ===');
      console.log('🔄 Investigación ID:', investigacionId);
      console.log('🔄 Es actualización:', isUpdate);
      
      if (isUpdate) {
        setUpdating(true);
      } else {
        setLoading(true);
      }
      
      const response = await obtenerSeguimientosPorInvestigacion(investigacionId);
      
      if (response.error) {
        console.error('❌ Error cargando seguimientos:', response.error);
        showError('Error al cargar seguimientos');
        return;
      }
      
      console.log('✅ Respuesta de seguimientos:', response.data);
      setSeguimientos(response.data || []);
      console.log('✅ Seguimientos cargados:', response.data?.length || 0);
      console.log('✅ Estado actualizado con:', response.data?.length || 0, 'seguimientos');
    } catch (error) {
      console.error('❌ Error cargando seguimientos:', error);
      showError('Error al cargar seguimientos');
    } finally {
      setLoading(false);
      setUpdating(false);
      console.log('🔄 === FIN CARGAR SEGUIMIENTOS ===');
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect cargarSeguimientos ejecutado');
    console.log('🔄 investigacionId:', investigacionId);
    cargarSeguimientos();
  }, [investigacionId]);

  // Efecto adicional para recargar cuando se abra el modal (en caso de que haya cambios)
  useEffect(() => {
    if (showSeguimientoModal) {
      // Recargar seguimientos cuando se abra el modal para asegurar datos frescos
      cargarSeguimientos(true);
    }
  }, [showSeguimientoModal]);

  // Escuchar evento para abrir modal desde el header
  useEffect(() => {
    const handleAbrirModal = () => {
      setShowSeguimientoModal(true);
    };

    window.addEventListener('abrir-modal-seguimiento', handleAbrirModal);

    return () => {
      window.removeEventListener('abrir-modal-seguimiento', handleAbrirModal);
    };
  }, []);

  // Crear seguimiento
  const handleCrearSeguimiento = async (data: SeguimientoFormData) => {
    try {
      const response = await crearSeguimiento(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      showSuccess('Seguimiento creado exitosamente');
      
      // Recargar seguimientos inmediatamente
      await cargarSeguimientos(true);
      onSeguimientoChange?.(); // Notify parent
    } catch (error: any) {
      console.error('Error creando seguimiento:', error);
      throw error;
    }
  };

  // Actualizar seguimiento
  const handleActualizarSeguimiento = async (data: SeguimientoFormData) => {
    if (!seguimientoEditando) return;
    
    const response = await actualizarSeguimiento(seguimientoEditando.id, data);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    showSuccess('Seguimiento actualizado exitosamente');
    setSeguimientoEditando(null);
    await cargarSeguimientos(true);
    onSeguimientoChange?.(); // Notify parent
  };


  // Convertir seguimiento en investigación - navegar a página completa
  const handleConvertirSeguimiento = (seguimiento: SeguimientoInvestigacion) => {
    router.push(`/investigaciones/convertir-seguimiento/${seguimiento.id}`);
  };

  // Obtener nombre del usuario
  const obtenerNombreUsuario = (userId: string) => {
    if (!userId) return 'Usuario desconocido';
    const usuario = usuarios.find(u => u.id === userId);
    return usuario?.full_name || usuario?.email || 'Usuario desconocido';
  };

  // Manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleExpandSearch = () => {
    setIsSearchExpanded(true);
  };

  const handleCollapseSearch = () => {
    setIsSearchExpanded(false);
    setSearchTerm('');
  };

  // Manejar filtros
  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  // Contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filtersSeguimientos.estado_seguimiento && filtersSeguimientos.estado_seguimiento !== 'todos') count++;
    if (filtersSeguimientos.responsable_seguimiento && filtersSeguimientos.responsable_seguimiento !== 'todos') count++;
    if (filtersSeguimientos.participante_seguimiento && filtersSeguimientos.participante_seguimiento !== 'todos') count++;
    if (filtersSeguimientos.investigacion_seguimiento && filtersSeguimientos.investigacion_seguimiento !== 'todos') count++;
    if (filtersSeguimientos.fecha_seguimiento_desde) count++;
    if (filtersSeguimientos.fecha_seguimiento_hasta) count++;
    return count;
  };

  // Efecto para cerrar la búsqueda con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchExpanded]);

  // Filtrar seguimientos basado en searchTerm y filtros
  const seguimientosFiltrados = useMemo(() => {
    if (!seguimientos) return [];
    
    let filtered = seguimientos;

    // Aplicar filtros de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(seguimiento => 
        seguimiento.participante_externo?.nombre?.toLowerCase().includes(term) ||
        seguimiento.notas?.toLowerCase().includes(term) ||
        obtenerNombreUsuario(seguimiento.responsable_id).toLowerCase().includes(term) ||
        seguimiento.estado?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros específicos de seguimientos
    if (filtersSeguimientos.estado_seguimiento && filtersSeguimientos.estado_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.estado === filtersSeguimientos.estado_seguimiento);
    }

    if (filtersSeguimientos.responsable_seguimiento && filtersSeguimientos.responsable_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.responsable_id === filtersSeguimientos.responsable_seguimiento);
    }

    if (filtersSeguimientos.participante_seguimiento && filtersSeguimientos.participante_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.participante_externo_id === filtersSeguimientos.participante_seguimiento);
    }

    if (filtersSeguimientos.investigacion_seguimiento && filtersSeguimientos.investigacion_seguimiento !== 'todos') {
      filtered = filtered.filter(s => s.investigacion_id === filtersSeguimientos.investigacion_seguimiento);
    }

    // Filtro por rango de fechas
    if (filtersSeguimientos.fecha_seguimiento_desde) {
      const fechaDesde = new Date(filtersSeguimientos.fecha_seguimiento_desde);
      filtered = filtered.filter(s => {
        const fechaSeguimiento = new Date(s.fecha_seguimiento);
        return fechaSeguimiento >= fechaDesde;
      });
    }

    if (filtersSeguimientos.fecha_seguimiento_hasta) {
      const fechaHasta = new Date(filtersSeguimientos.fecha_seguimiento_hasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      filtered = filtered.filter(s => {
        const fechaSeguimiento = new Date(s.fecha_seguimiento);
        return fechaSeguimiento <= fechaHasta;
      });
    }

    return filtered;
  }, [seguimientos, searchTerm, filtersSeguimientos]);

  // Funciones para acciones de la tabla
  const abrirVerModal = (seguimiento: SeguimientoInvestigacion) => {
    setSeguimientoParaVer(seguimiento);
    setShowVerModal(true);
  };

  const abrirEditarModal = (seguimiento: SeguimientoInvestigacion) => {
    setSeguimientoEditando(seguimiento);
    setShowSeguimientoModal(true);
  };

  const handleEliminarSeguimiento = (seguimiento: SeguimientoInvestigacion) => {
    setSeguimientoEliminar(seguimiento);
  };

  const confirmarEliminacion = async () => {
    if (!seguimientoEliminar) return;
    
    const response = await eliminarSeguimiento(seguimientoEliminar.id);
    
    if (response.error) {
      showError('Error al eliminar seguimiento');
      return;
    }
    
    showSuccess('Seguimiento eliminado exitosamente');
    setSeguimientoEliminar(null);
    await cargarSeguimientos(true);
    onSeguimientoChange?.();
  };

  // Convertir SeguimientoInvestigacion a Seguimiento para el modal
  const convertirParaModal = (seguimiento: SeguimientoInvestigacion) => {
    return {
      ...seguimiento,
      investigacion_nombre: 'Investigación actual', // Nombre de la investigación actual
      responsable_nombre: obtenerNombreUsuario(seguimiento.responsable_id),
      creado_por: seguimiento.creado_por || 'Usuario desconocido',
      participante_externo_id: seguimiento.participante_externo_id || '',
      participante_externo: seguimiento.participante_externo ? {
        ...seguimiento.participante_externo,
        email: seguimiento.participante_externo.email || ''
      } : undefined
    };
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'fecha_seguimiento',
      label: 'Fecha Seguimiento',
      sortable: true,
      render: (value: any, row: SeguimientoInvestigacion) => (
        <Typography variant="body2" weight="medium">
          {formatearFecha(row.fecha_seguimiento)}
        </Typography>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (value: any, row: SeguimientoInvestigacion) => (
        <Chip variant={getEstadoBadgeVariant(row.estado)} size="sm">
          {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
        </Chip>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      render: (value: any, row: SeguimientoInvestigacion) => (
        <Typography variant="body2" weight="medium">
          {obtenerNombreUsuario(row.responsable_id)}
        </Typography>
      )
    },
    {
      key: 'participante',
      label: 'Participante',
      sortable: true,
      render: (value: any, row: SeguimientoInvestigacion) => (
        <Typography variant="body2" weight="medium">
          {row.participante_externo?.nombre || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'notas',
      label: 'Notas',
      sortable: false,
      render: (value: any, row: SeguimientoInvestigacion) => (
        <Typography variant="body2" className="max-w-xs truncate">
          {row.notas || 'Sin notas'}
        </Typography>
      )
    },
    {
      key: 'creado_el',
      label: 'Creado',
      sortable: true,
      render: (value: any, row: SeguimientoInvestigacion) => (
        <Typography variant="body2" weight="medium">
          {formatearFecha(row.creado_el)}
        </Typography>
      )
    }
  ];


  // Acciones estáticas para la tabla (se aplicarán a todas las filas)
  const tableActions = [
    {
      label: 'Ver',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoInvestigacion) => abrirVerModal(row),
      title: 'Ver detalles del seguimiento'
    },
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoInvestigacion) => abrirEditarModal(row),
      title: 'Editar seguimiento'
    },
    {
      label: 'Convertir',
      icon: <CopyIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoInvestigacion) => handleConvertirSeguimiento(row),
      title: 'Convertir seguimiento a investigación'
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoInvestigacion) => handleEliminarSeguimiento(row),
      className: 'text-red-600 hover:text-red-700',
      title: 'Eliminar seguimiento'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card text-card-foreground border border-slate-100 dark:border-slate-800 p-6 space-y-6">
      {/* Header del contenedor con iconos integrados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Subtitle>
            Seguimientos
          </Subtitle>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            {seguimientosFiltrados.length} de {seguimientos.length}
          </span>
        </div>
        
        {/* Iconos de búsqueda y filtro en la misma línea */}
        <div className="flex items-center gap-2">
          {/* Icono de búsqueda que se expande */}
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar seguimientos..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="!w-[700px] pl-10 pr-10 py-2"
                  icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
                  iconPosition="left"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapseSearch}
                  className="text-gray-500 hover:text-gray-700 border-0"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={handleExpandSearch}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border-0"
                iconOnly
                icon={<SearchIcon className="w-5 h-5" />}
              />
            )}
          </div>
          
          {/* Icono de filtro */}
          <Button
            variant={getActiveFiltersCount() > 0 ? "primary" : "ghost"}
            onClick={handleOpenFilters}
            className="relative p-2 border-0"
            iconOnly
            icon={<FilterIcon />}
          >
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Tabla de seguimientos */}
      {seguimientos.length > 0 ? (
        seguimientosFiltrados.length > 0 ? (
          <DataTable
            data={seguimientosFiltrados}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            selectable={false}
            emptyMessage="No se encontraron seguimientos que coincidan con los criterios de búsqueda"
            rowKey="id"
            actions={tableActions}
            onRowClick={(seguimiento) => abrirVerModal(seguimiento)}
          />
        ) : (
          <div className="text-center py-12">
            <ClipboardListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-600 dark:text-gray-400 mb-2">
              No se encontraron seguimientos
            </Typography>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-500">
              No se encontraron seguimientos que coincidan con los criterios de búsqueda.
            </Typography>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <ClipboardListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Typography variant="h3" className="text-gray-600 dark:text-gray-400 mb-2">
            Sin seguimientos registrados
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-500">
            {investigacionEstado === 'en_progreso' 
              ? 'No hay seguimientos registrados. Crea el primer seguimiento para documentar el progreso.'
              : 'No hay seguimientos registrados.'
            }
          </Typography>
        </div>
      )}

      {/* Modal de seguimiento */}
      <SeguimientoSideModal
        isOpen={showSeguimientoModal}
        onClose={() => {
          setShowSeguimientoModal(false);
          setSeguimientoEditando(null);
        }}
        onSave={seguimientoEditando ? handleActualizarSeguimiento : handleCrearSeguimiento}
        seguimiento={seguimientoEditando}
        investigacionId={investigacionId}
        usuarios={usuarios}
        investigaciones={[{
          id: investigacionId,
          nombre: investigacionNombre
        }]}
      />

      {/* Modal para ver seguimiento */}
      <VerSeguimientoSideModal
        isOpen={showVerModal}
        onClose={() => {
          setShowVerModal(false);
          setSeguimientoParaVer(null);
        }}
        seguimiento={seguimientoParaVer ? convertirParaModal(seguimientoParaVer) : null}
        onEdit={(seguimiento) => {
          setShowVerModal(false);
          setSeguimientoParaVer(null);
          abrirEditarModal(seguimientoParaVer!);
        }}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={!!seguimientoEliminar}
        onClose={() => setSeguimientoEliminar(null)}
        onConfirm={confirmarEliminacion}
        title="Eliminar Seguimiento"
        message={`¿Estás seguro de que deseas eliminar este seguimiento? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="error"
      />

      {/* Drawer de filtros de seguimientos */}
      <SeguimientosFilterDrawer
        isOpen={showFilterDrawer}
        onClose={handleCloseFilters}
        filters={filtersSeguimientos}
        onFiltersChange={setFiltersSeguimientos}
        options={{
          estados: [
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_progreso', label: 'En Progreso' },
            { value: 'convertido', label: 'Convertido' },
            { value: 'cancelado', label: 'Cancelado' }
          ],
          responsables: usuarios.map(u => ({
            value: u.id,
            label: u.full_name
          })),
          participantes: seguimientos
            .filter(s => s.participante_externo)
            .map(s => ({
              value: s.participante_externo_id,
              label: s.participante_externo?.nombre || 'N/A'
            })),
          investigaciones: [{
            value: investigacionId,
            label: 'Investigación actual'
          }]
        }}
      />
    </div>
  );
}; 