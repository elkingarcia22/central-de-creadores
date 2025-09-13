import React, { useState, useRef, useEffect } from 'react';
import { XIcon, UserIcon, CheckIcon } from '../icons';
import Typography from './Typography';
import Button from './Button';

export interface UserOption {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  // Campos alternativos para diferentes estructuras
  nombre?: string;
  name?: string;
  first_name?: string;
  display_name?: string;
  avatar?: string;
  profile_picture?: string;
  image_url?: string;
}

export interface MultiUserSelectorProps {
  label?: string;
  placeholder?: string;
  value?: string[];
  onChange: (userIds: string[]) => void;
  users?: UserOption[];
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

const MultiUserSelector: React.FC<MultiUserSelectorProps> = ({
  label,
  placeholder = 'Seleccionar usuarios del equipo',
  value = [],
  onChange,
  users = [],
  loading = false,
  error,
  disabled = false,
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Función para obtener el nombre del usuario (adaptable)
  const getUserName = (user: UserOption) => {
    return user.full_name || user.nombre || user.name || user.first_name || user.display_name || 'Usuario sin nombre';
  };

  // Función para obtener el avatar del usuario (adaptable)
  const getUserAvatar = (user: UserOption) => {
    return user.avatar_url || user.avatar || user.profile_picture || user.image_url;
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const userName = getUserName(user).toLowerCase();
    const userEmail = user.email?.toLowerCase() || '';
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  // Obtener usuarios seleccionados
  const selectedUsers = users.filter(user => value.includes(user.id));

  // Función para obtener iniciales
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  // Manejar selección/deselección de usuario
  const handleUserToggle = (userId: string) => {
    if (disabled) return;
    
    const isSelected = value.includes(userId);
    if (isSelected) {
      onChange(value.filter(id => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Remover usuario seleccionado
  const removeUser = (userId: string) => {
    if (disabled) return;
    onChange(value.filter(id => id !== userId));
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <Typography variant="subtitle2" weight="medium" className="mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      )}

      {/* Input principal */}
      <div
        className={`
          relative w-full min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer
          transition-colors duration-200
          ${error 
            ? 'border-destructive bg-destructive/10' 
            : 'border-border bg-background'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-border/80'
          }
          ${isOpen 
            ? 'border-primary ring-1 ring-primary' 
            : ''
          }
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Usuarios seleccionados */}
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedUsers.map(user => (
            <div
              key={user.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-md text-sm"
            >
              <span>{getUserName(user)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(user.id);
                  }}
                  className="hover:bg-accent/80 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Placeholder cuando no hay usuarios seleccionados */}
        {selectedUsers.length === 0 && (
          <div className="text-muted-foreground text-sm">
            {placeholder}
          </div>
        )}

        {/* Indicador de dropdown */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Typography variant="caption" color="error" className="mt-1">
          {error}
        </Typography>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Lista de usuarios */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Cargando usuarios...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
              </div>
            ) : (
              filteredUsers.map(user => {
                const isSelected = value.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className={`
                      flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-150
                      ${isSelected 
                        ? 'bg-accent' 
                        : 'hover:bg-accent'
                      }
                    `}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {getUserAvatar(user) ? (
                        <img
                          src={getUserAvatar(user)}
                          alt={getUserName(user)}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getInitials(getUserName(user), user.email)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información del usuario */}
                    <div className="flex-1 min-w-0">
                      <Typography variant="body2" weight="medium" className="truncate">
                        {getUserName(user)}
                      </Typography>
                      {user.email && (
                        <Typography variant="caption" color="secondary" className="truncate">
                          {user.email}
                        </Typography>
                      )}
                    </div>

                    {/* Indicador de selección */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <CheckIcon className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Información de selección */}
          {selectedUsers.length > 0 && (
            <div className="p-2 border-t border-border bg-muted/50">
              <Typography variant="caption" color="secondary">
                {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiUserSelector;
