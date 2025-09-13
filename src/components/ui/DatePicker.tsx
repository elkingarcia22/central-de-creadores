import React, { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  name?: string;
  id?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Seleccionar fecha',
  label,
  required = false,
  disabled = false,
  className = '',
  minDate,
  maxDate,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  name,
  id,
  ...props
}, ref) => {
  const { theme } = useTheme();

  // Convertir value a string para el input
  const getInputValue = () => {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
      // Si es un string, intentar convertirlo a Date y luego a formato YYYY-MM-DD
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    return '';
  };

  // Manejar el cambio del input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (onChange) {
      if (inputValue) {
        const date = new Date(inputValue + 'T00:00:00');
        onChange(date);
      } else {
        onChange(null);
      }
    }
  };

  // Convertir minDate y maxDate a strings
  const getMinValue = () => {
    if (!minDate) return undefined;
    try {
      const date = minDate instanceof Date ? minDate : new Date(minDate);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error al procesar minDate:', error);
      return undefined;
    }
  };

  const getMaxValue = () => {
    if (!maxDate) return undefined;
    try {
      const date = maxDate instanceof Date ? maxDate : new Date(maxDate);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error al procesar maxDate:', error);
      return undefined;
    }
  };

  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/50';
  
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
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type="date"
        id={id || name}
        name={name}
        value={getInputValue()}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        min={getMinValue()}
        max={getMaxValue()}
        className={inputClasses}
        style={{
          colorScheme: theme === 'dark' ? 'dark' : 'light'
        }}
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

DatePicker.displayName = 'DatePicker';

export default DatePicker;
export { DatePicker }; 