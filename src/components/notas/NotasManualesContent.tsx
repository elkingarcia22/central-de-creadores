import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, EmptyState, ConfirmModal } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import { PlusIcon, MessageIcon, ClockIcon, TrashIcon, EditIcon, CheckIcon, XIcon, WarningIcon, UserIcon } from '../../components/icons';
import { formatearFecha } from '../../utils/fechas';
import { SemaforoRiesgoSelector, SemaforoRiesgoIndicator, SemaforoRiesgoQuickChange, SemaforoRiesgo } from './SemaforoRiesgoSelector';
import { Chip } from '../ui';

interface Nota {
  id: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  semaforo_riesgo: 'verde' | 'amarillo' | 'rojo';
  // Campos para indicar conversiones
  convertida_a_dolor?: boolean;
  convertida_a_perfilamiento?: boolean;
  dolor_id?: string;
  perfilamiento_id?: string;
}

interface NotasManualesContentProps {
  participanteId: string;
  sesionId: string;
  onConvertirADolor?: (contenido: string) => void;
  onConvertirAPerfilamiento?: (contenido: string) => void;
  onNotasChange?: (notas: Nota[]) => void;
  onNotaConvertidaADolor?: (notaId: string, dolorId: string) => void;
  onNotaConvertidaAPerfilamiento?: (notaId: string, perfilamientoId: string) => void;
}

export const NotasManualesContent: React.FC<NotasManualesContentProps> = ({
  participanteId,
  sesionId,
  onConvertirADolor,
  onConvertirAPerfilamiento,
  onNotasChange,
  onNotaConvertidaADolor,
  onNotaConvertidaAPerfilamiento
}) => {
  // Debug logs para verificar props
  console.log('🔍 [DEBUG] NotasManualesContent props:', {
    participanteId,
    sesionId,
    hasOnConvertirADolor: !!onConvertirADolor,
    hasOnConvertirAPerfilamiento: !!onConvertirAPerfilamiento,
    hasOnNotasChange: !!onNotasChange
  });
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [semaforoNuevaNota, setSemaforoNuevaNota] = useState<SemaforoRiesgo>('verde');
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [notaEditando, setNotaEditando] = useState('');
  const [semaforoEditando, setSemaforoEditando] = useState<SemaforoRiesgo>('verde');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notaAEliminar, setNotaAEliminar] = useState<Nota | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [filtroSemaforo, setFiltroSemaforo] = useState<SemaforoRiesgo | 'todos'>('todos');
  const inputRef = useRef<HTMLInputElement>(null);

  // Notificar al componente padre cuando las notas cambien
  useEffect(() => {
    if (onNotasChange) {
      onNotasChange(notas);
    }
  }, [notas, onNotasChange]);

  // Exponer las funciones de marcado de conversión al componente padre
  useEffect(() => {
    // Agregar las funciones al objeto window para que los componentes padre puedan acceder
    (window as any).marcarNotaConvertidaADolor = marcarNotaConvertidaADolor;
    (window as any).marcarNotaConvertidaAPerfilamiento = marcarNotaConvertidaAPerfilamiento;
    
    return () => {
      // Limpiar las funciones cuando el componente se desmonte
      delete (window as any).marcarNotaConvertidaADolor;
      delete (window as any).marcarNotaConvertidaAPerfilamiento;
    };
  }, []);

  // Manejar eventos de teclado en el input
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        guardarNota(nuevaNota, semaforoNuevaNota);
        setNuevaNota('');
        setSemaforoNuevaNota('verde');
      }
    };

    input.addEventListener('keypress', handleKeyPress);
    return () => input.removeEventListener('keypress', handleKeyPress);
  }, [nuevaNota, semaforoNuevaNota]);

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

  const guardarNota = async (contenido: string, semaforo: SemaforoRiesgo = 'verde') => {
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
          contenido: contenido.trim(),
          semaforo_riesgo: semaforo
        }),
      });

      if (response.ok) {
        const nuevaNota = await response.json();
        setNotas(prev => [nuevaNota, ...prev]);
        
        // Limpiar el input inmediatamente para flujo continuo
        setNuevaNota('');
        setSemaforoNuevaNota('verde');
        
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

  const actualizarNota = async (notaId: string, nuevoContenido: string, semaforo?: SemaforoRiesgo) => {
    if (!nuevoContenido.trim()) return;

    try {
      const body: any = {
        contenido: nuevoContenido.trim()
      };

      if (semaforo) {
        body.semaforo_riesgo = semaforo;
      }

      const response = await fetch(`/api/notas-manuales/${notaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
    setSemaforoEditando(nota.semaforo_riesgo);
  };

  const cancelarEdicion = () => {
    setEditandoNota(null);
    setNotaEditando('');
    setSemaforoEditando('verde');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (editandoNota) {
          actualizarNota(editandoNota, notaEditando, semaforoEditando);
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

  // Filtrar notas por semáforo de riesgo
  const notasFiltradas = filtroSemaforo === 'todos' 
    ? notas 
    : notas.filter(nota => nota.semaforo_riesgo === filtroSemaforo);

  // Función para cambiar el color de una nota rápidamente
  const cambiarColorNota = async (notaId: string, nuevoColor: SemaforoRiesgo) => {
    try {
      // Encontrar la nota actual para obtener su contenido
      const notaActual = notas.find(nota => nota.id === notaId);
      if (!notaActual) {
        console.error('No se encontró la nota para actualizar');
        return;
      }

      const response = await fetch(`/api/notas-manuales/${notaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contenido: notaActual.contenido,
          semaforo_riesgo: nuevoColor
        }),
      });

      if (response.ok) {
        const notaActualizada = await response.json();
        setNotas(prev => prev.map(nota => 
          nota.id === notaId ? notaActualizada : nota
        ));
      } else {
        console.error('Error cambiando color de nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error cambiando color de nota:', error);
    }
  };

  // Función para marcar una nota como convertida a dolor
  const marcarNotaConvertidaADolor = (notaId: string, dolorId: string) => {
    setNotas(prev => prev.map(nota => 
      nota.id === notaId 
        ? { ...nota, convertida_a_dolor: true, dolor_id: dolorId }
        : nota
    ));
    
    // Notificar al componente padre si existe la función
    if (onNotaConvertidaADolor) {
      onNotaConvertidaADolor(notaId, dolorId);
    }
  };

  // Función para marcar una nota como convertida a perfilamiento
  const marcarNotaConvertidaAPerfilamiento = (notaId: string, perfilamientoId: string) => {
    setNotas(prev => prev.map(nota => 
      nota.id === notaId 
        ? { ...nota, convertida_a_perfilamiento: true, perfilamiento_id: perfilamientoId }
        : nota
    ));
    
    // Notificar al componente padre si existe la función
    if (onNotaConvertidaAPerfilamiento) {
      onNotaConvertidaAPerfilamiento(notaId, perfilamientoId);
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
          <span>{notasFiltradas.length} de {notas.length} notas</span>
        </div>
      </div>

      {/* Filtro de semáforo de riesgo */}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Filtrar por riesgo:
        </span>
        <div className="flex items-center space-x-2">
          <Chip
            variant="default"
            size="sm"
            onClick={() => setFiltroSemaforo('todos')}
            className="cursor-pointer"
          >
            Todas
          </Chip>
          <Chip
            variant={filtroSemaforo === 'verde' ? 'success' : 'default'}
            size="sm"
            onClick={() => setFiltroSemaforo('verde')}
            className="cursor-pointer"
          >
            Bueno
          </Chip>
          <Chip
            variant={filtroSemaforo === 'amarillo' ? 'warning' : 'default'}
            size="sm"
            onClick={() => setFiltroSemaforo('amarillo')}
            className="cursor-pointer"
          >
            Alerta
          </Chip>
          <Chip
            variant={filtroSemaforo === 'rojo' ? 'danger' : 'default'}
            size="sm"
            onClick={() => setFiltroSemaforo('rojo')}
            className="cursor-pointer"
          >
            Crítico
          </Chip>
        </div>
      </div>

      {/* Input para nueva nota */}
      <Card variant="default" className="p-4 bg-card dark:bg-gray-800/50">
        <div className="space-y-3">
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
              onClick={() => guardarNota(nuevaNota, semaforoNuevaNota)}
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
          
          {/* Selector de semáforo de riesgo */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Nivel de riesgo:
            </span>
            <SemaforoRiesgoSelector
              valor={semaforoNuevaNota}
              onChange={setSemaforoNuevaNota}
              size="sm"
              disabled={cargando}
            />
          </div>
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
      ) : notasFiltradas.length === 0 ? (
        <EmptyState
          icon={<MessageIcon className="w-12 h-12 text-gray-400" />}
          title="No hay notas con este filtro"
          description="Cambia el filtro o crea una nueva nota"
        />
      ) : (
        <div className="space-y-3">
          {notasFiltradas.map((nota) => (
            <Card key={nota.id} variant="default" className="p-4 hover:shadow-md transition-shadow bg-card dark:bg-gray-800/50">
              {editandoNota === nota.id ? (
                <div className="space-y-3">
                  <Input
                    value={notaEditando}
                    onChange={(e) => setNotaEditando(e.target.value)}
                    className="text-base"
                  />
                  
                  {/* Selector de semáforo en modo edición */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Nivel de riesgo:
                    </span>
                    <SemaforoRiesgoSelector
                      valor={semaforoEditando}
                      onChange={setSemaforoEditando}
                      size="sm"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => actualizarNota(nota.id, notaEditando, semaforoEditando)}
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
                    <div className="flex-1">
                      <Typography variant="body1" className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        {nota.contenido}
                      </Typography>
                      
                      {/* Indicadores de conversión */}
                      {(nota.convertida_a_dolor || nota.convertida_a_perfilamiento) && (
                        <div className="flex items-center space-x-2 mt-2">
                          {nota.convertida_a_dolor && (
                            <Chip
                              variant="danger"
                              size="sm"
                              className="text-xs"
                            >
                              <WarningIcon className="w-3 h-3 mr-1" />
                              Convertida a Dolor
                            </Chip>
                          )}
                          {nota.convertida_a_perfilamiento && (
                            <Chip
                              variant="primary"
                              size="sm"
                              className="text-xs"
                            >
                              <UserIcon className="w-3 h-3 mr-1" />
                              Convertida a Perfilamiento
                            </Chip>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Cambio rápido de semáforo de riesgo */}
                      <SemaforoRiesgoQuickChange
                        valor={nota.semaforo_riesgo}
                        onChange={(nuevoColor) => cambiarColorNota(nota.id, nuevoColor)}
                        size="sm"
                      />
                      {/* Botones de conversión */}
                      {onConvertirADolor && (
                        <Button
                          onClick={() => {
                            console.log('🔍 [DEBUG] Botón Dolor clickeado, contenido:', nota.contenido);
                            onConvertirADolor(nota.contenido);
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          <WarningIcon className="w-4 h-4 mr-1" />
                          Dolor
                        </Button>
                      )}
                      {onConvertirAPerfilamiento && (
                        <Button
                          onClick={() => {
                            console.log('🔍 [DEBUG] Botón Perfilamiento clickeado, contenido:', nota.contenido);
                            onConvertirAPerfilamiento(nota.contenido);
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          <UserIcon className="w-4 h-4 mr-1" />
                          Perfilamiento
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
