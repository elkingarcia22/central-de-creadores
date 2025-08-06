# DOCUMENTACIÓN COMPLETA: SISTEMA DE PARTICIPANTES Y RECLUTAMIENTOS

## 📋 RESUMEN EJECUTIVO

Hemos implementado un sistema robusto de participantes y reclutamientos que separa claramente los participantes internos de los externos, manteniendo la integridad de datos y métricas diferenciadas.

## 🏗️ ARQUITECTURA DEL SISTEMA

### Tablas Principales

#### 1. `participantes` (Clientes Externos)
- **Propósito**: Almacena participantes externos (clientes de otras empresas)
- **Campos clave**:
  - `id` (UUID, PK)
  - `nombre` (TEXT)
  - `email` (TEXT)
  - `empresa_id` (UUID, FK a `empresas`)
  - `rol_empresa_id` (UUID, FK a `roles_empresa`)
  - `tipo` (TEXT) - siempre 'externo'
  - `productos_relacionados` (JSONB)

#### 2. `participantes_internos` (Clientes Internos)
- **Propósito**: Almacena participantes internos (empleados de la empresa)
- **Campos clave**:
  - `id` (UUID, PK)
  - `nombre` (TEXT)
  - `email` (TEXT)
  - `departamento_id` (UUID, FK a `departamentos`)
  - `rol_empresa_id` (UUID, FK a `roles_empresa`)
  - `tipo` (TEXT) - siempre 'interno'

#### 3. `reclutamientos` (Tabla de Unión)
- **Propósito**: Conecta investigaciones con participantes
- **Campos clave**:
  - `id` (UUID, PK)
  - `investigacion_id` (UUID, FK)
  - `participantes_id` (UUID, FK a `participantes`) - NULLABLE
  - `participantes_internos_id` (UUID, FK a `participantes_internos`) - NULLABLE
  - `tipo_participante` (TEXT CHECK ('interno', 'externo'))
  - `reclutador_id` (UUID, FK a `usuarios`)
  - `estado_agendamiento` (UUID, FK a `estado_agendamiento_cat`)
  - `fecha_sesion` (TIMESTAMP)
  - `duracion_sesion` (INTEGER)

#### 4. `departamentos` (Catálogo)
- **Propósito**: Catálogo de departamentos para participantes internos
- **Campos clave**:
  - `id` (UUID, PK)
  - `nombre` (TEXT, UNIQUE)
  - `categoria` (TEXT)
  - `orden` (INTEGER)
  - `activo` (BOOLEAN)

## 🔧 PROBLEMAS RESUELTOS Y SOLUCIONES

### 1. Separación de Tablas de Participantes

**Problema**: Inicialmente se intentó migrar `participantes_internos` a `participantes` con un campo `tipo`, pero esto violaba el requerimiento de separación para métricas diferenciadas.

**Solución**: 
- Mantener tablas separadas: `participantes` (externos) y `participantes_internos` (internos)
- Modificar `reclutamientos` para soportar ambos tipos con campos separados
- Implementar lógica condicional en frontend y API

**Archivos modificados**:
- `modificar-tabla-reclutamientos-separar-internos-externos.sql`
- `src/pages/api/reclutamientos.ts`
- `src/pages/api/participantes-reclutamiento.ts`

### 2. Estructura de `participantes_internos`

**Problema**: La tabla tenía campos innecesarios para participantes internos.

**Solución**: 
- Eliminar: `apellidos`, `empresa_id`, `cargo`, `telefono`
- Mantener: `nombre`, `email`, `departamento_id`, `rol_empresa_id`
- Convertir `departamento` de texto a FK a tabla `departamentos`

**Archivos modificados**:
- `modificar-tabla-participantes-internos.sql`
- `src/components/ui/CrearParticipanteInternoModal.tsx`
- `src/pages/reclutamiento/crear.tsx`

### 3. Sistema de Departamentos

**Problema**: Necesitábamos un catálogo de departamentos con búsqueda y categorización.

**Solución**:
- Crear tabla `departamentos` con 96 departamentos organizados por categorías
- Implementar componente `DepartamentoSelect` con búsqueda y categorización
- Integrar con el sistema de diseño existente

**Archivos creados/modificados**:
- `crear-tabla-departamentos-final.sql`
- `src/components/ui/DepartamentoSelect.tsx`
- `src/pages/api/departamentos.ts`

### 4. Foreign Keys Duplicados

**Problema**: Supabase generaba automáticamente FKs duplicados causando errores de embedding.

**Solución**:
- Eliminar FK automático: `participantes_internos_departamento_id_fkey`
- Mantener FK manual: `fk_participantes_internos_departamento`
- Actualizar queries para usar el FK correcto

**Archivos modificados**:
- `limpiar-foreign-keys-duplicados.sql`
- `src/pages/api/participantes-internos.ts`

### 5. Row Level Security (RLS)

**Problema**: Las APIs no podían acceder a datos debido a RLS habilitado.

**Solución**:
- Crear cliente Supabase específico para servidor: `src/api/supabase-server.ts`
- Usar `SUPABASE_SERVICE_KEY` para bypass RLS en APIs
- Mantener cliente público para frontend con RLS

**Archivos creados/modificados**:
- `src/api/supabase-server.ts`
- `src/pages/api/participantes-reclutamiento.ts`
- `src/pages/api/actualizar-estados-reclutamiento.ts`

### 6. Mapeo de Datos en API

**Problema**: El API no devolvía datos completos para participantes externos (empresa, rol).

**Solución**:
- Implementar queries separadas para `empresas` y `roles_empresa`
- Mapear datos correctamente según `tipo_participante`
- Manejar casos donde `empresa_id` es NULL

**Archivos modificados**:
- `src/pages/api/participantes-reclutamiento.ts`

### 7. Restricciones NOT NULL

**Problema**: `participantes_id` tenía restricción NOT NULL, pero necesitábamos soportar participantes internos.

**Solución**:
- Hacer `participantes_id` nullable: `ALTER COLUMN participantes_id DROP NOT NULL`
- Validar que al menos un ID de participante esté presente
- Implementar lógica condicional en frontend y API

**Archivos modificados**:
- `permitir-null-participantes-id.sql`
- `src/pages/api/reclutamientos.ts`

## 🎨 FRONTEND Y UX

### Cards de Participantes

**Estructura**:
- **Título**: Nombre del participante o "Agendamiento Pendiente" para estado pendiente
- **Badge**: "Cliente Interno" o "Cliente Externo"
- **Datos específicos por tipo**:
  - **Internos**: Departamento, Tipo de Empleado
  - **Externos**: Empresa, Rol en la Empresa, Cargo (si existe)
- **Datos comunes**: Responsable del Agendamiento, Fecha/Hora de Sesión, Estado

**Estados de Agendamiento**:
- **Pendiente de agendamiento**: Layout especial con información de responsable
- **Otros estados**: Layout estándar con datos completos

### Componentes Reutilizables

- `DepartamentoSelect`: Dropdown con búsqueda y categorización
- `CrearParticipanteInternoModal`: Modal para crear participantes internos
- `CrearReclutamientoModal`: Modal para crear reclutamientos

## 🔄 FLUJO DE DATOS

### 1. Creación de Participante Interno
```
Frontend → CrearParticipanteInternoModal → /api/participantes-internos (POST) → Supabase
```

### 2. Creación de Reclutamiento
```
Frontend → CrearReclutamientoModal → /api/reclutamientos (POST) → Supabase
```

### 3. Visualización de Participantes
```
Frontend → /api/participantes-reclutamiento (GET) → Supabase → Mapeo de datos → Frontend
```

## 🛡️ SEGURIDAD Y VALIDACIONES

### RLS (Row Level Security)
- **Frontend**: Usa cliente público con RLS habilitado
- **APIs**: Usa cliente servidor sin RLS para operaciones internas

### Validaciones
- Al menos un ID de participante debe estar presente en reclutamientos
- `tipo_participante` debe ser 'interno' o 'externo'
- IDs de participantes deben existir en sus respectivas tablas

## 📊 MÉTRICAS Y REPORTES

### Separación de Datos
- **Participantes externos**: Métricas de clientes de otras empresas
- **Participantes internos**: Métricas de empleados internos
- **Reportes diferenciados**: Permite análisis separado por tipo

### Campos de Seguimiento
- `fecha_asignado`: Cuándo se asignó el reclutamiento
- `fecha_sesion`: Cuándo se realizará la sesión
- `estado_agendamiento`: Estado actual del agendamiento
- `responsable_agendamiento`: Quién está a cargo del agendamiento

## 🔧 MANTENIMIENTO Y ESCALABILIDAD

### Para Agregar Nuevos Tipos de Cliente

1. **Crear nueva tabla**: `participantes_[tipo]`
2. **Modificar `reclutamientos`**: Agregar `participantes_[tipo]_id` y actualizar CHECK constraint
3. **Actualizar APIs**: Modificar lógica de mapeo en `/api/participantes-reclutamiento`
4. **Actualizar frontend**: Agregar lógica condicional en cards
5. **Documentar**: Actualizar esta documentación

### Convenciones de Nomenclatura
- Tablas: `participantes_[tipo]`
- Campos FK: `participantes_[tipo]_id`
- Tipos: usar el nombre del tipo en minúsculas

## 🚨 LECCIONES APRENDIDAS

### 1. No Asumir Estructura de Base de Datos
- Siempre verificar la estructura real con queries directos
- Documentar diferencias entre documentación y implementación real

### 2. Separación de Responsabilidades
- Mantener tablas separadas para métricas diferenciadas
- Usar clientes Supabase apropiados (público vs servidor)

### 3. Validación de Datos
- Implementar validaciones tanto en frontend como backend
- Manejar casos edge (NULL values, datos faltantes)

### 4. Documentación
- Documentar cada cambio y su justificación
- Mantener documentación actualizada con la implementación real

## 📝 ARCHIVOS CLAVE

### Base de Datos
- `modificar-tabla-reclutamientos-separar-internos-externos.sql`
- `crear-tabla-departamentos-final.sql`
- `permitir-null-participantes-id.sql`

### APIs
- `src/pages/api/participantes-reclutamiento.ts`
- `src/pages/api/reclutamientos.ts`
- `src/pages/api/participantes-internos.ts`

### Frontend
- `src/pages/reclutamiento/ver/[id].tsx`
- `src/components/ui/DepartamentoSelect.tsx`
- `src/components/ui/CrearParticipanteInternoModal.tsx`

### Configuración
- `src/api/supabase-server.ts`
- `src/api/supabase.ts`

---

**Última actualización**: 27 de Julio, 2025
**Estado**: ✅ Implementado y funcionando
**Próximos pasos**: Agregar 2 nuevos tipos de cliente siguiendo esta misma lógica 