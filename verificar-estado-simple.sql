-- ====================================
-- VERIFICAR ESTADO SIMPLE
-- ====================================
-- Objetivo: Verificar estado sin asumir columnas

-- ====================================
-- 1. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT 
    '=== TRIGGERS ACTIVOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 2. VERIFICAR FUNCIONES CREADAS
-- ====================================

SELECT 
    '=== FUNCIONES CREADAS ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%trigger%'
ORDER BY routine_name;

-- ====================================
-- 3. VERIFICAR DATOS EN TABLAS DE HISTORIAL
-- ====================================

SELECT 
    '=== DATOS EN HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

SELECT 
    '=== DATOS EN HISTORIAL EMPRESAS ===' as info;

SELECT 
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- ====================================
-- 4. VERIFICAR RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== TOTAL RECLUTAMIENTOS ===' as info;

SELECT 
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- ====================================
-- 5. VERIFICAR ESTRUCTURA TABLA RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== ESTRUCTURA TABLA RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- ====================================
-- 6. VERIFICAR ESTRUCTURA ESTADO_AGENDAMIENTO_CAT
-- ====================================

SELECT 
    '=== ESTRUCTURA ESTADO_AGENDAMIENTO_CAT ===' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'estado_agendamiento_cat'
ORDER BY ordinal_position;

-- ====================================
-- 7. VERIFICAR DATOS EN ESTADO_AGENDAMIENTO_CAT
-- ====================================

SELECT 
    '=== DATOS EN ESTADO_AGENDAMIENTO_CAT ===' as info;

SELECT 
    *
FROM estado_agendamiento_cat
ORDER BY id;

-- ====================================
-- 8. VERIFICAR ÚLTIMOS RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== ÚLTIMOS 5 RECLUTAMIENTOS ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.estado_agendamiento
FROM reclutamientos r
ORDER BY r.id DESC
LIMIT 5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO SIMPLE COMPLETO ===' as info;
SELECT '✅ Revisa los resultados arriba para ver el estado actual' as mensaje; 