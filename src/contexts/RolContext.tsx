import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';

interface RolContextType {
  rolSeleccionado: string;
  setRolSeleccionado: (rol: string) => void;
  rolesDisponibles: string[];
  setRolesDisponibles: (roles: string[]) => void;
  limpiarRol: () => void;
  loading: boolean;
}

const RolContext = createContext<RolContextType | undefined>(undefined);

interface RolProviderProps {
  children: ReactNode;
}

export const RolProvider: React.FC<RolProviderProps> = ({ children }) => {
  const [rolSeleccionado, setRolSeleccionadoState] = useState<string>('');
  const [rolesDisponibles, setRolesDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Usar UserContext de manera segura
  const { userProfile, loading: userLoading, error: userError } = useUser();

  // Cargar roles desde UserContext cuando esté disponible
  useEffect(() => {
    // Solo procesar si no hay errores de usuario y tenemos datos válidos
    if (!userLoading && !userError && userProfile && userProfile.user_roles) {
      try {
        const rolesDelUsuario = userProfile.user_roles
          .map((ur: any) => ur.roles_plataforma?.nombre || ur.role)
          .filter((rol: string) => rol && rol !== 'usuario');
        
        if (rolesDelUsuario.length > 0) {
          setRolesDisponibles(rolesDelUsuario);
          localStorage.setItem('rolesDisponibles', JSON.stringify(rolesDelUsuario));
        }
      } catch (error) {
        console.warn('RolContext - Error procesando roles del usuario:', error);
      }
    }
  }, [userProfile, userLoading, userError]);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const cargarEstado = () => {
      try {
        // Cargar roles desde localStorage si no están disponibles desde UserContext
        if (!userProfile) {
          const storedRoles = localStorage.getItem('rolesDisponibles');
          if (storedRoles) {
            try {
              const parsed = JSON.parse(storedRoles);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRolesDisponibles(parsed);
              } else {
                localStorage.removeItem('rolesDisponibles');
              }
            } catch (parseError) {
              localStorage.removeItem('rolesDisponibles');
            }
          }
        }

        // Cargar rol seleccionado
        const storedRol = localStorage.getItem('rolSeleccionado');
        if (storedRol) {
          try {
            const parsedRol = JSON.parse(storedRol);
            if (typeof parsedRol === 'string' && parsedRol.length > 0) {
              setRolSeleccionadoState(parsedRol);
            } else {
              localStorage.removeItem('rolSeleccionado');
            }
          } catch (parseError) {
            if (typeof storedRol === 'string' && storedRol.length > 0) {
              setRolSeleccionadoState(storedRol);
              localStorage.setItem('rolSeleccionado', JSON.stringify(storedRol));
            } else {
              localStorage.removeItem('rolSeleccionado');
            }
          }
        }
      } catch (e) {
        localStorage.removeItem('rolesDisponibles');
        localStorage.removeItem('rolSeleccionado');
      } finally {
        setLoading(false);
      }
    };

    cargarEstado();
  }, []);

  // Guardar rolSeleccionado en localStorage cada vez que cambia
  useEffect(() => {
    if (rolSeleccionado) {
      localStorage.setItem('rolSeleccionado', JSON.stringify(rolSeleccionado));
    }
  }, [rolSeleccionado]);

  // Setter que actualiza estado y localStorage
  const setRolSeleccionado = (rol: string) => {
    setRolSeleccionadoState(rol);
    localStorage.setItem('rolSeleccionado', JSON.stringify(rol));
  };

  const limpiarRol = () => {
    setRolSeleccionadoState('');
    setRolesDisponibles([]);
    setLoading(false);
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rolesDisponibles');
      localStorage.removeItem('rolSeleccionado');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.expires_at');
      localStorage.removeItem('supabase.auth.refresh_token');
    }
  };

  const value: RolContextType = {
    rolSeleccionado,
    setRolSeleccionado,
    rolesDisponibles,
    setRolesDisponibles,
    limpiarRol,
    loading,
  };

  return (
    <RolContext.Provider value={value}>
      {children}
    </RolContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useRol = (): RolContextType => {
  const context = useContext(RolContext);
  if (context === undefined) {
    throw new Error('useRol debe ser usado dentro de un RolProvider');
  }
  return context;
};

export default RolContext; 