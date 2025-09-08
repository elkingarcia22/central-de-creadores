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
  
  // Escala tipográfica optimizada para mejor escalabilidad
  const variantClasses = {
    display: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl xl:text-6xl',
    h1: 'scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl',
    h2: 'scroll-m-20 text-2xl font-bold tracking-tight first:mt-0 lg:text-3xl',
    h3: 'scroll-m-20 text-xl font-semibold tracking-tight lg:text-2xl',
    h4: 'scroll-m-20 text-lg font-semibold tracking-tight lg:text-xl',
    h5: 'scroll-m-20 text-base font-semibold tracking-tight lg:text-lg',
    h6: 'scroll-m-20 text-sm font-semibold tracking-tight lg:text-base',
    subtitle1: 'text-base font-medium leading-6 lg:text-lg',
    subtitle2: 'text-sm font-medium leading-6 lg:text-base',
    body1: 'leading-7 [&:not(:first-child)]:mt-6 max-w-[65ch]',
    body2: 'text-sm leading-6 max-w-[65ch]',
    caption: 'text-xs font-medium leading-none tracking-wide lg:text-sm',
    overline: 'text-xs font-medium uppercase tracking-wider lg:text-sm',
    label: 'text-xs font-medium leading-tight lg:text-sm',
    button: 'text-xs font-medium leading-tight tracking-wide lg:text-sm'
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
    display: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
    h1: 'text-2xl sm:text-3xl lg:text-4xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl lg:text-2xl',
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
export { Typography };
