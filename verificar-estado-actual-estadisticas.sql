-- ====================================
-- VERIFICAR ESTADO ACTUAL ESTADÍSTICAS
-- ====================================
-- Objetivo: Verificar si los triggers están funcionando
-- y si las tablas de historial se están llenando

-- ====================================
-- 1. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT 
    '=== TRIGGERS ACTIVOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 2. VERIFICAR FUNCIONES CREADAS
-- ====================================

SELECT 
    '=== FUNCIONES CREADAS ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%trigger%'
ORDER BY routine_name;

-- ====================================
-- 3. VERIFICAR DATOS EN TABLAS DE HISTORIAL
-- ====================================

SELECT 
    '=== DATOS EN HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT participante_id) as participantes_unicos,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_participantes;

SELECT 
    '=== DATOS EN HISTORIAL EMPRESAS ===' as info;

SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT empresa_id) as empresas_unicas,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_empresas;

-- ====================================
-- 4. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT 
    '=== RECLUTAMIENTOS FINALIZADOS ===' as info;

SELECT 
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participante,
    COUNT(CASE WHEN estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados
FROM reclutamientos;

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS ACTUALES
-- ====================================

SELECT 
    '=== ESTADÍSTICAS PARTICIPANTES ===' as info;

SELECT 
    p.nombre as participante,
    COUNT(hp.*) as total_participaciones,
    COUNT(CASE WHEN hp.estado_sesion = 'completada' THEN 1 END) as participaciones_finalizadas
FROM participantes p
LEFT JOIN historial_participacion_participantes hp ON p.id = hp.participante_id
GROUP BY p.id, p.nombre
HAVING COUNT(hp.*) > 0
ORDER BY participaciones_finalizadas DESC;

SELECT 
    '=== ESTADÍSTICAS EMPRESAS ===' as info;

SELECT 
    e.nombre as empresa,
    COUNT(he.*) as total_participaciones,
    COUNT(CASE WHEN he.estado_sesion = 'completada' THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN historial_participacion_empresas he ON e.id = he.empresa_id
GROUP BY e.id, e.nombre
HAVING COUNT(he.*) > 0
ORDER BY participaciones_finalizadas DESC;

-- ====================================
-- 6. VERIFICAR ÚLTIMOS RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== ÚLTIMOS 5 RECLUTAMIENTOS ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    p.nombre as participante,
    eac.nombre as estado_agendamiento,
    r.created_at
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.created_at DESC
LIMIT 5;

-- ====================================
-- 7. VERIFICAR ESTADO DE AGENDAMIENTO
-- ====================================

SELECT 
    '=== ESTADOS DE AGENDAMIENTO DISPONIBLES ===' as info;

SELECT 
    id,
    nombre,
    descripcion
FROM estado_agendamiento_cat
ORDER BY id;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETO ===' as info;
SELECT '✅ Revisa los resultados arriba para ver el estado actual' as mensaje;
SELECT '✅ Si las tablas de historial están vacías, los triggers no están funcionando' as instruccion; 