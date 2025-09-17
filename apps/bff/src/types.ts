import { z } from 'zod';

// Schema de evidencia temporal
export const Evidence = z.object({
  transcriptId: z.string(),
  start_ms: z.number().int().nonnegative(),
  end_ms: z.number().int().nonnegative()
});

// Schema de entrada para /ai/run
export const AnalyzeSessionIn = z.object({
  tool: z.enum(['analyze_session', 'transcribe_audio', 'summarize_investigation', 'generate_profile', 'rag_query']),
  input: z.object({
    transcriptId: z.string().optional(),
    notesId: z.string().optional(),
    language: z.string().default('es')
  }),
  context: z.object({
    tenantId: z.string(),
    investigationId: z.string().optional(),
    sessionId: z.string().optional(),
    participantId: z.string().optional(),
    catalogs: z.object({
      dolorCategoriaIds: z.array(z.string()).optional(),
      perfilCategoriaIds: z.array(z.string()).optional()
    }).optional()
  }),
  policy: z.object({
    allowPaid: z.boolean(),
    preferProvider: z.enum(['free', 'mini', 'pro', 'gemini', 'openai', 'anthropic', 'local']).optional(),
    maxLatencyMs: z.number().int().positive().optional(),
    budgetCents: z.number().int().nonnegative().optional(),
    region: z.enum(['CO', 'US', 'EU']).optional()
  }),
  idempotency_key: z.string().uuid()
});

// Schema de salida para analyze_session
export const AnalyzeSessionOut = z.object({
  summary: z.string().min(20),
  insights: z.array(z.object({
    text: z.string().min(5),
    evidence: Evidence
  })).default([]),
  dolores: z.array(z.object({
    categoria_id: z.string().min(2),
    ejemplo: z.string().min(3),
    evidence: Evidence
  })).default([]),
  perfil_sugerido: z.object({
    categoria_id: z.string().min(2),
    razones: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1).default(0.5)
  }).nullable()
});

// Schema de respuesta de /ai/run
export const AIRunResponse = z.object({
  status: z.literal('ok'),
  result: z.any(), // Será validado contra el schema específico del tool
  meta: z.object({
    provider: z.string(),
    model: z.string(),
    latencyMs: z.number().int().nonnegative(),
    costCents: z.number().nonnegative()
  })
});

// Schema de entrada para /copilot/act
export const CopilotActIn = z.object({
  intent: z.enum(['create_session', 'cancel_session', 'reschedule_session', 'create_investigation', 'create_task']),
  parameters: z.record(z.any()),
  context: z.object({
    userId: z.string(),
    tenantId: z.string()
  })
});

// Schema de entrada para /webhooks/transcripcion
export const TranscriptionWebhookIn = z.object({
  sessionId: z.string(),
  audioUrl: z.string().url(),
  metadata: z.object({
    duration: z.number().optional(),
    participants: z.array(z.string()).optional()
  }).optional()
});

export type AnalyzeSessionInType = z.infer<typeof AnalyzeSessionIn>;
export type AnalyzeSessionOutType = z.infer<typeof AnalyzeSessionOut>;
export type AIRunResponseType = z.infer<typeof AIRunResponse>;
export type CopilotActInType = z.infer<typeof CopilotActIn>;
export type TranscriptionWebhookInType = z.infer<typeof TranscriptionWebhookIn>;
