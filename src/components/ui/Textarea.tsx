import React, { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  name?: string;
  id?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
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
  label,
  helperText,
  error,
  className = '',
  name,
  id,
  rows = 3,
  cols,
  maxLength,
  minLength,
  resize = 'vertical',
  ...props
}, ref) => {
  const { theme } = useTheme();

  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/50 input-autofill-fix input-consistent';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    default: 'bg-input-solid border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring',
    error: 'bg-input-solid border-destructive text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-destructive',
    success: 'bg-input-solid border-success text-foreground placeholder:text-muted-foreground focus:border-success focus:ring-success'
  };

  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const textareaClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[error ? 'error' : variant],
    resizeClasses[resize],
    widthClass,
    className
  ].filter(Boolean).join(' ');

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
      
      <textarea
        ref={ref}
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
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        minLength={minLength}
        className={textareaClasses}
        {...props}
      />
      
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

Textarea.displayName = 'Textarea';

export default Textarea;
export { Textarea }; 