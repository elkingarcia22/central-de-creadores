# Resumen Ejecutivo - Sistema de IA FREE-FIRST

## Resumen Ejecutivo (12 bullets clave)

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

## Tabla de Riesgos y Supuestos

| Categoría | Riesgo/Supuesto | Probabilidad | Impacto | Mitigación |
|-----------|----------------|--------------|---------|------------|
| **Técnico** | Hardware insuficiente para modelos locales | Media | Alto | Monitoreo de recursos, escalado horizontal, fallback a APIs |
| **Técnico** | Latencia alta de modelos locales | Alta | Medio | Cache agresivo, colas diferidas, optimización de prompts |
| **Técnico** | Calidad inconsistente de outputs | Media | Alto | Validación estricta, golden tests, feedback loop |
| **Negocio** | Costos inesperados al escalar | Baja | Alto | Presupuestos estrictos, alertas automáticas, degradación elegante |
| **Negocio** | Vendor lock-in en proveedores pagos | Baja | Medio | Interfaces estandarizadas, testing regular de alternativas |
| **Seguridad** | Problemas de privacidad con PII | Media | Alto | Enmascaramiento automático, auditoría, políticas estrictas |
| **Operacional** | Volumen inicial: 100-500 sesiones/mes | - | - | Supuesto base para dimensionamiento |
| **Operacional** | Hardware: 16GB RAM, 8 cores CPU mínimo | - | - | Requisito técnico para modelos locales |
| **Operacional** | Tolerancia latencia: 2-5s análisis, 30-60s transcripción | - | - | Expectativa de usuario |
| **Operacional** | Presupuesto inicial: $0 MVP, hasta $500/mes escalado | - | - | Restricción financiera |

## Matriz FREE vs PAID por Capacidad

| Capacidad | FREE/Local (Default) | PAID (Escalable) | Punto de Intercambio | Qué Cambia Exacto |
|-----------|---------------------|------------------|---------------------|-------------------|
| **Texto/JSON** | Ollama (Llama 3.x Instruct) | OpenAI GPT-4.1, Anthropic Claude 3.5, Google Gemini 1.5 | `config.textProvider = "openai"` | URL base, headers auth, modelo, parámetros |
| **Embeddings** | nomic-embed-text, sentence-transformers | OpenAI text-embedding-3, Cohere embed-english | `config.embeddingProvider = "openai"` | Dimensión vector (768→1536), API endpoint, formato respuesta |
| **STT** | Whisper local (tiny/base/small) | Deepgram, OpenAI Whisper API | `config.sttProvider = "deepgram"` | De archivo local a HTTP API, formato audio, streaming |
| **Visión** | LLaVA local (Ollama) | OpenAI GPT-4V, Google Gemini Vision | `config.visionProvider = "openai"` | De modelo local a API REST, formato imagen, contexto |
| **Moderación** | Regex + listas locales | OpenAI Moderation API, Perspective API | `config.moderationProvider = "openai"` | De validación local a API externa, scoring, categorías |
| **Cache** | Redis local/Memoria | Redis Cloud, AWS ElastiCache | `config.cacheProvider = "redis-cloud"` | URL conexión, autenticación, configuración cluster |
| **Colas** | Bull/BullMQ local | AWS SQS, Google Cloud Tasks | `config.queueProvider = "aws-sqs"` | Credenciales AWS, región, configuración dead letter |
| **Storage** | Sistema de archivos local | AWS S3, Google Cloud Storage | `config.storageProvider = "aws-s3"` | Bucket, región, políticas de acceso, CDN |

### Detalles de Intercambio por Proveedor

#### Texto/JSON - Ollama → OpenAI
```typescript
// FREE (Ollama)
const config = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: 'llama3:instruct',
  temperature: 0.7
};

// PAID (OpenAI) - Solo cambia configuración
const config = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo-preview',
  temperature: 0.7
};
```

#### Embeddings - Local → OpenAI
```typescript
// FREE (Local)
const config = {
  provider: 'nomic-embed',
  dimensions: 768,
  model: 'nomic-embed-text-v1'
};

// PAID (OpenAI) - Cambia dimensión y endpoint
const config = {
  provider: 'openai',
  dimensions: 1536,
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY
};
```

#### STT - Whisper Local → Deepgram
```typescript
// FREE (Whisper)
const config = {
  provider: 'whisper-local',
  model: 'base',
  device: 'cpu',
  language: 'auto'
};

// PAID (Deepgram) - Cambia a API HTTP
const config = {
  provider: 'deepgram',
  apiKey: process.env.DEEPGRAM_API_KEY,
  model: 'nova-2',
  language: 'es',
  punctuate: true
};
```

## Criterios de Aceptación - Checklist Final

### ✅ Funcionalidad Core
- [ ] Transcripción de audio funciona con >85% precisión (sin diarización en MVP)
- [ ] Análisis de transcripciones genera insights estructurados con IDs de catálogo
- [ ] RAG responde preguntas con citas verificables {doc_id, chunk_id}
- [ ] Copilot ejecuta acciones con confirmación HITL y dry-run
- [ ] Generación de perfiles funciona con datos reales y categorías válidas

### ✅ Rendimiento
- [ ] Latencia promedio <5 segundos para análisis
- [ ] Transcripción completa en <2x tiempo real
- [ ] Cache reduce llamadas repetitivas en >50%
- [ ] Sistema maneja 100 requests concurrentes

### ✅ Seguridad
- [ ] RLS funciona correctamente por tenant con políticas completas
- [ ] PII se enmascara automáticamente antes del modelo
- [ ] Auditoría registra todas las acciones (proposed/confirmed/executed)
- [ ] Validación JSON previene outputs maliciosos con esquemas específicos

### ✅ Escalabilidad
- [ ] Router cambia proveedores sin reescribir código
- [ ] Presupuestos se respetan automáticamente con tabla ai_costs
- [ ] Degradación elegante cuando se exceden límites
- [ ] Métricas permiten monitoreo en tiempo real

### ✅ Calidad
- [ ] 95% de outputs usan IDs válidos de catálogo (no texto libre)
- [ ] 100% de insights/dolores incluyen evidencia temporal {transcriptId, start_ms, end_ms}
- [ ] 100% de prompts enviados están sanitizados (PII redacted)
- [ ] Idempotencia: repetir llamada con idempotency_key no duplica filas
- [ ] Golden tests pasan con >90% éxito
- [ ] Código tiene cobertura de tests >80%

---

**Documento generado**: $(date)
**Versión**: 1.0
**Estado**: Resumen Ejecutivo
