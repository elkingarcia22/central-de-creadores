-- ====================================
-- DIAGNÓSTICO COMPLETO - AUTOMATIZACIÓN DE ESTADÍSTICAS
-- ====================================
-- Fecha: $(date)
-- Problema: La automatización funciona al eliminar pero no al crear nuevas participaciones

-- ====================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- ====================================

SELECT '=== VERIFICACIÓN DE ESTRUCTURA ===' as info;

-- Verificar tabla historial_participacion_empresas
SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- Verificar tabla historial_participacion_participantes
SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- Verificar tabla reclutamientos
SELECT 
    'reclutamientos' as tabla,
    COUNT(*) as total_registros
FROM reclutamientos;

-- ====================================
-- 2. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== VERIFICACIÓN DE TRIGGERS ===' as info;

-- Listar todos los triggers relacionados con historial
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (
    trigger_name LIKE '%historial%' 
    OR trigger_name LIKE '%empresa%' 
    OR trigger_name LIKE '%participante%'
    OR event_object_table IN ('reclutamientos', 'historial_participacion_empresas', 'historial_participacion_participantes')
)
ORDER BY event_object_table, trigger_name;

-- ====================================
-- 3. VERIFICAR ESTADOS DE AGENDAMIENTO
-- ====================================

SELECT '=== VERIFICACIÓN DE ESTADOS ===' as info;

-- Verificar estados de agendamiento disponibles
SELECT 
    id,
    nombre,
    descripcion,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- Verificar reclutamientos con sus estados
SELECT 
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    r.fecha_sesion,
    r.created_at
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.created_at DESC
LIMIT 10;

-- ====================================
-- 4. VERIFICAR FUNCIONES DE AUTOMATIZACIÓN
-- ====================================

SELECT '=== VERIFICACIÓN DE FUNCIONES ===' as info;

-- Listar funciones relacionadas con automatización
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_name LIKE '%historial%' 
    OR routine_name LIKE '%empresa%' 
    OR routine_name LIKE '%participante%'
    OR routine_name LIKE '%automatico%'
    OR routine_name LIKE '%sincronizar%'
)
ORDER BY routine_name;

-- ====================================
-- 5. VERIFICAR DATOS DE PARTICIPANTES
-- ====================================

SELECT '=== VERIFICACIÓN DE PARTICIPANTES ===' as info;

-- Verificar participantes con empresa
SELECT 
    p.id,
    p.nombre,
    p.empresa_id,
    e.nombre as empresa_nombre,
    p.estado_participante,
    p.fecha_ultima_participacion
FROM participantes p
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE p.empresa_id IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- ====================================
-- 6. VERIFICAR PROBLEMAS ESPECÍFICOS
-- ====================================

SELECT '=== DIAGNÓSTICO DE PROBLEMAS ===' as info;

-- Verificar si hay reclutamientos sin empresa_id en participantes
SELECT 
    'Reclutamientos sin empresa' as problema,
    COUNT(*) as total
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL 
AND p.empresa_id IS NULL;

-- Verificar si hay reclutamientos con estado 'Finalizado' pero sin historial
SELECT 
    'Reclutamientos finalizados sin historial' as problema,
    COUNT(*) as total
FROM reclutamientos r
LEFT JOIN historial_participacion_empresas h ON r.id = h.reclutamiento_id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND h.id IS NULL;

-- Verificar si hay reclutamientos con estado 'Finalizado' pero sin historial de participantes
SELECT 
    'Reclutamientos finalizados sin historial participantes' as problema,
    COUNT(*) as total
FROM reclutamientos r
LEFT JOIN historial_participacion_participantes h ON r.id = h.reclutamiento_id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND h.id IS NULL;

-- ====================================
-- 7. VERIFICAR CONFIGURACIÓN LOCAL VS NUBE
-- ====================================

SELECT '=== VERIFICACIÓN DE CONFIGURACIÓN ===' as info;

-- Verificar si estamos en modo local o nube
SELECT 
    'Configuración actual' as info,
    CASE 
        WHEN current_setting('server.version_num')::int >= 120000 THEN 'PostgreSQL 12+ (Nube)'
        ELSE 'PostgreSQL < 12 (Local)'
    END as entorno;

-- Verificar permisos de triggers
SELECT 
    'Permisos de triggers' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trigger_insertar_historial_empresa',
    'trigger_sincronizar_historial_participantes_externos',
    'trigger_sincronizar_historial_participantes_internos'
);

-- ====================================
-- 8. RECOMENDACIONES
-- ====================================

SELECT '=== RECOMENDACIONES ===' as info;

-- Mostrar recomendaciones basadas en el diagnóstico
SELECT 
    'RECOMENDACIÓN 1' as tipo,
    'Verificar que los participantes tengan empresa_id asignado' as descripcion
UNION ALL
SELECT 
    'RECOMENDACIÓN 2' as tipo,
    'Verificar que los estados de agendamiento estén correctamente configurados' as descripcion
UNION ALL
SELECT 
    'RECOMENDACIÓN 3' as tipo,
    'Verificar que los triggers estén activos y funcionando' as descripcion
UNION ALL
SELECT 
    'RECOMENDACIÓN 4' as tipo,
    'Si estás en local, considerar migrar a Supabase para mejor funcionamiento' as descripcion;

-- ====================================
-- 9. SCRIPT DE CORRECCIÓN SUGERIDO
-- ====================================

SELECT '=== SCRIPT DE CORRECCIÓN ===' as info;

-- Mostrar script para corregir problemas comunes
SELECT 
    '-- Script de corrección para automatización de estadísticas' as script_line
UNION ALL
SELECT 
    '-- 1. Verificar y corregir participantes sin empresa_id' as script_line
UNION ALL
SELECT 
    'UPDATE participantes SET empresa_id = (SELECT id FROM empresas LIMIT 1) WHERE empresa_id IS NULL;' as script_line
UNION ALL
SELECT 
    '-- 2. Re-ejecutar triggers para reclutamientos existentes' as script_line
UNION ALL
SELECT 
    'UPDATE reclutamientos SET updated_at = NOW() WHERE estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = ''Finalizado'');' as script_line
UNION ALL
SELECT 
    '-- 3. Verificar que los triggers estén activos' as script_line
UNION ALL
SELECT 
    '-- Ejecutar: SELECT * FROM information_schema.triggers WHERE trigger_name LIKE ''%historial%'';' as script_line;

-- ====================================
-- FIN DEL DIAGNÓSTICO
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info; 