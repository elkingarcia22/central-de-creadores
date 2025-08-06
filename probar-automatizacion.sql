-- ====================================
-- PROBAR AUTOMATIZACIÓN
-- ====================================
-- Objetivo: Probar que los triggers funcionan correctamente
-- con el reclutamiento existente

-- ====================================
-- 1. VERIFICAR TRIGGERS ACTIVOS
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
-- 2. VERIFICAR ESTADO ACTUAL DEL RECLUTAMIENTO
-- ====================================

SELECT 
    '=== ESTADO ACTUAL DEL RECLUTAMIENTO ===' as info;

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

-- ====================================
-- 3. VERIFICAR TABLAS DE HISTORIAL VACÍAS
-- ====================================

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
-- 4. SIMULAR CAMBIO A FINALIZADO (ACTUALIZAR)
-- ====================================

SELECT 
    '=== ACTUALIZANDO A FINALIZADO ===' as info;

-- Actualizar el reclutamiento a estado Finalizado
UPDATE reclutamientos 
SET estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
WHERE id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 5. VERIFICAR SI SE LLENARON LAS TABLAS DE HISTORIAL
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

-- ====================================
-- 6. VERIFICAR DATOS EN HISTORIAL PARTICIPANTES
-- ====================================

SELECT 
    '=== DATOS EN HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    *
FROM historial_participacion_participantes
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 7. VERIFICAR DATOS EN HISTORIAL EMPRESAS
-- ====================================

SELECT 
    '=== DATOS EN HISTORIAL EMPRESAS ===' as info;

SELECT 
    *
FROM historial_participacion_empresas
WHERE reclutamiento_id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 8. VERIFICAR ESTADÍSTICAS DEL PARTICIPANTE
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
-- 9. VERIFICAR ESTADÍSTICAS DE LA EMPRESA
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
-- MENSAJE FINAL
-- ====================================

SELECT '=== PRUEBA DE AUTOMATIZACIÓN COMPLETADA ===' as info;
SELECT '✅ Si las tablas de historial tienen datos, la automatización funciona' as mensaje;
SELECT '✅ Si las estadísticas muestran 1, todo está funcionando correctamente' as mensaje; 