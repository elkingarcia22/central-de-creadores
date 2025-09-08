import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, UserIcon, CheckIcon } from '../icons';

// ACTUALIZACIÓN VISUAL v2.0 - Avatar morado más grande
export interface UserOption {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface UserSelectorWithAvatarProps {
  value?: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  users?: UserOption[];
  loading?: boolean;
  error?: string;
}

const UserSelectorWithAvatar: React.FC<UserSelectorWithAvatarProps> = ({
  value,
  onChange,
  placeholder = 'Seleccionar usuario',
  label,
  required = false,
  disabled = false,
  className = '',
  users = [],
  loading = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Buscar usuario seleccionado de forma segura
  const selectedUser = React.useMemo(() => {
    console.log('🔍 UserSelectorWithAvatar - value:', value);
    console.log('🔍 UserSelectorWithAvatar - users:', users);
    if (!value || !users || !Array.isArray(users) || users.length === 0) {
      console.log('🔍 UserSelectorWithAvatar - No se puede buscar usuario');
      return null;
    }
    const found = users.find(user => user && user.id === value) || null;
    console.log('🔍 UserSelectorWithAvatar - usuario encontrado:', found);
    return found;
  }, [value, users]);

  // Lista de usuarios a mostrar con validación
  const usersToShow = React.useMemo(() => {
    console.log('🔍 UserSelectorWithAvatar - users recibidos:', users);
    if (!users || !Array.isArray(users)) return [];
    const filtered = users.filter(user => user && user.id && (user.full_name || user.email));
    console.log('🔍 UserSelectorWithAvatar - usuarios filtrados:', filtered);
    return filtered;
  }, [users]);

  // Función para manejar selección de "Todos"
  const handleSelectAll = () => {
    onChange('todos');
    setIsOpen(false);
  };

  // Manejo de clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Función para obtener iniciales de forma segura
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim() && name !== 'Sin nombre') {
      return name.trim().split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }
    if (email && email !== 'sin-email@ejemplo.com') {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 UserSelectorWithAvatar - handleToggle:', {
      disabled,
      loading,
      usersToShowLength: usersToShow.length,
      usersLength: users.length,
      isOpen
    });
    if (!disabled && !loading && usersToShow.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleUserSelect = (user: UserOption) => {
    if (user && user.id) {
      onChange(user.id);
      setIsOpen(false);
    }
  };

  const renderUserAvatar = (user: UserOption) => {
    if (!user) return null;
    
    const initials = getInitials(user.full_name, user.email);
    
    return (
      <div className="w-8 h-8 rounded-full flex-shrink-0 relative overflow-hidden">
        {user.avatar_url ? (
          <>
            <div className="w-8 h-8 rounded-full bg-muted text-foreground font-medium flex items-center justify-center absolute top-0 left-0">
              {initials}
            </div>
            <img
              src={user.avatar_url}
              alt={user.full_name || user.email || 'Usuario'}
              className="w-8 h-8 rounded-full object-cover absolute top-0 left-0 z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div 
            className="w-8 h-8 rounded-full text-foreground font-medium flex items-center justify-center text-xs"
            style={{ 
              backgroundColor: `hsl(${(user.full_name || user.email || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`,
              color: 'white'
            }}
          >
            {initials}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Contenedor principal */}
      <div ref={containerRef} className="relative">
        {/* Botón selector */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={`
            w-full min-h-[60px] px-4 py-3
            bg-input-solid border border-border
            rounded-lg
            text-left
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${isOpen ? 'ring-2 ring-ring border-ring' : 'hover:border-muted-foreground'}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {loading ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="w-24 h-4 bg-muted animate-pulse rounded mb-1"></div>
                    <div className="w-32 h-3 bg-muted animate-pulse rounded"></div>
                  </div>
                </>
              ) : value === 'todos' ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      Todos
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Mostrar todas las empresas
                    </div>
                  </div>
                </>
              ) : selectedUser ? (
                <>
                  {renderUserAvatar(selectedUser)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {selectedUser.full_name && selectedUser.full_name !== 'Sin nombre' ? selectedUser.full_name : 'Sin nombre'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {selectedUser.email && selectedUser.email !== 'sin-email@ejemplo.com' ? selectedUser.email : 'Sin email'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground">{placeholder}</span>
                    <div className="text-xs text-transparent">placeholder</div>
                  </div>
                </>
              )}
            </div>

            {/* Icono dropdown */}
            <ChevronDownIcon 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>

        {/* Dropdown personalizado */}
        {isOpen && usersToShow.length > 0 && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            <div className="absolute z-50 w-full mt-2 bg-popover-solid border border-border rounded-xl  overflow-hidden transition-all duration-200 ease-in-out transform origin-top">
              {/* Header de la lista */}
              <div className="sticky top-0 bg-muted-solid px-4 py-2 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Usuarios disponibles ({usersToShow.length})
                </p>
              </div>

              {/* Lista de usuarios */}
              <div className="py-1 max-h-64 overflow-y-auto scrollbar-dropdown">
                {/* Opción "Todos" */}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`
                    w-full px-4 py-3 text-left transition-all duration-150
                    hover:bg-accent-solid
                    focus:outline-none focus:bg-accent-solid
                    ${value === 'todos' 
                      ? 'bg-primary/10 border-r-2 border-primary' 
                      : 'bg-popover-solid'
                    }
                    border-b border-border
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-popover-foreground">
                          Todos
                        </h4>
                        {value === 'todos' && (
                          <div className="flex-shrink-0">
                            <CheckIcon className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mostrar todas las empresas
                      </p>
                    </div>
                  </div>
                </button>

                {usersToShow.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className={`
                      w-full px-4 py-3 text-left transition-all duration-150
                      hover:bg-accent-solid
                      focus:outline-none focus:bg-accent-solid
                      ${user.id === value 
                        ? 'bg-primary/10 border-r-2 border-primary' 
                        : 'bg-popover-solid'
                      }
                      ${index !== usersToShow.length - 1 ? 'border-b border-border' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {renderUserAvatar(user)}
                      </div>
                      
                      {/* Información del usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-popover-foreground truncate">
                            {user.full_name && user.full_name !== 'Sin nombre' ? user.full_name : 'Sin nombre'}
                          </h4>
                          {user.id === value && (
                            <div className="flex-shrink-0">
                              <CheckIcon className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email && user.email !== 'sin-email@ejemplo.com' ? user.email : 'Sin email'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Mensaje cuando no hay usuarios */}
        {isOpen && usersToShow.length === 0 && !loading && (
          <div className="absolute z-50 w-full mt-2 bg-popover-solid border border-border rounded-xl  overflow-hidden">
            <div className="px-4 py-6 text-center">
              <UserIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay usuarios disponibles</p>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default UserSelectorWithAvatar;
export { UserSelectorWithAvatar };