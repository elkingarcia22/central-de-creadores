import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'accent-blue' | 'accent-purple' | 'accent-orange' | 'accent-teal' | 'accent-indigo' | 'accent-pink' | 'accent-cyan' | 'accent-emerald' | 'accent-violet' | 'accent-black' | 'pendiente' | 'transitoria' | 'terminada' | 'fallo' | 'sin_resolver' | 'resuelto' | 'archivado' | 'baja' | 'media' | 'alta' | 'critica';
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

  // Estilos usando clases de Tailwind directas para mejor compatibilidad
  const variantClasses = {
    default: outlined
      ? 'border border-gray-200 text-gray-600 bg-transparent dark:border-gray-700 dark:text-gray-300'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    primary: outlined
      ? 'border border-blue-500 text-blue-600 bg-transparent dark:border-blue-400 dark:text-blue-400'
      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200 dark:border dark:border-blue-700/50',
    success: outlined
      ? 'border border-green-500 text-green-600 bg-transparent dark:border-green-400 dark:text-green-400'
      : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-200 dark:border dark:border-green-700/50',
    warning: outlined
      ? 'border border-yellow-500 text-yellow-600 bg-transparent dark:border-yellow-400 dark:text-yellow-400'
      : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border dark:border-yellow-700/50',
    danger: outlined
      ? 'border border-red-500 text-red-600 bg-transparent dark:border-red-400 dark:text-red-400'
      : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200 dark:border dark:border-red-700/50',
    info: outlined
      ? 'border border-cyan-500 text-cyan-600 bg-transparent dark:border-cyan-400 dark:text-cyan-400'
      : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border dark:border-cyan-700/50',
    secondary: outlined
      ? 'border border-purple-500 text-purple-600 bg-transparent dark:border-purple-400 dark:text-purple-400'
      : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-200 dark:border dark:border-purple-700/50',
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
    'accent-black': outlined
      ? '!border-gray-800 !text-gray-800 !bg-transparent dark:!border-gray-200 dark:!text-gray-200'
      : 'chip-accent-black',
    // Nuevas variantes agrupadas
    pendiente: outlined
      ? 'border border-blue-500 text-blue-600 bg-transparent dark:border-blue-400 dark:text-blue-400'
      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200 dark:border dark:border-blue-700/50',
    transitoria: outlined
      ? 'border border-yellow-500 text-yellow-600 bg-transparent dark:border-yellow-400 dark:text-yellow-400'
      : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border dark:border-yellow-700/50',
    terminada: outlined
      ? 'border border-green-500 text-green-600 bg-transparent dark:border-green-400 dark:text-green-400'
      : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-200 dark:border dark:border-green-700/50',
    fallo: outlined
      ? 'border border-red-500 text-red-600 bg-transparent dark:border-red-400 dark:text-red-400'
      : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200 dark:border dark:border-red-700/50',
    'sin_resolver': outlined
      ? 'border border-red-500 text-red-600 bg-transparent dark:border-red-400 dark:text-red-400'
      : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200 dark:border dark:border-red-700/50',
    'resuelto': outlined
      ? 'border border-green-500 text-green-600 bg-transparent dark:border-green-400 dark:text-green-400'
      : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-200 dark:border dark:border-green-700/50',
    'archivado': outlined
      ? 'border border-blue-500 text-blue-600 bg-transparent dark:border-blue-400 dark:text-blue-400'
      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200 dark:border dark:border-blue-700/50',
    'baja': outlined
      ? 'border border-green-500 text-green-600 bg-transparent dark:border-green-400 dark:text-green-400'
      : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-200 dark:border dark:border-green-700/50',
    'media': outlined
      ? 'border border-yellow-500 text-yellow-600 bg-transparent dark:border-yellow-400 dark:text-yellow-400'
      : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border dark:border-yellow-700/50',
    'alta': outlined
      ? 'border border-red-500 text-red-600 bg-transparent dark:border-red-400 dark:text-red-400'
      : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200 dark:border dark:border-red-700/50',
    'critica': outlined
      ? 'border border-red-900 text-red-600 bg-transparent dark:border-red-700 dark:text-red-400'
      : 'bg-red-900/30 text-red-600 dark:bg-red-900/30 dark:text-red-200 dark:border dark:border-red-700/50'
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
