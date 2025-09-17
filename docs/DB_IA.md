# Base de Datos IA - Configuración y Uso

## Configurar app.tenant_id por Request

### En el BFF (Backend for Frontend)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Middleware para establecer tenant_id
app.use((req, res, next) => {
  // Obtener tenant_id del header o del contexto
  const tenantId = req.headers['x-tenant-id'] || req.body.context?.tenantId;
  
  if (tenantId) {
    // Establecer para la sesión actual
    req.tenantId = tenantId;
    
    // CRÍTICO: Establecer app.tenant_id para RLS
    // Opción 1: Usar RPC
    supabase.rpc('set_tenant_id', { tenant_id: tenantId });
    
    // Opción 2: Usar SET LOCAL (alternativa)
    // supabase.rpc('exec_sql', { 
    //   sql: `SET LOCAL app.tenant_id = '${tenantId}'` 
    // });
  }
  
  next();
});

// En las rutas, usar el tenant_id
app.post('/ai/run', async (req, res) => {
  const tenantId = req.tenantId;
  
  // IMPORTANTE: Establecer tenant_id antes de operaciones
  await supabase.rpc('set_tenant_id', { tenant_id: tenantId });
  
  // Todas las operaciones de Supabase respetarán RLS
  const { data } = await supabase
    .from('ai_runs')
    .select('*'); // Solo verá registros del tenant actual
});
```

### Función RPC para establecer tenant_id

```sql
-- Crear función para establecer tenant_id
CREATE OR REPLACE FUNCTION set_tenant_id(tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', tenant_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION set_tenant_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_id(TEXT) TO service_role;
```

### Uso en el código

```typescript
// Establecer tenant_id antes de operaciones
await supabase.rpc('set_tenant_id', { tenant_id: 'TENANT_X' });

// Ahora todas las consultas respetarán RLS
const { data } = await supabase
  .from('ai_runs')
  .select('*'); // Solo verá registros de TENANT_X
```

## Cambiar Dimensión de Embeddings

### Opción 1: Variable de Entorno

```bash
# En .env
IA_EMBEDDINGS_DIM=768  # Para modelos locales
IA_EMBEDDINGS_DIM=1536 # Para OpenAI
```

### Opción 2: Migración de Base de Datos

```sql
-- 1. Crear nueva tabla con dimensión diferente
CREATE TABLE vectors_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  module TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  chunk TEXT NOT NULL,
  embedding VECTOR(1536), -- Nueva dimensión
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Copiar datos existentes (si es necesario)
-- INSERT INTO vectors_new (id, tenant_id, module, doc_id, chunk, metadata, created_at)
-- SELECT id, tenant_id, module, doc_id, chunk, metadata, created_at
-- FROM vectors;

-- 3. Crear índices
CREATE INDEX ON vectors_new USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON vectors_new (tenant_id, module);

-- 4. Aplicar RLS
ALTER TABLE vectors_new ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_vectors_new ON vectors_new
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- 5. Renombrar tablas
ALTER TABLE vectors RENAME TO vectors_old;
ALTER TABLE vectors_new RENAME TO vectors;

-- 6. Eliminar tabla antigua (cuando esté seguro)
-- DROP TABLE vectors_old;
```

### Opción 3: Configuración Dinámica

```typescript
// En el código, determinar dimensión según proveedor
function getEmbeddingDimension(provider: string): number {
  switch (provider) {
    case 'openai':
      return 1536;
    case 'ollama':
    case 'local':
    default:
      return 768;
  }
}

// Usar en las operaciones
const dimension = getEmbeddingDimension(selectedProvider);
const { data } = await supabase
  .from('vectors')
  .select('*')
  .eq('tenant_id', tenantId);
```

## Políticas RLS Completas

### Políticas por Tabla

```sql
-- ai_runs
CREATE POLICY tenant_isolation_ai_runs ON ai_runs
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- ai_costs
CREATE POLICY tenant_isolation_ai_costs ON ai_costs
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- vectors
CREATE POLICY tenant_isolation_vectors ON vectors
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- transcripciones
CREATE POLICY tenant_isolation_transcripciones ON transcripciones
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- insights
CREATE POLICY tenant_isolation_insights ON insights
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- perfiles_clientes
CREATE POLICY tenant_isolation_perfiles_clientes ON perfiles_clientes
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

-- ai_feedback (a través de ai_runs)
CREATE POLICY tenant_isolation_ai_feedback ON ai_feedback
  FOR ALL USING (EXISTS (
    SELECT 1 FROM ai_runs ar 
    WHERE ar.id = ai_feedback.ai_run_id 
    AND ar.tenant_id = current_setting('app.tenant_id', true)
  ));
```

### Políticas de Usuario

```sql
-- Solo el usuario que creó el run puede verlo, o admins
CREATE POLICY ai_runs_user_access ON ai_runs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager')
      AND ur.tenant_id = ai_runs.tenant_id
    )
  );

-- Solo usuarios autenticados pueden insertar
CREATE POLICY ai_runs_insert_policy ON ai_runs
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    tenant_id = current_setting('app.tenant_id', true)
  );
```

## Índices de Rendimiento

### Índices Principales

```sql
-- Vectores: índice ivfflat para búsqueda semántica
CREATE INDEX idx_vectors_embedding ON vectors 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Vectores: filtros por tenant y módulo
CREATE INDEX idx_vectors_tenant_module ON vectors (tenant_id, module);

-- AI runs: consultas por tenant y fecha
CREATE INDEX idx_ai_runs_tenant_created ON ai_runs (tenant_id, created_at);

-- AI runs: idempotencia
CREATE INDEX idx_ai_runs_idempotency ON ai_runs (idempotency_key);

-- Costos: consultas por tenant y fecha
CREATE INDEX idx_ai_costs_tenant_created ON ai_costs (tenant_id, created_at);

-- Transcripciones: búsqueda por sesión
CREATE INDEX idx_transcripciones_sesion ON transcripciones (sesion_id);

-- Insights: búsqueda por entidad
CREATE INDEX idx_insights_entity ON insights (entity, entity_id);
```

### Parámetros de Índice ivfflat

```sql
-- Para 100K-1M vectores
CREATE INDEX idx_vectors_embedding ON vectors 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Para 1M-10M vectores
CREATE INDEX idx_vectors_embedding ON vectors 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);

-- Para >10M vectores
CREATE INDEX idx_vectors_embedding ON vectors 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10000);
```

## Monitoreo y Mantenimiento

### Consultas de Monitoreo

```sql
-- Uso de IA por tenant
SELECT 
  tenant_id,
  COUNT(*) as total_runs,
  SUM(cost_cents) as total_cost_cents,
  AVG(latency_ms) as avg_latency_ms
FROM ai_runs 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id
ORDER BY total_cost_cents DESC;

-- Proveedores más usados
SELECT 
  provider,
  COUNT(*) as usage_count,
  SUM(cost_cents) as total_cost_cents
FROM ai_runs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY provider
ORDER BY usage_count DESC;

-- Errores por herramienta
SELECT 
  tool,
  COUNT(*) as error_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as error_percentage
FROM ai_runs 
WHERE status = 'error' 
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY tool
ORDER BY error_count DESC;
```

### Limpieza de Datos

```sql
-- Eliminar runs antiguos (más de 90 días)
DELETE FROM ai_runs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Eliminar costos antiguos (más de 1 año)
DELETE FROM ai_costs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Vacuum y analyze para optimizar
VACUUM ANALYZE ai_runs;
VACUUM ANALYZE ai_costs;
VACUUM ANALYZE vectors;
```

## Backup y Recuperación

### Backup de Tablas IA

```bash
# Backup completo
pg_dump -h localhost -U postgres -d database_name \
  --table=ai_runs \
  --table=ai_costs \
  --table=vectors \
  --table=transcripciones \
  --table=insights \
  --table=perfiles_clientes \
  > ia_backup.sql

# Backup solo estructura
pg_dump -h localhost -U postgres -d database_name \
  --schema-only \
  --table=ai_runs \
  --table=ai_costs \
  --table=vectors \
  > ia_schema_backup.sql
```

### Restauración

```bash
# Restaurar desde backup
psql -h localhost -U postgres -d database_name < ia_backup.sql
```
