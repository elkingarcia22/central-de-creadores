# ATI: Sistema de IA FREE-FIRST para Plataforma de Investigaciones

## Resumen Ejecutivo

• **Objetivo**: Implementar sistema de IA robusto que comience con herramientas gratuitas/locales y escale sin reescribir código
• **Arquitectura**: Router de modelos intercambiable con BFF dedicado y almacenamiento vectorial en Supabase
• **Capacidades MVP**: Transcripción, análisis de sesiones, RAG, copilot operativo y generación de perfiles
• **Estrategia FREE-FIRST**: Ollama (Llama 3.x), Whisper local, embeddings locales como base
• **Escalabilidad**: Interfaces TypeScript permiten cambio a OpenAI/Anthropic/Google solo por configuración
• **Beneficios**: Costo inicial $0, latencia controlada, sin vendor lock-in, datos privados
• **Límites MVP**: Modelos locales requieren hardware dedicado, latencia 2-5x mayor que APIs pagas
• **Seguridad**: RLS por tenant, enmascaramiento PII, validación JSON, auditoría completa
• **Observabilidad**: Logs estructurados, métricas de costo/latencia, tracing distribuido
• **Gestión de costos**: Presupuestos por tenant, cache inteligente, colas diferidas
• **Roadmap**: 2-3 semanas para MVP funcional con implementación incremental
• **ROI**: Automatización 70% tareas repetitivas, insights 5x más rápidos, escalabilidad sin reescritura

## Requisitos Funcionales IA (MVP)

### a) Transcripción de Sesiones
- **Input**: Audio/video de sesiones (MP3, MP4, WAV)
- **Output**: Texto transcrito con timestamps y confianza
- **Requisitos MVP**: Soporte múltiples idiomas, limpieza automática
- **Requisitos Futuros**: Detección de hablantes (diarización) - backlog para v2

### b) Análisis de Transcripciones
- **Input**: Texto transcrito de sesiones
- **Output**: Insights estructurados (dolores, señales de perfil, próximos pasos)
- **Requisitos**: Extracción de entidades, análisis de sentimiento, categorización automática

### c) Análisis de Investigación Completa
- **Input**: Todas las sesiones + resultados de una investigación
- **Output**: Resumen ejecutivo con hallazgos citando fuentes internas
- **Requisitos**: Síntesis multi-documento, citas verificables, insights accionables

### d) Copilot Operativo
- **Input**: Comandos en lenguaje natural
- **Output**: Acciones ejecutadas (crear/cancelar/reagendar sesiones, crear entidades)
- **Requisitos**: Function calling, validación de permisos, confirmación HITL

### e) RAG (Retrieval-Augmented Generation)
- **Input**: Preguntas sobre datos internos
- **Output**: Respuestas con citas de fuentes
- **Requisitos**: Búsqueda semántica, ranking de relevancia, citas verificables

### f) Generación de Perfiles de Cliente
- **Input**: Demográficos + señales de sesiones
- **Output**: Perfiles estructurados con insights predictivos
- **Requisitos**: Segmentación automática, scoring de propensión, recomendaciones

## Arquitectura Propuesta (L1-L3)

### Diagrama de Alto Nivel

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Next.js App]
        UI[UI Components]
    end
    
    subgraph "BFF Layer"
        BFF[AI BFF Server]
        AI_RUN[/ai/run]
        COPILOT[/copilot/act]
        WEBHOOKS[/webhooks/*]
    end
    
    subgraph "Router Layer"
        ROUTER[AI Model Router]
        POLICY[Policy Engine]
        CACHE[Result Cache]
    end
    
    subgraph "Provider Layer"
        OLLAMA[Ollama Local]
        OPENAI[OpenAI API]
        ANTHROPIC[Anthropic API]
        GOOGLE[Google AI]
        DEEPGRAM[Deepgram API]
    end
    
    subgraph "Data Layer"
        SUPABASE[(Supabase)]
        VECTORS[(pgvector)]
        TABLES[(AI Tables)]
    end
    
    subgraph "Processing Layer"
        N8N[n8n Workflows]
        QUEUES[Task Queues]
        STORAGE[File Storage]
    end
    
    WEB --> BFF
    BFF --> ROUTER
    ROUTER --> POLICY
    ROUTER --> CACHE
    ROUTER --> OLLAMA
    ROUTER --> OPENAI
    ROUTER --> ANTHROPIC
    ROUTER --> GOOGLE
    ROUTER --> DEEPGRAM
    BFF --> SUPABASE
    N8N --> SUPABASE
    N8N --> STORAGE
    ROUTER --> N8N
```

### Justificación Arquitectónica

**Minimización de Costo/Lock-in:**
- Router centralizado permite cambiar proveedores sin tocar lógica de negocio
- Interfaces TypeScript estandarizadas para todos los proveedores
- Cache inteligente reduce llamadas repetitivas
- Fallback automático FREE → MINI → PRO

**Control de Latencia:**
- Cache de resultados con TTL configurable
- Colas diferidas para tareas no críticas
- Timeout configurable por tipo de tarea
- Circuit breaker para proveedores lentos

## Estrategia FREE-FIRST → PAID-READY

### Matriz de Proveedores por Capacidad

| Capacidad | FREE/Local (Default) | PAID (Escalable) | Punto de Intercambio |
|-----------|---------------------|------------------|---------------------|
| **Texto/JSON** | Ollama (Llama 3.x Instruct) | OpenAI GPT-4.1, Anthropic Claude 3.5, Google Gemini 1.5 | Config: `textProvider` |
| **Embeddings** | nomic-embed-text, sentence-transformers | OpenAI text-embedding-3, Cohere embed-english | Config: `embeddingProvider` |
| **STT** | Whisper local (tiny/base/small) | Deepgram, OpenAI Whisper API | Config: `sttProvider` |
| **Visión** | LLaVA local (Ollama) | OpenAI GPT-4V, Google Gemini Vision | Config: `visionProvider` |
| **Moderación** | Regex + listas locales | OpenAI Moderation API, Perspective API | Config: `moderationProvider` |

### Interfaces de Proveedor

```typescript
interface AIProvider {
  name: string;
  capabilities: ProviderCapability[];
  config: ProviderConfig;
}

interface ProviderCapability {
  type: 'text' | 'embedding' | 'stt' | 'vision' | 'moderation';
  models: string[];
  maxTokens?: number;
  costPerToken?: number;
}

interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout: number;
  retries: number;
  fallback?: string;
}
```

## Diseño del Router de IA

### Objeto Policy

```typescript
interface AIPolicy {
  allowPaid: boolean;
  preferProvider: 'free' | 'mini' | 'pro';
  maxLatencyMs: number;
  budgetCents: number;
  region: string;
  capabilities: string[];
  fallbackStrategy: 'graceful' | 'error' | 'queue';
}
```

### Algoritmo de Selección

```typescript
class AIRouter {
  selectProvider(task: AITask, policy: AIPolicy): AIProvider {
    // 1. Filtrar por capacidades requeridas
    const capableProviders = this.providers.filter(p => 
      p.capabilities.some(c => c.type === task.type)
    );
    
    // 2. Aplicar política de presupuesto
    const affordableProviders = capableProviders.filter(p => 
      policy.allowPaid || p.tier === 'free'
    );
    
    // 3. Seleccionar por preferencia y latencia
    return this.selectByPreference(affordableProviders, policy);
  }
  
  private selectByPreference(providers: AIProvider[], policy: AIPolicy): AIProvider {
    // Ordenar por preferencia: FREE → MINI → PRO
    const sorted = providers.sort((a, b) => {
      const order = { free: 0, mini: 1, pro: 2 };
      return order[a.tier] - order[b.tier];
    });
    
    // Aplicar límite de latencia
    return sorted.find(p => p.avgLatency <= policy.maxLatencyMs) || sorted[0];
  }
}
```

## APIs del BFF (Contratos)

### POST /ai/run

**Request:**
```json
{
  "tool": "analyze_session" | "transcribe_audio" | "summarize_investigation" | "generate_profile" | "rag_query",
  "input": {
    "transcriptId": "TR_123",
    "notesId": "NT_456",
    "language": "es"
  },
  "context": {
    "tenantId": "UBITS",
    "investigationId": "INV_789",
    "sessionId": "SES_456",
    "participantId": "PAR_001",
    "catalogs": {
      "dolorCategoriaIds": ["NAV_MOBILE", "TRUST", "ONBOARDING"],
      "perfilCategoriaIds": ["MOVIL_FIRST", "PRICE_SENSITIVE"]
    }
  },
  "policy": {
    "allowPaid": false,
    "preferProvider": "free",
    "maxLatencyMs": 8000,
    "budgetCents": 0,
    "region": "CO"
  },
  "idempotency_key": "d9ab3e3e-...-b1"
}
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "summary": "Participante expresa frustración con navegación móvil y proceso de pago",
    "insights": [
      {
        "text": "CTA de pago poco visible en primer scroll",
        "evidence": { "transcriptId": "TR_123", "start_ms": 734000, "end_ms": 742000 }
      }
    ],
    "dolores": [
      {
        "categoria_id": "NAV_MOBILE",
        "ejemplo": "No encuentro el botón de pago en el móvil",
        "evidence": { "transcriptId": "TR_123", "start_ms": 734000, "end_ms": 742000 }
      }
    ],
    "perfil_sugerido": {
      "categoria_id": "MOVIL_FIRST",
      "razones": ["Valora rapidez", "Usa solo celular"],
      "confidence": 0.78
    }
  },
  "meta": { 
    "provider": "ollama", 
    "model": "llama3:instruct", 
    "latencyMs": 2410, 
    "costCents": 0 
  }
}
```

### POST /copilot/act

**Request:**
```json
{
  "intent": "create_session" | "cancel_session" | "reschedule_session",
  "parameters": {
    "participantId": "uuid",
    "date": "2024-01-15T10:00:00Z",
    "duration": 60
  },
  "context": {
    "userId": "uuid",
    "tenantId": "uuid"
  }
}
```

**Response:**
```json
{
  "intent": "create_session",
  "confidence": 0.95,
  "proposedAction": {
    "type": "create_session",
    "parameters": {},
    "requiresConfirmation": true
  },
  "explanation": "Crear sesión de 60 minutos con participante X el 15 de enero"
}
```

### POST /webhooks/transcripcion

**Request:**
```json
{
  "sessionId": "uuid",
  "audioUrl": "https://storage.../audio.mp3",
  "metadata": {
    "duration": 3600,
    "participants": ["user1", "user2"]
  }
}
```

## RAG (Retrieval-Augmented Generation)

### Ingesta con n8n

```typescript
interface RAGIngestion {
  // Chunking strategy
  chunkSize: 1000; // tokens
  chunkOverlap: 200; // tokens
  chunkStrategy: 'semantic' | 'fixed' | 'sentence';
  
  // PII cleaning
  piiMasking: {
    enabled: true;
    patterns: ['email', 'phone', 'ssn'];
    replacement: '[REDACTED]';
  };
  
  // Embeddings
  embeddingModel: 'nomic-embed-text';
  vectorDimensions: 768;
  
  // pgvector configuration
  indexType: 'ivfflat';
  indexParams: {
    lists: 100;
    probes: 10;
  };
}
```

### Consulta RAG

```typescript
interface RAGQuery {
  query: string;
  filters: {
    tenantId: string;
    module?: string;
    dateRange?: { start: Date; end: Date };
  };
  options: {
    topK: 10;
    similarityThreshold: 0.7;
    rerank: boolean; // Solo si es gratis
  };
}

interface RAGResponse {
  results: {
    content: string;
    sourceId: string;
    similarity: number;
    metadata: {};
  }[];
  answer: string;
  citations: string[];
}
```

## Transcripción (STT)

### Whisper Local

```typescript
interface WhisperConfig {
  model: 'tiny' | 'base' | 'small' | 'medium';
  device: 'cpu' | 'cuda';
  language: 'auto' | 'es' | 'en';
  task: 'transcribe' | 'translate';
  // MVP: sin diarización (un solo hablante)
  // v2: integrar VAD/pyannote para diarización
}

// Requisitos de hardware
const hardwareRequirements = {
  tiny: { cpu: '2 cores', ram: '1GB', time: '0.1x realtime', diarization: false },
  base: { cpu: '4 cores', ram: '2GB', time: '0.2x realtime', diarization: false },
  small: { cpu: '8 cores', ram: '4GB', time: '0.5x realtime', diarization: false },
  medium: { cpu: '16 cores', ram: '8GB', time: '1x realtime', diarization: false }
};

// MVP: Transcripción simple sin diarización
interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
  duration: number;
  status: 'completed' | 'failed';
  // v2: speaker_labels: Array<{speaker: string, start: number, end: number}>
}
```

### Colas y Procesamiento

```typescript
interface TranscriptionQueue {
  priority: 'high' | 'normal' | 'low';
  maxConcurrent: 2; // Para evitar sobrecarga
  retryPolicy: {
    maxRetries: 3;
    backoffMs: [1000, 5000, 15000];
  };
}
```

## Copilot Operativo Seguro

### Intenciones Soportadas (Whitelist)

```typescript
// Lista blanca de intenciones permitidas
type CopilotIntent = 
  | 'create_session'
  | 'cancel_session' 
  | 'reschedule_session'
  | 'create_investigation'
  | 'create_task'
  | 'update_participant'
  | 'generate_report';

// Validación de intenciones permitidas
const ALLOWED_INTENTS: Set<CopilotIntent> = new Set([
  'create_session',
  'cancel_session',
  'reschedule_session',
  'create_investigation',
  'create_task'
]);

interface CopilotAction {
  intent: CopilotIntent;
  parameters: Record<string, any>;
  requiresConfirmation: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  dryRunResult?: any; // Resultado del dry-run
}
```

### Flujo HITL (Human-in-the-Loop) con Dry-Run

```typescript
interface HITLFlow {
  // 1. Modelo propone acción
  proposedAction: CopilotAction;
  
  // 2. Dry-run de la acción propuesta
  dryRunResult: {
    success: boolean;
    preview: any;
    warnings: string[];
    estimatedImpact: string;
  };
  
  // 3. UI muestra confirmación con preview
  confirmationUI: {
    action: string;
    parameters: Record<string, any>;
    preview: any;
    impact: string;
    warnings: string[];
    alternatives?: CopilotAction[];
  };
  
  // 4. Usuario confirma/rechaza
  userDecision: 'approve' | 'reject' | 'modify';
  
  // 5. Ejecutar acción confirmada
  execution: {
    success: boolean;
    result?: any;
    error?: string;
  };
  
  // 6. Auditoría completa
  audit: {
    proposedAction: CopilotAction;
    confirmedAction: CopilotAction;
    executedAction: CopilotAction;
    timestamp: Date;
    userId: string;
    tenantId: string;
  };
}
```

### Validaciones de Permiso

```typescript
interface PermissionValidator {
  checkPermission(userId: string, action: CopilotAction): Promise<boolean>;
  getAuditLog(action: CopilotAction, userId: string): AuditLog;
}

interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  parameters: Record<string, any>;
  result: 'success' | 'failure';
  ipAddress: string;
}
```

## Modelo de Datos (Supabase)

### DDL de Tablas

```sql
-- Tabla de prompts y configuraciones
CREATE TABLE ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ejecuciones de IA
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  task_type VARCHAR(100) NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  provider VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  latency_ms INTEGER,
  cost_cents INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de feedback de IA
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES ai_runs(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vectores para RAG
CREATE TABLE vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  content TEXT NOT NULL,
  embedding VECTOR(768), -- pgvector
  metadata JSONB DEFAULT '{}',
  source_id UUID,
  source_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de transcripciones
CREATE TABLE transcripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sesiones(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  audio_url TEXT NOT NULL,
  transcript TEXT,
  confidence FLOAT,
  language VARCHAR(10),
  duration_seconds INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de insights generados
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  investigation_id UUID REFERENCES investigaciones(id),
  session_id UUID REFERENCES sesiones(id),
  insight_type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  confidence FLOAT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles de cliente
CREATE TABLE perfiles_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL, -- Cambiar a TEXT para flexibilidad
  participant_id UUID NOT NULL REFERENCES participantes(id),
  profile_data JSONB NOT NULL,
  segments TEXT[],
  propensity_scores JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de costos de IA (requerida por CostController)
CREATE TABLE ai_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  cost_cents NUMERIC(10,2) NOT NULL DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pgvector (parametrizar dimensión según proveedor)
CREATE INDEX ON vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON vectors (tenant_id, source_type);
CREATE INDEX ON ai_runs (tenant_id, created_at);
CREATE INDEX ON transcripciones (session_id, status);
CREATE INDEX ON ai_costs (tenant_id, created_at);
```

### Políticas RLS

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_costs ENABLE ROW LEVEL SECURITY;

-- Políticas completas por tenant (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "ai_prompts_tenant_isolation" ON ai_prompts
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "ai_runs_tenant_isolation" ON ai_runs
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "ai_feedback_tenant_isolation" ON ai_feedback
  FOR ALL USING (EXISTS (
    SELECT 1 FROM ai_runs ar 
    WHERE ar.id = ai_feedback.run_id 
    AND ar.tenant_id = current_setting('app.tenant_id', true)
  ));

CREATE POLICY "vectors_tenant_isolation" ON vectors
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "transcripciones_tenant_isolation" ON transcripciones
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "insights_tenant_isolation" ON insights
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "perfiles_clientes_tenant_isolation" ON perfiles_clientes
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "ai_costs_tenant_isolation" ON ai_costs
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- Políticas de usuario específicas
CREATE POLICY "ai_runs_user_access" ON ai_runs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager')
      AND ur.tenant_id = ai_runs.tenant_id
    )
  );

-- Política para INSERT en ai_runs (solo usuarios autenticados)
CREATE POLICY "ai_runs_insert_policy" ON ai_runs
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    tenant_id = current_setting('app.tenant_id', true)
  );
```

### Orden de Migraciones

1. **Migración 1**: Crear tablas base (ai_prompts, ai_runs, ai_feedback)
2. **Migración 2**: Instalar extensión pgvector y crear tabla vectors
3. **Migración 3**: Crear tablas de dominio (transcripciones, insights, perfiles_clientes)
4. **Migración 4**: Aplicar políticas RLS
5. **Migración 5**: Crear índices de rendimiento

## Calidad, Seguridad y Observabilidad

### Validación JSON Schema y Sanitizado PII

```typescript
import Ajv from 'ajv';
import { z } from 'zod';

// Schema de evidencia temporal
const Evidence = z.object({
  transcriptId: z.string(),
  start_ms: z.number().int().nonnegative(),
  end_ms: z.number().int().nonnegative()
});

// Schema de salida específico para análisis de sesión
export const AnalyzeSessionOut = z.object({
  summary: z.string().min(20),
  insights: z.array(z.object({
    text: z.string().min(5),
    evidence: Evidence
  })).default([]),
  dolores: z.array(z.object({
    categoria_id: z.string().min(2),   // debe existir en catálogos
    ejemplo: z.string().min(3),
    evidence: Evidence
  })).default([]),
  perfil_sugerido: z.object({
    categoria_id: z.string().min(2),
    razones: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1).default(0.5)
  }).nullable()
});

// Sanitizado PII obligatorio antes del modelo
function sanitizePII(text: string): string {
  return text
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]")
    .replace(/\b(\+?\d[\d\s\-]{6,}\d)\b/g, "[PHONE]")
    .replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, "[CARD]")
    .replace(/\b\d{3}[\s\-]?\d{3}[\s\-]?\d{3}\b/g, "[SSN]")
    .replace(/\b[A-Z]{2}\d{6,8}\b/g, "[ID_NUMBER]");
}

// Validación con reintento y verificación de catálogos
async function validateAndRetry<T>(
  aiResponse: any,
  schema: z.ZodSchema<T>,
  catalogs: CatalogContext,
  retryWithTemp0: boolean = true
): Promise<T> {
  try {
    const result = schema.parse(aiResponse);
    
    // Validar que los IDs de categoría existen en catálogos
    if (result.dolores) {
      for (const dolor of result.dolores) {
        if (!catalogs.dolorCategoriaIds.includes(dolor.categoria_id)) {
          throw new ValidationError(`Invalid dolor categoria_id: ${dolor.categoria_id}`);
        }
      }
    }
    
    if (result.perfil_sugerido && !catalogs.perfilCategoriaIds.includes(result.perfil_sugerido.categoria_id)) {
      throw new ValidationError(`Invalid perfil categoria_id: ${result.perfil_sugerido.categoria_id}`);
    }
    
    return result;
  } catch (error) {
    if (retryWithTemp0) {
      // Reintentar con temperatura 0 para mayor consistencia
      const retryResponse = await aiProvider.generate({
        ...originalPrompt,
        temperature: 0
      });
      return validateAndRetry(retryResponse, schema, catalogs, false);
    }
    throw new ValidationError('AI output validation failed', error);
  }
}
```

### Moderación y Guardrails

```typescript
interface ModerationConfig {
  maxTokens: 4000;
  maxLength: 10000;
  piiPatterns: RegExp[];
  prohibitedTerms: string[];
  contentFilters: {
    toxicity: boolean;
    violence: boolean;
    sexual: boolean;
  };
}

class ContentModerator {
  async moderate(content: string): Promise<ModerationResult> {
    // 1. Verificar longitud
    if (content.length > this.config.maxLength) {
      return { allowed: false, reason: 'content_too_long' };
    }
    
    // 2. Detectar PII
    const piiDetected = this.detectPII(content);
    if (piiDetected.length > 0) {
      return { allowed: false, reason: 'pii_detected', details: piiDetected };
    }
    
    // 3. Verificar términos prohibidos
    const prohibitedFound = this.checkProhibitedTerms(content);
    if (prohibitedFound.length > 0) {
      return { allowed: false, reason: 'prohibited_terms', details: prohibitedFound };
    }
    
    return { allowed: true };
  }
}
```

### Logs Estructurados

```typescript
interface StructuredLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: 'ai-router' | 'ai-bff' | 'transcription' | 'rag';
  traceId: string;
  userId?: string;
  tenantId?: string;
  event: string;
  metadata: Record<string, any>;
  metrics?: {
    latency: number;
    cost: number;
    tokens: number;
  };
}

// Ejemplo de uso
logger.info('ai_request_completed', {
  traceId: 'abc123',
  userId: 'user456',
  provider: 'ollama',
  model: 'llama3',
  latency: 1500,
  cost: 0,
  tokens: 150
});
```

### Métricas y Observabilidad

```typescript
interface AIMetrics {
  // Métricas de uso
  requestsPerMinute: number;
  requestsPerTenant: Record<string, number>;
  requestsPerUser: Record<string, number>;
  
  // Métricas de rendimiento
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  
  // Métricas de costo
  costPerRequest: number;
  costPerTenant: Record<string, number>;
  budgetUtilization: number;
  
  // Métricas de calidad
  successRate: number;
  validationFailureRate: number;
  userSatisfactionScore: number;
}
```

### Golden Set de Pruebas

```typescript
const goldenTestCases = {
  transcription: [
    {
      input: 'audio_spanish_meeting.mp3',
      expected: 'Reunión sobre investigación de mercado...',
      language: 'es',
      confidence: 0.85
    },
    {
      input: 'audio_english_interview.mp3', 
      expected: 'Interview about customer pain points...',
      language: 'en',
      confidence: 0.90
    }
  ],
  
  analysis: [
    {
      input: 'transcript_about_pricing.txt',
      expected: {
        painPoints: ['high cost', 'complex pricing'],
        sentiment: 'negative',
        nextSteps: ['schedule follow-up', 'provide quote']
      }
    }
  ],
  
  rag: [
    {
      query: 'What are the main pain points mentioned in recent sessions?',
      expected: {
        answer: 'The main pain points are...',
        citations: ['session_123', 'session_456'],
        confidence: 0.85
      }
    }
  ]
};
```

## Gestión de Costos

### Presupuestos y Límites

```typescript
interface CostManagement {
  // Presupuestos por tenant
  tenantBudgets: {
    monthly: number; // en centavos
    daily: number;
    perRequest: number;
  };
  
  // Límites por usuario
  userLimits: {
    dailyRequests: number;
    monthlyRequests: number;
    maxTokensPerRequest: number;
  };
  
  // Cache inteligente
  cache: {
    ttl: 24 * 60 * 60; // 24 horas
    maxSize: 10000; // entradas
    evictionPolicy: 'lru';
  };
  
  // Colas diferidas
  deferredQueues: {
    lowPriority: boolean;
    batchSize: 10;
    maxDelay: 60 * 60; // 1 hora
  };
}
```

### Algoritmo de Degradación

```typescript
class CostController {
  async checkBudget(tenantId: string, estimatedCost: number): Promise<BudgetStatus> {
    const budget = await this.getTenantBudget(tenantId);
    const usage = await this.getCurrentUsage(tenantId);
    
    if (usage.monthly + estimatedCost > budget.monthly) {
      return { allowed: false, reason: 'monthly_budget_exceeded' };
    }
    
    if (usage.daily + estimatedCost > budget.daily) {
      return { allowed: false, reason: 'daily_budget_exceeded' };
    }
    
    return { allowed: true };
  }
  
  async selectProvider(task: AITask, policy: AIPolicy): Promise<AIProvider> {
    // 1. Intentar proveedor preferido
    const preferred = this.getPreferredProvider(policy);
    if (await this.checkBudget(policy.tenantId, preferred.estimatedCost)) {
      return preferred;
    }
    
    // 2. Degradar a proveedor más barato
    const cheaper = this.getCheaperProvider(task);
    if (await this.checkBudget(policy.tenantId, cheaper.estimatedCost)) {
      return cheaper;
    }
    
    // 3. Usar cola diferida
    return this.queueForLater(task, policy);
  }
}
```

## Roadmap de Implementación

### Semana 1: Fundación
**Día 1-2: Infraestructura Base**
- [ ] Configurar Router de IA con Ollama
- [ ] Implementar interfaces de proveedor
- [ ] Crear tablas de base de datos
- [ ] Configurar RLS básico

**Día 3-4: APIs Básicas**
- [ ] Implementar POST /ai/run
- [ ] Implementar validación JSON con Zod
- [ ] Crear sistema de logs estructurados
- [ ] Configurar métricas básicas

**Día 5-7: Transcripción Local**
- [ ] Instalar y configurar Whisper local
- [ ] Implementar colas de transcripción
- [ ] Crear webhook de transcripción
- [ ] Probar con casos de prueba

### Semana 2: Funcionalidades Core
**Día 8-10: RAG y Análisis**
- [ ] Implementar ingesta de documentos
- [ ] Configurar pgvector y embeddings
- [ ] Crear sistema de consultas RAG
- [ ] Implementar análisis de transcripciones

**Día 11-12: Copilot Operativo**
- [ ] Implementar intenciones básicas
- [ ] Crear flujo HITL
- [ ] Implementar validaciones de permiso
- [ ] Crear auditoría de acciones

**Día 13-14: Integración y Testing**
- [ ] Integrar todas las funcionalidades
- [ ] Ejecutar golden set de pruebas
- [ ] Optimizar rendimiento
- [ ] Documentar APIs

### Semana 3: Refinamiento y Escalabilidad
**Día 15-17: Optimización**
- [ ] Implementar cache inteligente
- [ ] Optimizar consultas de base de datos
- [ ] Configurar monitoreo avanzado
- [ ] Implementar gestión de costos

**Día 18-19: Preparación para Escala**
- [ ] Configurar proveedores pagos (sin activar)
- [ ] Implementar A/B testing de prompts
- [ ] Crear dashboard de métricas
- [ ] Documentar procedimientos operativos

**Día 20-21: Testing Final y Deploy**
- [ ] Testing de carga
- [ ] Testing de seguridad
- [ ] Deploy a producción
- [ ] Monitoreo post-deploy

## Riesgos, Trade-offs y Supuestos

### Tabla de Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Hardware insuficiente para modelos locales** | Media | Alto | Monitoreo de recursos, escalado horizontal, fallback a APIs |
| **Latencia alta de modelos locales** | Alta | Medio | Cache agresivo, colas diferidas, optimización de prompts |
| **Calidad inconsistente de outputs** | Media | Alto | Validación estricta, golden tests, feedback loop |
| **Costos inesperados al escalar** | Baja | Alto | Presupuestos estrictos, alertas automáticas, degradación elegante |
| **Vendor lock-in en proveedores pagos** | Baja | Medio | Interfaces estandarizadas, testing regular de alternativas |
| **Problemas de privacidad con PII** | Media | Alto | Enmascaramiento automático, auditoría, políticas estrictas |

### Trade-offs Principales

1. **Costo vs Latencia**: Modelos locales son gratis pero más lentos
2. **Privacidad vs Funcionalidad**: Enmascarar PII reduce contexto pero mejora privacidad
3. **Simplicidad vs Flexibilidad**: Router centralizado es más complejo pero más flexible
4. **Calidad vs Velocidad**: Validación estricta es más lenta pero más confiable

### Supuestos Críticos

1. **Volumen inicial**: 100-500 sesiones/mes, 10-50 usuarios activos
2. **Hardware disponible**: Servidor con 16GB RAM, 8 cores CPU mínimo
3. **Tolerancia a latencia**: 2-5 segundos para análisis, 30-60 segundos para transcripción
4. **Presupuesto inicial**: $0 para MVP, hasta $500/mes para escalado
5. **Disponibilidad de datos**: Transcripciones y metadatos de sesiones existentes

## Preguntas Abiertas

1. **¿Qué nivel de precisión es aceptable para transcripciones en español?**
2. **¿Cuáles son los casos de uso más críticos para priorizar en el MVP?**
3. **¿Qué nivel de automatización es deseable vs confirmación manual?**
4. **¿Cómo se manejarán los datos de sesiones históricas sin transcripción?**
5. **¿Qué métricas de éxito son más importantes para el negocio?**
6. **¿Cuál es la estrategia de rollback si los modelos locales fallan?**
7. **¿Cómo se integrará con el sistema de permisos existente?**
8. **¿Qué nivel de personalización de prompts se requiere por tenant?**

## Criterios de Aceptación (Checklist)

### Funcionalidad Core
- [ ] Transcripción de audio funciona con >85% precisión (sin diarización en MVP)
- [ ] Análisis de transcripciones genera insights estructurados con IDs de catálogo
- [ ] RAG responde preguntas con citas verificables {doc_id, chunk_id}
- [ ] Copilot ejecuta acciones con confirmación HITL y dry-run
- [ ] Generación de perfiles funciona con datos reales y categorías válidas

### Rendimiento
- [ ] Latencia promedio <5 segundos para análisis
- [ ] Transcripción completa en <2x tiempo real
- [ ] Cache reduce llamadas repetitivas en >50%
- [ ] Sistema maneja 100 requests concurrentes

### Seguridad
- [ ] RLS funciona correctamente por tenant con políticas completas
- [ ] PII se enmascara automáticamente antes del modelo
- [ ] Auditoría registra todas las acciones (proposed/confirmed/executed)
- [ ] Validación JSON previene outputs maliciosos con esquemas específicos

### Escalabilidad
- [ ] Router cambia proveedores sin reescribir código
- [ ] Presupuestos se respetan automáticamente con tabla ai_costs
- [ ] Degradación elegante cuando se exceden límites
- [ ] Métricas permiten monitoreo en tiempo real

### Calidad
- [ ] 95% de outputs usan IDs válidos de catálogo (no texto libre)
- [ ] 100% de insights/dolores incluyen evidencia temporal {transcriptId, start_ms, end_ms}
- [ ] 100% de prompts enviados están sanitizados (PII redacted)
- [ ] Idempotencia: repetir llamada con idempotency_key no duplica filas
- [ ] Golden tests pasan con >90% éxito
- [ ] Código tiene cobertura de tests >80%

---

**Documento generado**: $(date)
**Versión**: 1.0
**Estado**: Propuesta Técnica
