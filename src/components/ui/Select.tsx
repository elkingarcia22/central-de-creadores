import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, SearchIcon, CheckIcon } from '../icons';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';

// Función cn para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  error?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Seleccionar...',
  label,
  required = false,
  disabled = false,
  searchable = false,
  multiple = false,
  className,
  size = 'md',
  variant = 'default',
  error = false,
  loading = false,
  fullWidth = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { calculatePosition } = useSmartPositioning();

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = useMemo(() => {
    return (options || []).filter(option =>
      searchable && searchTerm
        ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );
  }, [options, searchable, searchTerm]);


  // Obtener la opción seleccionada
  const selectedOption = useMemo(() => {
    return (options || []).find(option => option.value === value);
  }, [options, value]);

  // Calcular posición inteligente del dropdown
  const getDropdownPosition = useCallback(() => {
    if (!isOpen || !containerRef.current) return {};
    
    return calculatePosition({
      elementRef: containerRef,
      dropdownHeight: 240, // max-h-60 = 240px
      dropdownWidth: containerRef.current.offsetWidth,
      padding: 12, // Más padding para mejor separación
      minWidth: containerRef.current.offsetWidth, // Mínimo el ancho del input
      maxWidth: Math.max(containerRef.current.offsetWidth, 300) // Máximo 300px o el ancho del input
    });
  }, [isOpen, calculatePosition]);

  // Actualizar posición cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const position = getDropdownPosition();
      setDropdownPosition(position);
      
      // Debug: verificar estilos del dropdown
      setTimeout(() => {
        if (dropdownRef.current) {
          const computedStyle = window.getComputedStyle(dropdownRef.current);
          console.log('🔍 [Select] Dropdown abierto - estilos computados:');
          console.log('🔍 [Select] backgroundColor:', computedStyle.backgroundColor);
          console.log('🔍 [Select] color:', computedStyle.color);
          console.log('🔍 [Select] borderColor:', computedStyle.borderColor);
          console.log('🔍 [Select] clases aplicadas:', dropdownRef.current.className);
        }
      }, 100);
    }
  }, [isOpen, getDropdownPosition]);

  // Manejar clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar si el clic es dentro del contenedor del select
      if (containerRef.current && containerRef.current.contains(target)) {
        return; // No cerrar si es dentro del contenedor
      }
      
      // Verificar si el clic es dentro del dropdown (portal)
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return; // No cerrar si es dentro del dropdown
      }
      
      // Si no es dentro de ninguno de los dos, cerrar
      setIsOpen(false);
      setSearchTerm('');
      onBlur?.();
    };

    const handleScroll = (event: Event) => {
      if (isOpen) {
        // Verificar si el scroll ocurre dentro del dropdown o del contenedor
        const target = event.target as Element;
        if (dropdownRef.current && dropdownRef.current.contains(target)) {
          // Si el scroll es dentro del dropdown, no cerrar
          return;
        }
        
        // Verificar si el scroll ocurre dentro del contenedor del select
        if (containerRef.current && containerRef.current.contains(target)) {
          // Si el scroll es dentro del contenedor, no cerrar
          return;
        }
        
        // Si el scroll es fuera del dropdown y del contenedor, cerrar
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen, onBlur]);

  // Manejar teclas
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredOptions.length > 0) {
            onChange?.(filteredOptions[0].value);
            setIsOpen(false);
            setSearchTerm('');
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, filteredOptions.length, onChange]);

  // Cerrar dropdown cuando se selecciona una opción
  const handleOptionClick = (optionValue: string) => {
    onChange?.(optionValue);
    if (!multiple) {
      setIsOpen(false);
      setSearchTerm('');
      onBlur?.();
    }
  };


  // Clases CSS
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const variantClasses = {
    default: 'bg-background border border-input hover:bg-accent hover:text-accent-foreground',
    outline: 'bg-transparent border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground'
  };

  const errorClasses = error ? 'border-destructive focus:ring-destructive' : '';

  return (
    <div className={cn('relative inline-block', fullWidth && 'w-full', className)} ref={containerRef}>
      {label && (
        <span className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </span>
      )}
      {/* Trigger */}
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          errorClasses,
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && !loading) {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            if (newIsOpen) {
              onFocus?.();
            } else {
              onBlur?.();
            }
          }
        }}
        disabled={disabled || loading}
      >
        <div className="flex items-center min-w-0 flex-1">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              <span className="text-sm text-muted-foreground">
                Cargando...
              </span>
            </div>
          ) : selectedOption ? (
            <span className="text-sm truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground truncate">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDownIcon 
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="rounded-md overflow-hidden shadow-lg"
          style={{
            ...dropdownPosition,
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgb(var(--background))',
            border: '1px solid rgb(var(--border))'
          }}
          onLoad={() => {
            console.log('🔍 [Select] Dropdown cargado, clases:', 'bg-background border border-border rounded-md overflow-hidden shadow-lg');
            console.log('🔍 [Select] Estilos computados:', window.getComputedStyle(dropdownRef.current || document.createElement('div')));
          }}
          onClick={(e) => {
            // Asegurar que los clics dentro del dropdown no se propaguen
            e.stopPropagation();
          }}
        >
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div 
            className="max-h-60 overflow-y-auto"
            style={{
              backgroundColor: 'rgb(var(--background))'
            }}
            ref={(el) => {
              if (el && isOpen) {
                setTimeout(() => {
                  const computedStyle = window.getComputedStyle(el);
                  console.log('🔍 [Select] Options container - estilos computados:');
                  console.log('🔍 [Select] Options backgroundColor:', computedStyle.backgroundColor);
                  console.log('🔍 [Select] Options color:', computedStyle.color);
                  console.log('🔍 [Select] Options clases:', el.className);
                }, 100);
              }
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => {
                return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none relative z-10 cursor-pointer',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    value === option.value && 'bg-primary/10 text-primary'
                  )}
                  ref={(el) => {
                    if (el && isOpen && option.value === filteredOptions[0]?.value) {
                      setTimeout(() => {
                        const computedStyle = window.getComputedStyle(el);
                        console.log('🔍 [Select] First option - estilos computados:');
                        console.log('🔍 [Select] Option backgroundColor:', computedStyle.backgroundColor);
                        console.log('🔍 [Select] Option color:', computedStyle.color);
                        console.log('🔍 [Select] Option clases:', el.className);
                      }, 150);
                    }
                  }}
                  onClick={(e) => {
                    if (!option.disabled) {
                      e.stopPropagation();
                      handleOptionClick(option.value);
                    }
                  }}
                  disabled={option.disabled}
                  style={{ 
                    pointerEvents: option.disabled ? 'none' : 'auto',
                    backgroundColor: option.disabled ? 'transparent' : 'white',
                    color: option.disabled ? '#6b7280' : '#374151'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">
                      {option.label}
                    </span>
                    {value === option.value && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </button>
              );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Select;
export { Select }; 