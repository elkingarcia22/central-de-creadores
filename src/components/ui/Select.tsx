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

  // Obtener la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  // Calcular posición del dropdown de manera más estable
  const getDropdownPosition = useCallback(() => {
    if (!containerRef.current) return {};

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calcular dimensiones del dropdown
    const dropdownHeight = Math.min(300, filteredOptions.length * 40 + 20);
    const dropdownWidth = Math.max(rect.width, 280);
    
    // Calcular espacio disponible
    const spaceBelow = viewportHeight - rect.bottom - 2;
    const spaceAbove = rect.top - 2;
    
    // Determinar posición vertical
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    // Determinar posición horizontal
    let left = rect.left;
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }

    return {
      position: 'fixed' as const,
      top: showAbove ? `${rect.top - dropdownHeight - 2}px` : `${rect.bottom + 2}px`,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      maxHeight: `${Math.min(300, showAbove ? spaceAbove : spaceBelow)}px`,
      zIndex: 99999
    };
  }, [filteredOptions.length]);

  // Manejar clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
    <div className={cn('relative', fullWidth && 'w-full', className)} ref={containerRef}>
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
        onClick={() => {
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
          className="fixed bg-background border border-border rounded-md shadow-lg overflow-hidden z-[9999]"
          style={getDropdownPosition()}
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
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    !option.disabled && 'cursor-pointer',
                    value === option.value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => !option.disabled && handleOptionClick(option.value)}
                  disabled={option.disabled}
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
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Select; 