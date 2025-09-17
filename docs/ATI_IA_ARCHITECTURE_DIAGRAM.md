# Diagrama de Arquitectura Detallado - Sistema de IA

## Arquitectura de Alto Nivel

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Next.js App]
        UI[UI Components]
        DASHBOARD[Dashboard IA]
    end
    
    subgraph "BFF Layer"
        BFF[AI BFF Server]
        AI_RUN[/ai/run]
        COPILOT[/copilot/act]
        WEBHOOKS[/webhooks/*]
        AUTH[Auth Middleware]
    end
    
    subgraph "Router Layer"
        ROUTER[AI Model Router]
        POLICY[Policy Engine]
        CACHE[Result Cache]
        COST[Cost Controller]
    end
    
    subgraph "Provider Layer - FREE"
        OLLAMA[Ollama Local<br/>Llama 3.x]
        WHISPER[Whisper Local<br/>STT]
        EMBEDDINGS[Local Embeddings<br/>nomic-embed]
    end
    
    subgraph "Provider Layer - PAID"
        OPENAI[OpenAI API<br/>GPT-4.1/Embeddings]
        ANTHROPIC[Anthropic API<br/>Claude 3.5]
        GOOGLE[Google AI<br/>Gemini 1.5]
        DEEPGRAM[Deepgram API<br/>STT]
    end
    
    subgraph "Data Layer"
        SUPABASE[(Supabase)]
        VECTORS[(pgvector<br/>Embeddings)]
        TABLES[(AI Tables<br/>ai_runs, insights)]
        RLS[Row Level Security]
    end
    
    subgraph "Processing Layer"
        N8N[n8n Workflows]
        QUEUES[Task Queues<br/>Bull/BullMQ]
        STORAGE[File Storage<br/>Audio/Video]
        TRANSCRIPTION[Transcription Pipeline]
    end
    
    subgraph "Observability"
        LOGS[Structured Logs]
        METRICS[Metrics & Monitoring]
        TRACING[Distributed Tracing]
        ALERTS[Cost Alerts]
    end
    
    %% Connections
    WEB --> BFF
    UI --> BFF
    DASHBOARD --> BFF
    
    BFF --> AUTH
    BFF --> ROUTER
    BFF --> SUPABASE
    
    ROUTER --> POLICY
    ROUTER --> CACHE
    ROUTER --> COST
    
    ROUTER --> OLLAMA
    ROUTER --> WHISPER
    ROUTER --> EMBEDDINGS
    ROUTER --> OPENAI
    ROUTER --> ANTHROPIC
    ROUTER --> GOOGLE
    ROUTER --> DEEPGRAM
    
    ROUTER --> N8N
    N8N --> QUEUES
    N8N --> STORAGE
    N8N --> TRANSCRIPTION
    N8N --> SUPABASE
    
    SUPABASE --> VECTORS
    SUPABASE --> TABLES
    SUPABASE --> RLS
    
    BFF --> LOGS
    ROUTER --> METRICS
    N8N --> TRACING
    COST --> ALERTS
```

## Flujo de Datos - Transcripción

```mermaid
sequenceDiagram
    participant U as Usuario
    participant BFF as AI BFF
    participant R as Router
    participant W as Whisper Local
    participant N as n8n
    participant S as Supabase
    participant Q as Queue
    
    U->>BFF: POST /webhooks/transcripcion
    BFF->>R: Seleccionar proveedor STT
    R->>R: Verificar política (FREE first)
    R->>W: Transcribir audio
    W-->>R: Texto + timestamps
    R->>N: Procesar transcripción
    N->>Q: Encolar análisis
    N->>S: Guardar transcripción
    Q->>R: Analizar texto
    R->>S: Guardar insights
    BFF-->>U: Transcripción completada
```

## Flujo de Datos - RAG Query

```mermaid
sequenceDiagram
    participant U as Usuario
    participant BFF as AI BFF
    participant R as Router
    participant C as Cache
    participant E as Embeddings
    participant V as pgvector
    participant O as Ollama
    
    U->>BFF: POST /ai/run (RAG query)
    BFF->>R: Procesar consulta
    R->>C: Verificar cache
    alt Cache hit
        C-->>R: Resultado cacheado
    else Cache miss
        R->>E: Generar embedding query
        E->>V: Buscar vectores similares
        V-->>E: Documentos relevantes
        E->>O: Generar respuesta con contexto
        O-->>E: Respuesta + citas
        E->>C: Guardar en cache
        E-->>R: Resultado final
    end
    R-->>BFF: Respuesta con citas
    BFF-->>U: Resultado RAG
```

## Flujo de Datos - Copilot Operativo

```mermaid
sequenceDiagram
    participant U as Usuario
    participant BFF as AI BFF
    participant R as Router
    participant O as Ollama
    participant A as Auth
    participant DB as Supabase
    
    U->>BFF: POST /copilot/act
    BFF->>A: Verificar permisos
    A-->>BFF: Permisos OK
    BFF->>R: Procesar intención
    R->>O: Analizar comando
    O-->>R: Intención + parámetros
    R->>BFF: Proponer acción
    BFF-->>U: Solicitar confirmación
    U->>BFF: Confirmar acción
    BFF->>DB: Ejecutar acción
    DB-->>BFF: Resultado
    BFF->>DB: Registrar auditoría
    BFF-->>U: Acción completada
```

## Arquitectura de Despliegue

```mermaid
graph TB
    subgraph "Servidor de Aplicación"
        APP[Next.js App]
        BFF[AI BFF]
        ROUTER[AI Router]
    end
    
    subgraph "Servidor de IA Local"
        OLLAMA[Ollama Service]
        WHISPER[Whisper Service]
        EMBEDDINGS[Embeddings Service]
        GPU[GPU/CUDA]
    end
    
    subgraph "Base de Datos"
        SUPABASE[Supabase Cloud]
        VECTORS[pgvector]
    end
    
    subgraph "Procesamiento"
        N8N[n8n Cloud]
        QUEUES[Redis Queue]
    end
    
    subgraph "Almacenamiento"
        STORAGE[File Storage]
        CACHE[Redis Cache]
    end
    
    subgraph "Monitoreo"
        LOGS[Log Aggregation]
        METRICS[Metrics Dashboard]
    end
    
    APP --> BFF
    BFF --> ROUTER
    ROUTER --> OLLAMA
    ROUTER --> WHISPER
    ROUTER --> EMBEDDINGS
    OLLAMA --> GPU
    WHISPER --> GPU
    
    BFF --> SUPABASE
    SUPABASE --> VECTORS
    
    ROUTER --> N8N
    N8N --> QUEUES
    N8N --> STORAGE
    
    BFF --> CACHE
    ROUTER --> CACHE
    
    BFF --> LOGS
    ROUTER --> METRICS
```

## Matriz de Capacidades por Proveedor

```mermaid
graph LR
    subgraph "FREE/Local"
        O[Ollama<br/>Llama 3.x]
        W[Whisper<br/>Local]
        E[Embeddings<br/>Local]
    end
    
    subgraph "PAID/Cloud"
        OAI[OpenAI<br/>GPT-4.1]
        ANT[Anthropic<br/>Claude 3.5]
        G[Google<br/>Gemini 1.5]
        D[Deepgram<br/>STT]
    end
    
    subgraph "Capacidades"
        T[Texto/JSON]
        S[STT]
        EM[Embeddings]
        V[Visión]
        M[Moderación]
    end
    
    O --> T
    W --> S
    E --> EM
    
    OAI --> T
    OAI --> EM
    OAI --> V
    OAI --> M
    
    ANT --> T
    ANT --> V
    
    G --> T
    G --> V
    
    D --> S
```

---

**Diagramas generados**: $(date)
**Versión**: 1.0
**Estado**: Arquitectura Técnica
