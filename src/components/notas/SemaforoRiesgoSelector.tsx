import React from 'react';
import { Button } from '../ui';

export type SemaforoRiesgo = 'verde' | 'amarillo' | 'rojo';

interface SemaforoRiesgoSelectorProps {
  valor: SemaforoRiesgo;
  onChange: (valor: SemaforoRiesgo) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showLabels?: boolean;
}

const semaforoConfig = {
  verde: {
    color: '#10B981',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    hoverColor: 'hover:bg-green-200',
    textColor: 'text-green-800',
    label: 'Bajo Riesgo',
    description: 'Sin problemas identificados'
  },
  amarillo: {
    color: '#F59E0B',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    hoverColor: 'hover:bg-yellow-200',
    textColor: 'text-yellow-800',
    label: 'Riesgo Medio',
    description: 'Requiere atención'
  },
  rojo: {
    color: '#EF4444',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    hoverColor: 'hover:bg-red-200',
    textColor: 'text-red-800',
    label: 'Alto Riesgo',
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
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {Object.entries(semaforoConfig).map(([key, config]) => {
          const isSelected = valor === key;
          const sizeClass = sizeClasses[size];
          
          return (
            <button
              key={key}
              onClick={() => !disabled && onChange(key as SemaforoRiesgo)}
              disabled={disabled}
              className={`
                ${sizeClass}
                rounded-full
                border-2
                transition-all
                duration-200
                flex
                items-center
                justify-center
                relative
                group
                ${isSelected 
                  ? `${config.borderColor} ${config.bgColor} shadow-md` 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${!disabled && !isSelected ? 'hover:shadow-sm' : ''}
              `}
              title={`${config.label}: ${config.description}`}
            >
              {/* Círculo de color */}
              <div 
                className="w-3/4 h-3/4 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              
              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {showLabels && (
        <div className="text-center">
          <span className={`${textSizeClasses[size]} font-medium ${semaforoConfig[valor].textColor}`}>
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
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const config = semaforoConfig[valor];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border border-gray-200 flex items-center justify-center`}
        title={`${config.label}: ${config.description}`}
      >
        <div 
          className="w-3/4 h-3/4 rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>
      
      {showLabel && (
        <span className={`${textSizeClasses[size]} ${config.textColor} font-medium`}>
          {config.label}
        </span>
      )}
    </div>
  );
};
