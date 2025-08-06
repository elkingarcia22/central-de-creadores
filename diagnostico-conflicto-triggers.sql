-- ====================================
-- DIAGNÓSTICO DE CONFLICTO ENTRE TRIGGERS
-- ====================================
-- Problema: Al arreglar empresas se dañaron participantes
-- Objetivo: Identificar exactamente qué está causando el conflicto
-- Método: Verificar estado actual y comportamiento de cada trigger

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL
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
-- 2. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== VERIFICANDO TRIGGERS ACTIVOS ===' as info;

-- Verificar todos los triggers en reclutamientos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- Verificar funciones relacionadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%historial%'
OR routine_name LIKE '%participante%'
OR routine_name LIKE '%empresa%'
ORDER BY routine_name;

-- ====================================
-- 3. VERIFICAR CORRESPONDENCIA ESPECÍFICA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA ESPECÍFICA ===' as info;

-- Verificar participantes específicos
SELECT 
    p.nombre as participante,
    COUNT(r.id) as total_reclutamientos,
    COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados,
    COUNT(h.id) as en_historial
FROM participantes p
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
LEFT JOIN historial_participacion_participantes h ON p.id = h.participante_id
WHERE r.id IS NOT NULL
GROUP BY p.id, p.nombre
ORDER BY p.nombre;

-- Verificar empresas específicas
SELECT 
    e.nombre as empresa,
    COUNT(r.id) as total_reclutamientos,
    COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados,
    COUNT(h.id) as en_historial
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
LEFT JOIN historial_participacion_empresas h ON e.id = h.empresa_id
WHERE r.id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY e.nombre;

-- ====================================
-- 4. VERIFICAR DETALLES ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICANDO DETALLES ESPECÍFICOS ===' as info;

-- Mostrar todos los reclutamientos finalizados con detalles
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    r.fecha_sesion,
    r.duracion_sesion,
    CASE WHEN hp.id IS NOT NULL THEN 'SÍ' ELSE 'NO' END as en_historial_participantes,
    CASE WHEN he.id IS NOT NULL THEN 'SÍ' ELSE 'NO' END as en_historial_empresas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
LEFT JOIN historial_participacion_participantes hp ON r.id = hp.reclutamiento_id
LEFT JOIN historial_participacion_empresas he ON r.id = he.reclutamiento_id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY p.nombre, r.id;

-- ====================================
-- 5. VERIFICAR PROBLEMAS ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICANDO PROBLEMAS ESPECÍFICOS ===' as info;

-- Verificar reclutamientos finalizados que NO están en historial de participantes
SELECT 
    'Reclutamientos finalizados SIN historial participantes' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_participantes h 
    WHERE h.reclutamiento_id = r.id
);

-- Verificar reclutamientos finalizados que NO están en historial de empresas
SELECT 
    'Reclutamientos finalizados SIN historial empresas' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND p.empresa_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- Verificar reclutamientos que están en historial pero NO están finalizados
SELECT 
    'Reclutamientos en historial pero NO finalizados' as info,
    COUNT(*) as cantidad
FROM historial_participacion_participantes h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. VERIFICAR ESTADO DE LOS TRIGGERS
-- ====================================

SELECT '=== VERIFICANDO ESTADO DE LOS TRIGGERS ===' as info;

-- Verificar si los triggers están funcionando correctamente
DO $$
DECLARE
    trigger_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Contar triggers activos
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_table = 'reclutamientos';
    
    -- Contar funciones relacionadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_name LIKE '%historial%';
    
    RAISE NOTICE 'Triggers activos en reclutamientos: %', trigger_count;
    RAISE NOTICE 'Funciones relacionadas con historial: %', function_count;
    
    -- Verificar triggers específicos
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_sincronizar_historial_participantes_automatico'
    ) THEN
        RAISE NOTICE 'Trigger de participantes: ACTIVO';
    ELSE
        RAISE NOTICE 'Trigger de participantes: INACTIVO';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_insertar_historial_empresa_automatico'
    ) THEN
        RAISE NOTICE 'Trigger de empresas: ACTIVO';
    ELSE
        RAISE NOTICE 'Trigger de empresas: INACTIVO';
    END IF;
END $$;

-- ====================================
-- 7. VERIFICAR CONFLICTOS POTENCIALES
-- ====================================

SELECT '=== VERIFICANDO CONFLICTOS POTENCIALES ===' as info;

-- Verificar si hay múltiples triggers para el mismo evento
SELECT 
    event_manipulation,
    action_timing,
    COUNT(*) as cantidad_triggers
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
GROUP BY event_manipulation, action_timing
HAVING COUNT(*) > 1;

-- Verificar si hay funciones con nombres similares
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%sincronizar%'
OR routine_name LIKE '%insertar%'
ORDER BY routine_name;

-- ====================================
-- 8. VERIFICAR ESTADO DE LOS DATOS
-- ====================================

SELECT '=== VERIFICANDO ESTADO DE LOS DATOS ===' as info;

-- Verificar integridad de los datos
SELECT 
    'Verificación de integridad' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL) as total_reclutamientos,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- Verificar que no hay datos inconsistentes
SELECT 
    'Datos inconsistentes' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND (
    EXISTS (SELECT 1 FROM historial_participacion_participantes h WHERE h.reclutamiento_id = r.id)
    OR EXISTS (SELECT 1 FROM historial_participacion_empresas h WHERE h.reclutamiento_id = r.id)
);

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO DE CONFLICTO COMPLETADO ===' as info;
SELECT 'Revisa los resultados para identificar el problema específico.' as mensaje;
SELECT 'Busca discrepancias entre finalizados y registros en historial.' as instruccion;
SELECT 'Verifica si hay triggers conflictivos o funciones duplicadas.' as instruccion_adicional; 