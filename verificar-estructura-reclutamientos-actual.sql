-- ====================================
-- VERIFICAR ESTRUCTURA ACTUAL DE RECLUTAMIENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Estructura completa de la tabla reclutamientos
SELECT '=== ESTRUCTURA COMPLETA DE RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si existe responsable_agendamiento o reclutador_id
SELECT '=== VERIFICAR COLUMNAS DE RESPONSABLE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
AND (column_name LIKE '%responsable%' OR column_name LIKE '%reclutador%' OR column_name LIKE '%agendamiento%')
ORDER BY ordinal_position;

-- 3. Verificar datos actuales de reclutamientos
SELECT '=== DATOS ACTUALES DE RECLUTAMIENTOS ===' as info;

SELECT 
    id,
    investigacion_id,
    participantes_id,
    fecha_asignado,
    fecha_sesion,
    estado_agendamiento
FROM reclutamientos 
ORDER BY id
LIMIT 5;

-- 4. Verificar foreign keys
SELECT '=== FOREIGN KEYS DE RECLUTAMIENTOS ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'reclutamientos';

-- 5. Verificar si hay algún reclutamiento con responsable asignado
SELECT '=== RECLUTAMIENTOS CON RESPONSABLE ===' as info;

SELECT 
    id,
    investigacion_id,
    participantes_id,
    estado_agendamiento
FROM reclutamientos 
WHERE responsable_agendamiento IS NOT NULL
   OR reclutador_id IS NOT NULL
ORDER BY id
LIMIT 5;
