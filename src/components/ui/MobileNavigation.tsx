import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useRol } from '../../contexts/RolContext';
import Typography from './Typography';
import Button from './Button';
import { RolSelector } from './RolSelector';
import SimpleAvatar from './SimpleAvatar';
import { 
  HomeIcon, 
  SunIcon, 
  MoonIcon, 
  MenuIcon, 
  CloseIcon, 
  LogoutIcon,
  SettingsIcon,
  ChevronRightIcon 
} from '../icons';
import { supabase } from '../../api/supabase';

interface MobileNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface MobileUser {
  name?: string;
  email?: string;
  avatar?: string;
}

interface MobileNavigationProps {
  items: MobileNavItem[];
  user?: MobileUser;
  onItemClick?: (href: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  user,
  onItemClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { rolSeleccionado } = useRol();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('rolSeleccionado');
      localStorage.removeItem('rolesDisponibles');
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleItemClick = (href: string) => {
    setIsOpen(false);
    if (onItemClick) {
      onItemClick(href);
    } else {
      router.push(href);
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/configuraciones');
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Typography variant="h6" className="font-bold text-foreground">
            Central de creadores
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="p-2"
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-80 bg-card border-r border-border ">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Typography variant="h6" className="font-bold text-foreground">
                  Central de creadores
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <CloseIcon className="w-5 h-5" />
                </Button>
              </div>

              {user && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <SimpleAvatar
                      src={user?.avatar}
                      fallbackText={user?.name || user?.email || 'Usuario'}
                      size="lg"
                      className="border-2 border-white/20"
                    />
                    <div className="flex-1">
                      <Typography variant="body2" weight="medium" className="text-foreground">
                        {user?.name || user?.email || 'Usuario'}
                      </Typography>
                      <RolSelector variant="mobile" />
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex-1 px-4 py-2 space-y-1">
                {items.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => handleItemClick(item.href)}
                    className={`w-full justify-start px-3 py-2 ${item.isActive ? 'bg-accent' : ''}`}
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.label}
                    <ChevronRightIcon className="w-4 h-4 ml-auto" />
                  </Button>
                ))}
              </nav>

              <div className="p-4 border-t border-border space-y-2">
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="w-full justify-start px-3 py-2"
                >
                  {theme === 'dark' ? <SunIcon className="w-4 h-4 mr-3" /> : <MoonIcon className="w-4 h-4 mr-3" />}
                  {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleSettings}
                  className="w-full justify-start px-3 py-2"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Configuraciones
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogoutIcon className="w-4 h-4 mr-3" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 

export default MobileNavigation; 