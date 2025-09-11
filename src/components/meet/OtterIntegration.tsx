import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { MicrophoneIcon, ExternalLinkIcon } from '../../components/icons';

interface OtterIntegrationProps {
  meetLink: string;
  sessionId: string;
  onTranscriptionReady?: (transcription: string) => void;
}

export const OtterIntegration: React.FC<OtterIntegrationProps> = ({
  meetLink,
  sessionId,
  onTranscriptionReady
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectOtter = () => {
    setIsLoading(true);
    
    // Abrir Otter.ai en una nueva pestaña
    const otterUrl = `https://otter.ai/join/${sessionId}`;
    window.open(otterUrl, '_blank');
    
    // Simular conexión exitosa
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleGetTranscription = () => {
    // Aquí implementaríamos la API de Otter.ai para obtener la transcripción
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
          <MicrophoneIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Transcripción con Otter.ai
          </h3>
          <p className="text-sm text-gray-500">
            Transcripción automática profesional y gratuita
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                ¿Cómo funciona?
              </h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Haz clic en "Conectar con Otter.ai"</li>
                <li>• Se abrirá Otter.ai en una nueva pestaña</li>
                <li>• Únete a la sesión de Meet desde Otter.ai</li>
                <li>• Otter.ai transcribirá automáticamente</li>
                <li>• Regresa aquí para obtener la transcripción</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleConnectOtter}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            <span>
              {isLoading ? 'Conectando...' : 'Conectar con Otter.ai'}
            </span>
          </Button>

          {isConnected && (
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

export default OtterIntegration;
