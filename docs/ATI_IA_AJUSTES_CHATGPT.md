# Ajustes Implementados - Feedback de ChatGPT

## ✅ Ajustes Implementados

### 1. Contrato /ai/run Corregido

**Antes:**
```json
{
  "taskId": "uuid",
  "type": "transcribe" | "analyze" | "summarize" | "generate",
  "input": { "content": "string", "metadata": {} }
}
```

**Después:**
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

### 2. Esquema de Salida Específico

```typescript
const Evidence = z.object({
  transcriptId: z.string(),
  start_ms: z.number().int().nonnegative(),
  end_ms: z.number().int().nonnegative()
});

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
```

### 3. Sanitizado PII Antes del Modelo

```typescript
function sanitizePII(text: string): string {
  return text
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]")
    .replace(/\b(\+?\d[\d\s\-]{6,}\d)\b/g, "[PHONE]")
    .replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, "[CARD]")
    .replace(/\b\d{3}[\s\-]?\d{3}[\s\-]?\d{3}\b/g, "[SSN]")
    .replace(/\b[A-Z]{2}\d{6,8}\b/g, "[ID_NUMBER]");
}
```

### 4. Transcripción: Ajustar Promesa de Diarización

**Antes:** Prometía detección de hablantes
**Después:** 
- MVP: sin diarización (un solo hablante)
- v2: integrar módulo de diarización (VAD/pyannote) en cola n8n
- UI: evidencia por timestamp funciona igual con o sin diarización

### 5. RLS/DDL y Tabla de Costos

**Tabla ai_costs agregada:**
```sql
CREATE TABLE ai_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  cost_cents NUMERIC(10,2) NOT NULL DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Políticas RLS completas:**
```sql
-- Políticas completas por tenant (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "ai_costs_tenant_isolation" ON ai_costs
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));
```

### 6. RAG: Citas y Filtros

- Filtro por tenant_id y por module (sesion|investigacion|resultado)
- Devolver citas como {doc_id, chunk_id} (no sólo texto)
- Opción de re-rank local (si hay CPU) o desactivarlo para latencia baja

### 7. Copilot: Acciones Seguras (Whitelist + Dry-Run)

```typescript
// Lista blanca de intenciones permitidas
const ALLOWED_INTENTS: Set<CopilotIntent> = new Set([
  'create_session',
  'cancel_session',
  'reschedule_session',
  'create_investigation',
  'create_task'
]);

// Flujo con dry-run
interface HITLFlow {
  proposedAction: CopilotAction;
  dryRunResult: {
    success: boolean;
    preview: any;
    warnings: string[];
    estimatedImpact: string;
  };
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

## 🧪 Criterios de Aceptación (Afinados)

- **Dolores/Perfiles**: 95% de las salidas usan IDs válidos de catálogo (no texto libre)
- **Evidencia**: 100% de insights/dolores incluyen {transcriptId, start_ms, end_ms}
- **Seguridad**: 100% de prompts enviados están sanitizados (PII redacted)
- **Idempotencia**: repetir la misma llamada con idempotency_key no duplica filas
- **Budgets**: al superar presupuesto, el router degrada a FREE/cola y registra en ai_costs

## 📋 Checklist de Implementación

### Semana 1: Fundación
- [ ] Implementar contrato /ai/run con tool + context + policy + idempotency_key
- [ ] Crear esquemas Zod para validación de outputs específicos
- [ ] Implementar sanitizado PII obligatorio
- [ ] Crear tabla ai_costs y políticas RLS completas
- [ ] Configurar Router de IA con fallback FREE → MINI → PRO

### Semana 2: Funcionalidades Core
- [ ] Implementar transcripción sin diarización (MVP)
- [ ] Crear sistema RAG con citas {doc_id, chunk_id}
- [ ] Implementar copilot con whitelist y dry-run
- [ ] Validar outputs contra catálogos existentes
- [ ] Implementar auditoría completa (proposed/confirmed/executed)

### Semana 3: Refinamiento
- [ ] Testing con golden set (95% outputs con IDs válidos)
- [ ] Verificar evidencia temporal en 100% de insights
- [ ] Validar sanitizado PII en 100% de prompts
- [ ] Probar idempotencia y gestión de costos
- [ ] Documentar procedimientos operativos

## 🎯 Resultado Esperado

Con estos ajustes, la propuesta queda lista para construir un MVP sólido que:

1. **Aterriza el contrato** /ai/run con parámetros específicos del dominio
2. **Amarra outputs** a catálogos existentes por ID con evidencia temporal
3. **Baja la promesa** de diarización al backlog (v2)
4. **Agrega sanitizado PII** y tabla/políticas de costos
5. **Garantiza seguridad** con RLS completo y auditoría
6. **Mantiene escalabilidad** FREE-FIRST → PAID-READY

---

**Ajustes implementados**: $(date)
**Versión**: 1.1
**Estado**: Listo para MVP
