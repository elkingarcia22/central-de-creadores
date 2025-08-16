-- ====================================
-- VERIFICAR COLUMNAS EXACTAS DE RECLUTAMIENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todas las columnas de reclutamientos
SELECT '=== TODAS LAS COLUMNAS DE RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar datos de ejemplo
SELECT '=== DATOS DE EJEMPLO ===' as info;

SELECT 
    id,
    investigacion_id,
    participantes_id,
    fecha_asignado,
    fecha_sesion,
    reclutador_id,
    estado_agendamiento
FROM reclutamientos 
ORDER BY id
LIMIT 3;

-- 3. Verificar si hay columnas de fecha
SELECT '=== COLUMNAS DE FECHA ===' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
AND (column_name LIKE '%fecha%' OR column_name LIKE '%creado%' OR column_name LIKE '%actualizado%')
ORDER BY ordinal_position;
