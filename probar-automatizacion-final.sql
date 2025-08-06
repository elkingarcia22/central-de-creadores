-- ====================================
-- PROBAR AUTOMATIZACIÓN FINAL
-- ====================================
-- Objetivo: Probar que la automatización funciona
-- sin duplicados

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT 
    '=== ESTADO ACTUAL ===' as info;

-- Verificar reclutamiento específico
SELECT 
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    p.nombre as participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- Verificar tablas de historial
SELECT 
    '=== TABLAS DE HISTORIAL ANTES ===' as info;

SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as registros
FROM historial_participacion_empresas;

-- ====================================
-- 2. SIMULAR CAMBIO A FINALIZADO
-- ====================================

SELECT 
    '=== CAMBIANDO A FINALIZADO ===' as info;

-- Actualizar el reclutamiento a estado Finalizado
UPDATE reclutamientos 
SET estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
WHERE id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 3. VERIFICAR RESULTADOS
-- ====================================

SELECT 
    '=== TABLAS DE HISTORIAL DESPUÉS ===' as info;

SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as registros
FROM historial_participacion_empresas;

-- Verificar datos específicos
SELECT 
    '=== DATOS EN HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    *
FROM historial_participacion_participantes
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

SELECT 
    '=== DATOS EN HISTORIAL EMPRESAS ===' as info;

SELECT 
    *
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 4. VERIFICAR ESTADÍSTICAS
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
-- 5. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT 
    '=== VERIFICANDO DUPLICADOS ===' as info;

SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT reclutamiento_id) THEN '✅ NO hay duplicados'
        ELSE '❌ HAY duplicados'
    END as resultado
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT reclutamiento_id) THEN '✅ NO hay duplicados'
        ELSE '❌ HAY duplicados'
    END as resultado
FROM historial_participacion_empresas;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== PRUEBA DE AUTOMATIZACIÓN COMPLETADA ===' as info;
SELECT '✅ Si las tablas tienen 1 registro cada una, funciona correctamente' as mensaje;
SELECT '✅ Si las estadísticas muestran 1, todo está bien' as mensaje;
SELECT '✅ Si no hay duplicados, la solución es perfecta' as mensaje; 