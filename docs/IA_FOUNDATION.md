# IA Foundation v1 - Documentación

## Resumen

Esta documentación describe la infraestructura base de IA implementada en la versión 1. La implementación incluye contratos, schemas, migraciones, router de proveedores, sanitizado PII, gestión de costos y tests, pero **no ejecuta funcionalidades reales de IA** por defecto.

## Arquitectura

```mermaid
graph TB
    subgraph "BFF Layer"
        BFF[AI BFF Server]
        AI_RUN[/ai/run]
        COPILOT[/copilot/act]
        WEBHOOKS[/webhooks/transcripcion]
    end
    
    subgraph "Router Layer"
        ROUTER[AI Router]
        MOCK[Mock Provider]
        OLLAMA[Ollama Provider]
        OPENAI[OpenAI Provider]
    end
    
    subgraph "Data Layer"
        SUPABASE[(Supabase)]
        AI_RUNS[(ai_runs)]
        AI_COSTS[(ai_costs)]
        VECTORS[(vectors)]
    end
    
    BFF --> ROUTER
    ROUTER --> MOCK
    ROUTER --> OLLAMA
    ROUTER --> OPENAI
    BFF --> SUPABASE
    SUPABASE --> AI_RUNS
    SUPABASE --> AI_COSTS
    SUPABASE --> VECTORS
```

## Configuración

### Variables de Entorno

```bash
# Habilitar/deshabilitar ejecución real de IA
IA_ENABLE_EXEC=false

# Dimensión de embeddings (768 por defecto, 1536 para OpenAI)
IA_EMBEDDINGS_DIM=768

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
```

### Feature Flags

- **IA_ENABLE_EXEC**: Controla si se ejecutan modelos reales
  - `false` (default): Solo respuestas mock
  - `true`: Ejecuta modelos reales (cuando esté implementado)

## Base de Datos

### Tablas Principales

#### ai_runs
Registro de todas las ejecuciones de IA:
```sql
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  latency_ms INTEGER,
  cost_cents NUMERIC(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('ok', 'error')),
  input JSONB NOT NULL,
  result JSONB,
  error JSONB,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ai_costs
Registro de costos por proveedor:
```sql
CREATE TABLE ai_costs (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  cost_cents NUMERIC(10,2) DEFAULT 0,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### vectors
Almacenamiento de embeddings para RAG:
```sql
CREATE TABLE vectors (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  module TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  chunk TEXT NOT NULL,
  embedding VECTOR(768), -- Dimensión configurable
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

Todas las tablas IA tienen RLS habilitado con políticas por tenant:

```sql
-- Ejemplo de política
CREATE POLICY tenant_isolation_ai_runs ON ai_runs
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));
```

### Configurar app.tenant_id en el BFF

En cada request, el BFF debe establecer el tenant_id:

```typescript
// En el middleware de autenticación
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.body.context?.tenantId;
  if (tenantId) {
    // Establecer para la sesión de Supabase
    supabase.rpc('set_tenant_id', { tenant_id: tenantId });
  }
  next();
});
```

## APIs

### POST /ai/run

**Request:**
```json
{
  "tool": "analyze_session",
  "input": {
    "transcriptId": "TR_123",
    "notesId": "NT_456",
    "language": "es"
  },
  "context": {
    "tenantId": "TENANT_X",
    "investigationId": "INV_789",
    "sessionId": "SES_456",
    "participantId": "PAR_001",
    "catalogs": {
      "dolorCategoriaIds": ["NAV_MOBILE", "TRUST"],
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
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "summary": "Participante expresa frustración con navegación móvil...",
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
    "provider": "mock",
    "model": "mock-model",
    "latencyMs": 0,
    "costCents": 0
  }
}
```

### POST /copilot/act

**Status:** 501 Not Implemented (stub)

### POST /webhooks/transcripcion

**Status:** 202 Accepted (stub)

## Sanitizado PII

### Función sanitizePII()

```typescript
import { sanitizePII } from '@apps/bff/src/utils/sanitize';

const sanitized = sanitizePII('Contact me at john@example.com or call +57 300 123 4567');
// Resultado: 'Contact me at [EMAIL] or call [PHONE]'
```

### Patrones Enmascarados

- **Emails**: `user@domain.com` → `[EMAIL]`
- **Teléfonos**: `+57 300 123 4567` → `[PHONE]`
- **Tarjetas**: `4532 1234 5678 9012` → `[CARD]`
- **IDs**: `1234567890` → `[ID_NUMBER]`
- **Direcciones**: `Calle 123 #45-67` → `[ADDRESS]`

## Gestión de Costos

### Verificar Presupuesto

```typescript
import { checkBudget } from '@apps/bff/src/services/costs';

const result = await checkBudget('tenant-id', 100); // 100 centavos
if (!result.allowed) {
  console.log('Presupuesto excedido:', result.reason);
}
```

### Registrar Costo

```typescript
import { recordCost } from '@apps/bff/src/services/costs';

await recordCost({
  tenantId: 'tenant-id',
  provider: 'openai',
  costCents: 150,
  meta: { model: 'gpt-4', tokens: 1000 }
});
```

## Cambiar Dimensión de Embeddings

### Opción 1: Variable de Entorno

```bash
# Para OpenAI (1536 dimensiones)
IA_EMBEDDINGS_DIM=1536

# Para modelos locales (768 dimensiones)
IA_EMBEDDINGS_DIM=768
```

### Opción 2: Migración de Base de Datos

```sql
-- Crear nueva tabla con dimensión diferente
CREATE TABLE vectors_1536 (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  module TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  chunk TEXT NOT NULL,
  embedding VECTOR(1536), -- Nueva dimensión
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrar datos existentes (si es necesario)
-- INSERT INTO vectors_1536 SELECT * FROM vectors;

-- Renombrar tablas
-- ALTER TABLE vectors RENAME TO vectors_768;
-- ALTER TABLE vectors_1536 RENAME TO vectors;
```

## Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests específicos de IA
npm test tests/ia_foundation.test.ts
```

### Tests Incluidos

1. **Validación de schemas**: AnalyzeSessionIn/Out
2. **Sanitizado PII**: Enmascaramiento de datos sensibles
3. **Gestión de costos**: checkBudget y recordCost
4. **Validación de payloads**: Contratos de API

## Activación y Desactivación

### Modo Desactivado (Default)

```bash
IA_ENABLE_EXEC=false
```

- Todas las llamadas devuelven respuestas mock
- No se ejecutan modelos reales
- Se registran en base de datos para auditoría
- Idempotencia funciona correctamente

### Modo Activado (Futuro)

```bash
IA_ENABLE_EXEC=true
```

- Ejecuta modelos reales (cuando esté implementado)
- Usa router de proveedores
- Registra costos reales
- Aplica políticas de presupuesto

## Próximos Pasos

1. **Implementar botón "Analiza con IA"** en la UI
2. **Activar pipeline real** en /ai/run
3. **Conectar transcripciones** y catálogos existentes
4. **Implementar proveedores reales** (Ollama, OpenAI, etc.)
5. **Agregar RAG** con ingestas de documentos
6. **Implementar copilot** con acciones reales

## Troubleshooting

### Error: "Missing Supabase configuration"

Verificar variables de entorno:
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE
```

### Error: "AI execution not implemented yet"

Normal cuando `IA_ENABLE_EXEC=false`. Cambiar a `true` cuando esté implementado.

### Error: "Invalid input" en /ai/run

Verificar que el payload cumple con el schema `AnalyzeSessionIn`:
- `tool` debe ser uno de los valores permitidos
- `idempotency_key` debe ser un UUID válido
- `context.tenantId` es requerido

### Error de RLS: "Row Level Security"

Verificar que se establece `app.tenant_id` en cada request:
```typescript
// En el middleware
supabase.rpc('set_tenant_id', { tenant_id: tenantId });
```
