import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useUser } from '../../contexts/UserContext';

export interface LayoutSimpleProps {
  children: React.ReactNode;
  rol?: string;
  className?: string;
}

const LayoutSimple: React.FC<LayoutSimpleProps> = ({ children, rol, className = '' }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [useEffectCount, setUseEffectCount] = useState(0);
  const router = useRouter();
  const { rolSeleccionado, setRolSeleccionado } = useRol();
  const { userProfile } = useUser();

  // Contador de renderizados
  useEffect(() => {
    console.log('🔍 LayoutSimple - Componente renderizado #', renderCount + 1);
    setRenderCount(prev => prev + 1);
  });

  // useEffect de inicialización
  useEffect(() => {
    console.log('🔍 LayoutSimple - useEffect inicialización #', useEffectCount + 1);
    setUseEffectCount(prev => prev + 1);
  }, []);

  // Sincronizar el contexto de rol con la URL
  useEffect(() => {
    console.log('🔍 LayoutSimple - useEffect rol:', { rol, rolSeleccionado, timestamp: Date.now() });
    if (rol && rol !== rolSeleccionado) {
      console.log('🔍 LayoutSimple - Cambiando rol de', rolSeleccionado, 'a', rol);
      setRolSeleccionado(rol);
    }
  }, [rol]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-black flex flex-row ${className}`}>
      {/* Sidebar simplificado */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-semibold">Central de creadores</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Rol: {rolSeleccionado || rol}
              </div>
              <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Usuario: {userProfile?.full_name || 'No disponible'}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenedor derecho */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header simplificado */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Test Layout Simple
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Renderizados: {renderCount} | useEffect: {useEffectCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutSimple;
