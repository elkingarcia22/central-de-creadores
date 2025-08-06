-- ====================================
-- DIAGNÓSTICO ESPECÍFICO: EMPRESAS MUESTRAN 0
-- ====================================
-- Problema: Participantes funcionan pero empresas muestran 0
-- Objetivo: Identificar por qué las empresas no se están contando correctamente

-- ====================================
-- 1. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS FINALIZADOS ===' as info;

-- Verificar todos los reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar detalles de reclutamientos finalizados
SELECT 
    'Detalles de reclutamientos finalizados' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    p.empresa_id,
    e.nombre as empresa,
    eac.nombre as estado
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
ORDER BY p.nombre;

-- ====================================
-- 2. VERIFICAR HISTORIAL DE EMPRESAS
-- ====================================

SELECT '=== VERIFICANDO HISTORIAL DE EMPRESAS ===' as info;

-- Verificar cuántos registros hay en historial de empresas
SELECT 
    'Registros en historial empresas' as info,
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- Mostrar todos los registros en historial de empresas
SELECT 
    'Registros en historial empresas' as info,
    h.id as historial_id,
    h.empresa_id,
    e.nombre as empresa,
    h.reclutamiento_id,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
ORDER BY h.id;

-- ====================================
-- 3. VERIFICAR PARTICIPANTES CON EMPRESA
-- ====================================

SELECT '=== VERIFICANDO PARTICIPANTES CON EMPRESA ===' as info;

-- Verificar participantes que tienen empresa
SELECT 
    'Participantes con empresa' as info,
    COUNT(*) as total_con_empresa
FROM participantes p
JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND p.empresa_id IS NOT NULL;

-- Mostrar participantes con empresa y sus reclutamientos finalizados
SELECT 
    'Participantes con empresa y reclutamientos finalizados' as info,
    p.id as participante_id,
    p.nombre as participante,
    p.empresa_id,
    e.nombre as empresa,
    COUNT(r.id) as reclutamientos_finalizados
FROM participantes p
JOIN empresas e ON p.empresa_id = e.id
JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY p.id, p.nombre, p.empresa_id, e.nombre
ORDER BY p.nombre;

-- ====================================
-- 4. VERIFICAR EMPRESAS CON PARTICIPACIONES
-- ====================================

SELECT '=== VERIFICANDO EMPRESAS CON PARTICIPACIONES ===' as info;

-- Verificar empresas que tienen participaciones finalizadas
SELECT 
    'Empresas con participaciones finalizadas' as info,
    e.id as empresa_id,
    e.nombre as empresa,
    COUNT(r.id) as participaciones_finalizadas
FROM empresas e
JOIN participantes p ON e.id = p.empresa_id
JOIN reclutamientos r ON p.id = r.participantes_id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY e.id, e.nombre
ORDER BY e.nombre;

-- ====================================
-- 5. VERIFICAR VISTA DE ESTADÍSTICAS EMPRESAS
-- ====================================

SELECT '=== VERIFICANDO VISTA DE ESTADÍSTICAS EMPRESAS ===' as info;

-- Verificar qué muestra la vista de estadísticas de empresas
SELECT 
    'Vista estadísticas empresas' as info,
    COUNT(*) as total_empresas,
    SUM(participaciones_finalizadas) as total_participaciones_finalizadas
FROM vista_estadisticas_empresas;

-- Mostrar detalles de la vista
SELECT 
    'Detalles vista estadísticas empresas' as info,
    empresa_id,
    empresa,
    total_participaciones,
    participaciones_finalizadas
FROM vista_estadisticas_empresas
ORDER BY empresa;

-- ====================================
-- 6. VERIFICAR CORRESPONDENCIA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA ===' as info;

-- Comparar reclutamientos finalizados vs historial empresas
SELECT 
    'Correspondencia finalizados vs historial empresas' as info,
    (SELECT COUNT(*) FROM reclutamientos r JOIN participantes p ON r.participantes_id = p.id WHERE r.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') AND p.empresa_id IS NOT NULL) as reclutamientos_finalizados_con_empresa,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 7. VERIFICAR PROBLEMAS ESPECÍFICOS
-- ====================================

SELECT '=== VERIFICANDO PROBLEMAS ESPECÍFICOS ===' as info;

-- Verificar si hay participantes sin empresa
SELECT 
    'Participantes finalizados sin empresa' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND p.empresa_id IS NULL;

-- Verificar si hay empresas sin participantes
SELECT 
    'Empresas sin participantes finalizados' as info,
    COUNT(*) as cantidad
FROM empresas e
WHERE NOT EXISTS (
    SELECT 1 FROM participantes p
    JOIN reclutamientos r ON p.id = r.participantes_id
    WHERE p.empresa_id = e.id
    AND r.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

-- ====================================
-- 8. PROBAR INSERCIÓN MANUAL
-- ====================================

SELECT '=== PROBANDO INSERCIÓN MANUAL ===' as info;

-- Probar la inserción manual para empresas
SELECT 
    'Datos para inserción manual empresas' as info,
    p.empresa_id,
    r.investigacion_id,
    r.participantes_id,
    r.id as reclutamiento_id,
    COALESCE(r.fecha_sesion, NOW()) as fecha_sesion,
    COALESCE(r.duracion_sesion, 60) as duracion_sesion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND p.empresa_id IS NOT NULL
ORDER BY p.empresa_id;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== DIAGNÓSTICO COMPLETADO ===' as info;
SELECT 'Revisa los resultados para identificar el problema específico.' as mensaje;
SELECT 'Busca si hay participantes sin empresa o empresas sin participantes.' as instruccion;
SELECT 'Verifica si la inserción manual está funcionando correctamente.' as instruccion_adicional; 