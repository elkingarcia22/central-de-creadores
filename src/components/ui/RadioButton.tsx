import React from 'react';
import { Typography } from './index';

export interface RadioButtonProps {
  /** Estado del radio button */
  checked?: boolean;
  /** Etiqueta del radio button */
  label?: string;
  /** Descripción adicional */
  description?: string;
  /** Deshabilitado */
  disabled?: boolean;
  /** Tamaño del radio button */
  size?: 'sm' | 'md' | 'lg';
  /** Callback cuando cambia el estado */
  onChange?: (checked: boolean) => void;
  /** Clases CSS adicionales */
  className?: string;
  /** ID del input */
  id?: string;
  /** Nombre del input */
  name?: string;
  /** Valor del input */
  value?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  checked = false,
  label,
  description,
  disabled = false,
  size = 'md',
  onChange,
  className = '',
  id,
  name,
  value
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange?.(e.target.checked);
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    return sizeStyles[size];
  };

  const getDotSize = () => {
    const dotSizes = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3'
    };
    return dotSizes[size];
  };

  const getLabelSize = () => {
    const labelSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    return labelSizes[size];
  };

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={`
            ${getSizeStyles()}
            border-2 rounded-full transition-all duration-200 cursor-pointer
            ${disabled 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : checked
                ? 'bg-primary border-primary shadow-sm'
                : 'bg-white border-gray-300 hover:border-primary hover:shadow-sm'
            }
            ${disabled ? '' : 'hover:scale-105 active:scale-95'}
          `}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          {checked && (
            <div
              className={`
                ${getDotSize()}
                bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                transition-all duration-200
                ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
              `}
            />
          )}
        </div>
      </div>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className={`
                ${getLabelSize()}
                font-medium cursor-pointer
                ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                ${disabled ? '' : 'hover:text-primary transition-colors'}
              `}
            >
              {label}
            </label>
          )}
          
          {description && (
            <Typography 
              variant="body2" 
              color="secondary" 
              className={`mt-1 ${disabled ? 'text-gray-400' : ''}`}
            >
              {description}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para grupo de radio buttons
export interface RadioGroupProps {
  /** Opciones del grupo */
  options: Array<{
    id: string;
    label: string;
    description?: string;
    value: string;
    disabled?: boolean;
  }>;
  /** Valor seleccionado */
  selectedValue?: string;
  /** Callback cuando cambia la selección */
  onChange: (value: string) => void;
  /** Orientación del grupo */
  orientation?: 'vertical' | 'horizontal';
  /** Tamaño de los radio buttons */
  size?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedValue,
  onChange,
  orientation = 'vertical',
  size = 'md',
  className = ''
}) => {
  const getOrientationStyles = () => {
    return orientation === 'horizontal' 
      ? 'flex flex-wrap gap-4' 
      : 'space-y-3';
  };

  return (
    <div className={`${getOrientationStyles()} ${className}`}>
      {options.map((option) => (
        <RadioButton
          key={option.id}
          id={option.id}
          name={`radio-group-${option.id}`}
          label={option.label}
          description={option.description}
          value={option.value}
          checked={selectedValue === option.value}
          disabled={option.disabled}
          size={size}
          onChange={() => onChange(option.value)}
        />
      ))}
    </div>
  );
};

export default RadioButton;
