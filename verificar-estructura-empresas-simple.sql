-- ====================================
-- VERIFICAR ESTRUCTURA REAL DE TABLA EMPRESAS (SIMPLE)
-- ====================================
-- Objetivo: Verificar la estructura exacta de la tabla empresas
-- SIN intentar acceder a columnas que no existen

-- ====================================
-- 1. VERIFICAR ESTRUCTURA COMPLETA DE TABLA EMPRESAS
-- ====================================

SELECT '=== ESTRUCTURA REAL DE TABLA EMPRESAS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- 2. VERIFICAR DATOS BÁSICOS DE EMPRESAS
-- ====================================

SELECT '=== DATOS BÁSICOS DE EMPRESAS ===' as info;

-- Mostrar solo las columnas que sabemos que existen (id y nombre)
SELECT 
    id,
    nombre
FROM empresas 
LIMIT 5;

-- ====================================
-- 3. VERIFICAR TOTAL DE EMPRESAS
-- ====================================

SELECT '=== TOTAL DE EMPRESAS ===' as info;

SELECT 
    'Total de empresas' as info,
    COUNT(*) as total
FROM empresas;

-- ====================================
-- 4. VERIFICAR SI EXISTEN COLUMNAS ESPECÍFICAS
-- ====================================

SELECT '=== VERIFICACIÓN DE COLUMNAS ESPECÍFICAS ===' as info;

-- Verificar si existe created_at
SELECT 
    'created_at' as columna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'created_at') 
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- Verificar si existe creado_el
SELECT 
    'creado_el' as columna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'creado_el') 
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- Verificar si existe activo
SELECT 
    'activo' as columna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'activo') 
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- Verificar si existe kam_id
SELECT 
    'kam_id' as columna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'kam_id') 
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- Verificar si existe updated_at
SELECT 
    'updated_at' as columna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'updated_at') 
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- ====================================
-- 5. VERIFICAR COLUMNAS DE FECHA
-- ====================================

SELECT '=== COLUMNAS DE FECHA EN EMPRESAS ===' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
AND (data_type LIKE '%timestamp%' OR data_type LIKE '%date%')
ORDER BY ordinal_position;

-- ====================================
-- 6. SUGERENCIAS PARA EL SCRIPT
-- ====================================

SELECT '=== SUGERENCIAS PARA EL SCRIPT ===' as info;

-- Verificar si existe created_at
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'created_at') 
        THEN '✅ Usar ORDER BY created_at'
        ELSE '❌ NO usar ORDER BY created_at - usar LIMIT 1'
    END as sugerencia_created_at;

-- Verificar si existe creado_el
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'creado_el') 
        THEN '✅ Usar ORDER BY creado_el'
        ELSE '❌ NO usar ORDER BY creado_el - usar LIMIT 1'
    END as sugerencia_creado_el;

-- Verificar si existe activo
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'activo') 
        THEN '✅ Usar WHERE activo = true'
        ELSE '❌ NO usar WHERE activo = true - usar sin filtro'
    END as sugerencia_activo;

-- ====================================
-- 7. OBTENER PRIMERA EMPRESA PARA USAR COMO DEFAULT
-- ====================================

SELECT '=== PRIMERA EMPRESA PARA DEFAULT ===' as info;

SELECT 
    'Primera empresa disponible' as info,
    id as empresa_default_id,
    nombre as empresa_default_nombre
FROM empresas 
LIMIT 1;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN COMPLETADA ===' as info;
SELECT 'Ahora sabemos exactamente qué columnas existen en la tabla empresas.' as mensaje;
SELECT 'Podemos usar LIMIT 1 sin ORDER BY para obtener la primera empresa.' as instruccion; 