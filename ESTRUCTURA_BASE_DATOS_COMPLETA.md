# ESTRUCTURA COMPLETA DE LA BASE DE DATOS

## TABLA INVESTIGACIONES (actualizado)

### Estructura de columnas:
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `nombre` (text, NOT NULL)
- `fecha_inicio` (timestamp with time zone, NOT NULL)
- `fecha_fin` (timestamp without time zone, NOT NULL)
- `periodo_id` (uuid, NULL)
- `producto_id` (uuid, NOT NULL)
- `responsable_id` (uuid, NULL)
- `tipo_investigacion_id` (uuid, NOT NULL)
- `estado_reclutamiento` (uuid, NULL)
- `riesgo` (uuid, NULL)
- `libreto` (text, NULL)
- `tipo_prueba` (USER-DEFINED, NULL)
- `plataforma` (USER-DEFINED, NULL)
- `link_prueba` (text, NULL)
- `link_resultados` (text, NULL)
- `fecha_seguimiento` (date, NULL)
- `notas_seguimiento` (text, NULL)
- `creado_por` (uuid, NULL)
- `creado_el` (timestamp with time zone, default: now())
- `actualizado_el` (timestamp with time zone, default: now())
- `implementador_id` (uuid, NULL)
- `estado` (USER-DEFINED, NULL, default: 'en_borrador'::enum_estado_investigacion)
- `tipo_sesion` (USER-DEFINED, NULL)
- `riesgo_automatico` (text, NULL)
- `descripcion` (text, NULL)

### Notas para la vista de reclutamiento:
- Usar `creado_el` y `actualizado_el` para fechas.
- El campo `libreto` es text, pero debe castear a uuid para el join con `libretos_investigacion`.
- El campo `estado` es un enum, pero los valores relevantes para reclutamiento suelen ser 'por_agendar', 'agendada', etc.
- El campo `estado_reclutamiento` es uuid, pero no se usa directamente en la vista simplificada.

(El resto de la estructura de la base de datos permanece igual)

## TABLA LIBRETOS_INVESTIGACION (actualizado)

### Estructura de columnas:
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `investigacion_id` (uuid, NOT NULL)
- `problema_situacion` (text, NULL)
- `hipotesis` (text, NULL)
- `objetivos` (text, NULL)
- `resultado_esperado` (text, NULL)
- `productos_requeridos` (ARRAY, NULL)
- `plataforma_id` (uuid, NULL)
- `tipo_prueba` (text, NULL)
- `rol_empresa_id` (uuid, NULL)
- `industria_id` (uuid, NULL)
- `pais` (text, NULL)
- `modalidad_id` (uuid, NULL)
- `tamano_empresa_id` (uuid, NULL)
- `numero_participantes_esperados` (integer, NULL)
- `nombre_sesion` (text, NULL)
- `usuarios_participantes` (ARRAY, NULL)
- `duracion_estimada_minutos` (integer, NULL)
- `descripcion_general` (text, NULL)
- `link_prototipo` (text, NULL)
- `creado_por` (uuid, NULL)
- `creado_el` (timestamp with time zone, default: now())
- `actualizado_el` (timestamp with time zone, default: now())
- `duracion_estimada` (integer, NULL)
- `tipo_prueba_id` (uuid, NULL)
- `pais_id` (uuid, NULL)
- `productos_recomendaciones` (text, NULL)
- `numero_participantes` (integer, NULL)

### Notas para la vista de reclutamiento:
- Usar `nombre_sesion` como título del libreto
- Usar `descripcion_general` como descripción del libreto
- Usar `numero_participantes` o `numero_participantes_esperados` como participantes requeridos
- Usar `creado_el` y `actualizado_el` para fechas

## TABLA PARTICIPANTES

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `nombre` (text) - Nombre del participante
- `descripcion` (text) - Descripción del participante
- `created_at` (timestamp with time zone) - Fecha de creación
- `updated_at` (timestamp with time zone) - Fecha de actualización

## TABLA USUARIOS

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `email` (text) - Email del usuario
- `nombre` (text) - Nombre del usuario
- `apellido` (text) - Apellido del usuario
- `created_at` (timestamp with time zone) - Fecha de creación
- `updated_at` (timestamp with time zone) - Fecha de actualización

## TABLA PRODUCTOS

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `nombre` (text) - Nombre del producto
- `descripcion` (text) - Descripción del producto
- `activo` (boolean) - Si está activo
- `created_at` (timestamp with time zone) - Fecha de creación

## TABLA TIPOS_INVESTIGACION

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `nombre` (text) - Nombre del tipo
- `descripcion` (text) - Descripción del tipo
- `activo` (boolean) - Si está activo
- `created_at` (timestamp with time zone) - Fecha de creación

## TABLA PERIODO

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `nombre` (text) - Nombre del período
- `etiqueta` (text) - Etiqueta del período
- `ano` (integer) - Año
- `trimestre` (integer) - Trimestre
- `activo` (boolean) - Si está activo
- `created_at` (timestamp with time zone) - Fecha de creación

## TABLA ESTADO_RECLUTAMIENTO_CAT

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `nombre` (text) - Nombre del estado
- `descripcion` (text) - Descripción del estado
- `color` (text) - Color del estado
- `orden` (integer) - Orden de visualización

## TABLA RIESGO_CAT

### Estructura de columnas:
- `id` (uuid, NOT NULL) - Clave primaria
- `nivel` (text) - Nivel de riesgo
- `descripcion` (text) - Descripción del riesgo
- `color` (text) - Color del riesgo

## VISTA USUARIOS_CON_ROLES

### Estructura de columnas:
- `id` (uuid) - ID del usuario
- `email` (text) - Email del usuario
- `nombre` (text) - Nombre del usuario
- `apellido` (text) - Apellido del usuario
- `rol_nombre` (text) - Nombre del rol
- `rol_descripcion` (text) - Descripción del rol
- `empresa_id` (uuid) - ID de la empresa
- `empresa_nombre` (text) - Nombre de la empresa

## RELACIONES IMPORTANTES

1. **investigaciones.producto_id** → **productos.id**
2. **investigaciones.tipo_investigacion_id** → **tipos_investigacion.id**
3. **investigaciones.libreto** (text) → **libretos_investigacion.id** (uuid) - Requiere CAST
4. **usuarios_con_roles** es una vista que combina usuarios, roles y empresas

## NOTAS IMPORTANTES

1. **Campo libreto**: En la tabla `investigaciones`, el campo `libreto` es de tipo `text`, pero en `libretos_investigacion.id` es `uuid`. Se requiere CAST para hacer el JOIN.

2. **Estados de investigación**: Los estados están almacenados como texto, no como enums.

3. **Fechas**: Las tablas usan `created_at` y `updated_at` (estándar de Supabase) en lugar de `fecha_creacion` y `fecha_actualizacion`.

4. **RLS**: Todas las tablas tienen Row Level Security habilitado.

## SQL PARA OBTENER DATOS DE RECLUTAMIENTO (actualizado)

```sql
-- Obtener investigaciones por agendar con libreto
SELECT 
    i.id AS investigacion_id,
    i.nombre AS titulo_investigacion,
    i.estado AS estado_investigacion,
    i.fecha_inicio,
    i.fecha_fin,
    i.riesgo_automatico,
    i.libreto AS libreto_id,
    i.creado_el AS creado_en,
    i.actualizado_el AS actualizado_en,
    
    -- Datos del libreto
    l.nombre AS titulo_libreto,
    l.descripcion AS descripcion_libreto,
    l.participantes_requeridos,
    
    -- Datos del producto
    p.nombre AS producto_nombre,
    
    -- Datos del tipo de investigación
    t.nombre AS tipo_investigacion_nombre
    
FROM investigaciones i
LEFT JOIN libretos_investigacion l ON i.libreto::uuid = l.id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
WHERE i.estado = 'por_agendar'
  AND i.libreto IS NOT NULL
ORDER BY i.creado_el DESC;
``` 