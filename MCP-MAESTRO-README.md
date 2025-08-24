# 🚀 MCP Maestro - Sistema de Control de Cambios

## Descripción
MCP Maestro es un sistema completo para gestionar cambios en tu proyecto de manera controlada y segura, con integración completa de Git y herramientas de desarrollo.

## 📁 Archivos del Sistema

### 1. `mcp-maestro.sh` - Script Principal
Script interactivo con menú para gestionar Git de manera visual.

**Uso:**
```bash
./mcp-maestro.sh
```

**Funciones:**
- 📊 Mostrar estado actual del repositorio
- 📝 Hacer commit de cambios
- 🔄 Deshacer cambios
- 📜 Mostrar historial de commits
- 🚀 Hacer push al repositorio remoto
- 🌿 Crear nueva rama
- 🔄 Cambiar de rama

### 2. `mcp-utils.sh` - Utilidades Avanzadas
Script con funciones avanzadas para desarrollo profesional.

**Uso:**
```bash
./mcp-utils.sh <comando> [argumentos]
```

**Comandos disponibles:**
- `backup` - Crear backup automático
- `check-files` - Verificar archivos importantes
- `pre-commit` - Ejecutar verificaciones pre-commit
- `feature <nombre>` - Crear rama de feature
- `commit <mensaje> [tipo]` - Commit inteligente
- `stats` - Mostrar estadísticas del repositorio
- `cleanup` - Limpiar archivos temporales
- `help` - Mostrar ayuda

### 3. `mcp-config.json` - Configuración
Archivo de configuración JSON con configuraciones del proyecto.

## 🎯 Flujo de Trabajo Recomendado

### Para cambios pequeños:
```bash
# 1. Verificar estado
./mcp-utils.sh check-files

# 2. Hacer cambios en tu código

# 3. Commit inteligente
./mcp-utils.sh commit "Descripción del cambio" feat

# 4. Push
./mcp-maestro.sh  # Opción 5
```

### Para features grandes:
```bash
# 1. Crear rama de feature
./mcp-utils.sh feature "nombre-de-la-feature"

# 2. Hacer cambios

# 3. Verificaciones pre-commit
./mcp-utils.sh pre-commit

# 4. Commit
./mcp-utils.sh commit "Implementar nueva funcionalidad" feat

# 5. Push de la rama
git push -u origin feature/nombre-de-la-feature
```

## 🔧 Tipos de Commit (Conventional Commits)

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Cambios de formato
- `refactor` - Refactorización
- `test` - Tests
- `chore` - Tareas de mantenimiento

## 🛡️ Características de Seguridad

### Backup Automático
- Se crea automáticamente antes de cada commit
- Almacenado en `backups/mcp_YYYYMMDD_HHMMSS/`
- Incluye archivos importantes del proyecto

### Verificaciones Pre-commit
- Linting automático
- Verificación de tipos TypeScript
- Validación de archivos importantes

### Ramas Protegidas
- `main`, `master`, `develop` están protegidas
- Requieren confirmación para cambios

## 📊 Monitoreo y Estadísticas

### Ver estadísticas del repositorio:
```bash
./mcp-utils.sh stats
```

Muestra:
- Rama actual
- Total de commits
- Último commit
- Archivos modificados recientemente
- Contribuidores recientes

## 🧹 Mantenimiento

### Limpiar archivos temporales:
```bash
./mcp-utils.sh cleanup
```

Elimina:
- Archivos `.DS_Store`
- Backups antiguos (más de 7 días)
- `node_modules` si es necesario

## 🚨 Casos de Emergencia

### Deshacer cambios no commiteados:
```bash
./mcp-maestro.sh  # Opción 3
```

### Restaurar desde backup:
```bash
# Listar backups disponibles
ls -la backups/

# Restaurar desde backup específico
cp -r backups/mcp_YYYYMMDD_HHMMSS/* ./
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Corrección rápida de bug
```bash
# Hacer cambio en el código
# Luego:
./mcp-utils.sh commit "Corregir error en API de empresas" fix
```

### Ejemplo 2: Nueva funcionalidad
```bash
./mcp-utils.sh feature "nueva-api-productos"
# Hacer cambios...
./mcp-utils.sh commit "Agregar API para gestión de productos" feat
```

### Ejemplo 3: Documentación
```bash
# Actualizar README
./mcp-utils.sh commit "Actualizar documentación de API" docs
```

## 🔍 Verificación de Estado

### Verificar archivos importantes:
```bash
./mcp-utils.sh check-files
```

### Verificar estado de Git:
```bash
./mcp-maestro.sh  # Opción 1
```

## 💡 Consejos

1. **Siempre usa commits descriptivos** - Describe qué hace el cambio, no solo qué cambió
2. **Haz commits pequeños** - Es mejor hacer varios commits pequeños que uno grande
3. **Usa las verificaciones pre-commit** - Te ayudarán a detectar problemas temprano
4. **Crea ramas para features grandes** - Mantén el main limpio
5. **Revisa las estadísticas regularmente** - Te darán insights sobre el proyecto

## 🆘 Soporte

Si tienes problemas:
1. Revisa el estado con `./mcp-utils.sh check-files`
2. Verifica los logs con `./mcp-maestro.sh` (Opción 4)
3. Usa el backup automático si necesitas restaurar

---

**¡MCP Maestro está listo para ayudarte a gestionar tus cambios de manera profesional y segura! 🚀**
