-- ====================================
-- VERIFICAR ESTADOS REALES EN LA TABLA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todos los estados disponibles
SELECT '=== TODOS LOS ESTADOS EN estado_reclutamiento_cat ===' as info;
SELECT id, nombre, color, orden, activo FROM estado_reclutamiento_cat ORDER BY orden, nombre;

-- 2. Verificar solo los estados activos
SELECT '=== ESTADOS ACTIVOS ===' as info;
SELECT id, nombre, color, orden FROM estado_reclutamiento_cat WHERE activo = true ORDER BY orden, nombre;

-- 3. Verificar si existen los estados que necesitamos
SELECT '=== VERIFICAR ESTADOS NECESARIOS ===' as info;
SELECT 
    CASE WHEN EXISTS(SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente' AND activo = true) THEN '✅' ELSE '❌' END as pendiente,
    CASE WHEN EXISTS(SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'En progreso' AND activo = true) THEN '✅' ELSE '❌' END as en_progreso,
    CASE WHEN EXISTS(SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Agendada' AND activo = true) THEN '✅' ELSE '❌' END as agendada;

-- 4. Verificar la estructura de la tabla
SELECT '=== ESTRUCTURA DE LA TABLA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
ORDER BY ordinal_position;
