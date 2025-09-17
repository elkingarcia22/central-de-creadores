export interface AIPolicy {
  allowPaid: boolean;
  preferProvider?: 'free' | 'mini' | 'pro' | 'gemini' | 'openai' | 'anthropic' | 'local';
  maxLatencyMs?: number;
  budgetCents?: number;
  region?: 'CO' | 'US' | 'EU';
  capabilities?: ('text' | 'json' | 'vision' | 'audio')[];
}

export interface AITask {
  tool: string;
  input: Record<string, any>;
  context: {
    tenantId: string;
    investigationId?: string;
    sessionId?: string;
    participantId?: string;
    catalogs?: {
      dolorCategoriaIds?: string[];
      perfilCategoriaIds?: string[];
    };
  };
  policy: AIPolicy;
  prompt?: string;
}

export interface AIResult {
  ok: boolean;
  provider: string;
  model: string;
  latencyMs: number;
  costCents: number;
  output?: any;
  error?: string;
}

export interface AIProvider {
  name: string;
  capabilities: string[];
  estimateCost(input: any): number;
  generate(task: AITask): Promise<AIResult>;
}
