import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { NavigationItem } from './NavigationItem';
import Typography from './Typography';
import { RolSelector } from './RolSelector';
import SimpleAvatar from './SimpleAvatar';
import Button from './Button';
import { SunIcon, MoonIcon, SettingsIcon, LogoutIcon } from '../icons';

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

  return (
    <div className={`flex flex-col flex-grow bg-card border-r border-slate-200 dark:border-zinc-700 h-screen min-h-0 ${className}`}>
      <div className={`flex flex-col items-center justify-center py-6 px-2 border-b border-slate-200 dark:border-zinc-700 transition-all duration-300 ${isCollapsed ? 'py-4' : ''}`}>
        <SimpleAvatar
          src={user?.avatar}
          fallbackText={displayName}
          size="xl"
          className="border-2 border-slate-200 dark:border-zinc-700"
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

      <nav className={`flex-1 px-2 py-4 space-y-2 ${isCollapsed ? 'px-1' : ''}`}>
        {items.map((item) => (
          <NavigationItem
            key={item.href}
            {...item}
            isCollapsed={isCollapsed}
            onClick={() => onItemClick?.(item.href)}
          />
        ))}
      </nav>

      <div className={`px-2 py-4 border-t border-slate-200 dark:border-zinc-700 space-y-2 ${isCollapsed ? 'px-1' : ''}`}>
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
        >
          {theme === 'dark' ? <SunIcon className="w-4 h-4 flex-shrink-0" /> : <MoonIcon className="w-4 h-4 flex-shrink-0" />}
          {!isCollapsed && <span className="ml-2.5">{theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}</span>}
        </Button>
        
        {onSettings && (
          <Button
            variant="ghost"
            onClick={onSettings}
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
          >
            <SettingsIcon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2.5">Configuraciones</span>}
          </Button>
        )}
        
        {onLogout && (
          <Button
            variant="ghost"
            onClick={onLogout}
            className={`w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${isCollapsed ? 'px-2' : 'px-3'}`}
          >
            <LogoutIcon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2.5">Cerrar sesión</span>}
          </Button>
        )}
      </div>
    </div>
  );
}; 

export default Sidebar; 