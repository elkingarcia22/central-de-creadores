import React from 'react';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline' | 'label' | 'button';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'title' | 'muted';
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  maxWidth?: string;
  truncate?: boolean;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'default',
  weight,
  align = 'left',
  className = '',
  as,
  maxWidth,
  truncate = false,
  ...props
}) => {
  const baseClasses = 'transition-colors duration-200';
  
  // Escala tipográfica mejorada basada en UX Planet y UX Collective
  const variantClasses = {
    display: 'scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-7xl xl:text-8xl',
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    h6: 'scroll-m-20 text-base font-semibold tracking-tight',
    subtitle1: 'text-lg font-medium leading-6',
    subtitle2: 'text-base font-medium leading-6',
    body1: 'leading-7 [&:not(:first-child)]:mt-6 max-w-[65ch]',
    body2: 'text-sm leading-6 max-w-[65ch]',
    caption: 'text-sm font-medium leading-none tracking-wide',
    overline: 'text-sm font-medium uppercase tracking-wider',
    label: 'text-sm font-medium leading-tight',
    button: 'text-sm font-medium leading-tight tracking-wide'
  };

  const weightClasses = {
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  // Colores semánticos mejorados con mejor contraste
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
    info: 'text-info',
    default: 'text-foreground',
    title: 'text-title',
    muted: 'text-muted-foreground'
  };

  // Clases responsivas basadas en breakpoints
  const responsiveClasses = {
    display: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl',
    h1: 'text-3xl sm:text-4xl lg:text-5xl',
    h2: 'text-2xl sm:text-3xl lg:text-3xl',
    h3: 'text-xl sm:text-2xl lg:text-2xl',
    h4: 'text-lg sm:text-xl lg:text-xl',
    h5: 'text-base sm:text-lg lg:text-lg',
    h6: 'text-sm sm:text-base lg:text-base',
    subtitle1: 'text-base sm:text-lg lg:text-lg',
    subtitle2: 'text-sm sm:text-base lg:text-base',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs sm:text-sm',
    overline: 'text-xs sm:text-sm',
    label: 'text-xs sm:text-sm',
    button: 'text-xs sm:text-sm'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    responsiveClasses[variant],
    weight && weightClasses[weight],
    alignClasses[align],
    colorClasses[color],
    truncate && 'truncate',
    maxWidth && `max-w-[${maxWidth}]`,
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
export const Display: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display" {...props} />
);

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

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label" {...props} />
);

export const Button: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="button" {...props} />
);

export default Typography;
