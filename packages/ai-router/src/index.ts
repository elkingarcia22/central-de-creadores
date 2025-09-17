import { AITask, AIResult, AIPolicy } from './types';
import { MockProvider } from './providers/mock.provider';

// Proveedor mock por defecto (no ejecuta APIs reales)
const mockProvider = new MockProvider();

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
  
  // TODO: Implementar router real cuando IA_ENABLE_EXEC=true
  // Por ahora, siempre usar mock
  return mockProvider.generate(task);
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
  if (!policy.allowPaid) {
    return 'mock'; // FREE-FIRST
  }
  
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
      return 'mock';
  }
}

// Exportar tipos
export * from './types';
