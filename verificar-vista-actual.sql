-- ====================================
-- VERIFICAR VISTA ACTUAL Y DETECTAR DUPLICADOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si la vista existe
SELECT 
    '=== VERIFICAR SI LA VISTA EXISTE ===' as info;

SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos_completa';

-- 2. Verificar la estructura actual de la vista
SELECT 
    '=== ESTRUCTURA DE LA VISTA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
ORDER BY ordinal_position;

-- 3. Verificar datos en la vista actual
SELECT 
    '=== DATOS EN LA VISTA ACTUAL ===' as info;

SELECT 
    reclutamiento_id,
    investigacion_id,
    investigacion_nombre,
    libreto_titulo,
    estado_reclutamiento_nombre,
    participantes_reclutados,
    progreso_reclutamiento,
    porcentaje_completitud,
    tipo_reclutamiento,
    COUNT(*) as cantidad_registros
FROM vista_reclutamientos_completa 
GROUP BY 
    reclutamiento_id,
    investigacion_id,
    investigacion_nombre,
    libreto_titulo,
    estado_reclutamiento_nombre,
    participantes_reclutados,
    progreso_reclutamiento,
    porcentaje_completitud,
    tipo_reclutamiento
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 4. Verificar si hay investigaciones duplicadas
SELECT 
    '=== INVESTIGACIONES DUPLICADAS ===' as info;

SELECT 
    investigacion_id,
    investigacion_nombre,
    COUNT(*) as cantidad_registros,
    STRING_AGG(reclutamiento_id::text, ', ') as reclutamiento_ids
FROM vista_reclutamientos_completa 
GROUP BY investigacion_id, investigacion_nombre
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 5. Verificar datos de la tabla reclutamientos
SELECT 
    '=== DATOS EN TABLA RECLUTAMIENTOS ===' as info;

SELECT 
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento,
    COUNT(*) as cantidad_registros
FROM reclutamientos
GROUP BY 
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 6. Verificar investigaciones en estado por_agendar
SELECT 
    '=== INVESTIGACIONES POR AGENDAR ===' as info;

SELECT 
    id,
    nombre,
    estado,
    libreto,
    responsable_id,
    implementador_id,
    creado_el
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY creado_el DESC;

-- 7. Verificar si hay libretos duplicados
SELECT 
    '=== LIBRETOS DUPLICADOS ===' as info;

SELECT 
    id,
    nombre_sesion,
    investigacion_id,
    COUNT(*) as cantidad_registros
FROM libretos_investigacion
GROUP BY id, nombre_sesion, investigacion_id
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 8. Verificar la relación entre investigaciones y libretos
SELECT 
    '=== RELACIÓN INVESTIGACIONES-LIBRETOS ===' as info;

SELECT 
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.libreto as libreto_id,
    li.nombre_sesion as libreto_nombre,
    li.investigacion_id as libreto_investigacion_id,
    CASE 
        WHEN i.libreto = li.id THEN 'CORRECTO'
        WHEN i.libreto IS NULL THEN 'SIN LIBRETO'
        WHEN li.investigacion_id = i.id THEN 'LIBRETO POR INVESTIGACION'
        ELSE 'INCONSISTENTE'
    END as estado_relacion
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto = li.id OR li.investigacion_id = i.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;
