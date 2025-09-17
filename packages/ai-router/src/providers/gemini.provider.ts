import { AIProvider, AITask, AIResult } from '../types';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  capabilities = ['text', 'json', 'vision'];

  estimateCost(input: any): number {
    // TODO: Implementar cálculo real de costos
    return 0.0005; // $0.0005 por 1K tokens
  }

  async generate(task: AITask): Promise<AIResult> {
    // TODO: Implementar cuando IA_ENABLE_EXEC=true
    throw new Error('GeminiProvider not implemented yet - use mock provider');
  }
}
