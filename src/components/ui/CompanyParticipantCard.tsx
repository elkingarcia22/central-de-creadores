import React from 'react';
import { Card, Typography, Chip, Button } from './index';
import { TrendingUpIcon, CalendarIcon, UserIcon, ExternalLinkIcon } from '../icons';
import { formatearFecha } from '../../utils/fechas';

/**
 * Interface para las propiedades del participante de empresa
 */
export interface CompanyParticipant {
  id: string;
  nombre: string;
  total_participaciones: number;
  fecha_ultima_participacion?: string | null;
  rol_empresa_id?: string;
  email?: string;
  telefono?: string;
}

/**
 * Interface para las propiedades del componente CompanyParticipantCard
 */
export interface CompanyParticipantCardProps {
  /** Datos del participante de empresa */
  participant: CompanyParticipant;
  /** Función que se ejecuta al hacer clic en "Ver detalles" */
  onViewDetails?: (participantId: string) => void;
  /** Función que se ejecuta al hacer clic en "Editar" */
  onEdit?: (participantId: string) => void;
  /** Función que se ejecuta al hacer clic en "Eliminar" */
  onDelete?: (participantId: string) => void;
  /** Indica si se deben mostrar las acciones (botones) */
  showActions?: boolean;
  /** Indica si la card está en estado de carga */
  loading?: boolean;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Indica si se debe mostrar información adicional */
  showExtendedInfo?: boolean;
  /** Función personalizada para formatear la fecha */
  dateFormatter?: (date: string) => string;
}

/**
 * Componente CompanyParticipantCard
 * 
 * Una card funcional especializada para mostrar información de participantes 
 * de empresa en la vista de detalles de empresa. Incluye estadísticas de 
 * participaciones y opciones de gestión.
 * 
 * @example
 * ```tsx
 * <CompanyParticipantCard
 *   participant={{
 *     id: "123",
 *     nombre: "Juan Pérez",
 *     total_participaciones: 5,
 *     fecha_ultima_participacion: "2025-08-27T10:00:00Z"
 *   }}
 *   onViewDetails={(id) => console.log('Ver participante:', id)}
 *   showActions={true}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Card con información extendida
 * <CompanyParticipantCard
 *   participant={participantData}
 *   showExtendedInfo={true}
 *   onEdit={(id) => handleEdit(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */
const CompanyParticipantCard: React.FC<CompanyParticipantCardProps> = ({
  participant,
  onViewDetails,
  onEdit,
  onDelete,
  showActions = false,
  loading = false,
  className = '',
  showExtendedInfo = false,
  dateFormatter = formatearFecha
}) => {

  /**
   * Determina el estado del participante basado en sus participaciones
   */
  const getParticipantStatus = (): { variant: 'success' | 'warning' | 'default', text: string } => {
    if (participant.total_participaciones > 0) {
      return { variant: 'success', text: 'Activo' };
    }
    return { variant: 'default', text: 'Sin participación' };
  };

  /**
   * Maneja el clic en el botón de ver detalles
   */
  const handleViewDetails = () => {
    if (onViewDetails && !loading) {
      onViewDetails(participant.id);
    }
  };

  /**
   * Maneja el clic en el botón de editar
   */
  const handleEdit = () => {
    if (onEdit && !loading) {
      onEdit(participant.id);
    }
  };

  /**
   * Maneja el clic en el botón de eliminar
   */
  const handleDelete = () => {
    if (onDelete && !loading) {
      onDelete(participant.id);
    }
  };

  const status = getParticipantStatus();

  return (
    <Card 
      className={`p-6 ${loading ? 'opacity-50' : ''} ${className}`}
    >
      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Contenido principal */}
      {!loading && (
        <>
          {/* Header con nombre y estado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <Typography variant="body1" weight="medium" className="mb-1">
                {participant.nombre}
              </Typography>
              
              {/* Información de participaciones */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <span>~ {participant.total_participaciones || 0} participaciones</span>
                </div>
                
                {participant.fecha_ultima_participacion && (
                  <div className="flex items-center space-x-1">
                    <span>Última: {dateFormatter(participant.fecha_ultima_participacion)}</span>
                  </div>
                )}
              </div>
              

            </div>
            
            {/* Chip de estado */}
            <Chip variant={status.variant} size="sm">
              {status.text}
            </Chip>
          </div>

          {/* Información extendida (opcional) */}
          {showExtendedInfo && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {participant.email && (
                  <div className="flex items-center space-x-2">
                    <span>{participant.email}</span>
                  </div>
                )}
                {participant.telefono && (
                  <div className="flex items-center space-x-2">
                    <span>{participant.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          {showActions && onViewDetails && (
            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
              >
                <span>Ver</span>
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default CompanyParticipantCard;
