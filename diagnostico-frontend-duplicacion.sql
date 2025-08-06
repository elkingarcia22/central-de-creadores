-- ====================================
-- DIAGNÓSTICO FRONTEND DUPLICACIÓN
-- ====================================
-- Objetivo: Verificar exactamente qué datos están causando la duplicación
-- y si hay algún problema en la lógica del frontend

-- ====================================
-- 1. VERIFICAR DATOS EXACTOS EN HISTORIAL
-- ====================================

SELECT 
    '=== DATOS EXACTOS EN HISTORIAL ===' as info;

-- Verificar todos los registros en historial empresas
SELECT 
    'Todos los registros en historial empresas' as consulta,
    COUNT(*) as total_registros,
    COUNT(DISTINCT empresa_id) as empresas_unicas,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_empresas;

-- Verificar registros específicos de la empresa
SELECT 
    'Registros específicos de la empresa' as consulta,
    empresa_id,
    reclutamiento_id,
    estado_sesion,
    fecha_participacion
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
ORDER BY fecha_participacion DESC;

-- ====================================
-- 2. SIMULAR API EXACTA CON LOGS
-- ====================================

SELECT 
    '=== SIMULACIÓN API CON LOGS ===' as info;

-- Simular exactamente lo que hace /api/estadisticas-empresa con logs
SELECT 
    'API: Obteniendo estadísticas de empresa' as log_1,
    (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042') as empresa_id;

SELECT 
    'API: Consultando historial_participacion_empresas' as log_2,
    'WHERE empresa_id = ' || (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042') as consulta,
    'AND estado_sesion = completada' as filtro;

SELECT 
    'API: Resultado final' as log_3,
    COUNT(*) as total_participaciones
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
AND estado_sesion = 'completada';

-- ====================================
-- 3. VERIFICAR SI HAY DATOS RESIDUALES
-- ====================================

SELECT 
    '=== VERIFICAR DATOS RESIDUALES ===' as info;

-- Verificar si hay registros con estado_sesion diferente a 'completada'
SELECT 
    'Registros con estado_sesion diferente a completada' as consulta,
    estado_sesion,
    COUNT(*) as cantidad
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY estado_sesion;

-- ====================================
-- 4. VERIFICAR RECLUTAMIENTO ESPECÍFICO
-- ====================================

SELECT 
    '=== VERIFICAR RECLUTAMIENTO ESPECÍFICO ===' as info;

-- Verificar el reclutamiento específico
SELECT 
    'Reclutamiento en historial' as consulta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM historial_participacion_empresas 
            WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895'
            AND estado_sesion = 'completada'
        ) THEN '✅ SÍ está en historial con estado completada'
        ELSE '❌ NO está en historial con estado completada'
    END as resultado;

-- Verificar todos los registros de este reclutamiento
SELECT 
    'Todos los registros del reclutamiento' as consulta,
    reclutamiento_id,
    estado_sesion,
    fecha_participacion
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 5. DIAGNÓSTICO FINAL
-- ====================================

SELECT 
    '=== DIAGNÓSTICO FINAL ===' as info;

SELECT 
    'Si la API devuelve 1 pero el frontend muestra 2' as problema,
    'Entonces el problema está en el frontend' as causa,
    'Posibles causas:' as analisis,
    '1. Cache del navegador' as causa_1,
    '2. Múltiples llamadas a la API' as causa_2,
    '3. Estado que no se limpia correctamente' as causa_3,
    '4. Componente que se renderiza múltiples veces' as causa_4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT '✅ Revisa los logs de la API' as mensaje;
SELECT '✅ Verifica si hay datos residuales' as mensaje; 