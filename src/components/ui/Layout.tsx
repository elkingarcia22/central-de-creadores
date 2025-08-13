import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../../contexts/RolContext';
import { useUser } from '../../contexts/UserContext';
import { usePermisos } from '../../utils/permisosUtils';

import { supabase } from '../../api/supabase';
// import { createClient } from '@supabase/supabase-js'; // Removido - usar cliente existente
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import UserMenu from './UserMenu';
import MobileNavigation from './MobileNavigation';
import {
  DashboardIcon,
  InvestigacionesIcon,
  ReclutamientoIcon,
  SesionesIcon,
  MetricasIcon,
  ParticipantesIcon,
  EmpresasIcon,
  ConfiguracionesIcon,
  ConocimientoIcon,
  UsuariosIcon,
  DesignSystemIcon
} from '../icons';
import PerfilPersonalModal from '../usuarios/PerfilPersonalModal';

export interface LayoutProps {
  children: React.ReactNode;
  rol?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, rol, className = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Inicializar el estado del sidebar solo en el cliente
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    const initialState = saved ? JSON.parse(saved) : false;
    console.log('Sidebar initial state:', initialState);
    setSidebarCollapsed(initialState);
  }, []);
  const router = useRouter();
  const { rolSeleccionado, setRolSeleccionado, rolesDisponibles, setRolesDisponibles } = useRol();
  const { userProfile, userEmail, userName, userImage, refreshUser } = useUser();
  const { esAdministrador } = usePermisos();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Sincronizar el contexto de rol con la URL
  useEffect(() => {
    if (rol && rol !== rolSeleccionado) {
      setRolSeleccionado(rol);
    }
  }, [rol, rolSeleccionado, setRolSeleccionado]);

  // Guardar el estado del sidebar en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
      console.log('Sidebar state saved:', sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  // Configuración de menús principales por rol
  const menuConfig = {
    administrador: [
      { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Investigaciones', href: '/investigaciones', icon: <InvestigacionesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Sesiones', href: '/sesiones', icon: <SesionesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Métricas', href: '/metricas', icon: <MetricasIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-muted-foreground" /> },
    ],
    investigador: [
      { label: 'Investigaciones', href: '/investigaciones', icon: <InvestigacionesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Sesiones', href: '/sesiones', icon: <SesionesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Métricas', href: '/metricas', icon: <MetricasIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-muted-foreground" /> },
    ],
    reclutador: [
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-muted-foreground" /> },
    ],
    agendador: [
      { label: 'Reclutamiento', href: '/reclutamiento', icon: <ReclutamientoIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Participantes', href: '/participantes', icon: <ParticipantesIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Empresas', href: '/empresas', icon: <EmpresasIcon className="w-6 h-6 text-muted-foreground" /> },
      { label: 'Conocimiento', href: '/conocimiento', icon: <ConocimientoIcon className="w-6 h-6 text-muted-foreground" /> },
    ],
  };

  // Configuración de elementos de utilidad (solo para administradores)
  const utilityItems = esAdministrador() ? [
    { 
      label: 'Configuraciones', 
      href: '/configuraciones', 
      icon: <ConfiguracionesIcon className="w-6 h-6 text-muted-foreground" />,
      subMenu: [
        { label: 'Gestión de Usuarios', href: '/configuraciones/gestion-usuarios', icon: <UsuariosIcon className="w-6 h-6 text-muted-foreground" /> }
      ]
    },
    { label: 'Sistema de Diseño', href: '/design-system', icon: <DesignSystemIcon className="w-6 h-6 text-muted-foreground" /> },
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
      />
      {/* Sidebar para desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <Sidebar
          title="Central de creadores"
          items={currentMenu}
          utilityItems={utilityItems}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          user={userForMenus}
          onLogout={handleLogout}
          onSettings={handleEditProfile}
        />
      </div>
      {/* Contenedor derecho: solo contenido principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 

export { Layout }; 