-- ====================================
-- DIAGNÓSTICO DE PROBLEMA ON CONFLICT
-- ====================================
-- Objetivo: Identificar y corregir el problema con ON CONFLICT
-- en la función sincronizar_historial_externos()

-- ====================================
-- 1. VERIFICAR FUNCIONES EXISTENTES
-- ====================================

SELECT '=== FUNCIONES EXISTENTES ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%historial%'
ORDER BY routine_name;

-- ====================================
-- 2. VERIFICAR ESTRUCTURA DE TABLA historial_participacion_participantes
-- ====================================

SELECT '=== ESTRUCTURA DE historial_participacion_participantes ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- 3. VERIFICAR RESTRICCIONES ÚNICAS
-- ====================================

SELECT '=== RESTRICCIONES ÚNICAS EN historial_participacion_participantes ===' as info;

SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'historial_participacion_participantes'
AND tc.table_schema = 'public'
AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name;

-- ====================================
-- 4. VERIFICAR ÍNDICES
-- ====================================

SELECT '=== ÍNDICES EN historial_participacion_participantes ===' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'historial_participacion_participantes'
ORDER BY indexname;

-- ====================================
-- 5. BUSCAR FUNCIÓN PROBLEMÁTICA
-- ====================================

SELECT '=== BUSCANDO FUNCIÓN PROBLEMÁTICA ===' as info;

SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%sincronizar%'
AND routine_definition LIKE '%ON CONFLICT%';

-- ====================================
-- 6. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== TRIGGERS ACTIVOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 7. ELIMINAR FUNCIONES PROBLEMÁTICAS
-- ====================================

SELECT '=== ELIMINANDO FUNCIONES PROBLEMÁTICAS ===' as info;

-- Eliminar función problemática si existe
DROP FUNCTION IF EXISTS sincronizar_historial_externos() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_externos() CASCADE;

-- Eliminar triggers relacionados
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos ON reclutamientos;

-- ====================================
-- 8. VERIFICAR FUNCIONES RESTANTES
-- ====================================

SELECT '=== FUNCIONES RESTANTES ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%historial%'
ORDER BY routine_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT 'Se han eliminado las funciones problemáticas con ON CONFLICT.' as mensaje;
SELECT 'Ahora puedes ejecutar el script de corrección sin problemas.' as instruccion; 