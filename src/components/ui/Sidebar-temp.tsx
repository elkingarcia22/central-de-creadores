import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import SimpleAvatar from './SimpleAvatar';
import Typography from './Typography';
import { RolSelector } from './RolSelector';
import { Button } from './Button';
import { SunIcon, MoonIcon, SettingsIcon, LogoutIcon } from '../icons';

interface SidebarUser {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  subMenu?: SidebarItem[];
}

interface SidebarProps {
  title?: string;
  items: SidebarItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: (href: string) => void;
  className?: string;
  user?: SidebarUser;
  onLogout?: () => void;
  onSettings?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  title = 'Central de creadores',
  items,
  isCollapsed = false,
  onToggleCollapse,
  onItemClick,
  className = '',
  user,
  onLogout,
  onSettings
}) => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const displayName = user?.name || user?.email || 'Usuario';

  const handleSubmenuToggle = (href: string) => {
    const newOpenSubmenus = new Set(openSubmenus);
    if (newOpenSubmenus.has(href)) {
      newOpenSubmenus.delete(href);
    } else {
      newOpenSubmenus.add(href);
    }
    setOpenSubmenus(newOpenSubmenus);
  };

  const isActive = (href: string) => {
    return router.pathname === href || router.asPath === href;
  };

  const renderMenuItem = (item: SidebarItem, level: number = 0) => {
    const active = isActive(item.href);
    const hasSubmenu = item.subMenu && item.subMenu.length > 0;
    const isSubmenuOpen = openSubmenus.has(item.href);

    const baseClasses = `
      flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200
      ${level > 0 ? 'ml-4' : ''}
      ${active 
        ? 'bg-primary/10 text-primary border-r-2 border-primary' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }
    `;

    const iconClasses = `
      w-4 h-4 flex items-center justify-center flex-shrink-0
      ${active ? 'text-primary' : 'text-muted-foreground'}
    `;

    if (hasSubmenu) {
      return (
        <div key={item.href}>
          <button
            onClick={() => handleSubmenuToggle(item.href)}
            className={`${baseClasses} justify-between focus:outline-none`}
          >
            <div className="flex items-center gap-3">
              <span className={iconClasses}>{item.icon}</span>
              {!isCollapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRightIcon 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isSubmenuOpen ? 'rotate-90' : ''
                }`} 
              />
            )}
          </button>
          
          {!isCollapsed && isSubmenuOpen && item.subMenu && (
            <div className="mt-1 space-y-1">
              {item.subMenu.map((subItem) => renderMenuItem(subItem, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (isCollapsed) {
      return (
        <button
          key={item.href}
          onClick={() => onItemClick?.(item.href)}
          className={`${baseClasses} justify-center px-2`}
          title={item.label}
        >
          <span className={iconClasses}>{item.icon}</span>
        </button>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={baseClasses}
        onClick={() => onItemClick?.(item.href)}
      >
        <span className={iconClasses}>{item.icon}</span>
        <span className="flex-1 text-left ml-3">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className={`
      flex flex-col bg-card border-r border-border h-screen min-h-0 transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-64'} 
      ${className}
    `}>
      {/* Header con avatar y usuario */}
      <div className={`
        flex flex-col items-center justify-center py-6 px-2 border-b border-border transition-all duration-300
        ${isCollapsed ? 'py-4' : ''}
      `}>
        <SimpleAvatar
          src={user?.avatar}
          fallbackText={displayName}
          size="xl"
          className="border-2 border-border"
        />
        {!isCollapsed && user && (
          <div className="mt-3 text-center w-full flex flex-col items-center">
            <Typography variant="body2" weight="medium" className="text-foreground truncate">
              {displayName}
            </Typography>
            <RolSelector variant="sidebar" className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Botón de contraer/expandir */}
      <div className="px-2 py-2 border-b border-border">
        <Button
          variant="ghost"
          onClick={onToggleCollapse}
          className="w-full justify-center p-2"
          size="sm"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navegación principal */}
      <nav className={`
        flex-1 px-2 py-4 space-y-1 overflow-y-auto
        ${isCollapsed ? 'px-1' : ''}
      `}>
        {items.map((item) => renderMenuItem(item))}
      </nav>

      {/* Botones inferiores */}
      <div className={`
        px-2 py-4 border-t border-border space-y-2
        ${isCollapsed ? 'px-1' : ''}
      `}>
        {/* Botón de tema */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={`
            w-full justify-start text-muted-foreground hover:text-foreground
            ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
          `}
          size="sm"
        >
          {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          {!isCollapsed && (
            <span className="ml-3">{theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}</span>
          )}
        </Button>
        
        {/* Botón de configuraciones */}
        {onSettings && (
          <Button
            variant="ghost"
            onClick={onSettings}
            className={`
              w-full justify-start text-muted-foreground hover:text-foreground
              ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
            `}
            size="sm"
          >
            <SettingsIcon className="w-4 h-4" />
            {!isCollapsed && <span className="ml-3">Configuraciones</span>}
          </Button>
        )}
        
        {/* Botón de cerrar sesión */}
        {onLogout && (
          <Button
            variant="ghost"
            onClick={onLogout}
            className={`
              w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
              ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
            `}
            size="sm"
          >
            <LogoutIcon className="w-4 h-4" />
            {!isCollapsed && <span className="ml-3">Cerrar sesión</span>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
