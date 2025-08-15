import { useRef, useCallback } from 'react';

interface UseReclutamientoDataSimpleProps {
  id: string | string[] | undefined;
}

export const useReclutamientoDataSimple = ({ id }: UseReclutamientoDataSimpleProps) => {
  const loadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  const preventDuplicateLoad = useCallback(() => {
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 1000) {
      console.log('⚠️ Evitando carga duplicada');
      return false;
    }
    lastLoadTimeRef.current = now;
    return true;
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    if (loadingRef.current !== loading) {
      loadingRef.current = loading;
    }
  }, []);

  return {
    preventDuplicateLoad,
    setLoadingState,
    isLoading: loadingRef.current
  };
};
