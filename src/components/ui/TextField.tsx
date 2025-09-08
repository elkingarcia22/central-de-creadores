import React, { forwardRef } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'block rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[52px]'
  };

  const variantClasses = {
    default: 'bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring',
    error: 'bg-input border-destructive text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-destructive',
    success: 'bg-input border-success text-foreground placeholder:text-muted-foreground focus:border-success focus:ring-success'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[error ? 'error' : variant],
    widthClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      
      {(helperText || error) && (
        <p className={`text-sm ${error 
          ? 'text-destructive'
          : 'text-muted-foreground'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField;
export { TextField };
