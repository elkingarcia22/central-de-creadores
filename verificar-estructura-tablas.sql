-- ====================================
-- VERIFICAR ESTRUCTURA REAL DE TABLAS
-- ====================================
-- Objetivo: Verificar la estructura real sin asumir columnas
-- Método: Consultar information_schema para obtener columnas reales

-- ====================================
-- 1. VERIFICAR ESTRUCTURA DE INVESTIGACIONES
-- ====================================

SELECT '=== ESTRUCTURA DE TABLA INVESTIGACIONES ===' as info;

-- Mostrar todas las columnas de investigaciones
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'investigaciones'
ORDER BY ordinal_position;

-- ====================================
-- 2. VERIFICAR ESTRUCTURA DE RECLUTAMIENTOS
-- ====================================

SELECT '=== ESTRUCTURA DE TABLA RECLUTAMIENTOS ===' as info;

-- Mostrar todas las columnas de reclutamientos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- ====================================
-- 3. VERIFICAR ESTRUCTURA DE HISTORIAL PARTICIPANTES
-- ====================================

SELECT '=== ESTRUCTURA DE TABLA HISTORIAL_PARTICIPACION_PARTICIPANTES ===' as info;

-- Mostrar todas las columnas de historial_participacion_participantes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

-- ====================================
-- 4. VERIFICAR ESTRUCTURA DE HISTORIAL EMPRESAS
-- ====================================

SELECT '=== ESTRUCTURA DE TABLA HISTORIAL_PARTICIPACION_EMPRESAS ===' as info;

-- Mostrar todas las columnas de historial_participacion_empresas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position;

-- ====================================
-- 5. VERIFICAR DATOS REALES EN INVESTIGACIONES
-- ====================================

SELECT '=== DATOS REALES EN INVESTIGACIONES ===' as info;

-- Mostrar algunos registros de investigaciones (sin asumir columnas)
SELECT 
    'Primeros 5 registros de investigaciones' as info,
    *
FROM investigaciones
LIMIT 5;

-- ====================================
-- 6. VERIFICAR DATOS REALES EN RECLUTAMIENTOS
-- ====================================

SELECT '=== DATOS REALES EN RECLUTAMIENTOS ===' as info;

-- Mostrar algunos registros de reclutamientos (sin asumir columnas)
SELECT 
    'Primeros 5 registros de reclutamientos' as info,
    *
FROM reclutamientos
LIMIT 5;

-- ====================================
-- 7. VERIFICAR CLAVES FORÁNEAS
-- ====================================

SELECT '=== CLAVES FORÁNEAS ===' as info;

-- Verificar todas las claves foráneas relacionadas
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name = 'historial_participacion_participantes' 
     OR tc.table_name = 'historial_participacion_empresas'
     OR tc.table_name = 'reclutamientos')
ORDER BY tc.table_name, kcu.column_name;

-- ====================================
-- 8. VERIFICAR PROBLEMA ESPECÍFICO
-- ====================================

SELECT '=== VERIFICAR PROBLEMA ESPECÍFICO ===' as info;

-- Verificar si existe la investigacion_id problemática
SELECT 
    'Verificación de investigacion_id problemática' as info,
    '3b5b3e72-953d-4b54-9a93-42209c1d352d' as investigacion_id_problematica,
    CASE 
        WHEN EXISTS (SELECT 1 FROM investigaciones WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado_en_investigaciones;

-- Verificar reclutamientos con investigaciones inexistentes
SELECT 
    'Reclutamientos con investigaciones inexistentes' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.investigacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
);

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN DE ESTRUCTURA COMPLETADA ===' as info;
SELECT 'Ahora conocemos la estructura real de las tablas.' as mensaje;
SELECT 'Usa esta información para corregir los scripts.' as instruccion; 