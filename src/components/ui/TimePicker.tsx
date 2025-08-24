import React, { useState, useRef, useEffect } from 'react';
import Input from './Input';
import { ClockIcon } from '../icons';

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: '12h' | '24h';
  step?: number;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value = '',
  onChange,
  placeholder = '--:-- --',
  disabled = false,
  format = '12h',
  step = 1,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        const period = timeMatch[3] as 'AM' | 'PM';

        if (format === '12h') {
          // Si viene en formato 24h, convertir a 12h para mostrar
          if (!period) {
            if (hour >= 12) {
              setSelectedPeriod('PM');
              setSelectedHour(hour === 12 ? 12 : hour - 12);
            } else {
              setSelectedPeriod('AM');
              setSelectedHour(hour === 0 ? 12 : hour);
            }
          } else {
            setSelectedHour(hour);
            setSelectedPeriod(period);
          }
        } else {
          setSelectedHour(hour);
        }
        setSelectedMinute(minute);
      }
    }
  }, [value, format]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    if (format === '12h') {
      // Para compatibilidad con el backend, devolver formato 24h
      let hour24 = hour;
      if (period === 'PM' && hour !== 12) {
        hour24 = hour + 12;
      } else if (period === 'AM' && hour === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  };

  const handleTimeChange = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    
    const formattedTime = formatTime(hour, minute, period);
    onChange?.(formattedTime);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const displayValue = (() => {
    if (!value) return placeholder;
    
    if (format === '12h') {
      // Convertir formato 24h a 12h para mostrar
      const timeMatch = value.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2];
        let period = 'AM';
        
        if (hour >= 12) {
          period = 'PM';
          hour = hour === 12 ? 12 : hour - 12;
        } else if (hour === 0) {
          hour = 12;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minute} ${period}`;
      }
    }
    
    return value;
  })();

  // Generate hour options
  const hourOptions = format === '12h' 
    ? Array.from({length: 12}, (_, i) => i + 1)
    : Array.from({length: 24}, (_, i) => i);

  // Generate minute options based on step
  const minuteOptions = Array.from({length: Math.floor(60 / step)}, (_, i) => i * step);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <div className="relative">
        <Input
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className="pr-10 cursor-pointer"
          onClick={handleInputClick}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ClockIcon className="w-4 h-4 text-muted" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-muted rounded-lg  z-50">
          <div className="p-3">
            <div className="flex gap-2">
              {/* Hour Column */}
              <div className="flex-1">
                <div className="text-sm font-medium text-center mb-2 text-foreground">Hora</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {hourOptions.map(hour => (
                    <div
                      key={hour}
                      className={`px-2 py-1 rounded text-center cursor-pointer hover:bg-muted text-sm ${
                        hour === selectedHour ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      }`}
                      onClick={() => handleTimeChange(hour, selectedMinute, selectedPeriod)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Minute Column */}
              <div className="flex-1">
                <div className="text-sm font-medium text-center mb-2 text-foreground">Minutos</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {minuteOptions.map(minute => (
                    <div
                      key={minute}
                      className={`px-2 py-1 rounded text-center cursor-pointer hover:bg-muted text-sm ${
                        minute === selectedMinute ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      }`}
                      onClick={() => handleTimeChange(selectedHour, minute, selectedPeriod)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* AM/PM Column (only for 12h format) */}
              {format === '12h' && (
                <div className="flex-1">
                  <div className="text-sm font-medium text-center mb-2 text-foreground">AM/PM</div>
                  <div className="space-y-1">
                    <div
                      className={`px-2 py-1 rounded text-center cursor-pointer hover:bg-muted text-sm ${
                        selectedPeriod === 'AM' ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      }`}
                      onClick={() => handleTimeChange(selectedHour, selectedMinute, 'AM')}
                    >
                      AM
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-center cursor-pointer hover:bg-muted text-sm ${
                        selectedPeriod === 'PM' ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      }`}
                      onClick={() => handleTimeChange(selectedHour, selectedMinute, 'PM')}
                    >
                      PM
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
