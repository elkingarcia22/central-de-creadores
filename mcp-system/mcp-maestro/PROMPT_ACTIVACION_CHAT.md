# 🎯 PROMPT DE ACTIVACIÓN MCP MAESTRO - INICIO DE CHAT

## 🚀 **ACTIVACIÓN INMEDIATA AL INICIAR CHAT**

### 📋 **COMANDO ÚNICO DE ACTIVACIÓN**
```bash
cd mcp-system/mcp-maestro && node activate-maestro-fixed.js
```

### 🔧 **VERIFICACIÓN RÁPIDA**
```bash
curl -s http://localhost:3001/health
```

---

## 🎯 **INSTRUCCIONES PASO A PASO**

### 1️⃣ **NAVEGAR AL DIRECTORIO**
```bash
cd mcp-system/mcp-maestro
```

### 2️⃣ **ACTIVAR MCP MAESTRO**
```bash
node activate-maestro-fixed.js
```

### 3️⃣ **ESPERAR ACTIVACIÓN COMPLETA**
- ✅ Ver mensaje: "MCP Maestro respondiendo correctamente en puerto 3001"
- ✅ Ver mensaje: "🎯 MCP MAESTRO LISTO PARA ORQUESTAR"

### 4️⃣ **VERIFICAR FUNCIONAMIENTO**
```bash
curl http://localhost:3001/status
```

---

## 🎯 **PROMPT COMPLETO PARA COPIAR Y PEGAR**

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

## 🎯 **PROMPT SIMPLIFICADO (UNA SOLA LÍNEA)**

```
🎯 ACTIVAR MCP MAESTRO: cd mcp-system/mcp-maestro && node activate-maestro-fixed.js
```

---

## 🎯 **PROMPT CON VERIFICACIÓN INCLUIDA**

```
🎯 ACTIVAR Y VERIFICAR MCP MAESTRO:

cd mcp-system/mcp-maestro && node activate-maestro-fixed.js

Esperar activación completa, luego verificar:
curl http://localhost:3001/status
```

---

## 🚨 **SI HAY PROBLEMAS**

### ❌ **Error: "No se encontró server-fixed.js"**
- El script lo creará automáticamente
- Solo esperar a que termine la creación

### ❌ **Error: "Puerto 3001 en uso"**
```bash
# Cambiar puerto
export MCP_PORT=3002
node activate-maestro-fixed.js
```

### ❌ **Error: "Módulo no encontrado"**
```bash
# Instalar dependencias
npm install chalk
```

---

## 🎯 **RESULTADO ESPERADO**

### ✅ **ACTIVACIÓN EXITOSA**
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

### 🌐 **VERIFICACIÓN EXITOSA**
```bash
curl http://localhost:3001/status
# Debe responder con estado "ACTIVE" y modo "auto"
```

---

## 🎯 **CARACTERÍSTICAS ACTIVADAS AUTOMÁTICAMENTE**

- ✅ **Modo Automático**: Sin confirmaciones manuales
- ✅ **Auto-ejecución**: Comandos se ejecutan automáticamente
- ✅ **Auto-commit**: Cambios se guardan automáticamente en Git
- ✅ **Auto-backup**: Respaldo automático del sistema
- ✅ **Auto-recuperación**: Contexto se recupera automáticamente
- ✅ **Auto-sincronización**: Sincronización automática con repositorios
- ✅ **GitHub Automático**: Control de versiones automático

---

## 🎯 **PROMPT FINAL RECOMENDADO**

**Para cada inicio de chat, usar este prompt:**

```
🎯 ACTIVAR MCP MAESTRO EN MODO AUTOMÁTICO

Ejecuta: cd mcp-system/mcp-maestro && node activate-maestro-fixed.js

Espera hasta ver: "✅ MCP Maestro respondiendo correctamente en puerto 3001"

Verifica con: curl http://localhost:3001/status

El MCP Maestro debe estar funcionando en modo automático.
```

---

## 🎯 **RESUMEN**

**Para activar el MCP Maestro sin errores al iniciar cada chat:**

1. **Copiar y pegar** el prompt recomendado
2. **Ejecutar** el comando de activación
3. **Esperar** la confirmación completa
4. **Verificar** el funcionamiento

**🎉 MCP MAESTRO FUNCIONANDO PERFECTAMENTE EN MODO AUTOMÁTICO**
