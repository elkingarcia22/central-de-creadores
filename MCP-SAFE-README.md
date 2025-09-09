# MCP Server Seguro - Central de Creadores

## 🛡️ Versión Segura Sin AutoCommit

Este es un MCP Server **SEGURO** que **NO incluye funcionalidades de autocomit** para evitar problemas con GitHub y hooks.

## ✅ Características de Seguridad

- **SOLO LECTURA**: No incluye comandos de escritura (commit, push, pull)
- **Sin AutoCommit**: Eliminadas todas las funcionalidades automáticas de commit
- **Sin Hooks**: No ejecuta hooks de Git que puedan causar problemas
- **Operaciones Seguras**: Solo permite consultar información

## 🔧 Herramientas Disponibles

### Git (Solo Lectura)
- `git_status`: Muestra el estado actual de Git
- `git_log`: Muestra el historial de commits
- `git_diff`: Muestra las diferencias en el código
- `list_branches`: Lista todas las ramas

### GitHub API (Solo Lectura)
- `get_github_issues`: Obtiene issues de GitHub
- `get_github_pull_requests`: Obtiene pull requests de GitHub

### Supabase
- `test_connection`: Prueba la conexión con Supabase

## 📁 Archivos Creados

1. **`mcp-server-safe.cjs`**: Servidor MCP seguro sin autocomit
2. **`.cursor/mcp-safe.json`**: Configuración MCP segura para Cursor
3. **`MCP-SAFE-README.md`**: Este archivo de documentación

## 🚀 Cómo Usar

### Opción 1: Reemplazar el MCP actual (Recomendado)

1. **Respaldar el MCP actual**:
   ```bash
   mv .cursor/mcp.json .cursor/mcp-backup.json
   ```

2. **Activar el MCP seguro**:
   ```bash
   mv .cursor/mcp-safe.json .cursor/mcp.json
   ```

3. **Reiniciar Cursor**

### Opción 2: Usar ambos MCPs

1. **Mantener el MCP actual** y usar el seguro cuando sea necesario
2. **Cambiar manualmente** entre `mcp.json` y `mcp-safe.json` según necesites

## ⚠️ Importante

- **NO actives el MCP original** hasta que hayas solucionado el problema del autocomit
- **Usa solo el MCP seguro** para operaciones de consulta
- **Para commits manuales**, usa Git directamente desde la terminal

## 🔄 Restaurar MCP Original

Cuando hayas solucionado el problema del autocomit:

```bash
# Restaurar el MCP original
mv .cursor/mcp-backup.json .cursor/mcp.json

# Eliminar archivos seguros (opcional)
rm mcp-server-safe.cjs
rm .cursor/mcp-safe.json
rm MCP-SAFE-README.md
```

## 🧪 Pruebas

Para probar que el MCP seguro funciona:

```bash
# Probar conexión
node mcp-server-safe.cjs test_connection

# Probar estado de Git
node mcp-server-safe.cjs git_status

# Probar historial
node mcp-server-safe.cjs git_log --limit 5
```

## 📝 Notas

- El MCP seguro mantiene todas las funcionalidades de consulta
- Es completamente compatible con Cursor
- No interfiere con operaciones manuales de Git
- Mantiene la conexión con Supabase y GitHub API
