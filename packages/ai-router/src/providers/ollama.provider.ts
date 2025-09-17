import { AIProvider, AITask, AIResult } from '../types';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  capabilities = ['text', 'json'];

  estimateCost(input: any): number {
    // Ollama es gratis
    return 0;
  }

  async generate(task: AITask): Promise<AIResult> {
    // TODO: Implementar cuando IA_ENABLE_EXEC=true
    throw new Error('OllamaProvider not implemented yet - use mock provider');
  }
}
