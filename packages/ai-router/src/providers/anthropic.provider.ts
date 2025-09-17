import { AIProvider, AITask, AIResult } from '../types';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  capabilities = ['text', 'json'];

  estimateCost(input: any): number {
    // TODO: Implementar cálculo real de costos
    return 0.002; // $0.002 por 1K tokens
  }

  async generate(task: AITask): Promise<AIResult> {
    // TODO: Implementar cuando IA_ENABLE_EXEC=true
    throw new Error('AnthropicProvider not implemented yet - use mock provider');
  }
}
