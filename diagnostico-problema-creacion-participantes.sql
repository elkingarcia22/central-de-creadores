-- ====================================
-- DIAGNÓSTICO PROBLEMA CREACIÓN PARTICIPANTES
-- ====================================
-- Problema: Al crear nueva participación, el contador de participantes suma 1 extra
-- Causa: Posible problema con triggers o duplicados en historial
-- Objetivo: Identificar por qué se incrementa incorrectamente

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL DE PARTICIPANTES
-- ====================================

SELECT '=== ESTADO ACTUAL DE PARTICIPANTES ===' as info;

-- Verificar todas las participaciones por participante
SELECT 
    p.nombre as participante,
    COUNT(*) as total_participaciones
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
GROUP BY p.id, p.nombre
ORDER BY total_participaciones DESC;

-- Verificar solo finalizadas por participante
SELECT 
    p.nombre as participante,
    COUNT(*) as finalizadas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY p.id, p.nombre
ORDER BY finalizadas DESC;

-- ====================================
-- 2. VERIFICAR HISTORIAL DE PARTICIPANTES
-- ====================================

SELECT '=== HISTORIAL DE PARTICIPANTES ===' as info;

-- Verificar total en historial de participantes
SELECT 
    'Total en historial participantes' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- Verificar participaciones por participante en historial
SELECT 
    p.nombre as participante,
    COUNT(*) as en_historial
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
GROUP BY p.id, p.nombre
ORDER BY en_historial DESC;

-- ====================================
-- 3. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== TRIGGERS ACTIVOS ===' as info;

-- Verificar todos los triggers en reclutamientos
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- Verificar funciones relacionadas con participantes
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%participante%'
ORDER BY routine_name;

-- ====================================
-- 4. VERIFICAR DUPLICADOS EN HISTORIAL
-- ====================================

SELECT '=== VERIFICAR DUPLICADOS EN HISTORIAL ===' as info;

-- Verificar duplicados por participante
SELECT 
    p.nombre as participante,
    h.reclutamiento_id,
    COUNT(*) as duplicados
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
GROUP BY p.id, p.nombre, h.reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY p.nombre, h.reclutamiento_id;

-- Verificar duplicados por reclutamiento
SELECT 
    'Duplicados por reclutamiento' as info,
    COUNT(*) as total_duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_participantes
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- ====================================
-- 5. VERIFICAR CORRESPONDENCIA RECLUTAMIENTOS-HISTORIAL
-- ====================================

SELECT '=== CORRESPONDENCIA RECLUTAMIENTOS-HISTORIAL ===' as info;

-- Verificar reclutamientos finalizados vs historial
SELECT 
    'Comparación finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial;

-- Verificar participante específico que tiene problema
SELECT 
    'Detalle participante con problema' as info,
    p.nombre as participante,
    (SELECT COUNT(*) FROM reclutamientos r WHERE r.participantes_id = p.id) as total_reclutamientos,
    (SELECT COUNT(*) FROM reclutamientos r WHERE r.participantes_id = p.id AND r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes h WHERE h.participante_id = p.id) as en_historial
FROM participantes p
WHERE p.id IN (
    SELECT DISTINCT participantes_id 
    FROM reclutamientos 
    WHERE participantes_id IS NOT NULL
)
ORDER BY p.nombre;

-- ====================================
-- 6. VERIFICAR ESTADOS DE AGRENDAMIENTO
-- ====================================

SELECT '=== ESTADOS DE AGRENDAMIENTO ===' as info;

-- Verificar todos los estados
SELECT 
    id,
    nombre
FROM estado_agendamiento_cat
ORDER BY nombre;

-- Verificar reclutamientos por estado
SELECT 
    eac.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
GROUP BY eac.id, eac.nombre
ORDER BY eac.nombre;

-- ====================================
-- 7. VERIFICAR ÚLTIMAS INSERCIONES EN HISTORIAL
-- ====================================

SELECT '=== ÚLTIMAS INSERCIONES EN HISTORIAL ===' as info;

-- Verificar las últimas inserciones en historial de participantes
SELECT 
    h.id,
    h.participante_id,
    h.reclutamiento_id,
    p.nombre as participante,
    r.estado_agendamiento,
    eac.nombre as estado_nombre
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
JOIN reclutamientos r ON h.reclutamiento_id = r.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY h.id DESC
LIMIT 10;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT 'Revisa los resultados para identificar el problema específico.' as mensaje;
SELECT 'Probablemente hay duplicados o triggers que insertan incorrectamente.' as instruccion; 