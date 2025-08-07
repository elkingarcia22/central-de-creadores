import React, { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();

  const baseClasses = `
    block w-full rounded-lg border transition-colors duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-0 
    disabled:opacity-50 disabled:cursor-not-allowed 
    hover:bg-accent/50 input-autofill-fix input-consistent
    ${type === 'number' ? 'input-no-spinners' : ''}
  `.replace(/\s+/g, ' ').trim();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[52px]'
  };

  const variantClasses = {
    default: 'bg-input-solid border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring',
    error: 'bg-input-solid border-destructive text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-destructive',
    success: 'bg-input-solid border-success text-foreground placeholder:text-muted-foreground focus:border-success focus:ring-success'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const finalIcon = icon;
  const finalIconPosition = iconPosition;
  const iconPadding = finalIcon ? (finalIconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[error ? 'error' : variant],
    widthClass,
    iconPadding,
    type === 'time' ? 'time-input-styles' : '',
    className
  ].filter(Boolean).join(' ');

  const iconClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-foreground mb-0.5"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {finalIcon && finalIconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <span className={iconClasses}>
              {finalIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={id || name}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
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
        
        {finalIcon && finalIconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground z-10">
            <span className={iconClasses}>
              {finalIcon}
            </span>
          </div>
        )}
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p className={`text-sm mt-0.5 ${error 
          ? 'text-destructive'
          : 'text-muted-foreground'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
