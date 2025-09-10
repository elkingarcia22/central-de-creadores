import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useUser } from '../../contexts/UserContext';
import { usePermisos } from '../../hooks/usePermisos';
import { InlineEditProvider } from '../../contexts/InlineEditContext';
import { GlobalTranscriptionProvider } from '../../contexts/GlobalTranscriptionContext';
import GlobalTranscriptionWrapper from '../global/GlobalTranscriptionWrapper';

import { supabase } from '../../api/supabase';
// import { createClient } from '@supabase/supabase-js'; // Removido - usar cliente existente
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import UserMenu from './UserMenu';
import MobileNavigation from './MobileNavigation';
import {
  HomeIcon,
  InvestigacionesIcon,
  ReclutamientoIcon,
  SesionesIcon,
  MetricasIcon,
  ParticipantesIcon,
  EmpresasIcon,
  ConfiguracionesIcon,
  ConocimientoIcon,
  UsuariosIcon,
  DesignSystemIcon,
  ShieldIcon
} from '../icons';
import PerfilPersonalModal from '../usuarios/PerfilPersonalModal';

export interface LayoutProps {
  children: React.ReactNode;
  rol?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, rol, className = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Iniciar contraído por defecto para evitar problemas de hidratación
  const [isClient, setIsClient] = useState(false);

  // Inicializar el estado del sidebar solo en el cliente
  useEffect(() => {
    // console.log('🔍 Layout - useEffect inicialización');
    if (!isClient) {
      setIsClient(true);
      // Limpiar localStorage para forzar estado inicial contraído
      localStorage.removeItem('sidebarCollapsed');
      // Forzar estado inicial contraído (true) para evitar problemas de hidratación
      const initialState = true;
      // console.log('Sidebar initial state:', initialState);
      setSidebarCollapsed(initialState);
    }
  }, []); // Removido isClient de las dependencias para evitar re-ejecuciones
  const router = useRouter();
  const { rolSeleccionado, setRolSeleccionado, rolesDisponibles, setRolesDisponibles } = useRol();
  const { userProfile, userEmail, userName, userImage, refreshUser } = useUser();
  const esAdministrador = () => rolSeleccionado?.toLowerCase() === 'administrador';
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Sincronizar el contexto de rol con la URL
  useEffect(() => {
    // console.log('🔍 Layout - useEffect rol:', { rol, rolSeleccionado });
    if (rol && rol !== rolSeleccionado) {
      // console.log('🔍 Layout - Cambiando rol de', rolSeleccionado, 'a', rol);
      setRolSeleccionado(rol);
    }
  }, [rol]); // Removido rolSeleccionado y setRolSeleccionado de las dependencias

  // Detectar cambios de ruta para forzar actualización
  useEffect(() => {
    // console.log('🔍 Layout - Ruta cambiada:', router.asPath);
    // Forzar re-render cuando cambia la ruta
  }, [router.asPath]);

  // Guardar el estado del sidebar en localStorage cuando cambie
  useEffect(() => {
    // console.log('🔍 Layout - useEffect sidebarCollapsed:', { sidebarCollapsed });
    if (typeof window !== 'undefined' && isClient) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
      // console.log('Sidebar state saved:', sidebarCollapsed);
    }
  }, [sidebarCollapsed]); // Removido isClient de las dependencias

  // Configuración de menús principales por rol
  const menuConfig = {
    administrador: [
      { label: 'Home', href: '/home', icon: <HomeIcon className="w-6 h-6 text-current" /> },
      { label: 'Investigaciones', href: '/investigaciones', icon: <InvestigacionesIcon className="w-6 h-6 text-current" /> },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-current" /> },
      { label: 'Sesiones', href: '/sesiones', icon: <SesionesIcon className="w-6 h-6 text-current" /> },
      { label: 'Métricas', href: '/metricas', icon: <MetricasIcon className="w-6 h-6 text-current" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-current" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-current" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-current" /> },
    ],
    investigador: [
      { label: 'Home', href: '/home', icon: <HomeIcon className="w-6 h-6 text-current" /> },
      { label: 'Investigaciones', href: '/investigaciones', icon: <InvestigacionesIcon className="w-6 h-6 text-current" /> },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-current" /> },
      { label: 'Sesiones', href: '/sesiones', icon: <SesionesIcon className="w-6 h-6 text-current" /> },
      { label: 'Métricas', href: '/metricas', icon: <MetricasIcon className="w-6 h-6 text-current" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-current" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-current" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-current" /> },
    ],
    reclutador: [
      { label: 'Home', href: '/home', icon: <HomeIcon className="w-6 h-6 text-current" /> },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-current" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-current" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-current" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-current" /> },
    ],
    agendador: [
      { label: 'Home', href: '/home', icon: <HomeIcon className="w-6 h-6 text-current" /> },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-current" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-current" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-current" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-current" /> },
    ],
  };

  // Configuración de elementos de utilidad (solo para administradores)
  const utilityItems = esAdministrador() ? [
    { 
      label: 'Configuraciones', 
      href: undefined, // Sin href para que solo despliegue el submenú
      icon: <ConfiguracionesIcon className="w-6 h-6 text-current" />,
      subMenu: [
        { label: 'Conexiones', href: '/configuraciones/conexiones', icon: <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
        { label: 'Gestión de Usuarios', href: '/configuraciones/gestion-usuarios', icon: <UsuariosIcon className="w-6 h-6 text-current" /> },
        { label: 'Roles y Permisos', href: '/configuraciones/roles-permisos', icon: <ShieldIcon className="w-6 h-6 text-current" /> }
      ]
    },
    { label: 'Sistema de Diseño', href: '/design-system', icon: <DesignSystemIcon className="w-6 h-6 text-current" /> },
  ] : [];

  // Usar el rol del contexto si existe
  const menuRol = rolSeleccionado?.toLowerCase() || rol?.toLowerCase();
  const currentMenu = menuConfig[menuRol] || [];

  // Obtener el label del módulo activo según la ruta
  const activeMenuItem = currentMenu.find(item => item.href === router.pathname);
  const moduloLabel = activeMenuItem ? activeMenuItem.label : '';

  // Usar el cliente de supabase existente en lugar de crear uno nuevo

  const handleLogout = async () => {
    try {
      // Limpiar contexto y localStorage
      localStorage.removeItem('rolSeleccionado');
      localStorage.removeItem('rolesDisponibles');
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Redirigir al login
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleEditProfile = () => setEditModalOpen(true);
  const handleCloseEditModal = () => setEditModalOpen(false);

  // Handler para navegación desde el sidebar
  const handleSidebarNavigation = (href: string | undefined) => {
    console.log('🔄 Navegando desde sidebar a:', href);
    console.log('🔄 Ruta actual:', router.asPath);
    console.log('🔄 Router ready:', router.isReady);
    
    // Si no hay href, no navegar (solo desplegar submenú)
    if (!href) {
      console.log('ℹ️ Sin href, solo desplegando submenú');
      return;
    }
    
    // Forzar la navegación
    router.push(href).then(() => {
      console.log('✅ Navegación completada a:', href);
    }).catch((error) => {
      console.error('❌ Error en navegación:', error);
    });
  };

  const handleSaveProfile = async (updated: any) => {
    try {
      // Actualizar perfil en Supabase
      const { error } = await supabase.from('profiles').update({
        full_name: updated.full_name,
        email: updated.email,
        avatar_url: updated.avatar_url
      }).eq('id', userProfile.id);
      
      if (error) {
        console.error('Error actualizando perfil:', error);
        throw error;
      }
      
      setEditModalOpen(false);
      
      // Refrescar datos del usuario usando UserContext
      await refreshUser();
      
    } catch (error) {
      console.error('Error guardando perfil:', error);
      alert('Error guardando perfil: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Crear objeto user optimizado para los menús
  const userForMenus = {
    name: userName || userEmail || 'Usuario',
    email: userEmail || '',
    avatar: userImage || undefined,
    role: rolSeleccionado || ''
  };

  return (
    <GlobalTranscriptionProvider>
      <InlineEditProvider>
        <div className={`min-h-screen bg-gray-50 dark:bg-black flex flex-row ${className}`}>
          {/* Modal de edición de perfil */}
          <PerfilPersonalModal
            usuario={userProfile}
            isOpen={editModalOpen}
            onSave={handleSaveProfile}
            onClose={handleCloseEditModal}
          />
        {/* Navegación móvil */}
        <MobileNavigation
          items={currentMenu}
          user={userForMenus}
          onItemClick={handleSidebarNavigation}
        />
        {/* Sidebar para desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex z-40">
          {isClient && (
            <Sidebar
              title="Central de creadores"
              items={currentMenu}
              utilityItems={utilityItems}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
              onItemClick={handleSidebarNavigation}
              user={userForMenus}
              onLogout={handleLogout}
              onSettings={handleEditProfile}
            />
          )}
        </div>
        {/* Contenedor derecho: solo contenido principal */}
        <div className="flex-1 flex flex-col lg:ml-16">
          {/* Contenido de la página */}
          <main className="flex-1 overflow-y-visible">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      </InlineEditProvider>
      
      {/* Componentes globales de transcripción */}
      <GlobalTranscriptionWrapper />
    </GlobalTranscriptionProvider>
  );
}; 

export { Layout };
export default Layout; 