-- Verificar qué tablas existen realmente en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. VER TODAS LAS TABLAS QUE EXISTEN
-- =====================================================
SELECT '=== TODAS LAS TABLAS EXISTENTES ===' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. VER TODAS LAS VISTAS QUE EXISTEN
-- =====================================================
SELECT '=== TODAS LAS VISTAS EXISTENTES ===' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'VIEW'
ORDER BY table_name;

-- =====================================================
-- 3. BUSCAR TABLAS RELACIONADAS CON INVESTIGACIONES
-- =====================================================
SELECT '=== TABLAS RELACIONADAS CON INVESTIGACIONES ===' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (
        table_name LIKE '%investigacion%' OR
        table_name LIKE '%producto%' OR
        table_name LIKE '%tipo%' OR
        table_name LIKE '%periodo%' OR
        table_name LIKE '%usuario%' OR
        table_name LIKE '%profile%' OR
        table_name LIKE '%reclutamiento%' OR
        table_name LIKE '%riesgo%'
    )
ORDER BY table_name;

-- =====================================================
-- 4. VERIFICAR SI LA TABLA INVESTIGACIONES EXISTE
-- =====================================================
SELECT '=== VERIFICAR TABLA INVESTIGACIONES ===' as info;

SELECT COUNT(*) as investigaciones_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'investigaciones';

-- Si existe, mostrar su estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
    AND table_schema = 'public'
ORDER BY ordinal_position; 