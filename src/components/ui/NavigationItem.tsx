import React, { useState } from 'react';
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
  
  const isActive = href && (router.pathname === href || router.asPath === href);
  
  const baseClasses = `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isCollapsed ? 'justify-center px-2' : ''
  }`;
  
    const activeClasses = isActive
    ? 'bg-muted text-foreground border-r-2 border-primary'
    : 'text-muted-foreground hover:bg-muted hover:text-foreground';
  
  const handleClick = (e: React.MouseEvent) => {
    if (subMenu && !isCollapsed) {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (onClick) onClick();
  };

  if (subMenu && subMenu.length > 0) {
    return (
      <div>
        <button
          className={`${baseClasses} ${activeClasses} w-full focus:outline-none`}
          onClick={handleClick}
          aria-expanded={open}
        >
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">{icon}</span>
          {!isCollapsed && <span className="flex-1 text-left">{label}</span>}
          {!isCollapsed && (
            <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
          )}
        </button>
        
        {/* Submenú solo si no está colapsado y abierto */}
        {!isCollapsed && open && subMenu && (
          <div className="ml-8 mt-1 space-y-1">
            {subMenu.map((subItem, index) => (
              <NavigationItem
                key={subItem.href}
                {...subItem}
                isCollapsed={false}
                className="text-sm"
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
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">{icon}</span>
        {!isCollapsed && <span>{label}</span>}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={e => {
        // Prevenir navegación redundante aunque cambie el hash
        const currentPath = router.asPath.split('#')[0];
        const targetPath = (href || '').split('#')[0];
        if (currentPath === targetPath) {
          e.preventDefault();
          return;
        }
        if (onClick) onClick();
      }}
    >
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};
 