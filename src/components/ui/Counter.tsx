import React, { useState, useEffect, useRef } from 'react';
import { Typography } from './index';

export interface CounterProps {
  /** Valor final del contador */
  value: number;
  /** Valor inicial del contador */
  startValue?: number;
  /** Duración de la animación en milisegundos */
  duration?: number;
  /** Función de formateo del número */
  formatValue?: (value: number) => string;
  /** Prefijo del número */
  prefix?: string;
  /** Sufijo del número */
  suffix?: string;
  /** Título del contador */
  title?: string;
  /** Descripción del contador */
  description?: string;
  /** Color del contador */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Tamaño del contador */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Mostrar animación */
  animate?: boolean;
  /** Callback cuando termina la animación */
  onComplete?: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

const Counter: React.FC<CounterProps> = ({
  value,
  startValue = 0,
  duration = 2000,
  formatValue,
  prefix = '',
  suffix = '',
  title,
  description,
  color = 'primary',
  size = 'md',
  animate = true,
  onComplete,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const getColorStyles = () => {
    const colorStyles = {
      primary: 'text-primary',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      info: 'text-primary'
    };
    return colorStyles[color];
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
      xl: 'text-5xl'
    };
    return sizeStyles[size];
  };

  const getTitleSize = () => {
    const titleSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    return titleSizes[size];
  };

  const formatDisplayValue = (val: number) => {
    if (formatValue) {
      return formatValue(val);
    }
    
    // Formateo por defecto
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    } else {
      return val.toFixed(0);
    }
  };

  const animateValue = (startTime: number) => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Función de easing (ease-out)
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOut(progress);

    const currentValue = startValue + (value - startValue) * easedProgress;
    setDisplayValue(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(() => animateValue(startTime));
    } else {
      setDisplayValue(value);
      setIsAnimating(false);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (animate && value !== startValue) {
      setIsAnimating(true);
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(() => 
        animateValue(startTimeRef.current!)
      );
    } else {
      setDisplayValue(value);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, startValue, animate, duration]);

  return (
    <div className={`text-center ${className}`}>
      {title && (
        <Typography 
          variant="body1" 
          weight="medium" 
          className={`${getTitleSize()} mb-2`}
        >
          {title}
        </Typography>
      )}
      
      <div className={`${getSizeStyles()} ${getColorStyles()} font-bold`}>
        {prefix}
        <span className={isAnimating ? 'animate-pulse' : ''}>
          {formatDisplayValue(displayValue)}
        </span>
        {suffix}
      </div>
      
      {description && (
        <Typography 
          variant="body2" 
          color="secondary" 
          className="mt-2"
        >
          {description}
        </Typography>
      )}
    </div>
  );
};

// Componente para mostrar múltiples contadores
export interface CounterGroupProps {
  /** Contadores a mostrar */
  counters: Array<{
    id: string;
    value: number;
    title: string;
    description?: string;
    color?: CounterProps['color'];
    prefix?: string;
    suffix?: string;
  }>;
  /** Layout del grupo */
  layout?: 'grid' | 'flex';
  /** Columnas en grid */
  columns?: number;
  /** Clases CSS adicionales */
  className?: string;
}

export const CounterGroup: React.FC<CounterGroupProps> = ({
  counters,
  layout = 'grid',
  columns = 3,
  className = ''
}) => {
  const getLayoutStyles = () => {
    if (layout === 'grid') {
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`;
    }
    return 'flex flex-wrap gap-6';
  };

  return (
    <div className={`${getLayoutStyles()} ${className}`}>
      {counters.map((counter) => (
        <Counter
          key={counter.id}
          value={counter.value}
          title={counter.title}
          description={counter.description}
          color={counter.color}
          prefix={counter.prefix}
          suffix={counter.suffix}
        />
      ))}
    </div>
  );
};

export default Counter;
