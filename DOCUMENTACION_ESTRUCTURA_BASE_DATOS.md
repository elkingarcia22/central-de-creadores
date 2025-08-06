# DOCUMENTACIÓN COMPLETA - ESTRUCTURA DE BASE DE DATOS Y MÓDULOS

## 📋 ÍNDICE
1. [Estructura General del Sistema](#estructura-general)
2. [Tablas Principales](#tablas-principales)
3. [Relaciones entre Tablas](#relaciones)
4. [Módulos de la Aplicación](#módulos)
5. [Vistas Importantes](#vistas)
6. [Triggers y Automatizaciones](#triggers)
7. [Problemas Comunes y Soluciones](#problemas-comunes)
8. [Scripts de Diagnóstico](#scripts-diagnóstico)

---

## 🏗️ ESTRUCTURA GENERAL DEL SISTEMA

### Tecnologías Utilizadas
- **Frontend**: Next.js 15.3.5 con TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **UI**: Tailwind CSS + Componentes personalizados

### Arquitectura
- **Middleware**: Deshabilitado temporalmente para desarrollo
- **API Routes**: `/api/` para endpoints de métricas y operaciones
- **Páginas**: Sistema de rutas basado en archivos de Next.js
- **Contextos**: UserContext, RolContext, ThemeContext, ToastContext

---

## 📊 TABLAS PRINCIPALES

### 1. TABLA: `usuarios`
```sql
-- Estructura real verificada
{
  "id": "uuid (PK)",
  "nombre": "text (nullable)",
  "correo": "text",
  "foto_url": "text (nullable)",
  "activo": "boolean",
  "rol_plataforma": "text (nullable)",
  "borrado_manual": "boolean"
}
```

**Notas importantes:**
- La columna se llama `correo`, NO `email`
- `nombre` puede ser NULL
- No existe `apellidos` ni `email`

### 2. TABLA: `investigaciones`
```sql
-- Estructura real verificada
{
  "id": "uuid (PK)",
  "nombre": "text",
  "fecha_inicio": "timestamp with time zone",
  "fecha_fin": "timestamp without time zone",
  "periodo_id": "uuid (FK)",
  "producto_id": "uuid (FK)",
  "responsable_id": "uuid (FK)",
  "tipo_investigacion_id": "uuid (FK)",
  "estado_reclutamiento": "text (nullable)",
  "riesgo": "text (nullable)",
  "libreto": "text (nullable)",
  "tipo_prueba": "text (nullable)",
  "plataforma": "text (nullable)",
  "link_prueba": "text (nullable)",
  "link_resultados": "text (nullable)",
  "fecha_seguimiento": "timestamp (nullable)",
  "notas_seguimiento": "text (nullable)",
  "creado_por": "uuid (FK)",
  "creado_el": "timestamp with time zone",
  "actualizado_el": "timestamp with time zone",
  "implementador_id": "uuid (FK)",
  "estado": "enum (en_borrador, en_progreso, etc.)",
  "tipo_sesion": "text (nullable)",
  "riesgo_automatico": "text",
  "descripcion": "text (nullable)"
}
```

**Notas importantes:**
- La columna se llama `nombre`, NO `titulo`
- `estado` es un enum con valores como "en_borrador", "en_progreso"
- `riesgo_automatico` puede ser "bajo", "medio", "alto"

### 3. TABLA: `participantes`
```sql
-- Estructura real verificada
{
  "id": "uuid (PK)",
  "nombre": "text",
  "rol_empresa_id": "uuid (FK)",
  "doleres_necesidades": "text (nullable)",
  "descripción": "text (nullable)",
  "kam_id": "uuid (FK)",
  "empresa_id": "uuid (nullable)",
  "fecha_ultima_participacion": "timestamp (nullable)",
  "total_participaciones": "integer",
  "created_at": "timestamp with time zone",
  "updated_at": "timestamp with time zone",
  "creado_por": "uuid (FK)",
  "productos_relacionados": "text (nullable)",
  "estado_participante": "uuid (FK)"
}
```

**Notas importantes:**
- No existe `email`, `apellidos`, `telefono`
- `descripción` tiene tilde (no `descripcion`)
- `productos_relacionados` es un array

### 4. TABLA: `reclutamientos`
```sql
-- Estructura real verificada
{
  "id": "uuid (PK)",
  "investigacion_id": "uuid (FK)",
  "participantes_id": "uuid (FK)",
  "fecha_asignado": "timestamp with time zone",
  "fecha_sesion": "timestamp with time zone (nullable)",
  "reclutador_id": "uuid (FK)",
  "creado_por": "uuid (FK, nullable)",
  "estado_agendamiento": "uuid (FK)"
}
```

**Notas importantes:**
- La columna se llama `participantes_id` (plural), NO `participante_id`
- La columna se llama `estado_agendamiento` (sin `_id`)
- No existe `fecha_creacion`

### 5. TABLA: `estado_agendamiento_cat`
```sql
-- Estructura real verificada
{
  "id": "uuid (PK)",
  "nombre": "text",
  "activo": "boolean"
}
```

**Notas importantes:**
- No existe la columna `color`
- Estados comunes: "Pendiente", "En progreso", "Agendado"

---

## 🔗 RELACIONES ENTRE TABLAS

### Relaciones de `reclutamientos`
```sql
reclutamientos.investigacion_id → investigaciones.id
reclutamientos.participantes_id → participantes.id
reclutamientos.reclutador_id → usuarios.id
reclutamientos.creado_por → usuarios.id
reclutamientos.estado_agendamiento → estado_agendamiento_cat.id
```

### Relaciones de `investigaciones`
```sql
investigaciones.periodo_id → periodos.id
investigaciones.producto_id → productos.id
investigaciones.responsable_id → usuarios.id
investigaciones.tipo_investigacion_id → tipos_investigacion.id
investigaciones.creado_por → usuarios.id
investigaciones.implementador_id → usuarios.id
```

### Relaciones de `participantes`
```sql
participantes.rol_empresa_id → roles_empresa.id
participantes.kam_id → usuarios.id
participantes.empresa_id → empresas.id
participantes.creado_por → usuarios.id
participantes.estado_participante → estados_participante.id
```

---

## 🎯 MÓDULOS DE LA APLICACIÓN

### 1. MÓDULO: Reclutamiento
- **Ruta**: `/reclutamiento`
- **API**: `/api/metricas-reclutamientos`
- **Vista**: `vista_reclutamientos_completa`
- **Funcionalidad**: Gestión de reclutamientos de participantes para investigaciones

### 2. MÓDULO: Investigaciones
- **Ruta**: `/investigaciones`
- **API**: `/api/metricas-investigaciones`
- **Funcionalidad**: Gestión de investigaciones y estudios

### 3. MÓDULO: Usuarios
- **Ruta**: `/configuraciones/gestion-usuarios`
- **Funcionalidad**: Gestión de usuarios del sistema

### 4. MÓDULO: Dashboard
- **Ruta**: `/dashboard/[rol]`
- **Funcionalidad**: Dashboard específico por rol de usuario

---

## 👁️ VISTAS IMPORTANTES

### Vista: `vista_reclutamientos_completa`
```sql
-- Vista completa para el módulo de reclutamiento
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    
    -- Datos de investigación
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    i.fecha_inicio as investigacion_fecha_inicio,
    i.fecha_fin as investigacion_fecha_fin,
    i.riesgo_automatico as investigacion_riesgo,
    
    -- Datos de participante
    p.nombre as participante_nombre,
    p.doleres_necesidades as participante_dolores,
    p.descripción as participante_descripcion,
    p.productos_relacionados as participante_productos,
    p.total_participaciones as participante_total_participaciones,
    p.fecha_ultima_participacion as participante_ultima_participacion,
    
    -- Datos de reclutador
    ur.nombre as reclutador_nombre,
    ur.correo as reclutador_correo,
    ur.activo as reclutador_activo,
    
    -- Datos de estado agendamiento
    eac.nombre as estado_agendamiento_nombre,
    eac.activo as estado_agendamiento_activo
    
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN usuarios ur ON r.reclutador_id = ur.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id;
```

---

## ⚡ TRIGGERS Y AUTOMATIZACIONES

### Trigger: Creación automática de reclutamientos
```sql
-- Trigger que crea reclutamientos automáticamente cuando una investigación
-- cambia a estado "por agendar" y tiene libreto
CREATE OR REPLACE FUNCTION crear_reclutamiento_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica del trigger
    -- Se activa al cambiar estado de investigación
END;
$$ LANGUAGE plpgsql;
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### 1. Error: Columnas inexistentes
**Problema**: `ERROR: 42703: column X does not exist`
**Solución**: Verificar estructura real de la tabla antes de crear vistas

### 2. Error: FK incorrecta
**Problema**: `ERROR: insert or update on table violates foreign key constraint`
**Solución**: Corregir referencias de FK (ej: `users` → `usuarios`)

### 3. Error: Vista no existe
**Problema**: `relation "public.vista_X" does not exist`
**Solución**: Crear la vista con estructura correcta

### 4. Error: Hooks de React
**Problema**: `Invalid hook call. Hooks can only be called inside of the body of a function component`
**Solución**: Mover hooks dentro del componente funcional

---

## 🔍 SCRIPTS DE DIAGNÓSTICO

### Verificar estructura de tabla
```sql
-- Verificar estructura real de cualquier tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'NOMBRE_TABLA' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver datos de ejemplo
SELECT * FROM NOMBRE_TABLA LIMIT 3;
```

### Verificar relaciones
```sql
-- Verificar FK de una tabla
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'NOMBRE_TABLA';
```

### Verificar vistas
```sql
-- Verificar si existe una vista
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'NOMBRE_VISTA';

-- Ver estructura de vista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'NOMBRE_VISTA' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

---

## 📝 NOTAS IMPORTANTES PARA FUTUROS DESARROLLOS

### 1. Convenciones de Nombres
- **Tablas**: Plural (`usuarios`, `investigaciones`, `participantes`)
- **Columnas**: Snake_case (`fecha_asignado`, `estado_agendamiento`)
- **FK**: `tabla_id` o `tabla_singular_id`

### 2. Estructuras Específicas
- **Usuarios**: `correo` (no `email`), `nombre` puede ser NULL
- **Investigaciones**: `nombre` (no `titulo`), `estado` es enum
- **Participantes**: `descripción` con tilde, no `email` ni `apellidos`
- **Reclutamientos**: `participantes_id` (plural), `estado_agendamiento` (sin `_id`)

### 3. Patrones de Desarrollo
- Siempre verificar estructura real antes de crear vistas
- Usar scripts de diagnóstico para validar
- Crear vistas ultra-conservadoras primero, luego expandir
- Corregir FKs que apunten a tablas incorrectas

### 4. Módulos React
- Usar hooks dentro de componentes funcionales
- Manejar estados de carga y error
- Implementar fallbacks para datos faltantes
- Usar contextos para estado global

---

## 🔄 ÚLTIMA ACTUALIZACIÓN
**Fecha**: 2025-01-20
**Versión**: 1.0
**Estado**: Funcional - Módulo de reclutamiento operativo

---

*Este documento debe actualizarse cada vez que se descubran nuevas estructuras o se modifiquen las existentes.* 