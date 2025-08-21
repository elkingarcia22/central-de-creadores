import React from 'react';

/**
 * Props del componente Skeleton
 * 
 * @interface SkeletonProps
 * @description Interfaz que define las propiedades del componente Skeleton
 */
export interface SkeletonProps {
  /** 
   * Tipo de skeleton (forma visual)
   * @default 'text'
   * @example
   * ```tsx
   * <Skeleton variant="circular" width={40} height={40} />
   * ```
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  
  /** 
   * Ancho del skeleton (px, %, rem, etc.)
   * @example
   * ```tsx
   * <Skeleton width="100%" height={20} />
   * <Skeleton width={200} height={20} />
   * ```
   */
  width?: string | number;
  
  /** 
   * Alto del skeleton (px, %, rem, etc.)
   * @example
   * ```tsx
   * <Skeleton width="100%" height={20} />
   * ```
   */
  height?: string | number;
  
  /** 
   * Tipo de animación de carga
   * @default 'pulse'
   * @example
   * ```tsx
   * <Skeleton animation="wave" />
   * ```
   */
  animation?: 'pulse' | 'wave' | 'none';
  
  /** 
   * Clases CSS adicionales para personalización
   * @example
   * ```tsx
   * <Skeleton className="my-custom-skeleton" />
   * ```
   */
  className?: string;
}

/**
 * Componente Skeleton
 * 
 * @description Componente de placeholder animado para estados de carga
 * 
 * @example
 * ```tsx
 * // Skeleton básico de texto
 * <Skeleton width="100%" height={20} />
 * 
 * // Skeleton circular (avatar)
 * <Skeleton variant="circular" width={40} height={40} />
 * 
 * // Skeleton rectangular
 * <Skeleton variant="rectangular" width={200} height={100} />
 * 
 * // Skeleton con animación wave
 * <Skeleton animation="wave" width="100%" height={20} />
 * 
 * // Skeleton sin animación
 * <Skeleton animation="none" width="100%" height={20} />
 * ```
 * 
 * @param props - Propiedades del componente
 * @returns Componente Skeleton renderizado
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = ''
}) => {
  const getVariantStyles = () => {
    const baseStyles = 'bg-gray-200';
    const variantStyles = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: '',
      rounded: 'rounded-lg'
    };
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  const getAnimationStyles = () => {
    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse',
      none: ''
    };
    return animationStyles[animation];
  };

  const getDimensions = () => {
    const styles: React.CSSProperties = {};
    
    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }
    
    return styles;
  };

  return (
    <div
      className={`${getVariantStyles()} ${getAnimationStyles()} ${className}`}
      style={getDimensions()}
      aria-label="Cargando..."
    />
  );
};

/**
 * Componente SkeletonText
 * 
 * @description Componente especializado para mostrar múltiples líneas de texto en carga
 * 
 * @example
 * ```tsx
 * // Una línea de texto
 * <SkeletonText />
 * 
 * // Múltiples líneas de texto
 * <SkeletonText lines={3} />
 * 
 * // Con clases personalizadas
 * <SkeletonText lines={2} className="my-custom-class" />
 * ```
 */
export const SkeletonText: React.FC<{
  /** Número de líneas de texto a mostrar */
  lines?: number;
  /** Clases CSS adicionales */
  className?: string;
}> = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '60%' : '100%'}
        className="h-4"
      />
    ))}
  </div>
);

/**
 * Componente SkeletonAvatar
 * 
 * @description Componente especializado para mostrar avatares en estado de carga
 * 
 * @example
 * ```tsx
 * // Avatar pequeño
 * <SkeletonAvatar size="sm" />
 * 
 * // Avatar mediano (por defecto)
 * <SkeletonAvatar />
 * 
 * // Avatar grande
 * <SkeletonAvatar size="lg" />
 * 
 * // Avatar extra grande
 * <SkeletonAvatar size="xl" />
 * ```
 */
export const SkeletonAvatar: React.FC<{
  /** Tamaño del avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Clases CSS adicionales */
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`p-4 border rounded-lg ${className}`}>
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonAvatar size="md" />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" className="h-4 mb-2" />
        <Skeleton variant="text" width="40%" className="h-3" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export default Skeleton;
