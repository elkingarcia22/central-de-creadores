-- ====================================
-- DIAGNÓSTICO DE NOMBRES DE INVESTIGACIONES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla investigaciones
SELECT 
    '=== ESTRUCTURA INVESTIGACIONES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
ORDER BY ordinal_position;

-- 2. Verificar datos de investigaciones por agendar
SELECT 
    '=== INVESTIGACIONES POR AGENDAR ===' as info;

SELECT 
    id,
    nombre,
    estado,
    responsable_id,
    implementador_id,
    creado_el,
    actualizado_el
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY creado_el DESC;

-- 3. Verificar todas las investigaciones
SELECT 
    '=== TODAS LAS INVESTIGACIONES ===' as info;

SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
ORDER BY creado_el DESC
LIMIT 20;

-- 4. Verificar si hay investigaciones con nombre NULL o vacío
SELECT 
    '=== INVESTIGACIONES CON NOMBRE NULL O VACÍO ===' as info;

SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE nombre IS NULL OR nombre = '' OR nombre = 'null'
ORDER BY creado_el DESC;

-- 5. Verificar la vista actual
SELECT 
    '=== VISTA ACTUAL ===' as info;

SELECT 
    reclutamiento_id,
    titulo_investigacion,
    responsable_nombre,
    implementador_nombre,
    estado_reclutamiento
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 10;

-- 6. Comparar datos directos vs vista
SELECT 
    '=== COMPARACIÓN DATOS DIRECTOS VS VISTA ===' as info;

SELECT 
    'DIRECTO' as fuente,
    id,
    nombre as titulo_investigacion,
    estado
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY creado_el DESC
LIMIT 5;

SELECT 
    'VISTA' as fuente,
    reclutamiento_id as id,
    titulo_investigacion,
    estado_investigacion as estado
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 5; 