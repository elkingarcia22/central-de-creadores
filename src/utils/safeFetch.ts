/**
 * Función segura para hacer fetch que maneja errores de JSON
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar obtener el texto de error primero
      const errorText = await response.text();
      console.error(`❌ Error ${response.status} en ${url}:`, errorText);
      
      // Si el error es HTML, lanzar un error más descriptivo
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        throw new Error(`La API ${url} devolvió HTML en lugar de JSON. Posible error 404 o 500.`);
      }
      
      // Intentar parsear como JSON si no es HTML
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
    }
    
    // Obtener el texto de la respuesta
    const responseText = await response.text();
    
    // Verificar si la respuesta es HTML (error 404/500)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error(`❌ La API ${url} devolvió HTML:`, responseText.substring(0, 200));
      throw new Error(`La API ${url} devolvió HTML en lugar de JSON. Posible error 404 o 500.`);
    }
    
    // Intentar parsear como JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error(`❌ Error parseando JSON de ${url}:`, parseError);
      console.error(`❌ Respuesta recibida:`, responseText.substring(0, 200));
      throw new Error(`La respuesta de ${url} no es JSON válido: ${parseError.message}`);
    }
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Error desconocido en fetch a ${url}: ${error}`);
  }
}

/**
 * Hook para usar safeFetch en componentes React
 */
export function useSafeFetch() {
  return { safeFetch };
}
