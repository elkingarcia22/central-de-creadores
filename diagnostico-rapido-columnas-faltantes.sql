-- ====================================
-- DIAGNÓSTICO RÁPIDO - COLUMNAS FALTANTES
-- ====================================

-- Verificar qué columnas existen actualmente
SELECT '=== COLUMNAS EXISTENTES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar qué columnas faltan
SELECT '=== COLUMNAS FALTANTES ===' as info;

WITH columnas_necesarias AS (
    SELECT unnest(ARRAY[
        'id',
        'nombre', 
        'descripcion',
        'color',
        'activo',
        'orden',
        'creado_en'
    ]) AS columna_necesaria
),
columnas_existentes AS (
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'estado_reclutamiento_cat' 
    AND table_schema = 'public'
)
SELECT 
    cn.columna_necesaria,
    CASE 
        WHEN ce.column_name IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado
FROM columnas_necesarias cn
LEFT JOIN columnas_existentes ce ON cn.columna_necesaria = ce.column_name
ORDER BY 
    CASE WHEN ce.column_name IS NULL THEN 0 ELSE 1 END,
    cn.columna_necesaria;

-- Mostrar datos actuales (si existen)
SELECT '=== DATOS ACTUALES ===' as info;

SELECT * FROM estado_reclutamiento_cat
LIMIT 5; 