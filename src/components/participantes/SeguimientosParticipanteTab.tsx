import React, { useState, useEffect } from 'react';
import { useFastUser } from '../../contexts/FastUserContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Card, Button, Chip, Subtitle, EmptyState } from '../ui';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  CopyIcon,
  LinkIcon
} from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { getChipVariant } from '../../utils/chipUtils';
import SeguimientoSideModal from '../ui/SeguimientoSideModal';
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

  // Cargar usuarios
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

  // Manejar eliminación de seguimiento
  const handleEliminarSeguimiento = async (seguimientoId: string) => {
    try {
      console.log('🔍 Eliminando seguimiento:', seguimientoId);
      
      const response = await fetch(`/api/seguimientos/${seguimientoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar seguimiento');
      }

      console.log('✅ Seguimiento eliminado');
      showSuccess('Seguimiento eliminado exitosamente');
      cargarSeguimientos();
    } catch (error: any) {
      console.error('❌ Error eliminando seguimiento:', error);
      showError(error.message || 'Error al eliminar seguimiento');
    }
  };

  // Abrir modal de edición
  const abrirEditarModal = (seguimiento: SeguimientoParticipante) => {
    setSeguimientoEditando(seguimiento);
    setShowEditarModal(true);
  };

  // Obtener color del estado
  const getEstadoColor = (estado: string): any => {
    return getChipVariant(estado);
  };

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

      {/* Lista de seguimientos */}
      {seguimientos.length === 0 ? (
        <EmptyState
          icon={<ClipboardListIcon className="w-8 h-8" />}
          title="Sin seguimientos registrados"
          description="Este participante no tiene seguimientos registrados."
          actionText="Crear Primer Seguimiento"
          onAction={() => setShowCrearModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {seguimientos.map((seguimiento) => (
            <Card key={seguimiento.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header con información básica */}
                  <div className="flex items-center gap-2 mb-2">
                    <Chip variant={getEstadoColor(seguimiento.estado)} size="sm">
                      {seguimiento.estado}
                    </Chip>
                    <Typography variant="body2" className="text-muted-foreground">
                      {formatearFecha(seguimiento.fecha_seguimiento)}
                    </Typography>
                  </div>

                  {/* Información de la investigación */}
                  <div className="mb-2">
                    <Typography variant="subtitle2" weight="medium" className="mb-1">
                      Investigación: {seguimiento.investigacion_nombre}
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      Responsable: {seguimiento.responsable_nombre}
                    </Typography>
                  </div>

                  {/* Notas del seguimiento */}
                  <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                    {seguimiento.notas}
                  </Typography>

                  {/* Footer con fecha de creación */}
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Typography variant="caption" className="text-muted-foreground">
                      Creado el {formatearFecha(seguimiento.creado_el)}
                    </Typography>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => abrirEditarModal(seguimiento)}
                    className="flex items-center gap-1"
                  >
                    <EditIcon className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminarSeguimiento(seguimiento.id)}
                    className="flex items-center gap-1 !text-destructive"
                  >
                    <TrashIcon className="w-3 h-3 text-destructive" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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
    </div>
  );
};
