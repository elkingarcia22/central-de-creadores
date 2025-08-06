-- ====================================
-- VERIFICAR DATOS DEL FRONTEND
-- ====================================
-- Objetivo: Identificar de dónde viene la duplicación
-- en el frontend

-- ====================================
-- 1. VERIFICAR VISTAS DE ESTADÍSTICAS
-- ====================================

SELECT 
    '=== VISTAS DE ESTADÍSTICAS ===' as info;

-- Verificar si existen las vistas
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%estadisticas%'
ORDER BY table_name;

-- ====================================
-- 2. VERIFICAR DATOS EN RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== DATOS EN RECLUTAMIENTOS ===' as info;

SELECT 
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participante,
    COUNT(CASE WHEN estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN 1 END) as finalizados
FROM reclutamientos;

-- Verificar reclutamientos específicos
SELECT 
    '=== RECLUTAMIENTOS ESPECÍFICOS ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    p.nombre as participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
ORDER BY r.id;

-- ====================================
-- 3. VERIFICAR ESTADÍSTICAS DESDE RECLUTAMIENTOS
-- ====================================

SELECT 
    '=== ESTADÍSTICAS DESDE RECLUTAMIENTOS ===' as info;

SELECT 
    p.id,
    p.nombre as participante,
    COUNT(r.*) as total_participaciones,
    COUNT(CASE WHEN eac.nombre = 'Finalizado' THEN 1 END) as participaciones_finalizadas
FROM participantes p
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042'
GROUP BY p.id, p.nombre;

SELECT 
    '=== ESTADÍSTICAS EMPRESA DESDE RECLUTAMIENTOS ===' as info;

SELECT 
    e.id,
    e.nombre as empresa,
    COUNT(r.*) as total_participaciones,
    COUNT(CASE WHEN eac.nombre = 'Finalizado' THEN 1 END) as participaciones_finalizadas
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
LEFT JOIN reclutamientos r ON p.id = r.participantes_id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE e.id = (SELECT empresa_id FROM participantes WHERE id = '9155b800-f786-46d7-9294-bb385434d042')
GROUP BY e.id, e.nombre;

-- ====================================
-- 4. VERIFICAR ESTADÍSTICAS DESDE HISTORIAL
-- ====================================

SELECT 
    '=== ESTADÍSTICAS DESDE HISTORIAL ===' as info;

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
    '=== ESTADÍSTICAS EMPRESA DESDE HISTORIAL ===' as info;

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
-- 5. VERIFICAR API ENDPOINTS
-- ====================================

SELECT 
    '=== POSIBLES CAUSAS ===' as info;

SELECT 
    'El frontend está consultando reclutamientos en lugar de historial' as causa_1,
    'Las vistas de estadísticas usan reclutamientos directamente' as causa_2,
    'Hay cache en el frontend' as causa_3,
    'Los triggers no están funcionando' as causa_4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETO ===' as info;
SELECT '✅ Compara las estadísticas desde reclutamientos vs historial' as mensaje;
SELECT '✅ Si son diferentes, el frontend usa la fuente incorrecta' as mensaje; 