import React from 'react';
import Typography from './Typography';
import { cn } from '../../utils/cn';

export interface SubtitleProps {
  /** Texto del subtítulo */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del subtítulo */
  size?: 'sm' | 'md' | 'lg';
  /** Alineación del texto */
  alignment?: 'left' | 'center' | 'right';
  /** Peso de la fuente */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

/**
 * Componente Subtitle - Subtítulo consistente
 * 
 * Este componente proporciona un subtítulo con el mismo color que los títulos principales
 * pero con un tamaño más pequeño para jerarquía visual.
 * 
 * @example
 * ```tsx
 * <Subtitle>Actividades (5)</Subtitle>
 * <Subtitle size="lg" weight="semibold">Sección importante</Subtitle>
 * ```
 */
export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  className,
  size = 'md',
  alignment = 'left',
  weight = 'semibold'
}) => {
  const sizeMap = {
    sm: 'h6',
    md: 'h5',
    lg: 'h4'
  };

  const alignmentMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <Typography
      variant={sizeMap[size]}
      color="default"
      weight={weight}
      className={cn(
        '!text-gray-600 dark:!text-gray-300',
        alignmentMap[alignment],
        className
      )}
    >
      {children}
    </Typography>
  );
};
