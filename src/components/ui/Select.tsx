import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDownIcon, CheckIcon } from '../icons';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  renderOption?: () => React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  name?: string;
  id?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(({
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  fullWidth = false,
  placeholder = 'Seleccionar opción...',
  label,
  helperText,
  error,
  className = '',
  name,
  id,
  isOpen: propIsOpen,
  onOpenChange,
  ...props
}, ref) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<any>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Nueva función mejorada para calcular posición
  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom - 10;
    const spaceAbove = rect.top - 10;
    const dropdownHeight = Math.min(300, options.length * 44 + 20);
    
    // Determinar si mostrar arriba o abajo
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    // Calcular posición horizontal con límites del viewport
    let left = rect.left + window.scrollX;
    const dropdownWidth = Math.max(rect.width, 280);
    
    // Asegurar que no se salga del viewport horizontalmente
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    
    const position = {
      position: 'fixed' as const,
      zIndex: 99999,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      transform: 'none',
      ...(showAbove 
        ? { 
            bottom: `${viewportHeight - rect.top + 5}px`,
            maxHeight: `${Math.min(300, spaceAbove)}px`
          }
        : { 
            top: `${rect.bottom + 5}px`,
            maxHeight: `${Math.min(300, spaceBelow)}px`
          }
      )
    };
    
    setDropdownPosition(position);
  };

  // Efecto para manejar posicionamiento y eventos
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Posicionar inmediatamente
    updateDropdownPosition();
    
    // Crear throttled version para mejor performance
    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateDropdownPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Event listeners
    const handleScroll = (e: Event) => {
      throttledUpdate();
    };

    const handleResize = () => {
      throttledUpdate();
    };

    // Agregar listeners a window y document
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    // Buscar contenedores padre con scroll y agregar listeners también
    const searchScrollContainers = (element: HTMLElement | null): HTMLElement[] => {
      const containers: HTMLElement[] = [];
      let parent = element?.parentElement;
      
      while (parent) {
        const style = window.getComputedStyle(parent);
        const hasScroll = style.overflow === 'auto' || 
                         style.overflow === 'scroll' || 
                         style.overflowY === 'auto' || 
                         style.overflowY === 'scroll';
        
        if (hasScroll) {
          containers.push(parent);
        }
        
        parent = parent.parentElement;
      }
      
      return containers;
    };

    // Buscar contenedores de scroll y agregar listeners
    const scrollContainers = searchScrollContainers(containerRef.current);
    scrollContainers.forEach(container => {
      container.addEventListener('scroll', handleScroll, { passive: true });
    });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize, true);
      document.removeEventListener('scroll', handleScroll, true);
      
      // Remover listeners de contenedores de scroll
      scrollContainers.forEach(container => {
        container.removeEventListener('scroll', handleScroll, true);
      });
    };
  }, [isOpen, options?.length]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // No cerrar si se hizo clic en el container del select
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      
      // Verificar si el clic fue en algún elemento del dropdown (por el portal)
      const dropdownElements = document.querySelectorAll('[data-dropdown-portal="true"]');
      for (const element of dropdownElements) {
        if (element.contains(target)) {
          return;
        }
      }
      
      setIsOpen(false);
      setSearchTerm('');
    };

    if (isOpen) {
      // Usar un delay más corto y usar mousedown en lugar de click
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
      }, 50);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen]);

  // Escuchar eventos de otros dropdowns
  useEffect(() => {
    const handleOtherOpen = () => {
      setIsOpen(false);
      setSearchTerm('');
    };

    document.addEventListener('otherDropdownOpen', handleOtherOpen);
    return () => document.removeEventListener('otherDropdownOpen', handleOtherOpen);
  }, []);
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[52px]'
  };

  const selectedOption = options?.find(option => option.value === value);
  const filteredOptions = options
    ?.filter(option => option.label && typeof option.label === 'string')
    .filter(option =>
      option.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) {
      return;
    }
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (!isOpen) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  };

  const handleOptionSelect = (optionValue: string | number) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Evitar que se cierre el dropdown al hacer clic dentro del panel
  };

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
      
      <div className="relative" ref={containerRef}>
        {/* Botón selector */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full ${sizeClasses[size]} 
            bg-input-solid border border-border rounded-lg text-left
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${isOpen ? 'ring-2 ring-ring border-ring' : 'hover:border-muted-foreground'}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}
            ${className}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`truncate ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDownIcon 
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`} 
            />
          </div>
        </button>

        {/* Dropdown personalizado */}
        {isOpen && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={handleBackdropClick}
            />
            
            {/* Panel de opciones */}
            <div 
              data-dropdown-portal="true"
              className="bg-popover-solid border border-border rounded-lg shadow-lg"
              style={{
                ...dropdownPosition,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(0px)',
                isolation: 'isolate'
              }}
              onClick={handleDropdownClick}
            >
              {/* Barra de búsqueda (solo si hay muchas opciones) */}
              {options.length > 8 && (
                <div className="p-3 border-b border-border">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar opciones..."
                    className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring bg-input-solid text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}

              {/* Lista de opciones con scroll */}
              <div 
                className="overflow-y-auto scrollbar-dropdown"
                style={{ 
                  maxHeight: options.length > 8 ? '240px' : '300px'
                }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">
                      {searchTerm ? 'No se encontraron opciones' : 'No hay opciones disponibles'}
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredOptions.map((option, index) => (
                      <button
              key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!option.disabled && onChange) {
                            onChange(option.value);
                            setIsOpen(false);
                            setSearchTerm('');
                            onBlur?.();
                          }
                        }}
              disabled={option.disabled}
                        className={`
                          w-full px-4 py-2 text-left text-sm transition-colors
                          hover:bg-accent-solid
                          focus:outline-none focus:bg-accent-solid
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${option.value === value 
                            ? 'bg-primary/10 border-r-2 border-primary text-foreground' 
                            : 'text-popover-foreground'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">
              {option.label}
                          </span>
                          {option.value === value && (
                            <CheckIcon className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
        </div>
          </>,
          document.body
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

Select.displayName = 'Select';

export default Select; 