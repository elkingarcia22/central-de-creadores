import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  SideModal, 
  Typography, 
  Button
} from './index';
import { TrashIcon, AlertTriangleIcon } from '../icons';

interface ConfirmarEliminacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participante?: any;
  loading?: boolean;
}

export default function ConfirmarEliminacionModal({
  isOpen,
  onClose,
  onConfirm,
  participante,
  loading = false
}: ConfirmarEliminacionModalProps) {
  const { theme } = useTheme();
  const { showError } = useToast();

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'externo': return 'Cliente Externo';
      case 'interno': return 'Cliente Interno';
      case 'friend_family': return 'Friend and Family';
      default: return tipo;
    }
  };

  if (!participante) {
    return null;
  }

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
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
            ¿Eliminar Participante?
          </Typography>
          <Typography variant="body1" color="secondary">
            Esta acción no se puede deshacer. Se eliminarán permanentemente:
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

        {/* Lista de elementos que se eliminarán */}
        <div className="space-y-2">
          <Typography variant="subtitle2" weight="medium">
            Se eliminarán también:
          </Typography>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Todos los dolores y necesidades registrados</li>
            <li>• Todos los comentarios asociados</li>
            <li>• Historial de participaciones</li>
          </ul>
        </div>

        {/* Advertencia sobre reclutamientos */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <Typography variant="body2" className="text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>Nota:</strong> Si el participante está asociado a reclutamientos, 
            primero debe eliminar esos reclutamientos antes de eliminar al participante.
          </Typography>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            {loading ? 'Eliminando...' : 'Eliminar Participante'}
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
