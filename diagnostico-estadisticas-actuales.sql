-- ====================================
-- DIAGNÓSTICO DE ESTADÍSTICAS ACTUALES
-- ====================================
-- Objetivo: Verificar el estado actual de las estadísticas después del script anterior
-- para entender por qué están mostrando números incorrectos

-- ====================================
-- 1. VERIFICAR RECLUTAMIENTOS POR ESTADO
-- ====================================

SELECT '=== RECLUTAMIENTOS POR ESTADO ===' as info;

-- Verificar todos los reclutamientos
SELECT 
    'Todos los reclutamientos' as info,
    COUNT(*) as total
FROM reclutamientos 
WHERE participantes_id IS NOT NULL;

-- Verificar reclutamientos por estado
SELECT 
    eac.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
GROUP BY eac.id, eac.nombre
ORDER BY eac.nombre;

-- Verificar solo finalizados
SELECT 
    'Solo finalizados' as info,
    COUNT(*) as finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 2. VERIFICAR HISTORIAL ACTUAL
-- ====================================

SELECT '=== HISTORIAL ACTUAL ===' as info;

-- Verificar historial de empresas
SELECT 
    'Historial de empresas' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- Verificar historial de participantes
SELECT 
    'Historial de participantes' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- ====================================
-- 3. VERIFICAR PARTICIPACIONES POR EMPRESA
-- ====================================

SELECT '=== PARTICIPACIONES POR EMPRESA ===' as info;

-- Verificar todas las participaciones por empresa
SELECT 
    e.nombre as empresa,
    COUNT(*) as total_participaciones
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY total_participaciones DESC;

-- Verificar solo finalizadas por empresa
SELECT 
    e.nombre as empresa,
    COUNT(*) as finalizadas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY e.id, e.nombre
ORDER BY finalizadas DESC;

-- ====================================
-- 4. VERIFICAR PARTICIPACIONES POR PARTICIPANTE
-- ====================================

SELECT '=== PARTICIPACIONES POR PARTICIPANTE ===' as info;

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
-- 5. VERIFICAR DUPLICADOS EN HISTORIAL
-- ====================================

SELECT '=== VERIFICAR DUPLICADOS EN HISTORIAL ===' as info;

-- Verificar duplicados en historial de empresas
SELECT 
    'Duplicados en historial empresas' as info,
    COUNT(*) as duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_empresas
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- Verificar duplicados en historial de participantes
SELECT 
    'Duplicados en historial participantes' as info,
    COUNT(*) as duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_participantes
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- ====================================
-- 6. VERIFICAR CORRESPONDENCIA HISTORIAL-RECLUTAMIENTOS
-- ====================================

SELECT '=== CORRESPONDENCIA HISTORIAL-RECLUTAMIENTOS ===' as info;

-- Verificar historial vs reclutamientos finalizados
SELECT 
    'Historial empresas vs Finalizados' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as finalizados;

SELECT 
    'Historial participantes vs Finalizados' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as finalizados;

-- ====================================
-- 7. VERIFICAR ESTADOS DE AGRENDAMIENTO
-- ====================================

SELECT '=== ESTADOS DE AGRENDAMIENTO ===' as info;

SELECT 
    id,
    nombre,
    CASE WHEN nombre = 'Finalizado' THEN '✅' ELSE '❌' END as es_finalizado
FROM estado_agendamiento_cat
ORDER BY nombre;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT 'Revisa los resultados arriba para entender el problema.' as mensaje;
SELECT 'Necesitamos limpiar el historial y reinsertar solo las finalizadas.' as instruccion; 