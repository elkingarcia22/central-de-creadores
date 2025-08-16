-- ====================================
-- VERIFICAR VISTA RECLUTAMIENTOS COMPLETA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la vista existe
SELECT '=== VERIFICANDO EXISTENCIA DE LA VISTA ===' as info;
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos_completa';

-- 2. Verificar estructura de la vista
SELECT '=== ESTRUCTURA DE LA VISTA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar datos de la vista
SELECT '=== DATOS DE LA VISTA ===' as info;
SELECT 
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    estado_reclutamiento_id,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    color_estado,
    estado_reclutamiento,
    participantes_requeridos,
    participantes_actuales
FROM vista_reclutamientos_completa
LIMIT 5;

-- 4. Verificar estados disponibles
SELECT '=== ESTADOS DISPONIBLES ===' as info;
SELECT DISTINCT
    estado_reclutamiento_id,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    color_estado,
    estado_reclutamiento
FROM vista_reclutamientos_completa
WHERE estado_reclutamiento_id IS NOT NULL;

-- 5. Verificar si hay campos NULL o vacíos
SELECT '=== VERIFICANDO CAMPOS VACÍOS ===' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(estado_reclutamiento_id) as con_estado_id,
    COUNT(estado_reclutamiento_nombre) as con_estado_nombre,
    COUNT(estado_reclutamiento_color) as con_estado_color,
    COUNT(color_estado) as con_color_estado,
    COUNT(estado_reclutamiento) as con_estado_reclutamiento
FROM vista_reclutamientos_completa; 