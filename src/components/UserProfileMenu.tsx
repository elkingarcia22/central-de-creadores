import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import { useRol } from '../contexts/RolContext';
import { useUser } from '../contexts/UserContext';
import { Button, Typography, Card, SimpleAvatar } from '../components/ui';
import { UserIcon, SettingsIcon, LogoutIcon } from '../components/icons';
import { supabase } from '../api/supabase';

export default function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { rolSeleccionado } = useRol();
  const { userEmail, userName, userImage, loading: userLoading } = useUser();
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

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('rolSeleccionado');
      localStorage.removeItem('rolesDisponibles');
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/configuraciones');
  };

  const displayName = userName || userEmail || 'Usuario';

  if (userLoading && !userEmail) {
    return (
      <div className="flex items-center space-x-2 p-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="hidden md:block">
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
        disabled={userLoading || loading}
      >
        <SimpleAvatar
          src={userImage}
          fallbackText={displayName}
          size="md"
          className="border border-gray-200 dark:border-gray-700"
        />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {displayName}
        </span>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-64 shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <SimpleAvatar
                src={userImage}
                fallbackText={displayName}
                size="lg"
                className="border border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1 min-w-0">
                <Typography variant="body2" weight="medium" className="text-gray-900 dark:text-gray-100 truncate">
                  {displayName}
                </Typography>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 truncate">
                  {userEmail}
                </Typography>
                {rolSeleccionado && (
                  <Typography variant="caption" className="text-blue-600 dark:text-blue-400 capitalize">
                    Rol: {rolSeleccionado}
                  </Typography>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            <Button
              variant="ghost"
              onClick={handleSettings}
              className="w-full justify-start text-left p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Configuraciones
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => toggleTheme()}
              className="w-full justify-start text-left p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="mr-2">🌙</span>
              {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={loading}
              className="w-full justify-start text-left p-2 h-auto text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogoutIcon className="w-4 h-4 mr-2" />
              {loading ? 'Cerrando...' : 'Cerrar sesión'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
