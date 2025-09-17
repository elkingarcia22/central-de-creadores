import { AITask, AIResult, AIPolicy } from './types';
import { MockProvider } from './providers/mock.provider';
import { OllamaProvider } from './providers/ollama.provider';

// Proveedores disponibles
const mockProvider = new MockProvider();
const ollamaProvider = new OllamaProvider();

/**
 * Ejecuta una tarea de IA usando el router de proveedores
 * @param task - Tarea a ejecutar
 * @returns Resultado de la ejecución
 */
export async function runLLM(task: AITask): Promise<AIResult> {
  // Verificar si la ejecución está habilitada
  const iaEnabled = process.env.IA_ENABLE_EXEC === 'true';
  
  if (!iaEnabled) {
    // Modo mock: devolver resultado simulado
    return mockProvider.generate(task);
  }
  
  // Seleccionar proveedor basado en la política
  const selectedProvider = selectProvider(task.policy);
  
  try {
    switch (selectedProvider) {
      case 'ollama':
        return await ollamaProvider.generate(task);
      case 'mock':
      default:
        return await mockProvider.generate(task);
    }
  } catch (error) {
    console.error('❌ [AI Router] Error en proveedor:', selectedProvider, error);
    // Fallback a mock en caso de error
    return await mockProvider.generate(task);
  }
}

/**
 * Valida una política de IA
 * @param policy - Política a validar
 * @returns true si es válida
 */
export function validatePolicy(policy: AIPolicy): boolean {
  if (policy.budgetCents && policy.budgetCents < 0) {
    return false;
  }
  
  if (policy.maxLatencyMs && policy.maxLatencyMs < 0) {
    return false;
  }
  
  return true;
}

/**
 * Selecciona el proveedor óptimo basado en la política
 * @param policy - Política de selección
 * @returns Nombre del proveedor seleccionado
 */
export function selectProvider(policy: AIPolicy): string {
  // FREE-FIRST: Si no se permite pago, usar proveedores gratuitos
  if (!policy.allowPaid) {
    const textProvider = process.env.IA_TEXT_PROVIDER || 'local';
    
    switch (textProvider) {
      case 'local':
        return 'ollama';
      case 'groq':
        return 'groq';
      default:
        return 'ollama'; // Fallback a local
    }
  }
  
  // Si se permite pago, usar el proveedor preferido
  switch (policy.preferProvider) {
    case 'openai':
      return 'openai';
    case 'anthropic':
      return 'anthropic';
    case 'gemini':
      return 'gemini';
    case 'local':
      return 'ollama';
    default:
      return 'ollama'; // Fallback a local
  }
}

// Exportar tipos
export * from './types';

// Exportar utilidades
export * from './utils/sanitize-pii';
