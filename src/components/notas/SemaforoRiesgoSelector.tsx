import React from 'react';
import { Button, Chip } from '../ui';

export type SemaforoRiesgo = 'neutral' | 'verde' | 'amarillo' | 'rojo';

interface SemaforoRiesgoSelectorProps {
  valor: SemaforoRiesgo;
  onChange: (valor: SemaforoRiesgo) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showLabels?: boolean;
}

const semaforoConfig = {
  neutral: {
    variant: 'default' as const,
    color: '#6B7280',
    label: 'Neutral',
    description: 'Sin evaluación específica'
  },
  verde: {
    variant: 'success' as const,
    color: '#10B981',
    label: 'Bueno',
    description: 'Sin problemas identificados'
  },
  amarillo: {
    variant: 'warning' as const,
    color: '#F59E0B',
    label: 'Alerta',
    description: 'Requiere atención'
  },
  rojo: {
    variant: 'danger' as const,
    color: '#EF4444',
    label: 'Crítico',
    description: 'Acción inmediata requerida'
  }
};

export const SemaforoRiesgoSelector: React.FC<SemaforoRiesgoSelectorProps> = ({
  valor,
  onChange,
  size = 'md',
  disabled = false,
  showLabels = false
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {Object.entries(semaforoConfig).map(([key, config]) => {
          const isSelected = valor === key;
          
          return (
            <Chip
              key={key}
              variant={config.variant}
              size={size}
              onClick={() => !disabled && onChange(key as SemaforoRiesgo)}
              disabled={disabled}
              className={`
                cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-offset-1 ring-current shadow-md' 
                  : 'hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`${config.label}: ${config.description}`}
            >
              <div className="flex items-center gap-1.5">
                {/* Círculo de color */}
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-medium">
                  {config.label}
                </span>
              </div>
            </Chip>
          );
        })}
      </div>
      
      {showLabels && (
        <div className="text-center">
          <span className="text-sm font-medium text-muted-foreground">
            {semaforoConfig[valor].label}
          </span>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar solo el indicador (sin selector)
interface SemaforoRiesgoIndicatorProps {
  valor: SemaforoRiesgo;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const SemaforoRiesgoIndicator: React.FC<SemaforoRiesgoIndicatorProps> = ({
  valor,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const config = semaforoConfig[valor];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Chip
        variant={config.variant}
        size={size}
        className="cursor-default"
        title={`${config.label}: ${config.description}`}
      >
        <div className="flex items-center gap-1.5">
          {/* Círculo de color */}
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.color }}
          />
          {showLabel && (
            <span className="font-medium">
              {config.label}
            </span>
          )}
        </div>
      </Chip>
    </div>
  );
};

// Componente para cambio rápido de color (clickeable)
interface SemaforoRiesgoQuickChangeProps {
  valor: SemaforoRiesgo;
  onChange: (valor: SemaforoRiesgo) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const SemaforoRiesgoQuickChange: React.FC<SemaforoRiesgoQuickChangeProps> = ({
  valor,
  onChange,
  size = 'sm',
  disabled = false,
  className = ''
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const config = semaforoConfig[valor];

  const handleColorChange = (nuevoColor: SemaforoRiesgo) => {
    console.log('🎨 [DEBUG] SemaforoRiesgoQuickChange - Cambiando color:', { 
      colorActual: valor, 
      nuevoColor,
      config: semaforoConfig[nuevoColor]
    });
    onChange(nuevoColor);
    setShowMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Chip
        variant={config.variant}
        size={size}
        onClick={() => {
          if (!disabled) {
            console.log('🖱️ [DEBUG] SemaforoRiesgoQuickChange - Click en chip:', { 
              valor, 
              showMenu, 
              nuevoEstado: !showMenu 
            });
            setShowMenu(!showMenu);
          }
        }}
        disabled={disabled}
        className={`
          cursor-pointer transition-all duration-200 hover:shadow-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${showMenu ? 'ring-2 ring-offset-1 ring-current' : ''}
        `}
        title={`${config.label}: ${config.description} - Click para cambiar`}
      >
        <div className="flex items-center gap-1.5">
          {/* Círculo de color */}
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <span className="font-medium text-xs">
            {config.label}
          </span>
        </div>
      </Chip>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-1">
          {Object.entries(semaforoConfig).map(([key, config]) => {
            const isSelected = valor === key;
            
            return (
              <button
                key={key}
                onClick={() => handleColorChange(key as SemaforoRiesgo)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors
                  ${isSelected 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {config.label}
                </span>
                {isSelected && (
                  <div className="ml-auto w-2 h-2 bg-current rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Overlay para cerrar el menú */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
