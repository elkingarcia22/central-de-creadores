import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Select from './Select';
import Input from './Input';
import Chip from './Chip';
import { CheckIcon, CloseIcon } from '../icons';

interface InlineEditProps {
  value: any;
  onSave: (newValue: any) => void;
  onCancel?: () => void;
  className?: string;
}

interface InlineSelectProps extends InlineEditProps {
  options: Array<{ value: any; label: string }>;
  placeholder?: string;
  useChip?: boolean;
  getChipVariant?: (value: any) => string;
  getChipText?: (value: any) => string;
}

interface InlineDateProps extends InlineEditProps {
  type?: 'date' | 'datetime-local';
}

interface InlineTextProps extends InlineEditProps {
  placeholder?: string;
  multiline?: boolean;
}

// Componente base para edición inline
const InlineEditBase: React.FC<{
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  renderDisplay: () => React.ReactNode;
  renderEdit: () => React.ReactNode;
  className?: string;
}> = ({ isEditing, onEdit, onSave, onCancel, renderDisplay, renderEdit, className = '' }) => {
  const { theme } = useTheme();

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1">
          {renderEdit()}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Guardar"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Cancelar"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
      onClick={onEdit}
      title="Clic para editar"
      data-inline-edit="true"
    >
      {renderDisplay()}
    </div>
  );
};

// Edición inline para selects
export const InlineSelect: React.FC<InlineSelectProps> = ({ 
  value, 
  options, 
  onSave, 
  onCancel,
  placeholder = 'Seleccionar...',
  className = '',
  useChip = false,
  getChipVariant,
  getChipText
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const getDisplayText = () => {
    const option = options.find(opt => opt.value === value && opt.label);
    return option?.label || placeholder;
  };

  return (
    <InlineEditBase
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
      className={className}
      renderDisplay={() => {
        if (useChip && value && getChipVariant && getChipText) {
          return (
            <Chip 
              variant={getChipVariant(value) as any}
              size="sm"
            >
              {getChipText(value)}
            </Chip>
          );
        }
        return (
          <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
            {getDisplayText()}
          </span>
        );
      }}
      renderEdit={() => (
        <Select
          options={options}
          value={tempValue}
          onChange={setTempValue}
          placeholder={placeholder}
          size="sm"
        />
      )}
    />
  );
};

// Edición inline para fechas
export const InlineDate: React.FC<InlineDateProps> = ({ 
  value, 
  onSave, 
  onCancel,
  type = 'date',
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <InlineEditBase
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
      className={className}
      renderDisplay={() => (
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
          {formatDisplayDate(value)}
        </span>
      )}
      renderEdit={() => (
        <input
          type={type}
          value={formatInputDate(tempValue)}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-full px-3 py-1.5 text-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-0 rounded-lg transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
          }}
        />
      )}
    />
  );
};

// Edición inline para texto
export const InlineText: React.FC<InlineTextProps> = ({ 
  value, 
  onSave, 
  onCancel,
  placeholder = 'Sin valor',
  multiline = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value || '');
    setIsEditing(false);
    onCancel?.();
  };

  return (
    <InlineEditBase
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
      className={className}
      renderDisplay={() => (
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
          {value || placeholder}
        </span>
      )}
      renderEdit={() => 
        multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={3}
          />
        ) : (
          <Input
            value={tempValue || ''}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            size="sm"
          />
        )
      }
    />
  );
}; 