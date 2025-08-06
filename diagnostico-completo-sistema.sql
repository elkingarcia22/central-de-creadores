-- ====================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA
-- ====================================
-- Objetivo: Identificar todos los problemas y solucionarlos

-- ====================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- ====================================

SELECT 
    '=== ESTRUCTURA TABLA RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- ====================================
-- 2. VERIFICAR ESTRUCTURA ESTADO_AGENDAMIENTO_CAT
-- ====================================

SELECT 
    '=== ESTRUCTURA ESTADO_AGENDAMIENTO_CAT ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'estado_agendamiento_cat'
ORDER BY ordinal_position;

-- ====================================
-- 3. VERIFICAR DATOS EN ESTADO_AGENDAMIENTO_CAT
-- ====================================

SELECT 
    '=== DATOS EN ESTADO_AGENDAMIENTO_CAT ===' as info;

SELECT 
    *
FROM estado_agendamiento_cat
ORDER BY id;

-- ====================================
-- 4. VERIFICAR ESTRUCTURA TABLAS HISTORIAL
-- ====================================

SELECT 
    '=== ESTRUCTURA HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

SELECT 
    '=== ESTRUCTURA HISTORIAL EMPRESAS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position;

-- ====================================
-- 5. VERIFICAR TRIGGERS ACTIVOS
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
-- 6. VERIFICAR FUNCIONES CREADAS
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
-- 7. VERIFICAR RECLUTAMIENTO ESPECÍFICO
-- ====================================

SELECT 
    '=== RECLUTAMIENTO ESPECÍFICO ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    eac.id as estado_id,
    p.nombre as participante,
    p.empresa_id
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '2c4e9fc8-4307-4479-8c36-3a80e06cd895';

-- ====================================
-- 8. VERIFICAR PARTICIPANTE
-- ====================================

SELECT 
    '=== PARTICIPANTE ===' as info;

SELECT 
    p.id,
    p.nombre,
    p.empresa_id,
    e.nombre as empresa_nombre
FROM participantes p
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042';

-- ====================================
-- 9. VERIFICAR TABLAS DE HISTORIAL
-- ====================================

SELECT 
    '=== TABLAS DE HISTORIAL ===' as info;

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
-- 10. VERIFICAR ESTADÍSTICAS ACTUALES
-- ====================================

SELECT 
    '=== ESTADÍSTICAS ACTUALES ===' as info;

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

SELECT '=== DIAGNÓSTICO COMPLETO ===' as info;
SELECT '✅ Revisa todos los resultados para identificar problemas' as mensaje; 