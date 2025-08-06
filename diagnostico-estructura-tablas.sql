-- ====================================
-- DIAGNÓSTICO COMPLETO DE ESTRUCTURA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar estructura de participantes_internos
SELECT '=== ESTRUCTURA DE PARTICIPANTES_INTERNOS ===' as info;

-- Ver columnas de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Verificar estructura de departamentos
SELECT '=== ESTRUCTURA DE DEPARTAMENTOS ===' as info;

-- Ver columnas de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 3: Verificar foreign keys existentes
SELECT '=== FOREIGN KEYS EXISTENTES ===' as info;

SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='participantes_internos';

-- PASO 4: Verificar datos en departamentos
SELECT '=== DATOS EN DEPARTAMENTOS ===' as info;

SELECT COUNT(*) as total_departamentos
FROM departamentos;

SELECT COUNT(*) as departamentos_activos
FROM departamentos 
WHERE activo = true;

-- Mostrar algunos departamentos
SELECT id, nombre, categoria, orden, activo
FROM departamentos 
ORDER BY orden, nombre
LIMIT 10;

-- PASO 5: Verificar datos en participantes_internos
SELECT '=== DATOS EN PARTICIPANTES_INTERNOS ===' as info;

SELECT COUNT(*) as total_participantes
FROM participantes_internos;

SELECT COUNT(*) as participantes_activos
FROM participantes_internos 
WHERE activo = true;

-- Ver algunos participantes con sus departamentos
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    pi.departamento_id,
    d.nombre as nombre_departamento
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
WHERE pi.activo = true
ORDER BY pi.nombre
LIMIT 10;

-- PASO 6: Verificar si hay participantes sin departamento
SELECT '=== PARTICIPANTES SIN DEPARTAMENTO ===' as info;

SELECT COUNT(*) as participantes_sin_departamento
FROM participantes_internos 
WHERE departamento_id IS NULL 
AND activo = true;

-- PASO 7: Prueba de consulta directa
SELECT '=== PRUEBA DE CONSULTA DIRECTA ===' as info;

-- Intentar la consulta que hace el API
SELECT 
    pi.*,
    d.nombre as departamento_nombre,
    d.categoria as departamento_categoria
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
WHERE pi.activo = true
ORDER BY pi.nombre
LIMIT 5; 