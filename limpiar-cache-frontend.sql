-- ====================================
-- LIMPIAR CACHE FRONTEND
-- ====================================
-- Objetivo: Verificar si hay cache en el frontend
-- y forzar una recarga de datos

-- ====================================
-- 1. VERIFICAR DATOS ACTUALES EN HISTORIAL
-- ====================================

SELECT 
    '=== DATOS ACTUALES EN HISTORIAL ===' as info;

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

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTO ESPECÍFICO
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

-- ====================================
-- 3. SIMULAR API EXACTA
-- ====================================

SELECT 
    '=== SIMULACIÓN API EXACTA ===' as info;

-- Simular exactamente lo que hace /api/estadisticas-empresa
SELECT 
    'Total participaciones (estado_sesion = completada)' as consulta,
    COUNT(*) as resultado
FROM historial_participacion_empresas
WHERE empresa_id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
AND estado_sesion = 'completada';

-- ====================================
-- 4. INSTRUCCIONES PARA LIMPIAR CACHE
-- ====================================

SELECT 
    '=== INSTRUCCIONES PARA LIMPIAR CACHE ===' as info;

SELECT 
    '1. Abre las herramientas de desarrollador (F12)' as paso_1,
    '2. Ve a la pestaña Network' as paso_2,
    '3. Marca "Disable cache"' as paso_3,
    '4. Recarga la página (Ctrl+F5 o Cmd+Shift+R)' as paso_4,
    '5. Verifica las llamadas a /api/estadisticas-empresa' as paso_5;

-- ====================================
-- 5. VERIFICAR SI HAY MÚLTIPLES LLAMADAS
-- ====================================

SELECT 
    '=== POSIBLES CAUSAS DE DUPLICACIÓN ===' as info;

SELECT 
    '1. Cache del navegador' as causa_1,
    '2. Múltiples llamadas a la API' as causa_2,
    '3. Componente que se renderiza dos veces' as causa_3,
    '4. useEffect que se ejecuta múltiples veces' as causa_4;

-- ====================================
-- 6. DIAGNÓSTICO FINAL
-- ====================================

SELECT 
    '=== DIAGNÓSTICO FINAL ===' as info;

SELECT 
    'Si la API devuelve 1 pero el frontend muestra 2' as problema,
    'Entonces el problema está en el frontend' as causa,
    'Necesitamos limpiar cache o revisar el código' as solucion;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA DE CACHE COMPLETADA ===' as info;
SELECT '✅ Revisa las herramientas de desarrollador' as mensaje;
SELECT '✅ Verifica las llamadas a la API' as mensaje; 