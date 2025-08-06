import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../api/supabase';

interface FastUserContextType {
  userEmail: string;
  userName: string;
  userImage: string | undefined;
  userId: string | null;
  loading: boolean;
  isReady: boolean;
  isAuthenticated: boolean;
}

const FastUserContext = createContext<FastUserContextType | undefined>(undefined);

export const useFastUser = () => {
  const context = useContext(FastUserContext);
  if (context === undefined) {
    throw new Error('useFastUser debe ser usado dentro de un FastUserProvider');
  }
  return context;
};

interface FastUserProviderProps {
  children: ReactNode;
}

export const FastUserProvider: React.FC<FastUserProviderProps> = ({ children }) => {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          setUserId(user.id);
          setUserEmail(user.email || '');
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario');
          setUserImage(user.user_metadata?.avatar_url);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error inicializando usuario:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          setUserId(user.id);
          setUserEmail(user.email || '');
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario');
          setUserImage(user.user_metadata?.avatar_url);
          setIsAuthenticated(true);
          setLoading(false);
          setIsReady(true);
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setUserEmail('');
          setUserName('');
          setUserImage(undefined);
          setIsAuthenticated(false);
          setLoading(false);
          setIsReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: FastUserContextType = {
    userEmail,
    userName,
    userImage,
    userId,
    loading,
    isReady,
    isAuthenticated,
  };

  return <FastUserContext.Provider value={value}>{children}</FastUserContext.Provider>;
}; 