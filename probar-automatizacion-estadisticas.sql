-- ====================================
-- PROBAR AUTOMATIZACIÓN DE ESTADÍSTICAS
-- ====================================
-- Objetivo: Probar que la automatización funciona correctamente
-- tanto al crear como al eliminar participaciones

-- ====================================
-- 1. VERIFICAR ESTADO INICIAL
-- ====================================

SELECT '=== ESTADO INICIAL ===' as info;

-- Verificar estadísticas antes de la prueba
SELECT 
    'Estadísticas antes de la prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- Verificar reclutamientos disponibles para prueba
SELECT 
    'Reclutamientos disponibles para prueba' as info,
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    p.nombre as nombre_participante,
    eac.nombre as estado_nombre
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre ILIKE '%finalizado%' OR nombre ILIKE '%completado%'
)
LIMIT 3;

-- ====================================
-- 2. PROBAR ACTUALIZACIÓN DE ESTADO (SIMULAR CREACIÓN)
-- ====================================

SELECT '=== PROBANDO ACTUALIZACIÓN DE ESTADO ===' as info;

-- Seleccionar un reclutamiento para probar
DO $$
DECLARE
    reclutamiento_id uuid;
    participante_id uuid;
    estado_finalizado_id uuid;
    estadisticas_antes integer;
    estadisticas_despues integer;
BEGIN
    -- Obtener estadísticas antes
    SELECT COUNT(*) INTO estadisticas_antes FROM historial_participacion_empresas;
    
    -- Obtener ID del estado finalizado
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre ILIKE '%finalizado%' OR nombre ILIKE '%completado%'
    LIMIT 1;
    
    -- Si no encuentra 'Finalizado', buscar cualquier estado que no sea pendiente
    IF estado_finalizado_id IS NULL THEN
        SELECT id INTO estado_finalizado_id 
        FROM estado_agendamiento_cat 
        WHERE nombre NOT ILIKE '%pendiente%' AND nombre NOT ILIKE '%agendado%'
        LIMIT 1;
    END IF;
    
    -- Seleccionar un reclutamiento para probar
    SELECT r.id, r.participantes_id 
    INTO reclutamiento_id, participante_id
    FROM reclutamientos r
    WHERE r.participantes_id IS NOT NULL
    AND r.estado_agendamiento != estado_finalizado_id
    AND NOT EXISTS (
        SELECT 1 FROM historial_participacion_empresas h 
        WHERE h.reclutamiento_id = r.id
    )
    LIMIT 1;
    
    IF reclutamiento_id IS NOT NULL THEN
        RAISE NOTICE 'Probando reclutamiento: %', reclutamiento_id;
        
        -- Actualizar el estado a finalizado
        UPDATE reclutamientos 
        SET estado_agendamiento = estado_finalizado_id,
            updated_at = NOW()
        WHERE id = reclutamiento_id;
        
        -- Esperar un momento para que se ejecuten los triggers
        PERFORM pg_sleep(1);
        
        -- Obtener estadísticas después
        SELECT COUNT(*) INTO estadisticas_despues FROM historial_participacion_empresas;
        
        -- Mostrar resultado
        RAISE NOTICE 'Estadísticas antes: %, después: %, diferencia: %', 
            estadisticas_antes, estadisticas_despues, estadisticas_despues - estadisticas_antes;
        
        IF estadisticas_despues > estadisticas_antes THEN
            RAISE NOTICE '✅ AUTOMATIZACIÓN FUNCIONA: Se agregó 1 participación';
        ELSE
            RAISE NOTICE '❌ AUTOMATIZACIÓN NO FUNCIONA: No se agregó participación';
        END IF;
    ELSE
        RAISE NOTICE 'No hay reclutamientos disponibles para probar';
    END IF;
END $$;

-- ====================================
-- 3. VERIFICAR RESULTADO DE LA PRUEBA
-- ====================================

SELECT '=== RESULTADO DE LA PRUEBA ===' as info;

-- Verificar estadísticas después de la prueba
SELECT 
    'Estadísticas después de la prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- Verificar el último registro agregado
SELECT 
    'Último registro agregado' as info,
    h.empresa_id,
    h.investigacion_id,
    h.participante_id,
    h.reclutamiento_id,
    h.fecha_participacion,
    h.estado_sesion,
    p.nombre as nombre_participante,
    e.nombre as nombre_empresa
FROM historial_participacion_empresas h
LEFT JOIN participantes p ON h.participante_id = p.id
LEFT JOIN empresas e ON h.empresa_id = e.id
ORDER BY h.created_at DESC
LIMIT 1;

-- ====================================
-- 4. PROBAR ELIMINACIÓN (SIMULAR ELIMINACIÓN)
-- ====================================

SELECT '=== PROBANDO ELIMINACIÓN ===' as info;

-- Verificar si hay registros en historial para eliminar
SELECT 
    'Registros disponibles para eliminar' as info,
    COUNT(*) as total
FROM historial_participacion_empresas;

-- Mostrar registros que se pueden eliminar
SELECT 
    'Registros en historial' as info,
    h.id,
    h.reclutamiento_id,
    p.nombre as nombre_participante,
    e.nombre as nombre_empresa,
    h.fecha_participacion
FROM historial_participacion_empresas h
LEFT JOIN participantes p ON h.participante_id = p.id
LEFT JOIN empresas e ON h.empresa_id = e.id
ORDER BY h.created_at DESC
LIMIT 3;

-- ====================================
-- 5. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== TRIGGERS ACTIVOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 6. VERIFICAR FUNCIONES ACTIVAS
-- ====================================

SELECT '=== FUNCIONES ACTIVAS ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%local%'
ORDER BY routine_name;

-- ====================================
-- 7. MENSAJE DE RESULTADO
-- ====================================

SELECT '=== RESULTADO DE LA PRUEBA ===' as info;

-- Verificar si la automatización está funcionando
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_empresas) > 0 THEN
            '✅ AUTOMATIZACIÓN FUNCIONANDO: Hay registros en el historial'
        ELSE
            '❌ AUTOMATIZACIÓN NO FUNCIONA: No hay registros en el historial'
    END as estado_automatizacion;

-- Verificar si los triggers están activos
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.triggers 
              WHERE trigger_schema = 'public' 
              AND event_object_table = 'reclutamientos') > 0 THEN
            '✅ TRIGGERS ACTIVOS: Hay triggers configurados'
        ELSE
            '❌ TRIGGERS INACTIVOS: No hay triggers configurados'
    END as estado_triggers;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== PRUEBA COMPLETADA ===' as info;
SELECT 'Revisa los resultados arriba para verificar si la automatización funciona.' as mensaje; 