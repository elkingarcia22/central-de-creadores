-- ====================================
-- VERIFICAR APIS DE ESTADÍSTICAS
-- ====================================
-- Problema: Las estadísticas siguen mostrando números incorrectos
-- Objetivo: Verificar exactamente qué están leyendo las APIs

-- ====================================
-- 1. VERIFICAR QUÉ LEE LA API DE PARTICIPANTES
-- ====================================

SELECT '=== VERIFICAR API DE PARTICIPANTES ===' as info;

-- Simular exactamente lo que hace la API de participantes
-- La API hace: SELECT * FROM historial_participacion_participantes WHERE participante_id = X AND estado_sesion = 'completada'

-- Verificar todos los registros en historial de participantes
SELECT 
    'Todos los registros en historial participantes' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- Verificar registros con estado_sesion = 'completada'
SELECT 
    'Registros con estado_sesion = completada' as info,
    COUNT(*) as registros_completados
FROM historial_participacion_participantes
WHERE estado_sesion = 'completada';

-- Verificar registros por participante específico
SELECT 
    p.nombre as participante,
    p.id as participante_id,
    COUNT(*) as total_en_historial,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as completadas_en_historial
FROM participantes p
LEFT JOIN historial_participacion_participantes h ON p.id = h.participante_id
WHERE p.id IN (
    SELECT DISTINCT participantes_id 
    FROM reclutamientos 
    WHERE participantes_id IS NOT NULL
)
GROUP BY p.id, p.nombre
ORDER BY p.nombre;

-- ====================================
-- 2. VERIFICAR QUÉ LEE LA API DE EMPRESAS
-- ====================================

SELECT '=== VERIFICAR API DE EMPRESAS ===' as info;

-- Simular exactamente lo que hace la API de empresas
-- La API hace: SELECT * FROM historial_participacion_empresas WHERE empresa_id = X AND estado_sesion = 'completada'

-- Verificar todos los registros en historial de empresas
SELECT 
    'Todos los registros en historial empresas' as info,
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- Verificar registros con estado_sesion = 'completada'
SELECT 
    'Registros con estado_sesion = completada' as info,
    COUNT(*) as registros_completados
FROM historial_participacion_empresas
WHERE estado_sesion = 'completada';

-- Verificar registros por empresa específica
SELECT 
    e.nombre as empresa,
    e.id as empresa_id,
    COUNT(*) as total_en_historial,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as completadas_en_historial
FROM empresas e
LEFT JOIN historial_participacion_empresas h ON e.id = h.empresa_id
WHERE e.id IN (
    SELECT DISTINCT p.empresa_id 
    FROM reclutamientos r
    JOIN participantes p ON r.participantes_id = p.id
    WHERE r.participantes_id IS NOT NULL
)
GROUP BY e.id, e.nombre
ORDER BY e.nombre;

-- ====================================
-- 3. VERIFICAR ESTADO_SESION EN HISTORIAL
-- ====================================

SELECT '=== VERIFICAR ESTADO_SESION EN HISTORIAL ===' as info;

-- Verificar todos los valores de estado_sesion en historial de participantes
SELECT 
    'Valores de estado_sesion en historial participantes' as info,
    estado_sesion,
    COUNT(*) as cantidad
FROM historial_participacion_participantes
GROUP BY estado_sesion
ORDER BY estado_sesion;

-- Verificar todos los valores de estado_sesion en historial de empresas
SELECT 
    'Valores de estado_sesion en historial empresas' as info,
    estado_sesion,
    COUNT(*) as cantidad
FROM historial_participacion_empresas
GROUP BY estado_sesion
ORDER BY estado_sesion;

-- ====================================
-- 4. VERIFICAR CORRESPONDENCIA CON RECLUTAMIENTOS
-- ====================================

SELECT '=== VERIFICAR CORRESPONDENCIA CON RECLUTAMIENTOS ===' as info;

-- Verificar que todos los registros en historial corresponden a reclutamientos finalizados
SELECT 
    'Historial participantes vs reclutamientos finalizados' as info,
    COUNT(*) as en_historial,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados
FROM historial_participacion_participantes;

-- Verificar registros en historial que NO corresponden a finalizados
SELECT 
    'Registros en historial que NO son finalizados' as info,
    COUNT(*) as cantidad
FROM historial_participacion_participantes h
WHERE NOT EXISTS (
    SELECT 1 FROM reclutamientos r 
    WHERE r.id = h.reclutamiento_id
    AND r.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

-- ====================================
-- 5. VERIFICAR DETALLES ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICAR DETALLES ESPECÍFICOS ===' as info;

-- Mostrar todos los registros en historial de participantes con detalles
SELECT 
    h.id as historial_id,
    h.participante_id,
    h.reclutamiento_id,
    p.nombre as participante,
    h.estado_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
LEFT JOIN reclutamientos r ON h.reclutamiento_id = r.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY p.nombre, h.id;

-- Mostrar todos los registros en historial de empresas con detalles
SELECT 
    h.id as historial_id,
    h.empresa_id,
    h.reclutamiento_id,
    e.nombre as empresa,
    h.estado_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
LEFT JOIN reclutamientos r ON h.reclutamiento_id = r.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
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
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN DE APIS COMPLETADA ===' as info;
SELECT 'Revisa los resultados para identificar por qué las APIs están leyendo números incorrectos.' as mensaje;
SELECT 'Busca registros con estado_sesion diferente a completada o registros que no corresponden a finalizados.' as instruccion; 