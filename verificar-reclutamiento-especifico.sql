-- ====================================
-- VERIFICAR RECLUTAMIENTO ESPECÍFICO
-- ====================================
-- Objetivo: Verificar si el reclutamiento específico está en historial
-- y si las estadísticas se calculan correctamente

-- ====================================
-- 1. VERIFICAR RECLUTAMIENTO ESPECÍFICO
-- ====================================

SELECT 
    '=== RECLUTAMIENTO ESPECÍFICO ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    p.nombre as participante,
    eac.nombre as estado_nombre
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 2. VERIFICAR SI ESTÁ EN HISTORIAL PARTICIPANTES
-- ====================================

SELECT 
    '=== EN HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN '✅ SÍ está en historial' ELSE '❌ NO está en historial' END as resultado
FROM historial_participacion_participantes
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- Si hay registros, mostrar los detalles
SELECT 
    *
FROM historial_participacion_participantes
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 3. VERIFICAR SI ESTÁ EN HISTORIAL EMPRESAS
-- ====================================

SELECT 
    '=== EN HISTORIAL EMPRESAS ===' as info;

SELECT 
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN '✅ SÍ está en historial' ELSE '❌ NO está en historial' END as resultado
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- Si hay registros, mostrar los detalles
SELECT 
    *
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 4. VERIFICAR ESTADÍSTICAS DEL PARTICIPANTE
-- ====================================

SELECT 
    '=== ESTADÍSTICAS DEL PARTICIPANTE ===' as info;

SELECT 
    p.id,
    p.nombre as participante,
    COUNT(hp.*) as total_participaciones,
    COUNT(CASE WHEN hp.estado_sesion = 'completada' THEN 1 END) as participaciones_finalizadas
FROM participantes p
LEFT JOIN historial_participacion_participantes hp ON p.id = hp.participante_id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042'
GROUP BY p.id, p.nombre;

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS DE LA EMPRESA
-- ====================================

SELECT 
    '=== ESTADÍSTICAS DE LA EMPRESA ===' as info;

SELECT 
    e.id,
    e.nombre as empresa,
    COUNT(he.*) as total_participaciones,
    COUNT(CASE WHEN he.estado_sesion = 'completada' THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN historial_participacion_empresas he ON e.id = he.empresa_id
WHERE e.id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY e.id, e.nombre;

-- ====================================
-- 6. VERIFICAR TODOS LOS RECLUTAMIENTOS DEL PARTICIPANTE
-- ====================================

SELECT 
    '=== TODOS LOS RECLUTAMIENTOS DEL PARTICIPANTE ===' as info;

SELECT 
    r.id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
ORDER BY r.id;

-- ====================================
-- 7. VERIFICAR ESTADO "FINALIZADO"
-- ====================================

SELECT 
    '=== ESTADO FINALIZADO ===' as info;

SELECT 
    id,
    nombre
FROM estado_agendamiento_cat
WHERE nombre = 'Finalizado';

-- ====================================
-- 8. VERIFICAR SI EL RECLUTAMIENTO ESTÁ FINALIZADO
-- ====================================

SELECT 
    '=== ¿ESTÁ FINALIZADO? ===' as info;

SELECT 
    r.id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    CASE 
        WHEN r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') 
        THEN '✅ SÍ está finalizado' 
        ELSE '❌ NO está finalizado' 
    END as resultado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO ESPECÍFICO COMPLETO ===' as info;
SELECT '✅ Revisa los resultados arriba para ver el estado del reclutamiento específico' as mensaje; 