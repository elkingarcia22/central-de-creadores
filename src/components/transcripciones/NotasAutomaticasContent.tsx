import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, EmptyState, Badge, ConfirmModal } from '../ui';
import { MicIcon, PlayIcon, PauseIcon, StopIcon, FileTextIcon, ClockIcon, UserIcon, TrashIcon } from '../icons';
import { formatearFecha } from '../../utils/fechas';

interface NotasAutomaticasContentProps {
  reclutamientoId?: string;
  isRecording: boolean;
  duracionGrabacion: number;
  transcripcionCompleta: string;
  segmentosTranscripcion: any[];
  isProcessing?: boolean;
  error?: string | null;
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
}

export const NotasAutomaticasContent: React.FC<NotasAutomaticasContentProps> = ({
  reclutamientoId,
  isRecording,
  duracionGrabacion,
  transcripcionCompleta,
  segmentosTranscripcion,
  isProcessing = false,
  error = null
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
  const [transcripcionAEliminar, setTranscripcionAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar transcripciones existentes
  useEffect(() => {
    if (reclutamientoId) {
      loadTranscripciones();
    }
  }, [reclutamientoId]);

  const loadTranscripciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transcripciones?reclutamiento_id=${reclutamientoId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTranscripciones(data);
        
        // Si hay transcripciones, seleccionar la más reciente
        if (data.length > 0) {
          setSelectedTranscripcion(data[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando transcripciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminarTranscripcion = (transcripcionId: string) => {
    setTranscripcionAEliminar(transcripcionId);
    setShowDeleteModal(true);
  };

  const eliminarTranscripcion = async () => {
    if (!transcripcionAEliminar) return;

    setEliminando(true);
    try {
      const response = await fetch(`/api/transcripciones/${transcripcionAEliminar}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTranscripciones(prev => prev.filter(t => t.id !== transcripcionAEliminar));
        if (selectedTranscripcion?.id === transcripcionAEliminar) {
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
              <Badge variant="success" size="sm">
                Completada
              </Badge>
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
            {transcripciones.map((transcripcion) => (
              <Card
                key={transcripcion.id}
                variant="elevated"
                padding="md"
                className={`cursor-pointer transition-colors ${
                  selectedTranscripcion?.id === transcripcion.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedTranscripcion(transcripcion)}
              >
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
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmarEliminarTranscripcion(transcripcion.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
        message="¿Estás seguro de que quieres eliminar esta transcripción? Esta acción no se puede deshacer."
        type="warning"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={eliminando}
      />
    </div>
  );
};
