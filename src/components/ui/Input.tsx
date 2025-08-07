import React, { forwardRef } from 'react';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'datetime-local' | 'time';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  endAdornment?: React.ReactNode;
  min?: number | string;
  max?: number | string;
  step?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  size = 'md',
  variant = 'default',
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  label,
  helperText,
  error,
  className = '',
  name,
  id,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  endAdornment,
  min,
  max,
  step,
  ...props
}, ref) => {
  const baseClasses = 'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  const variantClasses = {
    default: 'border-input focus:border-ring',
    error: 'border-destructive focus:border-destructive focus:ring-destructive',
    success: 'border-success focus:border-success focus:ring-success'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const iconPadding = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClass,
    iconPadding,
    className
  ].filter(Boolean).join(' ');

  const containerClasses = `relative ${fullWidth ? 'w-full' : ''}`;

  return (
    <div className={containerClasses}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          id={id}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        {endAdornment && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p className={`text-xs mt-1 ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
