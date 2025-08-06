import React from 'react';

// Función simple para combinar clases CSS
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Estilos inline como fallback
const getInlineStyles = (variant: string, size: string) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none'
  };

  const variantStyles = {
    primary: { backgroundColor: 'rgb(var(--primary))', color: 'rgb(var(--primary-foreground))' },
    secondary: { backgroundColor: 'rgb(var(--secondary))', color: 'rgb(var(--secondary-foreground))' },
    success: { backgroundColor: 'rgb(var(--success))', color: 'rgb(var(--success-foreground))' },
    destructive: { backgroundColor: 'transparent', color: '#dc2626' },
    warning: { backgroundColor: 'rgb(var(--warning))', color: 'rgb(var(--warning-foreground))' },
    ghost: { backgroundColor: 'transparent', color: 'rgb(var(--foreground))' },
    outline: { backgroundColor: 'transparent', color: 'rgb(var(--foreground))', border: '1px solid rgb(var(--border))' }
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' }
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size]
  };
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    children, 
    disabled,
    style,
    onMouseEnter,
    onMouseLeave,
    ...props 
  }, ref) => {
    
    const inlineStyles = getInlineStyles(variant, size);
    
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      const target = e.target as HTMLButtonElement;
      if (variant === 'destructive') {
        target.style.backgroundColor = '#fef2f2'; // red-50
        target.style.color = '#b91c1c'; // red-700
      } else if (variant === 'primary') {
        target.style.backgroundColor = 'rgb(var(--primary-hover))';
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      const target = e.target as HTMLButtonElement;
      if (variant === 'destructive') {
        target.style.backgroundColor = 'transparent';
        target.style.color = '#dc2626'; // red-600
      } else if (variant === 'primary') {
        target.style.backgroundColor = 'rgb(var(--primary))';
      }
      onMouseLeave?.(e);
    };

    return (
      <button
        className={cn(
          // Clases Tailwind como fallback si funcionan
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          fullWidth && 'w-full',
          className
        )}
        style={{
          ...inlineStyles,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled || loading ? 0.5 : 1,
          pointerEvents: disabled || loading ? 'none' : 'auto',
          ...style
        }}
        ref={ref}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              marginRight: '8px'
            }}></div>
            {children}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps }; 