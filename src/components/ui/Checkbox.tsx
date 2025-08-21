import React from 'react';
import { Typography } from './index';
import { CheckIcon } from '../icons';

/**
 * Props del componente Checkbox
 * 
 * @interface CheckboxProps
 * @description Interfaz que define las propiedades del componente Checkbox
 */
export interface CheckboxProps {
  /** 
   * Estado del checkbox (marcado/desmarcado)
   * @default false
   * @example
   * ```tsx
   * <Checkbox checked={true} onChange={handleChange} />
   * ```
   */
  checked?: boolean;
  
  /** 
   * Estado indeterminado (triple estado)
   * @default false
   * @description Útil para casos donde hay selección parcial de elementos
   * @example
   * ```tsx
   * <Checkbox indeterminate={true} onChange={handleChange} />
   * ```
   */
  indeterminate?: boolean;
  
  /** 
   * Etiqueta del checkbox
   * @example
   * ```tsx
   * <Checkbox label="Acepto los términos y condiciones" />
   * ```
   */
  label?: string;
  
  /** 
   * Descripción adicional debajo de la etiqueta
   * @example
   * ```tsx
   * <Checkbox 
   *   label="Notificaciones por email"
   *   description="Recibe actualizaciones importantes en tu correo"
   * />
   * ```
   */
  description?: string;
  
  /** 
   * Deshabilita el checkbox
   * @default false
   * @example
   * ```tsx
   * <Checkbox disabled={true} label="Opción no disponible" />
   * ```
   */
  disabled?: boolean;
  
  /** 
   * Tamaño del checkbox
   * @default 'md'
   * @example
   * ```tsx
   * <Checkbox size="lg" label="Checkbox grande" />
   * ```
   */
  size?: 'sm' | 'md' | 'lg';
  
  /** 
   * Callback ejecutado cuando cambia el estado
   * @param checked - Nuevo estado del checkbox
   * @example
   * ```tsx
   * <Checkbox onChange={(checked) => console.log('Estado:', checked)} />
   * ```
   */
  onChange?: (checked: boolean) => void;
  
  /** 
   * Clases CSS adicionales para personalización
   * @example
   * ```tsx
   * <Checkbox className="my-custom-class" />
   * ```
   */
  className?: string;
  
  /** 
   * ID único del input (para accesibilidad)
   * @example
   * ```tsx
   * <Checkbox id="terms-checkbox" label="Acepto términos" />
   * ```
   */
  id?: string;
  
  /** 
   * Nombre del input (para formularios)
   * @example
   * ```tsx
   * <Checkbox name="notifications" label="Notificaciones" />
   * ```
   */
  name?: string;
  
  /** 
   * Valor del input (para formularios)
   * @example
   * ```tsx
   * <Checkbox value="email-notifications" label="Email" />
   * ```
   */
  value?: string;
}

/**
 * Componente Checkbox
 * 
 * @description Componente de checkbox con soporte para estados múltiples, accesibilidad y micro-interacciones
 * 
 * @example
 * ```tsx
 * // Checkbox básico
 * <Checkbox 
 *   label="Acepto los términos" 
 *   onChange={handleChange} 
 * />
 * 
 * // Checkbox con descripción
 * <Checkbox 
 *   label="Notificaciones por email"
 *   description="Recibe actualizaciones importantes"
 *   onChange={handleChange}
 * />
 * 
 * // Checkbox indeterminado
 * <Checkbox 
 *   indeterminate={true}
 *   label="Seleccionar todos"
 *   onChange={handleSelectAll}
 * />
 * 
 * // Checkbox deshabilitado
 * <Checkbox 
 *   disabled={true}
 *   label="Opción no disponible"
 * />
 * ```
 * 
 * @param props - Propiedades del componente
 * @returns Componente Checkbox renderizado
 */
const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
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

  const getIconSize = () => {
    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    return iconSizes[size];
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
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          ref={(el) => {
            if (el) {
              el.indeterminate = indeterminate;
            }
          }}
          className="sr-only"
        />
        <div
          className={`
            ${getSizeStyles()}
            border-2 rounded transition-all duration-200 cursor-pointer
            ${disabled 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : checked || indeterminate
                ? 'bg-primary border-primary shadow-sm'
                : 'bg-white border-gray-300 hover:border-primary hover:shadow-sm'
            }
            ${disabled ? '' : 'hover:scale-105 active:scale-95'}
          `}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          {(checked || indeterminate) && (
            <CheckIcon 
              className={`
                ${getIconSize()} 
                text-white 
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
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

// Componente para grupo de checkboxes
export interface CheckboxGroupProps {
  /** Opciones del grupo */
  options: Array<{
    id: string;
    label: string;
    description?: string;
    value: string;
    disabled?: boolean;
  }>;
  /** Valores seleccionados */
  selectedValues: string[];
  /** Callback cuando cambian las selecciones */
  onChange: (selectedValues: string[]) => void;
  /** Orientación del grupo */
  orientation?: 'vertical' | 'horizontal';
  /** Tamaño de los checkboxes */
  size?: 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selectedValues,
  onChange,
  orientation = 'vertical',
  size = 'md',
  className = ''
}) => {
  const handleOptionChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter(v => v !== value));
    }
  };

  const getOrientationStyles = () => {
    return orientation === 'horizontal' 
      ? 'flex flex-wrap gap-4' 
      : 'space-y-3';
  };

  return (
    <div className={`${getOrientationStyles()} ${className}`}>
      {options.map((option) => (
        <Checkbox
          key={option.id}
          id={option.id}
          label={option.label}
          description={option.description}
          checked={selectedValues.includes(option.value)}
          disabled={option.disabled}
          size={size}
          onChange={(checked) => handleOptionChange(option.value, checked)}
        />
      ))}
    </div>
  );
};

export default Checkbox;
