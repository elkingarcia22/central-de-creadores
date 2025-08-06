-- ====================================
-- DIAGNÓSTICO ESPECÍFICO DE EMPRESAS
-- ====================================
-- Problema: Las estadísticas de empresas siguen sin funcionar
-- Objetivo: Identificar exactamente qué está causando el problema

-- ====================================
-- 1. VERIFICAR ESTRUCTURA DE DATOS DE EMPRESAS
-- ====================================

SELECT '=== ESTRUCTURA DE DATOS DE EMPRESAS ===' as info;

-- Verificar todas las empresas
SELECT 
    'Todas las empresas' as info,
    COUNT(*) as total_empresas
FROM empresas;

-- Verificar empresas con participantes
SELECT 
    'Empresas con participantes' as info,
    COUNT(DISTINCT e.id) as empresas_con_participantes
FROM empresas e
JOIN participantes p ON e.id = p.empresa_id;

-- Verificar empresas con reclutamientos
SELECT 
    'Empresas con reclutamientos' as info,
    COUNT(DISTINCT e.id) as empresas_con_reclutamientos
FROM empresas e
JOIN participantes p ON e.id = p.empresa_id
JOIN reclutamientos r ON p.id = r.participantes_id;

-- ====================================
-- 2. VERIFICAR PARTICIPANTES POR EMPRESA
-- ====================================

SELECT '=== PARTICIPANTES POR EMPRESA ===' as info;

-- Verificar participantes por empresa
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(p.id) as total_participantes
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
GROUP BY e.id, e.nombre
ORDER BY total_participantes DESC;

-- Verificar participantes con reclutamientos por empresa
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(DISTINCT p.id) as participantes_con_reclutamientos
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY participantes_con_reclutamientos DESC;

-- ====================================
-- 3. VERIFICAR RECLUTAMIENTOS POR EMPRESA
-- ====================================

SELECT '=== RECLUTAMIENTOS POR EMPRESA ===' as info;

-- Verificar todos los reclutamientos por empresa
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(r.id) as total_reclutamientos
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY total_reclutamientos DESC;

-- Verificar reclutamientos finalizados por empresa
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(r.id) as reclutamientos_finalizados
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY e.id, e.nombre
ORDER BY reclutamientos_finalizados DESC;

-- ====================================
-- 4. VERIFICAR HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== HISTORIAL DE EMPRESAS ===' as info;

-- Verificar total en historial de empresas
SELECT 
    'Total en historial empresas' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- Verificar empresas en historial
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(h.id) as registros_en_historial
FROM empresas e
LEFT JOIN historial_participacion_empresas h ON e.id = h.empresa_id
GROUP BY e.id, e.nombre
ORDER BY registros_en_historial DESC;

-- ====================================
-- 5. VERIFICAR CORRESPONDENCIA ESPECÍFICA
-- ====================================

SELECT '=== CORRESPONDENCIA ESPECÍFICA ===' as info;

-- Verificar cada empresa individualmente
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE p.empresa_id = e.id) as total_reclutamientos,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE p.empresa_id = e.id AND r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as finalizados,
    (SELECT COUNT(*) FROM historial_participacion_empresas h WHERE h.empresa_id = e.id) as en_historial
FROM empresas e
WHERE e.id IN (
    SELECT DISTINCT p.empresa_id 
    FROM reclutamientos r
    JOIN participantes p ON r.participantes_id = p.id
    WHERE r.participantes_id IS NOT NULL
)
ORDER BY e.nombre;

-- ====================================
-- 6. VERIFICAR DETALLES ESPECÍFICOS
-- ====================================

SELECT '=== DETALLES ESPECÍFICOS ===' as info;

-- Mostrar todos los reclutamientos con detalles de empresa
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    e.id as empresa_id,
    eac.nombre as estado,
    r.fecha_sesion,
    r.duracion_sesion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
ORDER BY e.nombre, p.nombre, r.id;

-- Mostrar todos los registros en historial de empresas con detalles
SELECT 
    h.id as historial_id,
    h.empresa_id,
    h.reclutamiento_id,
    e.nombre as empresa,
    p.nombre as participante,
    h.fecha_participacion,
    h.estado_sesion,
    h.duracion_sesion
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
LEFT JOIN participantes p ON h.participante_id = p.id
ORDER BY e.nombre, h.id;

-- ====================================
-- 7. VERIFICAR PROBLEMAS ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICAR PROBLEMAS ESPECÍFICOS ===' as info;

-- Verificar si hay empresas sin empresa_id en participantes
SELECT 
    'Participantes sin empresa_id' as info,
    COUNT(*) as cantidad
FROM participantes
WHERE empresa_id IS NULL;

-- Verificar si hay reclutamientos sin empresa_id
SELECT 
    'Reclutamientos sin empresa_id' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE p.empresa_id IS NULL;

-- Verificar si hay empresas que no existen
SELECT 
    'Empresas que no existen' as info,
    COUNT(*) as cantidad
FROM participantes p
WHERE p.empresa_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM empresas e WHERE e.id = p.empresa_id);

-- ====================================
-- 8. VERIFICAR ESTADOS DE AGRENDAMIENTO
-- ====================================

SELECT '=== VERIFICAR ESTADOS DE AGRENDAMIENTO ===' as info;

-- Verificar todos los estados disponibles
SELECT 
    id,
    nombre
FROM estado_agendamiento_cat
ORDER BY nombre;

-- Verificar reclutamientos por estado y empresa
SELECT 
    e.nombre as empresa,
    eac.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
GROUP BY e.id, e.nombre, eac.id, eac.nombre
ORDER BY e.nombre, eac.nombre;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO ESPECÍFICO DE EMPRESAS COMPLETADO ===' as info;
SELECT 'Revisa los resultados para identificar exactamente qué está causando el problema con las empresas.' as mensaje;
SELECT 'Busca discrepancias entre reclutamientos finalizados y registros en historial de empresas.' as instruccion; 