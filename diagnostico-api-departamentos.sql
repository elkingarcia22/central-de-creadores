-- ====================================
-- DIAGNÓSTICO API DEPARTAMENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar estructura exacta de la tabla
SELECT '=== ESTRUCTURA DE DEPARTAMENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Verificar todos los datos sin filtros
SELECT '=== TODOS LOS DATOS SIN FILTROS ===' as info;

SELECT COUNT(*) as total_registros
FROM departamentos;

SELECT id, nombre, categoria, orden, activo, created_at, updated_at
FROM departamentos 
ORDER BY orden, nombre
LIMIT 10;

-- PASO 3: Verificar datos con filtro activo = true
SELECT '=== DATOS CON FILTRO ACTIVO = TRUE ===' as info;

SELECT COUNT(*) as registros_activos
FROM departamentos 
WHERE activo = true;

SELECT id, nombre, categoria, orden, activo
FROM departamentos 
WHERE activo = true
ORDER BY orden, nombre
LIMIT 10;

-- PASO 4: Verificar datos con filtro activo = false
SELECT '=== DATOS CON FILTRO ACTIVO = FALSE ===' as info;

SELECT COUNT(*) as registros_inactivos
FROM departamentos 
WHERE activo = false;

-- PASO 5: Verificar datos con activo IS NULL
SELECT '=== DATOS CON ACTIVO IS NULL ===' as info;

SELECT COUNT(*) as registros_null
FROM departamentos 
WHERE activo IS NULL;

-- PASO 6: Verificar valores únicos de la columna activo
SELECT '=== VALORES ÚNICOS DE ACTIVO ===' as info;

SELECT activo, COUNT(*) as cantidad
FROM departamentos 
GROUP BY activo;

-- PASO 7: Simular la consulta exacta del API
SELECT '=== SIMULACIÓN CONSULTA API ===' as info;

-- Esta es la consulta exacta que hace el API
SELECT id, nombre, categoria, orden, activo, created_at, updated_at
FROM departamentos 
WHERE activo = true
ORDER BY orden ASC, nombre ASC
LIMIT 10; 