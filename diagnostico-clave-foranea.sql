-- ====================================
-- DIAGNÓSTICO DE CLAVE FORÁNEA
-- ====================================
-- Problema: ERROR: 23503: insert or update on table "historial_participacion_participantes" 
--          violates foreign key constraint "historial_participacion_participantes_investigacion_id_fkey"
-- Objetivo: Identificar y solucionar el problema de datos inconsistentes

-- ====================================
-- 1. VERIFICAR EL PROBLEMA ESPECÍFICO
-- ====================================

SELECT '=== VERIFICANDO EL PROBLEMA ESPECÍFICO ===' as info;

-- Verificar si existe la investigacion_id problemática
SELECT 
    'Verificación de investigacion_id problemática' as info,
    '3b5b3e72-953d-4b54-9a93-42209c1d352d' as investigacion_id_problematica,
    CASE 
        WHEN EXISTS (SELECT 1 FROM investigaciones WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado_en_investigaciones;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS CON INVESTIGACIONES INEXISTENTES
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS CON INVESTIGACIONES INEXISTENTES ===' as info;

-- Verificar reclutamientos que tienen investigacion_id que no existen
SELECT 
    'Reclutamientos con investigaciones inexistentes' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.investigacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
);

-- Mostrar detalles de reclutamientos con investigaciones inexistentes
SELECT 
    'Detalles de reclutamientos problemáticos' as info,
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    p.nombre as participante,
    r.estado_agendamiento,
    CASE 
        WHEN EXISTS (SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id) 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as investigacion_existe
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.investigacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
)
ORDER BY r.id;

-- ====================================
-- 3. VERIFICAR ESTADO DE LA TABLA INVESTIGACIONES
-- ====================================

SELECT '=== VERIFICANDO ESTADO DE LA TABLA INVESTIGACIONES ===' as info;

-- Verificar cuántas investigaciones existen
SELECT 
    'Total de investigaciones' as info,
    COUNT(*) as cantidad
FROM investigaciones;

-- Mostrar algunas investigaciones existentes
SELECT 
    'Primeras 5 investigaciones' as info,
    id,
    nombre,
    created_at
FROM investigaciones
ORDER BY created_at DESC
LIMIT 5;

-- ====================================
-- 4. VERIFICAR RECLUTAMIENTOS SIN INVESTIGACION_ID
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS SIN INVESTIGACION_ID ===' as info;

-- Verificar reclutamientos sin investigacion_id
SELECT 
    'Reclutamientos sin investigacion_id' as info,
    COUNT(*) as cantidad
FROM reclutamientos
WHERE investigacion_id IS NULL;

-- Mostrar detalles de reclutamientos sin investigacion_id
SELECT 
    'Detalles de reclutamientos sin investigacion_id' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    r.estado_agendamiento,
    r.created_at
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.investigacion_id IS NULL
ORDER BY r.created_at DESC
LIMIT 10;

-- ====================================
-- 5. VERIFICAR INVESTIGACIONES DISPONIBLES
-- ====================================

SELECT '=== VERIFICANDO INVESTIGACIONES DISPONIBLES ===' as info;

-- Verificar investigaciones disponibles para asignar
SELECT 
    'Investigaciones disponibles' as info,
    id,
    nombre,
    created_at
FROM investigaciones
ORDER BY created_at DESC
LIMIT 10;

-- ====================================
-- 6. VERIFICAR ESTRUCTURA DE TABLAS
-- ====================================

SELECT '=== VERIFICANDO ESTRUCTURA DE TABLAS ===' as info;

-- Verificar estructura de reclutamientos
SELECT 
    'Estructura de tabla reclutamientos' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'reclutamientos'
AND column_name = 'investigacion_id';

-- Verificar estructura de investigaciones
SELECT 
    'Estructura de tabla investigaciones' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'investigaciones'
AND column_name = 'id';

-- ====================================
-- 7. VERIFICAR CLAVES FORÁNEAS
-- ====================================

SELECT '=== VERIFICANDO CLAVES FORÁNEAS ===' as info;

-- Verificar restricciones de clave foránea
SELECT 
    'Restricciones de clave foránea' as info,
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
AND tc.table_name = 'historial_participacion_participantes';

-- ====================================
-- 8. PROPUESTA DE SOLUCIÓN
-- ====================================

SELECT '=== PROPUESTA DE SOLUCIÓN ===' as info;

-- Verificar si hay investigaciones disponibles para asignar
SELECT 
    'Investigaciones disponibles para asignar' as info,
    COUNT(*) as cantidad
FROM investigaciones;

-- Verificar si hay reclutamientos que necesitan investigacion_id
SELECT 
    'Reclutamientos que necesitan investigacion_id' as info,
    COUNT(*) as cantidad
FROM reclutamientos
WHERE investigacion_id IS NULL
OR NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = reclutamientos.investigacion_id
);

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO DE CLAVE FORÁNEA COMPLETADO ===' as info;
SELECT 'El problema es que hay reclutamientos con investigacion_id que no existen.' as problema;
SELECT 'Necesitamos asignar investigacion_id válidos o crear las investigaciones faltantes.' as solucion;
SELECT 'Revisa los resultados para determinar la mejor acción.' as instruccion; 