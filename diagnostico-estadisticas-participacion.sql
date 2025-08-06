-- ====================================
-- DIAGNÓSTICO ESPECÍFICO DE ESTADÍSTICAS DE PARTICIPACIÓN
-- ====================================
-- Objetivo: Verificar por qué las estadísticas muestran 1 en lugar de 2

-- ====================================
-- 1. VERIFICAR DATOS EN TABLAS DE HISTORIAL
-- ====================================

SELECT '=== DATOS EN TABLAS DE HISTORIAL ===' as info;

-- Verificar historial de empresas
SELECT 
    'Historial de empresas' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT empresa_id) as empresas_unicas,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_empresas;

-- Verificar historial de participantes externos
SELECT 
    'Historial de participantes externos' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT participante_id) as participantes_unicos,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_participantes;

-- Verificar historial de participantes internos
SELECT 
    'Historial de participantes internos' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT participante_interno_id) as participantes_unicos,
    COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos
FROM historial_participacion_participantes_internos;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT '=== RECLUTAMIENTOS FINALIZADOS ===' as info;

-- Verificar reclutamientos con estado 'Finalizado'
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participantes_externos,
    COUNT(CASE WHEN participantes_internos_id IS NOT NULL THEN 1 END) as con_participantes_internos
FROM reclutamientos 
WHERE estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar detalles de reclutamientos finalizados
SELECT 
    r.id,
    r.participantes_id,
    r.participantes_internos_id,
    r.estado_agendamiento,
    r.fecha_sesion,
    r.duracion_sesion,
    p.nombre as nombre_participante,
    p.empresa_id,
    e.nombre as nombre_empresa
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY r.created_at DESC;

-- ====================================
-- 3. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== TRIGGERS ACTIVOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 4. VERIFICAR FUNCIONES ACTIVAS
-- ====================================

SELECT '=== FUNCIONES ACTIVAS ===' as info;

SELECT 
    routine_name,
    routine_type
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
-- 5. VERIFICAR ESTADOS DE AGENDAMIENTO
-- ====================================

SELECT '=== ESTADOS DE AGENDAMIENTO ===' as info;

SELECT 
    id,
    nombre,
    descripcion
FROM estado_agendamiento_cat
ORDER BY nombre;

-- ====================================
-- 6. VERIFICAR PARTICIPANTES CON EMPRESA_ID
-- ====================================

SELECT '=== PARTICIPANTES CON EMPRESA_ID ===' as info;

SELECT 
    'Participantes con empresa_id' as info,
    COUNT(*) as total_participantes,
    COUNT(CASE WHEN empresa_id IS NOT NULL THEN 1 END) as con_empresa_id,
    COUNT(CASE WHEN empresa_id IS NULL THEN 1 END) as sin_empresa_id
FROM participantes;

-- Mostrar participantes sin empresa_id
SELECT 
    p.id,
    p.nombre,
    p.empresa_id,
    e.nombre as nombre_empresa
FROM participantes p
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE p.empresa_id IS NULL
AND p.id IN (
    SELECT DISTINCT participantes_id 
    FROM reclutamientos 
    WHERE participantes_id IS NOT NULL
);

-- ====================================
-- 7. VERIFICAR RELACIÓN ENTRE RECLUTAMIENTOS E HISTORIAL
-- ====================================

SELECT '=== RELACIÓN RECLUTAMIENTOS-HISTORIAL ===' as info;

-- Reclutamientos finalizados que NO están en historial de empresas
SELECT 
    'Reclutamientos finalizados SIN historial de empresas' as info,
    COUNT(*) as total
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- Reclutamientos finalizados que NO están en historial de participantes
SELECT 
    'Reclutamientos finalizados SIN historial de participantes' as info,
    COUNT(*) as total
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_participantes h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 8. VERIFICAR LOGS DE TRIGGERS
-- ====================================

SELECT '=== VERIFICAR LOGS ===' as info;

-- Verificar si hay logs de triggers en los últimos registros
SELECT 
    'Últimos reclutamientos modificados' as info,
    COUNT(*) as total
FROM reclutamientos 
WHERE updated_at > NOW() - INTERVAL '1 hour';

-- ====================================
-- 9. SUGERENCIAS DE CORRECCIÓN
-- ====================================

SELECT '=== SUGERENCIAS ===' as info;

-- Si hay reclutamientos finalizados sin historial, sugerir re-ejecutar triggers
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 
            'Hay ' || COUNT(*) || ' reclutamientos finalizados sin historial. Ejecuta el script de corrección.'
        ELSE 
            'Todos los reclutamientos finalizados tienen historial.'
    END as sugerencia
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT 'Revisa los resultados arriba para identificar el problema específico.' as mensaje; 