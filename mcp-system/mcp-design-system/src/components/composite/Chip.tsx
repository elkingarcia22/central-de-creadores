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

  const variantClasses = {
    default: outlined
      ? theme === 'dark'
        ? 'border border-gray-500 text-gray-200 bg-transparent'
        : 'border border-gray-300 text-gray-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-gray-700 text-gray-200'
        : 'bg-gray-100 text-gray-800',
    primary: outlined
      ? theme === 'dark'
        ? 'border border-blue-400 text-blue-300 bg-transparent'
        : 'border border-blue-500 text-blue-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-blue-900/30 text-blue-200 border border-blue-700/50'
        : 'bg-blue-100 text-blue-800',
    success: outlined
      ? theme === 'dark'
        ? 'border border-green-400 text-green-300 bg-transparent'
        : 'border border-green-500 text-green-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-green-900/30 text-green-200 border border-green-700/50'
        : 'bg-green-100 text-green-800',
    warning: outlined
      ? theme === 'dark'
        ? 'border border-amber-400 text-amber-300 bg-transparent'
        : 'border border-amber-500 text-amber-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-amber-900/30 text-amber-200 border border-amber-700/50'
        : 'bg-amber-100 text-amber-800',
    danger: outlined
      ? theme === 'dark'
        ? 'border border-red-400 text-red-300 bg-transparent'
        : 'border border-red-500 text-red-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-red-900/30 text-red-200 border border-red-700/50'
        : 'bg-red-100 text-red-800',
    info: outlined
      ? theme === 'dark'
        ? 'border border-cyan-400 text-cyan-300 bg-transparent'
        : 'border border-cyan-500 text-cyan-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-cyan-900/30 text-cyan-200 border border-cyan-700/50'
        : 'bg-cyan-100 text-cyan-800',
    secondary: outlined
      ? theme === 'dark'
        ? 'border border-purple-400 text-purple-300 bg-transparent'
        : 'border border-purple-500 text-purple-700 bg-transparent'
      : theme === 'dark'
        ? 'bg-purple-900/30 text-purple-200 border border-purple-700/50'
        : 'bg-purple-100 text-purple-800'
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