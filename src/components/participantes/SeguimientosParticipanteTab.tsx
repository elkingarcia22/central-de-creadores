import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useFastUser } from '../../contexts/FastUserContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Button, Chip, Subtitle, EmptyState } from '../ui';
import DataTable from '../ui/DataTable';
import ActionsMenu from '../ui/ActionsMenu';
import ConfirmModal from '../ui/ConfirmModal';
import Input from '../ui/Input';
import SeguimientosFilterDrawer, { FilterValuesSeguimientos } from '../ui/SeguimientosFilterDrawer';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  CopyIcon,
  LinkIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon
} from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { getChipVariant } from '../../utils/chipUtils';
import SeguimientoSideModal from '../ui/SeguimientoSideModal';
import VerSeguimientoSideModal from '../ui/VerSeguimientoSideModal';
import { obtenerSeguimientosPorParticipante, crearSeguimiento } from '../../api/supabase-seguimientos';

interface SeguimientoParticipante {
  id: string;
  investigacion_id: string;
  investigacion_nombre: string;
  responsable_id: string;
  responsable_nombre: string;
  fecha_seguimiento: string;
  notas: string;
  estado: string;
  participante_externo_id: string;
  participante_externo: {
    id: string;
    nombre: string;
    email: string;
    empresa_nombre?: string;
  };
  creado_el: string;
}

interface SeguimientosParticipanteTabProps {
  participanteId: string;
  participanteNombre: string;
  participanteEmail: string;
  participanteEmpresa?: string;
}

export const SeguimientosParticipanteTab: React.FC<SeguimientosParticipanteTabProps> = ({
  participanteId,
  participanteNombre,
  participanteEmail,
  participanteEmpresa
}) => {
  const router = useRouter();
  const { userId } = useFastUser();
  const { showError, showSuccess } = useToast();
  
  const [seguimientos, setSeguimientos] = useState<SeguimientoParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [seguimientoEditando, setSeguimientoEditando] = useState<SeguimientoParticipante | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [seguimientoParaVer, setSeguimientoParaVer] = useState<SeguimientoParticipante | null>(null);
  const [showVerModal, setShowVerModal] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [seguimientoParaEliminar, setSeguimientoParaEliminar] = useState<SeguimientoParticipante | null>(null);
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

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      console.log('🔍 Cargando usuarios...');
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Datos de usuarios recibidos:', data);
        console.log('🔍 Tipo de datos:', typeof data);
        console.log('🔍 Es array:', Array.isArray(data));
        
        // Asegurar que sea un array - la API devuelve { usuarios: [...] }
        const usuariosArray = Array.isArray(data) ? data : (data?.usuarios || data?.data || []);
        console.log('🔍 Usuarios finales:', usuariosArray);
        setUsuarios(usuariosArray);
      } else {
        console.error('Error en respuesta de usuarios:', response.status);
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setUsuarios([]);
    }
  };

  // Cargar seguimientos del participante
  const cargarSeguimientos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando seguimientos para participante:', participanteId);
      
      const response = await fetch(`/api/seguimientos?participante_externo_id=${participanteId}`);
      if (!response.ok) {
        throw new Error('Error al cargar seguimientos');
      }
      
      const result = await response.json();
      console.log('✅ Seguimientos cargados:', result.data?.length || 0);
      setSeguimientos(result.data || []);
    } catch (error) {
      console.error('❌ Error cargando seguimientos:', error);
      showError('Error al cargar seguimientos');
      setSeguimientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (participanteId) {
      cargarSeguimientos();
      cargarUsuarios();
    }
  }, [participanteId]);

  // Manejar creación de seguimiento
  const handleCrearSeguimiento = async (datos: any) => {
    try {
      console.log('🔍 Creando seguimiento para participante:', participanteId);
      
      const seguimientoData = {
        ...datos,
        participante_externo_id: participanteId,
        responsable_id: userId
      };

      const response = await fetch('/api/seguimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seguimientoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear seguimiento');
      }

      const result = await response.json();
      console.log('✅ Seguimiento creado:', result.data);
      
      showSuccess('Seguimiento creado exitosamente');
      setShowCrearModal(false);
      cargarSeguimientos();
    } catch (error: any) {
      console.error('❌ Error creando seguimiento:', error);
      showError(error.message || 'Error al crear seguimiento');
    }
  };

  // Manejar edición de seguimiento
  const handleEditarSeguimiento = async (datos: any) => {
    try {
      if (!seguimientoEditando) return;

      console.log('🔍 Editando seguimiento:', seguimientoEditando.id);
      
      const response = await fetch(`/api/seguimientos/${seguimientoEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar seguimiento');
      }

      console.log('✅ Seguimiento actualizado');
      showSuccess('Seguimiento actualizado exitosamente');
      setShowEditarModal(false);
      setSeguimientoEditando(null);
      cargarSeguimientos();
    } catch (error: any) {
      console.error('❌ Error actualizando seguimiento:', error);
      showError(error.message || 'Error al actualizar seguimiento');
    }
  };


  // Abrir modal de edición
  const abrirEditarModal = (seguimiento: SeguimientoParticipante) => {
    console.log('🔍 [SeguimientosParticipanteTab] Abriendo modal de edición');
    console.log('🔍 [SeguimientosParticipanteTab] Seguimiento a editar:', seguimiento);
    console.log('🔍 [SeguimientosParticipanteTab] responsable_id del seguimiento:', seguimiento.responsable_id);
    console.log('🔍 [SeguimientosParticipanteTab] usuarios disponibles:', usuarios);
    console.log('🔍 [SeguimientosParticipanteTab] userId actual:', userId);
    
    setSeguimientoEditando(seguimiento);
    setShowEditarModal(true);
  };

  // Abrir modal de vista
  const abrirVerModal = (seguimiento: SeguimientoParticipante) => {
    setSeguimientoParaVer(seguimiento);
    setShowVerModal(true);
  };

  // Manejar eliminación de seguimiento con confirmación
  const handleEliminarSeguimiento = (seguimiento: SeguimientoParticipante) => {
    setSeguimientoParaEliminar(seguimiento);
    setShowModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!seguimientoParaEliminar) return;
    
    try {
      console.log('🔍 Eliminando seguimiento:', seguimientoParaEliminar.id);
      
      const response = await fetch(`/api/seguimientos/${seguimientoParaEliminar.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar seguimiento');
      }

      console.log('✅ Seguimiento eliminado');
      showSuccess('Seguimiento eliminado exitosamente');
      setShowModalEliminar(false);
      setSeguimientoParaEliminar(null);
      cargarSeguimientos();
    } catch (error: any) {
      console.error('❌ Error eliminando seguimiento:', error);
      showError(error.message || 'Error al eliminar seguimiento');
    }
  };

  // Convertir seguimiento a investigación
  const handleConvertirSeguimiento = (seguimiento: SeguimientoParticipante) => {
    router.push(`/investigaciones/convertir-seguimiento/${seguimiento.id}`);
  };

  // Ver investigación
  const handleVerInvestigacion = (seguimiento: SeguimientoParticipante) => {
    router.push(`/investigaciones/ver/${seguimiento.investigacion_id}`);
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

  // Filtrar seguimientos basado en searchTerm y filtros
  const seguimientosFiltrados = useMemo(() => {
    if (!seguimientos) return [];
    
    let filtered = seguimientos;

    // Aplicar filtros de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(seguimiento => 
        seguimiento.participante_externo?.nombre?.toLowerCase().includes(term) ||
        seguimiento.investigacion_nombre?.toLowerCase().includes(term) ||
        seguimiento.responsable_nombre?.toLowerCase().includes(term) ||
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
      filtered = filtered.filter(s => s.investigacion_nombre === filtersSeguimientos.investigacion_seguimiento);
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

  // Obtener color del estado
  const getEstadoColor = (estado: string): any => {
    return getChipVariant(estado);
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'investigacion',
      label: 'Investigación',
      sortable: true,
      render: (value: any, row: SeguimientoParticipante) => (
        <Typography variant="body2" weight="medium">
          {row.investigacion_nombre}
        </Typography>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (value: any, row: SeguimientoParticipante) => (
        <Chip variant={getEstadoColor(row.estado)} size="sm">
          {row.estado}
        </Chip>
      )
    },
    {
      key: 'fecha_seguimiento',
      label: 'Fecha Seguimiento',
      sortable: true,
      render: (value: any, row: SeguimientoParticipante) => (
        <Typography variant="body2">
          {formatearFecha(row.fecha_seguimiento)}
        </Typography>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      render: (value: any, row: SeguimientoParticipante) => (
        <Typography variant="body2">
          {row.responsable_nombre}
        </Typography>
      )
    },
    {
      key: 'creado_el',
      label: 'Creado',
      sortable: true,
      render: (value: any, row: SeguimientoParticipante) => (
        <Typography variant="body2" className="text-muted-foreground">
          {formatearFecha(row.creado_el)}
        </Typography>
      )
    }
  ];

  // Acciones para cada fila
  const getRowActions = (seguimiento: SeguimientoParticipante) => {
    const actions = [
      {
        label: 'Ver',
        icon: <EyeIcon className="w-4 h-4" />,
        onClick: () => abrirVerModal(seguimiento),
        title: 'Ver detalles del seguimiento'
      },
      {
        label: 'Ver Investigación',
        icon: <EyeIcon className="w-4 h-4" />,
        onClick: () => handleVerInvestigacion(seguimiento),
        title: 'Ver detalles de la investigación'
      },
      {
        label: 'Editar',
        icon: <EditIcon className="w-4 h-4" />,
        onClick: () => abrirEditarModal(seguimiento),
        title: 'Editar seguimiento'
      }
    ];

    // Agregar acción de convertir solo si el estado lo permite
    if (seguimiento.estado !== 'convertido' && seguimiento.estado !== 'completado') {
      actions.push({
        label: 'Convertir',
        icon: <CopyIcon className="w-4 h-4" />,
        onClick: () => handleConvertirSeguimiento(seguimiento),
        title: 'Convertir seguimiento a investigación'
      });
    }

    // Agregar acción de eliminar
    actions.push({
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => handleEliminarSeguimiento(seguimiento),
      className: 'text-red-600 hover:text-red-700',
      title: 'Eliminar seguimiento'
    });

    return actions;
  };

  // Función para obtener acciones dinámicas basadas en el tipo de seguimiento
  const getTableActions = (row: SeguimientoParticipante) => {
    console.log('🚀 [SEGUIMIENTOS] getTableActions ejecutándose para:', row.id);
    
    // Detectar si es un seguimiento de sesión de apoyo
    const isSesionApoyo = 
      row.investigacion_nombre === 'Sesión de Apoyo' ||
      !row.investigacion_id ||
      row.investigacion_id === '00000000-0000-0000-0000-000000000001' ||
      (row.notas && row.notas.startsWith('[SEGUIMIENTO DE APOYO]'));
    
    // Debug log para verificar la detección
    console.log('🔍 [SEGUIMIENTOS] Verificando seguimiento:', {
      id: row.id,
      investigacion_nombre: row.investigacion_nombre,
      investigacion_id: row.investigacion_id,
      notas_prefijo: row.notas?.substring(0, 20),
      isSesionApoyo
    });
    
    const actions = [
      {
        label: 'Ver',
        icon: <EyeIcon className="w-4 h-4" />,
        onClick: () => abrirVerModal(row),
        title: 'Ver detalles del seguimiento'
      }
    ];

    // Solo agregar "Ver Investigación" si NO es sesión de apoyo
    if (!isSesionApoyo) {
      actions.push({
        label: 'Ver Investigación',
        icon: <EyeIcon className="w-4 h-4" />,
        onClick: () => handleVerInvestigacion(row),
        title: 'Ver detalles de la investigación'
      });
    }

    actions.push(
      {
        label: 'Editar',
        icon: <EditIcon className="w-4 h-4" />,
        onClick: () => abrirEditarModal(row),
        title: 'Editar seguimiento'
      },
      {
        label: 'Convertir',
        icon: <CopyIcon className="w-4 h-4" />,
        onClick: () => handleConvertirSeguimiento(row),
        title: 'Convertir seguimiento a investigación'
      },
      {
        label: 'Eliminar',
        icon: <TrashIcon className="w-4 h-4" />,
        onClick: () => handleEliminarSeguimiento(row),
        className: 'text-red-600 hover:text-red-700',
        title: 'Eliminar seguimiento'
      }
    );

    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
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
                  autoFocus
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
          <>
            {console.log('🎯 [SEGUIMIENTOS] Renderizando tabla con', seguimientosFiltrados.length, 'seguimientos')}
            <DataTable
              data={seguimientosFiltrados}
              columns={columns}
              loading={loading}
              searchable={false}
              filterable={false}
              selectable={false}
              emptyMessage="No se encontraron seguimientos que coincidan con los criterios de búsqueda"
              rowKey="id"
              getRowActions={getTableActions}
              onRowClick={(seguimiento) => abrirVerModal(seguimiento)}
            />
          </>
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
            Este participante no tiene seguimientos registrados.
          </Typography>
        </div>
      )}

      {/* Modal para crear seguimiento */}
      <SeguimientoSideModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSave={handleCrearSeguimiento}
        investigacionId="" // Se establecerá cuando se seleccione una investigación
        usuarios={usuarios}
        responsablePorDefecto={userId}
      />

      {/* Modal para editar seguimiento */}
      {seguimientoEditando && (
        <SeguimientoSideModal
          isOpen={showEditarModal}
          onClose={() => {
            setShowEditarModal(false);
            setSeguimientoEditando(null);
          }}
          onSave={handleEditarSeguimiento}
          seguimiento={seguimientoEditando}
          investigacionId={seguimientoEditando.investigacion_id}
          usuarios={usuarios}
          responsablePorDefecto={userId}
        />
      )}

      {/* Modal para ver seguimiento */}
      <VerSeguimientoSideModal
        isOpen={showVerModal}
        onClose={() => {
          setShowVerModal(false);
          setSeguimientoParaVer(null);
        }}
        seguimiento={seguimientoParaVer}
        onEdit={(seguimiento) => {
          setShowVerModal(false);
          setSeguimientoParaVer(null);
          abrirEditarModal(seguimiento);
        }}
      />

      {/* Modal de confirmación para eliminar seguimiento */}
      <ConfirmModal
        isOpen={!!seguimientoParaEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setSeguimientoParaEliminar(null);
        }}
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
            label: u.nombre
          })),
          participantes: [{
            value: participanteId,
            label: participanteNombre
          }],
          investigaciones: seguimientos.map(s => ({
            value: s.investigacion_nombre,
            label: s.investigacion_nombre
          }))
        }}
      />
    </div>
  );
};
