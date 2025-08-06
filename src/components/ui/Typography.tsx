import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'title';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'default',
  weight = 'normal',
  align = 'left',
  className = '',
  as,
  ...props
}) => {
  const { theme } = useTheme();

  const baseClasses = 'transition-colors duration-200';
  
  const variantClasses = {
    h1: 'text-2xl md:text-3xl lg:text-4xl',
    h2: 'text-xl md:text-2xl lg:text-3xl',
    h3: 'text-lg md:text-xl lg:text-2xl',
    h4: 'text-base md:text-lg lg:text-xl',
    h5: 'text-base md:text-lg',
    h6: 'text-sm md:text-base',
    subtitle1: 'text-base md:text-lg',
    subtitle2: 'text-sm md:text-base',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
    overline: 'text-xs uppercase tracking-wider'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
    info: 'text-primary',
    default: 'text-foreground',
    title: 'text-title'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    weightClasses[weight],
    alignClasses[align],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  // Determinar el elemento HTML por defecto basado en la variante
  const defaultElement = as || (variant.startsWith('h') ? variant : 'p');

  const Component = defaultElement as any;

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

// Componentes específicos para conveniencia
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const H6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const Subtitle1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle1" {...props} />
);

export const Subtitle2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle2" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);

export default Typography; 