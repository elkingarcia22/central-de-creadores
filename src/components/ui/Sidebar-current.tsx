import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { NavigationItem } from './NavigationItem';
import Typography from './Typography';
import { RolSelector } from './RolSelector';
import SimpleAvatar from './SimpleAvatar';
import Button from './Button';
import Tooltip from './Tooltip';
import { SunIcon, MoonIcon, SettingsIcon, LogoutIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface SidebarUser {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
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
  const displayName = user?.name || user?.email || 'Usuario';

  // Función para renderizar NavigationItem con o sin tooltip
  const renderNavigationItem = (item: SidebarItem, key: string) => {
    const navItem = (
      <NavigationItem
        {...item}
        isCollapsed={isCollapsed}
        onClick={() => onItemClick?.(item.href)}
      />
    );

    // Solo usar tooltip cuando está contraído
    if (isCollapsed) {
      return (
        <Tooltip 
          key={key}
          content={item.label} 
          position="right"
          delay={200}
        >
          {navItem}
        </Tooltip>
      );
    }

    return <div key={key}>{navItem}</div>;
  };

  // Función para renderizar NavigationItem de acciones con o sin tooltip
  const renderActionItem = (
    label: string,
    href: string,
    icon: React.ReactNode,
    onClick: () => void,
    className?: string,
    asButton = false
  ) => {
    const navItem = (
      <NavigationItem
        label={label}
        href={href}
        icon={icon}
        isCollapsed={isCollapsed}
        onClick={onClick}
        asButton={asButton}
        className={className}
      />
    );

    // Solo usar tooltip cuando está contraído
    if (isCollapsed) {
      return (
        <Tooltip 
          content={label} 
          position="right"
          delay={200}
        >
          {navItem}
        </Tooltip>
      );
    }

    return <div>{navItem}</div>;
  };

  return (
    <div className={`flex flex-col flex-grow bg-card border-r border-slate-200 dark:border-zinc-700 h-screen min-h-0 ${className}`}>
      <div className={`flex flex-col items-center justify-center py-6 px-2 border-b border-slate-200 dark:border-zinc-700 transition-all duration-300 ${isCollapsed ? 'py-4' : ''} relative`}>
        {/* Botón de colapsar/expandir en la esquina superior derecha */}
        {onToggleCollapse && (
          <Tooltip content={isCollapsed ? 'Expandir menú' : 'Colapsar menú'} position="bottom">
            <button
              onClick={onToggleCollapse}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </Tooltip>
        )}
        
        <SimpleAvatar
          src={user?.avatar}
          fallbackText={displayName}
          size="xl"
          className="border-2 border-slate-200 dark:border-zinc-700"
        />
        
        {/* Selector de rol siempre visible */}
        {user && (
          <div className={`mt-3 text-center w-full flex flex-col items-center ${isCollapsed ? 'mt-2' : ''}`}>
            {!isCollapsed && (
              <Typography variant="body2" weight="medium" className="text-foreground truncate">
                {displayName}
              </Typography>
            )}
            <RolSelector variant="sidebar" className="text-muted-foreground" isCollapsed={isCollapsed} />
          </div>
        )}
      </div>

      <nav className={`flex-1 px-2 py-4 space-y-2 ${isCollapsed ? 'px-1' : ''}`}>
        {items.map((item) => renderNavigationItem(item, item.href))}
      </nav>

      <div className={`px-2 py-4 border-t border-slate-200 dark:border-zinc-700 space-y-2 ${isCollapsed ? 'px-1' : ''}`}>
        {renderActionItem(
          theme === 'dark' ? 'Tema claro' : 'Tema oscuro',
          '#',
          theme === 'dark' ? <SunIcon className="w-6 h-6 text-muted-foreground" /> : <MoonIcon className="w-6 h-6 text-muted-foreground" />,
          toggleTheme,
          undefined,
          true
        )}
        
        {onSettings && renderActionItem(
          'Configuraciones',
          '#',
          <SettingsIcon className="w-6 h-6 text-muted-foreground" />,
          onSettings,
          undefined,
          true
        )}
        
        {onLogout && renderActionItem(
          'Cerrar sesión',
          '#',
          <LogoutIcon className="w-6 h-6 text-red-600" />,
          onLogout,
          'text-red-600 hover:text-red-700',
          true
        )}
      </div>
    </div>
  );
}; 

export default Sidebar;
