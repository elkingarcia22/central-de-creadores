import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  InvestigacionesIcon,
  DocumentIcon,
  ConfiguracionesIcon
} from './icons';

interface BottomNavProps {
  userName?: string;
  userEmail: string;
  userImage?: string;
  roles: string[];
}

const BottomNav: React.FC<BottomNavProps> = ({ userName, userEmail, userImage, roles }) => {
  const router = useRouter();
  const { rolSeleccionado, setRolSeleccionado } = useRol();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Función para obtener el módulo principal de cada rol
  const getMainModuleForRole = (roleName: string): string => {
    const rolNormalizado = roleName.toLowerCase();
    switch (rolNormalizado) {
      case 'administrador':
        return '/investigaciones'; // Módulo principal para administrador
      case 'investigador':
        return '/investigaciones'; // Módulo principal para investigador
      case 'reclutador':
        return '/reclutamiento'; // Módulo principal para reclutador
      default:
        return `/dashboard/${rolNormalizado}`; // Fallback al dashboard específico
    }
  };

  const handleRoleChange = (rol: string) => {
    setRolSeleccionado(rol);
    setDropdownOpen(false);
    // Redirigir al módulo principal del rol seleccionado
    const mainModule = getMainModuleForRole(rol);
    console.log('BottomNav - Redirigiendo al módulo principal:', mainModule);
    router.push(mainModule);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700  flex items-center justify-between px-4 py-2 md:px-8 md:py-3">
      {/* Perfil y dropdown de rol */}
      <div className="flex items-center space-x-3">
        <img
          src={userImage || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'}
          alt="Foto de perfil"
          className="w-9 h-9 rounded-full object-cover border border-gray-200 "
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate max-w-[90px]">
            {userName || userEmail}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-300 truncate max-w-[90px]">
            {userEmail}
          </span>
        </div>
        {/* Dropdown de roles */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-700 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            {rolSeleccionado || 'Rol'}
            <svg className="inline ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md  z-50">
              {roles.map((rol) => (
                <button
                  key={rol}
                  onClick={() => handleRoleChange(rol)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${rolSeleccionado === rol ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {rol.charAt(0).toUpperCase() + rol.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de navegación principales */}
      <div className="flex items-center space-x-6 md:space-x-8">
        <button className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none">
                        <HomeIcon className="text-lg mb-0.5 text-gray-500 dark:text-gray-200" />
          Dashboard
        </button>
        <button className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none">
                        <InvestigacionesIcon className="text-lg mb-0.5 text-gray-500 dark:text-gray-200" />
          Investigación
        </button>
        <button className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none">
                        <DocumentIcon className="text-lg mb-0.5 text-gray-500 dark:text-gray-200" />
          Publicaciones
        </button>
        <button className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none">
                        <ConfiguracionesIcon className="text-lg mb-0.5 text-gray-500 dark:text-gray-200" />
          Configuración
        </button>
      </div>

      {/* Toggle de tema */}
      <div className="flex items-center ml-2">
        <span className="text-xs text-gray-500 dark:text-gray-300 mr-1">{theme === 'dark' ? '🌙' : '☀️'}</span>
        <button
          onClick={toggleTheme}
          className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </nav>
  );
};

export default BottomNav; 