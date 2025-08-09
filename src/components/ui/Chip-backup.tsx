import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
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

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200';
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-105' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3 flex-shrink-0',
    md: 'w-4 h-4 flex-shrink-0',
    lg: 'w-5 h-5 flex-shrink-0'
  };

  // Estilos usando tokens de colores para mejor consistencia
  const variantClasses = {
    default: outlined
      ? 'border border-muted text-muted-foreground bg-transparent'
      : 'bg-muted text-muted-foreground',
    primary: outlined
      ? 'border border-primary text-primary bg-transparent'
      : 'bg-primary/10 text-primary',
    success: outlined
      ? 'border border-success text-success bg-transparent'
      : 'bg-success/10 text-success',
    warning: outlined
      ? 'border border-warning text-warning bg-transparent'
      : 'bg-warning/10 text-warning',
    danger: outlined
      ? 'border border-destructive text-destructive bg-transparent'
      : 'bg-destructive/10 text-destructive',
    info: outlined
      ? 'border border-info text-info bg-transparent'
      : 'bg-info/10 text-info',
    secondary: outlined
      ? 'border border-secondary text-secondary-foreground bg-transparent'
      : 'bg-secondary/20 text-secondary-foreground'
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
      
      <span className="leading-none">{children}</span>
      
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
