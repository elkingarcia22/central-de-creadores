-- Verificar tablas relacionadas - versión simple
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. ESTRUCTURA DE TODAS LAS TABLAS
-- =====================================================
SELECT '=== ESTRUCTURA PRODUCTOS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== ESTRUCTURA TIPOS_INVESTIGACION ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tipos_investigacion' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== ESTRUCTURA PERIODO ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'periodo' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. DATOS BÁSICOS DE CADA TABLA
-- =====================================================
SELECT '=== DATOS PRODUCTOS ===' as info;
SELECT * FROM productos LIMIT 5;

SELECT '=== DATOS TIPOS_INVESTIGACION ===' as info;
SELECT * FROM tipos_investigacion LIMIT 5;

SELECT '=== DATOS PERIODO ===' as info;
SELECT * FROM periodo LIMIT 5;

-- =====================================================
-- 3. CONTEO DE REGISTROS
-- =====================================================
SELECT '=== CONTEOS ===' as info;
SELECT 'productos' as tabla, COUNT(*) as total FROM productos
UNION ALL
SELECT 'tipos_investigacion' as tabla, COUNT(*) as total FROM tipos_investigacion
UNION ALL
SELECT 'periodo' as tabla, COUNT(*) as total FROM periodo
UNION ALL
SELECT 'investigaciones' as tabla, COUNT(*) as total FROM investigaciones; 