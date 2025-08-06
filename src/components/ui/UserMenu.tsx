import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import Typography from './Typography';
import Card from './Card';
import { UserIcon, SettingsIcon, LogoutIcon } from '../icons';

export interface UserMenuProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
  onSettings?: () => void;
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onLogout,
  onSettings,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    if (onSettings) {
      onSettings();
    } else {
      router.push('/configuraciones');
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
          }`}>
            <UserIcon className="w-4 h-4" />
          </div>
        )}
        <div className="hidden md:block text-left">
          <Typography variant="body2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            {user.name || user.email}
          </Typography>
          {user.role && (
            <Typography variant="caption" color="secondary" className="capitalize">
              {user.role}
            </Typography>
          )}
        </div>
      </button>

      {isOpen && (
        <Card 
          variant="elevated" 
          padding="md" 
          className="absolute right-0 mt-2 w-64 z-50"
        >
          <div className="space-y-3">
            {/* Información del usuario */}
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
              <div>
                <Typography variant="subtitle2" weight="medium" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {user.name || user.email}
                </Typography>
                {user.role && (
                  <Typography variant="caption" color="secondary" className="capitalize">
                    {user.role}
                  </Typography>
                )}
              </div>
            </div>

            {/* Opciones del menú */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettings}
                fullWidth
                className="justify-start"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Configuraciones
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                fullWidth
                className="justify-start"
              >
                {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
              </Button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-start px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors duration-200"
              >
                <LogoutIcon className="w-4 h-4 mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}; 

export default UserMenu; 