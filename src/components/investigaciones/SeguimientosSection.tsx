import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Typography, Button, Card, Chip, ConfirmModal } from '../ui';
import SeguimientoSideModal from '../ui/SeguimientoSideModal';
import { PlusIcon, EditIcon, TrashIcon, CopyIcon, FileTextIcon, UserIcon } from '../icons';
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

  // Eliminar seguimiento
  const handleEliminarSeguimiento = async () => {
    if (!seguimientoEliminar) return;
    
    const response = await eliminarSeguimiento(seguimientoEliminar.id);
    
    if (response.error) {
      showError('Error al eliminar seguimiento');
      return;
    }
    
    showSuccess('Seguimiento eliminado exitosamente');
    setSeguimientoEliminar(null);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Typography variant="h3" weight="medium">
            Seguimientos
          </Typography>
          {/* Botón eliminado aquí, solo queda el botón superior en el header real */}
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Typography variant="h3" weight="medium">
            Seguimientos ({seguimientos.length})
          </Typography>
          {updating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
        {/* Botón eliminado: solo queda el botón global de la cabecera */}
      </div>

      {/* Lista de seguimientos */}
      {seguimientos.length === 0 ? (
        <Card variant="outlined" padding="lg" className="text-center">
          <Typography variant="body1" color="secondary" className="mb-4">
            {investigacionEstado === 'en_progreso' 
              ? 'No hay seguimientos registrados. Crea el primer seguimiento para documentar el progreso.'
              : 'No hay seguimientos registrados.'
            }
          </Typography>
          {/* Botón eliminado aquí, solo queda el botón superior */}
        </Card>
      ) : (
        <div className="space-y-3">
          {seguimientos.map((seguimiento) => (
            <Card key={seguimiento.id} variant="outlined" padding="md">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header del seguimiento */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                      <Typography variant="subtitle2" weight="medium">
                        {formatearFecha(seguimiento.fecha_seguimiento)}
                      </Typography>
                      <Chip variant={getEstadoBadgeVariant(seguimiento.estado)}>
                        {seguimiento.estado.charAt(0).toUpperCase() + seguimiento.estado.slice(1)}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-2">
                      {investigacionEstado === 'en_progreso' && 
                       seguimiento.estado !== 'convertido' && 
                       seguimiento.estado !== 'completado' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSeguimientoEditando(seguimiento);
                              setShowSeguimientoModal(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <EditIcon className="w-3 h-3" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleConvertirSeguimiento(seguimiento);
                            }}
                            className="flex items-center gap-1"
                          >
                            <CopyIcon className="w-3 h-3" />
                            Convertir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSeguimientoEliminar(seguimiento)}
                            className="flex items-center gap-1 !text-destructive"
                          >
                            <TrashIcon className="w-3 h-3 text-destructive" />
                            Eliminar
                          </Button>
                        </>
                      )}
                      {seguimiento.estado === 'convertido' && (
                        <Chip variant="success" className="text-xs">
                          ✓ Convertido en investigación
                        </Chip>
                      )}
                      {seguimiento.estado === 'completado' && (
                        <Chip variant="success" className="text-xs">
                          ✓ Completado
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div>
                    <Typography variant="body2" className="whitespace-pre-wrap">
                      {seguimiento.notas}
                    </Typography>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <span>
                        Responsable: {obtenerNombreUsuario(seguimiento.responsable_id)}
                      </span>
                      {seguimiento.participante_externo && (
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          Participante: {seguimiento.participante_externo.nombre}
                          {seguimiento.participante_externo.empresa_nombre && (
                            <span className="text-xs">({seguimiento.participante_externo.empresa_nombre})</span>
                          )}
                        </span>
                      )}
                    </div>
                    <span>
                      Creado por: {obtenerNombreUsuario(seguimiento.creado_por)} • {formatearFecha(seguimiento.creado_el)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={!!seguimientoEliminar}
        onClose={() => setSeguimientoEliminar(null)}
        onConfirm={handleEliminarSeguimiento}
        title="Eliminar Seguimiento"
        message={`¿Estás seguro de que deseas eliminar este seguimiento? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="error"
      />
    </div>
  );
}; 