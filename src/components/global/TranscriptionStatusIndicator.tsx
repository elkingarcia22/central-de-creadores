import React, { useState } from 'react';
import { useGlobalTranscription } from '../../contexts/GlobalTranscriptionContext';
import { MicIcon, MicOffIcon, PauseIcon, PlayIcon, StopIcon, ClockIcon } from '../icons';
import { Button } from '../ui';
import { Typography } from '../ui';

const TranscriptionStatusIndicator: React.FC = () => {
  const { transcriptionState, pauseTranscription, resumeTranscription, stopTranscription } = useGlobalTranscription();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!transcriptionState.isActive && !transcriptionState.isRecording) {
    return null; // No mostrar nada si no hay transcripción activa
  }

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Indicador compacto */}
      <div 
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ${
          isExpanded ? 'w-80' : 'w-16'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {!isExpanded ? (
          // Vista compacta
          <div className="p-3 flex items-center justify-center">
            <div className="relative">
              <MicIcon className="w-6 h-6 text-red-600" />
              {transcriptionState.isRecording && !transcriptionState.isPaused && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        ) : (
          // Vista expandida
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MicIcon className="w-5 h-5 text-red-600" />
                <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                  Transcripción Activa
                </Typography>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-1"
              >
                ×
              </Button>
            </div>

            {/* Estado y duración */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  transcriptionState.isRecording && !transcriptionState.isPaused 
                    ? 'bg-green-500 animate-pulse' 
                    : transcriptionState.isPaused 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {transcriptionState.isRecording && !transcriptionState.isPaused 
                    ? 'Grabando...' 
                    : transcriptionState.isPaused 
                    ? 'Pausado' 
                    : 'Inactivo'
                  }
                </span>
              </div>
              
              {transcriptionState.sessionStartTime && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuration(transcriptionState.sessionStartTime)}</span>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2 mb-3">
              {transcriptionState.isRecording && !transcriptionState.isPaused ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    pauseTranscription();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PauseIcon className="w-4 h-4" />
                  Pausar
                </Button>
              ) : transcriptionState.isPaused ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeTranscription();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PlayIcon className="w-4 h-4" />
                  Reanudar
                </Button>
              ) : null}
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  stopTranscription();
                }}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <StopIcon className="w-4 h-4" />
                Detener
              </Button>
            </div>

            {/* Información de la sesión */}
            {transcriptionState.currentReclutamientoId && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div>Reclutamiento: {transcriptionState.currentReclutamientoId}</div>
                {transcriptionState.currentMeetLink && (
                  <div className="truncate">Meet: {transcriptionState.currentMeetLink}</div>
                )}
              </div>
            )}

            {/* Transcripción en tiempo real (vista previa) */}
            {transcriptionState.currentTranscription && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs max-h-20 overflow-y-auto">
                <div className="text-gray-600 dark:text-gray-400 mb-1">Últimas palabras:</div>
                <div className="text-gray-800 dark:text-gray-200">
                  {transcriptionState.currentTranscription.slice(-100)}...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionStatusIndicator;
