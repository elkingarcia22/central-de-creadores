import React from 'react';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import Button from '../ui/Button';
import { 
  Investigacion,
  getColorEstadoInvestigacion
} from '../../types/supabase-investigaciones';

interface InvestigacionCardProps {
  investigacion: Investigacion;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function InvestigacionCard({
  investigacion,
  onClick,
  onEdit,
  onDelete,
  showActions = true
}: InvestigacionCardProps) {
  
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Mapear colores a variantes válidas del Chip
  const mapearVarianteChip = (color: string) => {
    const mapa: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
      'default': 'default',
      'primary': 'primary',
      'success': 'success',
      'warning': 'warning',
      'danger': 'danger',
      'destructive': 'danger',
      'info': 'info',
      'secondary': 'secondary'
    };
    return mapa[color] || 'default';
  };

  return (
    <Card 
      className={`transition-all duration-200 hover: ${
        onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground mb-1">
            {investigacion.nombre}
          </h3>
          
          {investigacion.producto_nombre && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {investigacion.producto_nombre}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Chip 
            variant={mapearVarianteChip(getColorEstadoInvestigacion(investigacion.estado))}
            size="sm"
          >
            {investigacion.estado || 'Sin estado'}
          </Chip>
        </div>
      </div>

      {/* Descripción */}
      {investigacion.libreto && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {investigacion.libreto.substring(0, 100)}...
        </p>
      )}

      {/* Fechas */}
      {investigacion.fecha_inicio && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {formatearFecha(investigacion.fecha_inicio)} - {investigacion.fecha_fin ? formatearFecha(investigacion.fecha_fin) : 'Sin fecha fin'}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {investigacion.responsable_nombre ? `Responsable: ${investigacion.responsable_nombre}` : 'Sin responsable'}
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Editar
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Eliminar
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 