import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '../icons';

export interface NavigationItemProps {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  subMenu?: NavigationItemProps[];
  isCollapsed?: boolean;
  className?: string;
  onClick?: () => void;
  asButton?: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  href,
  icon,
  subMenu,
  isCollapsed = false,
  className = '',
  onClick,
  asButton = false
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log del estado de colapso
  React.useEffect(() => {
    console.log(`NavigationItem "${label}" isCollapsed:`, isCollapsed);
  }, [isCollapsed, label]);
  
  // Mejorada la lógica de detección de ruta activa para rutas dinámicas
  const isActive = href && (
    router.pathname === href || 
    router.asPath === href ||
    // Para rutas dinámicas, verificar si la ruta actual comienza con el href
    (href !== '/' && router.pathname.startsWith(href)) ||
    (href !== '/' && router.asPath.startsWith(href))
  );
  
  const baseClasses = `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isCollapsed ? 'justify-center px-3' : 'justify-start'
  }`;
  
  const activeClasses = isActive
    ? 'bg-zinc-800 text-white border-r-2 border-primary'
    : 'text-white hover:bg-gray-700 hover:text-white';
  
  // Cerrar submenú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open && isCollapsed) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, isCollapsed]);

  const handleClick = (e: React.MouseEvent) => {
    if (subMenu) {
      e.preventDefault();
      if (isCollapsed) {
        // Si está contraído, expandir temporalmente y mostrar submenú
        setOpen((v) => !v);
      } else {
        // Si está expandido, toggle normal
        setOpen((v) => !v);
      }
    }
    if (onClick) onClick();
  };

  if (subMenu && subMenu.length > 0) {
    return (
      <div className={`${isCollapsed ? 'relative z-50' : ''}`} ref={submenuRef}>
        <button
          className={`${baseClasses} ${activeClasses} w-full focus:outline-none`}
          onClick={handleClick}
          aria-expanded={open}
        >
          <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>
          {!isCollapsed && <span className="flex-1 text-left truncate text-white">{label}</span>}
          {!isCollapsed && (
            <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
          )}
        </button>
        
        {/* Submenú cuando está abierto (expandido o contraído) */}
        {open && subMenu && (
          <div className={`${isCollapsed ? 'absolute left-full top-0 ml-2 bg-card border border-slate-100 dark:border-zinc-700 rounded-md shadow-lg z-[9999] min-w-48' : 'ml-8 mt-1'} space-y-1`}>
            {subMenu.map((subItem, index) => (
              <NavigationItem
                key={subItem.href}
                {...subItem}
                isCollapsed={false}
                className={`text-sm ${isCollapsed ? 'px-3 py-2' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (asButton || !href) {
    return (
      <button
        type="button"
        className={`${baseClasses} ${activeClasses} ${className} w-full focus:outline-none`}
        onClick={onClick}
      >
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>
        {!isCollapsed && <span className="flex-1 truncate text-white">{label}</span>}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={e => {
        // Solo prevenir navegación si estamos en la misma ruta exacta
        const currentPath = router.asPath.split('#')[0];
        const targetPath = (href || '').split('#')[0];
        
        // Solo prevenir si las rutas son exactamente iguales
        if (currentPath === targetPath) {
          e.preventDefault();
          return;
        }
        
        // Si hay un onClick handler personalizado, usarlo en lugar de la navegación del Link
        if (onClick) {
          e.preventDefault();
          onClick();
          return;
        }
        
        // Si no hay onClick handler, dejar que el Link maneje la navegación
      }}
    >
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="flex-1 truncate text-white">{label}</span>}
    </Link>
  );
};
 