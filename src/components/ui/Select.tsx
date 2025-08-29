import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, SearchIcon, CheckIcon } from '../icons';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    searchable && searchTerm
      ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Log para debug
  console.log('🔍 Select options:', options.length, 'filtered:', filteredOptions.length, 'isOpen:', isOpen);

  // Obtener la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  // Función simplificada para posicionamiento (ya no se usa)
  const getDropdownPosition = useCallback(() => ({}), []);

  // Manejar clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
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
  }, [isOpen, filteredOptions, onChange]);

  // Cerrar dropdown cuando se selecciona una opción
  const handleOptionClick = (optionValue: string) => {
    console.log('🔍 Option clicked:', optionValue);
    onChange?.(optionValue);
    if (!multiple) {
      setIsOpen(false);
      setSearchTerm('');
      onBlur?.();
    }
  };

  // Manejar clic en opción con prevención de eventos
  const handleOptionClickWithPrevention = (e: React.MouseEvent, optionValue: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 handleOptionClickWithPrevention called with:', optionValue);
    handleOptionClick(optionValue);
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
          console.log('🔍 Select clicked, disabled:', disabled, 'loading:', loading, 'isOpen:', isOpen);
          if (!disabled && !loading) {
            const newIsOpen = !isOpen;
            console.log('🔍 Setting isOpen to:', newIsOpen);
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
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md overflow-hidden z-[999999] shadow-lg"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            width: '100%',
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 999999
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
          <div className="max-h-60 overflow-y-auto bg-white">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => {
                console.log('🔍 Rendering option:', option.value, 'disabled:', option.disabled, 'label:', option.label);
                return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-blue-100 hover:text-blue-900 focus:bg-blue-100 focus:text-blue-900 focus:outline-none relative z-10 cursor-pointer',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    value === option.value && 'bg-blue-100 text-blue-900'
                  )}
                  onClick={(e) => {
                    console.log('🔍 Select - Option button clicked:', option.value);
                    console.log('🔍 Select - Event target:', e.target);
                    console.log('🔍 Select - Event currentTarget:', e.currentTarget);
                    if (!option.disabled) {
                      handleOptionClickWithPrevention(e, option.value);
                    }
                  }}
                  onMouseDown={(e) => {
                    console.log('🔍 Select - Option button mousedown:', option.value);
                  }}
                  onMouseUp={(e) => {
                    console.log('🔍 Select - Option button mouseup:', option.value);
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
        </div>
      )}
    </div>
  );
};

export default Select; 