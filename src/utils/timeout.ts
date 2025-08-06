/**
 * Crea una promesa que se resuelve después del tiempo especificado
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Ejecuta una promesa con timeout
 * @param promise - La promesa a ejecutar
 * @param timeoutMs - Tiempo límite en milisegundos
 * @param timeoutMessage - Mensaje personalizado para el timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operación timeout'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

/**
 * Ejecuta una promesa con timeout, pero retorna null en lugar de error en caso de timeout
 * @param promise - La promesa a ejecutar
 * @param timeoutMs - Tiempo límite en milisegundos
 */
export const withTimeoutFallback = async <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T | null> => {
  try {
    return await withTimeout(promise, timeoutMs);
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      return null;
    }
    throw error;
  }
};

/**
 * Reintentar una operación un número específico de veces
 * @param fn - Función a ejecutar
 * @param retries - Número de reintentos
 * @param delayMs - Delay entre reintentos
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === retries) {
        throw lastError;
      }
      
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}; 