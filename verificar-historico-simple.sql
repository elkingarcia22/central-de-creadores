-- ====================================
-- VERIFICAR HISTÓRICO SIMPLE
-- ====================================
-- Objetivo: Verificar si el reclutamiento está en las tablas de historial

-- ====================================
-- 1. VERIFICAR RECLUTAMIENTO
-- ====================================

SELECT 
    '=== RECLUTAMIENTO ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 2. VERIFICAR HISTORIAL PARTICIPANTES
-- ====================================

SELECT 
    '=== HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN '✅ SÍ está en historial' ELSE '❌ NO está en historial' END as resultado
FROM historial_participacion_participantes
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- Mostrar detalles si existe
SELECT 
    *
FROM historial_participacion_participantes
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 3. VERIFICAR HISTORIAL EMPRESAS
-- ====================================

SELECT 
    '=== HISTORIAL EMPRESAS ===' as info;

SELECT 
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) > 0 THEN '✅ SÍ está en historial' ELSE '❌ NO está en historial' END as resultado
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- Mostrar detalles si existe
SELECT 
    *
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 4. VERIFICAR ESTADÍSTICAS PARTICIPANTE
-- ====================================

SELECT 
    '=== ESTADÍSTICAS PARTICIPANTE ===' as info;

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
-- 5. VERIFICAR ESTADÍSTICAS EMPRESA
-- ====================================

SELECT 
    '=== ESTADÍSTICAS EMPRESA ===' as info;

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
-- 6. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT 
    '=== TRIGGERS ACTIVOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETO ===' as info;
SELECT '✅ Revisa los resultados arriba para ver el estado del historial' as mensaje; 