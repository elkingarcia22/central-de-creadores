-- ====================================
-- DIAGNÓSTICO PROFUNDO DE ESTADÍSTICAS (CORREGIDO)
-- ====================================
-- Problema: Después de limpiar todo y crear 1 participación finalizada
-- - Debería mostrar: Empresa 1, Participante 1
-- - Muestra: Empresa 2, Participante 3
-- Objetivo: Identificar exactamente qué está causando el conteo incorrecto

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL EXACTO
-- ====================================

SELECT '=== VERIFICANDO ESTADO ACTUAL EXACTO ===' as info;

-- Verificar reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Verificar historial de participantes
SELECT 
    'Historial participantes' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- Verificar historial de empresas
SELECT 
    'Historial empresas' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- ====================================
-- 2. VERIFICAR DETALLES ESPECÍFICOS DE RECLUTAMIENTOS
-- ====================================

SELECT '=== VERIFICANDO DETALLES ESPECÍFICOS DE RECLUTAMIENTOS ===' as info;

-- Mostrar TODOS los reclutamientos con detalles completos
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    eac.nombre as estado,
    r.fecha_sesion,
    r.duracion_sesion,
    CASE WHEN hp.id IS NOT NULL THEN 'SÍ' ELSE 'NO' END as en_historial_participantes,
    CASE WHEN he.id IS NOT NULL THEN 'SÍ' ELSE 'NO' END as en_historial_empresas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LEFT JOIN historial_participacion_participantes hp ON r.id = hp.reclutamiento_id
LEFT JOIN historial_participacion_empresas he ON r.id = he.reclutamiento_id
ORDER BY r.id;

-- ====================================
-- 3. VERIFICAR REGISTROS EN HISTORIAL
-- ====================================

SELECT '=== VERIFICANDO REGISTROS EN HISTORIAL ===' as info;

-- Mostrar TODOS los registros en historial de participantes
SELECT 
    'Registros en historial participantes' as info,
    h.id as historial_id,
    h.participante_id,
    h.reclutamiento_id,
    p.nombre as participante,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
ORDER BY h.id;

-- Mostrar TODOS los registros en historial de empresas
SELECT 
    'Registros en historial empresas' as info,
    h.id as historial_id,
    h.empresa_id,
    h.reclutamiento_id,
    e.nombre as empresa,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
ORDER BY h.id;

-- ====================================
-- 4. VERIFICAR DUPLICADOS ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICANDO DUPLICADOS ESPECÍFICOS ===' as info;

-- Verificar duplicados por reclutamiento_id en participantes
SELECT 
    'Duplicados por reclutamiento_id en participantes' as info,
    reclutamiento_id,
    COUNT(*) as cantidad
FROM historial_participacion_participantes
GROUP BY reclutamiento_id
HAVING COUNT(*) > 1;

-- Verificar duplicados por reclutamiento_id en empresas
SELECT 
    'Duplicados por reclutamiento_id en empresas' as info,
    reclutamiento_id,
    COUNT(*) as cantidad
FROM historial_participacion_empresas
GROUP BY reclutamiento_id
HAVING COUNT(*) > 1;

-- ====================================
-- 5. VERIFICAR TRIGGERS ACTIVOS
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
-- 6. VERIFICAR PARTICIPANTES ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICANDO PARTICIPANTES ESPECÍFICOS ===' as info;

-- Verificar todos los participantes que tienen reclutamientos
SELECT 
    p.nombre as participante,
    p.id as participante_id,
    COUNT(r.id) as total_reclutamientos,
    COUNT(CASE WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados,
    COUNT(h.id) as en_historial
FROM participantes p
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
LEFT JOIN historial_participacion_participantes h ON p.id = h.participante_id
WHERE r.id IS NOT NULL
GROUP BY p.id, p.nombre
ORDER BY p.nombre;

-- ====================================
-- 7. VERIFICAR EMPRESAS ESPECÍFICAS
-- ====================================

SELECT '=== VERIFICANDO EMPRESAS ESPECÍFICAS ===' as info;

-- Verificar todas las empresas que tienen reclutamientos
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
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
-- 8. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial participantes' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_participantes h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

SELECT 
    'Verificación de finalizadas en historial empresas' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 9. VERIFICAR PROBLEMAS ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICANDO PROBLEMAS ESPECÍFICOS ===' as info;

-- Verificar reclutamientos finalizados que NO están en historial
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
-- 10. VERIFICAR ESTADOS DE AGRENDAMIENTO
-- ====================================

SELECT '=== VERIFICANDO ESTADOS DE AGRENDAMIENTO ===' as info;

-- Verificar todos los estados disponibles
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
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO PROFUNDO COMPLETADO ===' as info;
SELECT 'Revisa los resultados para identificar el problema específico.' as mensaje;
SELECT 'Busca duplicados, reclutamientos sin historial, o historial sin finalizar.' as instruccion;
SELECT 'Verifica si hay múltiples triggers activos causando inserciones duplicadas.' as instruccion_adicional; 