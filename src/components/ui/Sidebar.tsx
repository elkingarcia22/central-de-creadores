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
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  subMenu?: SidebarItem[];
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
  onItemClick?: (href: string | undefined) => void;
  className?: string;
  user?: SidebarUser;
  onLogout?: () => void;
  onSettings?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  title = 'Central de creadores',
  items,
  utilityItems = [],
  isCollapsed = false, // Cambiar por defecto a false (expandido)
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
  
  // Estado de expansión basado en isCollapsed y hover
  const isExpanded = isCollapsed ? isHovered : true;

  return (
    <div 
      className={`flex flex-col flex-grow bg-zinc-900 border-r border-zinc-700 h-screen min-h-0 transition-all duration-300 ease-out ${isExpanded ? 'w-72' : 'w-20'} z-50 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col items-center justify-center border-b border-zinc-700 transition-all duration-200 ease-out ${isExpanded ? 'py-6 px-4' : 'py-4 px-2'} relative`}>
        
        <Tooltip content="Configuraciones del perfil" position="bottom" delay={200}>
          <div className={`transition-transform duration-300 ease-out ${isExpanded ? 'delay-100' : 'delay-0'}`}>
            <SimpleAvatar
              src={user?.avatar}
              fallbackText={displayName}
              size="xl"
              className={`border-2 border-slate-100 dark:border-zinc-700 cursor-pointer hover:opacity-80 ${isExpanded ? 'scale-100' : 'scale-75'}`}
              onClick={onSettings}
            />
          </div>
        </Tooltip>
        
        {/* Selector de rol siempre visible */}
        {user && (
          <div className={`text-center w-full flex flex-col items-center transition-all duration-300 ease-out ${isExpanded ? 'mt-3 delay-150' : 'mt-2 delay-0'}`}>
            <div className={`transition-all duration-300 ease-out ${isExpanded ? 'opacity-100 max-h-6 delay-200' : 'opacity-0 max-h-0 overflow-hidden delay-0'}`}>
              <Typography variant="body2" weight="medium" className="text-white truncate">
                {displayName}
              </Typography>
            </div>
            <RolSelector variant="sidebar" className="text-gray-200" isCollapsed={!isExpanded} />
          </div>
        )}
      </div>

      <nav className={`flex-1 py-4 space-y-2 transition-all duration-200 ease-out overflow-hidden ${isExpanded ? 'px-4 delay-50' : 'px-2 delay-0'}`}>
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
                key={`tooltip-${item.href}`}
                content={item.label} 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div key={`nav-${item.href}`}>{navItem}</div>;
        })}
      </nav>

      <div className={`py-4 border-t border-zinc-700 space-y-2 transition-all duration-200 ease-out overflow-hidden ${isExpanded ? 'px-4 delay-50' : 'px-2 delay-0'}`}>
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
                key={`utility-tooltip-${item.href}`}
                content={item.label} 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div key={`utility-nav-${item.href}`}>{navItem}</div>;
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
                key="theme-tooltip"
                content={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div key="theme-nav">{navItem}</div>;
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
                key="logout-tooltip"
                content="Cerrar sesión" 
                position="right"
                delay={200}
              >
                {navItem}
              </Tooltip>
            );
          }

          return <div key="logout-nav">{navItem}</div>;
        })()}
      </div>
    </div>
  );
}; 

export default Sidebar;
