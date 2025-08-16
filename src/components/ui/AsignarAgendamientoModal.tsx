import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { 
  SideModal, 
  Typography, 
  Button, 
  Select, 
  UserSelectorWithAvatar 
} from './index';
import { SaveIcon } from '../icons';

interface AsignarAgendamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investigacionId?: string;
  investigacionNombre?: string;
  isEditMode?: boolean; // Nueva prop para indicar si es modo de edición
  reclutamientoId?: string; // ID del reclutamiento a editar
  responsableActual?: string; // ID del responsable actual para precargar
}

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  roles?: string[];
  created_at?: string;
}

interface Investigacion {
  investigacion_id: string;
  investigacion_nombre: string;
  estado_investigacion: string;
  libreto_titulo: string;
  libreto_numero_participantes: number;
}

export default function AsignarAgendamientoModal({
  isOpen,
  onClose,
  onSuccess,
  investigacionId,
  investigacionNombre,
  isEditMode = false,
  reclutamientoId,
  responsableActual
}: AsignarAgendamientoModalProps) {
  const { showSuccess, showError } = useToast();
  
  // Ref para evitar notificaciones duplicadas
  const lastSuccessNotificationTime = useRef(0);
  
  // console.log('🔍 AsignarAgendamientoModal RENDERIZADO - props:', { 
  //   isOpen, 
  //   isEditMode, 
  //   reclutamientoId, 
  //   responsableActual,
  //   timestamp: new Date().toISOString()
  // });
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [investigaciones, setInvestigaciones] = useState<Investigacion[]>([]);
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [investigacionSeleccionada, setInvestigacionSeleccionada] = useState<Investigacion | null>(null);
  const [responsableId, setResponsableId] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  // Precargar responsable actual en modo de edición
  useEffect(() => {
    console.log('🔍 useEffect responsableActual:', { isOpen, isEditMode, responsableActual, responsablesLength: responsables.length });
    if (isOpen && isEditMode && responsableActual && responsables.length > 0) {
      console.log('🔍 Precargando responsable:', responsableActual);
      setResponsableId(responsableActual);
    } else if (isOpen && isEditMode && responsableActual && responsables.length === 0) {
      console.log('🔍 Esperando a que se carguen los responsables para precargar:', responsableActual);
      // Esperar a que se carguen los responsables
      const timer = setTimeout(() => {
        if (responsables.length > 0) {
          console.log('🔍 Precargando responsable después de carga:', responsableActual);
          setResponsableId(responsableActual);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.log('🔍 No se precarga responsable:', { isOpen, isEditMode, responsableActual, responsablesLength: responsables.length });
    }
  }, [isOpen, isEditMode, responsableActual, responsables.length]);

  // Cargar datos iniciales
  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);
      
      if (isEditMode) {
        // En modo de edición, solo cargar responsables
        await cargarResponsables();
      } else {
        // En modo de creación, cargar todo
        await Promise.all([
          cargarInvestigaciones(),
          cargarResponsables()
        ]);
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showError('Error cargando datos iniciales');
    } finally {
      setLoadingData(false);
    }
  };

  // Cargar investigaciones disponibles
  const cargarInvestigaciones = async () => {
    try {
      // Obtener investigaciones de la tabla de reclutamiento (como en el backup)
      const response = await fetch('/api/metricas-reclutamientos');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Datos de métricas recibidos:', data);
        
        // Filtrar investigaciones que estén por agendar y NO tengan agendamiento asignado
        const investigacionesDisponibles = data.investigaciones?.filter((inv: any) => 
          inv.estado_investigacion === 'por_agendar' && !inv.tiene_agendamiento
        ) || [];
        
        console.log('🔍 Investigaciones disponibles para agendamiento:', investigacionesDisponibles.length);
        console.log('🔍 Investigaciones disponibles:', investigacionesDisponibles);
        
        setInvestigaciones(investigacionesDisponibles);
      } else {
        throw new Error('Error al obtener investigaciones');
      }
    } catch (error) {
      console.error('Error cargando investigaciones:', error);
      throw error;
    }
  };

  // Cargar responsables disponibles
  const cargarResponsables = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Datos de usuarios recibidos:', data);
        
        // Manejar diferentes formatos de respuesta
        const usuarios = data.usuarios || data || [];
        
        // Filtrar usuarios que tengan roles de reclutador o administrador
        const responsablesDisponibles = usuarios.filter((user: Usuario) => {
          // Si no tiene roles, incluir por defecto (para desarrollo)
          if (!user.roles || user.roles.length === 0) {
            return true; // Incluir todos los usuarios si no hay roles definidos
          }
          
          return user.roles.some((role: string) => 
            role.toLowerCase().includes('reclutador') || 
            role.toLowerCase().includes('administrador') ||
            role.toLowerCase().includes('admin')
          );
        });
        
        console.log('👥 Responsables disponibles:', responsablesDisponibles);
        setResponsables(responsablesDisponibles);
        
        // Si no hay responsables filtrados, mostrar todos los usuarios
        if (responsablesDisponibles.length === 0 && usuarios.length > 0) {
          console.log('⚠️ No se encontraron usuarios con roles específicos, mostrando todos');
          setResponsables(usuarios);
        }
      } else {
        throw new Error('Error al obtener responsables');
      }
    } catch (error) {
      console.error('Error cargando responsables:', error);
      showError('Error al cargar la lista de responsables');
      throw error;
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // console.log('🔍 handleSubmit EJECUTADO - timestamp:', new Date().toISOString());
    
    if (isEditMode) {
      // Modo de edición: actualizar solo el responsable
      if (!responsableId || !reclutamientoId) {
        showError('Por favor selecciona un responsable');
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch(`/api/reclutamientos/${reclutamientoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reclutador_id: responsableId
          }),
        });

        if (response.ok) {
          const now = Date.now();
          const timeSinceLastNotification = now - lastSuccessNotificationTime.current;
          
          // Evitar notificaciones en menos de 2 segundos
          if (timeSinceLastNotification >= 2000) {
            showSuccess('Responsable actualizado exitosamente');
            lastSuccessNotificationTime.current = now;
          }
          onSuccess();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar responsable');
        }
      } catch (error) {
        console.error('Error actualizando responsable:', error);
        showError(error instanceof Error ? error.message : 'Error al actualizar responsable');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Modo de creación: asignar agendamiento completo
    // Si recibimos investigacionId por props, usarlo directamente
    const idInvestigacion = investigacionId || investigacionSeleccionada?.investigacion_id;
    if (!idInvestigacion || !responsableId) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/asignar-agendamiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investigacion_id: idInvestigacion,
          responsable_id: responsableId
        }),
      });

      if (response.ok) {
        const now = Date.now();
        const timeSinceLastNotification = now - lastSuccessNotificationTime.current;
        
        // Evitar notificaciones en menos de 2 segundos
        if (timeSinceLastNotification >= 2000) {
          showSuccess('Agendamiento asignado exitosamente');
          lastSuccessNotificationTime.current = now;
        }
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asignar agendamiento');
      }
    } catch (error) {
      console.error('Error asignando agendamiento:', error);
      showError(error instanceof Error ? error.message : 'Error al asignar agendamiento');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setInvestigacionSeleccionada(null);
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
        disabled={loading || !responsableId || (!isEditMode && !investigacionId && !investigacionSeleccionada)}
        className="flex items-center gap-2"
      >
        <SaveIcon className="w-4 h-4" />
        {isEditMode ? 'Actualizar Responsable' : 'Asignar Agendamiento'}
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Editar Responsable del Agendamiento" : "Asignar Agendamiento"}
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
          {/* Selector de investigación solo si NO es modo de edición y NO hay investigacionId */}
          {!isEditMode && !investigacionId && (
            <div>
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Investigación *
              </Typography>
              {investigaciones.length === 0 ? (
                <div className="bg-warning/10 dark:bg-warning/20 p-4 rounded-lg">
                  <Typography variant="body2" color="secondary" className="text-warning">
                    No hay investigaciones disponibles para asignar agendamiento. 
                    Todas las investigaciones ya tienen reclutamiento asignado o no están en estado "por agendar".
                  </Typography>
                </div>
              ) : (
                <Select
                  value={investigacionSeleccionada?.investigacion_id || ''}
                  onChange={(value) => {
                    const investigacion = investigaciones.find(inv => inv.investigacion_id === value);
                    setInvestigacionSeleccionada(investigacion || null);
                  }}
                  placeholder="Seleccionar investigación"
                  options={investigaciones.map(inv => ({
                    value: inv.investigacion_id,
                    label: inv.investigacion_nombre
                  }))}
                  disabled={loading}
                  fullWidth
                />
              )}
            </div>
          )}

          {/* Responsable del agendamiento */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              {isEditMode ? 'Responsable del Agendamiento' : 'Responsable del Agendamiento *'}
            </Typography>
            {responsables.length === 0 ? (
              <div className="bg-destructive/10 dark:bg-destructive/20 p-4 rounded-lg">
                <Typography variant="body2" color="secondary" className="text-destructive">
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
                required={!isEditMode}
              />
            )}
          </div>
        </form>
      )}
    </SideModal>
  );
} 