import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDownIcon, UserIcon } from '../icons';

interface RolSelectorProps {
  className?: string;
  variant?: 'sidebar' | 'mobile';
  isCollapsed?: boolean;
}

// Función para abreviar nombres de roles
const abbreviateRole = (role: string): string => {
  const roleLower = role.toLowerCase();
  switch (roleLower) {
    case 'administrador':
      return 'Admin';
    case 'investigador':
      return 'Inv';
    case 'reclutador':
      return 'Rec';
    case 'agendador':
      return 'Agend';
    case 'coordinador':
      return 'Coord';
    case 'supervisor':
      return 'Sup';
    default:
      return role.length > 8 ? role.substring(0, 8) + '...' : role;
  }
};

export const RolSelector: React.FC<RolSelectorProps> = ({ 
  className = '', 
  variant = 'sidebar',
  isCollapsed = false
}) => {
  const { rolSeleccionado, rolesDisponibles, setRolSeleccionado } = useRol();
  const { theme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localRoles, setLocalRoles] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Asegurar que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
    
    // Cargar roles desde localStorage como fallback inmediato
    if (typeof window !== 'undefined') {
      try {
        const storedRoles = localStorage.getItem('rolesDisponibles');
        if (storedRoles) {
          const parsed = JSON.parse(storedRoles);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalRoles(parsed);
          }
        }
      } catch (error) {
        console.warn('Error cargando roles desde localStorage:', error);
      }
    }
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si no está montado, mostrar solo el rol actual
  if (!mounted) {
    return (
      <span className={`capitalize ${className}`}>
        {isCollapsed ? abbreviateRole(rolSeleccionado || 'Usuario') : (rolSeleccionado || 'Usuario')}
      </span>
    );
  }

  // Usar roles del contexto o los locales como fallback
  const availableRoles = rolesDisponibles && rolesDisponibles.length > 0 
    ? rolesDisponibles 
    : localRoles;

  // Si no hay roles disponibles o solo hay uno, mostrar solo el rol actual
  if (!availableRoles || availableRoles.length <= 1) {
    return (
      <span className={`capitalize ${className}`}>
        {isCollapsed ? abbreviateRole(rolSeleccionado || 'Usuario') : (rolSeleccionado || 'Usuario')}
      </span>
    );
  }

  // Función para obtener el módulo principal de cada rol
  const getMainModuleForRole = (roleName: string): string => {
    const rolNormalizado = roleName.toLowerCase();
    switch (rolNormalizado) {
      case 'administrador':
        return '/investigaciones';
      case 'investigador':
        return '/investigaciones';
      case 'reclutador':
        return '/reclutamiento';
      case 'agendador':
        return '/reclutamiento';
      default:
        return `/dashboard/${rolNormalizado}`;
    }
  };

  const handleRolChange = (nuevoRol: string) => {
    setRolSeleccionado(nuevoRol);
    setIsOpen(false);
    
    // Redirigir al módulo principal del nuevo rol
    const mainModule = getMainModuleForRole(nuevoRol);
    console.log('RolSelector - Redirigiendo al módulo principal:', mainModule);
    router.push(mainModule);
  };

  const isSidebar = variant === 'sidebar';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1 capitalize cursor-pointer
          hover:opacity-80 transition-opacity
          text-muted-foreground
          ${isSidebar ? 'text-sm' : 'text-base'}
        `}
      >
        <span>{isCollapsed ? abbreviateRole(rolSeleccionado || 'Usuario') : (rolSeleccionado || 'Usuario')}</span>
        {!isCollapsed && (
          <ChevronDownIcon 
            className={`${isSidebar ? 'w-3 h-3' : 'w-4 h-4'} transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </button>

      {isOpen && (
        <div className={`
          absolute z-50 mt-1 rounded-md  min-w-[120px]
          ${theme === 'dark' ? 'bg-popover border border-border' : 'bg-popover border border-border'}
          ${isSidebar ? 'left-0' : 'left-0 right-0'}
        `}>
          <div className="py-1">
            {availableRoles.map((rol) => (
              <button
                key={rol}
                onClick={() => handleRolChange(rol)}
                className={`
                  w-full text-left px-3 py-2 text-sm transition-colors capitalize
                  ${rol === rolSeleccionado
                    ? theme === 'dark'
                              ? 'bg-accent text-accent-foreground'
        : 'bg-accent text-accent-foreground'
                    : theme === 'dark'
                      ? 'text-popover-foreground hover:bg-accent'
                      : 'text-popover-foreground hover:bg-accent'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3 h-3" />
                  <span>{rol}</span>
                  {rol === rolSeleccionado && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
