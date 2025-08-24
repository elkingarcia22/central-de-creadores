import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  onValueChange?: (value: [number, number]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = [min, max],
  onChange,
  onValueChange,
  disabled = false,
  className = '',
  label,
  showValues = true,
  formatValue = (value) => `${value}%`
}) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState<[number, number]>(value || defaultValue);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Actualizar valor local cuando cambie el prop value
  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(parseInt(e.target.value), localValue[1] - step);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onValueChange?.(newValue);
    onChange?.(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(parseInt(e.target.value), localValue[0] + step);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onValueChange?.(newValue);
    onChange?.(newValue);
  };

  const getTrackStyle = () => {
    const minPercent = ((localValue[0] - min) / (max - min)) * 100;
    const maxPercent = ((localValue[1] - min) / (max - min)) * 100;
    
    return {
      background: `linear-gradient(to right, 
        ${theme === 'dark' ? '#374151' : '#e5e7eb'} 0%, 
        ${theme === 'dark' ? '#374151' : '#e5e7eb'} ${minPercent}%, 
        ${theme === 'dark' ? '#3b82f6' : '#3b82f6'} ${minPercent}%, 
        ${theme === 'dark' ? '#3b82f6' : '#3b82f6'} ${maxPercent}%, 
        ${theme === 'dark' ? '#374151' : '#e5e7eb'} ${maxPercent}%, 
        ${theme === 'dark' ? '#374151' : '#e5e7eb'} 100%)`
    };
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Track */}
        <div
          ref={sliderRef}
          className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          style={getTrackStyle()}
        >
          {/* Min Thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[0]}
            onChange={handleMinChange}
            disabled={disabled}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            style={{ zIndex: 2 }}
          />
          
          {/* Max Thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={handleMaxChange}
            disabled={disabled}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            style={{ zIndex: 3 }}
          />
          
          {/* Thumb indicators */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white "
            style={{
              left: `${((localValue[0] - min) / (max - min)) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white "
            style={{
              left: `${((localValue[1] - min) / (max - min)) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>
      
      {/* Values display */}
      {showValues && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatValue(localValue[0])}</span>
          <span>{formatValue(localValue[1])}</span>
        </div>
      )}
    </div>
  );
};

export default Slider; 