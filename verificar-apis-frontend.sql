-- ====================================
-- VERIFICAR APIS DEL FRONTEND
-- ====================================
-- Problema: Frontend muestra datos antiguos
-- Objetivo: Verificar qué están leyendo las APIs del frontend
-- APIs: /api/estadisticas-participante, /api/estadisticas-empresa, /api/estadisticas-participante-interno

-- ====================================
-- 1. VERIFICAR QUÉ LEE LA API DE PARTICIPANTES
-- ====================================

SELECT '=== VERIFICAR API DE PARTICIPANTES ===' as info;

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
    SELECT DISTINCT empresa_id 
    FROM participantes 
    WHERE empresa_id IS NOT NULL
)
GROUP BY e.id, e.nombre
ORDER BY e.nombre;

-- ====================================
-- 3. VERIFICAR QUÉ LEE LA API DE PARTICIPANTES INTERNOS
-- ====================================

SELECT '=== VERIFICAR API DE PARTICIPANTES INTERNOS ===' as info;

-- La API hace: SELECT * FROM historial_participacion_participantes_internos WHERE participante_interno_id = X AND estado_sesion = 'completada'

-- Verificar todos los registros en historial de participantes internos
SELECT 
    'Todos los registros en historial participantes internos' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- Verificar registros con estado_sesion = 'completada'
SELECT 
    'Registros con estado_sesion = completada' as info,
    COUNT(*) as registros_completados
FROM historial_participacion_participantes_internos
WHERE estado_sesion = 'completada';

-- Verificar registros por participante interno específico
SELECT 
    pi.nombre as participante_interno,
    pi.id as participante_interno_id,
    COUNT(*) as total_en_historial,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as completadas_en_historial
FROM participantes_internos pi
LEFT JOIN historial_participacion_participantes_internos h ON pi.id = h.participante_interno_id
WHERE pi.id IN (
    SELECT DISTINCT participantes_internos_id 
    FROM reclutamientos 
    WHERE participantes_internos_id IS NOT NULL
)
GROUP BY pi.id, pi.nombre
ORDER BY pi.nombre;

-- ====================================
-- 4. VERIFICAR SI HAY DATOS RESIDUALES
-- ====================================

SELECT '=== VERIFICAR DATOS RESIDUALES ===' as info;

-- Verificar si hay datos que no se limpiaron
SELECT 
    'Datos residuales en historiales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_internos;

-- Verificar si hay reclutamientos que no se limpiaron
SELECT 
    'Reclutamientos residuales' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- ====================================
-- 5. SIMULAR LO QUE HACE CADA API
-- ====================================

SELECT '=== SIMULAR APIS ===' as info;

-- Simular API de participantes (primeros 3)
SELECT 
    'Simulación API participantes (primeros 3)' as info,
    p.id as participante_id,
    p.nombre as participante,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as total_participaciones_completadas
FROM participantes p
LEFT JOIN historial_participacion_participantes h ON p.id = h.participante_id
GROUP BY p.id, p.nombre
HAVING COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY p.nombre
LIMIT 3;

-- Simular API de empresas (primeros 3)
SELECT 
    'Simulación API empresas (primeros 3)' as info,
    e.id as empresa_id,
    e.nombre as empresa,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as total_participaciones_completadas
FROM empresas e
LEFT JOIN historial_participacion_empresas h ON e.id = h.empresa_id
GROUP BY e.id, e.nombre
HAVING COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) > 0
ORDER BY e.nombre
LIMIT 3;

-- ====================================
-- 6. DIAGNÓSTICO DEL PROBLEMA
-- ====================================

SELECT '=== DIAGNÓSTICO DEL PROBLEMA ===' as info;

-- Verificar si el problema es cache o datos reales
SELECT 
    'Diagnóstico del problema' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_participantes WHERE estado_sesion = 'completada') > 0
        THEN '❌ Hay datos reales en historial (no es cache)'
        ELSE '✅ Historial está limpio (puede ser cache del frontend)'
    END as diagnostico_participantes,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_empresas WHERE estado_sesion = 'completada') > 0
        THEN '❌ Hay datos reales en historial (no es cache)'
        ELSE '✅ Historial está limpio (puede ser cache del frontend)'
    END as diagnostico_empresas,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_participacion_participantes_internos WHERE estado_sesion = 'completada') > 0
        THEN '❌ Hay datos reales en historial (no es cache)'
        ELSE '✅ Historial está limpio (puede ser cache del frontend)'
    END as diagnostico_internos;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN COMPLETADA ===' as info;
SELECT '✅ Revisa los resultados arriba para entender el problema' as mensaje;
SELECT '⚠️ Si hay datos en historial, necesitamos limpiarlos' as explicacion;
SELECT '🔧 Si no hay datos, el problema es cache del frontend' as solucion; 