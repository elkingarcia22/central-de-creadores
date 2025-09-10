import React, { useState, useEffect } from 'react';
import { Typography, Button, Card } from '../ui';
import { FileTextIcon, ClockIcon, UserIcon, DownloadIcon, CopyIcon } from '../icons';
import { useToast } from '../../contexts/ToastContext';

interface TranscriptionViewerProps {
  reclutamientoId: string;
  meetLink?: string;
}

interface TranscriptionData {
  id: string;
  transcripcion_completa: string;
  transcripcion_por_segmentos: Array<{
    timestamp: number;
    text: string;
    speaker?: string;
  }>;
  duracion_total: number;
  idioma_detectado: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin?: string;
  created_at: string;
}

const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({
  reclutamientoId,
  meetLink
}) => {
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'complete' | 'segments'>('complete');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadTranscription();
  }, [reclutamientoId]);

  const loadTranscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/transcripciones/${reclutamientoId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setTranscription(null);
          return;
        }
        throw new Error('Error cargando transcripción');
      }

      const data = await response.json();
      setTranscription(data.transcripcion);
      
    } catch (error) {
      console.error('Error cargando transcripción:', error);
      setError('Error al cargar la transcripción');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Transcripción copiada al portapapeles');
    } catch (error) {
      showError('Error al copiar la transcripción');
    }
  };

  const downloadTranscription = () => {
    if (!transcription) return;

    const content = `Transcripción de Sesión
====================

Fecha: ${new Date(transcription.fecha_inicio).toLocaleString()}
Duración: ${formatDuration(transcription.duracion_total)}
Idioma: ${transcription.idioma_detectado}

${transcription.transcripcion_completa}

---
Generado automáticamente por Central de Creadores
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcripcion-sesion-${reclutamientoId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Transcripción descargada');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando transcripción...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <Button 
          onClick={loadTranscription} 
          variant="outline" 
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="text-center p-8">
        <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <Typography variant="h3" className="text-gray-600 mb-2">
          Sin transcripción disponible
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          No se ha encontrado una transcripción para esta sesión.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información de la transcripción */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-blue-600" />
            <Typography variant="h3" className="text-gray-900">
              Transcripción de la Sesión
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => copyToClipboard(transcription.transcripcion_completa)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CopyIcon className="w-4 h-4" />
              Copiar
            </Button>
            
            <Button
              onClick={downloadTranscription}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" />
              Descargar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Duración:</span>
            <span className="font-medium">{formatDuration(transcription.duracion_total)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Idioma:</span>
            <span className="font-medium">{transcription.idioma_detectado.toUpperCase()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Fecha:</span>
            <span className="font-medium">
              {new Date(transcription.fecha_inicio).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Selector de vista */}
      <div className="flex gap-2">
        <Button
          onClick={() => setViewMode('complete')}
          variant={viewMode === 'complete' ? 'primary' : 'outline'}
          size="sm"
        >
          Vista Completa
        </Button>
        <Button
          onClick={() => setViewMode('segments')}
          variant={viewMode === 'segments' ? 'primary' : 'outline'}
          size="sm"
        >
          Por Segmentos
        </Button>
      </div>

      {/* Contenido de la transcripción */}
      <Card className="p-6">
        {viewMode === 'complete' ? (
          <div className="space-y-4">
            <Typography variant="h4" className="text-gray-900">
              Transcripción Completa
            </Typography>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {transcription.transcripcion_completa}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Typography variant="h4" className="text-gray-900">
              Transcripción por Segmentos
            </Typography>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transcription.transcripcion_por_segmentos?.map((segment, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formatTimestamp(segment.timestamp)}
                    </span>
                    {segment.speaker && (
                      <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {segment.speaker}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {segment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TranscriptionViewer;
