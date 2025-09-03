import React from 'react';
import Typography from './Typography';
import ProgressBar from './ProgressBar';
import Card from './Card';
import { cn } from '../../utils/cn';

export interface ProgressCardProps {
  /** Título principal de la tarjeta de progreso */
  title: string;
  /** Valor actual del progreso */
  currentValue: number;
  /** Valor máximo del progreso */
  maxValue: number;
  /** Unidad de medida (ej: "participantes", "tareas", "sesiones") */
  unit: string;
  /** Porcentaje de completitud (opcional, se calcula automáticamente si no se proporciona) */
  percentage?: number;
  /** Variante de color del progreso */
  variant?: 'primary' | 'success' | 'warning' | 'error';
  /** Tamaño de la barra de progreso */
  progressSize?: 'sm' | 'md' | 'lg';
  /** Texto del objetivo (ej: "Objetivo: 10 participantes") */
  objectiveText?: string;
  /** Texto del progreso actual (ej: "Reclutados: 8 participantes") */
  progressText?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Callback cuando se hace clic en la tarjeta */
  onClick?: () => void;
  /** Si la tarjeta es clickeable */
  clickable?: boolean;
}

/**
 * Componente ProgressCard - Tarjeta de progreso con métricas y barra de progreso
 * 
 * Este componente proporciona una visualización clara del progreso de una tarea,
 * proyecto o proceso, con métricas numéricas y una barra de progreso visual.
 * 
 * @example
 * ```tsx
 * <ProgressCard
 *   title="Progreso del Reclutamiento"
 *   currentValue={8}
 *   maxValue={10}
 *   unit="participantes"
 *   variant="primary"
 *   objectiveText="Objetivo: 10 participantes"
 *   progressText="Reclutados: 8 participantes"
 * />
 * ```
 */
export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  currentValue,
  maxValue,
  unit,
  percentage,
  variant = 'primary',
  progressSize = 'lg',
  objectiveText,
  progressText,
  className,
  onClick,
  clickable = false
}) => {
  // Calcular porcentaje si no se proporciona
  const calculatedPercentage = percentage ?? Math.round((currentValue / maxValue) * 100);
  
  // Determinar variante automáticamente basado en el progreso
  const autoVariant = calculatedPercentage >= 100 ? 'success' : 
                      calculatedPercentage >= 80 ? 'primary' : 
                      calculatedPercentage >= 50 ? 'warning' : 'error';
  
  // Usar variante automática si no se especifica una
  const finalVariant = variant === 'primary' ? autoVariant : variant;
  
  // Clases base de la tarjeta
  const cardClasses = cn(
    'transition-all duration-200',
    clickable && 'cursor-pointer hover:scale-[1.02] hover:shadow-md',
    className
  );

  return (
    <Card 
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
    >
      <div className="p-4 space-y-4">
        {/* Header con título y métricas */}
        <div className="flex items-center justify-between">
          {/* Título principal */}
          <Typography
            variant="h4"
            weight="semibold"
            color="default"
            className="text-gray-700 dark:text-gray-200"
          >
            {title}
          </Typography>
          
          {/* Métricas del lado derecho */}
          <div className="flex items-center gap-6">
            {/* Valor actual */}
            <div className="text-right">
              <Typography
                variant="body1"
                weight="semibold"
                color="default"
                className="text-gray-700 dark:text-gray-200"
              >
                {currentValue}/{maxValue}
              </Typography>
              <Typography
                variant="body2"
                color="secondary"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                {unit}
              </Typography>
            </div>
            
            {/* Porcentaje */}
            <div className="text-right">
              <Typography
                variant="body1"
                weight="semibold"
                color="default"
                className="text-gray-700 dark:text-gray-200"
              >
                {calculatedPercentage}%
              </Typography>
              <Typography
                variant="body2"
                color="secondary"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                completado
              </Typography>
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <ProgressBar 
          value={calculatedPercentage}
          max={100}
          size={progressSize}
          variant={finalVariant}
          className="mb-2"
        />
        
        {/* Información adicional */}
        {(objectiveText || progressText) && (
          <div className="flex items-center justify-between text-sm">
            {objectiveText && (
              <Typography
                variant="body2"
                color="secondary"
                className="text-gray-500 dark:text-gray-400"
              >
                {objectiveText}
              </Typography>
            )}
            
            {progressText && (
              <Typography
                variant="body2"
                color="secondary"
                className="text-gray-500 dark:text-gray-400"
              >
                {progressText}
              </Typography>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProgressCard;
