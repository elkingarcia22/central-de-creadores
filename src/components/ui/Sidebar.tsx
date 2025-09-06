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
  utilityItems?: SidebarItem[];
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
  utilityItems = [],
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
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Delay para la expansión
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isHovered) {
      timeoutId = setTimeout(() => {
        setIsExpanded(true);
      }, 300); // 300ms de delay antes de expandir
    } else {
      setIsExpanded(false); // Colapsar inmediatamente al quitar el hover
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isHovered]);

  return (
    <div 
      className={`flex flex-col flex-grow bg-card border-r border-slate-100 dark:border-zinc-700 h-screen min-h-0 transition-all duration-500 ease-in-out ${isExpanded ? 'w-64' : 'w-16'} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col items-center justify-center py-6 px-2 border-b border-slate-100 dark:border-zinc-700 transition-all duration-500 ease-in-out ${isExpanded ? '' : 'py-4 px-1'} relative`}>
        
        <Tooltip content="Configuraciones del perfil" position="bottom" delay={200}>
          <div>
            <SimpleAvatar
              src={user?.avatar}
              fallbackText={displayName}
              size={isExpanded ? "xl" : "lg"}
              className="border-2 border-slate-100 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-all duration-500 ease-in-out"
              onClick={onSettings}
            />
          </div>
        </Tooltip>
        
        {/* Selector de rol siempre visible */}
        {user && (
          <div className={`mt-3 text-center w-full flex flex-col items-center ${isExpanded ? '' : 'mt-2'}`}>
            {isExpanded && (
              <Typography variant="body2" weight="medium" className="text-foreground truncate">
                {displayName}
              </Typography>
            )}
            <RolSelector variant="sidebar" className="text-muted-foreground" isCollapsed={!isExpanded} />
          </div>
        )}
      </div>

      <nav className={`flex-1 px-2 py-4 space-y-2 ${isExpanded ? '' : 'px-1'}`}>
        {items.map((item) => {
          const navItem = (
            <NavigationItem
              {...item}
              isCollapsed={!isExpanded}
              onClick={() => onItemClick?.(item.href)}
            />
          );

          // Solo usar tooltip cuando está contraído
          if (!isExpanded) {
            return (
              <Tooltip 
                key={item.href}
                content={item.label} 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div key={item.href}>{navItem}</div>;
        })}
      </nav>

      <div className={`px-2 py-4 border-t border-slate-100 dark:border-zinc-700 space-y-2 ${isExpanded ? '' : 'px-1'}`}>
        {/* Elementos de utilidad */}
        {utilityItems.map((item) => {
          const navItem = (
            <NavigationItem
              {...item}
              isCollapsed={!isExpanded}
              onClick={() => onItemClick?.(item.href)}
            />
          );

          if (!isExpanded) {
            return (
              <Tooltip 
                key={item.href}
                content={item.label} 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div key={item.href}>{navItem}</div>;
        })}

        {/* Configuraciones del perfil - Removido, ahora está en el avatar */}

        {/* Tema */}
        {(() => {
          const navItem = (
            <NavigationItem
              label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
              href="#"
              icon={theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              isCollapsed={!isExpanded}
              onClick={toggleTheme}
              asButton={true}
            />
          );

          if (!isExpanded) {
            return (
              <Tooltip 
                content={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div>{navItem}</div>;
        })()}
        
        {/* Cerrar sesión */}
        {onLogout && (() => {
          const navItem = (
            <NavigationItem
              label="Cerrar sesión"
              href="#"
              icon={<LogoutIcon className="w-6 h-6" />}
              isCollapsed={!isExpanded}
              onClick={onLogout}
              asButton={true}
              className="text-red-500 hover:text-red-600"
            />
          );

          if (!isExpanded) {
            return (
              <Tooltip 
                content="Cerrar sesión" 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div>{navItem}</div>;
        })()}
      </div>
    </div>
  );
}; 

export default Sidebar;
