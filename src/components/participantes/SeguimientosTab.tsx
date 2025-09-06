import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFastUser } from '../../contexts/FastUserContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Card, Button, Chip, Subtitle, EmptyState } from '../ui';
import DataTable from '../ui/DataTable';
import ActionsMenu from '../ui/ActionsMenu';
import ConfirmModal from '../ui/ConfirmModal';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  CopyIcon,
  LinkIcon,
  EyeIcon
} from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { getChipVariant } from '../../utils/chipUtils';
import SeguimientoSideModal from '../ui/SeguimientoSideModal';

interface Seguimiento {
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

interface SeguimientosTabProps {
  showCrearModal?: boolean;
  onCloseCrearModal?: () => void;
  seguimientos?: Seguimiento[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const SeguimientosTab: React.FC<SeguimientosTabProps> = ({ 
  showCrearModal: externalShowCrearModal, 
  onCloseCrearModal,
  seguimientos: externalSeguimientos,
  loading: externalLoading,
  onRefresh
}) => {
  const router = useRouter();
  const { userId } = useFastUser();
  const { showError, showSuccess } = useToast();
  
  const [internalSeguimientos, setInternalSeguimientos] = useState<Seguimiento[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  
  // Usar datos externos si están disponibles, sino usar los internos
  const seguimientos = externalSeguimientos !== undefined ? externalSeguimientos : internalSeguimientos;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [internalShowCrearModal, setInternalShowCrearModal] = useState(false);
  
  // Usar el modal externo si está disponible, sino usar el interno
  const showCrearModal = externalShowCrearModal !== undefined ? externalShowCrearModal : internalShowCrearModal;
  const setShowCrearModal = onCloseCrearModal || setInternalShowCrearModal;
  const [seguimientoEditando, setSeguimientoEditando] = useState<Seguimiento | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [seguimientoParaEliminar, setSeguimientoParaEliminar] = useState<Seguimiento | null>(null);

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        const usuariosArray = Array.isArray(data) ? data : (data?.usuarios || data?.data || []);
        setUsuarios(usuariosArray);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setUsuarios([]);
    }
  };

  // Cargar todos los seguimientos (solo si no hay datos externos)
  const cargarSeguimientos = async () => {
    if (externalSeguimientos !== undefined) {
      // Si hay datos externos, no cargar internamente
      return;
    }
    
    try {
      setInternalLoading(true);
      console.log('🔍 Cargando todos los seguimientos...');
      
      // Obtener todos los seguimientos (sin filtro de participante)
      const response = await fetch('/api/seguimientos?all=true');
      if (!response.ok) {
        throw new Error('Error al cargar seguimientos');
      }
      
      const result = await response.json();
      console.log('✅ Seguimientos cargados:', result.data?.length || 0);
      setInternalSeguimientos(result.data || []);
    } catch (error) {
      console.error('❌ Error cargando seguimientos:', error);
      showError('Error al cargar seguimientos');
      setInternalSeguimientos([]);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    cargarSeguimientos();
    cargarUsuarios();
  }, []);

  // Manejar creación de seguimiento
  const handleCrearSeguimiento = async (datos: any) => {
    try {
      console.log('🔍 Creando seguimiento...');
      
      const response = await fetch('/api/seguimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear seguimiento');
      }

      const result = await response.json();
      console.log('✅ Seguimiento creado:', result.data);
      
      showSuccess('Seguimiento creado exitosamente');
      setShowCrearModal(false);
      if (onRefresh) {
        onRefresh();
      } else {
        cargarSeguimientos();
      }
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
      if (onRefresh) {
        onRefresh();
      } else {
        cargarSeguimientos();
      }
    } catch (error: any) {
      console.error('❌ Error actualizando seguimiento:', error);
      showError(error.message || 'Error al actualizar seguimiento');
    }
  };

  // Manejar eliminación de seguimiento
  const handleEliminarSeguimiento = (seguimiento: Seguimiento) => {
    console.log('🔍 [SeguimientosTab] Abriendo modal de eliminación para:', seguimiento);
    setSeguimientoParaEliminar(seguimiento);
    setShowModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!seguimientoParaEliminar) {
      console.log('❌ [SeguimientosTab] No hay seguimiento para eliminar');
      return;
    }
    
    console.log('🔍 [SeguimientosTab] Confirmando eliminación de:', seguimientoParaEliminar);
    
    try {
      console.log('🔍 [SeguimientosTab] Eliminando seguimiento:', seguimientoParaEliminar.id);
      
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
      if (onRefresh) {
        onRefresh();
      } else {
        cargarSeguimientos();
      }
    } catch (error: any) {
      console.error('❌ Error eliminando seguimiento:', error);
      showError(error.message || 'Error al eliminar seguimiento');
    }
  };

  // Abrir modal de edición
  const abrirEditarModal = (seguimiento: Seguimiento) => {
    setSeguimientoEditando(seguimiento);
    setShowEditarModal(true);
  };

  // Convertir seguimiento a investigación
  const handleConvertirSeguimiento = (seguimiento: Seguimiento) => {
    router.push(`/investigaciones/convertir-seguimiento/${seguimiento.id}`);
  };

  // Ver investigación
  const handleVerInvestigacion = (seguimiento: Seguimiento) => {
    router.push(`/investigaciones/ver/${seguimiento.investigacion_id}`);
  };

  // Ver participante
  const handleVerParticipante = (seguimiento: Seguimiento) => {
    if (seguimiento.participante_externo_id) {
      router.push(`/participantes/${seguimiento.participante_externo_id}`);
    }
  };

  // Obtener color del estado
  const getEstadoColor = (estado: string): any => {
    return getChipVariant(estado);
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'participante',
      label: 'Participante',
      sortable: true,
      render: (value: any, row: Seguimiento) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <ClipboardListIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <Typography variant="body2" weight="medium">
              {row.participante_externo?.nombre || 'Sin participante'}
            </Typography>
            {row.participante_externo?.empresa_nombre && (
              <Typography variant="caption" className="text-muted-foreground">
                {row.participante_externo.empresa_nombre}
              </Typography>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'investigacion',
      label: 'Investigación',
      sortable: true,
      render: (value: any, row: Seguimiento) => (
        <div>
          <Typography variant="body2" weight="medium">
            {row.investigacion_nombre}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            ID: {row.investigacion_id.substring(0, 8)}...
          </Typography>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (value: any, row: Seguimiento) => (
        <Chip variant={getEstadoColor(row.estado)} size="sm">
          {row.estado}
        </Chip>
      )
    },
    {
      key: 'fecha_seguimiento',
      label: 'Fecha Seguimiento',
      sortable: true,
      render: (value: any, row: Seguimiento) => (
        <Typography variant="body2">
          {formatearFecha(row.fecha_seguimiento)}
        </Typography>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      render: (value: any, row: Seguimiento) => (
        <Typography variant="body2">
          {row.responsable_nombre}
        </Typography>
      )
    },
    {
      key: 'creado_el',
      label: 'Creado',
      sortable: true,
      render: (value: any, row: Seguimiento) => (
        <Typography variant="body2" className="text-muted-foreground">
          {formatearFecha(row.creado_el)}
        </Typography>
      )
    }
  ];

  // Acciones para cada fila
  const getRowActions = (seguimiento: Seguimiento) => {
    const actions = [
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

    // Agregar acción de ver participante si tiene participante externo
    if (seguimiento.participante_externo_id) {
      actions.push({
        label: 'Ver Participante',
        icon: <LinkIcon className="w-4 h-4" />,
        onClick: () => handleVerParticipante(seguimiento),
        title: 'Ver detalles del participante'
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

  // Acciones estáticas para la tabla (se aplicarán a todas las filas)
  const tableActions = [
    {
      label: 'Ver Investigación',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (row: Seguimiento) => handleVerInvestigacion(row),
      title: 'Ver detalles de la investigación'
    },
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (row: Seguimiento) => abrirEditarModal(row),
      title: 'Editar seguimiento'
    },
    {
      label: 'Convertir',
      icon: <CopyIcon className="w-4 h-4" />,
      onClick: (row: Seguimiento) => handleConvertirSeguimiento(row),
      title: 'Convertir seguimiento a investigación'
    },
    {
      label: 'Ver Participante',
      icon: <LinkIcon className="w-4 h-4" />,
      onClick: (row: Seguimiento) => handleVerParticipante(row),
      title: 'Ver detalles del participante'
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (row: Seguimiento) => handleEliminarSeguimiento(row),
      className: 'text-red-600 hover:text-red-700',
      title: 'Eliminar seguimiento'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabla de seguimientos */}
      {seguimientos.length === 0 ? (
        <EmptyState
          icon={<ClipboardListIcon className="w-8 h-8" />}
          title="Sin seguimientos registrados"
          description="No hay seguimientos registrados en el sistema."
          actionText="Crear Primer Seguimiento"
          onAction={() => setShowCrearModal(true)}
        />
      ) : (
        <DataTable
          data={seguimientos}
          columns={columns}
          loading={loading}
          searchable={false}
          sortable={true}
          pagination={true}
          pageSize={10}
          actions={tableActions}
          onRowClick={(seguimiento) => abrirEditarModal(seguimiento)}
        />
      )}

      {/* Modal para crear seguimiento */}
      <SeguimientoSideModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSave={handleCrearSeguimiento}
        investigacionId=""
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
    </div>
  );
};
