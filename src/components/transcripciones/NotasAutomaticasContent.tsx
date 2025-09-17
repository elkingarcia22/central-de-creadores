import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, EmptyState, Badge, ConfirmModal, Chip, Input } from '../ui';
import { MicIcon, PlayIcon, PauseIcon, StopIcon, FileTextIcon, ClockIcon, UserIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { SemaforoRiesgoSelector, SemaforoRiesgoQuickChange, SemaforoRiesgo } from '../notas/SemaforoRiesgoSelector';
import { safeFetch } from '../../utils/safeFetch';

interface NotasAutomaticasContentProps {
  reclutamientoId?: string;
  sesionApoyoId?: string;
  isRecording: boolean;
  duracionGrabacion: number;
  transcripcionCompleta: string;
  segmentosTranscripcion: any[];
  isProcessing?: boolean;
  error?: string | null;
  refreshTrigger?: number; // Para forzar recarga cuando cambie
}

interface TranscripcionSesion {
  id: string;
  reclutamiento_id: string;
  meet_link: string;
  transcripcion_completa?: string;
  transcripcion_por_segmentos?: any[];
  duracion_total?: number;
  idioma_detectado?: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at?: string;
  updated_at?: string;
  semaforo_riesgo?: 'verde' | 'amarillo' | 'rojo';
}

export const NotasAutomaticasContent: React.FC<NotasAutomaticasContentProps> = ({
  reclutamientoId,
  sesionApoyoId,
  isRecording,
  duracionGrabacion,
  transcripcionCompleta,
  segmentosTranscripcion,
  isProcessing = false,
  error = null,
  refreshTrigger
}) => {
  console.log('🔍 NotasAutomaticasContent - Props recibidos:', {
    transcripcionCompleta: transcripcionCompleta ? transcripcionCompleta.substring(0, 50) + '...' : 'VACÍO',
    segmentosTranscripcion: segmentosTranscripcion.length,
    isProcessing,
    isRecording
  });
  const [transcripciones, setTranscripciones] = useState<TranscripcionSesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTranscripcion, setSelectedTranscripcion] = useState<TranscripcionSesion | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transcripcionAEliminar, setTranscripcionAEliminar] = useState<TranscripcionSesion | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [filtroSemaforo, setFiltroSemaforo] = useState<'todos' | 'verde' | 'amarillo' | 'rojo'>('todos');
  const [editandoTranscripcion, setEditandoTranscripcion] = useState<string | null>(null);
  const [transcripcionEditando, setTranscripcionEditando] = useState('');
  const [semaforoEditando, setSemaforoEditando] = useState<SemaforoRiesgo>('verde');

  // Cargar transcripciones existentes
  useEffect(() => {
    if (reclutamientoId || sesionApoyoId) {
      loadTranscripciones();
    }
  }, [reclutamientoId, sesionApoyoId]);

  // Recargar transcripciones cuando cambie el refreshTrigger
  useEffect(() => {
    if (refreshTrigger && (reclutamientoId || sesionApoyoId)) {
      console.log('🔄 [NotasAutomaticasContent] RefreshTrigger cambió, recargando transcripciones...');
      loadTranscripciones();
    }
  }, [refreshTrigger]);

  const loadTranscripciones = async () => {
    try {
      console.log('🔍 [NotasAutomaticasContent] loadTranscripciones iniciado:', {
        reclutamientoId,
        sesionApoyoId
      });
      
      // Verificar que tenemos al menos un ID
      if (!reclutamientoId && !sesionApoyoId) {
        console.log('⚠️ [NotasAutomaticasContent] No hay IDs para cargar transcripciones');
        return;
      }
      
      setLoading(true);
      let url = '/api/transcripciones?';
      if (reclutamientoId) {
        url += `reclutamiento_id=${reclutamientoId}`;
      } else if (sesionApoyoId) {
        url += `sesion_apoyo_id=${sesionApoyoId}`;
      }
      
      console.log('📡 [NotasAutomaticasContent] Haciendo fetch a:', url);
      
      const data = await safeFetch(url);
      console.log('📊 [NotasAutomaticasContent] Datos recibidos:', data);
      setTranscripciones(data);
      
      // Si hay transcripciones, seleccionar la más reciente
      if (data.length > 0) {
        setSelectedTranscripcion(data[0]);
      }
    } catch (error) {
      console.error('❌ [NotasAutomaticasContent] Error cargando transcripciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminarTranscripcion = (transcripcion: TranscripcionSesion) => {
    setTranscripcionAEliminar(transcripcion);
    setShowDeleteModal(true);
  };

  const eliminarTranscripcion = async () => {
    if (!transcripcionAEliminar) return;

    setEliminando(true);
    try {
      const response = await fetch(`/api/transcripciones/${transcripcionAEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTranscripciones(prev => prev.filter(t => t.id !== transcripcionAEliminar.id));
        if (selectedTranscripcion?.id === transcripcionAEliminar.id) {
          setSelectedTranscripcion(null);
        }
        setShowDeleteModal(false);
        setTranscripcionAEliminar(null);
      } else {
        console.error('Error eliminando transcripción:', response.statusText);
      }
    } catch (error) {
      console.error('Error eliminando transcripción:', error);
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminar = () => {
    setShowDeleteModal(false);
    setTranscripcionAEliminar(null);
  };

  // Función para cambiar el color de una transcripción rápidamente
  const cambiarColorTranscripcion = async (transcripcionId: string, nuevoColor: SemaforoRiesgo) => {
    try {
      const response = await fetch(`/api/transcripciones/${transcripcionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semaforo_riesgo: nuevoColor
        }),
      });

      if (response.ok) {
        const transcripcionActualizada = await response.json();
        setTranscripciones(prev => prev.map(transcripcion => 
          transcripcion.id === transcripcionId ? transcripcionActualizada : transcripcion
        ));
        // Actualizar también la transcripción seleccionada si es la misma
        if (selectedTranscripcion?.id === transcripcionId) {
          setSelectedTranscripcion(transcripcionActualizada);
        }
      } else {
        console.error('Error cambiando color de transcripción:', response.statusText);
      }
    } catch (error) {
      console.error('Error cambiando color de transcripción:', error);
    }
  };

  // Función para iniciar edición
  const iniciarEdicion = (transcripcion: TranscripcionSesion) => {
    setEditandoTranscripcion(transcripcion.id);
    setTranscripcionEditando(transcripcion.transcripcion_completa || '');
    setSemaforoEditando(transcripcion.semaforo_riesgo || 'verde');
  };

  // Función para cancelar edición
  const cancelarEdicion = () => {
    setEditandoTranscripcion(null);
    setTranscripcionEditando('');
    setSemaforoEditando('verde');
  };

  // Función para actualizar transcripción
  const actualizarTranscripcion = async (transcripcionId: string) => {
    try {
      const response = await fetch(`/api/transcripciones/${transcripcionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcripcion_completa: transcripcionEditando,
          semaforo_riesgo: semaforoEditando
        }),
      });

      if (response.ok) {
        const transcripcionActualizada = await response.json();
        setTranscripciones(prev => prev.map(transcripcion => 
          transcripcion.id === transcripcionId ? transcripcionActualizada : transcripcion
        ));
        // Actualizar también la transcripción seleccionada si es la misma
        if (selectedTranscripcion?.id === transcripcionId) {
          setSelectedTranscripcion(transcripcionActualizada);
        }
        cancelarEdicion();
      } else {
        console.error('Error actualizando transcripción:', response.statusText);
      }
    } catch (error) {
      console.error('Error actualizando transcripción:', error);
    }
  };

  // Filtrar transcripciones por semáforo de riesgo
  const transcripcionesFiltradas = filtroSemaforo === 'todos' 
    ? transcripciones 
    : transcripciones.filter(transcripcion => (transcripcion.semaforo_riesgo || 'verde') === filtroSemaforo);

  const formatDuracion = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'procesando':
        return 'warning';
      case 'completada':
        return 'success';
      case 'error':
        return 'destructive';
      case 'pausada':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'procesando':
        return 'Procesando';
      case 'completada':
        return 'Completada';
      case 'error':
        return 'Error';
      case 'pausada':
        return 'Pausada';
      default:
        return estado;
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado actual de grabación */}
      {isRecording && (
        <Card variant="elevated" padding="md" className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <Typography variant="h5" weight="semibold" className="text-orange-800 dark:text-orange-200">
              Grabando en curso
            </Typography>
            <Badge variant="warning" size="sm">
              {formatDuracion(duracionGrabacion)}
            </Badge>
          </div>
          <Typography variant="body2" color="secondary" className="mt-2">
            La transcripción se está generando automáticamente...
          </Typography>
        </Card>
      )}

      {/* Estado de procesamiento */}
      {isProcessing && (
        <Card variant="elevated" padding="md" className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin"></div>
            <Typography variant="h5" weight="semibold" className="text-blue-800 dark:text-blue-200">
              Procesando transcripción
            </Typography>
          </div>
          <Typography variant="body2" color="secondary" className="mt-2">
            Analizando el audio y generando la transcripción...
          </Typography>
          
          {/* Mostrar transcripción en tiempo real si está disponible */}
          {transcripcionCompleta && (
            <div className="mt-4">
              <Typography variant="h6" weight="medium" className="mb-2 text-gray-600 dark:text-gray-300">
                Transcripción en tiempo real:
              </Typography>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <Typography variant="body1" className="whitespace-pre-wrap">
                  {transcripcionCompleta}
                </Typography>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Estado de error */}
      {error && (
        <Card variant="elevated" padding="md" className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <Typography variant="h5" weight="semibold" className="text-red-800 dark:text-red-200">
              Error en la transcripción
            </Typography>
          </div>
          <Typography variant="body2" color="secondary" className="mt-2">
            {error}
          </Typography>
        </Card>
      )}

      {/* Transcripción actual en tiempo real */}
      {(() => {
        const shouldShow = (transcripcionCompleta || segmentosTranscripcion.length > 0) && !isProcessing;
        console.log('🔍 NotasAutomaticasContent - Condición de renderizado:', {
          transcripcionCompleta: !!transcripcionCompleta,
          segmentosTranscripcion: segmentosTranscripcion.length,
          isProcessing,
          isRecording,
          shouldShow
        });
        return shouldShow;
      })() && (
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h4" weight="semibold" className="text-gray-700 dark:text-gray-200">
                Transcripción Actual
              </Typography>
              {!isRecording ? (
                <Badge variant="success" size="sm">
                  Completada
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  En Progreso
                </Badge>
              )}
            </div>

            {transcripcionCompleta && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <Typography variant="body1" className="whitespace-pre-wrap">
                  {transcripcionCompleta}
                </Typography>
              </div>
            )}

            {/* Segmentos de transcripción */}
            {segmentosTranscripcion && segmentosTranscripcion.length > 0 && (
              <div className="space-y-3">
                <Typography variant="h5" weight="medium" className="text-gray-600 dark:text-gray-300">
                  Segmentos de Audio
                </Typography>
                <div className="space-y-2">
                  {segmentosTranscripcion.map((segmento: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Typography variant="body2" weight="medium">
                          {segmento.hablante || 'Desconocido'}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {segmento.timestamp_inicio}s - {segmento.timestamp_fin}s
                        </Typography>
                      </div>
                      <Typography variant="body2">
                        {segmento.texto}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lista de transcripciones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="h4" weight="semibold" className="text-gray-700 dark:text-gray-200">
            Transcripciones de la Sesión
          </Typography>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTranscripciones}
            disabled={loading}
          >
            <FileTextIcon className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
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

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="elevated" padding="md">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : transcripciones.length > 0 ? (
          <div className="space-y-3">
            {transcripcionesFiltradas.map((transcripcion) => (
              <Card
                key={transcripcion.id}
                variant="elevated"
                padding="md"
                className={`transition-colors ${
                  selectedTranscripcion?.id === transcripcion.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => !editandoTranscripcion && setSelectedTranscripcion(transcripcion)}
              >
                {editandoTranscripcion === transcripcion.id ? (
                  <div className="space-y-3">
                    <Input
                      value={transcripcionEditando}
                      onChange={(e) => setTranscripcionEditando(e.target.value)}
                      className="text-base"
                      placeholder="Editar transcripción..."
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
                        onClick={() => actualizarTranscripcion(transcripcion.id)}
                        size="sm"
                        variant="primary"
                        disabled={!transcripcionEditando.trim()}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MicIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <Typography variant="h5" weight="medium" className="text-gray-600 dark:text-gray-300">
                          Transcripción #{transcripcion.id.slice(-8)}
                        </Typography>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <Typography variant="body2" color="secondary">
                              {transcripcion.duracion_total ? formatDuracion(transcripcion.duracion_total) : 'N/A'}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <Typography variant="body2" color="secondary">
                              {transcripcion.idioma_detectado || 'es'}
                            </Typography>
                          </div>
                          <Typography variant="body2" color="secondary">
                            {transcripcion.fecha_inicio ? formatearFecha(transcripcion.fecha_inicio) : 'N/A'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getEstadoVariant(transcripcion.estado)} size="sm">
                        {getEstadoText(transcripcion.estado)}
                      </Badge>
                    {/* Cambio rápido de semáforo de riesgo */}
                    <SemaforoRiesgoQuickChange
                      valor={transcripcion.semaforo_riesgo || 'verde'}
                      onChange={(nuevoColor) => cambiarColorTranscripcion(transcripcion.id, nuevoColor)}
                      size="sm"
                    />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          iniciarEdicion(transcripcion);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmarEliminarTranscripcion(transcripcion);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MicIcon className="w-8 h-8" />}
            title="Sin transcripciones"
            description="No hay transcripciones disponibles para esta sesión. Inicia una grabación para comenzar."
          />
        )}
      </div>

      {/* Contenido de transcripción seleccionada */}
      {selectedTranscripcion && (
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h4" weight="semibold" className="text-gray-700 dark:text-gray-200">
                Contenido de la Transcripción
              </Typography>
              <Badge variant={getEstadoVariant(selectedTranscripcion.estado)} size="sm">
                {getEstadoText(selectedTranscripcion.estado)}
              </Badge>
            </div>

            {selectedTranscripcion.transcripcion_completa ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <Typography variant="body1" className="whitespace-pre-wrap">
                  {selectedTranscripcion.transcripcion_completa}
                </Typography>
              </div>
            ) : (
              <div className="text-center py-8">
                <Typography variant="body1" color="secondary">
                  La transcripción aún se está procesando...
                </Typography>
              </div>
            )}

            {/* Segmentos de transcripción */}
            {selectedTranscripcion.transcripcion_por_segmentos && 
             selectedTranscripcion.transcripcion_por_segmentos.length > 0 && (
              <div className="space-y-3">
                <Typography variant="h5" weight="medium" className="text-gray-600 dark:text-gray-300">
                  Segmentos de Audio
                </Typography>
                <div className="space-y-2">
                  {selectedTranscripcion.transcripcion_por_segmentos.map((segmento: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Typography variant="body2" weight="medium">
                          {segmento.hablante || 'Desconocido'}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {segmento.timestamp_inicio}s - {segmento.timestamp_fin}s
                        </Typography>
                      </div>
                      <Typography variant="body2">
                        {segmento.texto}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal de confirmación para eliminar transcripción */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelarEliminar}
        onConfirm={eliminarTranscripcion}
        title="Eliminar Transcripción"
        message={transcripcionAEliminar ? `¿Estás seguro de que deseas eliminar la transcripción del ${transcripcionAEliminar.fecha_inicio ? formatearFecha(transcripcionAEliminar.fecha_inicio) : 'registro'}? Esta acción no se puede deshacer.` : "¿Estás seguro de que deseas eliminar esta transcripción? Esta acción no se puede deshacer."}
        type="error"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={eliminando}
      />
    </div>
  );
};
