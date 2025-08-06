-- ====================================
-- VERIFICAR ESTRUCTURA ESTADO_RECLUTAMIENTO_CAT
-- ====================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT '=== VERIFICAR TABLA ESTADO_RECLUTAMIENTO_CAT ===' as info;

SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public';

-- 2. ESTRUCTURA COMPLETA DE LA TABLA
SELECT '=== ESTRUCTURA DE LA TABLA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR DATOS EXISTENTES
SELECT '=== DATOS EXISTENTES ===' as info;

SELECT * FROM estado_reclutamiento_cat
ORDER BY orden;

-- 4. VERIFICAR SI EXISTE LA COLUMNA COLOR
SELECT '=== VERIFICAR COLUMNA COLOR ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
AND column_name = 'color';

-- 5. MOSTRAR TODAS LAS COLUMNAS DISPONIBLES
SELECT '=== TODAS LAS COLUMNAS DISPONIBLES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position; 