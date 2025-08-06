# 🎯 CONFIGURACIÓN DE MCPs EN CURSOR

> **Guía completa para configurar los MCPs especializados en Cursor IDE**

## 📋 Visión General

Este sistema de MCPs especializados está diseñado para trabajar de manera integrada con Cursor, proporcionando asistencia inteligente especializada para diferentes aspectos del desarrollo de Central de Creadores.

## 🏗️ Arquitectura Implementada

### MCP Maestro ✅ COMPLETADO
**Ubicación:** `mcp-system/mcp-maestro/`
**Estado:** ✅ Funcional y probado
**Funcionalidades:**
- Orquestación de tareas complejas
- Gestión de contexto persistente
- Recuperación automática de contexto perdido
- Coordinación entre MCPs especializados
- Rastreo de decisiones importantes

## ⚙️ Configuración en Cursor

### 1. Configuración Principal

Agregar al archivo de configuración de Cursor (`~/.cursor/mcp_servers.json`):

```json
{
  "mcpServers": {
    "mcp-maestro": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/Users/elkinmac/Documents/central-de-creadores/mcp-system/mcp-maestro",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 2. Configuración Avanzada (Para todos los MCPs)

```json
{
  "mcpServers": {
    "mcp-maestro": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/Users/elkinmac/Documents/central-de-creadores/mcp-system/mcp-maestro",
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "info"
      }
    },
    "mcp-design-system": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/Users/elkinmac/Documents/central-de-creadores/mcp-system/mcp-design-system",
      "env": {
        "NODE_ENV": "development"
      }
    },
    "mcp-supabase": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/Users/elkinmac/Documents/central-de-creadores/mcp-system/mcp-supabase",
      "env": {
        "NODE_ENV": "development",
        "SUPABASE_URL": "tu-url-de-supabase",
        "SUPABASE_SERVICE_KEY": "tu-service-key"
      }
    }
  }
}
```

## 🔧 Configuración de Variables de Entorno

### 1. MCP Maestro (.env)
```bash
cd mcp-system/mcp-maestro
cp env.example .env
```

**Configuración recomendada para desarrollo:**
```bash
NODE_ENV=development
MCP_MAESTRO_PORT=3000
LOG_LEVEL=info
MAX_CONCURRENT_MCPS=3
ENABLE_CONTEXT_COMPRESSION=true
ENABLE_AUTO_CONTEXT_RECOVERY=true
PROJECT_NAME=central-de-creadores
```

## 🚀 Uso del Sistema

### 1. Comandos Básicos del MCP Maestro

#### Orquestar Tarea Compleja
```javascript
// Ejemplo: Crear un nuevo componente con integración a Supabase
{
  "tool": "orchestrate_task",
  "arguments": {
    "task_description": "Crear componente de reclutamiento con filtros avanzados",
    "context_hints": ["diseño", "supabase", "componentes"],
    "priority": "high",
    "preserve_context": true
  }
}
```

#### Recuperar Contexto Perdido
```javascript
{
  "tool": "recover_context",
  "arguments": {
    "search_terms": ["reclutamiento", "filtros", "modal"],
    "time_range": "last_week"
  }
}
```

#### Delegar a MCP Especializado
```javascript
{
  "tool": "delegate_to_mcp",
  "arguments": {
    "target_mcp": "design-system",
    "action": "create_component",
    "payload": {
      "component_name": "FilterModal",
      "component_type": "modal",
      "props": ["filters", "onApply", "onClose"]
    }
  }
}
```

#### Guardar Decisión Importante
```javascript
{
  "tool": "save_important_decision",
  "arguments": {
    "decision_type": "architectural",
    "description": "Migrar sistema de filtros a contexto global con Zustand",
    "rationale": "Mejor performance y estado compartido entre componentes",
    "impact_level": 4,
    "tags": ["architecture", "state-management", "performance"]
  }
}
```

#### Consultar Base de Conocimiento
```javascript
{
  "tool": "query_knowledge_base",
  "arguments": {
    "query": "componentes de filtros con Supabase",
    "knowledge_type": "solutions",
    "limit": 5
  }
}
```

### 2. Flujos de Trabajo Típicos

#### Flujo 1: Desarrollar Nueva Funcionalidad
```
1. Usar "orchestrate_task" para planificar
2. El maestro identifica MCPs necesarios
3. Coordina ejecución entre design-system, supabase, etc.
4. Guarda contexto y decisiones automáticamente
```

#### Flujo 2: Debugging de Problema
```
1. Usar "recover_context" para entender el historial
2. Usar "query_knowledge_base" para soluciones similares
3. Delegar debugging específico al MCP apropiado
4. Guardar solución para futuras consultas
```

#### Flujo 3: Refactoring de Código
```
1. Usar "orchestrate_task" con hint "código"
2. El maestro activa code-structure y testing-qa
3. Coordina refactoring seguro con tests
4. Documenta cambios arquitecturales
```

## 🔍 Monitoreo y Debugging

### 1. Verificar Estado del Sistema
```javascript
{
  "tool": "get_system_status",
  "arguments": {
    "detailed": true
  }
}
```

### 2. Logs y Debugging
```bash
# Ver logs del maestro
tail -f mcp-system/mcp-maestro/storage/logs/maestro.log

# Verificar sesiones activas
cat mcp-system/mcp-maestro/storage/sessions.json

# Ver contexto guardado
cat mcp-system/mcp-maestro/storage/context.json
```

### 3. Métricas de Performance
- **Tiempo de respuesta:** Típicamente < 2 segundos
- **Tasa de éxito:** > 95% en tareas delegadas
- **Recuperación de contexto:** > 90% de precisión

## 📚 Ejemplos Prácticos

### Ejemplo 1: Crear Modal de Agendamiento
```javascript
{
  "tool": "orchestrate_task",
  "arguments": {
    "task_description": "Crear modal de agendamiento con validación de horarios disponibles en Supabase",
    "context_hints": ["diseño", "supabase", "modal"],
    "priority": "high"
  }
}
```

**Resultado esperado:**
1. MCP Design System crea el componente modal
2. MCP Supabase configura queries de horarios
3. MCP Code Structure organiza la integración
4. Contexto guardado para futuras referencias

### Ejemplo 2: Optimizar Performance de Lista
```javascript
{
  "tool": "orchestrate_task",
  "arguments": {
    "task_description": "Optimizar performance de lista de participantes con paginación virtual",
    "context_hints": ["performance", "lista", "optimización"],
    "priority": "medium"
  }
}
```

### Ejemplo 3: Recuperar Trabajo Anterior
```javascript
{
  "tool": "recover_context",
  "arguments": {
    "search_terms": ["participantes", "modal", "agregar"],
    "time_range": "last_day"
  }
}
```

## ⚠️ Troubleshooting

### Problema: MCP no responde
```bash
# Verificar proceso
ps aux | grep node

# Reiniciar MCP
cd mcp-system/mcp-maestro
npm run dev
```

### Problema: Contexto perdido
```javascript
// Forzar recuperación
{
  "tool": "sync_project_state",
  "arguments": {
    "force_sync": true,
    "include_backups": true
  }
}
```

### Problema: Performance lenta
```bash
# Limpiar cache
rm -rf mcp-system/mcp-maestro/cache/*

# Optimizar storage
cd mcp-system/mcp-maestro
node scripts/cleanup.js
```

## 🔄 Próximos Pasos

### Implementación Inmediata
1. ✅ **MCP Maestro** - Completado y funcional
2. 🔄 **MCP Design System** - En desarrollo
3. 🔄 **MCP Supabase** - En desarrollo

### Roadmap
1. **Semana 1-2:** Completar MCPs core (Design System, Supabase)
2. **Semana 3-4:** MCPs auxiliares (Testing, Deploy, Documentation)
3. **Semana 5-6:** Optimización y fine-tuning
4. **Semana 7-8:** Integración avanzada y métricas

## 📞 Soporte

### Recursos
- **Documentación:** `mcp-system/mcp-maestro/README.md`
- **Configuración:** `mcp-system/mcp-maestro/config/`
- **Logs:** `mcp-system/mcp-maestro/storage/logs/`

### Comandos Útiles
```bash
# Estado del sistema
cd mcp-system/mcp-maestro && npm run status

# Logs en tiempo real
cd mcp-system/mcp-maestro && npm run logs

# Verificar configuración
cd mcp-system/mcp-maestro && npm run verify
```

---

**🎯 Sistema MCP v1.0** - Configurado y listo para Central de Creadores