-- ====================================
-- DESHABILITAR TRIGGERS TEMPORALMENTE
-- ====================================
-- Problema: Error 500 al crear reclutamientos
-- Solución: Deshabilitar todos los triggers temporalmente
-- Objetivo: Permitir crear reclutamientos sin errores

-- ====================================
-- 1. ELIMINAR TODOS LOS TRIGGERS
-- ====================================

SELECT '=== ELIMINANDO TODOS LOS TRIGGERS ===' as info;

-- Eliminar todos los triggers existentes
DROP TRIGGER IF EXISTS trigger_local_simple_update ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_local_simple_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_fecha_vencida_local_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_estadisticas_finalizado ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_fecha_vencida_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_simple ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_actualizar_vencidas_insert ON reclutamientos;
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
DROP TRIGGER IF EXISTS trigger_participantes_finalizado ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_finalizado ON reclutamientos;

-- ====================================
-- 2. ELIMINAR TODAS LAS FUNCIONES
-- ====================================

SELECT '=== ELIMINANDO TODAS LAS FUNCIONES ===' as info;

-- Eliminar todas las funciones existentes
DROP FUNCTION IF EXISTS trigger_local_simple() CASCADE;
DROP FUNCTION IF EXISTS trigger_fecha_vencida_local() CASCADE;
DROP FUNCTION IF EXISTS trigger_estadisticas_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_fecha_vencida_insert() CASCADE;
DROP FUNCTION IF EXISTS actualizar_estadisticas_on_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_actualizar_vencidas() CASCADE;
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
DROP FUNCTION IF EXISTS trigger_participantes_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_empresas_finalizado() CASCADE;

-- ====================================
-- 3. VERIFICAR QUE NO HAY TRIGGERS
-- ====================================

SELECT '=== VERIFICANDO QUE NO HAY TRIGGERS ===' as info;

-- Verificar que no hay triggers activos
SELECT 
    'Triggers activos en reclutamientos' as info,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos';

-- Verificar que no hay funciones relacionadas
SELECT 
    'Funciones relacionadas con triggers' as info,
    COUNT(*) as cantidad
FROM information_schema.routines
WHERE routine_name LIKE '%trigger%'
OR routine_name LIKE '%sincronizar%'
OR routine_name LIKE '%insertar%'
OR routine_name LIKE '%actualizar%';

-- ====================================
-- 4. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO ACTUAL ===' as info;

-- Verificar estadísticas actuales
SELECT 
    'Estadísticas actuales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 5. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Ahora deberías poder crear reclutamientos sin errores 500' as paso1;
SELECT '2. Prueba crear un nuevo reclutamiento' as paso2;
SELECT '3. Si funciona, las estadísticas se actualizarán manualmente' as paso3;
SELECT '4. Para actualizar estadísticas: SELECT actualizar_estadisticas_manual();' as paso4;
SELECT '5. Una vez que funcione, podemos crear triggers más simples' as paso5;

-- ====================================
-- 6. COMANDOS ÚTILES
-- ====================================

SELECT '=== COMANDOS ÚTILES ===' as info;
SELECT 'Para actualizar estadísticas: SELECT actualizar_estadisticas_manual();' as comando1;
SELECT 'Para ver estadísticas: SELECT * FROM vista_estadisticas_participantes;' as comando2;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando3;
SELECT 'Para ver historial: SELECT * FROM historial_participacion_participantes;' as comando4;
SELECT 'Para ver historial empresas: SELECT * FROM historial_participacion_empresas;' as comando5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGERS DESHABILITADOS TEMPORALMENTE ===' as info;
SELECT 'Todos los triggers han sido eliminados.' as mensaje;
SELECT 'Ahora deberías poder crear reclutamientos sin errores 500.' as explicacion;
SELECT 'Las estadísticas se actualizarán manualmente hasta que creemos triggers más simples.' as instruccion_final; 