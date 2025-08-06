-- Verificar todas las tablas relacionadas con investigaciones
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. TABLA PRODUCTOS
-- =====================================================
SELECT '=== TABLA PRODUCTOS ===' as info;

-- Estructura de la tabla productos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Datos de la tabla productos
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    created_at
FROM productos 
ORDER BY nombre
LIMIT 10;

-- =====================================================
-- 2. TABLA TIPOS_INVESTIGACION
-- =====================================================
SELECT '=== TABLA TIPOS_INVESTIGACION ===' as info;

-- Estructura de la tabla tipos_investigacion
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tipos_investigacion' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Datos de la tabla tipos_investigacion
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    created_at
FROM tipos_investigacion 
ORDER BY nombre
LIMIT 10;

-- =====================================================
-- 3. TABLA PERIODO
-- =====================================================
SELECT '=== TABLA PERIODO ===' as info;

-- Estructura de la tabla periodo
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'periodo' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Datos de la tabla periodo
SELECT 
    id,
    nombre,
    etiqueta,
    ano,
    trimestre,
    activo,
    created_at
FROM periodo 
ORDER BY ano DESC, trimestre
LIMIT 10;

-- =====================================================
-- 4. TABLA ESTADO_RECLUTAMIENTO_CAT
-- =====================================================
SELECT '=== TABLA ESTADO_RECLUTAMIENTO_CAT ===' as info;

-- Estructura de la tabla estado_reclutamiento_cat
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Datos de la tabla estado_reclutamiento_cat
SELECT *
FROM estado_reclutamiento_cat 
ORDER BY nombre
LIMIT 10;

-- =====================================================
-- 5. TABLA RIESGO_CAT
-- =====================================================
SELECT '=== TABLA RIESGO_CAT ===' as info;

-- Estructura de la tabla riesgo_cat
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'riesgo_cat' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Datos de la tabla riesgo_cat
SELECT *
FROM riesgo_cat 
ORDER BY nivel
LIMIT 10;

-- =====================================================
-- 6. VERIFICAR FOREIGN KEYS DE INVESTIGACIONES
-- =====================================================
SELECT '=== FOREIGN KEYS DE INVESTIGACIONES ===' as info;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'investigaciones'
    AND tc.table_schema = 'public'
ORDER BY kcu.column_name;

-- =====================================================
-- 7. CONTAR REGISTROS EN CADA TABLA
-- =====================================================
SELECT '=== CONTEO DE REGISTROS ===' as info;

SELECT 
    'productos' as tabla,
    COUNT(*) as total_registros
FROM productos
UNION ALL
SELECT 
    'tipos_investigacion' as tabla,
    COUNT(*) as total_registros
FROM tipos_investigacion
UNION ALL
SELECT 
    'periodo' as tabla,
    COUNT(*) as total_registros
FROM periodo
UNION ALL
SELECT 
    'estado_reclutamiento_cat' as tabla,
    COUNT(*) as total_registros
FROM estado_reclutamiento_cat
UNION ALL
SELECT 
    'riesgo_cat' as tabla,
    COUNT(*) as total_registros
FROM riesgo_cat
UNION ALL
SELECT 
    'usuarios_con_roles' as tabla,
    COUNT(*) as total_registros
FROM usuarios_con_roles
UNION ALL
SELECT 
    'investigaciones' as tabla,
    COUNT(*) as total_registros
FROM investigaciones; 