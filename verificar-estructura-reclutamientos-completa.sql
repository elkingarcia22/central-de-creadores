-- ====================================
-- VERIFICAR ESTRUCTURA COMPLETA DE RECLUTAMIENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Estructura completa de reclutamientos
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

-- PASO 2: Verificar si hay columnas para participantes internos
SELECT '=== VERIFICAR COLUMNAS DE PARTICIPANTES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
AND (column_name LIKE '%participante%' OR column_name LIKE '%interno%' OR column_name LIKE '%externo%')
ORDER BY ordinal_position;

-- PASO 3: Verificar foreign keys
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

-- PASO 4: Verificar datos actuales
SELECT '=== DATOS ACTUALES DE RECLUTAMIENTOS ===' as info;

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
LIMIT 5; 