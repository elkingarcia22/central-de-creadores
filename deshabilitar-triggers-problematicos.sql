-- ====================================
-- DESHABILITAR TRIGGERS PROBLEMÁTICOS
-- ====================================
-- Problema: Los participantes se están eliminando automáticamente
-- Solución: Deshabilitar todos los triggers que puedan estar causando esto
-- Objetivo: Prevenir eliminación automática de participantes

-- ====================================
-- 1. ELIMINAR TODOS LOS TRIGGERS PROBLEMÁTICOS
-- ====================================

SELECT '=== ELIMINANDO TRIGGERS PROBLEMÁTICOS ===' as info;

-- Eliminar triggers de limpieza automática
DROP TRIGGER IF EXISTS trigger_limpiar_reclutamientos_corruptos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_eliminar_participantes_invalidos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_limpiar_historial_automatico ON reclutamientos;

-- Eliminar triggers de sincronización que pueden estar causando problemas
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_completo ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_corregida ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_participante_simple ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_simple ON reclutamientos;

-- Eliminar triggers de actualización de estado que pueden estar causando problemas
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_local_simple_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_local_simple_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_fecha_vencida_local_insert ON reclutamientos;

-- Eliminar triggers de participantes
DROP TRIGGER IF EXISTS trigger_participantes_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_independiente ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_independiente ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_final ON reclutamientos;

-- ====================================
-- 2. ELIMINAR FUNCIONES PROBLEMÁTICAS
-- ====================================

SELECT '=== ELIMINANDO FUNCIONES PROBLEMÁTICAS ===' as info;

-- Eliminar funciones de limpieza automática
DROP FUNCTION IF EXISTS limpiar_reclutamientos_corruptos() CASCADE;
DROP FUNCTION IF EXISTS eliminar_participantes_invalidos() CASCADE;
DROP FUNCTION IF EXISTS limpiar_historial_automatico() CASCADE;

-- Eliminar funciones de sincronización
DROP FUNCTION IF EXISTS sincronizar_historial_completo() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_automatico() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_automatico() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_final() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_corregida() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_participante_simple() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_simple() CASCADE;

-- Eliminar funciones de actualización de estado
DROP FUNCTION IF EXISTS actualizar_estado_reclutamiento_automatico() CASCADE;
DROP FUNCTION IF EXISTS trigger_local_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_fecha_vencida_local() CASCADE;

-- Eliminar funciones de participantes
DROP FUNCTION IF EXISTS trigger_participantes_automatico() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_automatico() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_independiente() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_independiente() CASCADE;
DROP FUNCTION IF EXISTS trigger_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_final() CASCADE;

-- ====================================
-- 3. VERIFICAR TRIGGERS RESTANTES
-- ====================================

SELECT '=== VERIFICANDO TRIGGERS RESTANTES ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 4. VERIFICAR ESTADO DE RECLUTAMIENTOS
-- ====================================

SELECT '=== VERIFICANDO ESTADO DE RECLUTAMIENTOS ===' as info;

SELECT 
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    r.fecha_sesion,
    r.updated_at
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.updated_at DESC
LIMIT 10;

-- ====================================
-- 5. COMENTARIO IMPORTANTE
-- ====================================

SELECT 
    '=== IMPORTANTE ===' as info,
    'Todos los triggers problemáticos han sido eliminados.' as mensaje,
    'Los participantes ya no se eliminarán automáticamente.' as explicacion,
    'Los estados solo se actualizarán manualmente o a través de la API.' as nota; 