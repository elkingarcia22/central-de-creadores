import React from 'react';

export interface SkeletonProps {
  /** Tipo de skeleton */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Ancho del skeleton */
  width?: string | number;
  /** Alto del skeleton */
  height?: string | number;
  /** Animación */
  animation?: 'pulse' | 'wave' | 'none';
  /** Clases CSS adicionales */
  className?: string;
}

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

// Componentes especializados
export const SkeletonText: React.FC<{
  lines?: number;
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

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
