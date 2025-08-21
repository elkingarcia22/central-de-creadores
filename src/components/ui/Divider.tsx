import React from 'react';
import { Typography } from './index';

export interface DividerProps {
  /** Orientación del divider */
  orientation?: 'horizontal' | 'vertical';
  /** Texto opcional en el centro */
  children?: React.ReactNode;
  /** Variante del divider */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** Color del divider */
  color?: 'default' | 'primary' | 'secondary' | 'muted';
  /** Espaciado */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  children,
  variant = 'solid',
  color = 'default',
  spacing = 'md',
  className = ''
}) => {
  const getVariantStyles = () => {
    const variantStyles = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted'
    };
    return variantStyles[variant];
  };

  const getColorStyles = () => {
    const colorStyles = {
      default: 'border-gray-200',
      primary: 'border-primary',
      secondary: 'border-gray-300',
      muted: 'border-gray-100'
    };
    return colorStyles[color];
  };

  const getSpacingStyles = () => {
    const spacingStyles = {
      none: '',
      sm: 'my-2',
      md: 'my-4',
      lg: 'my-6'
    };
    return spacingStyles[spacing];
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px h-full border-r ${getVariantStyles()} ${getColorStyles()} ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (children) {
    return (
      <div className={`flex items-center ${getSpacingStyles()} ${className}`}>
        <div className={`flex-1 border-t ${getVariantStyles()} ${getColorStyles()}`} />
        <div className="px-4">
          <Typography variant="body2" color="secondary">
            {children}
          </Typography>
        </div>
        <div className={`flex-1 border-t ${getVariantStyles()} ${getColorStyles()}`} />
      </div>
    );
  }

  return (
    <div
      className={`border-t ${getVariantStyles()} ${getColorStyles()} ${getSpacingStyles()} ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
};

export default Divider;
