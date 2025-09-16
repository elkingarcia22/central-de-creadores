import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, EmptyState, ConfirmModal } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import { PlusIcon, MessageIcon, ClockIcon, TrashIcon, EditIcon, CheckIcon, XIcon, WarningIcon, UserIcon } from '../../components/icons';
import { formatearFecha } from '../../utils/fechas';

interface Nota {
  id: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

interface NotasManualesContentProps {
  participanteId: string;
  sesionId: string;
  onConvertirADolor?: (contenido: string) => void;
  onConvertirAPerfilamiento?: (contenido: string) => void;
}

export const NotasManualesContent: React.FC<NotasManualesContentProps> = ({
  participanteId,
  sesionId,
  onConvertirADolor,
  onConvertirAPerfilamiento
}) => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [notaEditando, setNotaEditando] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notaAEliminar, setNotaAEliminar] = useState<Nota | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar notas al montar el componente
  useEffect(() => {
    cargarNotas();
  }, [participanteId, sesionId]);

  // Enfocar el input cuando se monta
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const cargarNotas = async () => {
    try {
      setCargando(true);
      const response = await fetch(`/api/notas-manuales?participante_id=${participanteId}&sesion_id=${sesionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotas(data.notas || []);
      } else {
        console.error('Error cargando notas:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando notas:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarNota = async (contenido: string) => {
    if (!contenido.trim()) return;

    if (!participanteId || !sesionId) {
      console.error('❌ Faltan participanteId o sesionId');
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch('/api/notas-manuales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participante_id: participanteId,
          sesion_id: sesionId,
          contenido: contenido.trim()
        }),
      });

      if (response.ok) {
        const nuevaNota = await response.json();
        setNotas(prev => [nuevaNota, ...prev]);
        
        // Limpiar el input inmediatamente para flujo continuo
        setNuevaNota('');
        
        // Enfocar el input inmediatamente para seguir escribiendo
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // Mover el cursor al final del input
            inputRef.current.setSelectionRange(0, 0);
          }
        }, 50);
      } else {
        console.error('Error guardando nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error guardando nota:', error);
    } finally {
      setGuardando(false);
    }
  };

  const actualizarNota = async (notaId: string, nuevoContenido: string) => {
    if (!nuevoContenido.trim()) return;

    try {
      const response = await fetch(`/api/notas-manuales/${notaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contenido: nuevoContenido.trim()
        }),
      });

      if (response.ok) {
        const notaActualizada = await response.json();
        setNotas(prev => prev.map(nota => 
          nota.id === notaId ? notaActualizada : nota
        ));
        setEditandoNota(null);
        setNotaEditando('');
      } else {
        console.error('Error actualizando nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error actualizando nota:', error);
    }
  };

  const iniciarEdicion = (nota: Nota) => {
    setEditandoNota(nota.id);
    setNotaEditando(nota.contenido);
  };

  const cancelarEdicion = () => {
    setEditandoNota(null);
    setNotaEditando('');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editandoNota) {
        actualizarNota(editandoNota, notaEditando);
      }
    }
    if (e.key === 'Escape') {
      cancelarEdicion();
    }
  };

  const confirmarEliminarNota = (nota: Nota) => {
    setNotaAEliminar(nota);
    setShowDeleteModal(true);
  };

  const eliminarNota = async () => {
    if (!notaAEliminar) return;

    setEliminando(true);
    try {
      const response = await fetch(`/api/notas-manuales/${notaAEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotas(prev => prev.filter(nota => nota.id !== notaAEliminar.id));
        setShowDeleteModal(false);
        setNotaAEliminar(null);
      } else {
        console.error('Error eliminando nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error eliminando nota:', error);
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminar = () => {
    setShowDeleteModal(false);
    setNotaAEliminar(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      guardarNota(nuevaNota);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" weight="semibold" className="text-gray-700 dark:text-gray-200">
            Notas Manuales
          </Typography>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mt-1">
            Escribe tus notas durante la sesión. Presiona Enter para guardar y continuar escribiendo.
          </Typography>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <MessageIcon className="w-4 h-4" />
          <span>{notas.length} notas</span>
        </div>
      </div>

      {/* Input para nueva nota */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              placeholder="Escribe tu nota aquí... (Enter para guardar y continuar)"
              className="border-0 focus:ring-0 text-base placeholder-gray-400 dark:placeholder-gray-500"
              disabled={cargando}
            />
          </div>
          <Button
            onClick={() => guardarNota(nuevaNota)}
            disabled={!nuevaNota.trim() || cargando || guardando}
            size="sm"
            className="shrink-0"
          >
            {guardando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Lista de notas */}
      {cargando ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : notas.length === 0 ? (
        <EmptyState
          icon={<MessageIcon className="w-12 h-12 text-gray-400" />}
          title="No hay notas aún"
          description="Comienza escribiendo tu primera nota arriba"
        />
      ) : (
        <div className="space-y-3">
          {notas.map((nota) => (
            <Card key={nota.id} className="p-4 hover:shadow-md transition-shadow">
              {editandoNota === nota.id ? (
                <div className="space-y-3">
                  <Input
                    value={notaEditando}
                    onChange={(e) => setNotaEditando(e.target.value)}
                    className="text-base"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => actualizarNota(nota.id, notaEditando)}
                      size="sm"
                      variant="primary"
                      disabled={!notaEditando.trim()}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={cancelarEdicion}
                      size="sm"
                      variant="secondary"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Typography variant="body1" className="text-gray-700 dark:text-gray-200 leading-relaxed">
                      {nota.contenido}
                    </Typography>
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Botones de conversión */}
                      {onConvertirADolor && (
                        <Button
                          onClick={() => onConvertirADolor(nota.contenido)}
                          size="sm"
                          variant="ghost"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          <WarningIcon className="w-4 h-4" />
                        </Button>
                      )}
                      {onConvertirAPerfilamiento && (
                        <Button
                          onClick={() => onConvertirAPerfilamiento(nota.contenido)}
                          size="sm"
                          variant="ghost"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <UserIcon className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => iniciarEdicion(nota)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => confirmarEliminarNota(nota)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatearFecha(nota.fecha_creacion)}</span>
                    </div>
                    {nota.fecha_actualizacion && nota.fecha_actualizacion !== nota.fecha_creacion && (
                      <div className="flex items-center space-x-1">
                        <EditIcon className="w-4 h-4" />
                        <span>Editado {formatearFecha(nota.fecha_actualizacion)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelarEliminar}
        onConfirm={eliminarNota}
        title="Eliminar Nota"
        message={notaAEliminar ? `¿Estás seguro de que deseas eliminar la nota "${notaAEliminar.contenido}"? Esta acción no se puede deshacer.` : "¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer."}
        type="error"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={eliminando}
      />
    </div>
  );
};
