import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '../api/supabase';
import { withTimeoutFallback } from '../utils/timeout';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  user_roles?: any[];
}

interface UserContextType {
  userProfile: UserProfile | null;
  userEmail: string;
  userName: string;
  userImage: string | undefined;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateAvatar: (newAvatarUrl: string) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Computed values memoizados para evitar re-renderizados
  const userEmail = useMemo(() => userProfile?.email || '', [userProfile?.email]);
  const userName = useMemo(() => userProfile?.full_name || userProfile?.email || '', [userProfile?.full_name, userProfile?.email]);
  
  // userImage ultra-estable - solo cambia cuando hay un avatar_url válido y diferente
  const userImage = useMemo(() => {
    if (!userProfile?.avatar_url) {
      return undefined;
    }
    
    // Verificar que sea string válido
    const avatarUrl = typeof userProfile.avatar_url === 'string' ? userProfile.avatar_url.trim() : '';
    return avatarUrl.length > 0 ? avatarUrl : undefined;
  }, [userProfile?.avatar_url]);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar sesión con timeout reducido para mejor respuesta
      const sessionResult = await withTimeoutFallback(
        supabase.auth.getSession(),
        5000
      );

      if (!sessionResult || typeof sessionResult !== 'object') {
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        setError(null);
        return;
      }

      const { data, error: sessionError } = sessionResult as any;
      const session = data?.session;
      
      if (sessionError) {
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        setError(null);
        return;
      }

      if (!session?.user) {
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        setError(null);
        return;
      }

      const user = session.user;
      setIsAuthenticated(true);

      // Cargar datos completos de una vez para evitar cambios visuales
      try {
        const [profileResult, rolesResult] = await Promise.allSettled([
          supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', user.id)
            .single(),
          supabase
            .from('user_roles')
            .select('role, roles_plataforma(nombre)')
            .eq('user_id', user.id)
        ]);

        // Construir perfil final con datos de la base de datos o metadata como fallback
        let finalProfile: UserProfile;

        if (profileResult.status === 'fulfilled' && profileResult.value.data) {
          const profileData = profileResult.value.data;
          finalProfile = {
            id: user.id,
            email: profileData.email || user.email || '',
            full_name: profileData.full_name || user.user_metadata?.full_name || user.email || '',
            avatar_url: profileData.avatar_url?.trim() || user.user_metadata?.avatar_url || undefined,
            user_roles: []
          };
        } else {
          // Fallback a metadata si no hay datos en profiles
          finalProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || '',
            avatar_url: user.user_metadata?.avatar_url || undefined,
            user_roles: []
          };
        }

        // Agregar roles si están disponibles
        if (rolesResult.status === 'fulfilled' && rolesResult.value.data) {
          finalProfile.user_roles = rolesResult.value.data;
        }

        // Establecer perfil final de una vez
        setUserProfile(finalProfile);
        setLoading(false);
        setError(null);

      } catch (backgroundError) {
        console.warn('Error cargando datos completos del usuario:', backgroundError);
        
        // Fallback a datos básicos si falla la carga completa
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          avatar_url: user.user_metadata?.avatar_url || undefined,
          user_roles: []
        };
        
        setUserProfile(fallbackProfile);
        setLoading(false);
        setError(null);
      }

    } catch (error) {
      console.error('Error en loadUserData:', error);
      setUserProfile(null);
      setIsAuthenticated(false);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Optimizar updateUserProfile para evitar cambios innecesarios
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(currentProfile => {
      if (!currentProfile) return currentProfile;
      
      // Verificar si realmente hay cambios
      const hasRealChanges = Object.keys(updates).some(key => {
        const newValue = updates[key as keyof UserProfile];
        const currentValue = currentProfile[key as keyof UserProfile];
        
        // Para avatar_url, normalizar valores vacíos
        if (key === 'avatar_url') {
          const normalizedNew = typeof newValue === 'string' ? newValue.trim() || undefined : newValue;
          const normalizedCurrent = typeof currentValue === 'string' ? currentValue.trim() || undefined : currentValue;
          return normalizedNew !== normalizedCurrent;
        }
        
        return newValue !== currentValue;
      });
      
      if (!hasRealChanges) {
        return currentProfile;
      }
      
      const updatedProfile = { ...currentProfile, ...updates };
      
      // Normalizar avatar_url
      if (updates.avatar_url !== undefined) {
        updatedProfile.avatar_url = typeof updates.avatar_url === 'string' ? updates.avatar_url.trim() || undefined : updates.avatar_url;
      }
      
      return updatedProfile;
    });
  }, []);

  // Función específica para actualizar avatar con cache busting estable
  const updateAvatar = useCallback((newAvatarUrl: string) => {
    setUserProfile(currentProfile => {
      if (!currentProfile) return currentProfile;
      
      const normalizedNewUrl = newAvatarUrl?.trim();
      if (!normalizedNewUrl) return currentProfile;
      
      const currentUrl = typeof currentProfile.avatar_url === 'string' ? currentProfile.avatar_url.trim() : '';
      
      // Solo actualizar si la URL base es diferente (ignorar parámetros de cache)
      const newUrlBase = normalizedNewUrl.split('?')[0];
      const currentUrlBase = currentUrl?.split('?')[0];
      
      if (newUrlBase === currentUrlBase) {
        // Solo actualizar los parámetros de cache si la URL base es la misma
        return {
          ...currentProfile,
          avatar_url: `${newUrlBase}?v=${Date.now()}`
        };
      }
      
      return {
        ...currentProfile,
        avatar_url: `${normalizedNewUrl}?v=${Date.now()}`
      };
    });
  }, []);

  // Inicializar cuando el componente se monta
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      setIsInitialized(true);
      
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login';
      
      if (isLoginPage) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setIsAuthenticated(!!session?.user);
          setLoading(false);
        }).catch(() => {
          setIsAuthenticated(false);
          setLoading(false);
        });
      } else {
        loadUserData();
      }
      
      // Prevenir reseteo del estado al cambiar pestañas
      const handleVisibilityChange = () => {
        // No hacer nada cuando cambia la visibilidad para mantener estado estable
      };
      
      const handleFocus = () => {
        // No recargar automáticamente en focus para evitar parpadeo
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    } else if (typeof window === 'undefined') {
      setLoading(false);
      setUserProfile(null);
      setIsAuthenticated(false);
    }
  }, [isInitialized, loadUserData]);

  // Escuchar cambios de autenticación con debounce para evitar múltiples cargas
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Verificar si Supabase está disponible
    if (!supabase) {
      console.warn('⚠️ Supabase no disponible en UserContext');
      return;
    }

    let debounceTimeout: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        // Limpiar timeout anterior
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        
        // Debounce para evitar múltiples cargas rápidas
        debounceTimeout = setTimeout(async () => {
          if (event === 'SIGNED_IN' && session?.user) {
            setIsAuthenticated(true);
            await loadUserData();
          } else if (event === 'SIGNED_OUT') {
            setUserProfile(null);
            setIsAuthenticated(false);
            setLoading(false);
            setError(null);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            setIsAuthenticated(true);
            if (!userProfile || userProfile.id !== session.user.id) {
              await loadUserData();
            }
          } else if (event === 'INITIAL_SESSION' && session?.user) {
            setIsAuthenticated(true);
            if (!userProfile) {
              await loadUserData();
            }
          }
        }, 100); // Debounce de 100ms
      }
    );

    return () => {
      subscription.unsubscribe();
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [loadUserData, userProfile]);

  // Memoizar el valor del contexto para evitar re-renderizados innecesarios
  const value: UserContextType = useMemo(() => ({
    userProfile,
    userEmail,
    userName,
    userImage,
    loading,
    error,
    refreshUser,
    updateUserProfile,
    updateAvatar,
    isAuthenticated
  }), [userProfile, userEmail, userName, userImage, loading, error, refreshUser, updateUserProfile, updateAvatar, isAuthenticated]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 