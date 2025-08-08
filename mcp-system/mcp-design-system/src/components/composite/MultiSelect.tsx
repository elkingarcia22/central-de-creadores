import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Typography from './Typography';
import { ChevronDownIcon, CheckIcon } from '../icons';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxDisplayed?: number;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opciones...',
  disabled = false,
  required = false,
  error,
  helperText,
  fullWidth = false,
  size = 'md',
  maxDisplayed = 2,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Agregar un pequeño delay para evitar que se cierre inmediatamente
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar otros dropdowns cuando este se abre
  useEffect(() => {
    if (isOpen) {
      console.log('MultiSelect - Sending close event to other dropdowns');
      const event = new CustomEvent('closeOtherDropdowns', { detail: { source: containerRef.current } });
      document.dispatchEvent(event);
    }
  }, [isOpen]);

  // Escuchar eventos de cierre de otros dropdowns
  useEffect(() => {
    const handleCloseOthers = (event: CustomEvent) => {
      if (event.detail.source !== containerRef.current && isOpen) {
        console.log('MultiSelect - Closing due to other dropdown opening');
        setIsOpen(false);
      }
    };

    document.addEventListener('closeOtherDropdowns', handleCloseOthers as EventListener);
    return () => {
      document.removeEventListener('closeOtherDropdowns', handleCloseOthers as EventListener);
    };
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
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[52px]'
  };

  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/50';
  
  const variantClasses = error
    ? 'bg-background border-destructive text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-destructive'
    : 'bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring';

  const widthClass = fullWidth ? 'w-full' : '';

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses,
    widthClass,
    className
  ].filter(Boolean).join(' ');

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter(option => {
    // Proteger contra valores undefined/null
    if (!option || !option.label || !searchTerm) return true;
    return option.label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Obtener opciones seleccionadas
  const selectedOptions = options.filter(option => {
    // Proteger contra valores undefined/null
    if (!value || !Array.isArray(value)) return false;
    return value.includes(option.value);
  });

  // Texto de display
  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    
    if (selectedOptions.length <= maxDisplayed) {
      return selectedOptions
        .filter(option => option && option.label) // Proteger contra undefined
        .map(option => option.label)
        .join(', ');
    }
    
    return `${selectedOptions.length} opciones seleccionadas`;
  };

  // Manejar selección/deselección
  const handleOptionToggle = (optionValue: string) => {
    const currentValue = value || [];
    const newValue = currentValue.includes(optionValue)
      ? currentValue.filter(v => v !== optionValue)
      : [...currentValue, optionValue];
    onChange(newValue);
  };

  // Manejar "Seleccionar todos"
  const handleSelectAll = () => {
    const availableOptions = options.filter(option => !option.disabled).map(option => option.value);
    onChange(availableOptions);
  };

  // Manejar "Limpiar selección"
  const handleClearAll = () => {
    onChange([]);
  };

  const currentValue = value || [];
  const allSelected = options.filter(option => !option.disabled).every(option => currentValue.includes(option.value));

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 MultiSelect - CLICK DETECTADO!', { isOpen, disabled });
    if (!disabled) {
      setIsOpen(!isOpen);
      console.log('🔥 MultiSelect - Cambiando isOpen a:', !isOpen);
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {label && (
              <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      )}
      
      <div className="relative" ref={containerRef} data-dropdown="multi-select">
        {/* Input de display */}
        <div
          onClick={handleToggle}
          className={`
            min-h-[44px] w-full rounded-md border border-border bg-input-solid px-3 py-2 text-sm text-foreground
            ring-offset-background placeholder:text-muted-foreground
            focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            cursor-pointer
            ${isOpen ? 'ring-2 ring-ring' : ''}
            ${error ? 'border-destructive focus-within:ring-destructive' : ''}
            ${className}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`truncate ${selectedOptions.length === 0 ? 'text-muted-foreground' : 'text-foreground'}`}>
              {getDisplayText()}
            </span>
            <ChevronDownIcon 
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Backdrop overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setTimeout(() => setIsOpen(false), 50);
            }}
          />
        )}

        {/* Dropdown personalizado */}
        {isOpen && (
          <div 
            className="absolute z-50 bg-popover-solid border border-border rounded-xl shadow-xl overflow-hidden transition-all duration-200 ease-in-out transform origin-top"
            style={(() => {
              if (!containerRef.current) return { top: '100%', left: 0, right: 0, marginTop: '8px' };
              
              const rect = containerRef.current.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const dropdownMaxHeight = 320; // ~20rem en px
              const padding = 8;
              
              // Calcular si hay espacio suficiente abajo
              const spaceBelow = viewportHeight - rect.bottom - padding;
              const spaceAbove = rect.top - padding;
              
              // Decidir si mostrar arriba o abajo
              const showAbove = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;
              
              if (showAbove) {
                return {
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: `${padding}px`,
                  maxHeight: Math.min(dropdownMaxHeight, spaceAbove),
                  transformOrigin: 'bottom'
                };
              } else {
                return {
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: `${padding}px`,
                  maxHeight: Math.min(dropdownMaxHeight, spaceBelow),
                  transformOrigin: 'top'
                };
              }
            })()}
          >
            {/* Barra de búsqueda */}
                          <div className="sticky top-0 bg-muted-solid p-3 border-b border-border">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar opciones..."
                  className="w-full px-3 py-2 text-sm bg-input-solid border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            {/* Acciones rápidas */}
            {options.length > 0 && (
              <div className="sticky top-0 bg-muted-solid px-3 py-2 border-b border-border">
                <div className="flex justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={allSelected}
                    className="text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed font-medium"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={value.length === 0}
                    className="text-destructive hover:text-destructive/80 disabled:text-muted-foreground disabled:cursor-not-allowed font-medium"
                  >
                    Limpiar todo
                  </button>
                </div>
              </div>
            )}

            {/* Lista de opciones */}
            <div 
              className="overflow-y-auto scrollbar-dropdown"
              style={{ 
                maxHeight: options.length > 5 ? '200px' : 'auto',
                overflowY: options.length > 5 ? 'auto' : 'visible'
              }}
            >
              {filteredOptions.length === 0 ? (
                <div className="p-4">
                  <div className="text-center text-muted-foreground">
                    <div className="w-8 h-8 mx-auto mb-2 opacity-50">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm">
                      {searchTerm ? 'No se encontraron opciones' : 'No hay opciones disponibles'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((option, index) => {
                    const isSelected = value.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionToggle(option.value)}
                        disabled={option.disabled}
                        className={`
                          w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between
                          hover:bg-accent-solid
                          focus:outline-none focus:bg-accent-solid
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isSelected 
                            ? 'bg-primary/10 border-r-2 border-primary' 
                            : 'bg-popover-solid'
                          }
                          ${index !== filteredOptions.length - 1 ? 'border-b border-border' : ''}
                        `}
                      >
                        <span className={`text-sm text-popover-foreground ${isSelected ? 'font-medium' : ''}`}>
                          {option.label}
                        </span>
                        
                        {/* Checkbox personalizado */}
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150
                          ${isSelected 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-border bg-input-solid'
                          }
                        `}>
                          {isSelected && (
                            <CheckIcon className="w-3 h-3" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer con contador */}
            {value.length > 0 && (
                              <div className="sticky bottom-0 bg-muted-solid px-4 py-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                  {value.length} de {options.length} opciones seleccionadas
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
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
};

export default MultiSelect; 