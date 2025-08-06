-- ====================================
-- PROBAR APIS DIRECTAMENTE
-- ====================================
-- Objetivo: Verificar si las APIs están devolviendo datos correctos
-- y si hay discrepancia con el frontend

-- ====================================
-- 1. VERIFICAR DATOS EXACTOS EN HISTORIAL
-- ====================================

SELECT 
    '=== DATOS EXACTOS EN HISTORIAL ===' as info;

-- Verificar datos específicos de la empresa
SELECT 
    e.id as empresa_id,
    e.nombre as empresa,
    COUNT(he.*) as total_en_historial,
    COUNT(CASE WHEN he.estado_sesion = 'completada' THEN 1 END) as completadas_en_historial
FROM empresas e
LEFT JOIN historial_participacion_empresas he ON e.id = he.empresa_id
WHERE e.id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY e.id, e.nombre;

-- Verificar datos específicos del participante
SELECT 
    p.id as participante_id,
    p.nombre as participante,
    COUNT(hp.*) as total_en_historial,
    COUNT(CASE WHEN hp.estado_sesion = 'completada' THEN 1 END) as completadas_en_historial
FROM participantes p
LEFT JOIN historial_participacion_participantes hp ON p.id = hp.participante_id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042'
GROUP BY p.id, p.nombre;

-- ====================================
-- 2. SIMULAR LO QUE HACE LA API DE EMPRESAS
-- ====================================

SELECT 
    '=== SIMULACIÓN API EMPRESAS ===' as info;

-- Simular exactamente lo que hace /api/estadisticas-empresa
SELECT 
    'Total participaciones (estado_sesion = completada)' as consulta,
    COUNT(*) as resultado
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
AND estado_sesion = 'completada';

-- Simular la consulta de última sesión
SELECT 
    'Última sesión (estado_sesion = completada)' as consulta,
    fecha_participacion,
    investigacion_id
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
AND estado_sesion = 'completada'
ORDER BY fecha_participacion DESC
LIMIT 1;

-- ====================================
-- 3. SIMULAR LO QUE HACE LA API DE PARTICIPANTES
-- ====================================

SELECT 
    '=== SIMULACIÓN API PARTICIPANTES ===' as info;

-- Simular exactamente lo que hace /api/estadisticas-participante
SELECT 
    'Total participaciones (estado_sesion = completada)' as consulta,
    COUNT(*) as resultado
FROM historial_participacion_participantes
WHERE participante_id = '9155b800-f786-46d7-9294-bb385434d042'
AND estado_sesion = 'completada';

-- Simular la consulta de última sesión
SELECT 
    'Última sesión (estado_sesion = completada)' as consulta,
    fecha_participacion,
    investigacion_id
FROM historial_participacion_participantes
WHERE participante_id = '9155b800-f786-46d7-9294-bb385434d042'
AND estado_sesion = 'completada'
ORDER BY fecha_participacion DESC
LIMIT 1;

-- ====================================
-- 4. VERIFICAR SI HAY DATOS DUPLICADOS EN HISTORIAL
-- ====================================

SELECT 
    '=== VERIFICAR DUPLICADOS EN HISTORIAL ===' as info;

-- Verificar duplicados en historial empresas
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT reclutamiento_id) THEN '✅ NO hay duplicados'
        ELSE '❌ HAY duplicados'
    END as resultado
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042');

-- Verificar duplicados en historial participantes
SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT reclutamiento_id) THEN '✅ NO hay duplicados'
        ELSE '❌ HAY duplicados'
    END as resultado
FROM historial_participacion_participantes
WHERE participante_id = '9155b800-f786-46d7-9294-bb385434d042';

-- ====================================
-- 5. VERIFICAR RECLUTAMIENTO ESPECÍFICO
-- ====================================

SELECT 
    '=== VERIFICAR RECLUTAMIENTO ESPECÍFICO ===' as info;

-- Verificar si el reclutamiento está en historial
SELECT 
    'Reclutamiento en historial empresas' as consulta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM historial_participacion_empresas 
            WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895'
        ) THEN '✅ SÍ está en historial'
        ELSE '❌ NO está en historial'
    END as resultado;

SELECT 
    'Reclutamiento en historial participantes' as consulta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895'
        ) THEN '✅ SÍ está en historial'
        ELSE '❌ NO está en historial'
    END as resultado;

-- ====================================
-- 6. DIAGNÓSTICO FINAL
-- ====================================

SELECT 
    '=== DIAGNÓSTICO FINAL ===' as info;

SELECT 
    'Si las APIs devuelven 1 pero el frontend muestra 2' as problema,
    'Entonces el problema está en el frontend (cache o consulta incorrecta)' as causa,
    'Necesitamos verificar el navegador y las consultas del frontend' as solucion;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== PRUEBA DE APIS COMPLETADA ===' as info;
SELECT '✅ Revisa los resultados de las simulaciones' as mensaje;
SELECT '✅ Si las APIs devuelven 1, el problema está en el frontend' as mensaje; 