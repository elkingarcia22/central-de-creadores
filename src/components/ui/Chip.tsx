import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'accent-blue' | 'accent-purple' | 'accent-orange' | 'accent-teal' | 'accent-indigo' | 'accent-pink' | 'accent-cyan' | 'accent-emerald' | 'accent-violet' | 'pendiente' | 'transitoria' | 'terminada' | 'fallo';
  size?: 'sm' | 'md' | 'lg';
  outlined?: boolean;
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  outlined = false,
  rounded = false,
  removable = false,
  onRemove,
  icon,
  className = '',
  onClick,
  disabled = false
}) => {
  const { theme } = useTheme();

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out max-w-full';
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-105 active:scale-95 hover:' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-2',
    md: 'px-3.5 py-2 text-sm gap-2.5',
    lg: 'px-4 py-2.5 text-base gap-3'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3 flex-shrink-0 flex items-center justify-center',
    md: 'w-4 h-4 flex-shrink-0 flex items-center justify-center',
    lg: 'w-5 h-5 flex-shrink-0 flex items-center justify-center'
  };

  // Estilos usando tokens de colores para mejor consistencia
  const variantClasses = {
    default: outlined
      ? 'border border-muted text-muted-foreground bg-transparent'
      : 'bg-muted text-muted-foreground',
    primary: outlined
      ? 'border border-primary text-primary bg-transparent'
      : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    success: outlined
      ? 'border border-success text-success bg-transparent'
      : 'bg-success/10 text-success',
    warning: outlined
      ? 'border border-warning text-warning-foreground bg-transparent'
      : 'bg-warning/10 text-warning-foreground',
    danger: outlined
      ? 'border border-destructive text-destructive bg-transparent'
      : 'bg-destructive/10 text-destructive',
    info: outlined
      ? 'border border-info text-info bg-transparent'
      : 'bg-info/10 text-info',
    secondary: outlined
      ? 'border border-secondary text-secondary-foreground bg-transparent'
      : 'bg-secondary/20 text-secondary-foreground',
    'accent-blue': outlined
      ? 'border border-accent-blue text-accent-blue bg-transparent'
      : 'bg-accent-blue/10 text-accent-blue',
    'accent-purple': outlined
      ? 'border border-accent-purple text-accent-purple bg-transparent'
      : 'bg-accent-purple/10 text-accent-purple',
    'accent-orange': outlined
      ? 'border border-accent-orange text-accent-orange bg-transparent'
      : 'bg-accent-orange/10 text-accent-orange',
    'accent-teal': outlined
      ? 'border border-accent-teal text-accent-teal bg-transparent'
      : 'bg-accent-teal/10 text-accent-teal',
    'accent-indigo': outlined
      ? 'border border-accent-indigo text-accent-indigo bg-transparent'
      : 'bg-accent-indigo/10 text-accent-indigo',
    'accent-pink': outlined
      ? 'border border-accent-pink text-accent-pink bg-transparent'
      : 'bg-accent-pink/10 text-accent-pink',
    'accent-cyan': outlined
      ? 'border border-accent-cyan text-accent-cyan bg-transparent'
      : 'bg-accent-cyan/10 text-accent-cyan',
    'accent-emerald': outlined
      ? 'border border-accent-emerald text-accent-emerald bg-transparent'
      : 'bg-accent-emerald/10 text-accent-emerald',
    'accent-violet': outlined
      ? 'border border-accent-violet text-accent-violet bg-transparent'
      : 'bg-accent-violet/10 text-accent-violet',
    // Nuevas variantes agrupadas
    pendiente: outlined
      ? 'border border-blue-500 text-blue-700 bg-transparent'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    transitoria: outlined
      ? 'border border-yellow-500 text-yellow-700 bg-transparent'
      : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    terminada: outlined
      ? 'border border-green-500 text-green-700 bg-transparent'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    fallo: outlined
      ? 'border border-red-500 text-red-700 bg-transparent'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    roundedClasses,
    clickableClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  return (
    <span
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <span className={iconSizeClasses[size]}>
          {icon}
        </span>
      )}
      
      <span className="leading-none flex items-center truncate max-w-[200px]">{children}</span>
      
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={`${iconSizeClasses[size]} rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Remover"
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Chip;
