# Ejemplos de Código e Interfaces - Sistema de IA

## Interfaces TypeScript Principales

### AIProvider Interface

```typescript
interface AIProvider {
  name: string;
  tier: 'free' | 'mini' | 'pro';
  capabilities: ProviderCapability[];
  config: ProviderConfig;
  healthCheck(): Promise<boolean>;
  estimateCost(input: any): number;
  getLatency(): Promise<number>;
}

interface ProviderCapability {
  type: 'text' | 'embedding' | 'stt' | 'vision' | 'moderation';
  models: string[];
  maxTokens?: number;
  costPerToken?: number;
  supportedFormats?: string[];
}

interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout: number;
  retries: number;
  fallback?: string;
  region?: string;
}
```

### AI Router Implementation

```typescript
class AIRouter {
  private providers: Map<string, AIProvider> = new Map();
  private cache: CacheService;
  private costController: CostController;
  
  constructor() {
    this.initializeProviders();
    this.cache = new CacheService();
    this.costController = new CostController();
  }
  
  async processTask(task: AITask, policy: AIPolicy): Promise<AIResult> {
    // 1. Verificar cache
    const cacheKey = this.generateCacheKey(task);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }
    
    // 2. Seleccionar proveedor
    const provider = await this.selectProvider(task, policy);
    
    // 3. Verificar presupuesto
    const budgetCheck = await this.costController.checkBudget(
      policy.tenantId, 
      provider.estimateCost(task.input)
    );
    
    if (!budgetCheck.allowed) {
      throw new BudgetExceededError(budgetCheck.reason);
    }
    
    // 4. Ejecutar tarea
    const result = await this.executeTask(provider, task);
    
    // 5. Guardar en cache
    await this.cache.set(cacheKey, result, policy.cacheTtl);
    
    // 6. Registrar métricas
    await this.recordMetrics(provider, task, result);
    
    return result;
  }
  
  private async selectProvider(task: AITask, policy: AIPolicy): Promise<AIProvider> {
    const capableProviders = Array.from(this.providers.values())
      .filter(p => p.capabilities.some(c => c.type === task.type));
    
    // Aplicar política de presupuesto
    const affordableProviders = capableProviders.filter(p => 
      policy.allowPaid || p.tier === 'free'
    );
    
    // Ordenar por preferencia: FREE → MINI → PRO
    const sorted = affordableProviders.sort((a, b) => {
      const order = { free: 0, mini: 1, pro: 2 };
      return order[a.tier] - order[b.tier];
    });
    
    // Aplicar límite de latencia
    const suitableProvider = sorted.find(p => 
      p.getLatency() <= policy.maxLatencyMs
    );
    
    return suitableProvider || sorted[0];
  }
}
```

### Ollama Provider Implementation

```typescript
class OllamaProvider implements AIProvider {
  name = 'ollama';
  tier = 'free' as const;
  capabilities: ProviderCapability[] = [
    {
      type: 'text',
      models: ['llama3:instruct', 'llama3:8b', 'llama3:70b'],
      maxTokens: 4096
    }
  ];
  
  config: ProviderConfig = {
    baseUrl: 'http://localhost:11434',
    timeout: 30000,
    retries: 3
  };
  
  async generateText(prompt: string, options: GenerationOptions): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'llama3:instruct',
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          max_tokens: options.maxTokens || 1000
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  estimateCost(input: any): number {
    // Ollama es gratis, costo = 0
    return 0;
  }
  
  async getLatency(): Promise<number> {
    // Medir latencia real con request de prueba
    const start = Date.now();
    try {
      await this.generateText('test', { maxTokens: 10 });
      return Date.now() - start;
    } catch {
      return 5000; // Fallback si falla
    }
  }
}
```

### OpenAI Provider Implementation

```typescript
class OpenAIProvider implements AIProvider {
  name = 'openai';
  tier = 'pro' as const;
  capabilities: ProviderCapability[] = [
    {
      type: 'text',
      models: ['gpt-4-turbo-preview', 'gpt-3.5-turbo'],
      maxTokens: 128000,
      costPerToken: 0.00003 // $0.03 per 1K tokens
    },
    {
      type: 'embedding',
      models: ['text-embedding-3-small', 'text-embedding-3-large'],
      costPerToken: 0.0000001 // $0.0001 per 1K tokens
    }
  ];
  
  config: ProviderConfig = {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1',
    timeout: 60000,
    retries: 3
  };
  
  async generateText(prompt: string, options: GenerationOptions): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  }
  
  estimateCost(input: any): number {
    const tokens = this.estimateTokens(input);
    return tokens * this.capabilities[0].costPerToken!;
  }
  
  private estimateTokens(text: string): number {
    // Estimación simple: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }
}
```

### BFF API Implementation

```typescript
// POST /ai/run
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tool, input, context, policy, idempotency_key } = body;
    
    // Validar input con esquema específico
    const validatedInput = AIRunSchema.parse({
      tool,
      input,
      context,
      policy,
      idempotency_key
    });
    
    // Verificar idempotencia
    const existingRun = await checkIdempotency(idempotency_key);
    if (existingRun) {
      return Response.json(existingRun);
    }
    
    // Sanitizar PII antes del procesamiento
    const sanitizedInput = {
      ...input,
      content: sanitizePII(input.content || '')
    };
    
    // Obtener catálogos del contexto
    const catalogs = await getCatalogs(context.tenantId);
    
    // Procesar tarea
    const router = new AIRouter();
    const result = await router.processTask({
      tool,
      input: sanitizedInput,
      context,
      policy
    }, catalogs);
    
    // Validar output contra esquema específico
    const validatedOutput = validateOutputByTool(tool, result, catalogs);
    
    // Registrar en base de datos
    await recordAIRun({
      idempotency_key,
      tenantId: context.tenantId,
      userId: context.userId,
      tool,
      inputData: sanitizedInput,
      outputData: validatedOutput,
      provider: result.provider,
      latency: result.latency,
      cost: result.cost
    });
    
    return Response.json({
      status: 'ok',
      result: validatedOutput,
      meta: {
        provider: result.provider,
        model: result.model,
        latencyMs: result.latency,
        costCents: result.cost
      }
    });
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof BudgetExceededError) {
      return Response.json(
        { error: 'Budget exceeded', reason: error.reason },
        { status: 402 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /copilot/act
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intent, parameters, context } = body;
    
    // Verificar permisos
    const hasPermission = await checkPermission(
      context.userId,
      intent,
      context.tenantId
    );
    
    if (!hasPermission) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Procesar intención
    const copilot = new CopilotService();
    const action = await copilot.processIntent(intent, parameters, context);
    
    // Si requiere confirmación, devolver propuesta
    if (action.requiresConfirmation) {
      return Response.json({
        intent,
        confidence: action.confidence,
        proposedAction: action,
        explanation: action.explanation
      });
    }
    
    // Ejecutar acción directamente
    const result = await copilot.executeAction(action, context);
    
    return Response.json({
      intent,
      result,
      executed: true
    });
    
  } catch (error) {
    return Response.json(
      { error: 'Failed to process intent' },
      { status: 500 }
    );
  }
}
```

### RAG Implementation

```typescript
class RAGService {
  private embeddingProvider: AIProvider;
  private vectorStore: VectorStore;
  private textProvider: AIProvider;
  
  constructor() {
    this.embeddingProvider = new EmbeddingProvider();
    this.vectorStore = new VectorStore();
    this.textProvider = new TextProvider();
  }
  
  async query(query: string, filters: RAGFilters): Promise<RAGResponse> {
    // 1. Generar embedding de la consulta
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);
    
    // 2. Buscar documentos similares
    const similarDocs = await this.vectorStore.search({
      embedding: queryEmbedding,
      filters,
      topK: 10,
      similarityThreshold: 0.7
    });
    
    // 3. Re-rank si es necesario (solo para proveedores gratuitos)
    const rankedDocs = await this.rerank(query, similarDocs);
    
    // 4. Generar respuesta con contexto
    const context = rankedDocs.map(doc => doc.content).join('\n\n');
    const prompt = this.buildRAGPrompt(query, context);
    
    const answer = await this.textProvider.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 1000
    });
    
    // 5. Extraer citas
    const citations = this.extractCitations(answer, rankedDocs);
    
    return {
      answer,
      citations,
      sources: rankedDocs.map(doc => ({
        id: doc.id,
        content: doc.content,
        similarity: doc.similarity,
        metadata: doc.metadata
      }))
    };
  }
  
  private buildRAGPrompt(query: string, context: string): string {
    return `
Contexto relevante:
${context}

Pregunta: ${query}

Instrucciones:
- Responde basándote únicamente en el contexto proporcionado
- Si no hay información suficiente, di "No tengo suficiente información"
- Incluye citas específicas usando [ID] donde corresponda
- Mantén la respuesta concisa y precisa

Respuesta:`;
  }
  
  private extractCitations(answer: string, docs: Document[]): string[] {
    const citationPattern = /\[(\w+)\]/g;
    const matches = answer.match(citationPattern);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }
}
```

### Transcripción Implementation

```typescript
class TranscriptionService {
  private whisperProvider: STTProvider;
  private queue: Queue;
  
  constructor() {
    this.whisperProvider = new WhisperProvider();
    this.queue = new Queue('transcription');
  }
  
  async transcribeAudio(audioUrl: string, metadata: AudioMetadata): Promise<TranscriptionResult> {
    // 1. Descargar audio
    const audioBuffer = await this.downloadAudio(audioUrl);
    
    // 2. Validar formato
    this.validateAudioFormat(audioBuffer);
    
    // 3. Encolar transcripción
    const job = await this.queue.add('transcribe', {
      audioBuffer,
      metadata,
      options: {
        model: 'base',
        language: 'auto',
        device: 'cpu'
      }
    });
    
    // 4. Procesar en background
    const result = await this.processTranscription(job);
    
    // 5. Guardar resultado
    await this.saveTranscription(result);
    
    return result;
  }
  
  private async processTranscription(job: TranscriptionJob): Promise<TranscriptionResult> {
    const { audioBuffer, options } = job.data;
    
    try {
      // Transcribir con Whisper
      const transcription = await this.whisperProvider.transcribe(audioBuffer, options);
      
      // Procesar resultado
      const result: TranscriptionResult = {
        id: job.id,
        text: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language,
        segments: transcription.segments,
        duration: transcription.duration,
        status: 'completed'
      };
      
      return result;
      
    } catch (error) {
      return {
        id: job.id,
        text: '',
        confidence: 0,
        language: 'unknown',
        segments: [],
        duration: 0,
        status: 'failed',
        error: error.message
      };
    }
  }
}
```

### Cost Controller Implementation

```typescript
class CostController {
  private budgets: Map<string, TenantBudget> = new Map();
  
  async checkBudget(tenantId: string, estimatedCost: number): Promise<BudgetStatus> {
    const budget = await this.getTenantBudget(tenantId);
    const usage = await this.getCurrentUsage(tenantId);
    
    // Verificar límites mensuales
    if (usage.monthly + estimatedCost > budget.monthly) {
      return {
        allowed: false,
        reason: 'monthly_budget_exceeded',
        currentUsage: usage.monthly,
        budget: budget.monthly,
        remaining: budget.monthly - usage.monthly
      };
    }
    
    // Verificar límites diarios
    if (usage.daily + estimatedCost > budget.daily) {
      return {
        allowed: false,
        reason: 'daily_budget_exceeded',
        currentUsage: usage.daily,
        budget: budget.daily,
        remaining: budget.daily - usage.daily
      };
    }
    
    return {
      allowed: true,
      currentUsage: usage.monthly,
      budget: budget.monthly,
      remaining: budget.monthly - usage.monthly
    };
  }
  
  async recordCost(tenantId: string, cost: number, provider: string): Promise<void> {
    await supabase
      .from('ai_costs')
      .insert({
        tenant_id: tenantId,
        cost_cents: Math.round(cost * 100),
        provider,
        created_at: new Date().toISOString()
      });
  }
  
  async getCurrentUsage(tenantId: string): Promise<UsageStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [monthlyUsage, dailyUsage] = await Promise.all([
      this.getUsageInPeriod(tenantId, startOfMonth, now),
      this.getUsageInPeriod(tenantId, startOfDay, now)
    ]);
    
    return {
      monthly: monthlyUsage,
      daily: dailyUsage
    };
  }
}
```

---

**Ejemplos generados**: $(date)
**Versión**: 1.0
**Estado**: Código de Referencia
