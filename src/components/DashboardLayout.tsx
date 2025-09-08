import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useUser } from '../contexts/UserContext';

import UserProfileMenu from './UserProfileMenu';
import { supabase } from '../api/supabase';
import { createClient } from '@supabase/supabase-js';
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
  UserIcon,
  SettingsIcon,
  LogoutIcon
} from './icons';
import { Button, Typography, Card } from './ui';
import PerfilPersonalModal from './usuarios/PerfilPersonalModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
  rol?: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  subMenu?: MenuItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, rol }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Inicializar el estado del sidebar solo en el cliente
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    const initialState = saved ? JSON.parse(saved) : false;
    console.log('DashboardLayout - Sidebar initial state:', initialState);
    setSidebarCollapsed(initialState);
  }, []);
  const router = useRouter();
  const { rolSeleccionado, setRolSeleccionado, rolesDisponibles } = useRol();
  const { userProfile, userEmail, userName, userImage, refreshUser } = useUser();
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
      console.log('DashboardLayout - Sidebar state saved:', sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  // La información del usuario ahora viene del UserContext (instantáneo)

  // Configuración de menús por rol (Configuraciones con submenú solo para admin)
  const menuConfig = {
    administrador: [
      { label: 'Investigaciones', href: '/investigaciones', icon: 'investigaciones' },
      { label: 'Reclutamiento', href: '/reclutamiento', icon: 'reclutamiento' },
      { label: 'Mis Asignaciones', href: '/mis-asignaciones', icon: 'sesiones' },
      { label: 'Sesiones', href: '/sesiones', icon: 'sesiones' },
      { label: 'Métricas', href: '/metricas', icon: 'metricas' },
      { label: 'Participantes', href: '/participantes', icon: 'participantes' },
      { label: 'Empresas', href: '/empresas', icon: 'empresas' },
      { label: 'Configuraciones', href: '/configuraciones', icon: 'configuraciones',
        subMenu: [
          { label: 'Gestión de Usuarios', href: '/configuraciones/gestion-usuarios', icon: 'usuarios' }
        ]
      },
      { label: 'Conocimiento', href: '/conocimiento', icon: 'conocimiento' },
    ],
    investigador: [
      { label: 'Investigaciones', href: '/investigaciones', icon: 'investigaciones' },
      { label: 'Sesiones', href: '/sesiones', icon: 'sesiones' },
      { label: 'Métricas', href: '/metricas', icon: 'metricas' },
      { label: 'Participantes', href: '/participantes', icon: 'participantes' },
      { label: 'Empresas', href: '/empresas', icon: 'empresas' },
      { label: 'Conocimiento', href: '/conocimiento', icon: 'conocimiento' },
    ],
    reclutador: [
      { label: 'Reclutamiento', href: '/reclutamiento', icon: 'reclutamiento' },
      { label: 'Participantes', href: '/participantes', icon: 'participantes' },
      { label: 'Empresas', href: '/empresas', icon: 'empresas' },
      { label: 'Configuraciones', href: '/configuraciones', icon: 'configuraciones' },
      { label: 'Conocimiento', href: '/conocimiento', icon: 'conocimiento' },
    ],
  };

  // Usar el rol del contexto si existe
  const menuRol = rolSeleccionado?.toLowerCase() || rol?.toLowerCase();
  const currentMenu = menuConfig[menuRol] || [];

  // Obtener el label del módulo activo según la ruta
  const activeMenuItem = currentMenu.find(item => item.href === router.pathname);
  const moduloLabel = activeMenuItem ? activeMenuItem.label : '';

  const isActiveLink = (href: string) => {
    // Para el dashboard, verificar si estamos en /dashboard/[rol] cuando el href es /dashboard/[rol]
    if (href.includes('/dashboard/')) {
      return router.asPath === href || router.pathname === '/dashboard/[rol]';
    }
    return router.pathname === href || router.asPath === href;
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabaseService = supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  // Función para renderizar el icono correcto según el tipo
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'dashboard':
        return <DashboardIcon className="w-6 h-6 text-muted-foreground" />;
      case 'investigaciones':
        return <InvestigacionesIcon className="w-6 h-6 text-muted-foreground" />;
      case 'reclutamiento':
        return <ReclutamientoIcon className="w-6 h-6 text-muted-foreground" />;
      case 'sesiones':
        return <SesionesIcon className="w-6 h-6 text-muted-foreground" />;
      case 'metricas':
        return <MetricasIcon className="w-6 h-6 text-muted-foreground" />;
      case 'participantes':
        return <ParticipantesIcon className="w-6 h-6 text-muted-foreground" />;
      case 'empresas':
        return <EmpresasIcon className="w-6 h-6 text-muted-foreground" />;
      case 'configuraciones':
        return <ConfiguracionesIcon className="w-6 h-6 text-muted-foreground" />;
      case 'conocimiento':
        return <ConocimientoIcon className="w-6 h-6 text-muted-foreground" />;
      case 'usuarios':
        return <UsuariosIcon className="w-6 h-6 text-muted-foreground" />;
      default:
        return <DashboardIcon className="w-6 h-6 text-muted-foreground" />;
    }
  };

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
      
      // Refrescar datos del usuario
      await refreshUser();
      
    } catch (error) {
      console.error('Error guardando perfil:', error);
      alert('Error guardando perfil: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-row">
      {/* Sidebar para móviles */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                  <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card">
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-zinc-700">
            <span className="text-base font-semibold text-title">Central de creadores</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar menú</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {currentMenu.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveLink(item.href)
                      ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-500 dark:bg-gray-700 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{renderIcon(item.icon)}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-card border-r border-slate-100 dark:border-zinc-700">
          {/* Cabecera del sidebar SIEMPRE visible */}
          <div className="flex h-16 items-center px-4 border-b border-slate-100 dark:border-zinc-700 justify-between">
            {/* Título solo si está expandido */}
            {!sidebarCollapsed && (
              <span className="text-base font-semibold text-title transition-all duration-300">Central de creadores</span>
            )}
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
                              className="ml-2 p-2 rounded hover:bg-muted text-muted-foreground focus:outline-none"
              title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
              style={{ minWidth: 40 }}
            >
              {sidebarCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          {/* Menú de navegación SIEMPRE debajo de la cabecera */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {currentMenu.map((item, index) => (
              item.subMenu ? (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveLink(item.href)
                        ? 'bg-muted text-foreground border-r-2 border-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <span className="text-base">{renderIcon(item.icon)}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                  {/* Submenú solo si no está colapsado */}
                  {!sidebarCollapsed && item.subMenu && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subMenu.map((sub, subIdx) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                            isActiveLink(sub.href)
                              ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="text-base">{renderIcon(sub.icon)}</span>
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveLink(item.href)
                      ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-500 dark:bg-gray-700 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <span className="text-base">{renderIcon(item.icon)}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            ))}
          </nav>
          {/* UserProfileMenu en la parte inferior */}
          <div className="border-t border-slate-100 dark:border-zinc-700 p-4">
            <UserProfileMenu />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header móvil */}
        <div className="lg:hidden bg-card border-b border-slate-100 dark:border-zinc-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Abrir menú</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-base font-semibold text-title">Central de creadores</span>
          <div className="w-6"></div>
        </div>

        {/* Contenido de la página */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Modal de edición de perfil */}
      <PerfilPersonalModal
        usuario={userProfile}
        isOpen={editModalOpen}
        onSave={handleSaveProfile}
        onClose={handleCloseEditModal}
      />
      
    </div>
  );
};

export default DashboardLayout; 