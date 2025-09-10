import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { MicrophoneIcon, CheckCircleIcon, XCircleIcon } from '../../components/icons';

interface GoogleMeetTranscriptionProps {
  meetLink: string;
  sessionId: string;
  onTranscriptionReady?: (transcription: string) => void;
}

export const GoogleMeetTranscription: React.FC<GoogleMeetTranscriptionProps> = ({
  meetLink,
  sessionId,
  onTranscriptionReady
}) => {
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableTranscription = () => {
    setIsLoading(true);
    
    // Abrir Meet con transcripción habilitada
    const meetUrlWithTranscription = `${meetLink}&transcription=true`;
    window.open(meetUrlWithTranscription, '_blank');
    
    // Simular habilitación exitosa
    setTimeout(() => {
      setIsTranscriptionEnabled(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleGetTranscription = () => {
    // Aquí implementaríamos la API de Google Meet para obtener la transcripción
    // Por ahora, simulamos una transcripción
    const mockTranscription = `
      [00:00:00] Participante: Hola, buenos días.
      [00:00:05] Moderador: Buenos días, ¿cómo está?
      [00:00:10] Participante: Muy bien, gracias. Estoy listo para comenzar.
      [00:00:15] Moderador: Perfecto, vamos a empezar con algunas preguntas.
    `;
    
    setTranscription(mockTranscription);
    onTranscriptionReady?.(mockTranscription);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          <MicrophoneIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Transcripción de Google Meet
          </h3>
          <p className="text-sm text-gray-500">
            Transcripción automática nativa de Google Meet
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900">
                Ventajas de Google Meet
              </h4>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• Transcripción automática integrada</li>
                <li>• No requiere aplicaciones externas</li>
                <li>• Funciona directamente en Meet</li>
                <li>• Exporta automáticamente a Google Docs</li>
                <li>• Disponible para cuentas de Google Workspace</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleEnableTranscription}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <MicrophoneIcon className="h-4 w-4" />
            <span>
              {isLoading ? 'Habilitando...' : 'Habilitar Transcripción'}
            </span>
          </Button>

          {isTranscriptionEnabled && (
            <Button
              onClick={handleGetTranscription}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <MicrophoneIcon className="h-4 w-4" />
              <span>Obtener Transcripción</span>
            </Button>
          )}
        </div>

        {transcription && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Transcripción:
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {transcription}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMeetTranscription;
