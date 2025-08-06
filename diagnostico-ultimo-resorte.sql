-- ====================================
-- DIAGNÓSTICO DE ÚLTIMO RECURSO
-- ====================================
-- Problema: Las estadísticas siguen sin funcionar después de múltiples intentos
-- Objetivo: Identificar exactamente qué está causando el problema fundamental

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL COMPLETO
-- ====================================

SELECT '=== ESTADO ACTUAL COMPLETO ===' as info;

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
-- 2. VERIFICAR QUÉ LEE REALMENTE LA API
-- ====================================

SELECT '=== VERIFICAR QUÉ LEE REALMENTE LA API ===' as info;

-- Simular exactamente lo que hace la API de participantes
-- La API hace: SELECT * FROM historial_participacion_participantes WHERE participante_id = X AND estado_sesion = 'completada'

-- Verificar registros con estado_sesion = 'completada' en participantes
SELECT 
    'Registros con estado_sesion = completada en participantes' as info,
    COUNT(*) as registros_completados
FROM historial_participacion_participantes
WHERE estado_sesion = 'completada';

-- Verificar registros con estado_sesion = 'completada' en empresas
SELECT 
    'Registros con estado_sesion = completada en empresas' as info,
    COUNT(*) as registros_completados
FROM historial_participacion_empresas
WHERE estado_sesion = 'completada';

-- ====================================
-- 3. VERIFICAR PARTICIPANTES ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICAR PARTICIPANTES ESPECÍFICOS ===' as info;

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
-- 4. VERIFICAR EMPRESAS ESPECÍFICAS
-- ====================================

SELECT '=== VERIFICAR EMPRESAS ESPECÍFICAS ===' as info;

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
-- 5. VERIFICAR DETALLES ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICAR DETALLES ESPECÍFICOS ===' as info;

-- Mostrar todos los reclutamientos con detalles completos
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
LEFT JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
ORDER BY p.nombre, r.id;

-- Mostrar todos los registros en historial de participantes
SELECT 
    h.id as historial_id,
    h.participante_id,
    h.reclutamiento_id,
    p.nombre as participante,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
ORDER BY p.nombre, h.id;

-- Mostrar todos los registros en historial de empresas
SELECT 
    h.id as historial_id,
    h.empresa_id,
    h.reclutamiento_id,
    e.nombre as empresa,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
ORDER BY e.nombre, h.id;

-- ====================================
-- 6. VERIFICAR ESTADOS DE AGRENDAMIENTO
-- ====================================

SELECT '=== VERIFICAR ESTADOS DE AGRENDAMIENTO ===' as info;

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
-- 7. VERIFICAR PROBLEMAS FUNDAMENTALES
-- ====================================

SELECT '=== VERIFICAR PROBLEMAS FUNDAMENTALES ===' as info;

-- Verificar si hay reclutamientos sin participantes
SELECT 
    'Reclutamientos sin participantes' as info,
    COUNT(*) as cantidad
FROM reclutamientos
WHERE participantes_id IS NULL;

-- Verificar si hay participantes sin empresa
SELECT 
    'Participantes sin empresa' as info,
    COUNT(*) as cantidad
FROM participantes
WHERE empresa_id IS NULL;

-- Verificar si hay empresas que no existen
SELECT 
    'Empresas que no existen' as info,
    COUNT(*) as cantidad
FROM participantes p
WHERE p.empresa_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM empresas e WHERE e.id = p.empresa_id);

-- Verificar si hay reclutamientos sin estado
SELECT 
    'Reclutamientos sin estado' as info,
    COUNT(*) as cantidad
FROM reclutamientos
WHERE estado_agendamiento IS NULL;

-- ====================================
-- 8. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICAR CORRESPONDENCIA EXACTA ===' as info;

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
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO DE ÚLTIMO RECURSO COMPLETADO ===' as info;
SELECT 'Revisa los resultados para identificar el problema fundamental.' as mensaje;
SELECT 'Busca discrepancias entre reclutamientos finalizados y registros en historial.' as instruccion;
SELECT 'Verifica que los estados de agendamiento sean correctos.' as instruccion_adicional; 