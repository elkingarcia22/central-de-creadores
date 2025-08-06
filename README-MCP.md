# 🚀 MCP HÍBRIDO - Central de Creadores

## 📋 Descripción

El **MCP Híbrido para Central de Creadores** es un asistente inteligente que combina herramientas técnicas avanzadas con guías paso a paso para principiantes. Está diseñado para:

- 🛡️ **Proteger tus datos** con backups automáticos y validaciones
- 📚 **Documentar todo** automáticamente para mantener el proyecto organizado
- 🔍 **Analizar inteligentemente** tus solicitudes para darte la mejor guía
- 🚀 **Migrar de forma segura** de desarrollo local a producción
- 🎯 **Guiar paso a paso** a usuarios principiantes sin asumir conocimientos técnicos

## 🎯 **¿Para Quién es el MCP Híbrido?**

### ✅ **Para Principiantes (No-Code):**
- No necesitas conocimientos técnicos
- Te guía paso a paso en todo
- Explica cada acción antes de hacerla
- Nunca asume información que no tiene
- Hace backup automático de todo

### ✅ **Para Desarrolladores:**
- Herramientas técnicas avanzadas
- Análisis profundo de código y base de datos
- Generación automática de componentes y APIs
- Testing y debugging integrado
- Documentación automática

### ✅ **Para Equipos:**
- Documentación centralizada y actualizada
- Migración guiada entre entornos
- Validación de cambios antes de ejecutar
- Historial completo de modificaciones
- Base de conocimiento compartida

## 🎯 Características Principales

### 🛡️ **Herramientas de Seguridad (NUEVAS)**
- **Backup automático**: Crea backups antes de cualquier cambio
- **Validación de cambios**: Verifica impacto antes de ejecutar
- **Guía paso a paso**: Te acompaña en cada proceso
- **Protección de datos**: Nunca modifica sin confirmación

### 🎨 **Herramientas del Sistema de Diseño (NUEVAS)**
- **Análisis del sistema**: Revisa colores, componentes y estructura
- **Validación de colores**: Verifica consistencia con el sistema
- **Documentación automática**: Registra nuevos componentes
- **Paleta de colores**: Actualiza y mantiene colores
- **Cumplimiento de diseño**: Verifica reglas del sistema
- **Tokens de diseño**: Genera tokens CSS automáticamente
- **Estructura de componentes**: Valida mejores prácticas
- **Accesibilidad WCAG**: Analiza según estándares AA
- **Modos claro/oscuro**: Optimiza para ambos temas
- **Mejoras propuestas**: Sugiere optimizaciones específicas

### 📋 **Herramientas de Análisis Inteligente (NUEVAS)**
- **Análisis de solicitudes**: Entiende lo que necesitas
- **Verificación de documentación**: Busca información existente
- **Solicitud de datos**: Pide información cuando no la tiene
- **No asume nada**: Siempre pregunta si no está seguro

### 📚 **Herramientas de Documentación Automática (NUEVAS)**
- **Documentación centralizada**: Mantiene todo organizado
- **Actualización automática**: Registra cambios automáticamente
- **Base de conocimiento**: Busca y actualiza información
- **Historial completo**: Mantiene registro de todo

### 🚀 **Herramientas de Migración Guiada (NUEVAS)**
- **Migración local a nube**: Guía completa paso a paso
- **Scripts de migración**: Genera y ejecuta scripts seguros
- **Validación post-migración**: Verifica que todo funcione
- **Rollback disponible**: Puede revertir si algo sale mal

### 🔧 **Herramientas de Base de Datos (MEJORADAS)**
- **Análisis de estructura**: Verificación completa de tablas, columnas y relaciones
- **Gestión de datos**: Inserción, actualización y backup de datos
- **Vistas y triggers**: Creación y mantenimiento de vistas y triggers automáticos
- **Diagnóstico**: Detección de problemas comunes en la estructura de BD
- **Documentación de tablas**: Registra estructura automáticamente
- **Políticas RLS**: Documenta y verifica políticas de seguridad

### 🎨 **Herramientas de Desarrollo Frontend**
- **Análisis de componentes**: Verificación de estructura de componentes React
- **Generación de código**: Creación automática de componentes, tipos y endpoints
- **Verificación de tipos**: Análisis de tipos TypeScript y dependencias
- **Testing**: Ejecución de tests y debugging de código

### 📊 **Herramientas de API**
- **Verificación de endpoints**: Análisis de estructura y funcionalidad de APIs
- **Generación de endpoints**: Creación automática de endpoints REST
- **Testing de APIs**: Pruebas automatizadas de endpoints

### 📚 **Herramientas de Documentación (MEJORADAS)**
- **Generación de documentación**: Creación automática de documentación técnica
- **Base de conocimiento**: Actualización de la KB del proyecto
- **Logs de migración**: Documentación de cambios en la base de datos
- **Entradas de conocimiento**: Crea y actualiza información
- **Búsqueda inteligente**: Encuentra información rápidamente

## 🛠️ Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- Acceso a Supabase (URL y API keys)

### Configuración

1. **Clonar el repositorio**:
```bash
git clone https://github.com/central-de-creadores/mcp-server.git
cd mcp-server
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

4. **Configurar MCP en tu cliente**:
```json
{
  "mcpServers": {
    "central-de-creadores": {
      "command": "node",
      "args": ["central-de-creadores-mcp.js"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_ANON_KEY": "${SUPABASE_ANON_KEY}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

## 🎮 Uso

### Herramientas Disponibles

#### 🔍 Análisis de Base de Datos

**`analyze_database_structure`**
```json
{
  "table_name": "investigaciones"
}
```

**`verify_table_structure`**
```json
{
  "table_name": "usuarios",
  "expected_columns": ["id", "nombre", "correo", "activo"]
}
```

**`check_foreign_keys`**
```json
{
  "table_name": "reclutamientos"
}
```

#### 📝 Gestión de Datos

**`execute_sql_query`**
```json
{
  "sql_query": "SELECT * FROM investigaciones WHERE estado = 'en_progreso'",
  "description": "Obtener investigaciones en progreso"
}
```

**`insert_test_data`**
```json
{
  "table_name": "participantes",
  "data": {
    "nombre": "Juan Pérez",
    "rol_empresa_id": "uuid-here",
    "empresa_id": "uuid-here"
  },
  "description": "Insertar participante de prueba"
}
```

#### 🎨 Generación de Código

**`generate_component`**
```json
{
  "component_name": "InvestigacionCard",
  "component_type": "functional",
  "props": ["investigacion", "onEdit", "onDelete"],
  "description": "Componente para mostrar tarjeta de investigación"
}
```

**`generate_api_endpoint`**
```json
{
  "endpoint_name": "investigaciones",
  "method": "GET",
  "table_name": "investigaciones",
  "operations": ["list", "filter", "search"],
  "description": "Endpoint para gestionar investigaciones"
}
```

#### 📊 Testing y Debugging

**`run_tests`**
```json
{
  "test_type": "unit"
}
```

**`debug_sql_query`**
```json
{
  "sql_query": "SELECT * FROM vista_reclutamientos_completa LIMIT 5",
  "table_name": "reclutamientos",
  "expected_result": {
    "row_count": 5,
    "has_data": true
  }
}
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Base de Datos

#### Tablas Principales
- **`usuarios`**: Usuarios del sistema (correo, nombre, rol_plataforma)
- **`investigaciones`**: Investigaciones de usuarios (nombre, estado, fechas)
- **`participantes`**: Participantes externos (nombre, rol_empresa_id, empresa_id)
- **`participantes_internos`**: Participantes internos (nombre, email, rol_empresa_id)
- **`reclutamientos`**: Relación investigaciones-participantes
- **`empresas`**: Clientes y empresas participantes
- **`libretos_investigacion`**: Libretos de investigación

#### Vistas Importantes
- **`vista_reclutamientos_completa`**: Vista principal para reclutamientos
- **`vista_investigaciones_con_usuarios`**: Investigaciones con datos de usuarios

#### Triggers Automáticos
- **Trigger de estados**: Actualiza automáticamente estados de reclutamiento
- **Trigger de libretos**: Crea reclutamientos automáticamente

### Estructura Frontend

#### Componentes Principales
- **`CrearReclutamientoModal`**: Modal principal de reclutamiento
- **`CrearParticipanteInternoModal`**: Modal para participantes internos
- **`CrearParticipanteExternoModal`**: Modal para participantes externos
- **`InvestigacionCard`**: Tarjeta de investigación
- **`DataTable`**: Tabla de datos reutilizable

#### Tipos TypeScript
- **`investigaciones.ts`**: Tipos para módulo de investigaciones
- **`reclutamientos.ts`**: Tipos para módulo de reclutamiento
- **`libretos.ts`**: Tipos para libretos de investigación
- **`usuarios.ts`**: Tipos para usuarios del sistema

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Desarrollo
NODE_ENV=development
DEBUG=true

# Logging
LOG_LEVEL=info
```

### Configuración de RLS

El MCP incluye herramientas para gestionar Row Level Security (RLS):

```sql
-- Ejemplo de política RLS
CREATE POLICY "Usuarios pueden ver sus propios datos" ON usuarios
FOR SELECT USING (auth.uid() = id);
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="database"
```

### Debugging
```bash
# Modo debug
DEBUG=true npm start

# Logs detallados
LOG_LEVEL=debug npm start
```

## 📚 Documentación

### Generar Documentación
```json
{
  "module_name": "reclutamiento",
  "documentation_type": "api",
  "content": "Documentación del módulo de reclutamiento..."
}
```

### Actualizar Base de Conocimiento
```json
{
  "change_type": "table_modification",
  "entity_name": "participantes",
  "new_structure": {
    "columns": ["id", "nombre", "email", "rol_empresa_id"]
  },
  "description": "Agregada columna email a participantes"
}
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Supabase
```
Error: Variables de entorno de Supabase no configuradas
```
**Solución**: Verificar que las variables de entorno estén configuradas correctamente.

#### Error de Permisos
```
Error: permission denied for table
```
**Solución**: Verificar políticas RLS y permisos de usuario.

#### Error de Tipos TypeScript
```
Error: Type 'X' is not assignable to type 'Y'
```
**Solución**: Usar `analyze_typescript_types` para verificar tipos.

### Logs y Debugging

El MCP incluye logging detallado:

```bash
# Ver logs en tiempo real
tail -f mcp-server.log

# Filtrar logs por herramienta
grep "analyze_database_structure" mcp-server.log
```

## 🤝 Contribución

### Desarrollo Local

1. **Fork del repositorio**
2. **Crear rama de feature**: `git checkout -b feature/nueva-herramienta`
3. **Implementar cambios**
4. **Ejecutar tests**: `npm test`
5. **Crear pull request**

### Estándares de Código

- **ESLint**: Configuración incluida
- **Prettier**: Formateo automático
- **TypeScript**: Tipos estrictos
- **Jest**: Tests unitarios

### Agregar Nuevas Herramientas

1. **Definir en `mcp-tools.json`**
2. **Implementar en `central-de-creadores-mcp.js`**
3. **Agregar tests**
4. **Actualizar documentación**

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/central-de-creadores/mcp-server/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/central-de-creadores/mcp-server/wiki)
- **Discord**: [Servidor de la comunidad](https://discord.gg/central-de-creadores)

## 🔄 Changelog

### v1.0.0 (2025-01-20)
- ✨ Implementación inicial del MCP Server
- 🔧 Herramientas de análisis de base de datos
- 🎨 Herramientas de generación de código
- 📊 Herramientas de testing y debugging
- 📚 Herramientas de documentación

---

**Desarrollado con ❤️ por el equipo de Central de Creadores** 