import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  SideModal, 
  Typography, 
  Button
} from './index';
import { AlertTriangleIcon, CloseIcon } from '../icons';

interface ErrorEliminacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participante?: any;
  error?: {
    message: string;
    detail: string;
    participaciones?: number;
    investigaciones?: string[];
  };
}

export default function ErrorEliminacionModal({
  isOpen,
  onClose,
  participante,
  error
}: ErrorEliminacionModalProps) {
  const { theme } = useTheme();

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'externo': return 'Cliente Externo';
      case 'interno': return 'Cliente Interno';
      case 'friend_family': return 'Friend and Family';
      default: return tipo;
    }
  };

  if (!participante || !error) {
    return null;
  }

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="No se puede eliminar el participante"
      size="md"
    >
      <div className="space-y-6">
        {/* Icono de advertencia */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
            <AlertTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="text-center space-y-2">
          <Typography variant="h4" className="text-red-600 dark:text-red-400">
            Eliminación no permitida
          </Typography>
          <Typography variant="body1" color="secondary">
            {error.detail}
          </Typography>
        </div>

        {/* Información del participante */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <Typography variant="subtitle2" weight="medium">
            {participante.nombre}
          </Typography>
          <Typography variant="body2" color="secondary">
            {getTipoLabel(participante.tipo)} • {participante.email || 'Sin email'}
          </Typography>
          {participante.empresa_nombre && (
            <Typography variant="body2" color="secondary">
              Empresa: {participante.empresa_nombre}
            </Typography>
          )}
          {participante.departamento_nombre && (
            <Typography variant="body2" color="secondary">
              Departamento: {participante.departamento_nombre}
            </Typography>
          )}
        </div>

        {/* Detalles de las participaciones */}
        {error.participaciones && error.participaciones > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="space-y-3">
              <Typography variant="subtitle2" weight="medium" className="text-yellow-800 dark:text-yellow-200">
                📊 Participaciones activas: {error.participaciones}
              </Typography>
              
              {error.investigaciones && error.investigaciones.length > 0 && (
                <div>
                  <Typography variant="body2" className="text-yellow-800 dark:text-yellow-200 mb-2">
                    <strong>Investigaciones asociadas:</strong>
                  </Typography>
                  <ul className="space-y-1">
                    {error.investigaciones.map((investigacion, index) => (
                      <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                        • {investigacion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <Typography variant="body2" className="text-blue-800 dark:text-blue-200">
            <strong>💡 Para eliminar este participante:</strong>
          </Typography>
          <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>1. Vaya a la sección de <strong>Investigaciones</strong></li>
            <li>2. Elimine al participante de todas las investigaciones donde participa</li>
            <li>3. Una vez removido de todas las investigaciones, podrá eliminarlo</li>
          </ul>
        </div>

        {/* Botón */}
        <div className="flex justify-center pt-6 border-t border-border">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <CloseIcon className="w-4 h-4" />
            Entendido
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
