# 🎯 PROMPT ULTRA SIMPLE - ACTIVACIÓN MCP MAESTRO

## 🚀 **PROMPT PARA COPIAR Y PEGAR AL INICIAR CHAT**

```
🎯 ACTIVAR MCP MAESTRO EN MODO AUTOMÁTICO

Ejecuta: cd mcp-system/mcp-maestro && node activate-maestro-fixed.js

Espera hasta ver: "✅ MCP Maestro respondiendo correctamente en puerto 3001"

Verifica con: curl http://localhost:3001/status

El MCP Maestro debe estar funcionando en modo automático.
```

---

## 🎯 **PROMPT EN UNA SOLA LÍNEA**

```
🎯 ACTIVAR MCP MAESTRO: cd mcp-system/mcp-maestro && node activate-maestro-fixed.js
```

---

## 🎯 **PROMPT CON VERIFICACIÓN INCLUIDA**

```
🎯 ACTIVAR Y VERIFICAR MCP MAESTRO: cd mcp-system/mcp-maestro && node activate-maestro-fixed.js && sleep 3 && curl http://localhost:3001/status
```

---

## 🎯 **PROMPT COMPLETO (SI NECESITAS MÁS DETALLES)**

```
🎯 ACTIVAR MCP MAESTRO EN MODO AUTOMÁTICO

Por favor, ejecuta los siguientes comandos para activar el MCP Maestro:

1. Navegar al directorio:
cd mcp-system/mcp-maestro

2. Activar MCP Maestro:
node activate-maestro-fixed.js

3. Esperar hasta ver el mensaje:
"✅ MCP Maestro respondiendo correctamente en puerto 3001"

4. Verificar funcionamiento:
curl http://localhost:3001/status

El MCP Maestro debe estar funcionando en modo automático con todas las características activadas.
```

---

## 🎯 **RESULTADO ESPERADO**

Al ejecutar el comando, debes ver:

```
🎯 ACTIVANDO MCP MAESTRO CORREGIDO
=====================================
🚀 Iniciando servidor MCP Maestro corregido...
✅ MCP Maestro iniciado con PID: [NÚMERO]
🎯 MODO AUTOMÁTICO ACTIVADO
✅ Sin confirmaciones - ejecución automática
✅ Auto-commit activado
✅ Auto-backup activado
✅ Auto-recuperación de contexto activada
✅ Auto-sincronización activada
✅ GitHub automático activado
=====================================
🎯 MCP MAESTRO LISTO PARA ORQUESTAR
🌐 Servidor HTTP iniciado en puerto 3001
📊 Status: http://localhost:3001/status
💚 Health: http://localhost:3001/health
🎯 MCP Maestro funcionando correctamente
✅ MCP Maestro respondiendo correctamente en puerto 3001
```

---

## 🎯 **VERIFICACIÓN RÁPIDA**

```bash
curl http://localhost:3001/status
```

Debe responder con:
```json
{
  "status": "ACTIVE",
  "mode": "auto",
  "auto_mode": true
}
```

---

## 🎯 **RECOMENDACIÓN FINAL**

**Para cada inicio de chat, usar este prompt ultra simple:**

```
🎯 ACTIVAR MCP MAESTRO EN MODO AUTOMÁTICO

Ejecuta: cd mcp-system/mcp-maestro && node activate-maestro-fixed.js

Espera hasta ver: "✅ MCP Maestro respondiendo correctamente en puerto 3001"

Verifica con: curl http://localhost:3001/status

El MCP Maestro debe estar funcionando en modo automático.
```

**🎉 ¡LISTO! MCP MAESTRO FUNCIONANDO PERFECTAMENTE**
