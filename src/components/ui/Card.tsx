import React from 'react';

// Función cn simple para combinar clases
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
  onClick
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200 ease-in-out';
  
  const variantClasses = {
    default: 'bg-card text-card-foreground border border-slate-100 dark:border-slate-800',
    elevated: 'bg-card text-card-foreground border border-slate-100 dark:border-slate-800',
    outlined: 'bg-background border border-slate-100 dark:border-slate-800 text-foreground'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const clickableClass = onClick ? 'cursor-pointer hover:bg-accent/30 hover:border-slate-100 dark:hover:border-slate-800 hover:scale-[1.01] active:scale-[0.99]' : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        clickableClass,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
export { Card };
export type { CardProps };
