import { useState, useEffect, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error ${context ? `en ${context}` : ''}:`, error);
    setError(error?.message || 'Ha ocurrido un error');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    loading,
    setLoading,
    handleError,
    clearError
  };
}; 