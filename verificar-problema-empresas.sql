-- ====================================
-- VERIFICAR PROBLEMA ESPECÍFICO CON EMPRESAS
-- ====================================
-- Problema: Las estadísticas de participantes ya funcionan, pero las de empresas se dañaron
-- Objetivo: Identificar qué pasó específicamente con las empresas

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL DE EMPRESAS
-- ====================================

SELECT '=== ESTADO ACTUAL DE EMPRESAS ===' as info;

-- Verificar todas las participaciones por empresa
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
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
    e.id as empresa_id,
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
-- 2. VERIFICAR HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== HISTORIAL DE EMPRESAS ===' as info;

-- Verificar total en historial de empresas
SELECT 
    'Total en historial empresas' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- Verificar participaciones por empresa en historial
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(*) as en_historial
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
GROUP BY e.id, e.nombre
ORDER BY en_historial DESC;

-- ====================================
-- 3. VERIFICAR CORRESPONDENCIA EMPRESAS
-- ====================================

SELECT '=== CORRESPONDENCIA EMPRESAS ===' as info;

-- Verificar reclutamientos finalizados vs historial de empresas
SELECT 
    'Comparación finalizados vs historial empresas' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- Verificar empresas específicas que tienen problema
SELECT 
    'Detalle empresas con problema' as info,
    e.nombre as empresa,
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
-- 4. VERIFICAR DETALLES DE RECLUTAMIENTOS POR EMPRESA
-- ====================================

SELECT '=== DETALLES DE RECLUTAMIENTOS POR EMPRESA ===' as info;

-- Mostrar todos los reclutamientos por empresa
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    eac.nombre as estado,
    r.fecha_sesion,
    r.duracion_sesion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
ORDER BY e.nombre, p.nombre, r.id;

-- ====================================
-- 5. VERIFICAR DETALLES DEL HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== DETALLES DEL HISTORIAL DE EMPRESAS ===' as info;

-- Mostrar todos los registros en historial de empresas
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
-- 6. VERIFICAR EMPRESAS SIN CORRESPONDENCIA
-- ====================================

SELECT '=== EMPRESAS SIN CORRESPONDENCIA ===' as info;

-- Reclutamientos finalizados que NO están en historial de empresas
SELECT 
    'Finalizados sin historial empresas' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- Historial empresas que NO corresponde a reclutamientos finalizados
SELECT 
    'Historial empresas sin finalizados' as info,
    COUNT(*) as cantidad
FROM historial_participacion_empresas h
WHERE NOT EXISTS (
    SELECT 1 FROM reclutamientos r 
    WHERE r.id = h.reclutamiento_id
    AND r.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

-- ====================================
-- 7. VERIFICAR EMPRESAS SIN PARTICIPANTES
-- ====================================

SELECT '=== VERIFICAR EMPRESAS SIN PARTICIPANTES ===' as info;

-- Verificar si hay empresas sin participantes asignados
SELECT 
    'Empresas sin participantes' as info,
    COUNT(*) as cantidad
FROM empresas e
WHERE NOT EXISTS (
    SELECT 1 FROM participantes p WHERE p.empresa_id = e.id
);

-- Verificar empresas con participantes pero sin reclutamientos
SELECT 
    'Empresas con participantes pero sin reclutamientos' as info,
    COUNT(*) as cantidad
FROM empresas e
WHERE EXISTS (
    SELECT 1 FROM participantes p WHERE p.empresa_id = e.id
)
AND NOT EXISTS (
    SELECT 1 FROM reclutamientos r 
    JOIN participantes p ON r.participantes_id = p.id 
    WHERE p.empresa_id = e.id
);

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN DE EMPRESAS COMPLETADA ===' as info;
SELECT 'Revisa los resultados para identificar por qué las estadísticas de empresas se dañaron.' as mensaje;
SELECT 'Busca discrepancias entre reclutamientos finalizados y registros en historial de empresas.' as instruccion; 