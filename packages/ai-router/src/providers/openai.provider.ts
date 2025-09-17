import { AIProvider, AITask, AIResult } from '../types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  capabilities = ['text', 'json', 'vision'];

  estimateCost(input: any): number {
    // TODO: Implementar cálculo real de costos
    return 0.001; // $0.001 por 1K tokens
  }

  async generate(task: AITask): Promise<AIResult> {
    // TODO: Implementar cuando IA_ENABLE_EXEC=true
    throw new Error('OpenAIProvider not implemented yet - use mock provider');
  }
}
