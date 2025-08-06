-- ====================================
-- VERIFICAR ESTRUCTURA REAL DE TABLA EMPRESAS
-- ====================================
-- Objetivo: Verificar la estructura exacta de la tabla empresas
-- para evitar errores de columnas inexistentes

-- ====================================
-- 1. VERIFICAR ESTRUCTURA DE TABLA EMPRESAS
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
-- 2. VERIFICAR DATOS DE EJEMPLO
-- ====================================

SELECT '=== DATOS DE EJEMPLO EN EMPRESAS ===' as info;

-- Mostrar algunas empresas para ver la estructura
SELECT 
    id,
    nombre,
    -- Mostrar solo las columnas que sabemos que existen
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'created_at') 
        THEN created_at::text 
        ELSE 'No existe created_at' 
    END as created_at,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'creado_el') 
        THEN creado_el::text 
        ELSE 'No existe creado_el' 
    END as creado_el,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'activo') 
        THEN activo::text 
        ELSE 'No existe activo' 
    END as activo
FROM empresas 
LIMIT 5;

-- ====================================
-- 3. VERIFICAR COLUMNAS DE FECHA
-- ====================================

SELECT '=== COLUMNAS DE FECHA EN EMPRESAS ===' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
AND data_type LIKE '%timestamp%' OR data_type LIKE '%date%'
ORDER BY ordinal_position;

-- ====================================
-- 4. VERIFICAR COLUMNAS DE ID
-- ====================================

SELECT '=== COLUMNAS DE ID EN EMPRESAS ===' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
AND column_name LIKE '%id%'
ORDER BY ordinal_position;

-- ====================================
-- 5. VERIFICAR TOTAL DE EMPRESAS
-- ====================================

SELECT '=== TOTAL DE EMPRESAS ===' as info;

SELECT 
    'Total de empresas' as info,
    COUNT(*) as total
FROM empresas;

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
        ELSE '❌ No usar ORDER BY created_at'
    END as sugerencia_created_at;

-- Verificar si existe creado_el
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'creado_el') 
        THEN '✅ Usar ORDER BY creado_el'
        ELSE '❌ No usar ORDER BY creado_el'
    END as sugerencia_creado_el;

-- Verificar si existe activo
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'empresas' AND column_name = 'activo') 
        THEN '✅ Usar WHERE activo = true'
        ELSE '❌ No usar WHERE activo = true'
    END as sugerencia_activo;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN COMPLETADA ===' as info;
SELECT 'Revisa los resultados arriba para ver la estructura real de la tabla empresas.' as mensaje; 