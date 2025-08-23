import React, { useState, useEffect } from 'react';
import Select from './Select';
import { UserIcon, CloseIcon, CheckIcon } from '../icons';
import { useInlineEdit } from '../../contexts/InlineEditContext';

interface UserOption {
  value: string;
  label: string;
  email?: string;
  avatar_url?: string;
}

interface InlineUserSelectProps {
  id: string; // ID único para identificar este elemento
  value: string | null;
  options: UserOption[];
  onSave: (newValue: string | null) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  currentUser?: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

// Componente para mostrar avatar del usuario
const UserAvatar: React.FC<{
  avatar_url?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md';
}> = ({ avatar_url, name, email, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  };

  const displayName = name || email || 'U';
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (avatar_url) {
    return (
      <div className="relative">
        <img
          src={avatar_url}
          alt={displayName}
          className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200 dark:border-gray-600`}
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white absolute inset-0`}
          style={{
            backgroundColor: `hsl(${displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`,
            display: 'none'
          }}
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white`}
      style={{
        backgroundColor: `hsl(${displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`
      }}
    >
      {initials}
    </div>
  );
};

// Componente para mostrar usuario completo
const UserDisplay: React.FC<{
  user?: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  placeholder?: string;
}> = ({ user, placeholder = 'Sin asignar' }) => {
  if (!user || (!user.name && !user.email)) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UserIcon className="w-3 h-3" />
        </div>
        <span className="text-sm">{placeholder}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        avatar_url={user.avatar_url}
        name={user.name}
        email={user.email}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {user.name || 'Sin nombre'}
        </p>
        {user.email && user.name && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        )}
      </div>
    </div>
  );
};

// Componente principal
const InlineUserSelect: React.FC<InlineUserSelectProps> = ({
  id,
  value,
  options,
  onSave,
  onCancel,
  placeholder = 'Sin asignar',
  className = '',
  currentUser
}) => {
  const { isEditing, startEditing, stopEditing } = useInlineEdit();
  const [tempValue, setTempValue] = useState(value);
  const editing = isEditing(id);

  // Actualizar tempValue cuando cambie el value externo
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Manejar guardado
  const handleSave = () => {
    onSave(tempValue);
    stopEditing();
  };

  // Manejar cancelación
  const handleCancel = () => {
    setTempValue(value); // Restaurar valor original
    stopEditing();
    onCancel?.();
  };

  // Opciones mejoradas para el select con avatares
  const enhancedOptions = [
    { value: '', label: placeholder },
    ...options.map(option => ({
      ...option,
      renderOption: () => (
        <div className="flex items-center gap-3 py-1">
          <UserAvatar
            avatar_url={option.avatar_url}
            name={option.label}
            email={option.email}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-popover-foreground truncate">
              {option.label || 'Sin nombre'}
            </p>
            {option.email && option.label !== option.email && (
              <p className="text-xs text-muted-foreground truncate">
                {option.email}
              </p>
            )}
          </div>
        </div>
      )
    }))
  ];

  if (editing) {
    // Modo edición con botones de confirmar y cancelar
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 min-w-0">
          <Select
            options={enhancedOptions}
            value={tempValue || ''}
            onChange={(newValue) => setTempValue(newValue === '' ? null : newValue.toString())}
            placeholder={placeholder}
            size="sm"
            fullWidth
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            title="Guardar"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Cancelar"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Modo display normal
  return (
    <div
      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
      onClick={() => startEditing(id)}
      title="Clic para editar"
      data-inline-edit="true"
    >
      <UserDisplay user={currentUser} placeholder={placeholder} />
    </div>
  );
};

export default InlineUserSelect; 