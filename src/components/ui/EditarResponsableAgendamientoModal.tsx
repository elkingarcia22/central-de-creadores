import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { SideModal } from './SideModal';
import { Typography } from './Typography';
import { Button } from './Button';
import { UserSelectorWithAvatar } from './UserSelectorWithAvatar';
import { SaveIcon } from '../icons';

interface EditarResponsableAgendamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reclutamiento: any; // Datos del reclutamiento a editar
}

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export default function EditarResponsableAgendamientoModal({
  isOpen,
  onClose,
  onSuccess,
  reclutamiento
}: EditarResponsableAgendamientoModalProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [responsableId, setResponsableId] = useState('');

  // Carga inicial de catálogos y valores
  useEffect(() => {
    if (!isOpen) return;
    
    cargarResponsables();
    if (reclutamiento) {
      console.log('🔍 Debug EditarResponsableAgendamientoModal - reclutamiento:', reclutamiento);
      setResponsableId(reclutamiento.reclutador_id || '');
    }
  }, [isOpen, reclutamiento]);

  // Sincroniza responsableId cuando responsables y reclutamiento estén listos
  useEffect(() => {
    if (isOpen && responsables.length > 0 && reclutamiento?.reclutador_id) {
      if (responsables.some(u => u.id === reclutamiento.reclutador_id)) {
        setResponsableId(reclutamiento.reclutador_id);
      }
    }
  }, [isOpen, responsables, reclutamiento]);

  async function cargarResponsables() {
    try {
      setLoadingData(true);
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Usuarios cargados para responsables:', data.usuarios);
        console.log('🔍 Total de usuarios:', data.usuarios?.length);
        setResponsables(data.usuarios || []);
      } else {
        console.error('Error cargando responsables:', response.statusText);
        throw new Error('Error al cargar responsables');
      }
    } catch (error) {
      console.error('Error cargando responsables:', error);
      throw error;
    } finally {
      setLoadingData(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responsableId) {
      showError('Debes seleccionar un responsable del agendamiento');
      return;
    }

    console.log('🔍 Intentando guardar responsable:', responsableId);
    console.log('🔍 Responsable seleccionado:', responsables.find(r => r.id === responsableId));

    try {
      setLoading(true);
      
      const response = await fetch(`/api/reclutamientos/${reclutamiento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reclutador_id: responsableId
        }),
      });

      if (response.ok) {
        showSuccess('Responsable del agendamiento actualizado correctamente');
        // Agregar un pequeño delay para asegurar que los datos se actualicen
        setTimeout(() => {
          onSuccess();
          // Cerrar el modal automáticamente después del éxito
          handleClose();
        }, 500);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al actualizar el responsable del agendamiento');
      }
    } catch (error) {
      console.error('Error actualizando responsable del agendamiento:', error);
      showError('Error al actualizar el responsable del agendamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResponsableId('');
    onClose();
  };

  // Footer del modal
  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={loading}
        disabled={loading || !responsableId}
        className="flex items-center gap-2"
      >
        <SaveIcon className="w-4 h-4" />
        Guardar Cambios
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Responsable del Agendamiento"
      width="lg"
      footer={footer}
    >
      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <Typography variant="body2" color="secondary">
              Cargando datos...
            </Typography>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Responsable del Agendamiento */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Responsable del Agendamiento *
            </Typography>
            {responsables.length === 0 ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <Typography variant="body2" color="secondary" className="text-red-700 dark:text-red-300">
                  No se pudieron cargar los usuarios responsables. 
                  Verifica que existan usuarios en el sistema con roles de reclutador o administrador.
                </Typography>
              </div>
            ) : (
              <UserSelectorWithAvatar
                value={responsableId}
                onChange={setResponsableId}
                users={responsables.map(r => ({
                  id: r.id,
                  full_name: r.full_name || 'Sin nombre',
                  email: r.email || 'sin-email@ejemplo.com',
                  avatar_url: r.avatar_url
                }))}
                placeholder="Seleccionar responsable"
                disabled={loading}
                required
              />
            )}
            <Typography variant="caption" color="secondary" className="mt-2 block">
              Esta persona será responsable de agendar la sesión con el participante
            </Typography>
          </div>
        </form>
      )}
    </SideModal>
  );
} 