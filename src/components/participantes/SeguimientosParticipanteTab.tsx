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

  // Acciones estáticas para la tabla (se aplicarán a todas las filas)
  const tableActions = [
    {
      label: 'Ver',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoParticipante) => abrirVerModal(row),
      title: 'Ver detalles del seguimiento'
    },
    {
      label: 'Ver Investigación',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoParticipante) => handleVerInvestigacion(row),
      title: 'Ver detalles de la investigación'
    },
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoParticipante) => abrirEditarModal(row),
      title: 'Editar seguimiento'
    },
    {
      label: 'Convertir',
      icon: <CopyIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoParticipante) => handleConvertirSeguimiento(row),
      title: 'Convertir seguimiento a investigación'
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (row: SeguimientoParticipante) => handleEliminarSeguimiento(row),
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Subtitle>
          Seguimientos ({seguimientos.length})
        </Subtitle>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCrearModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo Seguimiento
        </Button>
      </div>

      {/* Tabla de seguimientos */}
      {seguimientos.length === 0 ? (
        <EmptyState
          icon={<ClipboardListIcon className="w-8 h-8" />}
          title="Sin seguimientos registrados"
          description="Este participante no tiene seguimientos registrados."
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
          onRowClick={(seguimiento) => abrirVerModal(seguimiento)}
        />
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
    </div>
  );
};
