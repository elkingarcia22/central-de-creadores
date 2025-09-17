# IA Foundation v1 - PR

## Resumen

Implementación de la infraestructura base de IA (schemas, router, contratos, RLS, sanitizado PII, costos, tests) **sin activar ni conectar ninguna funcionalidad de negocio existente** en la plataforma.

## ✅ Entregables Completados

### 1. Migraciones (Supabase / Postgres)
- ✅ Extensiones y tablas base (`ai_prompts`, `ai_runs`, `ai_feedback`)
- ✅ Vectores para RAG con dimensión parametrizable (768 por defecto)
- ✅ Tablas de dominio IA (`transcripciones`, `insights`, `perfiles_clientes`)
- ✅ Tabla de costos (`ai_costs`)
- ✅ Índices optimizados (ivfflat para vectores, índices por tenant)
- ✅ RLS completo con políticas por tenant

### 2. Paquete @packages/ai-router
- ✅ Router con proveedor mock determinista
- ✅ Interfaces para proveedores (Ollama, OpenAI, Anthropic, Gemini)
- ✅ Política de selección FREE-FIRST → PAID-READY
- ✅ Soporte para idempotencia

### 3. Paquete @packages/prompt-kit
- ✅ Cargador de plantillas YAML → JSON
- ✅ Prompts de ejemplo (`analyze_session.yml`, `summarize_research.yml`)
- ✅ Conversión de JSON Schema a Zod Schema
- ✅ Validación de outputs

### 4. BFF - Endpoints sin activar
- ✅ POST `/ai/run` (stub con validación completa)
- ✅ POST `/copilot/act` (stub - devuelve 501)
- ✅ POST `/webhooks/transcripcion` (stub - devuelve 202)
- ✅ Validación de payloads con Zod
- ✅ Registro en base de datos para auditoría

### 5. Contratos y validaciones
- ✅ Schema `AnalyzeSessionIn` con validación completa
- ✅ Schema `AnalyzeSessionOut` con evidencia temporal
- ✅ Soporte para idempotencia con `idempotency_key`
- ✅ Validación de catálogos existentes

### 6. Sanitizado PII
- ✅ Función `sanitizePII()` con patrones para emails, teléfonos, tarjetas, IDs
- ✅ Tests unitarios completos
- ✅ Estadísticas de sanitización

### 7. Costos y budgets
- ✅ Servicio `checkBudget()` con límites mensuales/diarios
- ✅ Servicio `recordCost()` para registro de costos
- ✅ Integración con tabla `ai_costs`
- ✅ Tests unitarios

### 8. Feature flags / env
- ✅ `IA_ENABLE_EXEC=false` (desactivado por defecto)
- ✅ `IA_EMBEDDINGS_DIM=768` (configurable)
- ✅ Variables de Supabase
- ✅ Documentación de configuración

### 9. Tests mínimos
- ✅ Validación de schemas `AnalyzeSessionIn/Out`
- ✅ Tests de sanitizado PII
- ✅ Tests de gestión de costos
- ✅ Configuración Jest completa

### 10. Documentación
- ✅ `docs/IA_FOUNDATION.md` - Documentación completa
- ✅ `docs/DB_IA.md` - Configuración de base de datos
- ✅ Diagramas Mermaid de arquitectura
- ✅ Ejemplos de uso y troubleshooting

## 🚫 Fuera de Alcance (MVP Fundación)

- ❌ No conectar con UI actual ni botones
- ❌ No ejecutar LLM/STT reales
- ❌ No ingestas RAG ni colas productivas
- ❌ No diarización (evaluado en fase funcional)
- ❌ No permisos de dominio (solo RLS por tenant)

## 🧪 Criterios de Aceptación

- ✅ Todas las migraciones aplican en limpio y revierten
- ✅ Flags por entorno impiden ejecutar IA real
- ✅ `/ai/run` valida contrato y responde estructura mock válida
- ✅ Sanitizado PII disponible y testeado
- ✅ RLS por tenant activa en todas las tablas IA
- ✅ `ai_costs` existe y soporta `recordCost`
- ✅ Tests unit pasando (mínimos definidos)

## 🚀 Próxima Tarea

Cuando esta PR esté aprobada y mergeada, preparar siguiente tarea: **"Implementar el botón 'Analiza con IA' (FREE-FIRST)"** con:

1. Pipeline real en `/ai/run` (activar `IA_ENABLE_EXEC=true` en dev)
2. Carga de transcripción + notas + catálogos
3. Router con `allowPaid=false`
4. Validación de salida y persistencia
5. UI de revisión/guardar

## 📁 Estructura de Archivos

```
packages/
├── ai-router/
│   ├── src/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── providers/
│   │       ├── mock.provider.ts
│   │       ├── ollama.provider.ts
│   │       ├── openai.provider.ts
│   │       ├── anthropic.provider.ts
│   │       └── gemini.provider.ts
│   ├── package.json
│   └── tsconfig.json
├── prompt-kit/
│   ├── src/
│   │   └── index.ts
│   ├── prompts/
│   │   ├── analyze_session.yml
│   │   └── summarize_research.yml
│   ├── package.json
│   └── tsconfig.json
└── supabase/
    └── migrations/
        ├── 20241201000001_ia_foundation_base.sql
        └── 20241201000002_ia_foundation_rls.sql

apps/
└── bff/
    ├── src/
    │   ├── index.ts
    │   ├── types.ts
    │   ├── routes/
    │   │   └── ai.ts
    │   ├── utils/
    │   │   └── sanitize.ts
    │   └── services/
    │       └── costs.ts
    ├── package.json
    └── tsconfig.json

tests/
├── ia_foundation.test.ts
└── setup.ts

docs/
├── IA_FOUNDATION.md
└── DB_IA.md

env.example
jest.config.js
package.json
```

## 🔧 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm test:coverage

# Build de todos los paquetes
npm run build

# Desarrollo con watch
npm run dev

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## 📋 Checklist de Revisión

- [ ] Migraciones aplican correctamente
- [ ] RLS funciona por tenant
- [ ] Endpoints responden con estructura correcta
- [ ] Sanitizado PII funciona
- [ ] Tests pasan
- [ ] Documentación está completa
- [ ] Feature flags respetados
- [ ] No funcionalidades de negocio conectadas
